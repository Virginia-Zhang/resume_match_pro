# 简历存储与访问方案

## 问题：resumeUrl vs storageKey

### 错误方案（之前）
```typescript
// ❌ 不安全：直接存储公开 URL
{
  resumeUrl: "https://bucket.s3.amazonaws.com/resumes/xxx.pdf"
}
// 问题：任何人拿到 URL 都可以访问简历
```

### 正确方案（现在）
```typescript
// ✅ 安全：存储 storageKey，动态生成临时 URL
{
  storageKey: "resumes/user123/resume_20240101.pdf"
}
// 优势：
// 1. 通过预签名 URL 生成临时访问链接
// 2. 链接有效期可控（如 1 小时）
// 3. 访问权限可控
```

---

## 完整实现方案

### 1. 数据库设计（修正）

```sql
-- applications 表（修正版）
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 关联信息
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  
  -- 应聘者信息
  applicant_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT,
  location VARCHAR(100),
  japanese_level VARCHAR(50),
  phone VARCHAR(20),
  
  -- ✅ 简历存储（使用 storageKey 而非 URL）
  resume_storage_key TEXT NOT NULL,  -- S3 key: resumes/user123/xxx.pdf
  resume_filename VARCHAR(255),      -- 原始文件名
  
  -- 公司邮箱
  company_email VARCHAR(255) NOT NULL,
  
  -- 状态
  status VARCHAR(20) DEFAULT 'pending',
  email_sent_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2. S3 工具函数

```typescript
// lib/s3/resume-access.ts
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

/**
 * 生成简历临时访问 URL
 * @param storageKey - S3 存储 key
 * @param expiresIn - 有效期（秒），默认 1 小时
 * @returns 预签名 URL
 */
export async function generateResumePresignedUrl(
  storageKey: string,
  expiresIn: number = 3600 // 1小时
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storageKey,
      // 强制下载而非浏览器预览（可选）
      ResponseContentDisposition: 'attachment',
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate resume access URL');
  }
}

/**
 * 批量生成预签名 URL
 */
export async function generateMultiplePresignedUrls(
  storageKeys: string[],
  expiresIn: number = 3600
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();

  await Promise.all(
    storageKeys.map(async (key) => {
      const url = await generateResumePresignedUrl(key, expiresIn);
      urlMap.set(key, url);
    })
  );

  return urlMap;
}
```

---

### 3. 前端：获取 storageKey

```typescript
// components/jobs/ApplicationModal.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApplicationFormSchema } from '@/lib/schemas/application.schema';

export function ApplicationModal({ job, isOpen, onClose }: Props) {
  const form = useForm({
    resolver: zodResolver(ApplicationFormSchema),
    defaultValues: {
      applicantName: '',
      email: '',
      phone: '',
      location: '',
      japaneseLevel: 'N2',
      message: '',
      // ✅ 从 localStorage 获取 storageKey（不是 URL）
      resumeStorageKey: typeof window !== 'undefined' 
        ? localStorage.getItem('resumeStorageKey') || '' 
        : '',
      resumeFilename: typeof window !== 'undefined' 
        ? localStorage.getItem('resumeFilename') || '' 
        : '',
    },
  });
  
  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          jobId: job.id,
          companyEmail: job.company_email,
        }),
      });
      
      // ... 处理响应
    } catch (error) {
      // ... 错误处理
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // ... 表单 JSX
}
```

---

### 4. 后端 API：生成临时 URL 并发送邮件

```typescript
// app/api/applications/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createServerClient } from '@/lib/supabase/server';
import { generateResumePresignedUrl } from '@/lib/s3/resume-access';
import { ApplicationEmailTemplate } from '@/emails/ApplicationEmailTemplate';
import { 
  SubmitApplicationRequestSchema 
} from '@/lib/schemas/application.schema';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // 1. 验证请求
    const body = await request.json();
    const validatedData = SubmitApplicationRequestSchema.parse(body);
    
    const supabase = createServerClient();
    
    // 2. 检查是否已经应聘过（防止重复应聘）
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', validatedData.jobId)
      .eq('email', validatedData.email)
      .maybeSingle();
    
    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: 'この求人に既に応募済みです' },
        { status: 400 }
      );
    }
    
    // 3. 获取职位信息
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('title, company, company_email')
      .eq('id', validatedData.jobId)
      .single();
    
    if (jobError || !job) {
      return NextResponse.json(
        { success: false, message: '求人情報が見つかりません' },
        { status: 404 }
      );
    }
    
    // 4. ✅ 生成简历临时访问 URL（有效期 7 天）
    const resumePresignedUrl = await generateResumePresignedUrl(
      validatedData.resumeStorageKey,
      7 * 24 * 60 * 60 // 7天
    );
    
    // 5. 保存应聘记录到数据库
    const { data: application, error: insertError } = await supabase
      .from('applications')
      .insert({
        job_id: validatedData.jobId,
        applicant_name: validatedData.applicantName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        location: validatedData.location,
        japanese_level: validatedData.japaneseLevel,
        message: validatedData.message,
        // ✅ 存储 storageKey（不是 URL）
        resume_storage_key: validatedData.resumeStorageKey,
        resume_filename: validatedData.resumeFilename,
        company_email: job.company_email,
        status: 'pending',
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { success: false, message: 'データベースエラーが発生しました' },
        { status: 500 }
      );
    }
    
    // 6. 发送邮件（包含临时 URL）
    try {
      // 发送给公司
      await resend.emails.send({
        from: 'ResumeMatch Pro <noreply@yourdomain.com>',
        to: job.company_email,
        replyTo: validatedData.email,
        subject: `【新規応募】${job.title} - ${validatedData.applicantName}`,
        react: ApplicationEmailTemplate({
          applicantName: validatedData.applicantName,
          email: validatedData.email,
          phone: validatedData.phone,
          location: validatedData.location,
          japaneseLevel: validatedData.japaneseLevel,
          message: validatedData.message,
          resumeUrl: resumePresignedUrl, // ✅ 临时 URL（7天有效）
          resumeFilename: validatedData.resumeFilename,
          jobTitle: job.title,
          companyName: job.company,
        }),
      });
      
      // 7. ✅ 发送确认邮件给应聘者
      await resend.emails.send({
        from: 'ResumeMatch Pro <noreply@yourdomain.com>',
        to: validatedData.email,
        subject: '【応募受付完了】応募が正常に送信されました',
        react: ApplicationConfirmationTemplate({
          applicantName: validatedData.applicantName,
          jobTitle: job.title,
          companyName: job.company,
        }),
      });
      
      // 8. 更新邮件发送状态
      await supabase
        .from('applications')
        .update({
          status: 'sent',
          email_sent_at: new Date().toISOString(),
        })
        .eq('id', application.id);
      
      return NextResponse.json({
        success: true,
        applicationId: application.id,
        message: '応募が正常に送信されました',
      });
      
    } catch (emailError) {
      console.error('Email send error:', emailError);
      
      // 更新失败状态
      await supabase
        .from('applications')
        .update({
          status: 'failed',
          error_message: emailError instanceof Error 
            ? emailError.message 
            : 'Unknown error',
        })
        .eq('id', application.id);
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'メール送信に失敗しました',
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Application submission error:', error);
    
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
```

---

### 5. 邮件模板（包含临时链接说明）

```typescript
// emails/ApplicationEmailTemplate.tsx
export function ApplicationEmailTemplate({
  applicantName,
  email,
  phone,
  location,
  japaneseLevel,
  message,
  resumeUrl,
  resumeFilename,
  jobTitle,
  companyName,
}: Props) {
  return (
    <Html>
      {/* ... 前面的内容 */}
      
      <Section style={section}>
        <Heading as="h2" style={h2}>履歴書</Heading>
        
        <Text style={text}>
          履歴書ファイル: {resumeFilename}
        </Text>
        
        <Link href={resumeUrl} style={button}>
          履歴書をダウンロード
        </Link>
        
        {/* ✅ 重要提示 */}
        <Text style={warningText}>
          ⚠️ このダウンロードリンクは7日間有効です。
          期限内にダウンロードしてください。
        </Text>
      </Section>
      
      {/* ... */}
    </Html>
  );
}

const warningText = {
  color: '#856404',
  backgroundColor: '#fff3cd',
  borderColor: '#ffeaa7',
  padding: '12px',
  borderRadius: '4px',
  fontSize: '12px',
  marginTop: '16px',
};
```

---

### 6. 确认邮件模板（新增）

```typescript
// emails/ApplicationConfirmationTemplate.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';

interface Props {
  applicantName: string;
  jobTitle: string;
  companyName: string;
}

export function ApplicationConfirmationTemplate({
  applicantName,
  jobTitle,
  companyName,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>応募が正常に受け付けられました</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>応募受付完了</Heading>
          
          <Text style={text}>
            {applicantName} 様
          </Text>
          
          <Text style={text}>
            以下の求人への応募が正常に受け付けられました。
          </Text>
          
          <div style={infoBox}>
            <Text style={infoItem}>
              <strong>会社名:</strong> {companyName}
            </Text>
            <Text style={infoItem}>
              <strong>職種:</strong> {jobTitle}
            </Text>
          </div>
          
          <Text style={text}>
            企業からの連絡をお待ちください。
            通常、1-2週間以内にご連絡があります。
          </Text>
          
          <Text style={text}>
            応募内容に関するご質問がございましたら、
            このメールに返信してください。
          </Text>
          
          <Text style={footer}>
            このメールはResumeMatch Proから自動送信されています。
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const infoBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '5px',
  padding: '16px',
  margin: '24px 0',
};

const infoItem = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '40px',
  textAlign: 'center' as const,
};
```

---

## 方案对比

| 项目 | 直接存储 URL（❌错误） | storageKey + 预签名 URL（✅正确） |
|-----|---------------------|----------------------------|
| **安全性** | ❌ 任何人可访问 | ✅ 仅临时链接可访问 |
| **访问控制** | ❌ 无法控制 | ✅ 可设置有效期 |
| **隐私保护** | ❌ 差 | ✅ 好 |
| **灵活性** | ❌ 链接固定 | ✅ 可动态生成 |
| **合规性** | ❌ 不符合隐私保护 | ✅ 符合最佳实践 |

---

## 实施建议

### 1. 更新上传流程

确保上传简历时存储 storageKey：

```typescript
// 简历上传成功后
localStorage.setItem('resumeStorageKey', storageKey);  // ✅
localStorage.setItem('resumeFilename', file.name);

// 而不是
localStorage.setItem('resumeUrl', publicUrl);  // ❌
```

### 2. 链接有效期建议

- **发送给公司**: 7天（足够时间下载）
- **内部使用**: 1小时（临时预览）
- **后台管理**: 按需生成（每次点击生成新链接）

### 3. 安全考虑

```typescript
// ✅ 好的做法
// 1. 链接有有效期
// 2. 只包含必要参数
// 3. 不包含敏感信息

// ❌ 避免的做法
// 1. 永久公开链接
// 2. 在 URL 中包含个人信息
// 3. 使用可预测的文件名
```

---

## 总结

**正确方案**：
1. 数据库存储 `resume_storage_key`
2. 需要访问时动态生成预签名 URL
3. 链接有有效期（如 7 天）
4. 安全且符合最佳实践

**预计额外时间**：
- 实现预签名 URL 生成：+0.5h
- 测试和验证：+0.5h
- **总计：+1h（总时间仍为 6-7h）**


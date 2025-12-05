日本語 README は [`README.md`](./README.md) を参照してください。

## Project Overview

ResumeMatch Pro is a web application designed **for foreign developers who want to find software developer jobs in Japan**. Candidates can upload their resume and an LLM‑powered **AI matching engine** automatically compares it against Japanese developer job postings, helping them go all the way from discovery to applying and contacting companies. For each job, the AI computes an overall **match score** plus five dimension scores (technical skills, education, experience, projects, soft skills), generates a score summary, provides **strengths/weaknesses analysis**, and suggests **concrete interview strategies** tailored to the candidate.  

This repository is a portfolio‑grade project built with Next.js (App Router), combining TanStack Query, Zustand, nuqs, Zod, Supabase, AWS S3, Resend, and an **AI‑powered matching pipeline** to showcase modern full‑stack best practices.

**Status**  
This project is **currently under active development**. Some of the features described in this README are designed or partially implemented but not yet production-ready. Features that are not fully implemented are explicitly marked with **`(in progress)`** in the feature list.

---

## Target Users & Use Cases

The main target users are:

- **Foreign developers**
  - Want to work as developers in Japan
  - Want to quickly discover jobs that match their current skills and experience
  - Prefer a clear UI that makes it easy to go from resume upload to application, even if their Japanese is not perfect
- **Japanese companies / hiring managers**
  - Want to publish their developer job postings on this platform **(in progress)**
  - Want to leverage AI-based matching to efficiently reach qualified foreign engineers **(in progress)**

---

## Feature Overview (User-Facing)

### For Candidates

- **Resume upload & management** (upload PDF, keep it locally for re-use)
  - Client-side state management with Zustand + `persist` middleware
  - Store only a lightweight "resume pointer" (e.g. ID / storage key / timestamps) in localStorage via Zustand persist, while resume metadata lives in Supabase and the file itself in AWS S3
- **Job matching (batch matching)**
  - Match the uploaded resume against multiple job postings  
  - Calculate match scores and highlight relevant skills / conditions
  - Progressive updates with visible matching progress
- **Job list & job detail pages (SSG + SEO ready)**
  - Job listing and job detail pages built with Next.js App Router  
  - Static Site Generation for fast initial load  
  - Proper meta tags (title, description, Open Graph, etc.) **(in progress)**
- **Job filters & search (URL state via nuqs)**
  - Filter jobs by category, location, keyword, and more  
  - URL-based state management using nuqs + Zod **(in progress)**  
  - Back/forward navigation friendly filters **(in progress)**
- **Match score & highlight view**
  - Show a numeric / visual match score between resume and job  
  - Highlight skills and experiences that contributed to the score 
- **Apply for Job flow** **(in progress)**
  - Open an application modal from the job detail page to submit candidate info  
  - Form validation with Zod + React Hook Form 
  - Save application data linked with the resume into Supabase  
  - Send confirmation emails to both candidate and company using Resend + React Email  
  - Generate time-limited presigned URLs for the resume stored on AWS S3

### For Companies **(in progress)**

- **Company-facing landing page (“Post your job”)**  
  - Explains value proposition, workflow, and pricing image for companies  
  - Clear Japanese copywriting and CTA buttons
- **Job posting / company inquiry form (Post a Job)**  
  - Fields like company name, contact person, email, phone, company size, industry, number of roles, budget, and inquiry details  
  - Strict validation with Zod + React Hook Form  
  - Store inquiries in Supabase
- **Email notifications for companies**  
  - Send inquiry details to the project owner via email  
  - Send an automatic confirmation mail back to the company with next steps

### Shared UX Features

- Responsive design for mobile, tablet, and desktop
- Smooth loading experience with loading indicators and skeletons
- Clear error messages and retry actions for failure scenarios

---

## Tech Stack

- **Framework**
  - Next.js (App Router, React Server Components, Route Handlers)
  - TypeScript (aiming for strict mode)
- **State management**
  - TanStack Query for server state, data fetching, and caching
  - Zustand for client-side global state such as resume data
  - nuqs for URL-based state (filters, pagination) **(in progress)**
- **Validation & schemas**
  - Zod for API request/response, forms, URL queries, and environment variables **(in progress)**
- **Backend & data storage**
  - Supabase for jobs, applications, and matching results
  - AWS S3 for storing resume files and job images (resumes accessed via presigned URLs)
- **Email & notifications**
  - Resend + React Email for notification and confirmation emails **(in progress)**
- **Testing & quality**
  - Jest for unit and integration tests **(in progress)**
  - React Testing Library (RTL) for component tests **(in progress)**
  - MSW (Mock Service Worker) for API mocking **(in progress)**
  - ESLint + Prettier for linting and formatting
  - **Test coverage target: 70%+** (statements / branches / functions / lines)
- **CI/CD & deployment**
  - GitHub Actions for automated lint, type-check, tests, and build **(in progress)**
  - AWS Amplify as the planned deployment platform **(in progress)**

---

## Architecture Overview

- **Frontend**
  - Built on the Next.js App Router (`app/` directory)  
  - Clear separation of Server Components and Client Components for better data fetching and SEO
- **API layer**
  - REST-style APIs implemented as Next.js Route Handlers under `app/api/**/route.ts` 
  - All request and response payloads are validated with Zod for type safety and consistent error formatting
- **Data access**
  - Type-safe Supabase query functions under `lib/db/**`
  - Responses are validated via Zod before being passed to the frontend
- **State management layer**
  - TanStack Query for server-side data and caching
  - Zustand for client-side global state (e.g., resume information)
  - nuqs to treat the URL as the single source of truth for filter state

---

## Quality & Testing

- **Testing strategy**
  - Hook tests (e.g., `useBatchMatching`, query hooks)  
  - Core component tests (job list, filters, application modal, etc.)  
  - Unit tests plus light integration tests
  - End-to-end tests with Playwright for key flows (resume upload → matching → application, etc.)
- **Test coverage**
  - Target: **70%+**
  - Use Jest’s built-in coverage (Istanbul)  
  - Example: `pnpm test -- --coverage` or a dedicated `pnpm test:coverage` script **(in progress)**
- **CI integration**
  - Run lint, type-check, tests, and build automatically on GitHub Actions for each pull request

---

## Performance & SEO

- **Performance optimization** **(in progress)**
  - Bundle analysis with `@next/bundle-analyzer`  
  - Dynamic imports, code splitting, and lazy loading  
  - `next/image` and `next/font` for optimized images and fonts  
  - Targeting Lighthouse performance scores of 90+
- **SEO** **(in progress)**
  - SEO-friendly pages using SSG (Static Site Generation) 
  - Proper `<title>`, `<meta name="description">`, and Open Graph tags  
  - `sitemap.xml` and `robots.txt`

---

## Getting Started

### Prerequisites

- Node.js 20 LTS (recommended)
- One of pnpm (recommended) / npm / yarn

### Install dependencies

```bash
pnpm install
```

### Start the development server

```bash
pnpm dev
```

Open `http://localhost:3000` in your browser to see the app.

### Common pnpm scripts (including planned ones)

- `pnpm dev`: start the development server
- `pnpm build`: create a production build
- `pnpm start`: run the production build
- `pnpm lint`: run ESLint
- `pnpm test`: run Jest + React Testing Library tests
- `pnpm test:coverage`: run tests with coverage

### Example environment variables

These are example environment variables; actual names and usage may be refined as development progresses.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (if needed)
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

---

## Project Structure

```text
app/
  layout.tsx            # Root layout shared by all pages
  page.tsx              # Home / landing page
  not-found.tsx         # 404 page
  globals.css           # Global styles
  constants/
    constants.ts        # App-wide constants
  upload/
    page.tsx            # Resume upload page
  jobs/
    page.tsx            # Job list page
    JobsListClient.tsx  # Client-side job list component
    [id]/
      page.tsx          # Job detail page
      charts.tsx        # Charts in job detail view
      JobDetailClient.tsx # Client-side job detail component
  api/                  # Route Handlers based API endpoints
    jobs/
      route.ts          # Jobs list API
      [id]/
        route.ts        # Job detail API
    job-categories/
      route.ts          # Job categories API
    match/
      route.ts          # Single matching API
      batch/
        route.ts        # Batch matching API
    parse/
      route.ts          # Resume parsing API
    resume/
      route.ts          # Resume metadata save API
    resume-text/
      route.ts          # Resume text retrieval API

components/
  common/               # Shared UI components
    SiteHeader.tsx
    PageFrame.tsx
    BrandBar.tsx
    Breadcrumbs.tsx
    ErrorDisplay.tsx
    buttons/
      BackButton.tsx
      CtaButtons.tsx
  home/                 # Home page specific components
    HomepageActions.tsx
    FeatureCard.tsx
    TypewriterText.tsx
  jobs/                 # Job-related components
    JobItem.tsx
    JobFilters.tsx
  guards/
    ResumeGate.tsx      # Guard that requires a resume
  providers/
    query-provider.tsx  # TanStack Query provider
    theme-provider.tsx  # Theme (dark / light) provider
  skeleton/             # Skeleton loading components
    JobDetailSkeleton.tsx
    MatchResultSkeleton.tsx
    ChartsSummarySkeleton.tsx
    ChartsDetailsSkeleton.tsx
  ui/                   # Low-level UI components (shadcn/ui based)
    button.tsx
    card.tsx
    dialog.tsx
    select.tsx
    progress.tsx
    skeleton.tsx
    ...                 # Other UI primitives

hooks/
  queries/              # Custom hooks for TanStack Query
    useJobs.ts
    useMatch.ts
    useResume.ts
  useBatchMatching.ts   # Batch matching logic hook
  useMatchData.ts       # Hook for storing / reading match result data

lib/
  api/                  # Frontend API client helpers
    jobs.ts
    match.ts
    resume.ts
    helpers.ts
    types.ts
  supabase/
    client.ts           # Supabase client for browser
    server.ts           # Supabase client for server-side
  react-query/
    get-query-client.ts # Creates QueryClient
    query-keys.ts       # Centralized query key definitions
  s3.ts                 # AWS S3 helper utilities
  jobs.ts               # Job data transformation utilities
  storage.ts            # Browser storage (localStorage etc.) helpers
  errorHandling.ts      # Shared error handling helpers
  runtime-config.ts     # Runtime configuration
  utils.ts              # General-purpose utilities

types/
  jobs_v2.ts            # Job data type definitions
  matching.ts           # Matching-related type definitions
  pdf-parse.d.ts        # Types for PDF parsing

store/
  resume.ts             # Resume state management with Zustand (in progress)

public/
  upload/               # Illustrations and images for upload page
  animations/           # SVG animations
  icons/                # Icon assets
  ...                   # Logos, background images, etc.

tests/                  # Jest + RTL + MSW test code (in progress)
```

---

## Deployment

- The project is planned to be deployed on **AWS Amplify**.  
- A CI/CD pipeline will be built with GitHub Actions to run lint, type-check, tests, and build, and only after all checks pass will the app be deployed via AWS Amplify.

---

## Contribution & License

- At the moment, this is mainly a personal portfolio / learning project. Once it becomes ready for external contributions, a `CONTRIBUTING.md` guide may be added.  
- The project is planned to be released under the **MIT License**. A `LICENSE` file will be added when it is officially published.



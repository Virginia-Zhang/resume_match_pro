/**
 * @file eslint.config.mjs
 * @description ESLint configuration for Next.js + TypeScript with JSDoc enforcement
 * @description Next.js + TypeScript用のJSDoc強制を含むESLint設定
 * @author Virginia Zhang
 * @remarks Configured to enforce bilingual JSDoc comments as per .cursorrules
 * @remarks .cursorrulesに従って双言語JSDocコメントを強制するよう設定
 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import jsdoc from "eslint-plugin-jsdoc";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  prettierConfig,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Exclude shadcn/ui components from all linting
      // shadcn/uiコンポーネントをすべてのリントから除外
      "components/ui/**",
    ],
  },
  {
    plugins: {
      jsdoc,
      prettier,
    },
    rules: {
      // JSDoc basic rules
      // JSDoc基础規則
      "jsdoc/require-jsdoc": [
        "warn",
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
          contexts: [
            "TSInterfaceDeclaration",
            "TSTypeAliasDeclaration",
            "ExportDefaultDeclaration > FunctionDeclaration",
            "ExportDefaultDeclaration > ArrowFunctionExpression",
          ],
        },
      ],
      "jsdoc/require-description": "warn",
      "jsdoc/require-param": "warn",
      "jsdoc/require-param-description": "warn",
      "jsdoc/require-returns": "warn",
      "jsdoc/require-returns-description": "warn",
      "jsdoc/check-param-names": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/check-types": "warn",
      "jsdoc/valid-types": "warn",

      // Support custom tags defined in .cursorrules
      // .cursorrules で定義されたカスタムタグをサポート
      "jsdoc/check-tag-names": [
        "error",
        {
          definedTags: ["file", "component", "remarks", "author"],
        },
      ],

      // Formatting rules
      // フォーマットルール
      "jsdoc/require-asterisk-prefix": "warn",
      "jsdoc/multiline-blocks": "warn",
      "jsdoc/tag-lines": ["warn", "any", { startLines: 1 }],

      // TypeScript compatibility
      // TypeScript互換性
      "jsdoc/no-types": "off", // Allow type annotations since using TypeScript
      // TypeScript使用のため型注釈を許可
      "jsdoc/require-param-type": "off", // TypeScript already provides types
      // TypeScriptが既に型を提供
      "jsdoc/require-returns-type": "off", // TypeScript already provides types
      // TypeScriptが既に型を提供

      // Prettier integration
      // Prettier統合
      "prettier/prettier": "error",
    },
  },
];

export default eslintConfig;

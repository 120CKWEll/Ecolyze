This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Setup

1. **Supabase** (จำเป็น): สร้างโปรเจกต์ฟรีที่ [supabase.com](https://supabase.com) แล้วคัดลอก `Project URL` และ `anon public key` จาก **Project Settings → API**
2. **Gemini API key** (จำเป็นสำหรับฟีเจอร์สแกนขยะ): สร้างฟรีที่ [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
3. คัดลอก `.env.example` ไปเป็น `.env.local` แล้วกรอกค่าทั้ง 3 ตัวด้านบน
4. เปิดไฟล์ `supabase/schema.sql` ใน **Supabase Dashboard → SQL Editor** แล้วกด Run เพื่อสร้างตาราง `profiles`, `scan_history`, trigger และ RLS
5. (แนะนำ) ที่ **Authentication → Providers → Email** ปิด **Confirm email** เพื่อให้สมัครแล้วล็อกอินได้ทันที

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

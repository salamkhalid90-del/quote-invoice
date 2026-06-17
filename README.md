# Smart Quote & Invoice Manager

برنامج ويب وسطح مكتب لإدارة الكوتيشنات والفواتير لشركات الكهرباء، السمارت هوم، KNX، BMS، CCTV، Network، والبوردات الكهربائية.

## التشغيل المحلي

```powershell
npm.cmd install
npm.cmd run db:init
npm.cmd run dev
```

ثم افتح:

```text
http://127.0.0.1:3000
```

## تشغيل تطبيق سطح المكتب

افتح الملف:

```text
Start Desktop App.cmd
```

أو من PowerShell:

```powershell
npm.cmd run desktop:prepare
npm.cmd run desktop
```

## قاعدة البيانات

النسخة الحالية تستخدم SQLite محلياً داخل مجلد `prisma`. هذا مناسب للحاسوب وتطبيق سطح المكتب.

للنشر الحقيقي على Vercel يفضل تحويل قاعدة البيانات إلى PostgreSQL مثل Vercel Postgres أو Supabase، لأن Vercel لا يحفظ ملفات SQLite أو الصور المرفوعة بشكل دائم بين التشغيلات.

## أوامر مفيدة

```powershell
npm.cmd run build
npm.cmd run db:init
npm.cmd run db:seed
```

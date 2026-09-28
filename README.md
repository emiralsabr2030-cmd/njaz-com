# Njaz: Your Career Journey

أنشئ الآن مشروع Full-Stack حقيقي باسم:

نجاز | NJAZ

منصة سعودية تربط أصحاب الأعمال بالباحثين عن العمل والكفاءات، للوظائف الحضورية والهجينة وعن بُعد.

التقنية

استخدم:

- React + TypeScript + Vite
- Tailwind + shadcn/ui
- React Router
- Lovable Cloud كـBackend كامل
- PostgreSQL
- Authentication
- Storage
- RLS
- PWA-ready architecture

الأولوية القصوى

أريد تأسيس البنية الحقيقية للمشروع وقاعدة البيانات وليس Mockup.

فعّل Lovable Cloud وأنشئ قاعدة PostgreSQL حقيقية، Authentication، Storage وRLS.

لا تستخدم:

- Mock APIs
- LocalStorage كقاعدة بيانات
- بيانات وهمية
- Backend وهمي
- Secrets داخل الكود

قاعدة البيانات

أنشئ Schema نظيف وقابل للتوسع للجداول الأساسية:

"profiles"
"companies"
"company_members"
"jobs"
"skills"
"job_skills"
"profile_skills"
"experiences"
"educations"
"certifications"
"languages"
"portfolios"
"resumes"
"job_applications"
"saved_jobs"
"notifications"
"reports"
"verification_requests"
"categories"
"locations"
"legal_consents"
"audit_logs"

استخدم UUID + Foreign Keys + Indexes + Unique Constraints + created_at/updated_at عند الحاجة.

الأدوار

جهّز نظام Roles:

"SUPER_ADMIN"
"ADMIN"
"MODERATOR"
"SUPPORT"
"COMPANY_OWNER"
"COMPANY_RECRUITER"
"JOB_SEEKER"
"FREELANCER"

فعّل فعلياً في البداية:
"ADMIN / COMPANY_OWNER / JOB_SEEKER"

RLS

فعّل RLS على الجداول الحساسة.

- المستخدم يرى ويعدل بياناته فقط.
- الباحث يدير ملفه وطلباته وسيره الذاتية.
- صاحب العمل يدير شركته ووظائفها ومتقدميها فقط.
- المستخدم العام يرى المحتوى العام فقط.
- الإدارة حسب الصلاحيات.

لا تعتمد على حماية الواجهة فقط.

Authentication

أنشئ:

- Register
- Login
- Logout
- Forgot Password
- Session persistence
- Protected Routes

وأنشئ Profile مرتبطاً بالمستخدم بعد التسجيل.

Storage

أنشئ buckets منظمة:

"avatars"
"company-logos"
"company-covers"
"resumes"
"certificates"
"portfolio"
"documents"

اجعل السير الذاتية والشهادات والمستندات الخاصة Private مع Storage Policies مناسبة.

Routes الأساسية

أنشئ البنية التالية:

"/"
"/jobs"
"/jobs/:slug"
"/companies"
"/companies/:slug"
"/login"
"/register"
"/forgot-password"
"/dashboard"
"/dashboard/profile"
"/dashboard/applications"
"/dashboard/saved-jobs"
"/company"
"/company/jobs"
"/company/jobs/new"
"/company/applications"
"/admin"
"/admin/users"
"/admin/companies"
"/admin/jobs"
"/admin/reports"
"/admin/settings"
"/privacy"
"/terms"
"/data-policy"

لا تحتاج الصفحات الآن إلى كل الوظائف المتقدمة، لكن يجب أن يكون Routing والـLayouts والصلاحيات جاهزة.

Design System

RTL + Arabic-first + Mobile-first.

Brand:

نجاز | NJAZ

الوصف:

منصة الفرص والعمل

الشعار:

الفرصة التي تتحول إلى إنجاز

الألوان:

Primary "#102A43"
Accent "#00A99D"
Dark "#17202A"
Background "#F5F8FA"

الخط:
Cairo للعربية و Inter للإنجليزية.

اجعل الألوان والخطوط Design Tokens/CSS Variables مركزية وقابلة للتعديل.

الواجهة الأولى

أنشئ Landing Page احترافية وبسيطة تحتوي:

- Navbar
- Hero
- بحث عن الوظائف
- فرص مميزة
- كيف يعمل نجاز
- قسم للباحثين عن العمل
- قسم لأصحاب الأعمال
- CTA
- Footer

وأنشئ أساس صفحات الوظائف والشركات ولوحات التحكم الثلاث:

Job Seeker / Employer / Admin

استخدم Empty States حقيقية بدلاً من البيانات الوهمية.

حالات النظام

جهّز ENUMs وقاعدة البيانات لـ:

Employment:
"FULL_TIME / PART_TIME / TEMPORARY / SEASONAL / PROJECT"

Work Mode:
"ONSITE / REMOTE / HYBRID"

Application:
"APPLIED / REVIEWING / SHORTLISTED / INTERVIEW / OFFER / HIRED / REJECTED / WITHDRAWN"

Verification:
"UNVERIFIED / PENDING / VERIFIED / REJECTED / SUSPENDED"

قواعد مهمة

المشروع يجب أن يكون:

- Secure
- Type-safe
- RTL
- Responsive
- Accessible
- Clean Architecture
- Reusable Components
- GitHub-ready

لا تنفذ الآن:
AI، Chat، Payments، Subscriptions، Video، Payroll، SMS، WhatsApp، تطبيق Native أو تكاملات حكومية.

ركز هذه العملية على Foundation + Lovable Cloud + Database + Auth + Storage + RLS + Routing + UI Foundation فقط.

بعد اكتمال التنفيذ:
افحص TypeScript وRoutes وRLS وAuth وDatabase وStorage وتأكد من عدم وجود أخطاء واضحة.

لا تسألني ماذا تفعل بعد ذلك. نفّذ هذه المرحلة كاملة، ثم توقف.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://njaz-com.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/31140967-0377-4e48-a314-441f31089485).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

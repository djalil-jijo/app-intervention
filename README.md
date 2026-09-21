# 🛠️ IT-Tasker | تطبيق إدارة التدخلات والعتاد المعلوماتي

> **نظام متكامل لإدارة تذاكر الصيانة، تتبع التدخلات التقنية، جرد أصول العتاد المعلوماتي، وسندات التسليم (Bons de Décharge).**
> 
> *A modern ERP & IT Service Desk system built with Next.js, Prisma, PostgreSQL, and Tailwind CSS.*

---

## 🌟 المميزات الرئيسية (Key Features)

- 🎫 **إدارة تذاكر التدخلات التقنية (Tickets d'intervention)** :
  - تسجيل التذاكر مع تحديد نوع التدخل (علاجي Curative، وقائي Preventive، تثبيت Installation).
  - تحديد الأولويات (منخفضة، متوسطة، عاجلة، حرجة).
  - تعيين الفنيين المسؤولين ومتابعة مسار المعالجة خطوة بخطوة.

- 🖥️ **جرد ومتابعة العتاد المعلوماتي (IT Asset Inventory)** :
  - تتبع الأجهزة (حواسيب، طابعات، خوادم، شبكات) عبر الرقم الجردي (Asset Tag) والباركود.
  - تعيين الأجهزة حسب الفروع والمقرات (مديريات جهوية، ولائية، وحدات إنتاجية) والمسؤولين عنها.

- 📑 **سندات تسليم العتاد (Bons de Décharge de Matériel)** :
  - إصدار سندات التسليم النهائي والإعارة المؤقتة للموظفين.
  - إمكانية التصدير والطباعة بتنسيق **PDF** فوري مع تتبع استرجاع العتاد.

- 📦 **إدارة مخزون قطع الغيار والمستهلكات (Spare Parts Stock)** :
  - متابعة حركات المخزون (دخول / خروج).
  - تنبيهات الوصول للحد الأدنى من المخزون.

- 📅 **الصيانة الوقائية (Preventive Maintenance)** :
  - جدولة الفحوصات والصيانة الدورية للمعدات لتفادي الأعطال المفاجئة.

- 📚 **قاعدة المعارف والحلول (Knowledge Base)** :
  - توثيق الحلول للمشاكل المتكررة لمساعدة الفنيين وتسريع حل التذاكر.

- 📊 **لوحات تحكم وتقارير تفاعلية (Dashboard & Analytics)** :
  - إحصائيات بصرية متقدمة للتدخلات ومؤشرات الأداء.
  - إمكانية تصدير البيانات إلى جداول **Excel / XLSX**.

- 📧 **تنبيهات البريد الإلكتروني (Email Notifications)** :
  - إشعارات فورية عند فتح التذاكر أو تحديث حالتها عبر SMTP.

---

## 💻 التقنيات المستخدمة (Tech Stack)

- **Framework**: [Next.js](https://nextjs.org/) (App Router & Server Actions)
- **UI & Components**: [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/)
- **ORM & Database**: [Prisma ORM](https://www.prisma.io/) مع [PostgreSQL](https://www.postgresql.org/)
- **Charts & Visualization**: [Recharts](https://recharts.org/)
- **Documents & Export**: `@react-pdf/renderer`, `ExcelJS`, `XLSX`
- **Validation & Forms**: `Zod`, `React Hook Form`
- **Authentication & Security**: `bcryptjs`

---

## 🚀 التثبيت والتشغيل محلياً (Getting Started)

### 1. استنساخ المستودع (Clone the Repository)

```bash
git clone https://github.com/djalil-jijo/app-intervention.git
cd app-intervention
```

### 2. تثبيت الحزم (Install Dependencies)

```bash
npm install
```

### 3. إعداد متغيرات البيئة (Environment Variables)

قم بإنشاء ملف `.env` بناءً على النموذج الموجود في `.env.example`:

```bash
cp .env.example .env
```

ثم قم بتحديث بيانات الاتصال بقاعدة البيانات وإعدادات البريد:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ittasker?schema=public"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="support@enterprise.com"
SMTP_PASS="your-app-password"
SMTP_FROM="\"IT-Tasker Support\" <support@enterprise.com>"
ADMIN_EMAIL="admin@enterprise.com"
ADMIN_PASSWORD="AdminPassword2026!"
SESSION_SECRET="your-secure-session-secret"
```

### 4. تهيئة قاعدة البيانات (Prisma Setup)

```bash
# توليد عميل Prisma
npm run prisma:generate

# مزامنة هيكل قاعدة البيانات
npm run prisma:push
```

### 5. تشغيل خادم التطوير (Run Development Server)

```bash
npm run dev
```

افتح المتصفح وتوجه إلى [http://localhost:3200](http://localhost:3200).

---

## 📜 الترخيص (License)

هذا المشروع مرخص تحت رخصة **MIT** - راجع ملف [LICENSE](./LICENSE) للمزيد من التفاصيل.

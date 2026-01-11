export const languages = {
  en: "English",
  ar: "العربية",
} as const;

export const defaultLang = "en";

export type Lang = keyof typeof languages;

export const ui = {
  en: {
    // Navigation
    "nav.overview": "Overview",
    "nav.projects": "Projects",
    "nav.bills": "Bills",
    "nav.budget": "Budget",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.overview": "Overview",
    "dashboard.budgetSummary": "Budget Summary",
    "dashboard.activity": "Activity",
    "dashboard.activeProjects": "Active Projects",
    "dashboard.upcomingBills": "Upcoming Bills",
    "dashboard.recentPayments": "Recent Payments",
    "dashboard.viewAll": "View all →",
    "dashboard.noActiveProjects": "No active projects",
    "dashboard.noUpcomingBills": "No upcoming bills",
    "dashboard.noPaymentsThisYear": "No payments this year",

    // Budget labels
    "budget.cash": "Cash",
    "budget.cost": "Cost",
    "budget.obligatedCash": "Obligated Cash",
    "budget.obligatedCost": "Obligated Cost",
    "budget.remainingCash": "Remaining Cash",
    "budget.remainingCost": "Remaining Cost",
    "budget.payments": "Payments",
    "budget.obligations": "Obligations",
    "budget.transactions": "transactions",
    "budget.commitments": "commitments",
    "budget.pending": "pending",
    "budget.value": "value",

    // Projects page
    "projects.title": "Projects",
    "projects.subtitle": "Manage and track all your projects",
    "projects.showing": "Showing",
    "projects.active": "Active",
    "projects.totalValue": "Total Value",
    "projects.allProjects": "All Projects",
    "projects.noProjectsFound": "No projects found",
    "projects.clearFilters": "Clear filters",

    // Filters
    "filter.year": "Year",
    "filter.phase": "Phase",
    "filter.status": "Status",
    "filter.all": "All",
    "filter.active": "Active",
    "filter.inactive": "Inactive",

    // Table headers
    "table.project": "Project",
    "table.phase": "Phase",
    "table.value": "Value",
    "table.ref": "Ref",
    "table.timeline": "Timeline",
    "table.team": "Team",
    "table.status": "Status",
    "table.bill": "Bill",
    "table.due": "Due",
    "table.amount": "Amount",
    "table.date": "Date",

    // Bills page
    "bills.title": "Bills",
    "bills.subtitle": "Track and manage your recurring bills",
    "bills.noBillsFound": "No bills found",

    // Budget page
    "budget.title": "Budget",
    "budget.subtitle": "Track your annual budget and expenses",

    // Common
    "common.tbd": "TBD",
    "common.spent": "Spent",
    "common.available": "Available",
    "common.paid": "Paid",
    "common.note": "Note",
    "common.from": "From",
    "common.to": "To",
    "common.category": "Category",
    "common.files": "Files",
    "common.file": "file",

    // Budget page specific
    "budget.items": "Budget Items",
    "budget.transfers": "Transfers",
    "budget.noItemsFound": "No budget items found for",
    "budget.noPaymentsFound": "No payments found for",
    "budget.noTransfersFound": "No transfers found for",
    "budget.noObligationsFound": "No obligations found for",
    "budget.billProject": "Bill / Project",
    "budget.projectBill": "Project / Bill",

    // Auth
    "auth.login": "Login",
    "auth.logout": "Logout",
  },
  ar: {
    // Navigation
    "nav.overview": "نظرة عامة",
    "nav.projects": "المشاريع",
    "nav.bills": "الفواتير",
    "nav.budget": "الميزانية",

    // Dashboard
    "dashboard.title": "لوحة التحكم",
    "dashboard.overview": "نظرة عامة",
    "dashboard.budgetSummary": "ملخص الميزانية",
    "dashboard.activity": "النشاط",
    "dashboard.activeProjects": "المشاريع النشطة",
    "dashboard.upcomingBills": "الفواتير القادمة",
    "dashboard.recentPayments": "المدفوعات الأخيرة",
    "dashboard.viewAll": "← عرض الكل",
    "dashboard.noActiveProjects": "لا توجد مشاريع نشطة",
    "dashboard.noUpcomingBills": "لا توجد فواتير قادمة",
    "dashboard.noPaymentsThisYear": "لا توجد مدفوعات هذا العام",

    // Budget labels
    "budget.cash": "النقد",
    "budget.cost": "التكلفة",
    "budget.obligatedCash": "الملتزم به بالنقد",
    "budget.obligatedCost": "الملتزم به بالتكلفة",
    "budget.remainingCash": "المتبقي بالنقد",
    "budget.remainingCost": "المتبقي بالتكلفة",
    "budget.payments": "المدفوعات",
    "budget.obligations": "الالتزامات",
    "budget.transactions": "معاملات",
    "budget.commitments": "التزامات",
    "budget.pending": "قيد الانتظار",
    "budget.value": "القيمة",

    // Projects page
    "projects.title": "المشاريع",
    "projects.subtitle": "إدارة وتتبع جميع مشاريعك",
    "projects.showing": "عرض",
    "projects.active": "نشط",
    "projects.totalValue": "القيمة الإجمالية",
    "projects.allProjects": "جميع المشاريع",
    "projects.noProjectsFound": "لم يتم العثور على مشاريع",
    "projects.clearFilters": "مسح الفلاتر",

    // Filters
    "filter.year": "السنة",
    "filter.phase": "المرحلة",
    "filter.status": "الحالة",
    "filter.all": "الكل",
    "filter.active": "نشط",
    "filter.inactive": "غير نشط",

    // Table headers
    "table.project": "المشروع",
    "table.phase": "المرحلة",
    "table.value": "القيمة",
    "table.ref": "المرجع",
    "table.timeline": "الجدول الزمني",
    "table.team": "الفريق",
    "table.status": "الحالة",
    "table.bill": "الفاتورة",
    "table.due": "تاريخ الاستحقاق",
    "table.amount": "المبلغ",
    "table.date": "التاريخ",

    // Bills page
    "bills.title": "الفواتير",
    "bills.subtitle": "تتبع وإدارة فواتيرك المتكررة",
    "bills.noBillsFound": "لم يتم العثور على فواتير",

    // Budget page
    "budget.title": "الميزانية",
    "budget.subtitle": "تتبع ميزانيتك السنوية ومصروفاتك",

    // Common
    "common.tbd": "لم يحدد",
    "common.spent": "المنفق",
    "common.available": "المتاح",
    "common.paid": "المدفوع",
    "common.note": "ملاحظة",
    "common.from": "من",
    "common.to": "إلى",
    "common.category": "الفئة",
    "common.files": "الملفات",
    "common.file": "ملف",

    // Budget page specific
    "budget.items": "بنود الميزانية",
    "budget.transfers": "التحويلات",
    "budget.noItemsFound": "لم يتم العثور على بنود ميزانية لـ",
    "budget.noPaymentsFound": "لم يتم العثور على مدفوعات لـ",
    "budget.noTransfersFound": "لم يتم العثور على تحويلات لـ",
    "budget.noObligationsFound": "لم يتم العثور على التزامات لـ",
    "budget.billProject": "الفاتورة / المشروع",
    "budget.projectBill": "المشروع / الفاتورة",

    // Auth
    "auth.login": "تسجيل الدخول",
    "auth.logout": "تسجيل الخروج",
  },
} as const;

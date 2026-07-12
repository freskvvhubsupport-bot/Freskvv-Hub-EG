import { Server, Smartphone, Globe, Settings, TrendingUp, FolderKanban, Megaphone } from 'lucide-react';

export const SERVICES = [
  {
    slug: 'game-servers',
    icon: <Server size={48} />,
    name: 'إنشاء سيرفرات الألعاب',
    desc: 'سيرفرات ألعاب احترافية عالية الأداء مع معالجات قوية وحماية ضد الـ DDoS على مدار الساعة',
    packages: [
      { id: 'gs-1', name: 'ستارتر', price: 150, features: ['1 GB RAM', '10 GB مساحة', 'حماية DDoS أساسية', 'دعم 24 ساعة'], color: '#4f9fff' },
      { id: 'gs-2', name: 'برو', price: 350, features: ['4 GB RAM', '50 GB مساحة', 'حماية DDoS متقدمة', 'IP مخصص', 'دعم فوري'], color: '#8b5cf6', popular: true },
      { id: 'gs-3', name: 'بيزنس', price: 700, features: ['8 GB RAM', '100 GB مساحة', 'حماية DDoS كاملة', 'IP مخصص', 'نسخ احتياطي يومي', 'مدير حساب'], color: '#22d3ee' },
      { id: 'gs-4', name: 'انتربرايز', price: 1500, features: ['16 GB RAM', 'مساحة غير محدودة', 'كل مميزات بيزنس', 'SLA 99.9%', 'تخصيص كامل'], color: '#f59e0b' },
    ],
  },
  {
    slug: 'apps',
    icon: <Smartphone size={48} />,
    name: 'إنشاء تطبيقات',
    desc: 'تطبيقات iOS وAndroid بتصاميم عصرية وأداء عالي، تتوافق مع جميع الأجهزة',
    packages: [
      { id: 'app-1', name: 'بيسك', price: 500, features: ['تطبيق Android', 'تصميم بسيط', '3 شاشات', 'دعم 1 شهر'], color: '#4f9fff' },
      { id: 'app-2', name: 'ستاندرد', price: 1200, features: ['Android + iOS', 'تصميم احترافي', '10 شاشات', 'لوحة تحكم', 'دعم 3 أشهر'], color: '#8b5cf6', popular: true },
      { id: 'app-3', name: 'برميوم', price: 2500, features: ['Android + iOS', 'تصميم فاخر', 'شاشات غير محدودة', 'API متكاملة', 'دعم سنة كاملة'], color: '#22d3ee' },
    ],
  },
  {
    slug: 'websites',
    icon: <Globe size={48} />,
    name: 'إنشاء مواقع',
    desc: 'مواقع ويب احترافية متجاوبة مع كل الشاشات ومحسنة لمحركات البحث',
    packages: [
      { id: 'web-1', name: 'ستارتر', price: 300, features: ['5 صفحات', 'تصميم متجاوب', 'SEO أساسي', 'دومين مجاني'], color: '#4f9fff' },
      { id: 'web-2', name: 'برو', price: 700, features: ['10 صفحات', 'تصميم احترافي', 'SEO متقدم', 'سرعة عالية', 'استضافة 1 سنة'], color: '#8b5cf6', popular: true },
      { id: 'web-3', name: 'بيزنس', price: 1500, features: ['صفحات غير محدودة', 'لوحة إدارة', 'SEO شامل', 'تقارير شهرية'], color: '#22d3ee' },
      { id: 'web-4', name: 'متجر إلكتروني', price: 2500, features: ['متجر كامل', 'نظام دفع', 'إدارة منتجات', 'تقارير مبيعات'], color: '#f59e0b' },
    ],
  },
  {
    slug: 'systems',
    icon: <Settings size={48} />,
    name: 'إنشاء أنظمة إدارة',
    desc: 'أنظمة ERP ولوحات تحكم متكاملة لإدارة عملك بكفاءة وذكاء',
    packages: [
      { id: 'sys-1', name: 'بيسك', price: 800, features: ['لوحة تحكم بسيطة', 'إدارة المستخدمين', 'تقارير أساسية'], color: '#4f9fff' },
      { id: 'sys-2', name: 'ستاندرد', price: 2000, features: ['ERP متكامل', 'إدارة المخزون', 'الفواتير والمدفوعات', 'تقارير متقدمة'], color: '#8b5cf6', popular: true },
      { id: 'sys-3', name: 'انتربرايز', price: 5000, features: ['نظام مخصص بالكامل', 'API مفتوح', 'تكامل مع الأنظمة الخارجية', 'صيانة مستمرة'], color: '#22d3ee' },
    ],
  },
  {
    slug: 'followers',
    icon: <TrendingUp size={48} />,
    name: 'تزويد متابعين',
    desc: 'زيادة متابعين حقيقيين على كل المنصات بطرق آمنة لا تخالف سياسات المنصات',
    packages: [
      { id: 'fol-1', name: '1K متابع', price: 50, features: ['1,000 متابع', 'فيسبوك/انستجرام/تيك توك', 'تسليم 24-48 ساعة'], color: '#4f9fff' },
      { id: 'fol-2', name: '5K متابع', price: 200, features: ['5,000 متابع', 'جميع المنصات', 'تسليم تدريجي آمن'], color: '#8b5cf6', popular: true },
      { id: 'fol-3', name: '10K متابع', price: 350, features: ['10,000 متابع', 'جميع المنصات', 'ضمان الجودة'], color: '#22d3ee' },
      { id: 'fol-4', name: '50K متابع', price: 1500, features: ['50,000 متابع', 'خطة تسليم مخصصة', 'مدير حساب'], color: '#f59e0b' },
      { id: 'fol-5', name: '100K متابع', price: 2500, features: ['100,000 متابع', 'استراتيجية نمو كاملة'], color: '#ec4899' },
    ],
  },
  {
    slug: 'project-management',
    icon: <FolderKanban size={48} />,
    name: 'إدارة المشاريع',
    desc: 'إدارة احترافية لمشاريعك التقنية من الفكرة حتى التسليم مع تقارير تفصيلية',
    packages: [
      { id: 'pm-1', name: 'مشروع صغير', price: 500, features: ['حتى 3 أشهر', 'اجتماعات أسبوعية', 'تقرير شهري'], color: '#4f9fff' },
      { id: 'pm-2', name: 'مشروع متوسط', price: 1200, features: ['حتى 6 أشهر', 'اجتماعات مكثفة', 'تقارير مفصلة', 'متابعة يومية'], color: '#8b5cf6', popular: true },
      { id: 'pm-3', name: 'مشروع كبير', price: 2500, features: ['حتى سنة', 'فريق إدارة متكامل', 'لوحة متابعة مباشرة'], color: '#22d3ee' },
    ],
  },
  {
    slug: 'social-media',
    icon: <Megaphone size={48} />,
    name: 'إدارة التواصل الاجتماعي',
    desc: 'إدارة حسابات السوشيال ميديا بمحتوى إبداعي واستراتيجية تسويقية متكاملة',
    packages: [
      { id: 'sm-1', name: 'ستارتر', price: 400, features: ['منصة واحدة', '12 بوست شهرياً', 'تصميمات بسيطة'], color: '#4f9fff' },
      { id: 'sm-2', name: 'برو', price: 900, features: ['3 منصات', '30 بوست شهرياً', 'تصميمات احترافية', 'جدولة المحتوى'], color: '#8b5cf6', popular: true },
      { id: 'sm-3', name: 'فول مانجمنت', price: 2000, features: ['جميع المنصات', 'محتوى غير محدود', 'إعلانات ممولة', 'تقارير شهرية', 'مدير حساب'], color: '#22d3ee' },
    ],
  },
];

// Freskvv Tec EG — Smart "NEW" Badge Utility
// Shows a "جديد ✨" / "NEW ✨" badge on any item less than 30 days old

/**
 * Check if an item is "new" based on its creation date
 * @param {Date|Object|number} createdAt - Date, Firestore Timestamp, or epoch ms
 * @param {number} daysThreshold - Number of days to consider "new" (default 30)
 * @returns {boolean}
 */
export function isNew(createdAt, daysThreshold = 30) {
  if (!createdAt) return false;

  let date;
  if (createdAt?.toDate) {
    // Firestore Timestamp
    date = createdAt.toDate();
  } else if (createdAt instanceof Date) {
    date = createdAt;
  } else if (typeof createdAt === 'number') {
    date = new Date(createdAt);
  } else if (typeof createdAt === 'string') {
    date = new Date(createdAt);
  } else {
    return false;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= daysThreshold;
}

/**
 * A hardcoded list of features with their "added" dates.
 * Any new feature added to the platform should be registered here.
 * After 30 days, the badge automatically disappears.
 */
export const FEATURE_REGISTRY = [
  { id: 'portfolio', addedAt: '2026-07-24', path: '/services', labelAr: 'معرض الأعمال', labelEn: 'Portfolio' },
  { id: 'custom-service', addedAt: '2026-07-24', path: '/custom-service', labelAr: 'طلب خدمة مخصصة', labelEn: 'Custom Request' },
  { id: 'game-store', addedAt: '2026-07-24', path: '/game-store', labelAr: 'متجر شحن الألعاب', labelEn: 'Game Store' },
  { id: 'points', addedAt: '2026-07-24', path: '/dashboard/points', labelAr: 'نظام النقاط والمكافآت', labelEn: 'Points & Rewards' },
  { id: 'support-chat', addedAt: '2026-07-24', path: '/dashboard/support', labelAr: 'شات الدعم الفني', labelEn: 'Support Chat' },
  { id: 'discount-codes', addedAt: '2026-07-24', path: '/admin/discount-codes', labelAr: 'أكواد الخصم', labelEn: 'Discount Codes' },
  { id: 'archive', addedAt: '2026-07-24', path: '/admin/archive', labelAr: 'الأرشيف', labelEn: 'Archive' },
  { id: 'community', addedAt: '2026-07-24', path: '/community', labelAr: 'المجتمع', labelEn: 'Community' },
  { id: 'learning', addedAt: '2026-07-24', path: '/learning', labelAr: 'الشروحات', labelEn: 'Academy' },
];

/**
 * Check if a nav/feature is new by its path
 */
export function isFeatureNew(path) {
  const feature = FEATURE_REGISTRY.find(f => f.path === path);
  if (!feature) return false;
  return isNew(feature.addedAt);
}

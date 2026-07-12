// Freskvv Tec EG — Admin Archive (جارد) — Monthly Reports with Excel Export
import { useState, useCallback } from 'react';
import {
  collection, query, where, getDocs, orderBy, Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import * as XLSX from 'xlsx';
import {
  Archive, Download, Loader2, Users, CreditCard,
  ShoppingCart, Tag, TrendingUp, Calendar, RefreshCw, FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${color}30`,
      borderRadius: 16,
      padding: '18px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color }}>{value ?? '—'}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminArchive() {
  const [month, setMonth] = useState(new Date().getMonth()); // 0-indexed
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [report, setReport] = useState(null);

  // ── Fetch full month report ─────────────────────────────────────
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setReport(null);

    try {
      const startDate = new Date(year, month, 1, 0, 0, 0);
      const endDate   = new Date(year, month + 1, 0, 23, 59, 59);
      const startTs   = Timestamp.fromDate(startDate);
      const endTs     = Timestamp.fromDate(endDate);

      // Safe fetch helper — returns empty array instead of throwing
      const safeFetch = async (q) => {
        try { return (await getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() })); }
        catch (e) { console.warn('Collection fetch failed:', e.message); return []; }
      };

      const dateRangeQ = (col) =>
        query(collection(db, col), where('createdAt', '>=', startTs), where('createdAt', '<=', endTs), orderBy('createdAt', 'asc'));

      // Fetch all — failures fall back to empty arrays
      const [allUsers, walletDocs, orders, allCodes, transactions] = await Promise.all([
        safeFetch(collection(db, 'users')),                  // all users, filter in JS
        safeFetch(dateRangeQ('wallet_requests')),
        safeFetch(dateRangeQ('orders')),
        safeFetch(collection(db, 'discount_codes')),
        safeFetch(dateRangeQ('transactions')),
      ]);

      // Filter users who registered in this month
      const users = allUsers.filter(u => {
        if (!u.createdAt?.toDate) return false;
        const d = u.createdAt.toDate();
        return d >= startDate && d <= endDate;
      });

      const deposits  = walletDocs.filter(d => d.type === 'deposit'  && d.status === 'approved');
      const withdraws = walletDocs.filter(d => d.type === 'withdraw');
      const usedCodes = allCodes
        .filter(c => (c.usedCount || 0) > 0)
        .sort((a, b) => (b.usedCount || 0) - (a.usedCount || 0));

      const totalIncome     = deposits.reduce((s, d) => s + (Number(d.amount) || 0), 0);
      const totalOrders     = orders.length;
      const totalOrderValue = orders.reduce((s, o) => s + (Number(o.price) || 0), 0);

      setReport({
        month, year,
        users, deposits, withdraws, orders, usedCodes, transactions,
        totalIncome, totalOrders, totalOrderValue,
      });

      toast.success(`✅ تم تحميل تقرير ${MONTHS_AR[month]} ${year}`);
    } catch (err) {
      console.error('Archive fetch error:', err);
      toast.error(`حدث خطأ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [month, year]);



  // ── Export to Excel ─────────────────────────────────────────────
  const exportExcel = useCallback(async () => {
    if (!report) { toast.error('قم بتحميل التقرير أولاً'); return; }
    setExporting(true);

    try {
      const wb = XLSX.utils.book_new();
      const monthLabel = `${MONTHS_AR[report.month]} ${report.year}`;

      // ── Sheet 1: Summary ──
      const summaryData = [
        ['تقرير شهر', monthLabel],
        ['تاريخ الإنشاء', new Date().toLocaleString('ar-EG')],
        [''],
        ['إجمالي المستخدمين الجدد', report.users.length],
        ['إجمالي الإيداعات المعتمدة', report.totalIncome + ' ج.م'],
        ['عدد الطلبات', report.totalOrders],
        ['قيمة الطلبات', report.totalOrderValue + ' ج.م'],
        ['أكواد مستخدمة', report.usedCodes.length],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 30 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'ملخص الشهر');

      // ── Sheet 2: New Users ──
      const usersData = [
        ['الاسم الكامل', 'البريد الإلكتروني', 'واتساب', 'رصيد المحفظة', 'تاريخ التسجيل'],
        ...report.users.map(u => [
          u.fullName || '—',
          u.email || '—',
          u.whatsapp || '—',
          (u.walletBalance || 0) + ' ج.م',
          u.createdAt?.toDate?.()?.toLocaleDateString('ar-EG') || '—',
        ])
      ];
      const wsUsers = XLSX.utils.aoa_to_sheet(usersData);
      wsUsers['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsUsers, 'المستخدمون الجدد');

      // ── Sheet 3: Deposits ──
      const depositsData = [
        ['اسم المستخدم', 'المبلغ', 'طريقة الدفع', 'الحالة', 'التاريخ'],
        ...report.deposits.map(d => [
          d.userName || d.userId || '—',
          (d.amount || 0) + ' ج.م',
          d.method || '—',
          d.status === 'approved' ? 'معتمد' : d.status,
          d.createdAt?.toDate?.()?.toLocaleDateString('ar-EG') || '—',
        ])
      ];
      const wsDeposits = XLSX.utils.aoa_to_sheet(depositsData);
      wsDeposits['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsDeposits, 'الإيداعات');

      // ── Sheet 4: Orders / Services ──
      const ordersData = [
        ['اسم المستخدم', 'الخدمة', 'الباقة', 'السعر', 'الحالة', 'التاريخ'],
        ...report.orders.map(o => [
          o.userName || o.userId || '—',
          o.serviceName || '—',
          o.packageName || '—',
          (o.price || 0) + ' ج.م',
          o.status || '—',
          o.createdAt?.toDate?.()?.toLocaleDateString('ar-EG') || '—',
        ])
      ];
      const wsOrders = XLSX.utils.aoa_to_sheet(ordersData);
      wsOrders['!cols'] = [{ wch: 25 }, { wch: 22 }, { wch: 22 }, { wch: 14 }, { wch: 15 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsOrders, 'الطلبات والخدمات');

      // ── Sheet 5: Withdrawals ──
      const withdrawsData = [
        ['اسم المستخدم', 'المبلغ', 'الحالة', 'التاريخ'],
        ...report.withdraws.map(w => [
          w.userName || w.userId || '—',
          (w.amount || 0) + ' ج.م',
          w.status || '—',
          w.createdAt?.toDate?.()?.toLocaleDateString('ar-EG') || '—',
        ])
      ];
      const wsWithdraws = XLSX.utils.aoa_to_sheet(withdrawsData);
      XLSX.utils.book_append_sheet(wb, wsWithdraws, 'المسحوبات');

      // ── Sheet 6: Discount Codes Used ──
      const codesData = [
        ['الكود', 'النوع', 'القيمة', 'عدد الاستخدامات', 'الوصف'],
        ...report.usedCodes.map(c => [
          c.code || '—',
          c.type === 'discount' ? 'خصم خدمات' : 'شحن ألعاب',
          c.type === 'discount'
            ? `${c.discountValue}${c.discountType === 'percent' ? '%' : ' ج.م'}`
            : `${c.rechargeAmount} ج.م`,
          c.usedCount || 0,
          c.description || '—',
        ])
      ];
      const wsCodes = XLSX.utils.aoa_to_sheet(codesData);
      wsCodes['!cols'] = [{ wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 20 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, wsCodes, 'أكواد الخصم المستخدمة');

      // ── Sheet 7: Transactions ──
      const transData = [
        ['نوع العملية', 'المبلغ', 'الوصف', 'التاريخ'],
        ...report.transactions.map(t => [
          t.type === 'deposit' ? 'إيداع' : t.type === 'spend' ? 'مصروف' : t.type,
          (t.amount || 0) + ' ج.م',
          t.description || '—',
          t.createdAt?.toDate?.()?.toLocaleDateString('ar-EG') || '—',
        ])
      ];
      const wsTrans = XLSX.utils.aoa_to_sheet(transData);
      XLSX.utils.book_append_sheet(wb, wsTrans, 'سجل العمليات');

      // ── Download ──
      const fileName = `تقرير_${MONTHS_AR[report.month]}_${report.year}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`تم تنزيل الملف: ${fileName}`);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء إنشاء ملف Excel');
    } finally {
      setExporting(false);
    }
  }, [report]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Archive size={26} color="var(--accent-blue)" /> الأرشيف الشهري (جارد)
          </h1>
          <p className="admin-page-desc">ملخص شامل لكل نشاط الموقع حسب الشهر مع تصدير Excel</p>
        </div>

        {report && (
          <button
            onClick={exportExcel}
            disabled={exporting}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              border: 'none', color: 'white', padding: '12px 24px',
              borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--font-primary)',
              fontWeight: 700, fontSize: 14, boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
              transition: 'all 0.2s',
            }}
          >
            {exporting
              ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> جاري الإنشاء...</>
              : <><FileSpreadsheet size={16} /> تنزيل ملف Excel</>
            }
          </button>
        )}
      </div>

      {/* Month/Year Picker */}
      <div className="admin-card" style={{ padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Calendar size={20} color="var(--accent-blue)" />
          <strong style={{ fontSize: 15 }}>اختر الفترة الزمنية</strong>

          <select className="form-input" value={month} onChange={e => setMonth(Number(e.target.value))} style={{ width: 160, margin: 0 }}>
            {MONTHS_AR.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>

          <select className="form-input" value={year} onChange={e => setYear(Number(e.target.value))} style={{ width: 110, margin: 0 }}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <button
            onClick={fetchReport}
            disabled={loading}
            className="btn-primary"
            style={{ padding: '10px 24px', fontSize: 14 }}
          >
            {loading
              ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> جاري التحميل...</>
              : <><RefreshCw size={15} /> عرض التقرير</>
            }
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
          <Loader2 size={48} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 16px', opacity: 0.4 }} />
          <p style={{ fontSize: 15 }}>الذكاء الاصطناعي يجمع بيانات {MONTHS_AR[month]} {year}...</p>
          <p style={{ fontSize: 13, marginTop: 8, opacity: 0.6 }}>يتم جلب المستخدمين والإيداعات والطلبات والأكواد في آنٍ واحد</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !report && (
        <div style={{ textAlign: 'center', padding: 80, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 20 }}>
          <Archive size={60} style={{ opacity: 0.1, margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: 8 }}>اختر الشهر وانقر "عرض التقرير"</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>سيتم جمع كل بيانات الشهر وعرضها بشكل منظم هنا</p>
        </div>
      )}

      {/* Report Content */}
      {report && !loading && (
        <>
          {/* Period Label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                تقرير {MONTHS_AR[report.month]} {report.year}
              </span>
            </h2>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard icon={Users} label="مستخدمون جدد" value={report.users.length} color="var(--accent-blue)" />
            <StatCard icon={CreditCard} label="إجمالي الإيداعات" value={`${report.totalIncome} ج.م`} color="#22c55e" sub={`${report.deposits.length} عملية إيداع`} />
            <StatCard icon={ShoppingCart} label="قيمة الطلبات" value={`${report.totalOrderValue} ج.م`} color="#8b5cf6" sub={`${report.totalOrders} طلب`} />
            <StatCard icon={Tag} label="أكواد مستخدمة" value={report.usedCodes.length} color="#22d3ee" />
            <StatCard icon={TrendingUp} label="إجمالي الدخل" value={`${report.totalIncome} ج.م`} color="#facc15" sub="الإيداعات المعتمدة" />
          </div>

          {/* Users Table */}
          <Section title={`المستخدمون الجدد (${report.users.length})`} icon={Users} color="var(--accent-blue)" empty={report.users.length === 0}>
            <table className="admin-table">
              <thead><tr><th>#</th><th>الاسم</th><th>البريد</th><th>واتساب</th><th>الرصيد</th><th>تاريخ التسجيل</th></tr></thead>
              <tbody>
                {report.users.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{u.fullName || '—'}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ direction: 'ltr' }}>{u.whatsapp || '—'}</td>
                    <td style={{ color: '#22c55e', fontWeight: 700 }}>{u.walletBalance || 0} ج.م</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.createdAt?.toDate?.()?.toLocaleDateString('ar-EG') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Deposits Table */}
          <Section title={`الإيداعات المعتمدة (${report.deposits.length})`} icon={CreditCard} color="#22c55e" empty={report.deposits.length === 0}>
            <table className="admin-table">
              <thead><tr><th>المستخدم</th><th>المبلغ</th><th>طريقة الدفع</th><th>التاريخ</th></tr></thead>
              <tbody>
                {report.deposits.map(d => (
                  <tr key={d.id}>
                    <td>{d.userName || d.userId || '—'}</td>
                    <td style={{ fontWeight: 700, color: '#22c55e' }}>{d.amount} ج.م</td>
                    <td>{d.method || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.createdAt?.toDate?.()?.toLocaleDateString('ar-EG') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Orders Table */}
          <Section title={`الطلبات والخدمات (${report.orders.length})`} icon={ShoppingCart} color="#8b5cf6" empty={report.orders.length === 0}>
            <table className="admin-table">
              <thead><tr><th>المستخدم</th><th>الخدمة</th><th>الباقة</th><th>السعر</th><th>الحالة</th><th>التاريخ</th></tr></thead>
              <tbody>
                {report.orders.map(o => (
                  <tr key={o.id}>
                    <td>{o.userName || o.userId || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{o.serviceName || '—'}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{o.packageName || '—'}</td>
                    <td style={{ fontWeight: 700, color: '#8b5cf6' }}>{o.price} ج.م</td>
                    <td>
                      <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 4, background: o.status === 'completed' ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)', color: o.status === 'completed' ? '#22c55e' : '#eab308' }}>
                        {o.status === 'completed' ? 'مكتمل' : o.status === 'pending' ? 'معلق' : o.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{o.createdAt?.toDate?.()?.toLocaleDateString('ar-EG') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Discount Codes Table */}
          <Section title={`أكواد الخصم المستخدمة (${report.usedCodes.length})`} icon={Tag} color="#22d3ee" empty={report.usedCodes.length === 0}>
            <table className="admin-table">
              <thead><tr><th>الكود</th><th>النوع</th><th>القيمة</th><th>عدد الاستخدامات</th></tr></thead>
              <tbody>
                {report.usedCodes.map(c => (
                  <tr key={c.id}>
                    <td><code style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace', letterSpacing: 1 }}>{c.code}</code></td>
                    <td style={{ fontSize: 13 }}>{c.type === 'discount' ? 'خصم خدمات' : 'شحن ألعاب'}</td>
                    <td style={{ fontWeight: 700 }}>
                      {c.type === 'discount'
                        ? `${c.discountValue}${c.discountType === 'percent' ? '%' : ' ج.م'}`
                        : `${c.rechargeAmount} ج.م`}
                    </td>
                    <td style={{ fontWeight: 700, color: '#22d3ee' }}>{c.usedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Income Summary */}
          <div style={{ background: 'linear-gradient(135deg, rgba(250,204,21,0.08), rgba(234,179,8,0.05))', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 16, padding: '24px 28px', marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#facc15', marginBottom: 4 }}>
                  <TrendingUp size={18} style={{ display: 'inline', marginLeft: 6 }} />
                  إجمالي دخل {MONTHS_AR[report.month]} {report.year}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>من {report.deposits.length} إيداع معتمد</p>
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#facc15' }}>
                {report.totalIncome.toLocaleString()} <span style={{ fontSize: '1rem' }}>ج.م</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, color, children, empty }) {
  return (
    <div className="admin-card" style={{ padding: 0, marginBottom: 24, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
        <Icon size={18} color={color} />
        <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
      </div>
      {empty ? (
        <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>لا توجد بيانات في هذا الشهر</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>{children}</div>
      )}
    </div>
  );
}

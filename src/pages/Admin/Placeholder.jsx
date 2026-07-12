// Admin Placeholders for other routes
export default function Placeholder({ title }) {
  return (
    <div>
      <h1 className="admin-page-title">{title}</h1>
      <div className="admin-card">
        <p style={{ color: 'var(--text-muted)' }}>هذه الصفحة قيد التطوير...</p>
      </div>
    </div>
  );
}

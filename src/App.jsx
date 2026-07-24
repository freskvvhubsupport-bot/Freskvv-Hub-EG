// Freskvv Tec EG — Main App Router
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import AIAssistant from './components/AIAssistant/AIAssistant';
import MouseGlow from './components/UI/MouseGlow';
import LivePurchaseTicker from './components/UI/LivePurchaseTicker';
import ErrorBoundary from './components/ErrorBoundary';
import PageTransition from './components/UI/PageTransition';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// --- Lazy-loaded Pages (split into separate bundles for fast loading) ---
const Home            = lazy(() => import('./pages/Home/Home'));
const Login           = lazy(() => import('./pages/Auth/Login'));
const Register        = lazy(() => import('./pages/Auth/Register'));
const CompleteProfile = lazy(() => import('./pages/Auth/CompleteProfile'));
const Dashboard       = lazy(() => import('./pages/Dashboard/Dashboard'));
const Wallet          = lazy(() => import('./pages/Dashboard/Wallet'));
const Settings        = lazy(() => import('./pages/Dashboard/Settings'));
const Notifications   = lazy(() => import('./pages/Dashboard/Notifications'));
const UserOrders      = lazy(() => import('./pages/Dashboard/UserOrders'));
const UserPoints      = lazy(() => import('./pages/Dashboard/UserPoints'));
const Services        = lazy(() => import('./pages/Services/Services'));
const ServiceDetail   = lazy(() => import('./pages/Services/ServiceDetail'));
const GameStore       = lazy(() => import('./pages/GameStore/GameStore'));
const CustomService   = lazy(() => import('./pages/CustomService/CustomService'));
const Learning        = lazy(() => import('./pages/Learning/Learning'));
const Community       = lazy(() => import('./pages/Community/Community'));
const TermsPrivacy    = lazy(() => import('./pages/TermsPrivacy'));

const AdminLayout      = lazy(() => import('./pages/Admin/AdminLayout'));
const AdminDashboard   = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminUsers       = lazy(() => import('./pages/Admin/AdminUsers'));
const AdminWallet      = lazy(() => import('./pages/Admin/AdminWallet'));
const AdminSettings    = lazy(() => import('./pages/Admin/AdminSettings'));
const AdminChat        = lazy(() => import('./pages/Admin/AdminChat'));
const AdminOrders      = lazy(() => import('./pages/Admin/AdminOrders'));
const AdminNotifications = lazy(() => import('./pages/Admin/AdminNotifications'));
const AdminSections    = lazy(() => import('./pages/Admin/AdminSections'));
const AdminGameStore   = lazy(() => import('./pages/Admin/AdminGameStorePanel'));
const AdminDiscountCodes = lazy(() => import('./pages/Admin/AdminDiscountCodes'));
const AdminArchive       = lazy(() => import('./pages/Admin/AdminArchive'));
const UserSupportChat    = lazy(() => import('./pages/Dashboard/UserSupportChat'));

// ──────────────────────────────────────────────────────
// Minimal inline spinner shown only during Lazy chunk load
// (keeps background, doesn't flash white)
// ──────────────────────────────────────────────────────
function PageSpinner() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '3px solid rgba(79,159,255,0.2)',
        borderTop: '3px solid #4f9fff',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  );
}

// Protected Route wrapper
function ProtectedRoute({ children, requireAuth = true }) {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (requireAuth && !currentUser) return <Navigate to="/auth/login" replace />;
  if (requireAuth && currentUser && !userProfile?.profileComplete) {
    return <Navigate to="/auth/complete-profile" replace />;
  }
  
  if (userProfile?.status === 'banned' || userProfile?.status === 'suspended') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '20px', background: 'var(--bg-base)' }}>
        <h1 style={{ color: 'var(--accent-red)', marginBottom: '16px' }}>
          {userProfile.status === 'banned' ? 'حساب محظور نهائياً 🚫' : 'حساب موقوف مؤقتاً ⚠️'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: '1.8' }}>
          {userProfile.statusReason || 'تم إيقاف حسابك لمخالفة شروط الاستخدام.'}
        </p>
      </div>
    );
  }

  return children;
}

// Admin Route wrapper
function AdminRoute({ children }) {
  const { currentUser, isAdmin, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!currentUser) return <Navigate to="/auth/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <Suspense fallback={<PageSpinner />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public */}
            <Route path="/"                element={<PageTransition><Home /></PageTransition>} />
            <Route path="/services"        element={<PageTransition><Services /></PageTransition>} />
            <Route path="/services/:slug"  element={<PageTransition><ServiceDetail /></PageTransition>} />
            <Route path="/game-store"      element={<PageTransition><GameStore /></PageTransition>} />
            <Route path="/custom-service"  element={<PageTransition><CustomService /></PageTransition>} />
            <Route path="/learning"        element={<PageTransition><Learning /></PageTransition>} />
            <Route path="/community"       element={<PageTransition><Community /></PageTransition>} />
            <Route path="/terms"           element={<PageTransition><TermsPrivacy /></PageTransition>} />
            <Route path="/privacy"         element={<PageTransition><TermsPrivacy /></PageTransition>} />

            {/* Auth */}
            <Route path="/auth/login"            element={<PageTransition><Login /></PageTransition>} />
            <Route path="/auth/register"         element={<PageTransition><Register /></PageTransition>} />
            <Route path="/auth/complete-profile" element={<PageTransition><CompleteProfile /></PageTransition>} />

            {/* Protected User */}
            <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
            <Route path="/dashboard/wallet" element={<ProtectedRoute><PageTransition><Wallet /></PageTransition></ProtectedRoute>} />
            <Route path="/dashboard/notifications" element={<ProtectedRoute><PageTransition><Notifications /></PageTransition></ProtectedRoute>} />
            <Route path="/dashboard/orders" element={<ProtectedRoute><PageTransition><UserOrders /></PageTransition></ProtectedRoute>} />
            <Route path="/dashboard/points" element={<ProtectedRoute><PageTransition><UserPoints /></PageTransition></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute>} />
            <Route path="/dashboard/support" element={<ProtectedRoute><PageTransition><UserSupportChat /></PageTransition></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><PageTransition><AdminLayout /></PageTransition></AdminRoute>}>
              <Route index                    element={<AdminDashboard />} />
              <Route path="users"             element={<AdminUsers />} />
              <Route path="wallet"            element={<AdminWallet />} />
              <Route path="settings"          element={<AdminSettings />} />
              <Route path="sections"          element={<AdminSections />} />
              <Route path="game-store"        element={<AdminGameStore />} />
              <Route path="orders"            element={<AdminOrders />} />
              <Route path="support"           element={<AdminChat />} />
              <Route path="notifications"     element={<AdminNotifications />} />
              <Route path="discount-codes"    element={<AdminDiscountCodes />} />
              <Route path="archive"           element={<AdminArchive />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <SettingsProvider>
            <AppRoutes />
            <AIAssistant />
            <MouseGlow />
            <LivePurchaseTicker />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: 'rgba(13,13,34,0.95)',
                  color: '#f0f4ff',
                  border: '1px solid rgba(79,159,255,0.2)',
                  backdropFilter: 'blur(20px)',
                  fontFamily: 'Cairo, sans-serif',
                  borderRadius: '12px',
                },
                success: { iconTheme: { primary: '#4f9fff', secondary: 'white' } },
                error:   { iconTheme: { primary: '#f87171', secondary: 'white' } },
              }}
            />
          </SettingsProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

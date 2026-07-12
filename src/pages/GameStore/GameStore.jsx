// Freskvv Tec EG — Game Store (Frontend - Updated for Tiers)
import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { GamepadIcon, ShoppingCart, Wallet, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// ── Game Images using reliable proxy (images.weserv.nl bypasses hotlink blocks) ──
const proxy = (url) => `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=400&h=250&fit=cover&output=webp`;

const GAME_IMAGE_MAP = [
  { keys: ['pubg', 'ببجي', 'playerunknown'],      img: proxy('https://upload.wikimedia.org/wikipedia/en/0/0f/PUBG_Mobile_Cover.jpg') },
  { keys: ['free fire', 'فري فاير', 'freefire'],  img: proxy('https://upload.wikimedia.org/wikipedia/en/c/ce/Garena_Free_Fire_cover.jpg') },
  { keys: ['roblox', 'روبلوكس'],                  img: proxy('https://upload.wikimedia.org/wikipedia/commons/4/44/Roblox_Logo_Red.png') },
  { keys: ['valorant', 'فالورانت'],               img: proxy('https://upload.wikimedia.org/wikipedia/en/f/fc/Valorant_cover.jpg') },
  { keys: ['league', 'ليج', 'lol'],              img: proxy('https://upload.wikimedia.org/wikipedia/en/1/13/League_of_Legends_cover.jpg') },
  { keys: ['minecraft', 'ماين كرافت', 'ماين'],   img: proxy('https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png') },
  { keys: ['clash of clans', 'كلاش اوف', 'كلاش'], img: proxy('https://upload.wikimedia.org/wikipedia/en/2/2b/Clash_of_Clans_cover.jpg') },
  { keys: ['mobile legends', 'موبايل ليجيندز', 'ml'], img: proxy('https://upload.wikimedia.org/wikipedia/en/0/06/Mobile_Legends%2C_Bang_Bang.png') },
  { keys: ['genshin', 'جينشن'],                   img: proxy('https://upload.wikimedia.org/wikipedia/en/3/38/Genshin_Impact_logo.jpg') },
  { keys: ['fortnite', 'فورتنايت'],              img: proxy('https://upload.wikimedia.org/wikipedia/en/9/93/Fortnite_chapter_4.jpg') },
  { keys: ['call of duty', 'كول اوف', 'cod'],    img: proxy('https://upload.wikimedia.org/wikipedia/en/8/8b/CODM_keyart.jpg') },
  { keys: ['fifa', 'فيفا', 'fc 24', 'fc25'],     img: proxy('https://upload.wikimedia.org/wikipedia/en/a/a3/EA_Sports_FC_24.jpg') },
  { keys: ['honor of kings', 'هونر'],             img: proxy('https://upload.wikimedia.org/wikipedia/en/7/77/Honor_of_Kings_Logo.png') },
  { keys: ['brawl stars', 'براول'],              img: proxy('https://upload.wikimedia.org/wikipedia/en/6/6a/Brawl_Stars_Logo.png') },
  { keys: ['clash royale', 'كلاش رويال'],        img: proxy('https://upload.wikimedia.org/wikipedia/en/5/5b/Clash_Royale_Logo.png') },
];

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=250&fit=crop';

function getGameImage(item) {
  if (item.imageUrl) return item.imageUrl;
  const lower = (item.name || '').toLowerCase();
  for (const entry of GAME_IMAGE_MAP) {
    if (entry.keys.some(k => lower.includes(k))) return entry.img;
  }
  return FALLBACK_IMG;
}


export default function GameStore() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [playerID, setPlayerID] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userWallet, setUserWallet] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'game_store'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(item => item.available !== false);
      setItems(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (currentUser) {
      getDoc(doc(db, 'users', currentUser.uid)).then(d => {
        if (d.exists()) setUserWallet(d.data().walletBalance || 0);
      });
    }
  }, [currentUser]);

  const openPurchase = (item) => {
    setSelectedItem(item);
    const tiers = item.tiers || [];
    setSelectedTier(tiers.length > 0 ? tiers[0] : null);
    setPlayerID('');
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('يجب تسجيل الدخول أولاً لشحن الألعاب');
      navigate('/auth/login', { state: { returnTo: '/game-store' } });
      return;
    }
    if (!playerID.trim()) { toast.error('يرجى إدخال معرف اللاعب'); return; }
    if (!selectedTier) { toast.error('يرجى اختيار الكمية'); return; }
    if (userWallet < selectedTier.price) { toast.error('رصيدك غير كافٍ'); return; }

    setSubmitting(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { walletBalance: increment(-selectedTier.price) });

      await addDoc(collection(db, 'orders'), {
        userId: currentUser.uid,
        serviceSlug: 'game-store',
        serviceName: `شحن ${selectedItem.category}`,
        packageId: selectedItem.id,
        packageName: `${selectedItem.name} - ${selectedTier.label}`,
        price: selectedTier.price,
        projectName: `ID: ${playerID}`,
        notes: `الكمية: ${selectedTier.label} | التسليم: ${selectedItem.deliveryType === 'code' ? 'كود' : 'يدوي'}`,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, 'transactions'), {
        uid: currentUser.uid,
        amount: selectedTier.price,
        type: 'spend',
        description: `شراء: ${selectedItem.name} - ${selectedTier.label}`,
        createdAt: serverTimestamp()
      });

      toast.success('تم استلام طلب الشحن بنجاح! جاري التنفيذ.');
      setSelectedItem(null);
      setSelectedTier(null);
      setPlayerID('');
      setUserWallet(prev => prev - selectedTier.price);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء معالجة الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  // Group by category
  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div className="services-page" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <GamepadIcon size={48} style={{ color: 'var(--accent-purple)', marginBottom: 16, margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 8 }}>متجر شحن الألعاب</h1>
          <p style={{ color: 'var(--text-muted)' }}>اشحن ألعابك المفضلة فوراً وبأرخص الأسعار مع نظام تسليم آمن</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>جاري تحميل المنتجات...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'var(--bg-secondary)', borderRadius: 16 }}>
            <p>لا توجد منتجات متاحة حالياً. يرجى العودة لاحقاً.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {items.map((item, i) => {
              const img = getGameImage(item);
              const tiers = item.tiers || [];
              const minPrice = tiers.length > 0 ? Math.min(...tiers.map(t => t.price)) : (item.price || 0);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    background: 'rgba(10,10,26,0.7)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 20,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                  onClick={() => openPurchase(item)}
                >
                  {/* Game Cover */}
                  <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                    <img
                      src={img}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop'; }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(10,10,26,0.95) 100%)' }} />
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(139,92,246,0.85)', color: 'white', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
                      {item.category}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '16px 20px 20px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 8, fontWeight: 700 }}>{item.name}</h3>
                    {item.description && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>{item.description}</p>
                    )}

                    {/* Tier badges preview */}
                    {tiers.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                        {tiers.slice(0, 4).map((t, ti) => (
                          <span key={ti} style={{ fontSize: 11, background: 'rgba(79,159,255,0.1)', border: '1px solid rgba(79,159,255,0.2)', color: 'var(--accent-blue-bright)', padding: '2px 8px', borderRadius: 20 }}>
                            {t.label}
                          </span>
                        ))}
                        {tiers.length > 4 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{tiers.length - 4} أكثر</span>}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        يبدأ من <strong style={{ color: '#22c55e', fontSize: 18 }}>{minPrice}</strong> ج.م
                      </div>
                      <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={e => { e.stopPropagation(); openPurchase(item); }}>
                        <ShoppingCart size={14} /> شحن الآن
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Purchase Modal */}
        {selectedItem && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 24, width: '100%', maxWidth: 480, overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}
            >
              {/* Game header image */}
              <div style={{ position: 'relative', height: 140 }}>
                <img src={getGameImage(selectedItem)} alt={selectedItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=480&h=140&fit=crop'; }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(13,13,34,0.95))' }} />
                <div style={{ position: 'absolute', bottom: 16, right: 20 }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selectedItem.name}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{selectedItem.category}</p>
                </div>
              </div>

              <div style={{ padding: '24px 28px' }}>
                {/* Tier Selector */}
                {selectedItem.tiers?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>اختر الكمية</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                      {selectedItem.tiers.map((tier, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedTier(tier)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 12,
                            border: selectedTier?.label === tier.label ? '2px solid var(--accent-blue)' : '1px solid var(--border-glass)',
                            background: selectedTier?.label === tier.label ? 'rgba(79,159,255,0.15)' : 'rgba(255,255,255,0.03)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{tier.label}</div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#22c55e', marginTop: 2 }}>{tier.price} ج.م</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handlePurchase}>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label>معرف اللاعب (Player ID / User ID)</label>
                    <input type="text" className="form-input" value={playerID} onChange={e => setPlayerID(e.target.value)} placeholder="مثال: 5123456789" required />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>يرجى التأكد من صحة الآي دي، لا يمكن استرجاع الرصيد في حالة الخطأ.</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 10, marginBottom: 20, border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}><Wallet size={15} /> رصيدك الحالي</span>
                      <strong>{userWallet} ج.م</strong>
                    </div>
                    {selectedTier && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingTop: 8, borderTop: '1px solid var(--border-glass)' }}>
                        <span style={{ fontSize: 14 }}>المبلغ المطلوب</span>
                        <strong style={{ color: '#22c55e' }}>{selectedTier.price} ج.م</strong>
                      </div>
                    )}
                    {selectedTier && userWallet < selectedTier.price ? (
                      <div style={{ color: '#ef4444', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertCircle size={13} /> رصيدك غير كافٍ. <Link to="/dashboard/wallet" style={{ color: 'var(--accent-blue-bright)' }}>اشحن الآن</Link>
                      </div>
                    ) : selectedTier ? (
                      <div style={{ color: '#22c55e', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={13} /> رصيدك يكفي للشحن.
                      </div>
                    ) : null}
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="submit" className="btn-primary" disabled={submitting || !selectedTier} style={{ flex: 2, justifyContent: 'center' }}>
                      {submitting ? 'جاري المعالجة...' : 'تأكيد ودفع'}
                    </button>
                    <button type="button" className="btn-ghost" onClick={() => setSelectedItem(null)} style={{ flex: 1, justifyContent: 'center' }}>
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

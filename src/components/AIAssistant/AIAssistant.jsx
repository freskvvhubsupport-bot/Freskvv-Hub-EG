import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Lock, LogIn, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import './AIAssistant.css';

// Initialize Gemini (only works if key is provided in .env)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export default function AIAssistant() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Default welcome message
  const welcomeMessage = {
    id: 'welcome',
    type: 'bot',
    text: 'أهلاً بك في منصة Freskvv Tec EG! 👋\nأنا مساعدك الذكي. كيف يمكنني خدمتك اليوم؟ يمكنك سؤالي عن أسعار السيرفرات، المواقع، التطبيقات، طرق الإيداع عبر أورنچ كاش، أو نظام النقاط والخصومات!'
  };

  // Load chat messages from Firestore if logged in
  useEffect(() => {
    if (!currentUser || !isOpen) return;

    // Check if Firebase is actually configured before calling
    const isFirebaseConfigured = !db._databaseId.projectId.includes("YOUR_PROJECT_ID");
    if (!isFirebaseConfigured) {
      // Fallback: load from local storage or set default
      const saved = localStorage.getItem(`chat_${currentUser.uid}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([welcomeMessage]);
      }
      return;
    }

    try {
      const q = query(
        collection(db, 'users', currentUser.uid, 'ai_messages'),
        orderBy('createdAt', 'asc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (loadedMessages.length === 0) {
          setMessages([welcomeMessage]);
        } else {
          setMessages(loadedMessages);
        }
      }, (error) => {
        console.warn("Firestore listener failed, falling back to local memory:", error);
        setMessages([welcomeMessage]);
      });

      return unsubscribe;
    } catch (e) {
      console.warn("Error setting up Firestore listener:", e);
      setMessages([welcomeMessage]);
    }
  }, [currentUser, isOpen]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Advanced rule-based bot response generator
  const getSmartReply = (msg) => {
    const text = msg.toLowerCase();
    
    // Greetings
    if (text.includes('مرحبا') || text.includes('سلام') || text.includes('هلا') || text.includes('اهلين') || text.includes('hello') || text.includes('hi')) {
      return 'أهلاً بك! سعداء جداً بتواصلك معنا. كيف يمكن للمساعد الذكي مساعدتك اليوم في منصة Freskvv Tec؟';
    }
    
    // Game Servers
    if (text.includes('سيرفر') || text.includes('سيرفرات') || text.includes('العاب') || text.includes('server') || text.includes('game')) {
      return `🎮 قسم سيرفرات الألعاب لدينا يقدم أقوى السيرفرات المحمية ضد الـ DDoS:\n
• باقة ستارتر: 150 ج.م شهرياً (1GB RAM)\n
• باقة برو (الأكثر طلباً): 350 ج.م شهرياً (4GB RAM + IP مخصص)\n
• باقة بيزنس: 700 ج.م شهرياً (8GB RAM)\n
• باقة انتربرايز: 1500 ج.م شهرياً (16GB RAM)\n
هل تود حجز سيرفر الآن؟ يمكنك الانتقال لقسم الخدمات وتحديد الباقة!`;
    }

    // Apps & Mobile
    if (text.includes('تطبيق') || text.includes('تطبيقات') || text.includes('اندرويد') || text.includes('ايفون') || text.includes('app')) {
      return `📱 نقوم بتصميم وبرمجة تطبيقات الهواتف الذكية (iOS & Android):\n
• الباقة الأساسية: 500 ج.م (تطبيق أندرويد فقط، 3 شاشات)\n
• الباقة الاحترافية: 1200 ج.م (أندرويد + آيفون، 10 شاشات، لوحة تحكم)\n
• الباقة الممتازة: 2500 ج.م (تصميم فاخر، شاشات غير محدودة، دعم سنة كاملة)\n
كل التطبيقات نضمن لك توافقها الكامل مع الهواتف وسرعتها العالية.`;
    }

    // Websites
    if (text.includes('موقع') || text.includes('مواقع') || text.includes('ويب') || text.includes('website')) {
      return `🌐 نقوم بإنشاء مواقع ويب سريعة جداً ومتوافقة مع محركات البحث (SEO):\n
• باقة ستارتر: 300 ج.م (5 صفحات، دومين مجاني)\n
• باقة برو: 700 ج.م (10 صفحات، استضافة مجانية لمدة سنة)\n
• باقة بيزنس: 1500 ج.م (صفحات غير محدودة ولوحة إدارة كاملة)\n
• باقة المتجر الإلكتروني: 2500 ج.م (متجر كامل مع نظام دفع متكامل وسلة مشتريات)\n
مواقعنا تتميز بالأنميشن السلس والتصميم المستوحى من الآيفون.`;
    }

    // Orange Cash / Payments / Deposit
    if (text.includes('اورنج') || text.includes('كاش') || text.includes('ايداع') || text.includes('شحن رصيد') || text.includes('تحويل') || text.includes('فلوس') || text.includes('شحن المحفظة')) {
      return `💳 شحن الرصيد في محفظة Freskvv Tec سهل وآمن للغاية:\n
1️⃣ يتم تحويل المبلغ المراد إيداعه إلى رقم أورنچ كاش الرسمي: 01221640301\n
2️⃣ بعد التحويل، اذهب إلى صفحة "المحفظة" في حسابك واضغط على "إيداع رصيد".\n
3️⃣ أدخل القيمة التي قمت بتحويلها وسيقوم فريق المراجعة بإضافة الرصيد لحسابك خلال ساعات قليلة.\n
الحد الأدنى للإيداع هو 5 جنيهات فقط.`;
    }

    // Game Charging Shop
    if (text.includes('شحن العاب') || text.includes('ببجي') || text.includes('فري فاير') || text.includes('جواهر') || text.includes('شدات') || text.includes('pubg') || text.includes('free fire')) {
      return `🎮 متجر شحن الألعاب قادم قريباً جداً في التحديث القادم!\n
ستتمكن من شحن شدات ببجي (UC)، جواهر فري فاير، ماسات موبايل ليجيندز وغيرها بأسعار منافسة فوراً من رصيد محفظتك، بالإضافة إلى كسب نقاط إضافية مع كل شحنة.`;
    }

    // Refund policy
    if (text.includes('استرجاع') || text.includes('استرداد') || text.includes('رجع') || text.includes('refund')) {
      return `⚠️ سياسة استرداد الأموال لدينا مرنة وضامنة لحقك:\n
• يمكنك تقديم طلب استرداد للأموال الموجودة في محفظتك في أي وقت من صفحة المحفظة.\n
• يتم مراجعة طلبك والتواصل معك على رقم الواتساب المسجل خلال 7 أيام عمل لإعادة الأموال إليك.\n
نحن نضمن رضاك الكامل عن خدماتنا!`;
    }

    // Points system
    if (text.includes('نقاط') || text.includes('نظام النقاط') || text.includes('نقاطي') || text.includes('points')) {
      return `⭐ نظام النقاط والمكافآت:\n
• تكسب نقاطاً تلقائياً عند طلب أي خدمة، أو عند شحن الألعاب.\n
• يمكنك استبدال هذه النقاط لاحقاً برصيد حقيقي في محفظتك لتشتري به خدمات أخرى مجاناً.\n
كلما زاد استخدامك للموقع، زادت مكافآتك!`;
    }

    // Promocodes
    if (text.includes('كوبون') || text.includes('خصم') || text.includes('رمز ترويجي') || text.includes('promo')) {
      return `🎟️ يمكنك استخدام كود الخصم الترحيبي الأول: [ WELCOME50 ] للحصول على 50 ج.م هدية مجانية في محفظتك فوراً!\n
جرب تفعيله الآن من صفحة المحفظة -> كود خصم.`;
    }

    // Support
    if (text.includes('دعم') || text.includes('تواصل') || text.includes('مشكلة') || text.includes('واتساب') || text.includes('رقم الدعم') || text.includes('help')) {
      return `📞 للدعم الفني الفوري والتواصل المباشر:\n
• يمكنك مراسلتنا مباشرة عبر واتساب على الرقم: 201221640301+\n
• أو فتح تذكرة دعم فني من خلال لوحة التحكم الخاصة بك.\n
فريقنا متواجد لخدمتك على مدار الساعة!`;
    }

    // General Tech info
    if (text.includes('مين') || text.includes('موقع ايه') || text.includes('الموقع بيعمل') || text.includes('من انتم') || text.includes('فكرة')) {
      return `⚡ Freskvv Tec EG هي منصة مصرية متكاملة تقدم أحدث الحلول التقنية والخدمات الرقمية بأعلى جودة وأقل تكلفة. نحن نجمع بين برمجة المواقع والتطبيقات، سيرفرات الألعاب، إدارة المشاريع، وشحن الألعاب في مكان واحد آمن وموثوق.`;
    }

    // Fallback if no Gemini Key is set
    return `فهمت استفسارك بخصوص هذا الموضوع. يرجى العلم أن ميزة الذكاء الاصطناعي المتقدمة (Gemini) غير مفعلة حالياً. 
لتفعيلها، يرجى الحصول على مفتاح API مجاني من Google AI Studio وإضافته في ملف .env باسم VITE_GEMINI_API_KEY.
إذا كنت بحاجة إلى مساعدة فورية، تواصل مع الدعم الفني عبر واتساب (01221640301). 📞`;
  };

  // Generate response using Gemini
  const generateGeminiResponse = async (userText) => {
    if (!genAI) return getSmartReply(userText);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `أنت مساعد ذكي لمنصة "Freskvv Tec EG" التقنية في مصر. 
تتحدث باللغة العربية بأسلوب احترافي وودود.
خدمات المنصة: إنشاء سيرفرات ألعاب، تطبيقات، مواقع، أنظمة إدارة، وتسويق.
الدفع عبر محفظة الموقع بالشحن من اورنج كاش على الرقم 01221640301.
رقم الدعم: 01221640301.
إذا كان السؤال خارج نطاق التقنية وخدمات المنصة، اعتذر بلطف ووجهه لما نقدمه.

سؤال المستخدم: ${userText}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini AI Error:", error);
      return getSmartReply(userText); // Fallback to hardcoded on error
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentUser) return;

    const userText = input.trim();
    setInput('');
    setIsTyping(true);

    const userMsg = {
      type: 'user',
      text: userText,
      createdAt: new Date()
    };

    // Update local state temporarily for instant UI response
    setMessages(prev => [...prev, userMsg]);

    const isFirebaseConfigured = !db._databaseId.projectId.includes("YOUR_PROJECT_ID");

    try {
      // 1. Save User Message
      if (isFirebaseConfigured) {
        await addDoc(collection(db, 'users', currentUser.uid, 'ai_messages'), {
          type: 'user',
          text: userText,
          createdAt: serverTimestamp()
        });
      }

      // If Admin has taken over, do not auto-reply
      if (userProfile?.adminChatMode) {
        setIsTyping(false);
        return;
      }

      // Generate bot response
      const botReplyText = await generateGeminiResponse(userText);
      
      const botMsg = {
        type: 'bot',
        text: botReplyText,
        createdAt: new Date()
      };

      // Update local state
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);

      // 2. Save Bot Message
      if (isFirebaseConfigured) {
        await addDoc(collection(db, 'users', currentUser.uid, 'ai_messages'), {
          type: 'bot',
          text: botReplyText,
          createdAt: serverTimestamp()
        });
      } else {
        // If fallback mode, keep history in localStorage
        const history = [...messages, userMsg, botMsg];
        localStorage.setItem(`chat_${currentUser.uid}`, JSON.stringify(history));
      }

    } catch (error) {
      console.error("Failed to send message:", error);
      // Fallback logic
      const botReplyText = getSmartReply(userText);
      const botMsg = {
        type: 'bot',
        text: botReplyText,
        createdAt: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="ai-assistant-wrapper">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="ai-chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="ai-chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="ai-avatar">
                    {userProfile?.adminChatMode ? <User size={20} /> : <Sparkles size={20} />}
                  </div>
                  <div>
                    <h3 className="ai-title">
                      {userProfile?.adminChatMode ? 'الدعم المباشر' : 'المساعد الذكي (AI)'}
                    </h3>
                    <p className="ai-subtitle">
                      {userProfile?.adminChatMode ? 'محادثة مع ممثل خدمة العملاء' : 'متصل وجاهز للمساعدة'}
                    </p>
                  </div>
                </div>
                <button className="ai-close-btn" onClick={handleClose}>
                  <X size={20} />
                </button>
              </div>

            {/* Body */}
            {currentUser ? (
              <>
                <div className="ai-chat-body">
                  {messages.map(msg => (
                    <div key={msg.id || Math.random()} className={`ai-message ${msg.type}`}>
                      <div className="ai-message-avatar">
                        {msg.type === 'bot' ? <Bot size={16} /> : <User size={16} />}
                      </div>
                      <div className="ai-message-bubble">
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="ai-message bot">
                      <div className="ai-message-avatar">
                        <Bot size={16} />
                      </div>
                      <div className="ai-typing-indicator">
                        <span /> <span /> <span />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="ai-chat-input" onSubmit={handleSend}>
                  <input 
                    type="text" 
                    placeholder="اسألني عن أي شيء..." 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                  />
                  <button type="submit" disabled={!input.trim()}>
                    <Send size={18} />
                  </button>
                </form>
              </>
            ) : (
              // Glassmorphic Login Required Card
              <div className="ai-login-prompt">
                <div className="ai-lock-icon">
                  <Lock size={40} />
                </div>
                <h4 className="ai-prompt-title">محادثة محمية</h4>
                <p className="ai-prompt-desc">
                  يجب تسجيل الدخول أولاً لتتمكن من التحدث مع المساعد الذكي وحفظ المحادثة للرجوع إليها لاحقاً.
                </p>
                <div className="ai-prompt-actions">
                  <Link to="/auth/login" className="btn-primary" onClick={handleClose}>
                    <LogIn size={16} />
                    تسجيل الدخول
                  </Link>
                  <Link to="/auth/register" className="btn-ghost" onClick={handleClose}>
                    <UserPlus size={16} />
                    إنشاء حساب
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        className={`ai-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
        {!isOpen && !currentUser && <span className="ai-fab-badge">!</span>}
      </motion.button>
    </div>
  );
}

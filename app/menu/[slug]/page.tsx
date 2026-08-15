'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Star, X, ChevronRight, MapPin, Bell, Share2, Globe, ShoppingCart } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const themesMap: Record<
  string,
  { bg: string; text: string; primary: string; secondary: string; accent: string; cardBg: string; border: string }
> = {
  'mocha-mousse': {
    bg: '#F5EFE9',
    text: '#3A2E28',
    primary: '#176461',
    secondary: '#176461',
    accent: '#C9A66B',
    cardBg: '#FFFDFB',
    border: '#E8DFD3',
  },
  'olive-cream': {
    bg: '#F7F5EF',
    text: '#2B2E22',
    primary: '#5C6B3E',
    secondary: '#48542F',
    accent: '#B99B5B',
    cardBg: '#FFFFFF',
    border: '#E4E1D3',
  },
  'midnight-wine': {
    bg: '#1C1214',
    text: '#F3E9E9',
    primary: '#4A0E1E',
    secondary: '#630F26',
    accent: '#D4A24C',
    cardBg: '#241419',
    border: '#3A2229',
  },
  'butter-charcoal': {
    bg: '#FAF6E9',
    text: '#262421',
    primary: '#2B2B2B',
    secondary: '#3D3D3D',
    accent: '#E8C15A',
    cardBg: '#FFFFFF',
    border: '#EDE6CC',
  },
  'sage-clay': {
    bg: '#F5F2ED',
    text: '#2A2E28',
    primary: '#7C8B6F',
    secondary: '#5F6E54',
    accent: '#C97B54',
    cardBg: '#FFFFFF',
    border: '#E4E0D5',
  },
};

const DEFAULT_THEME = 'mocha-mousse';

// قاموس ترجمة موحّد لكل نصوص الواجهة (تم دمج نصوص النادل والقائمة في مصدر واحد)
const translations: Record<'ar' | 'fr' | 'en', Record<string, string>> = {
  ar: {
    back: 'رجوع',
    loading: 'جارٍ تحميل القائمة…',
    notFound: 'القائمة غير موجودة',
    notFoundDesc: 'تحقق من رابط المطعم.',
    retry: 'إعادة المحاولة',
    noDishes: 'لا توجد أطباق في هذه الفئة بعد.',
    noImage: 'لا توجد صورة',
    addToCart: 'أضف إلى السلة',
    cart: 'السلة',
    cartEmpty: 'سلتك فارغة',
    total: 'المجموع',
    placeOrder: 'اطلب الآن',
    orderConfirm: 'هل تريد تأكيد الطلب؟',
    remove: 'إزالة',
    close: 'إغلاق',
    language: 'اللغة',
    waiterCall: 'استدعاء النادل',
    confirmQuestion: 'هل تريد استدعاء النادل لطاولتك؟',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    ok: 'حسناً',
    success: '✅ تم إشعار النادل!',
    orderSuccess: '✅ تم استلام طلبك! سنقوم بتجهيزه.',
    botError: '⚠️ تأكد أن بوت Telegram يعمل بشكل صحيح.',
    networkError: '❌ خطأ في الشبكة، حاول مرة أخرى.',
    cooldownError: '⏳ يرجى الانتظار دقيقة واحدة قبل طلب نادل مرة أخرى.',
    tableLabel: 'الطاولة',
    timeLabel: 'الوقت',
    telegramTitle: '🔔 *نداء نادل*',
    telegramOrderTitle: '🛒 *طلب جديد*',
    notSpecified: 'غير محددة',
    reviews: 'التقييمات',
    findUs: 'موقعنا',
  },
  fr: {
    back: 'Retour',
    loading: 'Chargement du menu…',
    notFound: 'Menu introuvable',
    notFoundDesc: 'Vérifiez le lien du restaurant.',
    retry: 'Réessayer',
    noDishes: 'Aucun plat dans cette catégorie pour le moment.',
    noImage: 'Aucune image',
    addToCart: 'Ajouter au panier',
    cart: 'Panier',
    cartEmpty: 'Votre panier est vide',
    total: 'Total',
    placeOrder: 'Commander',
    orderConfirm: 'Confirmer la commande ?',
    remove: 'Retirer',
    close: 'Fermer',
    language: 'Langue',
    waiterCall: 'Appeler le serveur',
    confirmQuestion: 'Appeler le serveur à votre table ?',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    ok: 'OK',
    success: '✅ Le serveur a été prévenu !',
    orderSuccess: '✅ Commande reçue ! Nous la préparons.',
    botError: '⚠️ Vérifie que le bot Telegram est bien démarré.',
    networkError: '❌ Erreur réseau, réessaie.',
    cooldownError: '⏳ Veuillez patienter une minute avant de relancer le serveur.',
    tableLabel: 'Table',
    timeLabel: 'Heure',
    telegramTitle: '🔔 *APPEL SERVEUR*',
    telegramOrderTitle: '🛒 *NOUVELLE COMMANDE*',
    notSpecified: 'non spécifiée',
    reviews: 'Avis',
    findUs: 'Nous trouver',
  },
  en: {
    back: 'Back',
    loading: 'Loading menu…',
    notFound: 'Menu not found',
    notFoundDesc: 'Please check the restaurant link.',
    retry: 'Retry',
    noDishes: 'No dishes in this category yet.',
    noImage: 'No image',
    addToCart: 'Add to cart',
    cart: 'Cart',
    cartEmpty: 'Your cart is empty',
    total: 'Total',
    placeOrder: 'Order now',
    orderConfirm: 'Confirm your order?',
    remove: 'Remove',
    close: 'Close',
    language: 'Language',
    waiterCall: 'Call waiter',
    confirmQuestion: 'Call the waiter to your table?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    ok: 'OK',
    success: '✅ The waiter has been notified!',
    orderSuccess: '✅ Order received! We are preparing it.',
    botError: '⚠️ Make sure the Telegram bot is running.',
    networkError: '❌ Network error, please try again.',
    cooldownError: '⏳ Please wait a minute before calling the waiter again.',
    tableLabel: 'Table',
    timeLabel: 'Time',
    telegramTitle: '🔔 *WAITER CALL*',
    telegramOrderTitle: '🛒 *NEW ORDER*',
    notSpecified: 'not specified',
    reviews: 'Reviews',
    findUs: 'Find us',
  },
};

const STAR_COLOR_EMPTY = '#9ca3af';

// تنسيق موحّد للسعر (خانتان عشريتان دائمًا)
function fmtPrice(value: any): string {
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return `${n.toFixed(2)} DH`;
}

// عرض دقيق للتقييم: نجوم كاملة + نصف نجمة عند الحاجة (4.5 → 4 نجوم + نصف)
function StarRating({ rating, color }: { rating: number; color: string }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<Star key={i} size={13} fill="currentColor" style={{ color }} />);
    } else if (rating >= i - 0.5) {
      stars.push(
        <span key={i} className="relative inline-flex" style={{ width: 13, height: 13 }}>
          <Star size={13} style={{ color: STAR_COLOR_EMPTY }} />
          <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: '50%' }}>
            <Star size={13} fill="currentColor" style={{ color }} />
          </span>
        </span>
      );
    } else {
      stars.push(<Star key={i} size={13} style={{ color: STAR_COLOR_EMPTY }} />);
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

export default function PublicMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [cafeData, setCafeData] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [selectedDish, setSelectedDish] = useState<any | null>(null);
  const [qty, setQty] = useState(1);

  // السلة: لا تعديل على قاعدة البيانات — حالة محلية تُرسل عبر /api/call-waiter
  const [cart, setCart] = useState<{ dish: any; qty: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // اللغة: تبدأ دائمًا بـ 'ar' في التصيير الأول (الخادم والعميل متطابقان → لا Hydration Mismatch)
  // اللغة المحفوظة تُسترجَع بعد التحميل عبر useEffect فقط — لا قراءة localStorage أثناء التصيير
  const [lang, setLang] = useState<'ar' | 'fr' | 'en'>('ar');

  // استرجاع اللغة المحفوظة بعد اكتمال التحميل (يجب أن يسبق تأثير الحفظ أدناه)
  useEffect(() => {
    const saved = localStorage.getItem('menu_lang');
    if (saved === 'ar' || saved === 'fr' || saved === 'en') setLang(saved);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [confirmMode, setConfirmMode] = useState<'waiter' | 'order'>('waiter');
  const [waiterLoading, setWaiterLoading] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  function t(key: string): string {
    const dict = translations[lang] || translations.fr;
    return dict[key] || key;
  }

  // حفظ اللغة + مزامنة lang/dir مع المستند (إمكانية وصول)
  useEffect(() => {
    localStorage.setItem('menu_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    if (cafeData?.name) document.title = cafeData.name;
  }, [cafeData]);

  useEffect(() => {
    if (slug) fetchMenuData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function fetchMenuData() {
    setLoading(true);
    setError(false);
    try {
      const { data: cafe } = await supabase.from('cafes').select('*').eq('slug', slug).single();
      if (!cafe) {
        setLoading(false);
        return; // cafeData يبقى null → شاشة "غير موجود"
      }
      setCafeData(cafe);

      const { data: sectionsData } = await supabase
        .from('menu_sections')
        .select('*')
        .eq('cafe_id', cafe.id)
        .order('display_order', { ascending: true });

      const secs = sectionsData || [];
      setSections(secs);

      if (secs.length > 0) {
        const sectionIds = secs.map((s) => s.id);
        const { data: dishesData } = await supabase
          .from('dishes')
          .select('*')
          .in('section_id', sectionIds)
          .eq('is_available', true)
          .order('display_order', { ascending: true });

        setDishes(dishesData || []);
      }
    } catch (err) {
      console.error(err);
      setError(true); // تمييز خطأ الشبكة عن "غير موجود"
    } finally {
      setLoading(false);
    }
  }

  function localized(item: any, field: 'name' | 'description'): string {
    const langValue = item?.[`${field}_${lang}`];
    if (langValue && langValue.trim()) return langValue;

    const arValue = item?.[`${field}_ar`];
    if (arValue && arValue.trim()) return arValue;

    return item?.[field] || '';
  }

  function addToCart(dish: any, qtyToAdd: number) {
    setCart((prev) => {
      const found = prev.find((i) => i.dish.id === dish.id);
      if (found) return prev.map((i) => (i.dish.id === dish.id ? { ...i, qty: i.qty + qtyToAdd } : i));
      return [...prev, { dish, qty: qtyToAdd }];
    });
    setSelectedDish(null);
    window.scrollTo({ top: 0 });
  }

  function adjustCartQty(dishId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.dish.id === dishId ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
    );
  }

  function removeFromCart(dishId: string) {
    setCart((prev) => prev.filter((i) => i.dish.id !== dishId));
  }

  function openWaiterConfirm() {
    setConfirmMode('waiter');
    setIsConfirmOpen(true);
  }

  function placeOrder() {
    setCartOpen(false);
    setConfirmMode('order');
    setIsConfirmOpen(true);
  }

  // إرسال نداء النادل/الطلب عبر /api/call-waiter (التوكن وبناء الرسالة على الخادم فقط)
  async function handleSendWaiterCall() {
    setIsConfirmOpen(false);

    // فحص محلي سريع كمرآة — الخادم هو المرجع الرسمي ويستجيب 429 مع الوقت المتبقي
    if (confirmMode === 'waiter') {
      const lastCallTime = localStorage.getItem('last_waiter_call_time');
      if (lastCallTime && Date.now() - parseInt(lastCallTime, 10) < 60 * 1000) {
        setResultMessage(t('cooldownError'));
        setIsResultOpen(true);
        return;
      }
    }

    setWaiterLoading(true);

    const urlParams = new URLSearchParams(window.location.search);
    const tableNumber = urlParams.get('table') || sessionStorage.getItem('tableNumber') || t('notSpecified');

    const payload =
      confirmMode === 'waiter'
        ? { kind: 'waiter', cafeSlug: slug, tableNumber, lang }
        : {
            kind: 'order',
            cafeSlug: slug,
            tableNumber,
            lang,
            items: cart.map((c) => ({
              name: localized(c.dish, 'name'),
              qty: c.qty,
              price: Number(c.dish.price),
            })),
            total: cartTotal,
          };

    try {
      const res = await fetch('/api/call-waiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // استجابة غير JSON — سنعتمد على حالة HTTP
      }

      if (res.status === 429) {
        // cooldown على الخادم: عرض الوقت المتبقي الفعلي
        const retryMs = Number(data?.retryAfterMs) || 60000;
        setCooldownLeft(Math.ceil(retryMs / 1000));
        setResultMessage(t('cooldownError'));
      } else if (data.ok) {
        if (confirmMode === 'waiter') {
          localStorage.setItem('last_waiter_call_time', Date.now().toString());
          setCooldownLeft(60);
          setResultMessage(t('success'));
        } else {
          setCart([]);
          setResultMessage(t('orderSuccess'));
        }
      } else {
        setResultMessage(t('botError'));
      }
    } catch {
      setResultMessage(t('networkError'));
    } finally {
      setWaiterLoading(false);
      setIsResultOpen(true);
    }
  }

  // عدّاد فترة انتظار النادل (يُقرأ من التخزين ويُحدَّث كل ثانية)
  useEffect(() => {
    const last = parseInt(localStorage.getItem('last_waiter_call_time') || '0', 10);
    const initLeft = last ? Math.max(0, Math.ceil((last + 60 * 1000 - Date.now()) / 1000)) : 0;
    setCooldownLeft(initLeft);
  }, []);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const id = setTimeout(() => setCooldownLeft((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(id);
  }, [cooldownLeft]);

  // إعادة تعيين الكمية عند فتح طبق جديد
  useEffect(() => {
    if (selectedDish) setQty(1);
  }, [selectedDish]);

  // قفل تمرير الخلفية عند فتح أي نافذة منبثقة
  const anyModalOpen = Boolean(selectedDish) || cartOpen || isConfirmOpen || isResultOpen;
  useEffect(() => {
    document.body.style.overflow = anyModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [anyModalOpen]);

  // إغلاق أي نافذة بزر Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (selectedDish) setSelectedDish(null);
      else if (cartOpen) setCartOpen(false);
      else if (isConfirmOpen) setIsConfirmOpen(false);
      else if (isResultOpen) setIsResultOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedDish, cartOpen, isConfirmOpen, isResultOpen]);

  const currentTheme = themesMap[cafeData?.theme || DEFAULT_THEME] || themesMap[DEFAULT_THEME];
  const fallbackTheme = themesMap[DEFAULT_THEME];

  const cartCount = cart.reduce((s, it) => s + it.qty, 0);
  const cartTotal = cart.reduce((s, it) => s + Number(it.dish.price) * it.qty, 0);
  const sectionDishes = selectedSection ? dishes.filter((d) => d.section_id === selectedSection.id) : [];

  // شاشة التحميل — بألوان الثيم بدل الأزرق الثابت
  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3 transition-colors duration-500"
        style={{ backgroundColor: fallbackTheme.bg, color: fallbackTheme.primary }}
      >
        <div
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: fallbackTheme.primary, borderTopColor: 'transparent' }}
        ></div>
        <p className="text-sm font-semibold tracking-wider">{t('loading')}</p>
      </div>
    );
  }

  // تمييز "خطأ شبكة" عن "قائمة غير موجودة"
  if (!cafeData) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center transition-colors duration-500"
        style={{ backgroundColor: fallbackTheme.bg, color: fallbackTheme.primary }}
      >
        <h1 className="text-xl font-bold">{error ? t('networkError') : t('notFound')}</h1>
        <p className="text-sm mt-2" style={{ color: fallbackTheme.text, opacity: 0.7 }}>
          {error ? t('networkError') : t('notFoundDesc')}
        </p>
        {error && (
          <button
            onClick={fetchMenuData}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white cursor-pointer transition hover:opacity-90"
            style={{ backgroundColor: fallbackTheme.primary }}
          >
            {t('retry')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-24 font-sans transition-colors duration-500"
      style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* الرأس: يرث الاتجاه من الجذر → زر الرجوع ينتقل لليمين في العربية تلقائيًا */}
      <header
        className="sticky top-0 z-40 py-3 px-4 grid grid-cols-3 items-center shadow-md transition-colors duration-500"
        style={{ backgroundColor: currentTheme.primary, color: '#ffffff' }}
      >
        <div className="flex items-center justify-start">
          {selectedSection ? (
            <button
              onClick={() => {
                setSelectedSection(null);
                window.scrollTo({ top: 0 });
              }}
              aria-label={t('back')}
              className="font-bold text-xs sm:text-sm flex items-center gap-1 px-3 py-1.5 rounded-full transition hover:opacity-80"
              style={{ backgroundColor: currentTheme.secondary, color: currentTheme.accent }}
            >
              {/* في العربية السهم يشير لليمين (اتجاه الرجوع الصحيح في RTL) */}
              <span aria-hidden="true">{lang === 'ar' ? '→' : '←'}</span>
              <span>{t('back')}</span>
            </button>
          ) : (
            <div />
          )}
        </div>

        <div className="flex items-center justify-center text-center truncate px-1">
          {cafeData.logo_url ? (
            <img
              src={cafeData.logo_url}
              alt={cafeData.name || 'Logo'}
              className="h-9 max-w-[120px] object-contain mx-auto"
            />
          ) : (
            <h2
              className="font-serif tracking-widest text-sm sm:text-base font-bold uppercase truncate"
              style={{ color: currentTheme.accent }}
            >
              {cafeData.name || 'Café & More'}
            </h2>
          )}
        </div>

        <div className="flex items-center justify-end">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white border shadow-sm"
            style={{ backgroundColor: currentTheme.secondary, borderColor: currentTheme.accent + '60' }}
          >
            <Globe size={13} style={{ color: currentTheme.accent }} />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'ar' | 'fr' | 'en')}
              aria-label={t('language')}
              className="bg-transparent text-white outline-none cursor-pointer font-semibold"
            >
              <option value="ar" style={{ backgroundColor: currentTheme.primary }}>AR</option>
              <option value="fr" style={{ backgroundColor: currentTheme.primary }}>FR</option>
              <option value="en" style={{ backgroundColor: currentTheme.primary }}>EN</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6">
        {!selectedSection ? (
          <div className="space-y-4">
            {sections.map((section) => (
              <div
                key={section.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedSection(section);
                  window.scrollTo({ top: 0 });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedSection(section);
                    window.scrollTo({ top: 0 });
                  }
                }}
                aria-label={localized(section, 'name')}
                className="relative h-36 rounded-2xl overflow-hidden shadow-lg cursor-pointer group border transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ borderColor: currentTheme.border, outlineColor: currentTheme.accent }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70 z-10"></div>
                {section.image_url ? (
                  <img
                    src={section.image_url}
                    alt={localized(section, 'name')}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0" style={{ backgroundColor: currentTheme.primary }}></div>
                )}
                <div className="relative z-20 flex items-center justify-center h-full px-6 text-center">
                  <h3 className="font-serif text-2xl tracking-widest text-white uppercase font-bold drop-shadow-md">
                    {localized(section, 'name')}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-4">
              <h3
                className={`text-2xl font-serif font-bold ${
                  lang === 'ar' ? 'pr-3 border-r-4' : 'pl-3 border-l-4'
                }`}
                style={{ color: currentTheme.primary, borderColor: currentTheme.accent }}
              >
                {localized(selectedSection, 'name')}
              </h3>
            </div>

            {sectionDishes.length === 0 ? (
              <p className="text-center py-12 text-sm" style={{ color: currentTheme.text, opacity: 0.55 }}>
                {t('noDishes')}
              </p>
            ) : (
              sectionDishes.map((dish) => (
                <div
                  key={dish.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedDish(dish)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedDish(dish);
                    }
                  }}
                  aria-label={localized(dish, 'name')}
                  className="rounded-2xl p-3 shadow-sm flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition border focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.border, outlineColor: currentTheme.accent }}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {dish.image_url ? (
                      <img
                        src={dish.image_url}
                        alt={localized(dish, 'name')}
                        loading="lazy"
                        decoding="async"
                        className="w-16 h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-200/20 flex items-center justify-center text-xs flex-shrink-0" style={{ color: currentTheme.text, opacity: 0.5 }}>
                        {t('noImage')}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm truncate" style={{ color: currentTheme.text }}>
                        {localized(dish, 'name')}
                      </h4>
                      <div dir="ltr" className="inline-block mt-0.5">
                        {/* سعر بلون الثيم الأساسي لتباين كافٍ */}
                        <p className="text-xs font-semibold" style={{ color: currentTheme.primary }}>
                          {fmtPrice(dish.price)}
                        </p>
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{ color: currentTheme.text, opacity: 0.6 }}>
                        {localized(dish, 'description')}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-transform ${
                      lang === 'ar' ? 'rotate-180' : ''
                    }`}
                    style={{
                      backgroundColor: currentTheme.secondary + '20',
                      borderColor: currentTheme.border,
                      color: currentTheme.accent,
                    }}
                  >
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* نافذة تفاصيل الطبق — مع كمية + زر إضافة للسلة */}
      {selectedDish && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={localized(selectedDish, 'name')}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDish(null);
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative border flex flex-col max-h-[90vh]"
            style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.border, color: currentTheme.text }}
          >
            <button
              onClick={() => setSelectedDish(null)}
              aria-label={t('close')}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 text-white backdrop-blur-md flex items-center justify-center shadow-md hover:bg-black/70 transition"
            >
              <X size={16} />
            </button>

            {selectedDish.image_url && (
              <div className="relative h-48 w-full bg-gray-100 flex-shrink-0">
                <img
                  src={selectedDish.image_url}
                  alt={localized(selectedDish, 'name')}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-5 overflow-y-auto space-y-3">
              <div className="flex justify-between items-start gap-3">
                <h3 className="font-serif text-xl font-bold leading-tight" style={{ color: currentTheme.primary }}>
                  {localized(selectedDish, 'name')}
                </h3>
                {/* تباين مضبوط: خلفية primary + نص أبيض */}
                <span
                  dir="ltr"
                  className="font-extrabold text-sm px-3.5 py-1 rounded-xl shadow-sm whitespace-nowrap flex-shrink-0 inline-flex items-center justify-center"
                  style={{ backgroundColor: currentTheme.primary, color: '#ffffff' }}
                >
                  {fmtPrice(selectedDish.price)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {/* نجوم بلون الثيم + نصف نجمة دقيقة */}
                <StarRating rating={Number(selectedDish.rating) || 4.5} color={currentTheme.accent} />
                <span style={{ color: currentTheme.text, opacity: 0.6 }}>
                  {(Number(selectedDish.rating) || 4.5).toFixed(1)} (128)
                </span>
              </div>

              <p className="text-[13px] leading-relaxed pt-1" style={{ color: currentTheme.text, opacity: 0.75 }}>
                {localized(selectedDish, 'description') ||
                  (lang === 'ar'
                    ? 'تحضير لذيذ بمكونات طازجة وممتازة.'
                    : lang === 'fr'
                      ? 'Délicieuse préparation culinaire à base d’ingrédients frais et premium.'
                      : 'Delicious culinary preparation crafted with fresh premium ingredients.')}
              </p>

              {/* CTA: منتقي كمية + زر إضافة للسلة */}
              <div className="flex items-center gap-3 pt-2">
                <div
                  className="flex items-center gap-2 rounded-full border px-2 py-1"
                  style={{ borderColor: currentTheme.border }}
                >
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    aria-label="−"
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold hover:opacity-70"
                  >
                    −
                  </button>
                  <span className="font-bold text-sm w-5 text-center">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    aria-label="+"
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold hover:opacity-70"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => addToCart(selectedDish, qty)}
                  className="flex-1 rounded-full py-2.5 font-bold text-sm transition hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: currentTheme.primary, color: '#ffffff' }}
                >
                  {t('addToCart')} — {fmtPrice(Number(selectedDish.price) * qty)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* زر السلة العائم مع عدّاد */}
      {cart.length > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          aria-label={t('cart')}
          className="fixed bottom-24 left-4 z-[35] w-12 h-12 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition border-2 cursor-pointer"
          style={{ backgroundColor: currentTheme.primary, borderColor: currentTheme.accent, color: currentTheme.accent }}
        >
          <ShoppingCart size={20} />
          <span
            className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ backgroundColor: currentTheme.accent, color: currentTheme.primary }}
          >
            {cartCount}
          </span>
        </button>
      )}

      {/* نافذة السلة */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t('cart')}
          onClick={(e) => {
            if (e.target === e.currentTarget) setCartOpen(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl shadow-2xl border flex flex-col max-h-[85vh]"
            style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.border, color: currentTheme.text }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: currentTheme.border }}>
              <h3 className="font-serif text-lg font-bold" style={{ color: currentTheme.primary }}>
                {t('cart')}
              </h3>
              <button
                onClick={() => setCartOpen(false)}
                aria-label={t('close')}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-1">
              {cart.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: currentTheme.text, opacity: 0.55 }}>
                  {t('cartEmpty')}
                </p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.dish.id}
                    className="flex items-center gap-3 py-2 border-b"
                    style={{ borderColor: currentTheme.border }}
                  >
                    {item.dish.image_url ? (
                      <img
                        src={item.dish.image_url}
                        alt={localized(item.dish, 'name')}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xs flex-shrink-0" style={{ backgroundColor: currentTheme.secondary + '20', color: currentTheme.text, opacity: 0.6 }}>
                        {t('noImage')}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{localized(item.dish, 'name')}</p>
                      <p className="text-xs" style={{ color: currentTheme.primary }}>
                        {fmtPrice(Number(item.dish.price) * item.qty)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => adjustCartQty(item.dish.id, -1)}
                        aria-label="−"
                        className="w-6 h-6 rounded-full flex items-center justify-center font-bold hover:opacity-70"
                        style={{ backgroundColor: currentTheme.secondary + '20' }}
                      >
                        −
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
                      <button
                        onClick={() => adjustCartQty(item.dish.id, 1)}
                        aria-label="+"
                        className="w-6 h-6 rounded-full flex items-center justify-center font-bold hover:opacity-70"
                        style={{ backgroundColor: currentTheme.secondary + '20' }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.dish.id)}
                      aria-label={t('remove')}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-70 transition"
                      style={{ color: currentTheme.text, opacity: 0.6 }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t space-y-3" style={{ borderColor: currentTheme.border }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{t('total')}</span>
                  <span className="font-extrabold" style={{ color: currentTheme.primary }}>
                    {fmtPrice(cartTotal)}
                  </span>
                </div>
                <button
                  onClick={placeOrder}
                  className="w-full rounded-full py-3 font-bold text-sm transition hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: currentTheme.primary, color: '#ffffff' }}
                >
                  {t('placeOrder')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* زر استدعاء النادل — مع فترة انتظار ظاهرة */}
      <button
        onClick={openWaiterConfirm}
        disabled={waiterLoading || cooldownLeft > 0}
        aria-label={t('waiterCall')}
        className="fixed bottom-24 right-4 z-[35] w-12 h-12 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition border-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        style={{ backgroundColor: currentTheme.primary, borderColor: currentTheme.accent, color: currentTheme.accent }}
      >
        <Bell size={20} />
        {cooldownLeft > 0 && (
          <span
            className="absolute -top-1 -left-1 min-w-5 h-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ backgroundColor: currentTheme.accent, color: currentTheme.primary }}
          >
            {cooldownLeft}s
          </span>
        )}
      </button>

      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="p-6 rounded-2xl max-w-xs w-full text-center shadow-2xl" style={{ backgroundColor: currentTheme.cardBg }}>
            <p className="text-base font-bold mb-5" style={{ color: currentTheme.text }}>
              {confirmMode === 'waiter' ? t('confirmQuestion') : t('orderConfirm')}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition hover:opacity-80"
                style={{ backgroundColor: currentTheme.secondary + '20', color: currentTheme.text }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSendWaiterCall}
                disabled={waiterLoading}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer transition hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: currentTheme.primary }}
              >
                {waiterLoading ? '…' : t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isResultOpen && (
        <div
          className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="p-6 rounded-2xl max-w-xs w-full text-center shadow-2xl" style={{ backgroundColor: currentTheme.cardBg }}>
            <p className="text-base font-bold mb-5" style={{ color: currentTheme.text }}>
              {resultMessage}
            </p>
            <button
              onClick={() => setIsResultOpen(false)}
              className="px-6 py-2 rounded-xl text-sm font-bold text-white cursor-pointer transition hover:opacity-90"
              style={{ backgroundColor: currentTheme.primary }}
            >
              {t('ok')}
            </button>
          </div>
        </div>
      )}

      <footer
        className="fixed bottom-0 left-0 right-0 z-30 py-3 px-6 flex justify-around items-center border-t transition-colors duration-500 shadow-lg"
        style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.border }}
      >
        <a
          href="https://www.google.com/search?q=bo+passage+avis"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1.5 group"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
            style={{ backgroundColor: currentTheme.primary, color: currentTheme.accent }}
          >
            <span className="font-bold text-base font-serif" style={{ color: currentTheme.accent }}>
              G
            </span>
          </div>
          <span className="text-[11px] font-bold" style={{ color: currentTheme.text }}>
            {t('reviews')}
          </span>
        </a>

        <a
          href="https://www.instagram.com/bo.passage"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1.5 group"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
            style={{ backgroundColor: currentTheme.primary, color: currentTheme.accent }}
          >
            <Share2 size={18} />
          </div>
          <span className="text-[11px] font-bold" style={{ color: currentTheme.text }}>
            Instagram
          </span>
        </a>

        <a
          href="https://www.google.com/maps/dir//30.401142266885284,-9.585476741194725"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1.5 group"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
            style={{ backgroundColor: currentTheme.primary, color: currentTheme.accent }}
          >
            <MapPin size={18} />
          </div>
          <span className="text-[11px] font-bold" style={{ color: currentTheme.text }}>
            {t('findUs')}
          </span>
        </a>
      </footer>
    </div>
  );
}

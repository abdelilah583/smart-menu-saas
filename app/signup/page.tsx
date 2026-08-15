'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Utensils, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey); // بدون await

export default function ResetPasswordPage() {
  const [checking, setChecking] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // عند الوصول عبر رابط البريد توجد جلسة استعادة (recovery session)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setInvalid(true);
      }
      setChecking(false);
    });
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError('حدث خطأ أثناء تحديث كلمة المرور، حاول مرة أخرى.');
      return;
    }

    // إنهاء جلسة الاستعادة ثم توجيه المستخدم لتسجيل الدخول
    await supabase.auth.signOut();
    setDone(true);
  }

  if (checking) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3">
            <Utensils size={22} />
          </div>
          <Loader2 size={20} className="animate-spin text-blue-600 mx-auto" />
        </div>
      </div>
    );
  }

  if (invalid) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h1 className="text-lg font-bold text-slate-800 mb-2">الرابط غير صالح</h1>
          <p className="text-sm text-slate-500">
            رابط إعادة التعيين غير صالح أو منتهي الصلاحية. اطلب رابطاً جديداً من صفحة تسجيل الدخول.
          </p>
          <a
            href="/login"
            className="inline-block mt-6 text-sm text-blue-600 font-medium hover:underline"
          >
            العودة إلى تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={24} />
          </div>
          <h1 className="text-lg font-bold text-slate-800 mb-2">تم تحديث كلمة المرور</h1>
          <p className="text-sm text-slate-500">
            يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
          </p>
          <a
            href="/login"
            className="inline-block mt-6 w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            الذهاب إلى تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3">
            <Lock size={22} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">كلمة مرور جديدة</h1>
          <p className="text-sm text-slate-400 mt-1">
            اختر كلمة مرور جديدة لحسابك
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">كلمة المرور الجديدة</label>
            <div className="relative">
              <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 أحرف على الأقل"
                className="w-full border rounded-lg pr-10 pl-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">تأكيد كلمة المرور</label>
            <div className="relative">
              <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border rounded-lg pr-10 pl-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
          </button>
        </form>
      </div>
    </div>
  );
}

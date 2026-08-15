'use client';
import { supabase } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// تهيئة عميل Supabas

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // تسجيل الدخول باستخدام Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // توجيه صاحب المطعم إلى لوحة التحكم بعد نجاح الدخول
      router.push('/dashboard'); 
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">تسجيل دخول صاحب المطعم</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@domain.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            {loading ? 'جاري تسجيل الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
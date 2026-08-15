import { redirect } from 'next/navigation';

// الصفحة الرئيسية: تحويل الزائر إلى تسجيل الدخول مباشرة.
// (صفحة /login نفسها تعيد المستخدم المسجل إلى /dashboard تلقائياً)
export default function Home() {
  redirect('/login');
}
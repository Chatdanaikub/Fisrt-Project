import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl font-black text-indigo-600 mb-4 shadow-sm">
        404
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">ไม่พบหน้าที่คุณต้องการ</h1>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        เส้นทางที่คุณเรียกใช้งานไม่มีอยู่ในระบบ Route ของแอปพลิเคชัน
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20"
      >
        กลับสู่หน้าหลัก 🏠
      </Link>
    </div>
  );
}

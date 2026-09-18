import { Link } from 'react-router-dom';

export default function Home() {
  const pages = [
    {
      to: '/page2',
      tag: 'Page 2',
      title: 'Cyber Strike (3D FPS Combat)',
      desc: 'เกมยิงมุมมองบุคคลที่หนึ่ง 3D Cyberpunk สู้กับบอท AI เดิน ยิง เล็ง Headshot พร้อมระบบเสียง Web Audio API และปุ่มควบคุมบนมือถือ',
      badge: 'FPS Combat',
      gradient: 'from-rose-500 to-red-600',
      tagColor: 'bg-red-50 text-red-700 border-red-200',
      btnColor: 'bg-red-600 hover:bg-red-700 text-white',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8 3.5c-.28-3.95-3.55-7.22-7.5-7.5V2h-1v2c-3.95.28-7.22 3.55-7.5 7.5H2v1h2c.28 3.95 3.55 7.22 7.5 7.5v2h1v-2c3.95-.28 7.22-3.55 7.5-7.5h2v-1h-2z" />
        </svg>
      ),
    },
    {
      to: '/page3',
      tag: 'Page 3',
      title: 'Turbo Drift Racer (Car Racing)',
      desc: 'เกมแข่งรถความเร็วสูง Grand Prix 3 รอบสนาม แข่งพร้อมบอท AI 4 คัน หลบหลีกคู่แข่ง ใช้ไนโตรเร่งแซง ดริฟต์เข้าเส้นชัยคว้าแชมป์',
      badge: 'Grand Prix',
      gradient: 'from-amber-500 to-orange-600',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
      btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      to: '/page4',
      tag: 'Page 4',
      title: 'Titanium 16 Pro (3D Scroll Showcase)',
      desc: 'หน้าต่างเว็บแบบเลื่อนแล้วโมเดล 3D หมุนตามการ Scroll แบบ Apple Cinematic สำรวจทุกมุมมอง แยกชิ้นส่วนชิป X-Ray พร้อมเปลี่ยนสีตัวเครื่องแบบเรียลไทม์',
      badge: '3D Showcase',
      gradient: 'from-cyan-500 to-indigo-600',
      tagColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      btnColor: 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-10 animate-fadeIn py-4">
      {/* Signature Welcome Card from napolgtr/reactpwa Template */}
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-gray-200/80 p-8 sm:p-12 text-center mx-auto transition-all hover:shadow-md">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
          Welcome to IG342
        </h2>
        <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          เว็บแอปพลิเคชัน Single Page Application (SPA) รองรับการสลับหน้าจอด้วย React Router — Workshop 5-1
        </p>

        <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
          ผู้จัดทำ: ฉัตรดนัย สัตยากูล (รหัส 66111059)
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/page4"
            className="bg-gradient-to-r from-cyan-600 to-indigo-600 text-white px-7 py-3 rounded-full font-semibold hover:from-cyan-700 hover:to-indigo-700 transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
          >
            <span>✨</span>
            <span>ดูโมเดล 3D หมุนตาม Scroll (Page 4)</span>
          </Link>
          <Link
            to="/page2"
            className="bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
          >
            <span>🎮</span>
            <span>เล่นเกมยิงปืน FPS (Page 2)</span>
          </Link>
          <Link
            to="/page3"
            className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
          >
            <span>🏎️</span>
            <span>เล่นเกมแข่งรถ (Page 3)</span>
          </Link>
        </div>
      </div>

      {/* Overview Cards Grid for Page 2 & Page 3 */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              หน้าจอเกมที่เปิดให้บริการ (Mapped Routes)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              คลิกเพื่อนำทางไปยังหน้าจอแต่ละหน้าผ่าน React Router โดยไม่ต้องโหลดหน้าเว็บใหม่
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
            SPA Routing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pages.map((card) => (
            <div
              key={card.to}
              className="group bg-white rounded-2xl border border-gray-200/80 hover:border-indigo-400 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.gradient} flex items-center justify-center shadow-md`}>
                    {card.icon}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${card.tagColor}`}>
                    {card.badge}
                  </span>
                </div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                  {card.tag}
                </div>
                <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {card.title}
                </h4>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="p-6 pt-0 border-t border-gray-100 mt-4">
                <Link
                  to={card.to}
                  className={`w-full mt-4 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm ${card.btnColor}`}
                >
                  เข้าสู่ {card.tag}
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

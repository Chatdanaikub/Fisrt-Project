import { useState } from 'react';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import Home from './pages/home';
import Page2 from './pages/page2';
import Page3 from './pages/page3';
import Page4 from './pages/page4';
import NotFound from './pages/notfound';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isShowcase = location.pathname === '/page4';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      {/* Header matching original napolgtr/reactpwa template */}
      <header className="bg-white border-b border-gray-200 py-4 sm:py-6 px-4 sm:px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-indigo-600 hover:text-indigo-700 transition">
              <img src="/logo.svg" alt="App Logo" className="w-8 h-8 rounded-lg shadow-sm" />
              <span>ไม่บอกหลอก</span>
            </Link>
            <span className="hidden sm:inline-block text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
              ฉัตรดนัย สัตยากูล 66111059
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `transition py-1 ${
                  isActive
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'hover:text-indigo-500'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/page2"
              className={({ isActive }) =>
                `transition py-1 ${
                  isActive
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'hover:text-indigo-500'
                }`
              }
            >
              Page 2 (FPS Game)
            </NavLink>
            <NavLink
              to="/page3"
              className={({ isActive }) =>
                `transition py-1 ${
                  isActive
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'hover:text-indigo-500'
                }`
              }
            >
              Page 3 (Car Racing)
            </NavLink>
            <NavLink
              to="/page4"
              className={({ isActive }) =>
                `transition py-1 ${
                  isActive
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'hover:text-indigo-500'
                }`
              }
            >
              Page 4 (3D Showcase)
            </NavLink>
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-100 transition focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 px-2 border-t border-gray-100 mt-3 space-y-1">
            <div className="px-3 py-1.5 mb-2 text-xs font-medium text-gray-500 bg-gray-50 rounded-lg">
              ผู้จัดทำ: ฉัตรดนัย สัตยากูล (66111059)
            </div>
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-base font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/page2"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-base font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`
              }
            >
              Page 2 (FPS Game)
            </NavLink>
            <NavLink
              to="/page3"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-base font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`
              }
            >
              Page 3 (Car Racing)
            </NavLink>
            <NavLink
              to="/page4"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-base font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`
              }
            >
              Page 4 (3D Showcase)
            </NavLink>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className={`flex-grow flex flex-col justify-center w-full ${isShowcase ? 'p-0 max-w-none' : 'p-4 sm:p-8 max-w-7xl mx-auto'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/page2" element={<Page2 />} />
          <Route path="/page3" element={<Page3 />} />
          <Route path="/page4" element={<Page4 />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer matching original template */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1">
          <p className="text-sm text-gray-400 uppercase tracking-widest">
            Copyright 2026 DPU
          </p>
          <p className="text-xs text-gray-400">
            ฉัตรดนัย สัตยากูล • รหัสนักศึกษา 66111059
          </p>
        </div>
      </footer>
    </div>
  );
}
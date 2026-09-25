import React, { useState, useEffect } from 'react';
import { db } from '../components/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';

export default function Week7() {
  const [activeTab, setActiveTab] = useState('both'); // 'both', 'indexeddb', 'localstorage', 'inspector'

  // ==========================================
  // ส่วนที่ 1: IndexedDB (Dexie) ตามสไลด์หน้า 7-12
  // ==========================================
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [dbNotification, setDbNotification] = useState('');

  // ดึงข้อมูลสินค้าแบบ Real-time ด้วย useLiveQuery จาก Dexie
  const items = useLiveQuery(() => db.items.toArray(), []);

  // ฟังก์ชันเพิ่มสินค้าลงใน IndexedDB (สไลด์หน้า 10)
  const addItem = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showDbNotice('⚠️ กรุณาระบุชื่อสินค้า');
      return;
    }
    try {
      await db.items.add({
        name: name.trim(),
        quantity: Number(quantity) || 0,
      });
      setName('');
      setQuantity(0);
      showDbNotice('✅ บันทึกสินค้าลงใน IndexedDB สำเร็จแล้ว!');
    } catch (err) {
      console.error('Error adding item:', err);
      showDbNotice('❌ เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  // ฟังก์ชันลบสินค้าออกจาก IndexedDB (สไลด์หน้า 10)
  const deleteItem = async (id) => {
    try {
      await db.items.delete(id);
      showDbNotice('🗑️ ลบสินค้าออกจาก IndexedDB แล้ว');
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  // ฟังก์ชันปรับจำนวนสินค้า เพิ่ม/ลด
  const updateQuantity = async (id, currentQty, delta) => {
    const newQty = Math.max(0, currentQty + delta);
    try {
      await db.items.update(id, { quantity: newQty });
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  // ฟังก์ชันล้างสินค้าทั้งหมดใน IndexedDB
  const clearAllItems = async () => {
    if (window.confirm('คุณต้องการลบรายการสินค้าทั้งหมดใน IndexedDB หรือไม่?')) {
      await db.items.clear();
      showDbNotice('🧹 เคลียร์รายการสินค้าทั้งหมดใน IndexedDB เรียบร้อย');
    }
  };

  // เพิ่มข้อมูลตัวอย่างสินค้าเพื่อการทดสอบ
  const addSampleItems = async () => {
    const samples = [
      { name: 'MacBook Air M3', quantity: 5 },
      { name: 'Logitech MX Master 3S', quantity: 12 },
      { name: 'Keychron K2 Wireless Keyboard', quantity: 8 },
      { name: 'Sony WH-1000XM5 Headphones', quantity: 3 }
    ];
    for (const item of samples) {
      await db.items.add(item);
    }
    showDbNotice('✨ เพิ่มชุดข้อมูลสินค้าตัวอย่างเรียบร้อยแล้ว');
  };

  const showDbNotice = (msg) => {
    setDbNotification(msg);
    setTimeout(() => setDbNotification(''), 3000);
  };

  // ==========================================
  // ส่วนที่ 2: Local Storage (myTask) ตามสไลด์หน้า 4-5
  // ==========================================
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState('all'); // 'all', 'active', 'completed'
  const [taskCategory, setTaskCategory] = useState('งานเรียน');
  const [lsNotification, setLsNotification] = useState('');

  // โหลดข้อมูล tasks จาก Local Storage เมื่อ Component โหลดครั้งแรก (สไลด์หน้า 5)
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (e) {
        console.error('Error parsing stored tasks:', e);
      }
    } else {
      // ค่าเริ่มต้นถ้ายังไม่มี
      const defaultTasks = [
        { text: 'ศึกษาเรื่อง Local Storage vs IndexedDB (Week 7)', done: true, category: 'งานเรียน' },
        { text: 'ติดตั้ง dexie และ dexie-react-hooks', done: true, category: 'งานเรียน' },
        { text: 'สร้าง db.js และเชื่อมต่อฐานข้อมูล InventoryDatabase', done: true, category: 'โปรเจกต์' },
        { text: 'ส่งงาน Week 7 URL บน Google Classroom', done: false, category: 'การบ้าน' }
      ];
      setTasks(defaultTasks);
      localStorage.setItem('tasks', JSON.stringify(defaultTasks));
    }
  }, []);

  // บันทึก tasks ลงใน Local Storage ทุกครั้งที่ tasks มีการเปลี่ยนแปลง (สไลด์หน้า 5)
  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem('tasks') !== null) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // ฟังก์ชันเพิ่ม Task ใหม่ (สไลด์หน้า 5)
  const addTask = (e) => {
    if (e) e.preventDefault();
    if (task.trim() === '') return;
    const newTask = {
      text: task.trim(),
      done: false,
      category: taskCategory,
      createdAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };
    setTasks([...tasks, newTask]);
    setTask('');
    showLsNotice('💾 บันทึกงานลงใน Local Storage เรียบร้อย');
  };

  // ฟังก์ชันสลับสถานะ Done / Not Done (สไลด์หน้า 5)
  const toggleTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].done = !newTasks[index].done;
    setTasks(newTasks);
  };

  // ฟังก์ชันลบ Task
  const deleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
    showLsNotice('🗑️ ลบงานออกจาก Local Storage แล้ว');
  };

  // ล้างงานที่ทำเสร็จแล้ว
  const clearCompletedTasks = () => {
    const remaining = tasks.filter(t => !t.done);
    setTasks(remaining);
    showLsNotice('🧹 ล้างงานที่ทำเสร็จแล้วเรียบร้อย');
  };

  const showLsNotice = (msg) => {
    setLsNotification(msg);
    setTimeout(() => setLsNotification(''), 3000);
  };

  // ฟิลเตอร์งาน
  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'active') return !t.done;
    if (taskFilter === 'completed') return t.done;
    return true;
  });

  // คำนวณสถิติ
  const totalItemCount = items ? items.length : 0;
  const totalQuantity = items ? items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) : 0;
  const completedTasksCount = tasks.filter(t => t.done).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 px-3 sm:px-6 animate-fadeIn">
      {/* ส่วนหัวหน้าเว็บ Workshop Week 7 */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              IG342 การพัฒนาแอปพลิเคชันบนอุปกรณ์เคลื่อนที่ • Week 7
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Local Storage & IndexedDB (Dexie)
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              การพัฒนาระบบจัดเก็บข้อมูลถาวรภายในเว็บเบราว์เซอร์ของผู้ใช้ รองรับ PWA ทำงานได้แม้ออฟไลน์ โดยไม่ต้องพึ่งพาเซิร์ฟเวอร์
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-blue-200">
              <span className="bg-black/20 px-3 py-1 rounded-lg">อาจารย์ผู้สอน: อ.ณพล ศิริภิบาล</span>
              <span className="bg-black/20 px-3 py-1 rounded-lg">ผู้จัดทำ: ฉัตรดนัย สัตยากูล (66111059)</span>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-2 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-center min-w-[120px]">
              <div className="text-2xl font-black text-amber-300">{tasks.length}</div>
              <div className="text-xs text-blue-100">Tasks ใน LocalStorage</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-center min-w-[120px]">
              <div className="text-2xl font-black text-cyan-300">{totalItemCount}</div>
              <div className="text-xs text-blue-100">Items ใน IndexedDB</div>
            </div>
          </div>
        </div>

        {/* เมนูแท็บเพื่อสลับดูการทำงาน */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/15 pt-5">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'both'
                ? 'bg-white text-indigo-700 shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            📊 แสดงทั้ง 2 ระบบพร้อมกัน
          </button>
          <button
            onClick={() => setActiveTab('indexeddb')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'indexeddb'
                ? 'bg-white text-indigo-700 shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🗄️ IndexedDB Inventory (Dexie)
          </button>
          <button
            onClick={() => setActiveTab('localstorage')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'localstorage'
                ? 'bg-white text-indigo-700 shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            📋 Local Storage (myTask)
          </button>
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'inspector'
                ? 'bg-white text-indigo-700 shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🔍 Storage Inspector & F12 Guide
          </button>
        </div>
      </div>

      {/* Grid เนื้อหาหลัก */}
      <div className={`grid gap-8 ${activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* ======================================================= */}
        {/* ส่วนที่ 1: IndexedDB - InventoryDatabase (สไลด์หน้า 7-12) */}
        {/* ======================================================= */}
        {(activeTab === 'both' || activeTab === 'indexeddb') && (
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-2xl shadow-inner">
                    📦
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-blue-700">
                      Inventory (IndexedDB)
                    </h2>
                    <p className="text-xs text-gray-500">
                      Dexie.js • Table: items (auto-increment id)
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  สไลด์ 7-12
                </span>
              </div>

              {/* ข้อความแจ้งเตือนสถานะ */}
              {dbNotification && (
                <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium animate-fadeIn">
                  {dbNotification}
                </div>
              )}

              {/* แบบฟอร์มเพิ่มสินค้า ตามสไลด์หน้า 11 */}
              <form onSubmit={addItem} className="space-y-3 mb-6 bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200/70 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    เพิ่มสินค้าใหม่ลงฐานข้อมูล
                  </label>
                  <span className="text-[11px] text-gray-400">
                    db.items.add()
                  </span>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="ชื่อสินค้า"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <input
                    type="number"
                    placeholder="จำนวน"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium p-2.5 rounded-xl shadow-sm hover:shadow transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  บันทึกลง Browser
                </button>
              </form>

              {/* แถบสถิติและการจัดการเพิ่มเติม */}
              <div className="flex items-center justify-between mb-3 px-1 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">รายการในคลัง:</span>
                  <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-200">
                    {totalItemCount} รายการ ({totalQuantity} ชิ้น)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={addSampleItems}
                    className="text-blue-600 hover:text-blue-800 font-medium underline text-xs"
                    title="ใส่ข้อมูลตัวอย่างสำหรับการทดสอบ"
                  >
                    + ตัวอย่าง
                  </button>
                  {totalItemCount > 0 && (
                    <button
                      onClick={clearAllItems}
                      className="text-red-500 hover:text-red-700 font-medium text-xs ml-2"
                    >
                      ล้างทั้งหมด
                    </button>
                  )}
                </div>
              </div>

              {/* รายการสินค้าที่ดึงมาจาก IndexedDB ด้วย useLiveQuery (สไลด์หน้า 11) */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {items && items.length > 0 ? (
                  items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-center bg-white border border-gray-200/90 p-3.5 rounded-xl shadow-sm hover:border-blue-300 transition list-none group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-500 text-xs font-mono flex items-center justify-center">
                          #{item.id}
                        </span>
                        <div>
                          <span className="font-medium text-gray-900 block sm:inline">
                            {item.name}
                          </span>
                          <span className="ml-1.5 inline-block text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                            จำนวน: {item.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* ปุ่มปรับจำนวนเร็ว */}
                        <div className="hidden sm:flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity, -1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-200 text-xs"
                            title="ลดจำนวน 1"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-mono text-gray-700">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity, 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-200 text-xs"
                            title="เพิ่มจำนวน 1"
                          >
                            +
                          </button>
                        </div>

                        {/* ปุ่มลบตามสไลด์หน้า 11 */}
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium px-2.5 py-1 rounded-lg hover:bg-red-50 transition border border-transparent hover:border-red-200"
                        >
                          ลบ
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-400">
                    <p className="text-3xl mb-2">📦</p>
                    <p className="text-sm font-medium">ยังไม่มีสินค้าใน IndexedDB</p>
                    <p className="text-xs text-gray-400 mt-1">พิมพ์ชื่อและจำนวนด้านบน แล้วคลิก "บันทึกลง Browser"</p>
                    <button
                      onClick={addSampleItems}
                      className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs rounded-lg font-semibold hover:bg-blue-100 transition"
                    >
                      + ใส่สินค้าตัวอย่างทันที
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* โค้ดสรุปคำสั่งที่ใช้งาน */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-500 space-y-1 bg-gray-50/50 p-3 rounded-xl">
              <div className="font-semibold text-gray-700">คำสั่ง Dexie API ที่ใช้ในส่วนนี้:</div>
              <div className="font-mono text-blue-600">• db.items.toArray() — ดึงข้อมูลทั้งหมด</div>
              <div className="font-mono text-emerald-600">• db.items.add({'{ name, quantity }'}) — เพิ่มรายการ</div>
              <div className="font-mono text-rose-600">• db.items.delete(id) — ลบรายการตาม ID</div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* ส่วนที่ 2: Local Storage - myTask (สไลด์หน้า 4-5) */}
        {/* ======================================================= */}
        {(activeTab === 'both' || activeTab === 'localstorage') && (
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 text-2xl shadow-inner">
                    📝
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-amber-700">
                      myTask (Local Storage)
                    </h2>
                    <p className="text-xs text-gray-500">
                      localStorage.getItem("tasks") & setItem()
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  สไลด์ 4-5
                </span>
              </div>

              {/* ข้อความแจ้งเตือนสถานะ */}
              {lsNotification && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium animate-fadeIn">
                  {lsNotification}
                </div>
              )}

              {/* แบบฟอร์มเพิ่มงาน myTask ตามสไลด์หน้า 5 */}
              <form onSubmit={addTask} className="space-y-3 mb-6 bg-amber-50/40 p-4 sm:p-5 rounded-2xl border border-amber-200/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    เพิ่มสิ่งที่ต้องทำ (To-Do Task)
                  </label>
                  <span className="text-[11px] text-gray-400">
                    localStorage.setItem()
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="พิมพ์ชื่องานที่ต้องทำ..."
                    className="flex-grow p-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                  />
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="p-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-700 focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="งานเรียน">📚 งานเรียน</option>
                    <option value="การบ้าน">✏️ การบ้าน</option>
                    <option value="โปรเจกต์">💻 โปรเจกต์</option>
                    <option value="ทั่วไป">⭐ ทั่วไป</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium p-2.5 rounded-xl shadow-sm hover:shadow transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  บันทึกลง Local Storage
                </button>
              </form>

              {/* แถบตัวกรองสถานะงาน */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1 text-xs">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setTaskFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      taskFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    ทั้งหมด ({tasks.length})
                  </button>
                  <button
                    onClick={() => setTaskFilter('active')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      taskFilter === 'active' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    ยังไม่เสร็จ ({tasks.length - completedTasksCount})
                  </button>
                  <button
                    onClick={() => setTaskFilter('completed')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      taskFilter === 'completed' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    เสร็จแล้ว ({completedTasksCount})
                  </button>
                </div>

                {completedTasksCount > 0 && (
                  <button
                    onClick={clearCompletedTasks}
                    className="text-red-500 hover:text-red-700 font-medium text-xs underline"
                  >
                    ล้างงานที่เสร็จแล้ว
                  </button>
                )}
              </div>

              {/* รายการ myTask จาก Local Storage (สไลด์หน้า 5) */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((t, idx) => {
                    const originalIndex = tasks.findIndex(item => item === t);
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                          t.done
                            ? 'bg-gray-50/80 border-gray-200 text-gray-400'
                            : 'bg-white border-gray-200/90 hover:border-amber-300 shadow-sm text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={t.done}
                            onChange={() => toggleTask(originalIndex !== -1 ? originalIndex : idx)}
                            className="w-5 h-5 text-amber-600 rounded-md border-gray-300 focus:ring-amber-500 cursor-pointer"
                          />
                          <div className="truncate">
                            <span className={`text-sm block truncate ${t.done ? 'line-through text-gray-400' : 'font-medium'}`}>
                              {t.text}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {t.category && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                                  {t.category}
                                </span>
                              )}
                              {t.createdAt && (
                                <span className="text-[10px] text-gray-400">
                                  บันทึก: {t.createdAt}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteTask(originalIndex !== -1 ? originalIndex : idx)}
                          className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition shrink-0 ml-2"
                          title="ลบงานนี้"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-400">
                    <p className="text-3xl mb-2">📋</p>
                    <p className="text-sm font-medium">ไม่มีรายการงานในตัวกรองนี้</p>
                    <p className="text-xs text-gray-400 mt-1">พิมพ์ชื่องานและคลิก "บันทึกลง Local Storage"</p>
                  </div>
                )}
              </div>
            </div>

            {/* โค้ดสรุป LocalStorage API */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-500 space-y-1 bg-gray-50/50 p-3 rounded-xl">
              <div className="font-semibold text-gray-700">คำสั่ง Local Storage API ที่ใช้ในส่วนนี้:</div>
              <div className="font-mono text-amber-700">• JSON.parse(localStorage.getItem("tasks")) — โหลดข้อมูล</div>
              <div className="font-mono text-indigo-600">• localStorage.setItem("tasks", JSON.stringify(tasks)) — เซฟข้อมูล</div>
            </div>
          </div>
        )}

      </div>

      {/* ======================================================= */}
      {/* ส่วนที่ 3: Storage Inspector & การตรวจงานผ่าน F12 (สไลด์หน้า 12) */}
      {/* ======================================================= */}
      {(activeTab === 'both' || activeTab === 'inspector') && (
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-1">
                Developer Tools Inspection
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Storage Inspector & วิธีเปิดดูข้อมูลในเบราว์เซอร์ (ตามสไลด์หน้า 12)
              </h3>
              <p className="text-xs text-gray-500">
                ตรวจสอบข้อมูลดิบที่ถูกบันทึกลงจริงใน Local Storage และ IndexedDB
              </p>
            </div>
          </div>

          {/* เปรียบเทียบความแตกต่างระหว่าง 2 เทคโนโลยี (สไลด์ 2, 3, 6) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-sm mb-2">
                <span>📁</span> Local Storage (สไลด์หน้า 3)
              </div>
              <ul className="text-xs text-amber-800 space-y-1.5 list-disc pl-4">
                <li><strong>ขนาดความจุ:</strong> ประมาณ ~5 MB ต่อโดเมน</li>
                <li><strong>รูปแบบข้อมูล:</strong> เก็บเป็น Key-Value String เท่านั้น (ต้องแปลงด้วย JSON.stringify / JSON.parse)</li>
                <li><strong>การทำงาน:</strong> Synchronous (ทำงานแบบ Blocking เล็กน้อย)</li>
                <li><strong>การใช้งานที่เหมาะสม:</strong> การตั้งค่า (Theme, Token, ข้อมูลการล็อกอิน, To-Do list ขนาดเล็ก)</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
              <div className="flex items-center gap-2 font-bold text-blue-900 text-sm mb-2">
                <span>🗄️</span> IndexedDB (Dexie) (สไลด์หน้า 6)
              </div>
              <ul className="text-xs text-blue-800 space-y-1.5 list-disc pl-4">
                <li><strong>ขนาดความจุ:</strong> หลายร้อย MB ถึง GB (อิงตามพื้นที่ฮาร์ดดิสก์)</li>
                <li><strong>รูปแบบข้อมูล:</strong> Object, Array, Blob, รูปภาพ, วิดีโอ มี Index ค้นหาเร็ว</li>
                <li><strong>การทำงาน:</strong> Asynchronous (Non-blocking ผ่าน Promise / Dexie API)</li>
                <li><strong>การใช้งานที่เหมาะสม:</strong> ระบบคลังสินค้า (Inventory), แคชไฟล์ขนาดใหญ่, ข้อมูล PWA ออฟไลน์</li>
              </ul>
            </div>
          </div>

          {/* กล่องแสดงข้อมูลดิบ (Live Raw Data) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Raw LocalStorage */}
            <div className="border border-gray-200 rounded-2xl p-4 bg-gray-900 text-gray-100 font-mono text-xs">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-800 text-gray-400">
                <span>🔑 localStorage.getItem("tasks")</span>
                <span className="text-[10px] text-amber-400">{tasks.length} items</span>
              </div>
              <pre className="max-h-48 overflow-y-auto text-emerald-400 whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(tasks, null, 2)}
              </pre>
            </div>

            {/* Raw IndexedDB */}
            <div className="border border-gray-200 rounded-2xl p-4 bg-gray-900 text-gray-100 font-mono text-xs">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-800 text-gray-400">
                <span>🗄️ IndexedDB: InventoryDatabase.items</span>
                <span className="text-[10px] text-cyan-400">{items ? items.length : 0} items</span>
              </div>
              <pre className="max-h-48 overflow-y-auto text-cyan-400 whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(items || [], null, 2)}
              </pre>
            </div>
          </div>

          {/* แนะนำขั้นตอนการเปิด DevTools ตรวจงานตามหน้า 12 ของอาจารย์ */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
            <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2 mb-2">
              <span>💡</span> ขั้นตอนการตรวจสอบใน Google Chrome DevTools (ตรงตามสไลด์หน้า 12):
            </h4>
            <ol className="text-xs text-indigo-900 space-y-1.5 list-decimal pl-5">
              <li>กดปุ่ม <kbd className="px-1.5 py-0.5 bg-white rounded border border-indigo-200 font-mono text-[11px] shadow-sm">F12</kbd> หรือคลิกขวาที่หน้าเว็บแล้วเลือก <strong>Inspect (ตรวจสอบ)</strong></li>
              <li>เลือกแท็บ <strong>Application</strong> ด้านบน (หากไม่เห็น ให้กดเครื่องหมาย <kbd>&gt;&gt;</kbd>)</li>
              <li>ในเมนูด้านซ้าย เลือกหมวด <strong>Storage</strong>:
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li><strong>Local storage:</strong> คลิกที่ URL ของเว็บ จะเห็น Key ชื่อ <code className="bg-white px-1 py-0.5 rounded text-amber-700 font-mono">tasks</code></li>
                  <li><strong>IndexedDB:</strong> ดับเบิ้ลคลิก <code className="bg-white px-1 py-0.5 rounded text-blue-700 font-mono">InventoryDatabase</code> &rarr; เลือกตาราง <code className="bg-white px-1 py-0.5 rounded text-blue-700 font-mono">items</code> เพื่อดูตารางสินค้าที่มี คีย์ id, name, quantity</li>
                </ul>
              </li>
              <li>สามารถกด Refresh หน้าจอ (<kbd className="px-1.5 py-0.5 bg-white rounded border border-indigo-200 font-mono text-[11px] shadow-sm">F5</kbd>) เพื่อพิสูจน์ได้ว่า ข้อมูลยังคงอยู่ถาวร ไม่สูญหาย!</li>
            </ol>
          </div>
        </div>
      )}

      {/* ปุ่มกลับหน้าหลัก */}
      <div className="text-center pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition"
        >
          &larr; กลับสู่หน้าหลัก (Home)
        </Link>
      </div>
    </div>
  );
}

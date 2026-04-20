import React from 'react';
import { Crown, Edit2 } from 'lucide-react'; // 引入 Edit2 圖示

export default function Navbar({ currentUser, handleLogout, players, setActiveStep }) {
  const myRegistration = players?.find(p => p.uid === currentUser?.uid);

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0F1C]/90 backdrop-blur-xl border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 左側 Logo 區 */}
          <div className="flex items-center gap-4">
            {/* 🌟 修正處：將兩次 className 合併為一個 */}
            <div 
              className="relative cursor-pointer" 
              onClick={() => setActiveStep('info')}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl blur opacity-25"></div>
              <div className="relative bg-slate-900 p-2.5 rounded-2xl border border-slate-700">
                <Crown className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 tracking-wider">
                多瑪雀王爭霸戰
              </h1>
              <p className="text-xs font-bold text-orange-500/80 tracking-widest uppercase mt-0.5">Doman Championship</p>
            </div>
          </div>
          
          {/* 右側：登入資訊區 */}
          {currentUser && (
            <div className="flex items-center gap-3 bg-slate-900/60 px-5 py-2 rounded-full border border-slate-800 shadow-sm">
              
              {/* 🌟 讓整個名稱區塊都變成可點擊跳轉到報名頁面 */}
              <button 
                onClick={() => setActiveStep('register')}
                className="group flex items-center gap-2 text-sm font-bold tracking-wide transition-all"
              >
                {myRegistration ? (
                  // 已報名：顯示名字 + 小筆圖示
                  <div className="flex items-center gap-2 text-slate-200 group-hover:text-orange-400">
                    <span className="truncate max-w-[120px] md:max-w-[180px]">{myRegistration.name}</span>
                    <Edit2 className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                  </div>
                ) : (
                  // 未報名：原本的閃爍提示
                  <span className="text-orange-500 animate-pulse group-hover:text-orange-400">
                    請輸入角色ID報名
                  </span>
                )}
              </button>
              
              <div className="w-px h-4 bg-slate-700 mx-1"></div>
              
              <button 
                onClick={handleLogout} 
                className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                登出
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
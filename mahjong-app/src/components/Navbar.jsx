import React from 'react';
import { Crown } from 'lucide-react';

export default function Navbar({ currentUser, handleLogout, players }) {
  // 從 players 陣列中找出目前登入者的資料
  const myRegistration = players?.find(p => p.uid === currentUser?.uid);

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0F1C]/90 backdrop-blur-xl border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 左側 Logo 區 */}
          <div className="flex items-center gap-4">
            <div className="relative">
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
              
              {/* 🌟 角色名稱 / 報名提示區 */}
              <div className="text-sm font-bold tracking-wide truncate max-w-[150px] md:max-w-[200px]">
                {myRegistration ? (
                  // 1. 如果已報名：顯示角色名稱
                  <span className="text-slate-200">
                    {myRegistration.name}
                  </span>
                ) : (
                  // 2. 如果未報名：顯示橘色閃爍提示
                  <span className="text-orange-500 animate-pulse">
                    請輸入角色ID報名
                  </span>
                )}
              </div>
              
              {/* 分隔線 */}
              <div className="w-px h-4 bg-slate-700 mx-1"></div>
              
              {/* 登出按鈕 */}
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
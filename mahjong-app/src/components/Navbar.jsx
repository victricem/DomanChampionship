import React from 'react';
import { Crown } from 'lucide-react';

export default function Navbar({ currentUser, handleLogout, players }) {
  const myRegistration = players?.find(p => p.uid === currentUser?.uid);
  const displayName = myRegistration 
    ? myRegistration.name 
    : (currentUser?.displayName || '尚未設定角色');

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
          
          {/* 右側：已移除大頭貼，只顯示名稱 */}
          {currentUser && (
            <div className="flex items-center gap-3 bg-slate-900/60 px-5 py-2 rounded-full border border-slate-800 shadow-sm">
              <span className="text-sm font-bold text-slate-200 tracking-wide truncate max-w-[120px] md:max-w-[180px]">
                {displayName}
              </span>
              
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
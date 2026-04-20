import React, { useState } from 'react';
import { Crown, Edit2, Check, X } from 'lucide-react';

export default function Navbar({ 
  currentUser, handleLogout, players, setActiveStep, handleQuickSetName, handleUpdatePlayerName 
}) {
  const myRegistration = players?.find(p => p.uid === currentUser?.uid);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');

  const handleSave = async () => {
    if (tempName.trim()) {
      if (myRegistration) {
        // 已有資料，執行更新
        await handleUpdatePlayerName(tempName);
      } else {
        // 尚未有資料，設定為訪客暱稱
        await handleQuickSetName(tempName);
      }
      setIsEditing(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0F1C]/90 backdrop-blur-xl border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 左側 Logo */}
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer group" onClick={() => setActiveStep('info')}>
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
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
          
          {/* 右側：登入資訊與修改入口 */}
          {currentUser && (
            <div className="flex items-center gap-3 bg-slate-900/60 px-5 py-2 rounded-full border border-slate-800 shadow-sm">
              
              {isEditing ? (
                /* 🌟 編輯模式：輸入框 */
                <div className="flex items-center gap-2">
                  <input 
                    autoFocus
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    placeholder="輸入角色名稱..."
                    className="bg-slate-800 border border-orange-500/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none w-36 shadow-inner"
                  />
                  <button onClick={handleSave} className="text-emerald-500 hover:text-emerald-400 p-1"><Check className="w-4 h-4"/></button>
                  <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-300 p-1"><X className="w-4 h-4"/></button>
                </div>
              ) : (
                /* 🌟 顯示模式：點擊進入編輯 */
                <button 
                  onClick={() => {
                    setIsEditing(true);
                    setTempName(myRegistration?.name || currentUser.displayName || '');
                  }}
                  className="group flex items-center gap-2 text-sm font-bold tracking-wide transition-all"
                  title="點擊修改角色名稱"
                >
                  {myRegistration ? (
                    <div className="flex items-center gap-2 text-slate-200 group-hover:text-orange-400 transition-colors">
                      <span className="truncate max-w-[120px] md:max-w-[180px]">{myRegistration.name}</span>
                      <Edit2 className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                    </div>
                  ) : (
                    <span className="text-orange-500 animate-pulse group-hover:text-orange-400 transition-colors">
                      請輸入角色ID報名
                    </span>
                  )}
                </button>
              )}
              
              <div className="w-px h-4 bg-slate-700 mx-2"></div>
              
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
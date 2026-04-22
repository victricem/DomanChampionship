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
        await handleUpdatePlayerName(tempName);
      } else {
        await handleQuickSetName(tempName);
      }
      setIsEditing(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0F1C]/90 backdrop-blur-xl border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className="relative cursor-pointer group" onClick={() => setActiveStep('info')}>
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-slate-900 p-2 md:p-2.5 rounded-xl md:rounded-2xl border border-slate-700">
                <Crown className="w-5 h-5 md:w-8 md:h-8 text-orange-500" />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-sm sm:text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 tracking-wide md:tracking-wider whitespace-nowrap">
                多瑪雀王爭霸戰
              </h1>
              <p className="text-[8px] sm:text-[10px] md:text-xs font-bold text-orange-500/80 tracking-wider uppercase mt-0.5">
                Doman Championship
              </p>
            </div>
          </div>
          
          {currentUser && (
            <div className="flex items-center gap-1.5 md:gap-3 bg-slate-900/60 px-3 py-1.5 md:px-5 md:py-2 rounded-full border border-slate-800 shadow-sm shrink-0 ml-2">
              {isEditing ? (
                <div className="flex items-center gap-1 md:gap-2">
                  <input 
                    autoFocus
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    placeholder="輸入角色名稱..."
                    className="bg-slate-800 border border-orange-500/50 rounded-md md:rounded-lg px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm text-white focus:outline-none w-20 sm:w-28 md:w-36 shadow-inner"
                  />
                  <button onClick={handleSave} className="text-emerald-500 hover:text-emerald-400 p-0.5 md:p-1">
                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4"/>
                  </button>
                  <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-300 p-0.5 md:p-1">
                    <X className="w-3.5 h-3.5 md:w-4 md:h-4"/>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setIsEditing(true);
                    setTempName(myRegistration?.name || currentUser.displayName || '');
                  }}
                  className="group flex items-center gap-1 md:gap-2 text-xs md:text-sm font-bold tracking-wide transition-all"
                >
                  {myRegistration ? (
                    <div className="flex items-center gap-1.5 md:gap-2 text-slate-200 group-hover:text-orange-400 transition-colors">
                      <span className="truncate max-w-[70px] sm:max-w-[120px] md:max-w-[180px]">
                        {myRegistration.name}
                      </span>
                      <Edit2 className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-50 group-hover:opacity-100 shrink-0" />
                    </div>
                  ) : (
                    <span className="text-orange-500 animate-pulse group-hover:text-orange-400 transition-colors whitespace-nowrap text-[10px] md:text-sm">
                      輸入ID報名
                    </span>
                  )}
                </button>
              )}
              
              <div className="w-px h-3 md:h-4 bg-slate-700 mx-1 md:mx-2"></div>
              
              <button 
                onClick={handleLogout} 
                className="text-[10px] md:text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap"
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
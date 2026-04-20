import React from 'react';
import { Info, UserPlus, Shuffle, Trophy, Network } from 'lucide-react';

export default function NavigationTabs({ activeStep, setActiveStep, currentUser, isAdmin, isRegistered }) {
  
  // 👉 定義所有標籤，並加上 show 屬性來控制顯示與否
  const steps = [
    { id: 'info', icon: Info, label: '賽事說明', show: true }, // 首頁永遠顯示
    { id: 'register', icon: UserPlus, label: '報名專區', show: !!currentUser }, // 登入後才顯示報名
    { id: 'matchmaking', icon: Shuffle, label: '賽程記分', show: isRegistered || isAdmin }, // 報名後或管理員才顯示
    { id: 'tournament', icon: Trophy, label: '初賽排行榜', show: true }, // 排行榜永遠顯示
    { id: 'bracket', icon: Network, label: '晉級階梯', show: true } // 晉級圖永遠顯示
  ];

  // 過濾出允許顯示的標籤
  const visibleSteps = steps.filter(step => step.show);

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 mb-10 animate-fade-in">
      {/* 外層深色藥丸容器 */}
      <div className="flex items-center justify-center p-1.5 bg-[#0F172A]/80 backdrop-blur-md border border-slate-800/80 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        {visibleSteps.map((step) => {
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`relative flex-1 min-w-[100px] flex items-center justify-center px-4 py-3 rounded-full transition-all duration-300 font-bold overflow-hidden group
                ${isActive
                  // 啟動時的顏色 (仿照截圖的咖啡/橘色)
                  ? 'text-white bg-[#7C3AED]/0 bg-gradient-to-r from-orange-900/80 to-amber-800/80 shadow-inner border border-orange-700/30'
                  // 未啟動時的顏色 (深灰字體，Hover時微微變亮)
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
            >
              <step.icon className={`w-4 h-4 mr-2 relative z-10 ${isActive ? 'text-orange-300' : 'text-slate-500 group-hover:text-slate-400 transition-colors'}`} />
              <span className="relative z-10 text-sm whitespace-nowrap">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
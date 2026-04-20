import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full mt-16 pt-10 pb-8 border-t border-slate-800/60 bg-gradient-to-b from-transparent to-slate-950/80">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-7">
        
        {/* 1. 主辦與協辦資訊 */}
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm text-slate-300 font-bold tracking-widest bg-slate-900/60 px-8 py-2.5 rounded-full border border-slate-800 shadow-sm hover:bg-slate-800/60 transition-colors">
          <span className="flex items-center">
            <span className="text-orange-500/90 mr-2 text-xs">主辦</span> 
            <span className="text-slate-100 drop-shadow-sm">貓咪咖啡館</span>
          </span>
          
          {/* 中間的分隔點 */}
          <span className="w-1 h-1 bg-slate-600 rounded-full mx-1.5 opacity-60"></span>
          
          <span className="flex items-center">
            <span className="text-orange-500/90 mr-2 text-xs">協辦</span> 
            <span className="text-slate-100 drop-shadow-sm">晨曦茶會、T Grove</span>
          </span>
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          {/* 2. 專業版隱私聲明 */}
          <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm font-medium tracking-wide bg-slate-950/60 px-5 py-2 rounded-full border border-slate-800/80 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-500/80 flex-shrink-0" />
            <span>本站登入驗證僅供賽事身分識別，絕不會額外蒐集或儲存您的個人隱私資料。</span>
          </div>
          
          {/* 3. FFXIV 官方版權資訊 (排版優化) */}
          <div className="text-slate-500/50 text-[10px] md:text-xs text-center leading-relaxed font-medium tracking-wider uppercase">
            <p className="mb-0.5">FINAL FANTASY XIV © SQUARE ENIX</p>
            <p>Published by USERJOY Technology Co., Ltd. Jointly Published by NADA HOLDINGS.</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
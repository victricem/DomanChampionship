import React from 'react';
import { Network, Crown, ChevronRight, Trophy, Cat } from 'lucide-react';

export default function BracketView({ 
  bracket, sortedPlayers, handleGenerateBracket, handleAdvanceToFinals, handleSetChampion, isAdmin 
}) {
  return (
    <main className="max-w-7xl mx-auto bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-800 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center"><Network className="mr-2 text-orange-500" /> 賽事晉級階梯圖</h2>
          <p className="text-slate-400 mt-2 text-sm">
            擷取初賽總點數前 16 名，並<strong className="text-orange-400">亂數打亂</strong>分配至 4 桌。
            {isAdmin ? '請於各桌選出勝出者晉級決賽！' : '請為晉級的選手加油！'}
          </p>
        </div>
        
        {/* 👉 只有管理員能看到產生晉級表的按鈕 */}
        {isAdmin && (
          <button onClick={() => handleGenerateBracket(false)} className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-colors flex items-center">
            <Network className="w-5 h-5 mr-2" /> {bracket ? '重新擷取 16 強名單' : '擷取積分前 16 強'}
          </button>
        )}
      </div>

      {!bracket ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-600 bg-slate-950/50 rounded-2xl border-2 border-dashed border-slate-800">
          <Crown className="w-20 h-20 mb-4 opacity-20" />
          <p className="font-bold text-xl text-slate-400">尚無晉級資料</p>
          <p className="text-slate-500 mt-2">{isAdmin ? '請點擊上方按鈕產生 16 強晉級圖表！' : '管理員尚未發布晉級名單。'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar pb-8">
          <div className="min-w-[800px] flex justify-between items-stretch gap-6 relative px-4 pt-4">
            
            <div className="flex-1 flex flex-col justify-around gap-6 relative z-10">
              <div className="text-center font-black text-xl text-slate-500 mb-2 border-b border-slate-800 pb-2 uppercase tracking-widest">16強 複賽</div>
              {bracket.semifinals.map((semi, index) => (
                <div key={semi.id} className={`bg-slate-950/50 rounded-2xl border transition-colors overflow-hidden ${semi.winner ? 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'border-slate-800'} shadow-md`}>
                  <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-slate-300 text-sm">複賽 {semi.id} 桌</span>
                    {semi.winner && <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full font-bold">已分勝負</span>}
                  </div>
                  <div className="p-3 flex flex-col gap-2">
                    {semi.players.map((p, pIdx) => (
                      <button 
                        key={pIdx} 
                        onClick={() => isAdmin && handleAdvanceToFinals(index, p)}
                        disabled={!isAdmin || !p} // 👉 鎖定非管理員的操作
                        className={`w-full text-left px-3 py-2 rounded-lg font-bold text-sm transition-all border flex items-center justify-between
                          ${!p ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 
                            semi.winner?.id === p?.id 
                              ? 'bg-orange-600 text-white border-orange-500 shadow-md transform scale-[1.02]' 
                              : `bg-slate-800 border-slate-700 text-slate-300 ${isAdmin ? 'hover:border-orange-500/50 hover:bg-slate-700 group cursor-pointer' : 'cursor-default'}`}`}
                      >
                        <span>{p ? p.name : '空缺'}</span>
                        {/* 只有管理員在 Hover 時會看到「晉級決賽」提示 */}
                        {isAdmin && semi.winner?.id !== p?.id && p && <span className="text-orange-400 opacity-0 group-hover:opacity-100 text-xs">晉級決賽</span>}
                        {semi.winner?.id === p?.id && <ChevronRight className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="w-8 flex flex-col justify-center items-center opacity-30">
              <div className="h-full border-r-2 border-dashed border-slate-600 w-1/2"></div>
            </div>

            <div className="flex-1 flex flex-col justify-center relative z-10">
              <div className="text-center font-black text-xl text-amber-500 mb-6 border-b border-slate-800 pb-2 uppercase tracking-widest drop-shadow-sm">4強 總決賽</div>
              <div className={`bg-slate-950/80 rounded-2xl border-2 transition-all overflow-hidden ${bracket.finals.winner ? 'border-amber-500/70 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-slate-700 shadow-lg'}`}>
                <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 text-center">
                  <span className="font-black text-amber-500 text-lg flex items-center justify-center"><Trophy className="w-5 h-5 mr-2 text-amber-400" /> 冠軍戰</span>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  {bracket.finals.players.map((p, pIdx) => (
                    <button 
                      key={pIdx} 
                      onClick={() => isAdmin && handleSetChampion(p)}
                      disabled={!isAdmin || !p} // 👉 鎖定非管理員的操作
                      className={`w-full text-left px-4 py-3 rounded-xl font-bold text-base transition-all border flex items-center justify-between
                        ${!p ? 'bg-slate-900 border-dashed border-slate-700 text-slate-600 cursor-not-allowed' : 
                          bracket.finals.winner?.id === p?.id 
                            ? 'bg-amber-600 text-white border-amber-500 shadow-lg transform scale-105 relative z-10' 
                            : `bg-slate-800 border-slate-700 text-slate-300 ${isAdmin ? 'hover:border-amber-500/50 hover:bg-slate-700 group cursor-pointer' : 'cursor-default'}`}`}
                    >
                      <div className="flex items-center">
                        <span className="w-6 h-6 flex items-center justify-center bg-black/30 rounded-full text-xs mr-3 font-black text-slate-400">
                          {['A', 'B', 'C', 'D'][pIdx]}
                        </span>
                        {p ? p.name : '等待晉級...'}
                      </div>
                      {/* 只有管理員在 Hover 時會看到「設為冠軍」提示 */}
                      {isAdmin && bracket.finals.winner?.id !== p?.id && p && <span className="text-amber-400 opacity-0 group-hover:opacity-100 text-sm">設為冠軍 🏆</span>}
                      {bracket.finals.winner?.id === p?.id && <Crown className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-8 flex flex-col justify-center items-center opacity-30">
              <div className="h-4 border-b-2 border-dashed border-slate-600 w-full"></div>
            </div>

            <div className="flex-1 flex flex-col justify-center relative z-10">
              <div className="text-center font-black text-xl text-orange-500 mb-6 border-b border-slate-800 pb-2 uppercase tracking-widest drop-shadow-sm">雀王誕生</div>
              <div className="bg-gradient-to-b from-orange-600 to-amber-600 rounded-3xl p-1 shadow-2xl relative transform hover:scale-105 transition-transform duration-500">
                {bracket.finals.winner && <div className="absolute inset-0 bg-white opacity-20 blur-xl rounded-full animate-pulse"></div>}
                
                <div className="bg-slate-950 rounded-[22px] p-8 flex flex-col items-center text-center h-full border border-orange-500/30 relative overflow-hidden">
                  <Cat className="absolute -bottom-8 -left-8 w-40 h-40 text-orange-500/10 -rotate-12" />
                  <Crown className={`w-24 h-24 mb-4 drop-shadow-md z-10 transition-colors duration-500 ${bracket.finals.winner ? 'text-amber-400' : 'text-slate-700'}`} />
                  
                  <div className="z-10 w-full">
                    <p className="text-sm font-bold text-orange-500 mb-2 tracking-widest">第一屆 多瑪雀王</p>
                    {bracket.finals.winner ? (
                      <div className="animate-bounce mt-4">
                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-300 drop-shadow-sm border-b-2 border-orange-500/30 pb-1 px-4">
                          {bracket.finals.winner.name}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xl font-bold text-slate-600 bg-slate-900 py-3 rounded-xl border border-dashed border-slate-800 mt-2">
                        虛位以待
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
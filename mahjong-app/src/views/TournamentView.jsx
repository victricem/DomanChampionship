import React from 'react';
import { Medal, ChevronRight, History, Cat, Undo2 } from 'lucide-react';

export default function TournamentView({ 
  sortedPlayers, matches, handleGenerateBracket, handleUndoSpecificMatch, setActiveStep, isAdmin 
}) {
  return (
    <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* 👉 左側：排行榜看板。如果是管理員佔 8 格，一般玩家則佔滿 12 格並置中 */}
      <div className={`${isAdmin ? 'lg:col-span-8' : 'lg:col-span-12 max-w-5xl mx-auto w-full'} bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 flex flex-col`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center"><Medal className="mr-2 text-orange-500" /> 積分排行榜看板</h2>
          <span className="bg-orange-500/20 border border-orange-500/30 text-orange-400 px-3 py-1 rounded-full text-sm font-bold">即時排名更新</span>
        </div>
        
        <div className="overflow-x-auto rounded-2xl border border-slate-800 flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-300 text-sm border-b border-slate-700">
                <th className="p-4 font-bold w-16 text-center">排名</th>
                <th className="p-4 font-bold">玩家名稱</th>
                <th className="p-4 font-bold text-right w-24">總點數</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 bg-slate-900">
              {sortedPlayers.map((player, index) => (
                <tr key={player.id} className={`transition-colors ${index < 16 && player.status === 'active' ? 'bg-orange-900/10' : 'opacity-60'} hover:bg-slate-800/50`}>
                  <td className="p-4 text-center">
                    {player.status !== 'active' ? <span className="text-slate-600">-</span> :
                      <span className={`font-bold ${index < 16 ? 'text-orange-400 text-lg drop-shadow-md' : 'text-slate-500'}`}>{index + 1}</span>}
                  </td>
                  <td className="p-4 font-bold text-slate-200 text-lg">
                    {player.name}
                    {player.status === 'pending' && <span className="ml-3 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-1 rounded-full whitespace-nowrap">審核中</span>}
                    {index < 16 && player.status === 'active' && <span className="ml-3 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded-full whitespace-nowrap">晉級安全區</span>}
                  </td>
                  <td className={`p-4 font-black text-right text-lg ${player.points > 0 ? 'text-emerald-400' : player.points < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                    {player.points > 0 ? `+${player.points.toLocaleString()}` : player.points.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 僅限管理員可見的晉級操作區塊 */}
        {isAdmin && (
          <div className="mt-6 p-5 bg-slate-800/50 rounded-2xl border border-slate-700 flex flex-col md:flex-row justify-between items-center shadow-sm gap-4">
            <div className="text-sm text-slate-400">
              <strong className="text-orange-400 block text-base mb-1">初賽結束了嗎？</strong> 
              點擊右方按鈕，系統將自動擷取上方積分最高 (且已核准) 的 16 位玩家進入晉級表。
            </div>
            <button 
              onClick={() => { if (handleGenerateBracket(true)) setActiveStep('bracket'); }} 
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-5 rounded-xl shadow-md transition-transform transform hover:-translate-y-1 flex items-center whitespace-nowrap"
            >
              前往晉級階梯 <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* 👉 右側：結算紀錄。只有管理員看得到這個大區塊 */}
      {isAdmin && (
        <div className="lg:col-span-4">
          <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 sticky top-28">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-100 flex items-center"><History className="mr-2 text-orange-500" /> 結算紀錄</h2>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                  <Cat className="w-12 h-12 mb-2 opacity-20" />
                  <p>目前無紀錄</p>
                </div>
              ) : (
                matches.map((match) => (
                  <div key={match.id} className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800 text-sm">
                    <div className="flex justify-between items-center text-slate-500 text-xs mb-3 border-b border-slate-800 pb-2">
                      <span className="font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded">
                        {match.stage}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        <span>{match.time}</span>
                        {/* 👉 單筆專屬的撤銷按鈕 */}
                        <button 
                          onClick={() => handleUndoSpecificMatch(match.id)}
                          className="text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                          title="撤銷此筆紀錄並重新開放該桌填寫"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">撤銷</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {match.details.map((detail, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 shadow-sm">
                          <span className="text-slate-300 font-medium truncate max-w-[120px]">{detail.player || '已移除'}</span>
                          <span className={`font-black ${detail.pointsChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{detail.pointsChange}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
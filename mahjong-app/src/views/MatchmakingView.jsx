import React from 'react';
import { Shuffle, Cat, CheckCircle2, Coffee, AlertCircle, ChevronRight, Check } from 'lucide-react';

export default function MatchmakingView({ 
  players, schedule, currentUser, isAdmin, 
  handleGenerateSchedule, handleTableScoreChange, 
  handleProposeScore, handleApproveScore, handleRejectScore, setActiveStep 
}) {
  const myRegistration = players.find(p => p.uid === currentUser?.uid);

  return (
    <main className="max-w-7xl mx-auto bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-800 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center"><Shuffle className="mr-2 text-orange-500" /> 初賽賽程與記分區</h2>
          <p className="text-slate-400 mt-2 text-sm">
            {isAdmin 
              ? '您是管理員，可以檢視全場賽程並修改任意分數。' 
              : '該桌所有人皆可輸入。一人發起審核後，需由同桌所有人同意才會正式送出。'}
          </p>
        </div>
        
        {isAdmin && (
          <button onClick={handleGenerateSchedule} className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-colors flex items-center">
            <Shuffle className="w-5 h-5 mr-2" /> {schedule.length > 0 ? '重新運算完整賽程' : '一鍵產生三局賽程'}
          </button>
        )}
      </div>

      {schedule.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-600 bg-slate-950/50 rounded-2xl border-2 border-dashed border-slate-800">
          <Cat className="w-16 h-16 mb-4 opacity-20" />
          <p className="font-medium text-lg">
            {isAdmin ? '請點擊右上角的按鈕為大家編排賽程' : '管理員尚未發布賽程，請稍候喵～'}
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {schedule.map((roundData, rIdx) => {
            const amILeftover = !isAdmin && myRegistration && roundData.leftovers.some(p => p.id === myRegistration.id);
            const amIPlaying = !isAdmin && myRegistration && roundData.tables.some(t => t.players.some(p => p.id === myRegistration.id));

            if (!isAdmin && !amIPlaying && !amILeftover) return null;

            return (
              <div key={rIdx} className="bg-slate-950/50 rounded-3xl border border-slate-800 p-6 pt-8 shadow-sm relative mt-6">
                <div className="absolute -top-5 left-6 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-black px-6 py-2 rounded-full shadow-md tracking-wider border border-orange-500/50">
                  初賽 第 {roundData.round} 局
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-2">
                  {roundData.tables.map((table, tIdx) => {
                    const isMyTable = myRegistration && table.players.some(p => p.id === myRegistration.id);
                    if (!isAdmin && !isMyTable) return null;

                    // 狀態判定
                    const isSubmitted = table.isSubmitted || table.status === 'submitted';
                    const isPending = table.status === 'pending' && !isSubmitted;
                    const isPlaying = !isSubmitted && !isPending;
                    
                    const myApproval = myRegistration && table.approvals?.includes(myRegistration.id);
                    const approvalsCount = table.approvals ? table.approvals.filter(id => id !== 'admin').length : 0;
                    const tableSum = table.scores.reduce((sum, s) => sum + (s.points === '-' ? 0 : Number(s.points) || 0), 0);
                    
                    return (
                      <div key={tIdx} className={`rounded-2xl border overflow-hidden transition-all shadow-sm ${isSubmitted ? 'bg-slate-900 border-slate-800' : isPending ? 'bg-slate-800/80 border-amber-500/50' : 'bg-slate-800/40 border-orange-500/30'}`}>
                        <div className={`p-3 border-b flex justify-between items-center ${isSubmitted ? 'bg-slate-800 border-slate-700 text-slate-400' : isPending ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
                          <span className="font-bold text-sm flex items-center">
                            {isSubmitted ? <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" /> : isPending ? <AlertCircle className="w-4 h-4 mr-1" /> : <Coffee className="w-4 h-4 mr-1 opacity-70" />}
                            第 {tIdx + 1} 桌 {isSubmitted ? '(已結算)' : isPending ? '(審核中)' : ''}
                          </span>
                          {!isAdmin && isMyTable && <span className={`text-xs text-white px-2 py-0.5 rounded-full flex items-center ${isPending ? 'bg-amber-600' : 'bg-orange-500'}`}><Check className="w-3 h-3 mr-1"/> 我的桌次</span>}
                        </div>
                        
                        <ul className="p-3 space-y-2">
                          {table.players.map((p, pIdx) => (
                            <li key={p.id} className="flex items-center justify-between text-slate-300 font-medium bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 shadow-sm text-sm">
                              <div className="flex items-center">
                                <span className={`w-6 h-6 flex items-center justify-center bg-slate-900 border border-slate-700 text-slate-400 rounded-full text-xs mr-2 font-bold ${p.id === myRegistration?.id ? 'ring-1 ring-orange-500 text-orange-400' : ''}`}>
                                  {['東', '南', '西', '北'][pIdx]}
                                </span>
                                <span className={`truncate max-w-[100px] ${p.id === myRegistration?.id ? 'text-orange-400 font-bold' : ''}`}>
                                  {p.name}
                                </span>
                              </div>
                              
                              {/* 只有在 playing 狀態下才能輸入，其他狀態顯示純文字 */}
                              {isPlaying ? (
                                <input 
                                  type="text" 
                                  inputMode="numeric"
                                  placeholder="分數" 
                                  value={table.scores[pIdx].points}
                                  onChange={(e) => handleTableScoreChange(rIdx, tIdx, pIdx, e.target.value)}
                                  className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-slate-200 font-bold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                />
                              ) : (
                                <span className={`font-black ${Number(table.scores[pIdx].points) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {table.scores[pIdx].points || '0'}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>

                        {!isSubmitted && (
                          <div className="px-4 pb-4 pt-2 flex flex-col gap-3 border-t border-slate-800/50 mt-1">
                            <div className="flex justify-between items-center w-full">
                              <span className={`text-xs font-bold ${tableSum === 100000 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                總和: {tableSum.toLocaleString()}
                              </span>
                              
                              {/* 狀態：輸入中 */}
                              {isPlaying && (
                                <button 
                                  onClick={() => handleProposeScore(rIdx, tIdx)}
                                  className="bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold py-1.5 px-4 rounded-lg shadow-sm transition-colors"
                                >
                                  發起審核
                                </button>
                              )}

                              {/* 狀態：審核中 */}
                              {isPending && (!myApproval || isAdmin) && (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleApproveScore(rIdx, tIdx)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-1.5 px-3 rounded-lg transition-colors">
                                    {isAdmin ? '強制結算' : '同意'}
                                  </button>
                                  <button onClick={() => handleRejectScore(rIdx, tIdx)} className="bg-red-600/80 hover:bg-red-500 text-white text-sm font-bold py-1.5 px-3 rounded-lg transition-colors">
                                    退回
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* 審核進度條 */}
                            {isPending && (
                              <div className="text-xs text-amber-400 font-medium bg-amber-500/10 p-2.5 rounded-lg flex justify-between items-center border border-amber-500/20">
                                <span><strong className="text-white">{table.proposer}</strong> 發起了結算</span>
                                <span className="bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">確認進度: {approvalsCount}/4</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {isAdmin && roundData.leftovers.length > 0 && (
                  <div className="mt-5 bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-sm flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 text-slate-400 flex-shrink-0" />
                    <div>
                      <strong className="text-slate-300 block mb-2">本局輪空 / 候補休息區：</strong>
                      <div className="flex flex-wrap gap-2">
                        {roundData.leftovers.map(p => (<span key={p.id} className="bg-slate-900 px-3 py-1 rounded-lg text-slate-400 border border-slate-700 shadow-sm">{p.name}</span>))}
                      </div>
                    </div>
                  </div>
                )}

                {!isAdmin && amILeftover && (
                  <div className="mt-5 bg-amber-900/20 p-6 rounded-xl border border-amber-500/30 flex items-center justify-center shadow-inner">
                    <Coffee className="w-6 h-6 mr-3 text-amber-500" />
                    <span className="text-amber-400 font-bold text-lg">您本局輪空，請在休息區喝杯咖啡喵～</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-10 flex justify-center space-x-4 pt-6 border-t border-slate-800">
        <button onClick={() => setActiveStep('register')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-full transition-colors border border-slate-700">上一步</button>
        <button onClick={() => setActiveStep('tournament')} className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-orange-900/50 transition-transform transform hover:-translate-y-1 flex items-center">
          查看當前排行榜 <ChevronRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </main>
  );
}
import React, { useState } from 'react';
// 👉 頂部引入新增 AlertTriangle
import { UserPlus, Plus, Cat, AlertCircle, CheckCircle2, Check, Trash2, ChevronRight, ShieldAlert, Edit2, Save, X, Search, AlertTriangle } from 'lucide-react';

export default function RegisterView({ 
  players, currentUser, isAdmin, handleSelfRegister, newPlayerName, setNewPlayerName, handleAddPlayer,
  handleApprovePlayer, handleDeletePlayer, setActiveStep, handleUpdatePlayerName,
  handleResetAll // 👉 記得接收這個 function
}) {
  const [characterName, setCharacterName] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  
  const myRegistration = players.find(p => p.uid === currentUser?.uid);

  const startEditing = () => {
    setEditNameValue(myRegistration.name);
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (editNameValue.trim() && editNameValue !== myRegistration.name) {
      await handleUpdatePlayerName(editNameValue);
    }
    setIsEditing(false);
  };

  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* 區塊 1：一般使用者報名區 */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center">
            <UserPlus className="mr-2 text-orange-500" /> 
            {myRegistration ? '我的參賽狀態' : '填寫遊戲角色名稱'}
          </h2>
          <div className="text-sm text-slate-400">
            登入身分：<span className={isAdmin ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
              {isAdmin ? '管理員' : '一般玩家'}
            </span>
          </div>
        </div>

        {!myRegistration ? (
          <form onSubmit={(e) => handleSelfRegister(e, characterName)} className="flex flex-col md:flex-row gap-3">
            <input 
              type="text" 
              value={characterName} 
              onChange={(e) => setCharacterName(e.target.value)} 
              placeholder="請輸入您在 FF14 的角色名稱 (如: Mori No Nao)" 
              required
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-orange-500 font-medium" 
            />
            <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-8 py-3 rounded-xl transition-colors flex items-center justify-center shadow-md">
              <Plus className="w-5 h-5 mr-1" /> 提交報名
            </button>
          </form>
        ) : (
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-slate-400 mb-1">您的參賽角色</p>
              
              {isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="text" 
                    value={editNameValue} 
                    onChange={(e) => setEditNameValue(e.target.value)}
                    className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-orange-500 font-bold w-full max-w-[250px]"
                    autoFocus
                  />
                  <button onClick={saveEdit} className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm" title="儲存">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsEditing(false)} className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors shadow-sm" title="取消">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-black text-white">{myRegistration.name}</p>
                  <button 
                    onClick={startEditing} 
                    className="text-slate-400 hover:text-orange-400 p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-md transition-colors" 
                    title="修改名稱"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-0">
              {myRegistration.status === 'pending' ? (
                <span className="flex items-center text-sm font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-xl">
                  <AlertCircle className="w-5 h-5 mr-2" /> 等待管理員確認保證金
                </span>
              ) : (
                <span className="flex items-center text-sm font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 mr-2" /> 報名成功！準備參戰
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 區塊 2：管理員專屬後台 */}
      {isAdmin && (
        <div className="bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl border border-amber-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-slate-900 text-xs font-black px-4 py-1 rounded-bl-xl">Admin Only</div>
          
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4 mt-2">
            <h2 className="text-xl font-bold text-slate-100 flex items-center"><ShieldAlert className="mr-2 text-amber-500" /> 後台審核管理</h2>
            <div className="bg-slate-800 text-slate-300 px-4 py-1 rounded-full font-bold text-sm">
              總報名人數：{players.length} 人
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <form onSubmit={handleAddPlayer} className="flex gap-2">
              <input type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} placeholder="管理員代填玩家 ID..." className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 text-sm" />
              <button type="submit" className="bg-amber-600/80 hover:bg-amber-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm flex items-center whitespace-nowrap">
                <Plus className="w-4 h-4 mr-1" /> 代為新增
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-500" />
              </div>
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="搜尋參賽者 ID..." 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-sm transition-colors" 
              />
            </div>
          </div>
          
          <div className="bg-slate-950/50 rounded-2xl border border-slate-800 overflow-hidden min-h-[200px]">
            {filteredPlayers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10 text-slate-600">
                <Cat className="w-12 h-12 mb-2 opacity-20" />
                <p>{players.length === 0 ? '目前無人報名' : '找不到符合條件的參賽者'}</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-800/50 max-h-[40vh] overflow-y-auto p-2 custom-scrollbar">
                {filteredPlayers.map((player, index) => (
                  <li key={player.id} className="flex flex-col sm:flex-row justify-between items-center p-3 hover:bg-slate-800/50 rounded-xl gap-4">
                    <div className="flex items-center w-full sm:w-auto">
                      <span className="w-6 h-6 flex justify-center items-center bg-slate-800 border border-slate-700 text-slate-400 rounded-full font-bold text-xs mr-3">{index + 1}</span>
                      <div>
                        <div className="font-bold text-slate-200 text-lg">{player.name}</div>
                        {!player.email && <div className="text-xs text-slate-600 font-medium mt-0.5">管理員代報</div>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {player.status === 'pending' ? (
                        <button onClick={() => handleApprovePlayer(player.id)} className="text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center transition-colors">
                          <Check className="w-4 h-4 mr-1" /> 核准
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-500 px-3 py-1.5 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> 已核准</span>
                      )}
                      <button onClick={() => handleDeletePlayer(player.id)} className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* 👉 修改這裡：將清空資料按鈕與產生賽程按鈕並排，並增加視覺差異 */}
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-slate-800/50 pt-6">
            <button 
              onClick={handleResetAll} 
              className="w-full md:w-auto text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center justify-center text-sm"
              title="刪除所有報名資料與賽程"
            >
              <AlertTriangle className="w-4 h-4 mr-2" /> 清空資料 (舉辦下屆賽事)
            </button>
            
            <button 
              onClick={() => { if (players.filter(p => p.status === 'active').length < 4) { alert('至少需要 4 名已核准的參賽者！'); return; } setActiveStep('matchmaking'); }} 
              className="w-full md:w-auto bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center"
            >
              前往賽程配對 <ChevronRight className="ml-1 w-5 h-5" />
            </button>
          </div>

        </div>
      )}
    </main>
  );
}
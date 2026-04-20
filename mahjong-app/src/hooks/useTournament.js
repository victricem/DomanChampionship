import { useState, useMemo, useEffect } from 'react';
import { auth, db } from '../firebase';
// 🌟 引入關鍵函式：getRedirectResult (處理回傳), setPersistence (持久化狀態)
import { 
  onAuthStateChanged, 
  signOut, 
  getRedirectResult, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDoc } from 'firebase/firestore';

export function useTournament() {
  const [activeStep, setActiveStep] = useState('info');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  // 提示訊息功能
  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [bracket, setBracket] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState('');

  // 🌟 [核心修復] Auth 邏輯：處理重定向與狀態持久化
  useEffect(() => {
    console.log("🚀 [System] 初始化 Tournament Hook...");

    // 1. 設定登入狀態保存於 LocalStorage，防止重新整理後登出
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // 2. 捕捉重定向回來的登入憑證 (解決 GitHub Pages 登入後沒反應的問題)
        return getRedirectResult(auth);
      })
      .then((result) => {
        if (result?.user) {
          console.log("✅ [Auth] 成功從跳轉中捕捉使用者:", result.user.email);
          setCurrentUser(result.user);
        }
      })
      .catch((error) => {
        console.error("❌ [Auth] 重定向捕捉錯誤:", error.code, error.message);
      });

    // 3. 監聽全域身分變更
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log("🔥 [Auth] 目前狀態:", user ? `已登入 (${user.email})` : "未登入");
      setCurrentUser(user);

      if (user) {
        try {
          // 管理員 Email 清單 (統一小寫判斷)
          const adminEmails = ['tony80709@yahoo.com.tw', 's85543s2169@gmail.com'];
          const userEmail = user.email ? user.email.toLowerCase() : '';

          // 嘗試讀取 adminCheck 文件 (用來觸發 Firestore Rules 檢查)
          // 根據規則，一般玩家會在這裡 throw error，進而進入 catch 區塊設定 isAdmin(false)
          await getDoc(doc(db, 'settings', 'adminCheck'));

          if (adminEmails.includes(userEmail)) {
            console.log("👑 [Auth] 驗證成功：管理員權限已解鎖");
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (e) {
          // 若無權限讀取（Firestore 報錯），代表為一般玩家
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 監聽玩家資料庫
  useEffect(() => {
    const unsubscribePlayers = onSnapshot(collection(db, 'players'), (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribePlayers();
  }, []);

  // 監聽賽事全域資料 (賽程、紀錄、晉級表)
  useEffect(() => {
    const unsubscribeGlobal = onSnapshot(doc(db, 'tournament', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSchedule(data.schedule || []);
        setMatches(data.matches || []);
        setBracket(data.bracket || null);
      }
    });
    return () => unsubscribeGlobal();
  }, []);

  // 根據積分與狀態排序玩家
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      // 待核准的玩家排在最後面
      if (a.status === 'pending' && b.status !== 'pending') return 1;
      if (a.status !== 'pending' && b.status === 'pending') return -1;
      // 根據積分從高到低排序
      return (b.points || 0) - (a.points || 0);
    });
  }, [players]);

  // --- 使用者操作函式 ---

  // 玩家自行報名
  const handleSelfRegister = async (e, characterName) => {
    e.preventDefault();
    if (!characterName.trim() || !currentUser) return;
    if (players.some(p => p.uid === currentUser.uid)) {
      showToast("您已經報名過了喵！", "error"); return;
    }
    try {
      await setDoc(doc(db, 'players', currentUser.uid), {
        uid: currentUser.uid, 
        email: currentUser.email, 
        name: characterName.trim(), 
        points: 0, 
        status: 'pending', 
        createdAt: Date.now()
      });
      showToast("報名資料送出成功！", "success");
    } catch (err) { 
      console.error(err);
      showToast("報名失敗，請確認權限設定！", "error"); 
    }
  };

  // 修改角色名稱
  const handleUpdatePlayerName = async (newName) => {
    if (!newName.trim() || !currentUser) return;
    try {
      await updateDoc(doc(db, 'players', currentUser.uid), { name: newName.trim() });
      showToast("角色名稱修改成功！", "success");
    } catch (err) { showToast("修改失敗：您沒有權限修改！", "error"); }
  };

  // 登出
  const handleLogout = () => signOut(auth).then(() => {
    setCurrentUser(null);
    setIsAdmin(false);
    setActiveStep('info');
  });

  // 更新雲端全域賽事資料
  const updateGlobalTournament = async (newData) => {
    try {
      await setDoc(doc(db, 'tournament', 'global'), newData, { merge: true });
    } catch (err) { showToast("雲端更新失敗！", "error"); }
  };

  // [管理員] 手動新增玩家
  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    try {
      const newRef = doc(collection(db, 'players'));
      await setDoc(newRef, { uid: newRef.id, name: newPlayerName.trim(), points: 0, status: 'pending' });
      setNewPlayerName('');
      showToast("代為新增成功！", "success");
    } catch (error) { showToast("新增失敗：權限不足！", "error"); }
  };

  // [管理員] 核准玩家
  const handleApprovePlayer = async (id) => {
    try {
      await updateDoc(doc(db, 'players', String(id)), { status: 'active' });
      showToast("已核准該名玩家！", "success");
    } catch (error) { showToast("核准失敗：權限不足！", "error"); }
  };

  // [管理員] 移除玩家
  const handleDeletePlayer = async (id) => {
    if (window.confirm('確定移除該名參賽者？')) {
      try {
        await deleteDoc(doc(db, 'players', String(id)));
        showToast("已移除該參賽者！", "success");
      } catch (error) { showToast("移除失敗：權限不足！", "error"); }
    }
  };

  // 賽程分數編輯
  const handleTableScoreChange = (rIdx, tIdx, pIdx, value) => {
    if (!/^-?\d*$/.test(value)) return;
    const newSchedule = JSON.parse(JSON.stringify(schedule));
    newSchedule[rIdx].tables[tIdx].scores[pIdx].points = value;
    setSchedule(newSchedule); 
  };

  // 發起成績審核
  const handleProposeScore = async (rIdx, tIdx) => {
    const newSchedule = JSON.parse(JSON.stringify(schedule));
    const table = newSchedule[rIdx].tables[tIdx];
    if (table.scores.some(s => s.points === '' || s.points === '-')) {
      showToast("請填寫此桌所有玩家的有效點數！", "error"); return;
    }
    const myRegistration = players.find(p => p.uid === currentUser?.uid);
    table.status = 'pending';
    table.approvals = myRegistration ? [myRegistration.id] : ['admin'];
    table.proposer = myRegistration ? myRegistration.name : '管理員';
    try {
      await updateGlobalTournament({ schedule: newSchedule });
      showToast("已發起成績審核，等待同桌確認！", "success");
    } catch (err) { showToast("發起失敗，請檢查權限！", "error"); }
  };

  // 核准/結算成績
  const handleApproveScore = async (rIdx, tIdx) => {
    const newSchedule = JSON.parse(JSON.stringify(schedule));
    const table = newSchedule[rIdx].tables[tIdx];
    const myRegistration = players.find(p => p.uid === currentUser?.uid);
    const approverId = myRegistration ? myRegistration.id : 'admin';

    if (!table.approvals) table.approvals = [];
    if (!table.approvals.includes(approverId)) table.approvals.push(approverId);

    const allApproved = table.players.every(p => table.approvals.includes(p.id));

    if (allApproved || isAdmin) {
      try {
        const updatePromises = table.players.map(p => {
          const scoreObj = table.scores.find(s => s.playerId === p.id);
          const targetPlayer = players.find(player => player.id === p.id);
          if(scoreObj && targetPlayer) {
            return updateDoc(doc(db, 'players', String(p.id)), { 
              points: (targetPlayer.points || 0) + Number(scoreObj.points) 
            });
          }
          return null;
        }).filter(p => p !== null);
        await Promise.all(updatePromises);

        table.status = 'submitted';
        table.isSubmitted = true; 

        const matchRecord = {
          id: Date.now(),
          stage: `初賽 (第 ${rIdx + 1} 局 - 第 ${tIdx + 1} 桌)`,
          ref: { rIdx, tIdx },
          time: new Date().toLocaleTimeString(),
          details: table.players.map((p, i) => ({ player: p.name, pointsChange: Number(table.scores[i].points) }))
        };

        await updateGlobalTournament({ schedule: newSchedule, matches: [matchRecord, ...matches] });
        showToast(isAdmin ? "管理員已強制結算！" : "全員確認完畢，成績已送出！", "success");
      } catch (err) { showToast("結算失敗，請確認網路！", "error"); }
    } else {
      try {
        await updateGlobalTournament({ schedule: newSchedule });
        showToast("您已同意，等待同桌其他人確認...", "success");
      } catch (err) { showToast("操作失敗！", "error"); }
    }
  };

  // 退回成績
  const handleRejectScore = async (rIdx, tIdx) => {
    const newSchedule = JSON.parse(JSON.stringify(schedule));
    const table = newSchedule[rIdx].tables[tIdx];
    table.status = 'playing';
    table.approvals = [];
    table.proposer = null;
    try {
      await updateGlobalTournament({ schedule: newSchedule });
      showToast("已退回，請重新編輯分數！", "error");
    } catch (err) { showToast("退回失敗！", "error"); }
  };

  // 撤銷已結算成績
  const handleUndoSpecificMatch = async (matchId) => {
    if (!window.confirm('確定要撤銷並退回這筆成績嗎？積分將會回溯。')) return;

    const matchToUndo = matches.find(m => m.id === matchId);
    if (!matchToUndo) return;

    try {
      const updatePromises = players.map(player => {
        const detail = matchToUndo.details.find(d => d.player === player.name);
        if (detail) {
          return updateDoc(doc(db, 'players', String(player.id)), { 
            points: (player.points || 0) - detail.pointsChange 
          });
        }
        return null;
      }).filter(p => p !== null);
      
      await Promise.all(updatePromises);

      const newSchedule = JSON.parse(JSON.stringify(schedule));
      if (matchToUndo.ref) {
        const { rIdx, tIdx } = matchToUndo.ref;
        if (newSchedule[rIdx]?.tables[tIdx]) {
          newSchedule[rIdx].tables[tIdx].isSubmitted = false;
          newSchedule[rIdx].tables[tIdx].status = 'playing';
          newSchedule[rIdx].tables[tIdx].approvals = [];
        }
      }

      const newMatches = matches.filter(m => m.id !== matchId);
      await updateGlobalTournament({ schedule: newSchedule, matches: newMatches });
      showToast("成績已撤銷並開放重新編輯！", "success");
    } catch (error) { 
      showToast("撤銷失敗：權限不足或網路錯誤！", "error"); 
    }
  };

  // 產生隨機賽程 (初賽 3 局)
  const handleGenerateSchedule = async () => {
    const activePlayers = players.filter(p => p.status === 'active');
    if (activePlayers.length < 4) { showToast("活躍玩家不足 4 人！", "error"); return; }
    
    let currentSchedule = [];
    for (let r = 0; r < 3; r++) { 
      let shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
      const tableCount = Math.floor(activePlayers.length / 4);
      let roundTables = [];
      let roundLeftovers = shuffled.slice(tableCount * 4);
      let pool = shuffled.slice(0, tableCount * 4);
      
      for (let t = 0; t < tableCount; t++) {
        let playersInTable = pool.slice(t * 4, t * 4 + 4);
        roundTables.push({ 
          id: `R${r+1}-T${t+1}`, 
          players: playersInTable, 
          scores: playersInTable.map(p => ({ playerId: p.id, points: '' })), 
          isSubmitted: false, 
          status: 'playing', 
          approvals: [] 
        });
      }
      currentSchedule.push({ round: r + 1, tables: roundTables, leftovers: roundLeftovers });
    }
    await updateGlobalTournament({ schedule: currentSchedule, matches: [], bracket: null });
    showToast("賽程已產生並發布！", "success");
  };

  // 產生 16 強晉級表
  const handleGenerateBracket = async (autoConfirm = false) => {
    const activeSorted = sortedPlayers.filter(p => p.status === 'active');
    if (activeSorted.length < 16 && !autoConfirm) {
      if (!window.confirm('目前活躍人數不足 16 人，確定要產生嗎？')) return;
    }
    const top16 = activeSorted.slice(0, 16);
    let shuffled16 = [...top16].sort(() => Math.random() - 0.5);
    
    const semis = ['A', 'B', 'C', 'D'].map((id, i) => ({
      id, 
      players: shuffled16.slice(i * 4, i * 4 + 4).map(p => p || null), 
      winner: null
    }));
    
    await updateGlobalTournament({ 
      bracket: { 
        semifinals: semis, 
        finals: { players: [null,null,null,null], winner: null } 
      } 
    });
    showToast("晉級階梯已發布！", "success");
  };

  // 晉級至決賽
  const handleAdvanceToFinals = async (tableIdx, player) => {
    if (!player || !bracket) return;
    const newBracket = JSON.parse(JSON.stringify(bracket));
    newBracket.semifinals[tableIdx].winner = player;
    newBracket.finals.players[tableIdx] = player;
    await updateGlobalTournament({ bracket: newBracket });
  };

  // 設定最終冠軍
  const handleSetChampion = async (player) => {
    if (!player || !bracket) return;
    const newBracket = JSON.parse(JSON.stringify(bracket));
    newBracket.finals.winner = player;
    await updateGlobalTournament({ bracket: newBracket });
  };

  // [管理員] 徹底重置所有資料
  const handleResetAll = async () => {
    try {
      // 1. 清空雲端全域變數
      await updateGlobalTournament({ schedule: [], matches: [], bracket: null });
      // 2. 批次刪除所有玩家
      const deletePromises = players.map(p => deleteDoc(doc(db, 'players', String(p.id))));
      await Promise.all(deletePromises);
      
      showToast("系統已徹底重置，準備迎接新賽季！", "success");
      setActiveStep('info'); 
    } catch (error) {
      console.error("重置失敗:", error);
      showToast("重置失敗：權限不足或網路錯誤！", "error");
    }
  };

  return {
    activeStep, setActiveStep, currentUser, isAdmin, handleLogout, 
    handleSelfRegister, handleUpdatePlayerName, players, sortedPlayers, 
    matches, schedule, bracket, newPlayerName, setNewPlayerName, toast,
    handleAddPlayer, handleApprovePlayer, handleDeletePlayer, 
    handleTableScoreChange, handleProposeScore, handleApproveScore, handleRejectScore, 
    handleUndoSpecificMatch, handleGenerateSchedule, handleGenerateBracket, 
    handleAdvanceToFinals, handleSetChampion, handleResetAll
  };
}
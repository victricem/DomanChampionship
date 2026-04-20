import { useState, useMemo, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDoc } from 'firebase/firestore';

export function useTournament() {
  const [activeStep, setActiveStep] = useState('info');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [bracket, setBracket] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          await getDoc(doc(db, 'settings', 'adminCheck'));
          setIsAdmin(true);
        } catch { setIsAdmin(false); }
      } else { setIsAdmin(false); }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const unsubscribePlayers = onSnapshot(collection(db, 'players'), (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribePlayers();
  }, []);

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

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return 1;
      if (a.status !== 'pending' && b.status === 'pending') return -1;
      return b.points - a.points;
    });
  }, [players]);

  const handleSelfRegister = async (e, characterName) => {
    e.preventDefault();
    if (!characterName.trim() || !currentUser) return;
    if (players.some(p => p.uid === currentUser.uid)) {
      showToast("您已經報名過了喵！", "error"); return;
    }
    try {
      await setDoc(doc(db, 'players', currentUser.uid), {
        uid: currentUser.uid, email: currentUser.email, name: characterName.trim(), 
        points: 0, status: 'pending', createdAt: Date.now()
      });
      showToast("報名資料送出成功！", "success");
    } catch (err) { showToast("報名失敗，請確認權限設定！", "error"); }
  };

  const handleUpdatePlayerName = async (newName) => {
    if (!newName.trim() || !currentUser) return;
    try {
      await updateDoc(doc(db, 'players', currentUser.uid), { name: newName.trim() });
      showToast("角色名稱修改成功！", "success");
    } catch (err) { showToast("修改失敗：您沒有權限修改！", "error"); }
  };

  const handleLogout = () => signOut(auth).then(() => setActiveStep('info'));

  const updateGlobalTournament = async (newData) => {
    try {
      await setDoc(doc(db, 'tournament', 'global'), newData, { merge: true });
    } catch (err) { showToast("雲端更新失敗！", "error"); }
  };

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

  const handleApprovePlayer = async (id) => {
    try {
      await updateDoc(doc(db, 'players', String(id)), { status: 'active' });
      showToast("已核准該名玩家！", "success");
    } catch (error) { showToast("核准失敗：權限不足！", "error"); }
  };

  const handleDeletePlayer = async (id) => {
    if (window.confirm('確定移除？')) {
      try {
        await deleteDoc(doc(db, 'players', String(id)));
        showToast("已移除該參賽者！", "success");
      } catch (error) { showToast("移除失敗：權限不足！", "error"); }
    }
  };

  const handleTableScoreChange = (rIdx, tIdx, pIdx, value) => {
    if (!/^-?\d*$/.test(value)) return;
    const newSchedule = JSON.parse(JSON.stringify(schedule));
    newSchedule[rIdx].tables[tIdx].scores[pIdx].points = value;
    setSchedule(newSchedule); 
  };

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
          ref: { rIdx, tIdx }, // 保留原本在 schedule 裡的位置索引
          time: new Date().toLocaleTimeString(),
          details: table.players.map((p, i) => ({ player: p.name, pointsChange: Number(table.scores[i].points) }))
        };

        await updateGlobalTournament({ schedule: newSchedule, matches: [matchRecord, ...matches] });
        showToast(isAdmin ? "已強制結算！" : "全員確認完畢，成績已送出！", "success");
      } catch (err) { showToast("結算失敗，請確認網路！", "error"); }
    } else {
      try {
        await updateGlobalTournament({ schedule: newSchedule });
        showToast("您已同意，等待其他人確認...", "success");
      } catch (err) { showToast("同意失敗！", "error"); }
    }
  };

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

  // 👉 修改：指定撤銷單筆賽程紀錄
  const handleUndoSpecificMatch = async (matchId) => {
    if (!window.confirm('確定要撤銷並退回這筆成績嗎？')) return;

    const matchToUndo = matches.find(m => m.id === matchId);
    if (!matchToUndo) return;

    try {
      // 1. 從玩家總分中扣回
      const updatePromises = players.map(player => {
        const detail = matchToUndo.details.find(d => d.player === player.name);
        if (detail) {
          return updateDoc(doc(db, 'players', String(player.id)), { 
            points: player.points - detail.pointsChange 
          });
        }
        return null;
      }).filter(p => p !== null);
      
      await Promise.all(updatePromises);

      // 2. 解鎖原本那桌的狀態
      const newSchedule = JSON.parse(JSON.stringify(schedule));
      if (matchToUndo.ref) {
        const { rIdx, tIdx } = matchToUndo.ref;
        if (newSchedule[rIdx]?.tables[tIdx]) {
          newSchedule[rIdx].tables[tIdx].isSubmitted = false;
          newSchedule[rIdx].tables[tIdx].status = 'playing';
          newSchedule[rIdx].tables[tIdx].approvals = [];
        }
      }

      // 3. 從紀錄中刪除該筆
      const newMatches = matches.filter(m => m.id !== matchId);

      await updateGlobalTournament({ schedule: newSchedule, matches: newMatches });
      showToast("成績已撤銷並開放重新編輯！", "success");
    } catch (error) { 
      showToast("撤銷失敗：底層權限不足或網路錯誤！", "error"); 
    }
  };

  const handleGenerateSchedule = async () => {
    const activePlayers = players.filter(p => p.status === 'active');
    if (activePlayers.length < 4) { showToast("活躍玩家不足 4 人！", "error"); return; }
    let bestSchedule = [];
    let bestScore = Infinity;
    for (let attempt = 0; attempt < 100; attempt++) {
      let currentSchedule = [];
      let pairCounts = {}; let leftoverCounts = {}; 
      activePlayers.forEach(p => leftoverCounts[p.id] = 0);
      let currentScore = 0;
      for (let r = 0; r < 3; r++) { 
        let shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
        shuffled.sort((a, b) => leftoverCounts[a.id] - leftoverCounts[b.id]);
        const tableCount = Math.floor(activePlayers.length / 4);
        let roundTables = [];
        let roundLeftovers = shuffled.slice(tableCount * 4);
        roundLeftovers.forEach(p => leftoverCounts[p.id]++);
        let pool = shuffled.slice(0, tableCount * 4);
        for (let t = 0; t < tableCount; t++) {
          let playersInTable = pool.slice(t * 4, t * 4 + 4);
          roundTables.push({ 
            id: `R${r+1}-T${t+1}`, players: playersInTable, 
            scores: playersInTable.map(p => ({ playerId: p.id, points: '' })), 
            isSubmitted: false, status: 'playing', approvals: [] 
          });
        }
        currentSchedule.push({ round: r + 1, tables: roundTables, leftovers: roundLeftovers });
      }
      if (currentScore < bestScore) { bestScore = currentScore; bestSchedule = currentSchedule; }
    }
    await updateGlobalTournament({ schedule: bestSchedule, matches: [], bracket: null });
    showToast("賽程已產生並發布！", "success");
  };

  const handleGenerateBracket = async (autoConfirm = false) => {
    const activeSorted = sortedPlayers.filter(p => p.status === 'active');
    if (activeSorted.length < 16 && !autoConfirm) {
      if (!window.confirm('人數不足 16 人，確定產生？')) return;
    }
    const top16 = activeSorted.slice(0, 16);
    let shuffled16 = [...top16].sort(() => Math.random() - 0.5);
    const semis = ['A', 'B', 'C', 'D'].map((id, i) => ({
      id, players: shuffled16.slice(i * 4, i * 4 + 4).map(p => p || null), winner: null
    }));
    await updateGlobalTournament({ bracket: { semifinals: semis, finals: { players: [null,null,null,null], winner: null } } });
    showToast("晉級階梯已發布！", "success");
  };

  const handleAdvanceToFinals = async (tableIdx, player) => {
    if (!player) return;
    const newBracket = JSON.parse(JSON.stringify(bracket));
    newBracket.semifinals[tableIdx].winner = player;
    newBracket.finals.players[tableIdx] = player;
    await updateGlobalTournament({ bracket: newBracket });
  };

  const handleSetChampion = async (player) => {
    if (!player) return;
    const newBracket = JSON.parse(JSON.stringify(bracket));
    newBracket.finals.winner = player;
    await updateGlobalTournament({ bracket: newBracket });
  };

// 👉 升級版：徹底清空所有資料 (賽程 + 玩家)
  const handleResetAll = async () => {
    // 第一層確認
    if (window.confirm('【危險操作】確定要清空「所有參賽者名單」與「賽事紀錄」嗎？\n這通常用於準備舉辦下一屆新賽事。')) {
      // 第二層確認
      if (window.confirm('【最終確認】資料刪除後將「完全無法復原」！\n你確定要徹底清空整個資料庫嗎？')) {
        try {
          // 1. 清空全域賽程、紀錄與晉級表
          await updateGlobalTournament({ schedule: [], matches: [], bracket: null });
          
          // 2. 刪除 Firestore 中的所有玩家資料
          const deletePromises = players.map(p => deleteDoc(doc(db, 'players', String(p.id))));
          await Promise.all(deletePromises);

          showToast("系統已徹底重置，準備迎接新賽季！", "success");
          setActiveStep('info'); // 清空後自動導回首頁
        } catch (error) {
          console.error("重置失敗:", error);
          showToast("重置失敗：權限不足或網路錯誤！", "error");
        }
      }
    }
  };

  return {
    activeStep, setActiveStep, currentUser, isAdmin, handleLogout, handleSelfRegister, handleUpdatePlayerName,
    players, sortedPlayers, matches, schedule, bracket, newPlayerName, setNewPlayerName, toast,
    handleAddPlayer, handleApprovePlayer, handleDeletePlayer, handleTableScoreChange, 
    handleProposeScore, handleApproveScore, handleRejectScore, 
    handleUndoSpecificMatch, // 👈 導出新的指定撤銷功能
    handleGenerateSchedule, handleGenerateBracket, handleAdvanceToFinals, handleSetChampion, handleResetAll
  };
}
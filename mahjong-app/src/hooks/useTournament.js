import { useState, useMemo, useEffect } from 'react';
import { auth, db } from '../firebase';
// 引入關鍵函式：處理跳轉結果與持久化狀態
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

  // 🌟 [核心修復] Auth 邏輯：處理重定向、狀態持久化與管理員判定
  useEffect(() => {
    console.log("🚀 [System] 初始化 Tournament Hook...");

    // 1. 設定登入狀態持久化
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // 2. 捕捉重定向回來的憑證
        return getRedirectResult(auth);
      })
      .then((result) => {
        if (result?.user) {
          console.log("✅ [Auth] 捕捉到重定向使用者:", result.user.email);
          setCurrentUser(result.user);
        }
      })
      .catch((error) => {
        console.error("❌ [Auth] 重定向捕捉錯誤:", error.code);
      });

    // 3. 監聽全域身分變更
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log("🔥 [Auth] 目前狀態:", user ? `已登入 (${user.email})` : "未登入");
      setCurrentUser(user);

      if (user) {
        try {
          const adminEmails = ['tony80709@yahoo.com.tw', 's85543s2169@gmail.com'];
          const userEmail = user.email ? user.email.toLowerCase() : '';

          // 嘗試讀取管理員核對文件
          await getDoc(doc(db, 'settings', 'adminCheck'));

          if (adminEmails.includes(userEmail)) {
            console.log("👑 [Auth] 管理員權限已確認");
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (e) {
          // 權限不足則判定為一般使用者
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 監聽資料庫變動
  useEffect(() => {
    const unsubscribePlayers = onSnapshot(collection(db, 'players'), (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubscribeGlobal = onSnapshot(doc(db, 'tournament', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSchedule(data.schedule || []);
        setMatches(data.matches || []);
        setBracket(data.bracket || null);
      }
    });
    return () => {
      unsubscribePlayers();
      unsubscribeGlobal();
    };
  }, []);

  // 🌟 [邏輯修改] 判定是否為「正式參賽者」
  // 只有 status 不是 visitor 且不是 null 時，才算真正報名完成
  const isRegistered = useMemo(() => {
    const me = players.find(p => p.uid === currentUser?.uid);
    return me && me.status !== 'visitor';
  }, [players, currentUser]);

  // 排序邏輯
  const sortedPlayers = useMemo(() => {
    return [...players]
      .filter(p => p.status !== 'visitor') // 僅排序正式參賽者
      .sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return 1;
        if (a.status !== 'pending' && b.status === 'pending') return -1;
        return (b.points || 0) - (a.points || 0);
      });
  }, [players]);

  // --- 使用者操作函式 ---

  // 🌟 [新增] 快速設定暱稱：狀態設為 visitor，僅供顯示不進入報名名單
  const handleQuickSetName = async (name) => {
    if (!name.trim() || !currentUser) return;
    try {
      await setDoc(doc(db, 'players', currentUser.uid), {
        uid: currentUser.uid,
        email: currentUser.email,
        name: name.trim(),
        points: 0,
        status: 'visitor', // 訪客模式
        createdAt: Date.now()
      }, { merge: true });
      showToast("暱稱設定成功！", "success");
    } catch (err) {
      showToast("設定失敗，請檢查權限！", "error");
    }
  };

  // 🌟 [修改] 正式提交報名：將狀態轉為 pending
  const handleSelfRegister = async (e, characterName) => {
    if (e) e.preventDefault();
    if (!characterName.trim() || !currentUser) return;
    try {
      await setDoc(doc(db, 'players', currentUser.uid), {
        uid: currentUser.uid, 
        email: currentUser.email, 
        name: characterName.trim(), 
        points: 0, 
        status: 'pending', // 正式進入報名審核
        createdAt: Date.now()
      }, { merge: true });
      showToast("報名申請已送出！", "success");
    } catch (err) { 
      showToast("報名失敗，請稍後再試！", "error"); 
    }
  };

  // 修改角色名稱
  const handleUpdatePlayerName = async (newName) => {
    if (!newName.trim() || !currentUser) return;
    try {
      await updateDoc(doc(db, 'players', currentUser.uid), { name: newName.trim() });
      showToast("名稱修改成功！", "success");
    } catch (err) { showToast("修改失敗：權限不足！", "error"); }
  };

  // 登出
  const handleLogout = () => signOut(auth).then(() => {
    setCurrentUser(null);
    setIsAdmin(false);
    setActiveStep('info');
  });

  // 全域更新
  const updateGlobalTournament = async (newData) => {
    try {
      await setDoc(doc(db, 'tournament', 'global'), newData, { merge: true });
    } catch (err) { showToast("同步至雲端失敗！", "error"); }
  };

  // [管理員] 手動操作函式
  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    try {
      const newRef = doc(collection(db, 'players'));
      await setDoc(newRef, { uid: newRef.id, name: newPlayerName.trim(), points: 0, status: 'pending' });
      setNewPlayerName('');
      showToast("代報名成功！", "success");
    } catch (error) { showToast("權限不足！", "error"); }
  };

  const handleApprovePlayer = async (id) => {
    try {
      await updateDoc(doc(db, 'players', String(id)), { status: 'active' });
      showToast("已核准參賽資格！", "success");
    } catch (error) { showToast("核准失敗！", "error"); }
  };

  const handleDeletePlayer = async (id) => {
    if (window.confirm('確定移除該名使用者？')) {
      try {
        await deleteDoc(doc(db, 'players', String(id)));
        showToast("已成功移除！", "success");
      } catch (error) { showToast("移除失敗！", "error"); }
    }
  };

  // 賽程分數處理
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
      showToast("請填寫完整分數！", "error"); return;
    }
    const me = players.find(p => p.uid === currentUser?.uid);
    table.status = 'pending';
    table.approvals = me ? [me.id] : ['admin'];
    table.proposer = me ? me.name : '管理員';
    await updateGlobalTournament({ schedule: newSchedule });
    showToast("已發起審核！", "success");
  };

  const handleApproveScore = async (rIdx, tIdx) => {
    const newSchedule = JSON.parse(JSON.stringify(schedule));
    const table = newSchedule[rIdx].tables[tIdx];
    const me = players.find(p => p.uid === currentUser?.uid);
    const approverId = me ? me.id : 'admin';

    if (!table.approvals) table.approvals = [];
    if (!table.approvals.includes(approverId)) table.approvals.push(approverId);

    const allApproved = table.players.every(p => table.approvals.includes(p.id));

    if (allApproved || isAdmin) {
      try {
        const updatePromises = table.players.map(p => {
          const scoreObj = table.scores.find(s => s.playerId === p.id);
          const target = players.find(player => player.id === p.id);
          return scoreObj && target ? updateDoc(doc(db, 'players', String(p.id)), { 
            points: (target.points || 0) + Number(scoreObj.points) 
          }) : null;
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
        showToast("成績已正式結算！", "success");
      } catch (err) { showToast("結算失敗！", "error"); }
    } else {
      await updateGlobalTournament({ schedule: newSchedule });
      showToast("已確認，等待其他人...", "success");
    }
  };

  const handleRejectScore = async (rIdx, tIdx) => {
    const newSchedule = JSON.parse(JSON.stringify(schedule));
    newSchedule[rIdx].tables[tIdx].status = 'playing';
    newSchedule[rIdx].tables[tIdx].approvals = [];
    await updateGlobalTournament({ schedule: newSchedule });
    showToast("已退回修改！", "error");
  };

  const handleUndoSpecificMatch = async (matchId) => {
    if (!window.confirm('確定要撤銷積分嗎？')) return;
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    try {
      const rollbackPromises = players.map(p => {
        const detail = match.details.find(d => d.player === p.name);
        return detail ? updateDoc(doc(db, 'players', String(p.id)), { points: (p.points || 0) - detail.pointsChange }) : null;
      }).filter(p => p !== null);
      await Promise.all(rollbackPromises);

      const newSchedule = JSON.parse(JSON.stringify(schedule));
      if (match.ref && newSchedule[match.ref.rIdx]?.tables[match.ref.tIdx]) {
        const t = newSchedule[match.ref.rIdx].tables[match.ref.tIdx];
        t.isSubmitted = false; t.status = 'playing'; t.approvals = [];
      }
      await updateGlobalTournament({ schedule: newSchedule, matches: matches.filter(m => m.id !== matchId) });
      showToast("積分已回溯！", "success");
    } catch (e) { showToast("撤銷失敗！", "error"); }
  };

  const handleGenerateSchedule = async () => {
    const activeOnes = players.filter(p => p.status === 'active');
    if (activeOnes.length < 4) { showToast("人數不足 4 人！", "error"); return; }
    let s = [];
    for (let r = 0; r < 3; r++) { 
      let shuffled = [...activeOnes].sort(() => Math.random() - 0.5);
      const count = Math.floor(activeOnes.length / 4);
      let tables = [];
      for (let t = 0; t < count; t++) {
        let pInT = shuffled.slice(t * 4, t * 4 + 4);
        tables.push({ 
          id: `R${r+1}-T${t+1}`, players: pInT, 
          scores: pInT.map(p => ({ playerId: p.id, points: '' })), 
          isSubmitted: false, status: 'playing', approvals: [] 
        });
      }
      s.push({ round: r + 1, tables, leftovers: shuffled.slice(count * 4) });
    }
    await updateGlobalTournament({ schedule: s, matches: [], bracket: null });
    showToast("賽程已發布！", "success");
  };

  const handleGenerateBracket = async (auto = false) => {
    const sorted = sortedPlayers.filter(p => p.status === 'active');
    if (sorted.length < 16 && !auto) { if (!window.confirm('人數不足 16 人，確定產生？')) return; }
    const top16 = sorted.slice(0, 16);
    let shuf = [...top16].sort(() => Math.random() - 0.5);
    const semis = ['A', 'B', 'C', 'D'].map((id, i) => ({
      id, players: shuf.slice(i * 4, i * 4 + 4).map(p => p || null), winner: null
    }));
    await updateGlobalTournament({ bracket: { semifinals: semis, finals: { players: [null,null,null,null], winner: null } } });
    showToast("晉級表已發布！", "success");
  };

  const handleAdvanceToFinals = async (idx, player) => {
    if (!player || !bracket) return;
    const b = JSON.parse(JSON.stringify(bracket));
    b.semifinals[idx].winner = player;
    b.finals.players[idx] = player;
    await updateGlobalTournament({ bracket: b });
  };

  const handleSetChampion = async (player) => {
    if (!player || !bracket) return;
    const b = JSON.parse(JSON.stringify(bracket));
    b.finals.winner = player;
    await updateGlobalTournament({ bracket: b });
  };

  const handleResetAll = async () => {
    try {
      await updateGlobalTournament({ schedule: [], matches: [], bracket: null });
      await Promise.all(players.map(p => deleteDoc(doc(db, 'players', String(p.id)))));
      showToast("系統已徹底清空！", "success");
      setActiveStep('info'); 
    } catch (e) { showToast("重置失敗！", "error"); }
  };

  return {
    activeStep, setActiveStep, currentUser, isAdmin, isRegistered, handleLogout, 
    handleSelfRegister, handleQuickSetName, handleUpdatePlayerName, players, sortedPlayers, 
    matches, schedule, bracket, newPlayerName, setNewPlayerName, toast,
    handleAddPlayer, handleApprovePlayer, handleDeletePlayer, 
    handleTableScoreChange, handleProposeScore, handleApproveScore, handleRejectScore, 
    handleUndoSpecificMatch, handleGenerateSchedule, handleGenerateBracket, 
    handleAdvanceToFinals, handleSetChampion, handleResetAll
  };
}
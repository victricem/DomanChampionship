import { useState, useMemo, useEffect } from 'react';
import { auth, db } from '../firebase';
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
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', action: null });
  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };
  const requestConfirm = (title, message, action) => {
    setConfirmModal({ isOpen: true, title, message, action });
  };
  const closeConfirm = () => {
    setConfirmModal({ isOpen: false, title: '', message: '', action: null });
  };
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [bracket, setBracket] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  useEffect(() => {
    console.log("🚀 [System] 初始化 Tournament Hook...");

    setPersistence(auth, browserLocalPersistence)
      .then(() => getRedirectResult(auth))
      .then((result) => {
        if (result?.user) {
          setCurrentUser(result.user);
        }
      })
      .catch((error) => console.error("❌ [Auth] 重定向捕捉錯誤:", error.code));
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const adminEmails = ['tony80709@yahoo.com.tw', 's85543s2169@gmail.com', 'pig970902@gmail.com'];
          const userEmail = user.email ? user.email.toLowerCase() : '';
          await getDoc(doc(db, 'settings', 'adminCheck'));
          if (adminEmails.includes(userEmail)) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (e) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);
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
  const isRegistered = useMemo(() => {
    const me = players.find(p => p.uid === currentUser?.uid);
    return me && me.status !== 'visitor';
  }, [players, currentUser]);

  const sortedPlayers = useMemo(() => {
    return [...players]
      .filter(p => p.status !== 'visitor') 
      .sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return 1;
        if (a.status !== 'pending' && b.status === 'pending') return -1;
        return (b.points || 0) - (a.points || 0);
      });
  }, [players]);
  const checkDuplicateName = (nameToCheck, excludeUid = null) => {
    const isExist = players.some(p => 
      p.name.toLowerCase() === nameToCheck.trim().toLowerCase() && 
      p.uid !== excludeUid
    );
    if (isExist) {
      showToast("此角色名稱已被使用，請更換一個喵！", "error"); 
    }
    return isExist;
  };
  const updateGlobalTournament = async (newData) => {
    try {
      await setDoc(doc(db, 'tournament', 'global'), newData, { merge: true });
      return true;
    } catch (err) { 
      console.error("Firebase Update Error:", err);
      if (err.code === 'permission-denied') {
        showToast("操作失敗：權限不足！請確認 Firebase 規則已開放", "error");
      } else {
        showToast("雲端更新失敗，請檢查網路狀態！", "error"); 
      }
      return false;
    }
  };
  const handleQuickSetName = async (name) => {
    if (!name.trim() || !currentUser) return;
    if (checkDuplicateName(name, currentUser.uid)) return;
    try {
      await setDoc(doc(db, 'players', currentUser.uid), {
        uid: currentUser.uid, email: currentUser.email, name: name.trim(), points: 0, status: 'visitor', createdAt: Date.now()
      }, { merge: true });
      showToast("暱稱設定成功！", "success");
    } catch (err) { showToast("設定失敗，請檢查權限！", "error"); }
  };
  const handleSelfRegister = async (e, characterName) => {
    if (e) e.preventDefault();
    if (!characterName.trim() || !currentUser) return;
    if (checkDuplicateName(characterName, currentUser.uid)) return;
    try {
      await setDoc(doc(db, 'players', currentUser.uid), {
        uid: currentUser.uid, email: currentUser.email, name: characterName.trim(), points: 0, status: 'pending', createdAt: Date.now()
      }, { merge: true });
      showToast("報名申請已送出！", "success");
    } catch (err) { showToast("報名失敗，請稍後再試！", "error"); }
  };

  const handleUpdatePlayerName = async (newName) => {
    if (!newName.trim() || !currentUser) return;
    if (checkDuplicateName(newName, currentUser.uid)) return;
    try {
      await updateDoc(doc(db, 'players', currentUser.uid), { name: newName.trim() });
      showToast("名稱修改成功！", "success");
    } catch (err) { showToast("修改失敗：權限不足！", "error"); }
  };
  const handleLogout = () => signOut(auth).then(() => {
    setCurrentUser(null);
    setIsAdmin(false);
    setActiveStep('info');
  });
  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    if (checkDuplicateName(newPlayerName)) return;
    try {
      const newRef = doc(collection(db, 'players'));
      await setDoc(newRef, { uid: newRef.id, name: newPlayerName.trim(), points: 0, status: 'pending' });
      setNewPlayerName('');
      showToast("代報名成功！", "success");
    } catch (error) { showToast("權限不足！", "error"); }
  };
  const handleApprovePlayer = async (id, adminName) => {
    try {
      await updateDoc(doc(db, 'players', String(id)), { 
        status: 'active',
        approvedBy: adminName
      });
      showToast("已核准參賽資格！", "success");
    } catch (error) { showToast("核准失敗！", "error"); }
  };
  const handleDeletePlayer = (id) => {
    requestConfirm('移除參賽者', '確定要移除該名使用者嗎？此動作將無法復原。', async () => {
      try {
        await deleteDoc(doc(db, 'players', String(id)));
        showToast("已成功移除！", "success");
      } catch (error) { showToast("移除失敗！", "error"); }
    });
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
    if (table.scores.some(s => s.points === '' || s.points === '-' || isNaN(Number(s.points)))) {
      showToast("請填寫所有玩家的有效數字分數！", "error"); 
      return;
    }
    const me = players.find(p => p.uid === currentUser?.uid);
    table.status = 'pending';
    table.approvals = me ? [me.id] : ['admin'];
    table.proposer = me ? me.name : '管理員';
    const success = await updateGlobalTournament({ schedule: newSchedule });
    if (success) showToast("已發起審核，等待同桌確認！", "success");
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
        const success = await updateGlobalTournament({ schedule: newSchedule, matches: [matchRecord, ...matches] });
        if (success) showToast(isAdmin ? "管理員已強制結算！" : "全員確認完畢，成績已送出！", "success");
      } catch (err) { showToast("結算資料庫失敗，請確認網路！", "error"); }
    } else {
      const success = await updateGlobalTournament({ schedule: newSchedule });
      if (success) showToast("您已同意，等待同桌其他人確認...", "success");
    }
  };
  const handleRejectScore = async (rIdx, tIdx) => {
    const newSchedule = JSON.parse(JSON.stringify(schedule));
    newSchedule[rIdx].tables[tIdx].status = 'playing';
    newSchedule[rIdx].tables[tIdx].approvals = [];
    const success = await updateGlobalTournament({ schedule: newSchedule });
    if (success) showToast("已退回修改狀態！", "error");
  };
  const handleUndoSpecificMatch = (matchId) => {
    requestConfirm('撤銷成績', '確定要撤銷這筆積分嗎？選手的積分將會回溯，且該桌將退回編輯狀態。', async () => {
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
    });
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
  const handleGenerateBracket = (auto = false) => {
    const sorted = sortedPlayers.filter(p => p.status === 'active');
    const executeGen = async () => {
      const top16 = sorted.slice(0, 16);
      let shuf = [...top16].sort(() => Math.random() - 0.5);
      const semis = ['A', 'B', 'C', 'D'].map((id, i) => ({
        id, players: shuf.slice(i * 4, i * 4 + 4).map(p => p || null), winner: null
      }));
      await updateGlobalTournament({ bracket: { semifinals: semis, finals: { players: [null,null,null,null], winner: null } } });
      showToast("晉級表已發布！", "success");
    };
    if (sorted.length < 16 && !auto) { 
      requestConfirm('人數不足警告', '目前活躍人數不足 16 人，確定要強制產生晉級表嗎？', executeGen);
    } else {
      executeGen();
    }
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
    matches, schedule, bracket, newPlayerName, setNewPlayerName, toast, confirmModal, closeConfirm,
    handleAddPlayer, handleApprovePlayer, handleDeletePlayer, 
    handleTableScoreChange, handleProposeScore, handleApproveScore, handleRejectScore, 
    handleUndoSpecificMatch, handleGenerateSchedule, handleGenerateBracket, 
    handleAdvanceToFinals, handleSetChampion, handleResetAll
  };
}
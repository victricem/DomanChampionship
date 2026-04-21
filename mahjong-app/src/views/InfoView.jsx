import React, { useState, useEffect } from 'react';
import { Crown, Swords, Shuffle, Trophy, AlertCircle, ChevronRight, Loader2, Calendar, Clock, Zap, Target, Gift, Coins, Timer } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import mainBanner from '../assets/benner.webp';

export default function InfoView({ setActiveStep, currentUser }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistrationClosed, setIsRegistrationClosed] = useState(false);

  const REGISTRATION_DEADLINE = new Date('2026-05-29T21:00:00+08:00').getTime();

  useEffect(() => {
    const checkDeadline = () => {
      const now = new Date().getTime();
      if (now >= REGISTRATION_DEADLINE) {
        setIsRegistrationClosed(true);
      }
    };
    checkDeadline();
    const timer = setInterval(checkDeadline, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = async () => {
    if (currentUser) {
      setActiveStep('register');
      return;
    }
    if (isRegistrationClosed) return;

    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setActiveStep('register');
      }
    } catch (error) {
      console.error("❌ [Auth] 登入失敗:", error.code);
      if (error.code === 'auth/popup-blocked') {
        alert("登入視窗被瀏覽器攔截了！請點擊網址列右方的圖示允許彈出視窗。");
      } else if (error.code !== 'auth/cancelled-popup-request') {
        alert("登入驗證發生錯誤，請再試一次！");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
      
      {/* --- Hero Section --- */}
      <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-slate-800 flex flex-col">
        
        <div className="relative w-full h-64 md:h-[450px] bg-slate-950 overflow-hidden">
          <img 
            src={mainBanner} 
            alt="多瑪雀王主視覺" 
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent"></div>
        </div>

        <div className="absolute top-2/3 -left-32 w-96 h-96 bg-orange-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-0 -right-32 w-96 h-96 bg-amber-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10 pointer-events-none"></div>

        <div className="relative z-10 px-6 pb-12 md:pb-16 flex flex-col items-center text-center -mt-16 md:-mt-24">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-orange-500/20 blur-2xl rounded-full"></div>
            <Crown className="w-20 h-20 md:w-28 md:h-28 text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.6)] relative z-10" />
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-400 to-amber-200 tracking-[0.1em] drop-shadow-xl mb-6">
            多瑪雀王爭霸戰
          </h1>
          
          <p className="text-lg md:text-2xl text-amber-100/80 font-bold tracking-[0.3em] flex items-center justify-center gap-4 mb-8">
            <Swords className="w-5 h-5 md:w-6 md:h-6 text-orange-500" /> 
            第一屆頂尖對決 
            <Swords className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
          </p>

          <div className="mb-10 px-6 py-2 bg-red-500/10 border border-red-500/30 rounded-full flex items-center gap-3 animate-pulse">
            <Timer className="w-5 h-5 text-red-400" />
            <span className="text-red-100 text-sm md:text-base font-bold tracking-widest">
              報名期限：即日起 至 5/29 (五) 21:00 止
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-4 w-full max-w-3xl mb-2">
            <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-500/30">
                <Calendar className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-left">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter mb-1">Day 1 初賽 (東風戰)</p>
                <p className="text-white text-xl font-black italic">5/30 <span className="text-sm not-italic font-bold text-slate-300">(六)</span> 21:00</p>
              </div>
            </div>
            <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-5 flex items-center gap-5 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-left">
                <p className="text-amber-400 text-xs font-bold uppercase tracking-tighter mb-1">Day 2 複賽/決賽 (半莊戰)</p>
                <p className="text-white text-xl font-black italic">5/31 <span className="text-sm not-italic font-bold text-slate-300">(日)</span> 21:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-orange-500/50"></div>
          <h2 className="text-3xl font-black text-white tracking-widest flex items-center gap-3">
            <Gift className="text-orange-500" /> 賽事獎勵
          </h2>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-orange-500/50"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative group bg-gradient-to-b from-amber-500/20 to-slate-900 rounded-[2.5rem] p-8 border border-amber-500/30 text-center overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(245,158,11,0.2)]">
            <div className="absolute top-0 right-0 p-4"><Crown className="w-10 h-10 text-amber-500 opacity-20 rotate-12" /></div>
            <Trophy className="w-20 h-20 text-amber-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] group-hover:rotate-12 transition-transform duration-500" />
            <p className="text-amber-500 font-black tracking-[0.3em] text-sm mb-2 uppercase">Champion</p>
            <h4 className="text-2xl font-black text-white mb-3">第一名</h4>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-black text-white italic">300</span>
              <span className="text-xl font-bold text-amber-400/80">萬 Gil</span>
            </div>
          </div>

          <div className="relative group bg-gradient-to-b from-slate-400/10 to-slate-900 rounded-[2.5rem] p-8 border border-slate-700 text-center overflow-hidden transition-all duration-500 hover:scale-[1.03]">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
              <MedalIcon className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-400 font-black tracking-[0.3em] text-sm mb-2 uppercase">Runner-up</p>
            <h4 className="text-2xl font-black text-white mb-3">第二名</h4>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-black text-white italic">200</span>
              <span className="text-xl font-bold text-slate-400">萬 Gil</span>
            </div>
          </div>

          <div className="relative group bg-gradient-to-b from-orange-900/20 to-slate-900 rounded-[2.5rem] p-8 border border-orange-900/30 text-center overflow-hidden transition-all duration-500 hover:scale-[1.03]">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-900/20">
              <Coins className="w-9 h-9 text-orange-600" />
            </div>
            <p className="text-orange-700 font-black tracking-[0.3em] text-sm mb-2 uppercase">Third Place</p>
            <h4 className="text-2xl font-black text-white mb-3">第三名</h4>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-black text-white italic">100</span>
              <span className="text-xl font-bold text-orange-700">萬 Gil</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- 賽程階段 --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="group bg-slate-900 rounded-3xl p-8 shadow-xl border-t-4 border-orange-500 border-x border-b border-slate-800 hover:-translate-y-2 transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30 group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8 text-orange-400" />
            </div>
            <span className="bg-orange-500/10 text-orange-500 text-xs font-black px-3 py-1 rounded-lg border border-orange-500/20">東風戰</span>
          </div>
          <h3 className="text-2xl font-black text-slate-100 mb-2">STAGE 1 : 初賽</h3>
          <p className="text-orange-500/90 text-sm font-bold mb-4 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> 5/30 (六) 21:00
          </p>
          <p className="text-slate-400 leading-relaxed font-medium">
            初賽採用 <strong className="text-slate-100">東風戰(帶食斷)</strong>，速戰速決。每位選手須完成 3 局，總點數排名前 <strong className="text-orange-400 text-lg">16 強</strong> 晉級。
          </p>
        </div>

        <div className="group bg-slate-900 rounded-3xl p-8 shadow-xl border-t-4 border-amber-500 border-x border-b border-slate-800 hover:-translate-y-2 transition-all duration-300 delay-75">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform">
              <Target className="w-8 h-8 text-amber-400" />
            </div>
            <span className="bg-amber-500/10 text-amber-500 text-xs font-black px-3 py-1 rounded-lg border border-amber-500/20">半莊戰</span>
          </div>
          <h3 className="text-2xl font-black text-slate-100 mb-2">STAGE 2 : 16強</h3>
          <p className="text-amber-500/90 text-sm font-bold mb-4 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> 5/31 (日) 21:00
          </p>
          <p className="text-slate-400 leading-relaxed font-medium">
            複賽改為 <strong className="text-slate-100">半莊戰(帶食斷)</strong>。4 桌分組廝殺，僅有 <strong className="text-amber-400 text-lg">該桌第 1 名</strong> 能獲得決賽門票。
          </p>
        </div>

        <div className="group bg-slate-900 rounded-3xl p-8 shadow-xl border-t-4 border-yellow-400 border-x border-b border-slate-800 hover:-translate-y-2 transition-all duration-300 delay-150">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-yellow-400/20 rounded-2xl flex items-center justify-center border border-yellow-400/30 group-hover:scale-110 transition-transform">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <span className="bg-yellow-400/10 text-yellow-400 text-xs font-black px-3 py-1 rounded-lg border border-yellow-400/20">半莊戰</span>
          </div>
          <h3 className="text-2xl font-black text-slate-100 mb-2">FINAL : 決賽</h3>
          <p className="text-yellow-400/90 text-sm font-bold mb-4 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> 5/31 (日) 緊接複賽後
          </p>
          <p className="text-slate-400 leading-relaxed font-medium">
            最後 4 人同桌進行頂尖 <strong className="text-slate-100">半莊戰(帶食斷)</strong>。總結算最高分者，正式加冕為<strong className="text-yellow-400 text-lg uppercase ml-1">初代多瑪雀王</strong>！
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-24 h-24 shrink-0 bg-slate-800 rounded-3xl flex items-center justify-center border-2 border-slate-700 shadow-2xl transform -rotate-3">
            <Shuffle className="w-12 h-12 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">Rule Setting</span>
              <h3 className="text-3xl font-black text-white">點數與場風設定</h3>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed max-w-3xl">
              所有對局起步皆為 <strong className="text-white">25,000</strong> 點。
              初賽採取效率導向的 <strong className="text-orange-400">東風戰(帶食斷)</strong>；
              複賽與決賽則改為競技導向的 <strong className="text-amber-400">半莊戰(帶食斷)</strong>。
              成績登記將以結算畫面上的「真實剩餘點數」為準。
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 border border-slate-800 flex gap-6 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
            <span className="text-orange-400 font-black">01</span>
          </div>
          <div>
            <h4 className="font-black text-xl text-slate-100 mb-2">參賽保證金</h4>
            <p className="text-slate-400 leading-relaxed font-medium">
              報名需預繳 <strong className="text-orange-400">20 萬 Gil</strong> 保證金。該費用將於選手<strong className="text-white">順利完賽後全額發還</strong>；若無故缺席或未完成賽事，保證金將<strong className="text-red-400">不予退還</strong>。
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 border border-slate-800 flex gap-6 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
            <span className="text-orange-400 font-black">02</span>
          </div>
          <div>
            <h4 className="font-black text-xl text-slate-100 mb-2">報名審核</h4>
            <p className="text-slate-400 leading-relaxed font-medium">
              送出資料後需經管理員審核並收取保證金，狀態轉為「報名成功」後才正式取得資格。
            </p>
          </div>
        </div>
      </div>

      {/* --- CTA 按鈕區 --- */}
      <div className="pt-6 pb-10 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 blur-[80px] -z-10"></div>
        
        <button 
          onClick={handleAction} 
          disabled={isLoggingIn || (isRegistrationClosed && !currentUser)}
          className={`group relative inline-flex items-center justify-center px-16 py-7 text-2xl md:text-3xl font-black text-white transition-all duration-300 ease-in-out rounded-full transform 
            ${(isRegistrationClosed && !currentUser) 
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed scale-95' 
              : 'bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-[length:200%_auto] hover:bg-right hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] hover:-translate-y-2'
            } ${isLoggingIn ? 'opacity-80 scale-95 cursor-wait' : ''}`}
        >
          {(!isLoggingIn && !isRegistrationClosed) && <span className="absolute inset-0 w-full h-full rounded-full ring-4 ring-orange-500/30 group-hover:ring-orange-400/50 animate-ping opacity-20"></span>}
          
          <span className="tracking-[0.1em] drop-shadow-md">
            {currentUser 
              ? '進入報名系統' 
              : (isRegistrationClosed 
                  ? '報名已截止' 
                  : (isLoggingIn ? '驗證中...' : '立即登入報名')
                )
            }
          </span>
          
          {isLoggingIn ? (
            <Loader2 className="w-8 h-8 md:w-10 md:h-10 ml-4 animate-spin text-yellow-100" />
          ) : (
            !isRegistrationClosed && <ChevronRight className="w-8 h-8 md:w-10 md:h-10 ml-2 group-hover:translate-x-3 transition-transform duration-300" />
          )}
        </button>

        {isRegistrationClosed && !currentUser && (
          <p className="text-red-400/80 text-sm mt-6 font-bold tracking-widest flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" /> 很抱歉，本屆賽事報名時間已結束。
          </p>
        )}
      </div>
    </div>
  );
}

function MedalIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6.1 2h11.8a2 2 0 0 1 1.7.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
      <path d="M11 12 5.12 2.2" />
      <path d="m13 12 5.88-9.8" />
      <path d="M8 7h8" />
      <circle cx="12" cy="17" r="5" />
      <path d="M12 18v-2" />
    </svg>
  );
}
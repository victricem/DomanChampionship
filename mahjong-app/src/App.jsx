import React from 'react';
import { useTournament } from './hooks/useTournament';
import Navbar from './components/Navbar';
import NavigationTabs from './components/NavigationTabs';
import Footer from './components/Footer'; // 👉 引入 Footer
import InfoView from './views/InfoView';
import RegisterView from './views/RegisterView';
import MatchmakingView from './views/MatchmakingView';
import TournamentView from './views/TournamentView';
import BracketView from './views/BracketView';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const tournamentState = useTournament();
  const { toast, currentUser, players, isAdmin } = tournamentState;

  const isRegistered = players.some(p => p.uid === currentUser?.uid);
  const isLandingPage = tournamentState.activeStep === 'info';

  return (
    // 加入 flex-col 和 min-h-screen 確保 Footer 佈局正確
    <div className="flex flex-col min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-orange-500/30 relative">
      
      {/* 全域 Toast */}
      {toast.show && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in flex items-center shadow-2xl rounded-2xl px-6 py-3 border border-slate-700 bg-slate-900/95 backdrop-blur text-slate-100 min-w-[300px] justify-center">
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
          )}
          <span className="font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      <Navbar 
        currentUser={currentUser} 
        handleLogout={tournamentState.handleLogout} 
        players={players}
        isRegistered={isRegistered}
      />
      
      {/* 內容區塊加上 flex-grow */}
      <div className="flex-grow pt-4 px-4 md:px-8 max-w-7xl mx-auto w-full">
        
        <NavigationTabs 
          activeStep={tournamentState.activeStep} 
          setActiveStep={tournamentState.setActiveStep} 
          currentUser={currentUser}
          isAdmin={isAdmin}
          isRegistered={isRegistered}
        />

        {tournamentState.activeStep === 'info' && (
          <InfoView 
            setActiveStep={tournamentState.setActiveStep} 
            currentUser={currentUser} 
          />
        )}
        {tournamentState.activeStep === 'register' && <RegisterView {...tournamentState} />}
        {tournamentState.activeStep === 'matchmaking' && <MatchmakingView {...tournamentState} />}
        {tournamentState.activeStep === 'tournament' && <TournamentView {...tournamentState} />}
        {tournamentState.activeStep === 'bracket' && <BracketView {...tournamentState} />}
      </div>

      {/* 👉 將 Footer 放在這裡，位於所有頁面內容的最下方 */}
      <Footer />
    </div>
  );
}
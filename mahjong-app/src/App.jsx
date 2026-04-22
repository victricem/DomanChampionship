import React from 'react';
import { useTournament } from './hooks/useTournament';
import Navbar from './components/Navbar';
import NavigationTabs from './components/NavigationTabs';
import Footer from './components/Footer';
import InfoView from './views/InfoView';
import RegisterView from './views/RegisterView';
import MatchmakingView from './views/MatchmakingView';
import TournamentView from './views/TournamentView';
import BracketView from './views/BracketView';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
export default function App() {
  const tournamentState = useTournament();
  
  const { 
    toast, currentUser, players, isAdmin, isRegistered,
    handleQuickSetName, handleUpdatePlayerName,
    confirmModal, closeConfirm
  } = tournamentState;
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-[#0A0F1C] text-slate-200 font-sans selection:bg-orange-500/30 relative">
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
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={closeConfirm}></div>
          <div className="relative bg-slate-900 border border-slate-700 p-6 md:p-8 rounded-[2rem] max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/20">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">{confirmModal.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-8 font-medium">
                {confirmModal.message}
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={closeConfirm}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    confirmModal.action();
                    closeConfirm();
                  }}
                  className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-colors shadow-lg shadow-orange-600/20"
                >
                  確認執行
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Navbar 
        currentUser={currentUser} 
        handleLogout={tournamentState.handleLogout} 
        players={players}
        setActiveStep={tournamentState.setActiveStep}
        handleQuickSetName={handleQuickSetName}
        handleUpdatePlayerName={handleUpdatePlayerName}
      />
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
      <Footer />
    </div>
  );
}
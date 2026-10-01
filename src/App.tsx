import { useState, useEffect, useCallback, useRef, Component, type ReactNode } from 'react';
import { loadState, saveState, playSound, type AppState } from './store';
import {
  SplashScreen, OnboardingScreen, AuthScreen, HomeScreen, WalletScreen,
  DepositScreen, WithdrawScreen, HistoryScreen, BonusScreen, ProfileScreen,
  VipScreen, SettingsScreen, SupportScreen, GamesLobby, InviteScreen,
  ActivityScreen, AdminPanel
} from './screens';
import { SlotsGame, CrashGame, MinesGame, DiceGame, WheelGame } from './games';

// Error Boundary
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: string}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-white">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-400 text-center mb-4">{this.state.error}</p>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="btn-gold">Reset & Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function BottomNav({ current, navigate }: { current: string; navigate: (s: string) => void }) {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'activity', icon: '📊', label: 'Activity' },
    { id: 'bonus', icon: '🎁', label: '₹500', center: true },
    { id: 'invite', icon: '👥', label: 'Invite' },
    { id: 'profile', icon: '👤', label: 'Account' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto bg-[#141414] border-t border-[#2A2A2A] px-2 py-1.5 flex items-center justify-around">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => { playSound('click'); navigate(tab.id); }}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all ${
              tab.center
                ? 'bg-gradient-to-b from-[#FFE58F] to-[#FFC93D] -mt-5 shadow-lg shadow-[#FFC93D]/30 rounded-full px-5 py-2.5'
                : current === tab.id ? 'text-[#FFC93D]' : 'text-gray-500'
            }`}>
            <span className={tab.center ? 'text-lg' : 'text-xl'}>{tab.icon}</span>
            <span className={`text-[9px] font-bold ${tab.center ? 'text-black' : ''}`}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [state, setStateRaw] = useState<AppState>(() => loadState());
  const [screen, setScreen] = useState('splash');
  const [initialized, setInitialized] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const setState = useCallback((newStateOrFn: AppState | ((prev: AppState) => AppState)) => {
    setStateRaw(prev => {
      const newState = typeof newStateOrFn === 'function' ? newStateOrFn(prev) : newStateOrFn;
      saveState(newState);
      return newState;
    });
  }, []);

  const navigate = useCallback((s: string) => {
    setScreen(s);
    window.scrollTo(0, 0);
  }, []);

  // Check for admin hash
  useEffect(() => {
    if (window.location.hash === '#admin') {
      setScreen('admin');
    }
  }, []);

  // Determine initial screen after splash
  useEffect(() => {
    if (!initialized) return;
    const s = stateRef.current;
    if (window.location.hash === '#admin') {
      setScreen('admin');
    } else if (s.session) {
      setScreen('home');
    } else if (s.onboarded) {
      setScreen('auth');
    } else {
      setScreen('onboarding');
    }
  }, [initialized]);

  const handleSplashDone = useCallback(() => {
    setInitialized(true);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setState(prev => ({ ...prev, onboarded: true }));
    setScreen('auth');
  }, [setState]);

  // Game screens (no bottom nav)
  const gameScreens = ['slots', 'crash', 'mines', 'dice', 'wheel'];
  const noNavScreens = ['splash', 'onboarding', 'auth', 'admin', ...gameScreens];
  const showNav = !noNavScreens.includes(screen) && state.session;

  // Render current screen
  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return <SplashScreen onDone={handleSplashDone} />;
      case 'onboarding':
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      case 'auth':
        return <AuthScreen state={state} setState={setState} />;
      case 'home':
        return <HomeScreen state={state} navigate={navigate} />;
      case 'games':
        return <GamesLobby navigate={navigate} />;
      case 'wallet':
        return <WalletScreen state={state} navigate={navigate} />;
      case 'deposit':
        return <DepositScreen state={state} setState={setState} navigate={navigate} />;
      case 'withdraw':
        return <WithdrawScreen state={state} setState={setState} navigate={navigate} />;
      case 'history':
        return <HistoryScreen state={state} navigate={navigate} />;
      case 'bonus':
        return <BonusScreen state={state} setState={setState} navigate={navigate} />;
      case 'profile':
        return <ProfileScreen state={state} setState={setState} navigate={navigate} />;
      case 'vip':
        return <VipScreen state={state} navigate={navigate} />;
      case 'settings':
        return <SettingsScreen state={state} setState={setState} navigate={navigate} />;
      case 'support':
        return <SupportScreen navigate={navigate} />;
      case 'invite':
        return <InviteScreen state={state} navigate={navigate} />;
      case 'activity':
        return <ActivityScreen state={state} navigate={navigate} />;
      case 'admin':
        return <AdminPanel state={state} setState={setState} navigate={navigate} />;
      case 'slots':
        return <SlotsGame state={state} setState={setState} navigate={navigate} />;
      case 'crash':
        return <CrashGame state={state} setState={setState} navigate={navigate} />;
      case 'mines':
        return <MinesGame state={state} setState={setState} navigate={navigate} />;
      case 'dice':
        return <DiceGame state={state} setState={setState} navigate={navigate} />;
      case 'wheel':
        return <WheelGame state={state} setState={setState} navigate={navigate} />;
      default:
        return <HomeScreen state={state} navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white max-w-lg mx-auto relative overflow-x-hidden">
      {renderScreen()}
      {showNav && <BottomNav current={screen} navigate={navigate} />}
    </div>
  );
}

// Wrap with ErrorBoundary
function AppWithBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWithBoundary;

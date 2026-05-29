import { useEffect, useState } from 'react';
import { fetchPublishedPlatforms } from '@/lib/content-api';
import type { Platform } from '@/lib/database.types';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { PlatformScreen } from './components/PlatformScreen';
import { TutorialsView } from './components/TutorialsView';
import { ErrorState, LoadingState } from './components/ContentStates';
import type { DrillItem, Tab } from './types';

interface AppState {
  tab: Tab;
  drillItem: DrillItem | null;
}

export default function MobileApp() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [bootLoading, setBootLoading] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);
  const [state, setState] = useState<AppState>({ tab: 'home', drillItem: null });

  useEffect(() => {
    fetchPublishedPlatforms()
      .then(setPlatforms)
      .catch((e) => setBootError(e instanceof Error ? e.message : 'Failed to connect'))
      .finally(() => setBootLoading(false));
  }, []);

  const setTab = (tab: Tab) => setState({ tab, drillItem: null });
  const drillInto = (item: DrillItem) => setState((prev) => ({ ...prev, drillItem: item }));
  const goBack = () => setState((prev) => ({ ...prev, drillItem: null }));

  const activePlatform = platforms.find((p) => p.slug === state.tab);

  const renderScreen = () => {
    if (state.drillItem) {
      return <TutorialsView item={state.drillItem} onBack={goBack} />;
    }
    if (state.tab === 'home') {
      return <HomeScreen onNavigate={setTab} />;
    }
    if (activePlatform) {
      return <PlatformScreen platformSlug={activePlatform.slug} onSelect={drillInto} />;
    }
    return (
      <div className="p-6">
        <ErrorState message="Platform not found or not published." />
      </div>
    );
  };

  if (bootLoading) {
    return (
      <div className="bg-background min-h-[100dvh] flex items-center justify-center max-w-[430px] mx-auto">
        <LoadingState label="Connecting…" />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-[100dvh] flex items-start justify-center">
      <div className="relative w-full max-w-[430px] min-h-[100dvh] bg-background shadow-2xl overflow-hidden">
        {bootError && (
          <div className="px-4 pt-4">
            <ErrorState message={bootError} />
          </div>
        )}
        <div className="overflow-y-auto min-h-[100dvh] pb-[var(--page-bottom-padding)]">
          {renderScreen()}
        </div>
        <BottomNav platforms={platforms} activeTab={state.tab} onTabChange={setTab} />
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Banner } from './components/layout/Banner';
import { Header } from './components/layout/Header';
import { NavigationTabs, TabId } from './components/layout/NavigationTabs';
import { FarmForm } from './components/farm/FarmForm';
import { RotationExplorer } from './components/explorer/RotationExplorer';
import { EvidenceAndLimitations } from './components/evidence/EvidenceAndLimitations';
import { SimpleView } from './components/simple/SimpleView';
import { FarmState, INITIAL_FARM_STATE } from './types/farm';
import { NasaPowerNormalizedPayload } from './types/nasaPower';
import { Layers, Sparkles } from 'lucide-react';

export type ViewMode = 'simple' | 'standard';

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('simple');
  const [activeTab, setActiveTab] = useState<TabId>('my-farm');
  const [farmState, setFarmState] = useState<FarmState>({ ...INITIAL_FARM_STATE });
  const [nasaData, setNasaData] = useState<NasaPowerNormalizedPayload | null>(null);

  const handleReset = () => {
    setFarmState({
      ...INITIAL_FARM_STATE,
      coordinates: { latitude: '', longitude: '' },
      cropRotationList: [],
      priorities: { ...INITIAL_FARM_STATE.priorities },
      observations: [],
    });
    setNasaData(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-sand-100 text-charcoal-900 font-sans">
      {/* Top Prototype Warning Banner */}
      <Banner nasaData={nasaData} />

      {/* Main Header */}
      <Header nasaData={nasaData} />

      {/* View Mode Switcher Bar */}
      <div className="bg-sand-200 border-b-2 border-sand-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-sm sm:text-base font-extrabold text-charcoal-900">
              Workspace Mode:
            </span>
            <div
              role="radiogroup"
              aria-label="Select workspace mode"
              className="inline-flex rounded-2xl p-1 bg-white border-2 border-charcoal-700 shadow-xs"
            >
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === 'simple'}
                onClick={() => setViewMode('simple')}
                className={`min-h-[48px] px-4 sm:px-5 py-2.5 rounded-xl text-sm sm:text-base font-extrabold flex items-center gap-2 transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                  viewMode === 'simple'
                    ? 'bg-forest-800 text-white shadow-sm ring-1 ring-forest-900'
                    : 'text-charcoal-800 hover:text-charcoal-950 hover:bg-sand-100'
                }`}
              >
                <Sparkles className="w-5 h-5 text-amber-300" aria-hidden="true" />
                <span>Simple View (4 Tools)</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={viewMode === 'standard'}
                onClick={() => setViewMode('standard')}
                className={`min-h-[48px] px-4 sm:px-5 py-2.5 rounded-xl text-sm sm:text-base font-extrabold flex items-center gap-2 transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                  viewMode === 'standard'
                    ? 'bg-forest-800 text-white shadow-sm ring-1 ring-forest-900'
                    : 'text-charcoal-800 hover:text-charcoal-950 hover:bg-sand-100'
                }`}
              >
                <Layers className="w-5 h-5 text-forest-200" aria-hidden="true" />
                <span>Standard Workspace</span>
              </button>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-charcoal-700 font-medium">
            {viewMode === 'simple'
              ? 'Large picture choices, touch targets ≥ 48px, high contrast'
              : 'Detailed form tabs, multi-year climate summaries & explorer'}
          </div>
        </div>
      </div>

      {/* When in Standard View: Sticky Tab Navigation */}
      {viewMode === 'standard' && (
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onSwitchToSimple={() => setViewMode('simple')}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Simple View Mode */}
        {viewMode === 'simple' ? (
          <SimpleView
            farmState={farmState}
            onChange={setFarmState}
            nasaData={nasaData}
            onNasaDataLoaded={(data) => setNasaData(data)}
            onSwitchToStandard={() => setViewMode('standard')}
          />
        ) : (
          <>
            {/* Tab 1: Your Farm */}
            <div
              role="tabpanel"
              id="tabpanel-my-farm"
              aria-labelledby="tab-my-farm"
              hidden={activeTab !== 'my-farm'}
            >
              {activeTab === 'my-farm' && (
                <FarmForm
                  farmState={farmState}
                  onChange={setFarmState}
                  onReset={handleReset}
                  onContinueToExplorer={() => setActiveTab('explorer')}
                  onNasaDataLoaded={(data) => setNasaData(data)}
                />
              )}
            </div>

            {/* Tab 2: Explore Crop Plans */}
            <div
              role="tabpanel"
              id="tabpanel-explorer"
              aria-labelledby="tab-explorer"
              hidden={activeTab !== 'explorer'}
            >
              {activeTab === 'explorer' && (
                <RotationExplorer
                  farmState={farmState}
                  weatherData={nasaData}
                  onNavigateToFarm={() => setActiveTab('my-farm')}
                />
              )}
            </div>

            {/* Tab 3: Data Status & Evidence */}
            <div
              role="tabpanel"
              id="tabpanel-evidence"
              aria-labelledby="tab-evidence"
              hidden={activeTab !== 'evidence'}
            >
              {activeTab === 'evidence' && (
                <EvidenceAndLimitations
                  farmState={farmState}
                  nasaData={nasaData}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Accessible Footer */}
      <footer className="bg-sand-200/80 border-t border-sand-300 py-6 sm:py-8 text-sm text-charcoal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-bold text-charcoal-900">Universal Farm</span> · Evidence-Based Rotation Planner
            <div className="text-xs sm:text-sm text-charcoal-600 mt-1">
              Developed for the NASA Space Apps Challenge “Field Shift”. Incorporates NASA POWER daily agroclimatology & FAO GAEZ v5 crop requirements.
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-charcoal-600">
            <span>Runs locally on your device</span>
            <span>·</span>
            <span>Zero personal telemetry</span>
            <span>·</span>
            <span>Worldwide farm inputs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

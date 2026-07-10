import { Suspense, lazy, useState } from 'react';
import { ArrowLeft, Gift, Heart, Send, Sparkles } from 'lucide-react';
import { DESTINATIONS } from './config/cities';
import { useTreasureProgress } from './hooks/useTreasureProgress';
import GlobeMap from './components/GlobeMap.jsx';

const PanoramaScene = lazy(() => import('./components/PanoramaScene.jsx'));

export default function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const progress = useTreasureProgress();

  return (
    <main className="app-shell">
      {selectedCity ? (
        <section className="scene-screen">
          <header className="top-bar">
            <button className="icon-button" type="button" onClick={() => setSelectedCity(null)} aria-label="Back to globe">
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1>{selectedCity.name}</h1>
            </div>
          </header>

          <Suspense fallback={<div className="viewer-loading">Opening the portal...</div>}>
            <PanoramaScene
              city={selectedCity}
              onFound={() => progress.markFound(selectedCity.id)}
            />
          </Suspense>
        </section>
      ) : (
        <section className="home-screen">
          <div className="home-doodles" aria-hidden="true">
            <span className="doodle-star">✦</span>
            <span className="doodle-heart">♡</span>
            <span className="doodle-cloud" />
            <span className="doodle-stamp" />
            <span className="doodle-sparkle">✧</span>
          </div>
          <header className="home-header">
            <div className="title-lockup">
              <div className="title-icons" aria-hidden="true">
                <Gift size={19} />
                <Sparkles size={18} />
                <Send size={17} />
              </div>
              <h1>A tiny world tour for <span>Ruofan</span></h1>
              <Heart className="title-heart" size={22} aria-hidden="true" />
            </div>
          </header>

          <GlobeMap
            destinations={DESTINATIONS}
            found={progress.found}
            isComplete={progress.isComplete}
            onSelect={setSelectedCity}
          />
        </section>
      )}
    </main>
  );
}

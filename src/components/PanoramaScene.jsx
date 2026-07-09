import { useEffect, useRef, useState } from 'react';
import { Smartphone, Sparkles } from 'lucide-react';
import { EquirectangularAdapter, Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';

export default function PanoramaScene({ city, alreadyFound, onFound }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const gyroRef = useRef(null);
  const [gyroState, setGyroState] = useState('idle');
  const [foundNow, setFoundNow] = useState(alreadyFound);

  useEffect(() => {
    setFoundNow(alreadyFound);
  }, [alreadyFound, city.id]);

  useEffect(() => {
    const viewer = new Viewer({
      container: containerRef.current,
      adapter: [EquirectangularAdapter, { useXmpData: false }],
      panorama: city.panorama,
      panoData: {
        isEquirectangular: true,
        fullWidth: city.panoramaSize.width,
        fullHeight: city.panoramaSize.height,
        croppedWidth: city.panoramaSize.width,
        croppedHeight: city.panoramaSize.height,
        croppedX: 0,
        croppedY: 0,
      },
      defaultYaw: '0deg',
      defaultPitch: '0deg',
      minFov: 30,
      maxFov: 95,
      defaultZoomLvl: 0,
      zoomSpeed: 1,
      loadingImg: null,
      loadingTxt: 'Opening the portal...',
      showLoader: false,
      touchmoveTwoFingers: false,
      mousewheel: false,
      navbar: false,
      plugins: [
        [GyroscopePlugin, { absolutePosition: true }],
        [
          MarkersPlugin,
          {
            markers: [
              {
                id: `hidden-${city.id}`,
                position: city.markerPosition,
                html: `<button class="number-marker" type="button" aria-label="Hidden number ${city.hiddenNumber}">${city.hiddenNumber}</button>`,
                size: { width: 56, height: 56 },
                anchor: 'center center',
                tooltip: 'Found a birthday number!',
              },
            ],
          },
        ],
      ],
    });

    viewerRef.current = viewer;
    gyroRef.current = viewer.getPlugin(GyroscopePlugin);

    const markers = viewer.getPlugin(MarkersPlugin);
    const handleMarkerSelect = ({ marker }) => {
      if (marker.id === `hidden-${city.id}`) {
        setFoundNow(true);
        onFound();
      }
    };

    markers.addEventListener('select-marker', handleMarkerSelect);

    return () => {
      markers.removeEventListener('select-marker', handleMarkerSelect);
      viewer.destroy();
      viewerRef.current = null;
      gyroRef.current = null;
    };
  }, [city, onFound]);

  async function enableMotion() {
    setGyroState('requesting');
    try {
      const orientationEvent = window.DeviceOrientationEvent;
      if (orientationEvent?.requestPermission) {
        const permission = await orientationEvent.requestPermission();
        if (permission !== 'granted') {
          setGyroState('denied');
          return;
        }
      }

      await gyroRef.current?.start();
      setGyroState('enabled');
    } catch {
      setGyroState('denied');
    }
  }

  const clueText = (() => {
    if (foundNow) return `You found ${city.hiddenNumber}`;
    if (gyroState === 'requesting') return 'Allow motion access to begin.';
    if (gyroState === 'denied') return 'Motion was not enabled. You can still drag around to search.';
    return 'Tap the phone icon first to enable orientation.';
  })();

  const showClueCard = foundNow || gyroState !== 'enabled';

  return (
    <div className="panorama-layout">
      <div className="viewer-wrap">
        <div ref={containerRef} className="panorama-viewer" />
      </div>

      <button
        className="motion-button"
        type="button"
        onClick={enableMotion}
        disabled={gyroState === 'requesting' || gyroState === 'enabled'}
        aria-label={gyroState === 'enabled' ? 'Motion control on' : gyroState === 'requesting' ? 'Requesting motion permission' : 'Enable motion view'}
        title={gyroState === 'enabled' ? 'Motion control on' : 'Enable motion view'}
      >
        <Smartphone size={22} />
      </button>

      <div className="viewer-controls">
        {showClueCard && (
          <div className={`clue-card ${foundNow ? 'is-found' : ''}`}>
            {foundNow && <Sparkles size={20} />}
            <div>
              <p>{clueText}</p>
            </div>
          </div>
        )}

        {gyroState === 'denied' && (
          <p className="small-note">
            Motion needs Safari device orientation permission. You can still drag the panorama by hand.
          </p>
        )}
      </div>
    </div>
  );
}

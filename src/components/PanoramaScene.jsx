import { useEffect, useRef, useState } from 'react';
import { Smartphone, Sparkles } from 'lucide-react';
import { EquirectangularAdapter, Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';

function createMarkerHtml(city) {
  if (city.id === 'osaka') {
    return `
      <button class="number-marker number-marker-osaka" type="button" aria-label="Hidden number ${city.hiddenNumber}">
        <svg class="sakura-marker" viewBox="0 0 64 64" aria-hidden="true">
          <g class="sakura-flower" transform="translate(32 32) rotate(-8)">
            <path class="sakura-petal sakura-petal-1" d="M0,-8 C-8,-24 -2,-32 6,-29 C14,-26 14,-14 4,-6 Z" />
            <path class="sakura-petal sakura-petal-2" d="M7,-3 C23,-12 32,-5 29,4 C26,13 14,12 5,4 Z" />
            <path class="sakura-petal sakura-petal-3" d="M5,6 C16,20 10,30 0,29 C-10,28 -9,15 -2,6 Z" />
            <path class="sakura-petal sakura-petal-4" d="M-5,6 C-18,19 -30,14 -29,4 C-28,-6 -16,-7 -6,1 Z" />
            <path class="sakura-petal sakura-petal-5" d="M-7,-3 C-24,-8 -24,-20 -15,-24 C-6,-28 0,-17 -1,-6 Z" />
            <circle class="sakura-center" cx="0" cy="0" r="6.3" />
          </g>
          <text class="sakura-number" x="32" y="37">${city.hiddenNumber}</text>
        </svg>
      </button>
    `;
  }

  return `<button class="number-marker number-marker-${city.id}" type="button" aria-label="Hidden number ${city.hiddenNumber}"><span>${city.hiddenNumber}</span></button>`;
}

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
                html: createMarkerHtml(city),
                size: { width: 64, height: 64 },
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

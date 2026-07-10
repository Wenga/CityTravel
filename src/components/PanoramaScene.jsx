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
          <g class="sakura-flower" transform="translate(32 32) rotate(4)">
            <ellipse class="sakura-petal sakura-petal-1" cx="0" cy="-15" rx="10.5" ry="15.5" transform="rotate(0)" />
            <ellipse class="sakura-petal sakura-petal-2" cx="14.5" cy="-4.5" rx="10.5" ry="15.5" transform="rotate(72 14.5 -4.5)" />
            <ellipse class="sakura-petal sakura-petal-3" cx="9" cy="13" rx="10.5" ry="15.5" transform="rotate(144 9 13)" />
            <ellipse class="sakura-petal sakura-petal-4" cx="-9" cy="13" rx="10.5" ry="15.5" transform="rotate(216 -9 13)" />
            <ellipse class="sakura-petal sakura-petal-5" cx="-14.5" cy="-4.5" rx="10.5" ry="15.5" transform="rotate(288 -14.5 -4.5)" />
            <g class="sakura-veins">
              <path d="M0,0 L0,-22" />
              <path d="M0,0 L20,-7" />
              <path d="M0,0 L12,18" />
              <path d="M0,0 L-12,18" />
              <path d="M0,0 L-20,-7" />
            </g>
            <circle class="sakura-center" cx="0" cy="0" r="5.4" />
          </g>
          <text class="sakura-number" x="32" y="39">${city.hiddenNumber}</text>
        </svg>
      </button>
    `;
  }

  if (city.id === 'barcelona') {
    return `
      <button class="number-marker number-marker-barcelona" type="button" aria-label="Hidden number ${city.hiddenNumber}">
        <svg class="cloud-marker" viewBox="0 0 72 48" aria-hidden="true">
          <path class="cloud-shape" d="M17.6,38.2 C9.7,38.2 5.4,33.7 6.8,27.8 C8,22.5 12.3,19.4 18.4,19.6 C19.9,11.4 26.4,6.9 34.3,8.2 C39.8,9.1 43.6,12.3 45.7,17 C51.7,15.9 57.7,18.9 60.1,24.1 C66.2,24.7 69.4,28.3 68,33.2 C66.8,37.4 62.8,39.6 55.8,38.9 C44.5,41.1 31.2,41.1 17.6,38.2 Z" />
          <path class="cloud-scribble" d="M18.3,25.8 C22.2,20.1 28.3,20.3 31.8,24.2 C35.1,17.4 44.9,18.1 47.7,25.3 C52.4,23.7 57.1,25.7 59.2,29.4" />
          <text class="cloud-number" x="36" y="33">${city.hiddenNumber}</text>
        </svg>
      </button>
    `;
  }

  return `<button class="number-marker number-marker-${city.id}" type="button" aria-label="Hidden number ${city.hiddenNumber}"><span>${city.hiddenNumber}</span></button>`;
}

function createInstructionBubbleHtml(text) {
  return `
    <div class="airport-instruction-bubble" role="note" aria-label="Treasure hunt instructions">
      <p>${text}</p>
    </div>
  `;
}

export default function PanoramaScene({ city, onFound }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const gyroRef = useRef(null);
  const onFoundRef = useRef(onFound);
  const [gyroState, setGyroState] = useState('idle');
  const [foundNow, setFoundNow] = useState(false);
  const hasHiddenNumber = Number.isFinite(city.hiddenNumber);

  useEffect(() => {
    onFoundRef.current = onFound;
  }, [onFound]);

  useEffect(() => {
    setFoundNow(false);
  }, [city.id]);

  useEffect(() => {
    const viewer = new Viewer({
      container: containerRef.current,
      adapter: [EquirectangularAdapter, { useXmpData: false }],
      panorama: city.panorama,
      panoData: (image) => ({
        isEquirectangular: true,
        fullWidth: image.naturalWidth,
        fullHeight: image.naturalHeight,
        croppedWidth: image.naturalWidth,
        croppedHeight: image.naturalHeight,
        croppedX: 0,
        croppedY: 0,
      }),
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
              ...(city.instructionNotes ?? []).map((note) => ({
                id: `instruction-${city.id}-${note.id}`,
                position: note.position,
                html: createInstructionBubbleHtml(note.text),
                size: { width: 280, height: 130 },
                anchor: 'bottom center',
              })),
              ...(hasHiddenNumber
                ? [
                    {
                      id: `hidden-${city.id}`,
                      position: city.markerPosition,
                      html: createMarkerHtml(city),
                      size: { width: 64, height: 64 },
                      anchor: 'center center',
                      tooltip: 'Found a birthday number!',
                    },
                  ]
                : []),
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
        onFoundRef.current();
      }
    };

    markers.addEventListener('select-marker', handleMarkerSelect);

    return () => {
      markers.removeEventListener('select-marker', handleMarkerSelect);
      viewer.destroy();
      viewerRef.current = null;
      gyroRef.current = null;
    };
  }, [city, hasHiddenNumber]);

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
    if (!hasHiddenNumber) return 'Tap the phone icon first to enable orientation for the airport scene.';
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

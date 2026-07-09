const PANORAMA_BASE = `${import.meta.env.BASE_URL}assets/panoramas`;

export const START_CITY = {
  id: 'sf-bay',
  name: 'SF Bay Area',
  lat: 37.7749,
  lng: -122.4194,
};

export const DESTINATIONS = [
  {
    id: 'beijing',
    name: 'Beijing',
    lat: 39.9042,
    lng: 116.4074,
    hiddenNumber: 7,
    panorama: `${PANORAMA_BASE}/beijing.png`,
    panoramaSize: { width: 1774, height: 887 },
    markerPosition: { yaw: '-137deg', pitch: '35deg' },
    clue: 'A lucky spark tucked between old walls and new lights.',
  },
  {
    id: 'osaka',
    name: 'Osaka',
    lat: 34.6937,
    lng: 135.5023,
    hiddenNumber: 2,
    panorama: `${PANORAMA_BASE}/osaka.png`,
    panoramaSize: { width: 1774, height: 887 },
    markerPosition: { yaw: '-155deg', pitch: '24deg' },
    clue: 'Two little lanterns are waiting in the swirl.',
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    lat: 41.3874,
    lng: 2.1686,
    hiddenNumber: 9,
    panorama: `${PANORAMA_BASE}/barcelona.jpg`,
    panoramaSize: { width: 4096, height: 2048 },
    markerPosition: { yaw: '325deg', pitch: '-7deg' },
    clue: 'Nine sunbeams hide where the mosaic daydream bends.',
  },
];

export const STORAGE_KEY = 'birthday-hunt-found-numbers';

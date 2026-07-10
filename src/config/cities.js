const PANORAMA_BASE = `${import.meta.env.BASE_URL}assets/panoramas`;

export const START_CITY = {
  id: 'sf-bay',
  name: 'San Francisco Airport',
  lat: 37.7749,
  lng: -122.4194,
  panorama: `${PANORAMA_BASE}/airport.png`,
  instructionNotes: [
    {
      id: 'numbers',
      text: 'Three tiny numbers are hiding in the cities. Tap them when you find them!',
      position: { yaw: '-16deg', pitch: '20deg' },
    },
    {
      id: 'ready',
      text: "Ready? Let's go to the cities!",
      position: { yaw: '170deg', pitch: '4deg' },
    },
  ],
};

export const DESTINATIONS = [
  {
    id: 'beijing',
    name: 'Beijing',
    lat: 39.9042,
    lng: 116.4074,
    hiddenNumber: 8,
    panorama: `${PANORAMA_BASE}/beijing.png?v=20260709-2225`,
    markerPosition: { yaw: '-120deg', pitch: '26deg' },
    clue: 'A lucky spark tucked between old walls and new lights.',
  },
  {
    id: 'osaka',
    name: 'Osaka',
    lat: 34.6937,
    lng: 135.5023,
    hiddenNumber: 1,
    panorama: `${PANORAMA_BASE}/osaka.png`,
    markerPosition: { yaw: '-155deg', pitch: '24deg' },
    clue: 'Two little lanterns are waiting in the swirl.',
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    lat: 41.3874,
    lng: 2.1686,
    hiddenNumber: 2,
    panorama: `${PANORAMA_BASE}/barcelona.png`,
    markerPosition: { yaw: '132deg', pitch: '42deg' },
    clue: 'Nine sunbeams hide where the mosaic daydream bends.',
  },
];

export const STORAGE_KEY = 'birthday-hunt-found-numbers';

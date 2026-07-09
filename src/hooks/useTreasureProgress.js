import { useEffect, useMemo, useState } from 'react';
import { DESTINATIONS, STORAGE_KEY } from '../config/cities';

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

export function useTreasureProgress() {
  const [found, setFound] = useState(readProgress);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  }, [found]);

  const foundCount = useMemo(
    () => DESTINATIONS.filter((city) => found[city.id]).length,
    [found]
  );

  const numbers = useMemo(
    () => DESTINATIONS.filter((city) => found[city.id]).map((city) => city.hiddenNumber),
    [found]
  );

  return {
    found,
    foundCount,
    numbers,
    isComplete: foundCount === DESTINATIONS.length,
    markFound(cityId) {
      setFound((current) => ({ ...current, [cityId]: true }));
    },
    reset() {
      setFound({});
    },
  };
}

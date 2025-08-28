import { useEffect, useRef, useState, useCallback } from "react";

const cache = new Map(); // key -> { value, error, time }

const now = () => Date.now();
const keyToString = (key) =>
  typeof key === "string" ? key : JSON.stringify(key);

export function prefetchResource(key, fetcher, ttlMs = 30000) {
  const k = keyToString(key);
  const entry = cache.get(k);
  if (entry && now() - entry.time < ttlMs) return; // fresh
  Promise.resolve()
    .then(fetcher)
    .then((value) => cache.set(k, { value, error: null, time: now() }))
    .catch((error) => cache.set(k, { value: undefined, error, time: now() }));
}

export default function useCachedResource(key, fetcher, options = {}) {
  const { ttlMs = 30000, enabled = true } = options;
  const k = keyToString(key);
  const mounted = useRef(true);
  const [state, setState] = useState(() => {
    const entry = cache.get(k);
    if (entry && now() - entry.time < ttlMs) {
      return { data: entry.value, error: entry.error, loading: false };
    }
    return { data: undefined, error: null, loading: !!enabled };
  });

  useEffect(
    () => () => {
      mounted.current = false;
    },
    []
  );

  const fetchData = useCallback(
    async (force = false) => {
      if (!enabled) return;
      const entry = cache.get(k);
      const isFresh = entry && now() - entry.time < ttlMs;
      if (!force && isFresh) {
        if (mounted.current)
          setState({ data: entry.value, error: entry.error, loading: false });
        return;
      }
      if (mounted.current) setState((s) => ({ ...s, loading: true }));
      try {
        const value = await fetcher();
        cache.set(k, { value, error: null, time: now() });
        if (mounted.current)
          setState({ data: value, error: null, loading: false });
      } catch (error) {
        cache.set(k, { value: undefined, error, time: now() });
        if (mounted.current)
          setState({ data: undefined, error, loading: false });
      }
    },
    [k, fetcher, ttlMs, enabled]
  );

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);
  const setData = useCallback(
    (updater) => {
      setState((prev) => {
        const nextData =
          typeof updater === "function" ? updater(prev.data) : updater;
        cache.set(k, { value: nextData, error: null, time: now() });
        return { data: nextData, error: null, loading: false };
      });
    },
    [k]
  );

  return { ...state, refresh, setData };
}

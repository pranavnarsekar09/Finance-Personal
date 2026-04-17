import { useCallback, useEffect, useState } from "react";

export function useAsync(asyncFn, deps = [], options = {}) {
  const [data, setData] = useState(options.initialData ?? null);
  const [loading, setLoading] = useState(options.immediate !== false);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const value = await asyncFn();
      setData(value);
      return value;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (options.immediate === false) {
      return undefined;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    asyncFn()
      .then((value) => {
        if (!cancelled) {
          setData(value);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return { data, loading, error, setData, execute };
}

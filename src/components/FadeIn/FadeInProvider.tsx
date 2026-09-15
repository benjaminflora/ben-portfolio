"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";

const LoadInContext = createContext(true);

export function FadeInProvider({ children }: { children: ReactNode }) {
  const [introActive, setIntroActive] = useState(true);

  useEffect(() => {
    setIntroActive(false);
  }, []);

  return (
    <LoadInContext.Provider value={introActive}>{children}</LoadInContext.Provider>
  );
}

export function useLoadInAnimation() {
  const introActive = useContext(LoadInContext);
  const [shouldAnimate, setShouldAnimate] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    setShouldAnimate(introActive);
    // Snapshot at mount so the first screen can finish its load-in
    // after the provider closes the intro window.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return shouldAnimate;
}

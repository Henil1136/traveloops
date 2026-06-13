import { createContext, useContext, useState } from "react";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }) {
  const [activeTrip, setActiveTrip] = useState(null);
  const [scrolled, setScrolled]     = useState(false);

  return (
    <AppCtx.Provider value={{
      activeTrip, setActiveTrip,
      scrolled, setScrolled,
    }}>
      {children}
    </AppCtx.Provider>
  );
}
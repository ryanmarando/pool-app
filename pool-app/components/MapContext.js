// MapContext.js
import React, { createContext, useState, useEffect } from "react";
import * as Location from "expo-location";

export const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const initializeLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    setLoading(false);
  };

  useEffect(() => {
    initializeLocation();
  }, []);

  return (
    <MapContext.Provider value={{ location, loading }}>
      {children}
    </MapContext.Provider>
  );
};

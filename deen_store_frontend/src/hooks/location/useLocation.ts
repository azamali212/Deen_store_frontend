// hooks/useLocation.ts
import { useState, useEffect } from 'react';

export interface LocationData {
  ip: string;
  location: string;
  city: string;
  country: string;
  region: string;
  timezone: string;
  isp: string;
  latitude: number | null;
  longitude: number | null;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = async (): Promise<LocationData> => {
    setLoading(true);
    setError(null);

    try {
      // Try to get precise location first
      const preciseLocation = await getPreciseLocation();
      if (preciseLocation) {
        setLocation(preciseLocation);
        return preciseLocation;
      }

      // Fallback to IP-based location
      const ipLocation = await getIPLocation();
      setLocation(ipLocation);
      return ipLocation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      
      // Return fallback data
      const fallback = getFallbackLocation();
      setLocation(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  const getPreciseLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const locationData = await reverseGeocode(latitude, longitude);
            resolve(locationData);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          // Don't reject, just fall back to IP location
          reject(new Error('Geolocation permission denied'));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const getIPLocation = async (): Promise<LocationData> => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('IP location service failed');
      
      const data = await response.json();
      
      return {
        ip: data.ip,
        location: `${data.city}, ${data.country_name}`,
        city: data.city,
        country: data.country_name,
        region: data.region,
        timezone: data.timezone,
        isp: data.org,
        latitude: data.latitude,
        longitude: data.longitude
      };
    } catch (error) {
      throw new Error('Failed to get IP location');
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<LocationData> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      
      if (!response.ok) throw new Error('Reverse geocoding failed');
      
      const data = await response.json();
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();

      return {
        ip: ipData.ip,
        location: `${data.address.city || data.address.town || data.address.village}, ${data.address.country}`,
        city: data.address.city || data.address.town || data.address.village,
        country: data.address.country,
        region: data.address.state || data.address.region,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isp: 'Unknown',
        latitude: lat,
        longitude: lng
      };
    } catch (error) {
      throw new Error('Reverse geocoding failed');
    }
  };

  const getFallbackLocation = (): LocationData => ({
    ip: 'Unknown',
    location: 'Location Unknown',
    city: 'Unknown',
    country: 'Unknown',
    region: 'Unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isp: 'Unknown',
    latitude: null,
    longitude: null
  });

  return {
    location,
    loading,
    error,
    getLocation
  };
};
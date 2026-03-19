'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapAddressSelectorProps {
  onAddressSelect: (address: {
    fullName?: string;
    mobile?: string;
    pincode?: string;
    state?: string;
    city?: string;
    area?: string;
    landmark?: string;
    lat?: number;
    lng?: number;
  }) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function MapAddressSelector({
  onAddressSelect,
  initialLat = 28.6139,
  initialLng = 77.209,
}: MapAddressSelectorProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !mapRef.current) {
      const lat = selectedCoords?.lat || initialLat;
      const lng = selectedCoords?.lng || initialLng;

      // Create map
      mapRef.current = L.map(mapContainer.current).setView([lat, lng], 13);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Create custom marker icon (using default Leaflet icon)
      const markerIcon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Add initial marker
      markerRef.current = L.marker([lat, lng], { icon: markerIcon, draggable: true })
        .addTo(mapRef.current)
        .bindPopup('Click on map or drag marker to select location');

      setSelectedCoords({ lat, lng });

      // Handle map clicks
      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        handleMapClick(e.latlng);
      });

      // Handle marker drag
      markerRef.current.on('dragend', () => {
        if (markerRef.current) {
          const { lat: newLat, lng: newLng } = markerRef.current.getLatLng();
          setSelectedCoords({ lat: newLat, lng: newLng });
          reverseGeocode(newLat, newLng);
        }
      });
    }

    return () => {
      // Optional: cleanup
    };
  }, [initialLat, initialLng]);

  const handleMapClick = (latlng: L.LatLng) => {
    const { lat, lng } = latlng;
    setSelectedCoords({ lat, lng });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }

    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 13);
    }

    reverseGeocode(lat, lng);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HealtheBites/1.0',
          },
        }
      );

      const data = await response.json();
      const addr = data.address || {};

      const address = {
        area: addr.road || addr.neighbourhood || addr.suburb || '',
        city: addr.city || addr.town || addr.village || addr.county || '',
        state: addr.state || addr.state_district || addr.region || '',
        pincode: addr.postcode || '',
        landmark: addr.neighbourhood || addr.suburb || addr.local_government_area || '',
        lat,
        lng,
      };

      onAddressSelect(address);
      toast.success('Location fetched successfully!');
    } catch (error) {
      console.error('Reverse geocode error:', error);
      toast.error('Could not fetch location details');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedCoords({ lat: latitude, lng: longitude });

        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 13);
        }

        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        }

        reverseGeocode(latitude, longitude);
      },
      (error) => {
        setLoading(false);
        toast.error('Could not get your location');
        console.error(error);
      }
    );
  };

  useEffect(() => {
    // Attempt to auto-locate on mount
    handleGetCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleGetCurrentLocation}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? (
            <>
              <Loader size={16} className="animate-spin" />
              Getting location...
            </>
          ) : (
            <>
              <MapPin size={16} />
              Use Current Location
            </>
          )}
        </button>
      </div>

      <div
        ref={mapContainer}
        className="w-full h-96 rounded-xl border border-gray-200 shadow-sm relative z-0"
        style={{ minHeight: '400px' }}
      />

      {selectedCoords && (
        <div className="text-sm text-gray-600 text-center mt-2">
          📍 Latitude: {selectedCoords.lat.toFixed(4)}, Longitude: {selectedCoords.lng.toFixed(4)}
        </div>
      )}
    </div>
  );
}

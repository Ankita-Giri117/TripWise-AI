import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { resolveDestinationCoordinates } from '../api/geocoding';
import {
  MapPin,
  Compass,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

// Keyless OpenStreetMap tile configuration
const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const DestinationMap = ({ destination }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [coords, setCoords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTileStyle, setActiveTileStyle] = useState('standard');

  // 1. Resolve Destination to Coordinates
  const fetchCoordinates = async () => {
    if (!destination || !destination.trim()) {
      setCoords(null);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await resolveDestinationCoordinates(destination);
      setCoords(data);
    } catch (err) {
      console.error('Destination map geocoding error:', err);
      setError(err.message || `Unable to locate map coordinates for ${destination}.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinates();
  }, [destination]);

  // 2. Initialize and update Leaflet Map
  useEffect(() => {
    if (!coords || !mapContainerRef.current) return;

    const { latitude, longitude, displayName } = coords;
    const zoomLevel = 12;

    // Custom MapPin DivIcon
    const customDivIcon = L.divIcon({
      className: 'custom-destination-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-10 w-10 animate-ping rounded-full bg-emerald-500 opacity-40"></span>
          <div class="relative h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-800 border-2 border-white shadow-xl flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -36]
    });

    if (!mapInstanceRef.current) {
      // Initialize map with OpenStreetMap keyless base map
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: zoomLevel,
        zoomControl: false,
        attributionControl: false
      });

      // Add keyless OpenStreetMap tile layer
      const layer = L.tileLayer(OSM_TILE_URL, {
        attribution: OSM_ATTRIBUTION,
        maxZoom: 19,
        className: activeTileStyle === 'dark' ? 'keyless-dark-tiles' : ''
      }).addTo(map);

      tileLayerRef.current = layer;

      // Add Marker
      const marker = L.marker([latitude, longitude], { icon: customDivIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 2px; text-align: center;">
          <h4 style="font-weight: 800; margin: 0 0 4px 0; font-size: 14px; color: #0f172a;">${displayName}</h4>
          <p style="font-size: 11px; color: #64748b; margin: 0;">Lat: ${latitude.toFixed(4)}°, Lon: ${longitude.toFixed(4)}°</p>
        </div>
      `, {
        closeButton: false
      }).openPopup();

      markerRef.current = marker;
      mapInstanceRef.current = map;
    } else {
      // Update existing map position
      const map = mapInstanceRef.current;
      map.setView([latitude, longitude], zoomLevel);

      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
        markerRef.current.getPopup().setContent(`
          <div style="font-family: sans-serif; padding: 2px; text-align: center;">
            <h4 style="font-weight: 800; margin: 0 0 4px 0; font-size: 14px; color: #0f172a;">${displayName}</h4>
            <p style="font-size: 11px; color: #64748b; margin: 0;">Lat: ${latitude.toFixed(4)}°, Lon: ${longitude.toFixed(4)}°</p>
          </div>
        `);
      }
    }

    // Force map to recalculate container size
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, [coords]);

  // Handle Map Tile Style Change (Keyless Dark Mode via CSS filter on keyless OSM tiles)
  const handleTileStyleChange = (styleKey) => {
    setActiveTileStyle(styleKey);
    if (tileLayerRef.current) {
      const container = tileLayerRef.current.getContainer();
      if (container) {
        if (styleKey === 'dark') {
          container.classList.add('keyless-dark-tiles');
        } else {
          container.classList.remove('keyless-dark-tiles');
        }
      }
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current && coords) {
      mapInstanceRef.current.setView([coords.latitude, coords.longitude], 12, {
        animate: true
      });
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const googleMapsUrl = coords
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coords.displayName)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination || '')}`;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-md">
      {/* CSS Filter for keyless dark mode tile treatment */}
      <style>{`
        .keyless-dark-tiles .leaflet-tile {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%) !important;
        }
      `}</style>

      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Destination Map</span>
          </h3>
          {coords && (
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Showing location for <span className="font-semibold text-stone-700 dark:text-stone-300">{coords.displayName}</span>
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {coords && (
            <>
              {/* Tile layer selector */}
              <div className="inline-flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700">
                <button
                  onClick={() => handleTileStyleChange('standard')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    activeTileStyle === 'standard'
                      ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                  title="Standard OpenStreetMap"
                >
                  Standard
                </button>
                <button
                  onClick={() => handleTileStyleChange('dark')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    activeTileStyle === 'dark'
                      ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                  title="Dark mode (Keyless OpenStreetMap)"
                >
                  Dark
                </button>
              </div>

              {/* Reset center */}
              <button
                onClick={handleResetView}
                className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Recenter Map"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Recenter</span>
              </button>
            </>
          )}

          {/* Google Maps External Link */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Map Container Area */}
      {isLoading ? (
        <div className="h-80 w-full rounded-2xl bg-stone-100 dark:bg-stone-800/50 flex flex-col items-center justify-center border border-stone-200 dark:border-stone-800">
          <RefreshCw className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mb-3" />
          <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">
            Resolving coordinates for {destination}...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex flex-col items-center justify-center text-center gap-3 min-h-[220px]">
          <AlertCircle className="w-8 h-8 text-amber-500" />
          <div>
            <h4 className="font-bold text-sm">Unable to render map</h4>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1 max-w-sm">{error}</p>
          </div>
          <button
            onClick={fetchCoordinates}
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 font-bold transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : coords ? (
        <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-inner group">
          {/* Leaflet Map DOM Element */}
          <div ref={mapContainerRef} className="h-80 w-full z-0" />

          {/* Overlay Map Zoom Controls */}
          <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-1.5">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-xl bg-white dark:bg-stone-800 text-stone-800 dark:text-white shadow-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-xl bg-white dark:bg-stone-800 text-stone-800 dark:text-white shadow-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Coordinates Badge Footer Overlay */}
          <div className="absolute bottom-4 left-4 z-[400] px-3 py-1.5 rounded-xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200 dark:border-stone-800 shadow-md text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              {coords.latitude.toFixed(4)}°, {coords.longitude.toFixed(4)}°
            </span>
          </div>
        </div>
      ) : (
        <div className="h-64 w-full rounded-2xl bg-stone-50 dark:bg-stone-800/40 flex items-center justify-center text-xs text-stone-500 border border-stone-200 dark:border-stone-800">
          No destination specified.
        </div>
      )}
    </div>
  );
};

export default DestinationMap;

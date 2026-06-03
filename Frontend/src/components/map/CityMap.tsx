import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '../../store/useMapStore';
import { API_CONFIG } from '../../config/api.config';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons
const busIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #3B82F6; border: 2px solid black; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);">
          <span style="color: white; font-weight: bold; font-size: 10px;">B</span>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const scooterIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #22C55E; border: 2px solid black; border-radius: 4px; width: 20px; height: 20px; box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

export const CityMap = ({ mode = "citizen" }: { mode?: "citizen" | "operator" }) => {
  const buses = useMapStore(state => state.buses);
  const scooters = useMapStore(state => state.scooters);
  const congestions = useMapStore(state => state.congestions);
  const selectedRoute = useMapStore(state => state.selectedRoute);

  const [mapCenter, setMapCenter] = useState<[number, number]>([
    API_CONFIG.MAP.DEFAULT_LAT, 
    API_CONFIG.MAP.DEFAULT_LNG
  ]);

  // Handle route display
  const routePositions: [number, number][] = [];
  // In a real app we'd decode polyline or use lat/long from segments. 
  // Here we just plot a pseudo-line based on buses or center if route selected
  if (selectedRoute && buses.length >= 2) {
      routePositions.push([buses[0].lat, buses[0].lng]);
      routePositions.push([buses[1].lat, buses[1].lng]);
  }

  return (
    <div className={`w-full h-full relative ${mode === 'operator' ? 'border-r-4 border-black' : ''}`}>
      <MapContainer 
        center={mapCenter} 
        zoom={API_CONFIG.MAP.DEFAULT_ZOOM} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          url={API_CONFIG.MAP.TILE_URL}
          attribution='&copy; OpenStreetMap contributors'
          className="grayscale opacity-80 mix-blend-multiply" 
        />
        
        {/* Congestion Overlays */}
        {congestions.map(c => {
          // Hardcoding positions for demo corridors based on ID
          let pos: [number, number] = [API_CONFIG.MAP.DEFAULT_LAT, API_CONFIG.MAP.DEFAULT_LNG];
          if (c.corridor_id === 'C-NORTH') pos = [-33.43, -70.66];
          if (c.corridor_id === 'C-SOUTH') pos = [-33.46, -70.66];
          
          return (
            <Circle 
              key={c.corridor_id}
              center={pos}
              radius={800}
              pathOptions={{ fillColor: '#EF4444', color: '#B91C1C', fillOpacity: c.density_percent / 100 }}
            >
              <Popup>
                 <div className="font-sans">
                   <h4 className="font-bold border-b border-black pb-1 mb-1">{c.corridor_name}</h4>
                   <p>Densidad: {c.density_percent}%</p>
                   <p className="text-red-600 font-bold text-xs uppercase">{c.severity}</p>
                 </div>
              </Popup>
            </Circle>
          )
        })}

        {/* Selected Route Polyline */}
        {routePositions.length > 0 && (
          <Polyline 
            positions={routePositions} 
            pathOptions={{ color: '#0F172A', weight: 6, opacity: 0.8 }} 
          />
        )}

        {/* Scooters */}
        {scooters.map(s => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={scooterIcon}>
            <Popup>
               <div className="font-sans p-1">
                 <p className="font-bold flex items-center justify-between">
                   <span>Scooter {s.id}</span>
                   <span className="bg-green-100 text-green-800 px-2 rounded-full text-xs border border-green-800">{s.battery_percent}%</span>
                 </p>
               </div>
            </Popup>
          </Marker>
        ))}

        {/* Buses */}
        {buses.map(b => (
          <Marker key={b.bus_id} position={[b.lat, b.lng]} icon={busIcon}>
            <Popup>
              <div className="font-sans">
                 <h4 className="font-bold text-lg mb-1">{b.bus_id}</h4>
                 <div className="flex justify-between items-center bg-gray-100 p-2 rounded border border-black text-sm">
                   <span>Ruta: {b.route_id}</span>
                   <span className="font-mono bg-yellow-200 px-1 border border-black">{b.speed_kmh}km/h</span>
                 </div>
                 <p className="text-xs mt-2 text-gray-600">Próxima parada en {b.next_stop_eta_seconds}s</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Decorative corners for that retro look */}
      <div className="absolute top-4 right-4 z-10">
        <div className="retro-card p-2 !bg-white/90 backdrop-blur">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
               <div className="w-3 h-3 bg-accent-blue border border-black rounded-full" /> Bus
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
               <div className="w-3 h-3 bg-accent-green border border-black rounded-sm" /> Scooter
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
               <div className="w-3 h-3 bg-accent-red border border-black rounded-full opacity-50" /> Congestión
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

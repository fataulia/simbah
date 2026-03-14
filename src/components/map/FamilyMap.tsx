'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, User, Search, List as ListIcon, Navigation } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { cn } from '@/lib/utils';

// Helper to center map on selected person
function FlyToSelected({ position, selectedId }: { position: [number, number], selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedId && position) {
      map.flyTo(position, 14, { duration: 1.5 });
    }
  }, [selectedId, position, map]);
  return null;
}

// Custom Marker
const createCustomIcon = (person: any) => {
  const isDeceased = !!person.isDeceased;
  const color = isDeceased ? '#78716c' : (person.gender === 'MALE' ? '#0ea5e9' : '#ec4899');
  
  const html = renderToStaticMarkup(
    <div className="relative group">
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-lg shadow-xl border border-zinc-100 dark:border-zinc-700 whitespace-nowrap scale-90 group-hover:scale-100 transition-transform">
            <p className="text-[10px] font-medium tracking-tight text-zinc-900 dark:text-zinc-100">{person.name}</p>
        </div>
        <div style={{
            backgroundColor: 'var(--card)',
            borderRadius: '1.2rem',
            padding: '3px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            border: `3px solid ${color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            overflow: 'hidden'
        }} className={cn(isDeceased && "grayscale")}>
            {person.photoUrl ? (
                <img src={person.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
                <User size={24} className="text-zinc-200 dark:text-zinc-700" />
            )}
        </div>
        <div style={{ 
            width: 0, height: 0, 
            borderLeft: '8px solid transparent', 
            borderRight: '8px solid transparent', 
            borderTop: `10px solid ${color}`,
            margin: 'auto',
            marginTop: '-2px'
        }} />
    </div>
  );

  return new L.DivIcon({
    html,
    className: 'custom-map-marker',
    iconSize: [48, 64],
    iconAnchor: [24, 64],
    popupAnchor: [0, -64],
  });
};

function MapResizer({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 12 });
    }
  }, [points, map]);
  return null;
}

export default function FamilyMap({ people }: { people: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const pointsWithData = useMemo(() => {
    return people
      .filter(p => p.latLong && p.latLong.includes(','))
      .map(p => {
        const [lat, lng] = p.latLong!.split(',').map((n: string) => parseFloat(n.trim()));
        return { person: p, position: [lat, lng] as [number, number] };
      })
      .filter(p => !isNaN(p.position[0]) && !isNaN(p.position[1]));
  }, [people]);

  const filteredList = useMemo(() => {
    return pointsWithData.filter(p => 
        p.person.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pointsWithData, searchTerm]);

  const selectedPosition = useMemo(() => {
    return pointsWithData.find(p => p.person.id === selectedPersonId)?.position || null;
  }, [selectedPersonId, pointsWithData]);

  if (pointsWithData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-[var(--workspace-bg)] rounded-[3.5rem] border-2 border-dashed border-[var(--border)]">
        <MapPin className="text-[var(--border)] mb-6" size={80} />
        <h3 className="text-2xl font-medium text-[var(--foreground)] tracking-tight">Belum Ada Lokasi</h3>
        <p className="mt-2 text-stone-400 font-medium text-center max-w-sm italic">Atur titik lokasi di profil anggota keluarga agar muncul di peta ini.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[75vh] p-4 lg:p-0">
      {/* Premium Sidebar */}
      <div className="w-full lg:w-80 flex flex-col bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shrink-0 shadow-lg">
          <div className="p-6 bg-[var(--card)] border-b border-[var(--border)]">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <Navigation size={16} />
                    </div>
                    <h3 className="text-xs font-medium uppercase tracking-widest text-[var(--foreground)] opacity-80">Daftar Keluarga</h3>
                  </div>
                  <span className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500">{filteredList.length} Lokasi</span>
              </div>
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Cari anggota keluarga..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-[var(--workspace-bg)] border border-[var(--border)] rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 text-[var(--foreground)] transition-all"
                  />
              </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {filteredList.map(({ person, position }) => (
                  <button 
                    key={person.id}
                    onClick={() => setSelectedPersonId(person.id)}
                    className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-2xl transition-all border group",
                        selectedPersonId === person.id 
                            ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900 shadow-xl" 
                            : "bg-[var(--workspace-bg)] border-[var(--border)] hover:border-emerald-500/50 text-[var(--foreground)]"
                    )}
                  >
                      <div className={cn(
                        "h-10 w-10 rounded-xl overflow-hidden shrink-0 border-2 transition-all", 
                        selectedPersonId === person.id ? "border-white/30 dark:border-zinc-900/10" : "border-white dark:border-zinc-800 shadow-sm",
                        !!person.isDeceased && "grayscale"
                      )}>
                          {person.photoUrl ? <img src={person.photoUrl} alt="" className="h-full w-full object-cover" /> : <User size={18} className="m-auto mt-2.5 opacity-20" />}
                      </div>
                      <div className="text-left min-w-0">
                          <p className="text-[11px] font-medium truncate tracking-tight">{person.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 opacity-60">
                            <span className="text-[8px] uppercase tracking-widest font-medium">Gen {person.generation}</span>
                            <span className="h-0.5 w-0.5 rounded-full bg-current" />
                            <span className="text-[8px] uppercase tracking-widest font-medium truncate max-w-[100px]">{person.address?.split(',')[0]}</span>
                          </div>
                      </div>
                      {selectedPersonId === person.id && (
                        <div className="ml-auto animate-pulse">
                            <Navigation size={12} fill="currentColor" />
                        </div>
                      )}
                  </button>
              ))}
              {filteredList.length === 0 && (
                <div className="py-20 text-center">
                    <p className="text-[10px] font-medium text-stone-400 uppercase tracking-widest">Tidak ditemukan</p>
                </div>
              )}
          </div>
      </div>

      {/* Modern Map Container */}
      <div className="flex-1 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-zinc-900 ring-1 ring-[var(--border)] relative bg-[var(--workspace-bg)]">
        <MapContainer 
          center={pointsWithData[0].position} 
          zoom={6} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          
          {pointsWithData.map(({ person, position }) => (
            <Marker 
              key={person.id} 
              position={position} 
              icon={createCustomIcon(person)}
              eventHandlers={{
                click: () => setSelectedPersonId(person.id)
              }}
            >
              <Popup className="premium-popup">
                <div className="p-3 min-w-[180px] text-center flex flex-col items-center">
                    <div className="h-14 w-14 rounded-2xl border-4 border-white shadow-lg overflow-hidden mb-3 bg-zinc-50 relative">
                        {person.photoUrl ? <img src={person.photoUrl} alt="" className="h-full w-full object-cover" /> : <User size={24} className="m-auto mt-4" />}
                        {!!person.isDeceased && <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center text-xs">🥀</div>}
                    </div>
                    <h4 className="text-xs font-medium text-zinc-900 leading-tight">{person.name}</h4>
                    <p className="text-[9px] font-medium text-zinc-400 mt-1 uppercase tracking-widest">Gen {person.generation}</p>
                    <p className="text-[9px] font-medium text-zinc-500 mt-2 px-2 line-clamp-2 italic">"{person.address || 'Alamat tidak spesifik'}"</p>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`, '_blank');
                        }}
                        className="mt-4 w-full py-2 rounded-xl bg-zinc-900 text-white text-[9px] font-medium uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-md"
                    >
                        Navigasi Ke Sini
                    </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {selectedPosition && <FlyToSelected position={selectedPosition} selectedId={selectedPersonId} />}
          <MapResizer points={pointsWithData.map(d => d.position)} />
        </MapContainer>
        
        {/* Custom Map Controls */}
        <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
            <div className="flex flex-col rounded-xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <button onClick={() => {}} className="h-10 w-10 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800">
                    <div className="h-0.5 w-3 bg-zinc-600 dark:text-white" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

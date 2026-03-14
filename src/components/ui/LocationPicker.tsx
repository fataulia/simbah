'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Check, MapPin, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for leaflet icons
const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  initialValue?: string;
  onSelect: (value: string) => void;
  onCancel: () => void;
}

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (p: [number, number]) => void }) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon} />
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 13);
    }, [center, map]);
    return null;
}

export default function LocationPicker({ initialValue, onSelect, onCancel }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.2088, 106.8456]); // Default Jakarta

  useEffect(() => {
    if (initialValue && initialValue.includes(',')) {
      const [lat, lng] = initialValue.split(',').map(n => parseFloat(n.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        setPosition([lat, lng]);
        setMapCenter([lat, lng]);
      }
    }
  }, [initialValue]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setIsSearching(true);
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            setMapCenter([lat, lon]);
            setPosition([lat, lon]);
        }
    } catch (err) {
        console.error("Search error", err);
    } finally {
        setIsSearching(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }} 
        className="bg-white w-full max-w-4xl h-[80vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border-8 border-white"
      >
        <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div>
              <h3 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                <MapPin className="text-blue-500" /> Titik Lokasi Peta
              </h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Klik pada peta untuk menentukan lokasi rumah</p>
          </div>
          <button onClick={onCancel} className="h-10 w-10 flex items-center justify-center rounded-2xl bg-zinc-50 text-zinc-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 relative">
            <MapContainer 
              center={mapCenter} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} />
              <MapUpdater center={mapCenter} />
            </MapContainer>

            {/* Search Overlay */}
            <form onSubmit={handleSearch} className="absolute top-6 left-6 right-6 z-[1000] flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari Kota, Alamat, atau Lokasi..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 bg-white/95 backdrop-blur-md border-none shadow-xl rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-blue-500/20"
                    />
                </div>
                <button type="submit" disabled={isSearching} className="h-14 px-6 rounded-2xl bg-zinc-900 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-zinc-800 transition-all">
                    {isSearching ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />} 
                    Cari
                </button>
            </form>

            <div className="absolute bottom-6 left-6 right-6 z-[1000] flex justify-between items-end gap-6">
                <div className="bg-white/95 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border border-white/20 min-w-[240px]">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Koordinat Terpilih</p>
                    <p className="text-sm font-black text-zinc-900">
                        {position ? `${position[0].toFixed(6)}, ${position[1].toFixed(6)}` : 'Belum memilih titik'}
                    </p>
                </div>
                
                <button 
                    disabled={!position}
                    onClick={() => position && onSelect(`${position[0]},${position[1]}`)}
                    className="h-16 px-10 rounded-[2rem] bg-blue-600 text-white font-black text-sm uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:grayscale"
                >
                    <Check size={24} /> Konfirmasi Lokasi
                </button>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

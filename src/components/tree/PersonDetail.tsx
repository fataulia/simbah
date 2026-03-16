'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MapPin, FileText, Edit, User, Trash2, Heart, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deletePerson } from '@/app/actions/tree';

interface PersonDetailProps {
  person: any | null;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: (person: any) => void;
  onRefresh?: () => void;
  onDelete?: (id: string) => void;
}

export default function PersonDetail({ person, onClose, isAdmin, onEdit, onRefresh }: PersonDetailProps) {
  if (!person) return null;

  const isDeceased = !!person.deathDate;
  const birthYear = person.birthDate ? new Date(person.birthDate).getFullYear() : '???';
  const deathYear = person.deathDate ? new Date(person.deathDate).getFullYear() : null;

  const handleDelete = async () => {
    if (!confirm(`Hapus ${person.name} dari silsilah?`)) return;
    const result = await deletePerson(person.id);
    if (result.success) {
        onRefresh?.();
        onClose();
    } else {
        alert(result.error || "Gagal menghapus.");
    }
  };

  const openWA = () => {
    if (!person.phone) return;
    const cleanPhone = person.phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    window.open(`https://wa.me/${finalPhone}`, '_blank');
  };

  const openMap = () => {
    if (!person.address) return;
    if (person.address.includes('google.com/maps')) {
        window.open(person.address, '_blank');
    } else {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(person.address)}`, '_blank');
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-end bg-black/40 backdrop-blur-md" onClick={onClose}>
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="h-full w-full max-w-sm bg-white shadow-2xl overflow-y-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
          
          {/* Header BG based on Gender & Status */}
          <div className={cn(
            "h-32 w-full shrink-0 relative",
            isDeceased ? "bg-zinc-800" : (person.gender === 'MALE' ? "bg-blue-600" : "bg-pink-600")
          )}>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#fff_2px,_transparent_1px)] bg-[length:16px_16px]" />
            <button onClick={onClose} className="absolute right-6 top-6 h-10 w-10 flex items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition-all"><X size={20} /></button>
          </div>

          <div className="px-8 pb-12 relative flex-1">
            {/* Circle Photo */}
            <div className="absolute -top-16 left-8">
              <div className={cn(
                "h-32 w-32 rounded-full border-[6px] border-white shadow-2xl bg-zinc-50 overflow-hidden flex items-center justify-center",
                isDeceased ? "grayscale" : (person.gender === 'MALE' ? "ring-4 ring-blue-500/20" : "ring-4 ring-pink-500/20")
              )}>
                {person.photoUrl ? (
                    <img src={person.photoUrl} alt={person.name} className="h-full w-full object-cover" />
                ) : (
                    <User className="text-zinc-200" size={60} />
                )}
              </div>
            </div>

            <div className="pt-20">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className={cn("text-2xl font-black leading-tight", isDeceased ? "text-zinc-500" : "text-zinc-900")}>
                            {person.name}
                            {isDeceased && <span className="block text-[10px] uppercase tracking-widest text-zinc-400 mt-1">(Almarhum/Almarhumah)</span>}
                        </h2>
                        <p className="mt-1 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Generasi ke-0{person.generation}</p>
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <button onClick={() => {
                        onClose();
                        onEdit?.(person);
                    }} className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-emerald-600 transition-all">
                        <Edit size={16} /> Edit Profil
                    </button>
                </div>

                <div className="mt-10 space-y-8">
                    {/* Life Dates */}
                    <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Kelahiran</p>
                            <p className="text-sm font-bold text-zinc-900">{birthYear}</p>
                        </div>
                        {isDeceased && (
                            <div className="text-right">
                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Wafat</p>
                                <p className="text-sm font-bold text-red-600">{deathYear}</p>
                            </div>
                        )}
                    </div>

                    {/* WhatsApp Action */}
                    {person.phone && !isDeceased && (
                        <button 
                            onClick={openWA}
                            className="w-full group flex items-center gap-4 p-4 rounded-3xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-500 hover:border-emerald-500 transition-all"
                        >
                            <div className="h-12 w-12 shrink-0 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Phone size={20} fill="currentColor" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest group-hover:text-white/80 transition-colors">Hubungi WA</p>
                                <p className="text-sm border-b border-emerald-200 font-bold text-zinc-900 group-hover:text-white group-hover:border-white/20 transition-all">{person.phone}</p>
                            </div>
                        </button>
                    )}

                    {/* Address Action */}
                    {person.address && (
                        <button 
                            onClick={openMap}
                            className="w-full group flex items-start gap-4 p-4 rounded-3xl bg-blue-50 border border-blue-100 hover:bg-blue-500 hover:border-blue-500 transition-all"
                        >
                            <div className="h-12 w-12 shrink-0 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mt-1">
                                <MapPin size={20} fill="currentColor" />
                            </div>
                            <div className="text-left py-1">
                                <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest group-hover:text-white/80 transition-colors">Lihat Lokasi</p>
                                <p className="text-sm font-bold text-zinc-900 leading-relaxed group-hover:text-white transition-colors">{person.address}</p>
                            </div>
                        </button>
                    )}

                    {/* Danger Zone */}
                    {isAdmin && (
                        <div className="pt-4 border-t border-zinc-100">
                            <button 
                                onClick={handleDelete}
                                className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-500 hover:text-white transition-all border border-red-100"
                            >
                                <Trash2 size={16} /> Hapus Anggota Keluarga
                            </button>
                        </div>
                    )}

                    {person.bio && (
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <FileText size={14} /> Catatan Keluarga
                            </label>
                            <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 text-sm text-zinc-600 leading-relaxed italic">
                                "{person.bio}"
                            </div>
                         </div>
                    )}
                </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

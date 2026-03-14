'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MapPin, Calendar, FileText, Navigation, User, Heart, Baby, Shield, ExternalLink, MessageCircle, Trash2, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deletePerson } from '@/app/actions/tree';

interface PersonDetailModalProps {
  person: any;
  onClose: () => void;
  onEdit?: (person: any) => void;
  isAdmin?: boolean;
  onAddSpouse?: (id: string) => void;
  onAddChild?: (id: string) => void;
  onRefresh?: () => void;
}

export default function PersonDetailModal({ person, onClose, onEdit, isAdmin, onAddSpouse, onAddChild, onRefresh }: PersonDetailModalProps) {
  if (!person) return null;

  const isDeceased = !!person.isDeceased;
  const birthYear = person.birthDate ? new Date(person.birthDate).getFullYear() : null;
  const deathYear = person.deathDate ? new Date(person.deathDate).getFullYear() : null;

  const handleWhatsApp = () => {
    if (!person.phone) return;
    const cleanPhone = person.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('62') ? cleanPhone : `62${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`;
    window.open(`https://wa.me/${phoneWithCountry}`, '_blank');
  };

  const handleOpenMaps = () => {
    if (!person.latLong) return;
    window.open(`https://www.google.com/maps?q=${person.latLong}`, '_blank');
  };

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

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
        className="relative w-full max-w-[340px] overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-300 border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className={cn(
            "h-20 w-full relative",
            isDeceased ? "bg-stone-800" : (person.gender === 'MALE' ? "bg-blue-600" : "bg-pink-600")
        )}>
            <button 
                onClick={onClose}
                className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors z-30 shadow-sm"
            >
                <X size={16} />
            </button>
        </div>

        {/* Profile Info - Super Compact */}
        <div className="px-6 pb-6 pt-0 -mt-10 relative z-10">
            <div className="flex flex-col items-center">
                <div 
                  style={{ borderColor: 'var(--card)', backgroundColor: 'var(--node-bg)' }}
                  className={cn(
                    "h-20 w-20 rounded-[1.8rem] border-[4px] shadow-xl overflow-hidden flex items-center justify-center",
                    isDeceased && "grayscale"
                )}>
                    {person.photoUrl ? (
                        <img src={person.photoUrl} alt={person.name} className="h-full w-full object-cover" />
                    ) : (
                        <User size={36} className="text-zinc-300 dark:text-zinc-600" />
                    )}
                </div>

                <div className="mt-3 text-center w-full">
                    <h2 className={cn(
                        "text-lg font-medium tracking-tight truncate px-2",
                        isDeceased ? "text-zinc-500 italic" : "text-[var(--foreground)]"
                    )}>
                        {person.name}
                    </h2>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                        <span className={cn(
                            "px-2 py-0.5 rounded-full text-[8px] font-medium uppercase tracking-[0.2em] border",
                            person.gender === 'MALE' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-pink-50 text-pink-600 border-pink-100"
                        )}>
                            {person.gender === 'MALE' ? 'Pria' : 'Wanita'}
                        </span>
                        <span style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)', borderColor: 'var(--border)' }} className="px-2 py-0.5 rounded-full border text-[8px] font-medium uppercase tracking-[0.2em]">
                            GEN {person.generation}
                        </span>
                    </div>
                </div>
            </div>

            {/* Compact Action List */}
            <div className="space-y-2 mt-6">
                <div style={{ backgroundColor: 'var(--secondary)', borderColor: 'var(--border)' }} className="p-3 rounded-2xl border flex items-center gap-3">
                    <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-orange-100/80 text-orange-600 shrink-0">
                        <Calendar size={14} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[8px] font-medium text-zinc-400 uppercase tracking-widest">Garis Hidup</p>
                        <p className="text-xs font-medium text-[var(--foreground)] truncate">
                            {birthYear || '?'} — {isDeceased ? (deathYear || 'Wafat') : 'Sekarang'}
                        </p>
                    </div>
                </div>

                {person.phone && (
                  <button 
                    onClick={handleWhatsApp}
                    className="w-full p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                  >
                      <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                          <MessageCircle size={14} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                          <p className="text-[8px] font-medium text-emerald-600/60 uppercase tracking-widest">WhatsApp</p>
                          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 truncate">{person.phone}</p>
                      </div>
                      <ExternalLink size={12} className="text-emerald-400 opacity-50" />
                  </button>
                )}

                {person.latLong && (
                  <button 
                    onClick={handleOpenMaps}
                    className="w-full p-3 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 flex items-center gap-3 transition-all hover:bg-sky-100 dark:hover:bg-sky-900/40"
                  >
                      <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 shrink-0">
                          <Navigation size={14} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                          <p className="text-[8px] font-medium text-sky-600/60 uppercase tracking-widest">Lokasi</p>
                          <p className="text-xs font-medium text-sky-700 dark:text-sky-400 truncate">
                             {person.address || 'Buka di Google Maps'}
                          </p>
                      </div>
                      <div className="bg-sky-600 text-white px-2 py-0.5 rounded-lg text-[7px] font-medium uppercase tracking-[0.2em] shadow-sm">MAPS</div>
                  </button>
                )}
            </div>

            {/* Footer Buttons - Small & Clean */}
            <div className="mt-8 flex gap-2">
                <button 
                    onClick={onClose}
                    className="flex-1 h-12 rounded-2xl bg-slate-50 border border-slate-100 font-bold uppercase text-[10px] text-slate-500 tracking-widest hover:bg-slate-100 transition-all shadow-sm"
                >
                    Tutup
                </button>
                <button 
                    onClick={() => { onClose(); onEdit?.(person); }}
                    className="flex-[2] h-12 px-4 rounded-2xl bg-white border border-slate-100 text-slate-800 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                    <Shield size={14} className="text-slate-600" /> Edit Profil
                </button>
            </div>

            <div className={`mt-3 grid grid-cols-3 gap-2`}>
                 <button 
                     onClick={() => { onClose(); onAddSpouse?.(person.id); }}
                     className="flex flex-col items-center justify-center h-16 rounded-2xl bg-[#e6efeb] text-[#00b87c] border border-[rgba(0,184,124,0.2)] hover:bg-[#d8e6df] transition-all"
                 >
                     <UserPlus size={18} className="mb-1" />
                     <span className="text-[9px] font-bold uppercase tracking-wider">Pasangan</span>
                 </button>
                 <button 
                     onClick={() => { onClose(); onAddChild?.(person.id); }}
                     className="flex flex-col items-center justify-center h-16 rounded-2xl bg-[#e0eaef] text-[#0095ff] border border-[rgba(0,149,255,0.2)] hover:bg-[#d1dde6] transition-all"
                 >
                     <Baby size={18} className="mb-1" />
                     <span className="text-[9px] font-bold uppercase tracking-wider">Anak</span>
                 </button>
                 <button 
                     onClick={handleDelete}
                     className="flex flex-col items-center justify-center h-16 rounded-2xl bg-[#f0dedd] text-[#ff5c5c] border border-[rgba(255,92,92,0.2)] hover:bg-[#e6d0cf] transition-all"
                 >
                     <Trash2 size={18} className="mb-1" />
                     <span className="text-[9px] font-bold uppercase tracking-wider">Hapus</span>
                 </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
}

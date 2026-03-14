'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, MapPin, Phone, FileText, Save, Shield, Search, Check, Camera, Loader2, AlertCircle, Trash2, Heart, Baby, CheckCircle2, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadPhoto } from '@/app/actions/upload';
import { deletePerson, addSpouse } from '@/app/actions/tree';
import ImageCropper from '@/components/ui/ImageCropper';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/ui/LocationPicker'), { ssr: false });

interface PersonFormProps {
  onClose: () => void;
  existingPeople: any[];
  onSave: (data: any) => Promise<{ success: boolean; id?: string; error?: string }>;
  editPerson?: any | null;
  preselectedParentId?: string;
  preselectedPartnerId?: string;
}

export default function PersonForm({ 
  onClose, 
  existingPeople, 
  onSave, 
  editPerson,
  preselectedParentId,
  preselectedPartnerId
}: PersonFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    generation: 1,
    birthYear: '',
    address: '',
    latLong: '',
    phone: '',
    isDeceased: false as boolean,
    deathYear: '',
    bio: '',
    photoUrl: '',
    parentId: preselectedParentId || '',
    partnerId: preselectedPartnerId || '',
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (preselectedParentId) {
        const p = existingPeople.find(x => x.id === preselectedParentId);
        if (p) setFormData(prev => ({ ...prev, generation: p.generation + 1 }));
    } else if (preselectedPartnerId) {
        const p = existingPeople.find(x => x.id === preselectedPartnerId);
        if (p) setFormData(prev => ({ ...prev, generation: p.generation }));
    }
  }, [preselectedParentId, preselectedPartnerId, existingPeople]);

  useEffect(() => {
    if (editPerson) {
      setFormData({
        name: editPerson.name || '',
        gender: editPerson.gender || 'MALE',
        generation: editPerson.generation || 1,
        birthYear: editPerson.birthDate ? new Date(editPerson.birthDate).getFullYear().toString() : '',
        address: editPerson.address || '',
        latLong: editPerson.latLong || '',
        phone: editPerson.phone || '',
        isDeceased: !!editPerson.isDeceased,
        deathYear: editPerson.deathDate ? new Date(editPerson.deathDate).getFullYear().toString() : '',
        bio: editPerson.bio || '',
        photoUrl: editPerson.photoUrl || '',
        parentId: '', 
        partnerId: '',
      });
    }
  }, [editPerson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const payload = {
        ...formData,
        deathDate: formData.isDeceased && formData.deathYear ? new Date(parseInt(formData.deathYear), 0, 1) : null,
      };
      const result = await onSave(payload);
      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.error || "Gagal menyimpan data.");
      }
    } catch (err: any) {
      setErrorMessage(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDelete = async () => {
    if (!editPerson) return;
    if (!confirm(`Hapus ${editPerson.name} dari silsilah?`)) return;
    
    setIsSubmitting(true);
    try {
        const result = await deletePerson(editPerson.id);
        if (result.success) {
            onClose();
        } else {
            setErrorMessage(result.error || "Gagal menghapus.");
        }
    } catch (err) {
        setErrorMessage("Terjadi kesalahan saat menghapus.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setRawImage(reader.result as string); setIsCropping(true); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropping(false);
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const uploadData = new FormData();
      uploadData.append("file", croppedBlob, "photo.webp");
      const result = await uploadPhoto(uploadData);
      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, photoUrl: result.url! }));
      } else {
        setErrorMessage(result.error || "Gagal mengunggah foto.");
      }
    } catch (err: any) { 
      setErrorMessage("Gagal upload foto: " + (err.message || "Unknown error")); 
    } finally { 
      setIsUploading(false); 
      setRawImage(null); 
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[160] flex items-center justify-end bg-black/40 backdrop-blur-md" onClick={onClose}>
        <motion.div 
          initial={{ x: '100%' }} 
          animate={{ x: 0 }} 
          exit={{ x: '100%' }} 
          className="h-full w-full max-w-xl bg-white dark:bg-stone-900 shadow-2xl overflow-y-auto transition-colors" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-stone-900 px-8 py-6 backdrop-blur-md">
            <div className="flex flex-col">
                <h2 className="text-xl font-medium text-stone-900 dark:text-stone-100 tracking-tight">
                    {editPerson ? 'Edit Profil' : preselectedParentId ? 'Tambah Anak' : preselectedPartnerId ? 'Tambah Pasangan' : 'Tambah Anggota'}
                </h2>
                {editPerson && <p className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest mt-0.5">ID: {editPerson.id}</p>}
            </div>
            <div className="flex items-center gap-2">
                {editPerson && (
                    <button type="button" onClick={handleDelete} className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={18} />
                    </button>
                )}
                <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
                  <X size={20} />
                </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-12 pb-32">
            {errorMessage && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
                    <AlertCircle size={18} /> {errorMessage}
                </div>
            )}

            {/* Photo & Basic Info */}
            <section className="flex flex-col md:flex-row gap-8 items-center">
                <div className="relative h-32 w-32 shrink-0 rounded-[2rem] overflow-hidden bg-stone-50 dark:bg-stone-800 border-4 border-white dark:border-zinc-800 shadow-xl group">
                  {isUploading ? (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-800">
                      <Loader2 className="animate-spin text-emerald-500" size={24} />
                      <p className="text-[8px] font-medium text-stone-400 mt-2 uppercase">Uploading...</p>
                    </div>
                  ) : formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-stone-200 dark:text-stone-700">
                      <User size={60} />
                    </div>
                  )}
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-zinc-900/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                <div className="flex-1 space-y-4 w-full">
                    <div className="space-y-1.5 text-stone-900 dark:text-stone-100">
                      <label className="text-[10px] font-medium text-stone-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-12 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 px-4 text-sm font-medium outline-none focus:border-emerald-500 transition-colors" placeholder="Ketik nama di sini..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-stone-400 uppercase tracking-widest ml-1">Gender</label>
                          <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
                              <button type="button" onClick={() => setFormData({ ...formData, gender: 'MALE' })} className={cn("flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-all", formData.gender === 'MALE' ? "bg-white dark:bg-stone-700 shadow text-blue-600 dark:text-blue-400" : "text-stone-400")}>PRIA</button>
                              <button type="button" onClick={() => setFormData({ ...formData, gender: 'FEMALE' })} className={cn("flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-all", formData.gender === 'FEMALE' ? "bg-white dark:bg-stone-700 shadow text-pink-600 dark:text-pink-400" : "text-stone-400")}>WANITA</button>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-stone-900 dark:text-stone-100">
                          <label className="text-[10px] font-medium text-stone-400 uppercase tracking-widest ml-1">Tahun Lahir</label>
                          <input type="number" placeholder="Contoh: 1970" value={formData.birthYear} onChange={e => setFormData({ ...formData, birthYear: e.target.value })} className="w-full h-10 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 px-4 text-xs font-medium focus:border-emerald-500 outline-none transition-colors" />
                        </div>
                    </div>
                </div>
            </section>

            {/* WA & Death Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-stone-900 dark:text-stone-100">
                <div className="space-y-4">
                    <label className="text-[10px] font-medium text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Phone size={14} className="text-emerald-500" /> No. WhatsApp
                    </label>
                    <div className="relative">
                        <input 
                            type="tel" 
                            placeholder="0812345..." 
                            value={formData.phone} 
                            onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                            className="w-full h-12 rounded-2xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 px-4 pl-12 text-sm font-medium focus:border-emerald-500 outline-none transition-colors" 
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 font-medium text-xs">+62</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-medium text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <AlertCircle size={14} className="text-stone-500" /> Status
                    </label>
                    <div className="flex gap-2">
                         <button 
                            type="button" 
                            onClick={() => setFormData({ ...formData, isDeceased: false, deathYear: '' })}
                            className={cn(
                                "flex-1 h-12 rounded-2xl border text-[10px] font-medium tracking-widest transition-all",
                                !formData.isDeceased 
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg" 
                                    : "bg-stone-50 dark:bg-stone-800 border-stone-100 dark:border-stone-700 text-stone-400"
                            )}
                         >
                            MASIH ADA
                         </button>
                         <button 
                            type="button" 
                            onClick={() => setFormData({ ...formData, isDeceased: true })}
                            className={cn(
                                "flex-1 h-12 rounded-2xl border text-[10px] font-medium tracking-widest transition-all",
                                formData.isDeceased 
                                    ? "bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-100 shadow-lg" 
                                    : "bg-stone-50 dark:bg-stone-800 border-stone-100 dark:border-stone-700 text-stone-400"
                            )}
                         >
                            WAFAT
                         </button>
                    </div>

                    <AnimatePresence>
                        {formData.isDeceased && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden pt-2"
                            >
                                <input 
                                    type="number" 
                                    placeholder="Tahun Wafat (Contoh: 2024)" 
                                    value={formData.deathYear} 
                                    onChange={e => setFormData({ ...formData, deathYear: e.target.value })} 
                                    className="w-full h-12 rounded-2xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 px-4 text-sm font-medium focus:border-stone-900 dark:focus:border-white outline-none transition-colors" 
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Address & Map Section */}
            <div className="space-y-6 text-stone-900 dark:text-stone-100">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-medium text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <MapPin size={14} className="text-blue-500" /> Lokasi & Alamat
                    </label>
                    <button 
                        type="button" 
                        onClick={() => setIsMapOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800 text-[10px] font-medium hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                        <Navigation size={12} /> {formData.latLong ? 'TITIK TERPASANG' : 'SET MAP'}
                    </button>
                </div>
                <div className="space-y-4">
                    <textarea 
                        placeholder="Alamat lengkap keluarga..." 
                        value={formData.address} 
                        onChange={e => setFormData({ ...formData, address: e.target.value })} 
                        className="w-full min-h-[80px] rounded-3xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 p-6 text-sm font-medium outline-none resize-none leading-relaxed transition-colors"
                    />
                    {formData.latLong && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl animate-in fade-in slide-in-from-top-2">
                            <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                            <p className="text-[10px] font-medium text-emerald-800 dark:text-emerald-300 tracking-wide uppercase">Koordinat: {formData.latLong}</p>
                            <button type="button" onClick={() => setFormData({ ...formData, latLong: '' })} className="ml-auto text-[10px] text-stone-400 dark:text-stone-500 underline uppercase">Hapus Titik</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bio Section */}
            <div className="space-y-4 text-stone-900 dark:text-stone-100 pb-10">
                <label className="text-[10px] font-medium text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileText size={14} className="text-stone-400" /> Cerita Singkat (Bio)
                </label>
                <textarea 
                    placeholder="Tuliskan sedikit sejarah atau info tentang beliau..." 
                    value={formData.bio} 
                    onChange={e => setFormData({ ...formData, bio: e.target.value })} 
                    className="w-full min-h-[120px] rounded-3xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 p-6 text-sm font-medium outline-none resize-none leading-relaxed transition-colors"
                />
            </div>

            <footer className="fixed bottom-0 left-0 right-0 p-8 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-t border-stone-100 dark:border-stone-800 flex justify-end max-w-xl ml-auto">
              <button type="submit" disabled={isSubmitting || isUploading} className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 font-medium hover:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xl disabled:opacity-50 transition-all">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                <span className="uppercase text-sm tracking-widest px-2">Simpan Perubahan</span>
              </button>
            </footer>
          </form>
        </motion.div>
      </motion.div>

      <AnimatePresence>{isCropping && rawImage && <ImageCropper image={rawImage} onCropComplete={handleCropComplete} onCancel={() => { setIsCropping(false); setRawImage(null); }} />}</AnimatePresence>
      <AnimatePresence>
        {isMapOpen && (
            <LocationPicker 
                initialValue={formData.latLong}
                onSelect={(val) => { setFormData({ ...formData, latLong: val }); setIsMapOpen(false); }}
                onCancel={() => setIsMapOpen(false)}
            />
        )}
      </AnimatePresence>
    </>
  );
}

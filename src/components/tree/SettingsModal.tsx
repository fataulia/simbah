'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Save, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import { getPasscode, updatePasscode } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      const code = await getPasscode();
      setPasscode(code);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus('idle');

    try {
      const result = await updatePasscode(passcode);
      if (result.success) {
        setStatus('success');
        setMessage('Kode akses berhasil diperbarui!');
        setTimeout(onClose, 2000);
      } else {
        setStatus('error');
        setMessage(result.message || 'Gagal memperbarui.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Terjadi kesalahan koneksi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white dark:bg-stone-900 shadow-2xl border border-zinc-100 dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <h2 className="text-xl font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                <Lock size={20} className="text-emerald-500" /> Pengaturan Akses
              </h2>
              <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mt-1">Ganti sandi gembok keluarga</p>
            </div>
            <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {isLoading ? (
            <div className="h-40 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Memuat...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2 flex items-center gap-2">
                  <Key size={12} /> Kode Akses Baru
                </label>
                <input 
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Masukkan kode baru..."
                  className="h-14 w-full rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-6 text-sm font-bold tracking-widest text-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/20 transition-all sm:text-center uppercase"
                />
                <p className="text-[9px] text-zinc-500 px-2 leading-relaxed italic">
                  * Semua orang yang ingin melihat silsilah harus memasukkan kode ini. Jangan sampai lupa!
                </p>
              </div>

              {status !== 'idle' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-2xl flex items-center gap-3 text-xs font-medium border",
                    status === 'success' 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                      : "bg-red-50 border-red-100 text-red-600"
                  )}
                >
                  {status === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {message}
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={isSaving || !passcode}
                className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Simpan Perubahan
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

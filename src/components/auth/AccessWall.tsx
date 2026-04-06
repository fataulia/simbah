'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, TreeDeciduous, ArrowRight, UserPlus } from 'lucide-react';
import { verifyPasscode, createLineage } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

export default function AccessWall() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      if (mode === 'login') {
        const result = await verifyPasscode(code);
        if (result.success) {
          window.location.reload();
        } else {
          setIsError(true);
          setErrorMessage(result.message || "Kode akses salah.");
        }
      } else {
        const result = await createLineage(name, code);
        if (result.success) {
          window.location.reload();
        } else {
          setIsError(true);
          setErrorMessage(result.message || "Gagal membuat silsilah.");
        }
      }
    } catch (err) {
      setIsError(true);
      setErrorMessage("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setIsError(false);
    setErrorMessage('');
    setCode('');
    setName('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#fdfcf8] dark:bg-zinc-950 transition-colors">
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{ backgroundImage: 'radial-gradient(#2d5a27 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md px-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-600 shadow-xl">
            <TreeDeciduous className="text-white" size={32} />
          </div>

          <h1 className="text-3xl font-medium tracking-tight text-zinc-900 dark:text-white">
            SiMbah
          </h1>
          <p className="mt-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em]">
            Silsilah Lintas Keluarga
          </p>

          <div className="mt-6 w-full rounded-[2rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl overflow-hidden relative">

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col items-center gap-1 mb-6">
                  <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
                    {mode === 'login' ? 'Masuk' : 'Buat Silsilah'}
                  </h2>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                    {mode === 'login' 
                      ? 'Masukkan kode silsilah untuk melihat data yang ada.'
                      : 'Buat ruang keluarga mandiri baru milik Anda.'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {mode === 'register' && (
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setIsError(false); }}
                        placeholder="Nama Keluarga (Misal: Bani Sastro)"
                        className={cn(
                          "h-14 w-full rounded-2xl border bg-zinc-50 dark:bg-zinc-800 px-5 text-center text-sm font-medium transition-all focus:outline-none focus:ring-4",
                          isError && !name
                            ? "border-red-200 bg-red-50 text-red-600 focus:ring-red-100 dark:border-red-900/50 dark:bg-red-900/20"
                            : "border-zinc-100 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-100 dark:focus:ring-emerald-900/20"
                        )}
                        autoFocus
                        required
                      />
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => { setCode(e.target.value); setIsError(false); }}
                      placeholder="Kode Akses (Buat Sendiri)"
                      className={cn(
                        "h-16 w-full rounded-2xl border bg-zinc-50 dark:bg-zinc-800 px-6 text-center text-xl font-medium tracking-[0.2em] md:tracking-[0.6em] transition-all focus:outline-none focus:ring-4 placeholder:tracking-normal placeholder:text-sm",
                        isError
                          ? "border-red-200 bg-red-50 text-red-600 focus:ring-red-100 dark:border-red-900/50 dark:bg-red-900/20"
                          : "border-zinc-100 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-100 dark:focus:ring-emerald-900/20"
                      )}
                      autoFocus={mode === 'login'}
                      required
                      minLength={4}
                    />
                  </div>

                  {isError && (
                    <p className="mt-2 text-[10px] text-center font-medium text-red-500 uppercase tracking-wider">
                      {errorMessage || "Terjadi kesalahan"}
                    </p>
                  )}

                  <button
                    disabled={isLoading || !code || (mode === 'register' && !name)}
                    className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 dark:bg-white font-bold text-[11px] uppercase tracking-widest text-white dark:text-zinc-900 transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50"
                  >
                    {isLoading ? "Memproses..." : (mode === 'login' ? "Buka Silsilah" : "Mulai Silsilah Baru")}
                    {mode === 'login' ? <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /> : <UserPlus size={18} className="transition-transform group-hover:scale-110" />}
                  </button>
                </form>
              </motion.div>
            </AnimatePresence>

            {/* Toggle Mode */}
            <div className="mt-6 flex justify-center border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <button 
                type="button"
                onClick={toggleMode}
                className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                {mode === 'login' ? "Silsilah belum terdaftar? Buat Baru" : "Sudah punya kode silsilah? Masuk"}
              </button>
            </div>

          </div>

          <p className="mt-6 text-[9px] text-zinc-400 dark:text-zinc-600 font-bold tracking-widest uppercase">
            &copy; 2026 SiMbah Project
          </p>
        </div>
      </motion.div>
    </div>
  );
}


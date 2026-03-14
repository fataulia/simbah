'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, TreeDeciduous, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { verifyPasscode } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

export default function AccessWall() {
  const [code, setCode] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      const result = await verifyPasscode(code);
      if (result.success) {
        window.location.reload();
      } else {
        setIsError(true);
        setErrorMessage(result.message || "Kode akses salah.");
      }
    } catch (err) {
      setIsError(true);
      setErrorMessage("Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
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
            Silsilah Simbah
          </p>

          <div className="mt-6 w-full rounded-[2rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl overflow-hidden relative">

            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col items-center gap-1 mb-6">
                  <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
                    Gembok Keluarga
                  </h2>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                    Masukkan kode akses untuk masuk.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type="password"
                      value={code}
                      onChange={(e) => { setCode(e.target.value); setIsError(false); }}
                      placeholder="Kode Akses"
                      className={cn(
                        "h-16 w-full rounded-2xl border bg-zinc-50 dark:bg-zinc-800 px-6 text-center text-xl font-medium tracking-[0.6em] transition-all focus:outline-none focus:ring-4",
                        isError
                          ? "border-red-200 bg-red-50 text-red-600 focus:ring-red-100 dark:border-red-900/50 dark:bg-red-900/20"
                          : "border-zinc-100 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-100 dark:focus:ring-emerald-900/20"
                      )}
                      autoFocus
                    />
                  </div>

                  {isError && (
                    <p className="mt-2 text-[10px] text-center font-medium text-red-500 uppercase tracking-wider">
                      {errorMessage || "Terjadi kesalahan"}
                    </p>
                  )}

                  <button
                    disabled={isLoading || !code}
                    className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 dark:bg-white font-bold text-[11px] uppercase tracking-widest text-white dark:text-zinc-900 transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50"
                  >
                    {isLoading ? "Memeriksa..." : "Buka Silsilah"}
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              </motion.div>
            </AnimatePresence>

          </div>

          <p className="mt-6 text-[9px] text-zinc-400 dark:text-zinc-600 font-bold tracking-widest uppercase">
            &copy; 2026 SiMbah Project
          </p>
        </div>
      </motion.div>
    </div>
  );
}

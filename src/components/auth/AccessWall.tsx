'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, TreeDeciduous, ArrowRight, ShieldCheck, LogIn } from 'lucide-react';
import { verifyPasscode, signInWithGoogle } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

export default function AccessWall() {
  const [code, setCode] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);

    try {
      const result = await verifyPasscode(code);
      if (result.success) {
        window.location.reload(); // Refresh to show the app
      } else {
        setIsError(true);
      }
    } catch (err) {
      setIsError(true);
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
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[3rem] bg-emerald-600 shadow-2xl shadow-emerald-200 dark:shadow-none">
            <TreeDeciduous className="text-white" size={48} />
          </div>
          
          <h1 className="text-4xl font-medium tracking-tight text-zinc-900 dark:text-white">
            SiMbah
          </h1>
          <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em]">
            Silsilah Keluarga
          </p>
          
          <div className="mt-10 w-full rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-2 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-400">
                <Lock size={20} />
              </div>
              <h2 className="text-xl font-medium text-zinc-900 dark:text-white">Gembok Keluarga</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Masukkan kode akses untuk melihat silsilah.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input 
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Kode Akses"
                  className={cn(
                    "h-16 w-full rounded-2xl border bg-zinc-50 dark:bg-zinc-800 px-6 text-center text-xl font-medium tracking-[0.6em] transition-all focus:outline-none focus:ring-4",
                    isError 
                      ? "border-red-200 bg-red-50 text-red-600 focus:ring-red-100 dark:border-red-900/50 dark:bg-red-900/20" 
                      : "border-zinc-100 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-100 dark:focus:ring-emerald-900/20"
                  )}
                  autoFocus
                />
                {isError && (
                  <p className="mt-2 text-[10px] font-medium text-red-500 uppercase tracking-wider">
                    Kode salah! Silakan tanya Admin.
                  </p>
                )}
              </div>

              <button 
                disabled={isLoading || !code}
                className="group flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 dark:bg-white font-medium text-white dark:text-zinc-900 transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 shadow-xl"
              >
                {isLoading ? "Memeriksa..." : "Buka Silsilah"}
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <div className="mt-10 border-t border-zinc-50 dark:border-zinc-800 pt-6 text-center">
              <p className="text-[10px] uppercase font-medium text-zinc-400 tracking-widest">
                Anda Admin?
              </p>
              <button 
                className="mt-3 flex items-center gap-2 mx-auto text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                  } catch (err) {
                    if ((err as Error).message !== 'NEXT_REDIRECT') {
                      alert("Gagal login: " + (err as Error).message);
                    }
                  }
                }}
              >
                <LogIn size={16} />
                Masuk via Google
              </button>
            </div>
          </div>

          <p className="mt-10 text-[10px] text-zinc-400 dark:text-zinc-600 font-medium tracking-wide">
            &copy; 2026 SiMbah Project &bull; Privasi Terjaga
          </p>
        </div>
      </motion.div>
    </div>
  );
}

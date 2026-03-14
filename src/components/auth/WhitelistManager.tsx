'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Trash2, Mail, ShieldCheck, ShieldAlert } from 'lucide-react';
import { getWhitelist, addToWhitelist, removeFromWhitelist } from '@/app/actions/auth';

interface WhitelistManagerProps {
  onClose: () => void;
}

export default function WhitelistManager({ onClose }: WhitelistManagerProps) {
  const [list, setList] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    setIsLoading(true);
    try {
      const data = await getWhitelist();
      setList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    try {
      await addToWhitelist(newEmail, newName);
      setNewEmail('');
      setNewName('');
      loadList();
    } catch (err) {
      alert("Gagal menambah email. Mungkin sudah terdaftar?");
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Hapus admin ini?")) return;
    try {
      await removeFromWhitelist(id);
      loadList();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Kelola Whitelist Admin</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Kontrol Panel Superuser</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Add Form */}
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-[1fr,1.2fr,auto] gap-3 bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
            <input 
              type="text" 
              placeholder="Nama (Opsional)" 
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-sm focus:border-emerald-500 outline-none"
            />
            <input 
              required
              type="email" 
              placeholder="Email Google" 
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-sm focus:border-emerald-500 outline-none"
            />
            <button type="submit" className="h-12 px-6 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-200">
              <UserPlus size={18} />
              Tambah
            </button>
          </form>

          {/* List */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Daftar Admin Aktif</h3>
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {isLoading ? (
                <p className="text-center py-8 text-sm text-zinc-400">Loading whitelist...</p>
              ) : list.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-2xl hover:border-emerald-100 hover:bg-emerald-50/10 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={item.role === 'SUPERUSER' ? "text-emerald-600" : "text-zinc-400"}>
                      {item.role === 'SUPERUSER' ? <ShieldAlert size={20} /> : <Mail size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{item.name || 'Admin'}</p>
                      <p className="text-[10px] font-medium text-zinc-500">{item.email}</p>
                    </div>
                    {item.role === 'SUPERUSER' && (
                      <span className="text-[9px] font-black bg-zinc-900 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Super</span>
                    )}
                  </div>
                  {item.role !== 'SUPERUSER' && (
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 p-6 text-center border-t border-zinc-100 mt-auto">
          <p className="text-[10px] text-zinc-400 font-medium">
            Sistem Whitelist ini memastikan hanya email terdaftar yang bisa masuk sebagai Admin.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

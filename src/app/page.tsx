'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Search, Settings, TreeDeciduous, LogOut, UserPlus, Shield, ShieldCheck, Map as MapIcon, LayoutGrid, Sun, Moon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';

import FamilyTree from '@/components/tree/FamilyTree';
import HierarchyFilter from '@/components/tree/HierarchyFilter';
import AccessWall from '@/components/auth/AccessWall';
import PersonForm from '@/components/tree/PersonForm';
import PersonDetailModal from '@/components/tree/PersonDetailModal';
import WhitelistManager from '@/components/auth/WhitelistManager';

import { getFamilyData, addPerson, updatePerson, deletePerson } from './actions/tree';
import { checkAccess, logout, checkIsAdmin, checkIsSuperuser } from './actions/auth';
import { Person } from '@/lib/mock-data';

// Dynamic import with SSR disabled for Leaflet
const FamilyMap = dynamic(() => import('@/components/map/FamilyMap'), { 
  ssr: false,
  loading: () => <div className="h-[70vh] w-full bg-zinc-100 animate-pulse rounded-[3rem] border-8 border-white" />
});

export default function Home() {
  const [viewMode, setViewMode] = useState<'TREE' | 'MAP'>('TREE');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isWhitelistOpen, setIsWhitelistOpen] = useState(false);
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [preselectedParentId, setPreselectedParentId] = useState<string | null>(null);
  const [preselectedPartnerId, setPreselectedPartnerId] = useState<string | null>(null);
  
  const [generationFilter, setGenerationFilter] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [familyData, setFamilyData] = useState<{ people: any[], families: any[], children: any[] }>({
    people: [],
    families: [],
    children: []
  });

  const refreshData = async () => {
    try {
      const data = await getFamilyData();
      setFamilyData({
        people: data.people,
        families: data.families,
        children: data.children
      });
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    // Check saved theme
    const savedTheme = localStorage.getItem('simbah_theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('simbah_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    async function init() {
      const access = await checkAccess();
      setHasAccess(access);
      if (access) {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
        if (adminStatus) {
            const superStatus = await checkIsSuperuser();
            setIsSuperuser(superStatus);
        }
        await refreshData();
      }
    }
    init();
  }, []);

  const handleOpenDetail = (person: Person) => {
    setSelectedPerson(person);
  };

  const handleOpenEdit = (person: Person) => {
    setEditPerson(person);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditPerson(null);
    setPreselectedParentId(null);
    setPreselectedPartnerId(null);
  };

  if (hasAccess === null) return null;
  if (!hasAccess) return <AccessWall />;

  return (
    <div className={cn("flex min-h-screen flex-col transition-colors duration-500", theme === 'dark' ? "bg-[var(--workspace-bg)]" : "bg-[var(--workspace-bg)]")}>
      {/* Premium Distinct Navigation Bar */}
      <header className="sticky top-0 z-[100] flex h-16 md:h-20 items-center justify-between px-6 md:px-12 premium-header transition-all duration-300">
        {/* Brand Section */}
        <div className="flex items-center gap-4 group">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-lg">
              <TreeDeciduous className="text-white" size={24} />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-medium tracking-tight text-[var(--foreground)]">
              SiMbah
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">
              Silsilah Keluarga
            </p>
          </div>
        </div>

        {/* Action Center */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* View Mode Island */}
          <div className="hidden sm:flex p-1.5 rounded-2xl bg-[var(--secondary)] border border-[var(--border)]">
             <button 
                onClick={() => setViewMode('TREE')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 text-xs font-medium rounded-xl transition-all duration-300", 
                  viewMode === 'TREE' 
                    ? "bg-[var(--header-bg)] text-emerald-600 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
             >
                <LayoutGrid size={14} /> <span>Pohon</span>
             </button>
             <button 
                onClick={() => setViewMode('MAP')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 text-xs font-medium rounded-xl transition-all duration-300", 
                  viewMode === 'MAP' 
                    ? "bg-[var(--header-bg)] text-emerald-600 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
             >
                <MapIcon size={14} /> <span>Peta</span>
             </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Premium */}
            <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="relative h-10 w-16 md:w-20 rounded-full bg-[var(--secondary)] border border-[var(--border)] p-1 transition-all duration-300"
            >
                <motion.div 
                    animate={{ x: theme === 'light' ? 0 : (window.innerWidth < 768 ? 24 : 40) }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-[var(--header-bg)] shadow-md flex items-center justify-center text-orange-500 dark:text-yellow-400 z-10"
                >
                    {theme === 'light' ? <Sun size={14} /> : <Moon size={14} />}
                </motion.div>
            </button>

            <div className="h-8 w-px bg-[var(--border)] mx-1 hidden lg:block" />

            <button 
                onClick={async () => { if(confirm('Logout?')) { await logout(); window.location.reload(); } }}
                className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-xl border border-[var(--border)] text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
                <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {isAdmin && (
        <div className="bg-emerald-800/90 backdrop-blur-sm py-1.5 px-8 text-center border-b border-emerald-700/50">
          <p className="text-[9px] font-medium text-emerald-50/80 uppercase tracking-[0.5em] flex items-center justify-center gap-2">
            <ShieldCheck size={10} /> Mode Admin Aktif • Berbasis Cloud
          </p>
        </div>
      )}

      {/* Workspace Area - Distinct Background */}
      <main className="flex-1 overflow-hidden workspace-grid">
        <div className="max-w-[1600px] mx-auto h-full">
            {viewMode === 'TREE' ? (
                <FamilyTree 
                    initialPeople={familyData.people}
                    initialFamilies={familyData.families}
                    initialChildren={familyData.children}
                    isAdmin={isAdmin}
                    onEdit={handleOpenDetail}
                    onAddSpouse={async (id) => {
                        setEditPerson(null);
                        setPreselectedPartnerId(id);
                        setIsFormOpen(true);
                    }}
                    onAddChild={async (personId) => {
                        setEditPerson(null);
                        setPreselectedParentId(personId);
                        setIsFormOpen(true);
                    }}
                    onRefresh={refreshData}
                />
            ) : (
                <div className="animate-in fade-in duration-700">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Peta Keluarga</h2>
                        <p className="text-zinc-500 font-medium mt-1">Melihat sebaran lokasi tempat tinggal anggota keluarga besar.</p>
                    </div>
                    <FamilyMap people={familyData.people} />
                </div>
            )}
        </div>
      </main>

      <AnimatePresence>
        {isFormOpen && (
          <PersonForm 
            onClose={handleCloseForm} 
            existingPeople={familyData.people} 
            editPerson={editPerson}
            preselectedParentId={preselectedParentId || undefined}
            preselectedPartnerId={preselectedPartnerId || undefined}
            onSave={async (data) => {
              const result = editPerson ? await updatePerson(editPerson.id, data) : await addPerson(data);
              if (result.success) await refreshData();
              return result;
            }}
          />
        )}
        {selectedPerson && (
          <PersonDetailModal 
            person={selectedPerson} 
            onClose={() => setSelectedPerson(null)}
            isAdmin={isAdmin}
            onEdit={handleOpenEdit}
            onRefresh={refreshData}
            onAddSpouse={(id) => {
                setSelectedPerson(null);
                setEditPerson(null);
                setPreselectedPartnerId(id);
                setIsFormOpen(true);
            }}
            onAddChild={(id) => {
                setSelectedPerson(null);
                setEditPerson(null);
                setPreselectedParentId(id);
                setIsFormOpen(true);
            }}
          />
        )}
        {isWhitelistOpen && <WhitelistManager onClose={() => setIsWhitelistOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

import { cn } from '@/lib/utils';

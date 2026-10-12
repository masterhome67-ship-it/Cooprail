'use client';

import React from 'react';
import { Search, Plus, UploadCloud, Command, LogOut, Globe } from 'lucide-react';
import { Language, translations } from '@/lib/translations';

interface HeaderProps {
  lang: Language;
  onToggleLang: (lang: Language) => void;
  onLogout: () => void;
  onOpenCommandPalette: () => void;
  onNewRFQ: () => void;
  onOpenSimulator: () => void;
  onOpenUploadDoc: () => void;
}

export function Header({
  lang,
  onToggleLang,
  onLogout,
  onOpenCommandPalette,
  onNewRFQ,
  onOpenSimulator,
  onOpenUploadDoc,
}: HeaderProps) {
  const t = translations[lang];

  return (
    <header className="h-14 border-b border-[#1c2636] bg-[#0c1017]/90 backdrop-blur-sm px-6 flex items-center justify-between shrink-0 select-none">
      {/* Busca Global (Cmd+K) */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded bg-[#131b26] hover:bg-[#182332] border border-[#223043] text-slate-400 text-xs transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-300" />
            <span className="text-slate-400 group-hover:text-slate-300">
              {t.searchPlaceholder}
            </span>
          </div>
          <div className="flex items-center gap-0.5 bg-[#1b2638] px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-mono">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Ações do Topo */}
      <div className="flex items-center gap-2.5">
        {/* Toggle Idioma PT / EN */}
        <div className="flex items-center bg-[#101722] border border-[#1e2a3c] p-0.5 rounded-lg text-xs font-mono mr-1">
          <button
            onClick={() => onToggleLang('pt')}
            className={`px-2 py-1 rounded transition-all cursor-pointer ${
              lang === 'pt'
                ? 'bg-[#0284c7] text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Português"
          >
            PT
          </button>
          <button
            onClick={() => onToggleLang('en')}
            className={`px-2 py-1 rounded transition-all cursor-pointer ${
              lang === 'en'
                ? 'bg-[#0284c7] text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="English"
          >
            EN
          </button>
        </div>

        <button
          onClick={onOpenUploadDoc}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#132338] hover:bg-[#1a2f4a] border border-[#1e3c5e] text-[#38bdf8] text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          title={lang === 'pt' ? 'Importar proposta comercial em PDF ou planilha' : 'Import commercial proposal PDF or spreadsheet'}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>{t.btnImportPDF}</span>
        </button>

        <button
          onClick={onNewRFQ}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.btnNewRFQ}</span>
        </button>

        <button
          onClick={onLogout}
          className="p-1.5 rounded hover:bg-[#182332] text-slate-400 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
          title={t.signOut}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

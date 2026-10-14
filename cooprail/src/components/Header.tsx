'use client';

import React from 'react';
import { Search, Plus, UploadCloud, Command, LogOut } from 'lucide-react';
import { Language, translations } from '@/lib/translations';

interface HeaderProps {
  lang: Language;
  onToggleLang: (lang: Language) => void;
  onLogout: () => void;
  onOpenCommandPalette: () => void;
  onNewRFQ: () => void;
  onOpenUploadDoc: () => void;
}

export function Header({
  lang,
  onToggleLang,
  onLogout,
  onOpenCommandPalette,
  onNewRFQ,
  onOpenUploadDoc,
}: HeaderProps) {
  const t = translations[lang];

  return (
    <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-6 flex items-center justify-between shrink-0 select-none">
      {/* Busca Global (Cmd+K) */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 text-xs transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
            <span className="text-slate-500 group-hover:text-slate-700 font-medium">
              {t.searchPlaceholder}
            </span>
          </div>
          <div className="flex items-center gap-0.5 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] text-slate-500 font-mono shadow-xs">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Ações do Topo */}
      <div className="flex items-center gap-2.5">
        {/* Toggle Idioma PT / EN */}
        <div className="flex items-center bg-slate-100 border border-slate-200 p-0.5 rounded-lg text-xs font-mono mr-1">
          <button
            onClick={() => onToggleLang('pt')}
            className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${
              lang === 'pt'
                ? 'bg-white text-[#0284c7] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Português"
          >
            PT
          </button>
          <button
            onClick={() => onToggleLang('en')}
            className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${
              lang === 'en'
                ? 'bg-white text-[#0284c7] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="English"
          >
            EN
          </button>
        </div>


        <button
          onClick={onOpenUploadDoc}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          title={lang === 'pt' ? 'Importar proposta comercial em PDF ou planilha' : 'Import commercial proposal PDF or spreadsheet'}
        >
          <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
          <span>{t.btnImportPDF}</span>
        </button>

        <button
          onClick={onNewRFQ}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.btnNewRFQ}</span>
        </button>

        <button
          onClick={onLogout}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
          title={t.signOut}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Search, FileText, Scale, Building2, X } from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  onSelectAction,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const items = [
    { id: 'rfq-1', label: 'RFQ-2026-001 • Vigas de Aço ASTM A572', type: 'RFQ', icon: FileText, action: 'open_rfq' },
    { id: 'compare', label: 'Comparar Cotações de Vigas (2 propostas)', type: 'Ação', icon: Scale, action: 'open_comparator' },
    { id: 'sup-1', label: 'Metalúrgica Ferro & Aço Ltda (Rating 4.8)', type: 'Fornecedor', icon: Building2, action: 'open_supplier' },
    { id: 'sup-2', label: 'Trilhos Brasil Componentes (Rating 4.5)', type: 'Fornecedor', icon: Building2, action: 'open_supplier' },
  ];

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
        {/* Barra de Busca */}
        <div className="p-3 border-b border-slate-100 flex items-center gap-2.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite para buscar..."
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lista de Resultados */}
        <div className="max-h-64 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <p className="p-4 text-center text-xs text-slate-400">Nenhum resultado encontrado.</p>
          ) : (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectAction(item.action);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-left text-xs transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284c7]" />
                    <span className="text-slate-700 group-hover:text-slate-900 font-medium">{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                    {item.type}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-[#0e141f] border border-[#223043] rounded-lg shadow-2xl overflow-hidden">
        {/* Barra de Busca */}
        <div className="p-3 border-b border-[#1c2636] flex items-center gap-2.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite para buscar..."
            className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-slate-400"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
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
                  className="w-full flex items-center justify-between p-2 rounded hover:bg-[#16202e] text-left text-xs transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#38bdf8]" />
                    <span className="text-slate-200 group-hover:text-white">{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-[#121924] px-1.5 py-0.5 rounded">
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

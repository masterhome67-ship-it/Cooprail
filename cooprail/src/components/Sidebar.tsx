'use client';

import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Scale,
  ShoppingBag,
  Building2,
  ChevronDown,
  Layers,
  MapPin,
  LogOut,
} from 'lucide-react';
import { Organization, UserProfile } from '@/lib/mockData';
import { Language, translations } from '@/lib/translations';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  organization: Organization;
  user: UserProfile;
  pendingTasksCount: number;
  lang: Language;
  onLogout: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  organization,
  user,
  pendingTasksCount,
  lang,
  onLogout,
}: SidebarProps) {
  const t = translations[lang];

  const menuItems = [
    {
      id: 'dashboard',
      label: lang === 'pt' ? 'Início & Agentes' : 'Hub & Agents',
      icon: LayoutDashboard,
      badge: pendingTasksCount,
    },
    { id: 'rfqs', label: t.menuRFQs, icon: FileText },
    { id: 'comparator', label: t.menuComparator, icon: Scale },
    { id: 'orders', label: t.menuOrders, icon: ShoppingBag },
    { id: 'sectors', label: t.menuSectors, icon: MapPin },
    { id: 'suppliers', label: t.menuSuppliers, icon: Building2 },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 select-none">
      {/* Topo: Logo & Seletor de Organização */}
      <div>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5 mb-3">
            <img src="/cooprail-logo.png" alt="COOPRAIL" className="h-6 w-auto object-contain" />
            <span className="text-[10px] bg-sky-50 text-[#0284c7] border border-sky-200 font-bold px-1.5 py-0.5 rounded ml-auto">
              ENTERPRISE
            </span>
          </div>

          {/* Context Switcher */}
          <button className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-left text-xs cursor-pointer">
            <div className="flex items-center gap-2 truncate">
              <Layers className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
              <div className="truncate">
                <p className="text-slate-800 font-semibold truncate">{organization.name}</p>
                <p className="text-[10px] text-slate-500">
                  {lang === 'pt' ? 'Plano Enterprise' : 'Enterprise Plan'}
                </p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Navegação Principal */}
        <nav className="p-3 space-y-1">
          <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {lang === 'pt' ? 'Módulos de Compras' : 'Procurement Modules'}
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-50 text-[#0284c7] border-l-3 border-[#0284c7] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0284c7]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-[#d97706] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Rodapé: Perfil do Usuário e Logout */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-slate-700">
              {user.full_name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-bold text-slate-800 truncate">{user.full_name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.role || user.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title={t.signOut}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

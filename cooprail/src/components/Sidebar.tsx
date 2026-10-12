'use client';

import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Scale,
  ShoppingBag,
  Building2,
  Settings,
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
    { id: 'dashboard', label: t.menuDashboard, icon: LayoutDashboard, badge: pendingTasksCount },
    { id: 'rfqs', label: t.menuRFQs, icon: FileText },
    { id: 'comparator', label: t.menuComparator, icon: Scale },
    { id: 'orders', label: t.menuOrders, icon: ShoppingBag },
    { id: 'sectors', label: t.menuSectors, icon: MapPin },
    { id: 'suppliers', label: t.menuSuppliers, icon: Building2 },
    { id: 'settings', label: t.menuSettings, icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-[#1c2636] bg-[#0c1017] flex flex-col justify-between shrink-0 select-none">
      {/* Topo: Logo & Seletor de Organização */}
      <div>
        <div className="p-4 border-b border-[#1c2636]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded bg-[#0284c7] flex items-center justify-center font-bold text-white text-sm tracking-wider">
              CR
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">COOPRAIL</span>
            <span className="text-[10px] bg-[#1a2536] text-[#7dd3fc] font-medium px-1.5 py-0.5 rounded ml-auto">
              PRO
            </span>
          </div>

          {/* Context Switcher */}
          <button className="w-full flex items-center justify-between p-2 rounded bg-[#131b26] hover:bg-[#182332] border border-[#223043] transition-colors text-left text-xs">
            <div className="flex items-center gap-2 truncate">
              <Layers className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
              <div className="truncate">
                <p className="text-slate-200 font-medium truncate">{organization.name}</p>
                <p className="text-[10px] text-slate-400">
                  {lang === 'pt' ? 'Plano Enterprise' : 'Enterprise Plan'}
                </p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Navegação Principal */}
        <nav className="p-3 space-y-1">
          <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {lang === 'pt' ? 'Módulos de Compras' : 'Procurement Modules'}
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#182435] text-white border-l-2 border-[#0284c7] font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121924]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#38bdf8]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-[#d97706] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Rodapé: Perfil do Usuário e Logout */}
      <div className="p-3 border-t border-[#1c2636] space-y-2">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#131b26] transition-colors">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-[#1e293b] border border-[#334155] overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-slate-300">
              {user.full_name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-medium text-slate-200 truncate">{user.full_name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.role || user.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-[#1f2937] transition-colors cursor-pointer"
            title={t.signOut}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  Building2,
  Mail,
  Shield,
  Briefcase,
  Trash2,
  CheckCircle2,
  KeyRound,
  DollarSign,
  Plus,
  X,
  Search,
  Filter,
} from 'lucide-react';
import { Sector } from '@/lib/mockData';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  registration_id: string;
  department: string;
  role: 'buyer' | 'requester' | 'approver';
  role_title: string;
  approval_limit_brl: number;
  is_active: boolean;
  created_at: string;
}

const STORAGE_KEY_TEAM = 'cooprail_team_members_v2';
const ACTIVE_BUYER_KEY = 'cooprail_active_buyer_id_v2';

export function getSavedTeamMembers(): TeamMember[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEAM);
    if (!raw) {
      const initial: TeamMember[] = [
        {
          id: 'tm-1',
          name: 'Juliano Brustolin',
          email: 'juliano@cooprail.com.br',
          registration_id: 'MAT-001',
          department: 'Diretoria de Suprimentos & Engenharia',
          role: 'approver',
          role_title: 'Diretor de Suprimentos',
          approval_limit_brl: 500000,
          is_active: true,
          created_at: '2026-01-15',
        },
        {
          id: 'tm-2',
          name: 'Carlos Eduardo Ramos',
          email: 'carlos.compras@cooprail.com.br',
          registration_id: 'MAT-042',
          department: 'Setor Central de Compras',
          role: 'buyer',
          role_title: 'Comprador Técnico Sênior',
          approval_limit_brl: 150000,
          is_active: true,
          created_at: '2026-02-10',
        },
        {
          id: 'tm-3',
          name: 'Eng. Marcelo Silveira',
          email: 'marcelo.obras@cooprail.com.br',
          registration_id: 'MAT-088',
          department: 'Frente de Obras & Via Permanente',
          role: 'requester',
          role_title: 'Engenheiro Residente de Canteiro',
          approval_limit_brl: 30000,
          is_active: true,
          created_at: '2026-03-01',
        },
        {
          id: 'tm-4',
          name: 'Renata Albuquerque',
          email: 'renata.manutencao@cooprail.com.br',
          registration_id: 'MAT-105',
          department: 'Manutenção Elétrica & Automação',
          role: 'requester',
          role_title: 'Supervisora de Manutenção',
          approval_limit_brl: 25000,
          is_active: true,
          created_at: '2026-04-12',
        },
      ];
      localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTeamMembers(members: TeamMember[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(members));
  }
}

interface TeamBuyersViewProps {
  sectors: Sector[];
  activeBuyerId?: string;
  onSelectActiveBuyer?: (member: TeamMember) => void;
  showToast?: (msg: string) => void;
}

export function TeamBuyersView({
  sectors,
  activeBuyerId,
  onSelectActiveBuyer,
  showToast,
}: TeamBuyersViewProps) {
  const [members, setMembers] = useState<TeamMember[]>(() => {
    if (typeof window === 'undefined') return [];
    return getSavedTeamMembers();
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentActiveId, setCurrentActiveId] = useState<string>(() => {
    if (activeBuyerId) return activeBuyerId;
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(ACTIVE_BUYER_KEY) || (getSavedTeamMembers()[0]?.id || '');
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'buyer' | 'requester' | 'approver'>('all');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<'buyer' | 'requester' | 'approver'>('buyer');
  const [roleTitle, setRoleTitle] = useState('');
  const [approvalLimit, setApprovalLimit] = useState('50000');


  const handleSetActive = (member: TeamMember) => {
    setCurrentActiveId(member.id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_BUYER_KEY, member.id);
    }
    if (onSelectActiveBuyer) {
      onSelectActiveBuyer(member);
    }
    if (showToast) {
      showToast(`Autenticado com sucesso como: ${member.name} (${member.role_title})`);
    }
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Preencha ao menos o Nome e o E-mail.');
      return;
    }

    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      registration_id: registrationId.trim() || `MAT-${Math.floor(100 + Math.random() * 900)}`,
      department: department.trim() || 'Setor de Compras',
      role,
      role_title:
        roleTitle.trim() ||
        (role === 'buyer'
          ? 'Comprador Corporativo'
          : role === 'approver'
          ? 'Gestor Aprovador'
          : 'Solicitante de Setor'),
      approval_limit_brl: parseFloat(approvalLimit) || 50000,
      is_active: true,
      created_at: new Date().toISOString().split('T')[0],
    };

    const updated = [newMember, ...members];
    setMembers(updated);
    saveTeamMembers(updated);

    // Limpa campos
    setName('');
    setEmail('');
    setRegistrationId('');
    setDepartment('');
    setRoleTitle('');
    setApprovalLimit('50000');
    setIsModalOpen(false);

    if (showToast) {
      showToast(`Usuário ${newMember.name} cadastrado com sucesso!`);
    }
  };

  const handleDeleteMember = (id: string, memberName: string) => {
    if (window.confirm(`Deseja realmente remover o usuário "${memberName}"?`)) {
      const updated = members.filter((m) => m.id !== id);
      setMembers(updated);
      saveTeamMembers(updated);
      if (currentActiveId === id && updated.length > 0) {
        handleSetActive(updated[0]);
      }
      if (showToast) {
        showToast(`Usuário "${memberName}" removido.`);
      }
    }
  };

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q) ||
      m.role_title.toLowerCase().includes(q) ||
      m.registration_id.toLowerCase().includes(q);

    const matchesFilter = filterRole === 'all' || m.role === filterRole;
    return matchesQuery && matchesFilter;
  });

  const activeMember = members.find((m) => m.id === currentActiveId) || members[0];

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Visão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0284c7]" />
            Autenticador de Compradores & Equipe de Setores
          </h1>
          <p className="text-xs text-slate-500">
            Cadastre os compradores responsáveis pelas cotações e os solicitantes das frentes de obra e setores operacionais.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Cadastrar Comprador / Usuário</span>
        </button>
      </div>

      {/* Banner de Sessão Ativa */}
      {activeMember && (
        <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0284c7] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {activeMember.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{activeMember.name}</span>
                <span className="text-[10px] font-mono font-bold text-[#0284c7] bg-white border border-sky-200 px-1.5 py-0.2 rounded">
                  {activeMember.registration_id}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full">
                  Sessão Ativa no Sistema
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {activeMember.role_title} • <strong>{activeMember.department}</strong> • Limite de Alçada:{' '}
                <strong>
                  {activeMember.approval_limit_brl.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </strong>
              </p>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium sm:text-right">
            Todas as cotações, RFQs e ordens de compra serão assinadas por este usuário.
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, setor ou matrícula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(
            [
              { id: 'all', label: 'Todos' },
              { id: 'buyer', label: 'Compradores' },
              { id: 'requester', label: 'Solicitantes de Setor' },
              { id: 'approver', label: 'Gestores / Aprovadores' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id)}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterRole === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Membros da Equipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredMembers.map((member) => {
          const isCurrentActive = member.id === currentActiveId;

          return (
            <div
              key={member.id}
              className={`p-4 rounded-xl border transition-all bg-white flex flex-col justify-between space-y-3 shadow-xs ${
                isCurrentActive
                  ? 'border-[#0284c7] ring-2 ring-[#0284c7]/15'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        member.role === 'buyer'
                          ? 'bg-sky-100 text-[#0284c7]'
                          : member.role === 'approver'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{member.name}</h3>
                      <p className="text-[11px] text-slate-500">{member.role_title}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      member.role === 'buyer'
                        ? 'bg-sky-50 text-[#0284c7] border border-sky-200'
                        : member.role === 'approver'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {member.role === 'buyer'
                      ? 'Comprador'
                      : member.role === 'approver'
                      ? 'Aprovador'
                      : 'Solicitante'}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{member.department}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>
                      Matrícula: <strong className="font-mono text-slate-700">{member.registration_id}</strong>
                    </span>
                    <span>
                      Alçada:{' '}
                      <strong className="text-slate-800">
                        {member.approval_limit_brl.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          maximumFractionDigits: 0,
                        })}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações do Card */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                {isCurrentActive ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sessão Ativa</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetActive(member)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284c7] hover:text-[#0369a1] text-xs font-semibold border border-sky-200 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Autenticar como este Usuário</span>
                  </button>
                )}

                <button
                  onClick={() => handleDeleteMember(member.id, member.name)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remover usuário"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Cadastro de Novo Membro / Comprador */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col text-slate-800">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0284c7] flex items-center justify-center text-white shadow-xs">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Cadastrar Comprador ou Solicitante de Setor
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Insira os dados corporativos e defina as alçadas de compras
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roberto Mendes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nome@cooprail.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Matrícula / ID
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: MAT-114"
                    value={registrationId}
                    onChange={(e) => setRegistrationId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Setor / Departamento *
                  </label>
                  <input
                    type="text"
                    required
                    list="sectors-list"
                    placeholder="Ex: Frente de Obras / Suprimentos"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7]"
                  />
                  <datalist id="sectors-list">
                    <option value="Setor Central de Compras" />
                    <option value="Diretoria de Suprimentos" />
                    <option value="Almoxarifado Central" />
                    <option value="Manutenção Mecânica & Via" />
                    <option value="Engenharia de Infraestrutura" />
                    {sectors.map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Perfil de Atuação *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'buyer' | 'requester' | 'approver')}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7]"
                  >
                    <option value="buyer">Comprador (Negocia e Emite Pedidos)</option>
                    <option value="requester">Solicitante (Abre RFQs no Canteiro)</option>
                    <option value="approver">Gestor / Aprovador Orçamentário</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cargo / Função Exata
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Comprador Pleno"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Limite de Alçada de Compra (R$)
                  </label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={approvalLimit}
                    onChange={(e) => setApprovalLimit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Sector } from '@/lib/mockData';
import {
  Layers,
  Plus,
  MapPin,
  UserCheck,
  Building2,
  FileCheck2,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  Send,
  X,
  FileText,
  AlertTriangle
} from 'lucide-react';

export interface OperationalTicketData {
  sector_id: string;
  sector_name: string;
  item_description: string;
  quantity: string;
  urgency: 'normal' | 'alta' | 'emergencial';
  justification: string;
  suggested_contractor?: string;
}

interface SectorsViewProps {
  sectors: Sector[];
  onAddSector: (newSector: Sector) => void;
  onCreateTicket?: (ticket: OperationalTicketData) => void;
}

export function SectorsView({
  sectors,
  onAddSector,
  onCreateTicket,
}: SectorsViewProps) {
  const [isNewSectorModalOpen, setIsNewSectorModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Estados do formulário de novo setor
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [managerName, setManagerName] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const [description, setDescription] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [contractCode, setContractCode] = useState('');
  const [contractScope, setContractScope] = useState('');

  // Estados do modal de abertura de chamado
  const [ticketSector, setTicketSector] = useState<Sector | null>(null);
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketQuantity, setTicketQuantity] = useState('');
  const [ticketUrgency, setTicketUrgency] = useState<'normal' | 'alta' | 'emergencial'>('normal');
  const [ticketJustification, setTicketJustification] = useState('');
  const [suggestedContractor, setSuggestedContractor] = useState('');

  const handleOpenTicketModal = (sec: Sector, contractor?: string) => {
    setTicketSector(sec);
    setSuggestedContractor(contractor || '');
    setTicketDescription('');
    setTicketQuantity('');
    setTicketJustification('');
    setTicketUrgency('normal');
    setIsTicketModalOpen(true);
  };

  const handleSaveSector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const newSec: Sector = {
      id: `sec-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      location: location.trim() || 'Trecho Operacional',
      manager_name: managerName.trim() || 'Gestor de Suprimentos',
      cost_center: costCenter.trim().toUpperCase() || 'CC-GERAL',
      description: description.trim() || 'Setor operacional cadastrado.',
      active_contractors: contractorName.trim()
        ? [
            {
              supplier_name: contractorName.trim(),
              contract_code: contractCode.trim().toUpperCase() || `CTR-${Date.now()}`,
              scope: contractScope.trim() || 'Prestação contínua de serviços operacionais',
              since_date: 'Hoje',
              can_provide_parts: true,
            },
          ]
        : [],
    };

    onAddSector(newSec);
    setIsNewSectorModalOpen(false);
    setName('');
    setCode('');
    setLocation('');
    setManagerName('');
    setCostCenter('');
    setDescription('');
    setContractorName('');
    setContractCode('');
    setContractScope('');
  };

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSector || !ticketDescription.trim()) return;

    if (onCreateTicket) {
      onCreateTicket({
        sector_id: ticketSector.id,
        sector_name: ticketSector.name,
        item_description: ticketDescription.trim(),
        quantity: ticketQuantity.trim() || '1 lote',
        urgency: ticketUrgency,
        justification: ticketJustification.trim(),
        suggested_contractor: suggestedContractor || undefined,
      });
    }

    setIsTicketModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Topo com Aviso de Governança */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white">
              Setores Operacionais & Frentes de Obra
            </h1>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#102438] text-[#38bdf8] border border-[#173e63]">
              Compras Centralizadas
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Os setores operacionais abrem chamados de necessidade de peças ou serviços. A negociação e contratação são centralizadas no Setor de Compras.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsNewSectorModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141e2b] hover:bg-[#1a2738] border border-[#23354a] text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Setor / Obra</span>
          </button>
        </div>
      </div>

      {/* Banner de Governança Institucional */}
      <div className="p-3.5 rounded-lg bg-[#0e1724] border border-[#1b2b40] flex items-start gap-3 text-xs text-slate-300">
        <Lock className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-white">
            Segregação de Funções & Governança de Suprimentos
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            As frentes de trabalho e oficinas registram a demanda técnica através de chamados internos. O setor de suprimentos analisa a necessidade, verifica se há prestadores já mobilizados no local para atendimento imediato sem frete extra, ou dispara cotação pública (RFQ).
          </p>
        </div>
      </div>

      {/* Grid de Setores */}
      <div className="grid grid-cols-1 gap-4">
        {sectors.map((sec) => (
          <div
            key={sec.id}
            className="p-5 rounded-xl border border-[#1d293b] bg-[#0f1521] space-y-4 hover:border-[#273852] transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold text-[#38bdf8] bg-[#0c1a2b] px-2 py-0.5 rounded border border-[#143250]">
                    {sec.code}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-[#141b27] px-2 py-0.5 rounded">
                    Centro de Custo: {sec.cost_center}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{sec.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{sec.description}</p>
              </div>

              <div className="flex flex-col md:items-end gap-2 shrink-0">
                <div className="text-left md:text-right text-xs text-slate-400 space-y-1">
                  <p className="flex items-center md:justify-end gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span className="text-slate-200">{sec.location}</span>
                  </p>
                  <p className="flex items-center md:justify-end gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Eng. Responsável: {sec.manager_name}</span>
                  </p>
                </div>

                <button
                  onClick={() => handleOpenTicketModal(sec)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Abrir Chamado para Compras</span>
                </button>
              </div>
            </div>

            {/* Empresas Já Prestando Serviço no Setor */}
            <div className="pt-3 border-t border-[#182333] space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Empresas & Contratos Vigentes no Setor (Mobilização Ativa)
              </span>

              {sec.active_contractors.length === 0 ? (
                <div className="p-3 rounded bg-[#0b1018] border border-[#17212e] text-xs text-slate-500">
                  Nenhum prestador de serviço vinculado no momento.
                </div>
              ) : (
                <div className="space-y-2">
                  {sec.active_contractors.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-[#0e1817] border border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            {c.supplier_name}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                            {c.contract_code}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-300/80">
                          Escopo Vigente: {c.scope} • Ativo desde: {c.since_date}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/80 flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-emerald-400" /> Canteiro Ativo (Zero Mobilização)
                        </span>

                        <button
                          onClick={() => handleOpenTicketModal(sec, c.supplier_name)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#132838] hover:bg-[#1a384e] border border-[#1e486b] text-[#38bdf8] text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Requisitar via Empresa In-Loco</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Abertura de Chamado Operacional para o Setor de Compras */}
      {isTicketModalOpen && ticketSector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b1018] border border-[#1e2a3c] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col text-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b2636] bg-[#0e141f]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#38bdf8]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Abrir Chamado Operacional de Suprimentos
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Encaminhado para triagem, homologação e verificação do Setor de Compras
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendTicket} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-[#0f1724] border border-[#1e2e42] space-y-1">
                <p className="text-[11px] font-semibold text-white">
                  Setor Requisitante: {ticketSector.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  Código: <span className="font-mono text-slate-300">{ticketSector.code}</span> • Centro de Custo: <span className="font-mono text-slate-300">{ticketSector.cost_center}</span>
                </p>
              </div>

              {suggestedContractor && (
                <div className="p-3 rounded-lg bg-[#0e1d1a] border border-emerald-700/60 flex items-center gap-2 text-[11px] text-emerald-300">
                  <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Indicação sugerida: <strong>{suggestedContractor}</strong> (Empresa já ativa no canteiro). O setor de compras verificará a viabilidade de aditivo ou ordem direta.
                  </span>
                </div>
              )}

              <div>
                <label className="text-slate-300 block mb-1 font-medium">
                  Descrição da Demanda / Material ou Serviço Necessário *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Necessário 50 metros de trilhos TR-57 e 120 grampos elásticos para manutenção corretiva no KM 184."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="w-full bg-[#0c121b] border border-[#1e2c3f] rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#0284c7] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Quantidade Estimada</label>
                  <input
                    type="text"
                    placeholder="Ex: 50 metros / 120 unidades"
                    value={ticketQuantity}
                    onChange={(e) => setTicketQuantity(e.target.value)}
                    className="w-full bg-[#0c121b] border border-[#1e2c3f] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Grau de Urgência</label>
                  <select
                    value={ticketUrgency}
                    onChange={(e) => setTicketUrgency(e.target.value as any)}
                    className="w-full bg-[#0c121b] border border-[#1e2c3f] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#0284c7]"
                  >
                    <option value="normal">Normal (Planejado)</option>
                    <option value="alta">Alta (Risco Operacional)</option>
                    <option value="emergencial">Emergencial (Paralisação de Via)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Justificativa da Frente de Obra</label>
                <input
                  type="text"
                  placeholder="Ex: Substituição de trilhos desgastados para liberação de trem de carga."
                  value={ticketJustification}
                  onChange={(e) => setTicketJustification(e.target.value)}
                  className="w-full bg-[#0c121b] border border-[#1e2c3f] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#172232]">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#141d2b] text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Chamado p/ Compras</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cadastro de Novo Setor */}
      {isNewSectorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b1018] border border-[#1e2a3c] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col text-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b2636] bg-[#0e141f]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#38bdf8]">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  Cadastrar Novo Setor Operacional / Obra
                </h3>
              </div>
              <button
                onClick={() => setIsNewSectorModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSector} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Nome do Setor / Frente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Planta Industrial Oeste - Unidade de Beneficiamento"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0c121b] border border-[#1e2c3f] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Código do Setor</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: SEC-IND-02"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-[#0c121b] border border-[#1e2c3f] rounded-lg p-2.5 text-white uppercase focus:outline-none focus:border-[#0284c7]"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Centro de Custo</label>
                  <input
                    type="text"
                    placeholder="Ex: CC-4200"
                    value={costCenter}
                    onChange={(e) => setCostCenter(e.target.value)}
                    className="w-full bg-[#0c121b] border border-[#1e2c3f] rounded-lg p-2.5 text-white uppercase focus:outline-none focus:border-[#0284c7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Localização / Trecho</label>
                  <input
                    type="text"
                    placeholder="Ex: Complexo Industrial & Hub Intermodal Ocidental"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#0c121b] border border-[#1e2c3f] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#0284c7]"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Engenheiro / Gestor Responsável</label>
                  <input
                    type="text"
                    placeholder="Ex: Eng. André Freitas"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full bg-[#0c121b] border border-[#1e2c3f] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#0284c7]"
                  />
                </div>
              </div>

              {/* Empresa Já Prestadora no Setor */}
              <div className="p-3.5 rounded-lg bg-[#0e1724] border border-[#1b2b40] space-y-3">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Empresa Já Prestando Serviço no Local (Opcional)</span>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">Nome da Empresa Mobilizada</label>
                  <input
                    type="text"
                    placeholder="Ex: Metalúrgica Ferro & Aço Nacional S.A."
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                    className="w-full bg-[#0b1018] border border-[#1d2c40] rounded p-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1 text-[11px]">Nº do Contrato Vigente</label>
                    <input
                      type="text"
                      placeholder="Ex: CTR-2026-CSC-04"
                      value={contractCode}
                      onChange={(e) => setContractCode(e.target.value)}
                      className="w-full bg-[#0b1018] border border-[#1d2c40] rounded p-2 text-white uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 text-[11px]">Escopo dos Serviços</label>
                    <input
                      type="text"
                      placeholder="Ex: Solda de trilhos e manutenção"
                      value={contractScope}
                      onChange={(e) => setContractScope(e.target.value)}
                      className="w-full bg-[#0b1018] border border-[#1d2c40] rounded p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewSectorModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#141d2b] text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold"
                >
                  Salvar Setor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

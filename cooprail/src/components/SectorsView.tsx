'use client';

import React, { useState, useRef } from 'react';
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
  AlertTriangle,
  Image as ImageIcon,
  Trash2,
  UploadCloud,
  Eye,
  Package,
} from 'lucide-react';

export interface TicketItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  spec?: string;
}

export interface OperationalTicketData {
  sector_id: string;
  sector_name: string;
  title: string;
  items: TicketItem[];
  item_description?: string;
  quantity?: string;
  urgency: 'normal' | 'alta' | 'emergencial';
  justification: string;
  suggested_contractor?: string;
  images?: { id: string; name: string; dataUrl: string }[];
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
  const [hasExistingContractor, setHasExistingContractor] = useState(false);
  const [contractorName, setContractorName] = useState('');
  const [contractCode, setContractCode] = useState('');
  const [contractScope, setContractScope] = useState('');

  // Estados do modal de abertura de chamado
  const [ticketSector, setTicketSector] = useState<Sector | null>(null);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketItems, setTicketItems] = useState<TicketItem[]>([
    { id: '1', name: '', quantity: '1', unit: 'unidades', spec: '' },
  ]);
  const [ticketUrgency, setTicketUrgency] = useState<'normal' | 'alta' | 'emergencial'>('normal');
  const [ticketJustification, setTicketJustification] = useState('');
  const [suggestedContractor, setSuggestedContractor] = useState('');
  const [attachedImages, setAttachedImages] = useState<{ id: string; name: string; dataUrl: string }[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenTicketModal = (sec: Sector, contractor?: string) => {
    setTicketSector(sec);
    setSuggestedContractor(contractor || '');
    setTicketTitle('');
    setTicketItems([{ id: '1', name: '', quantity: '1', unit: 'unidades', spec: '' }]);
    setTicketJustification('');
    setTicketUrgency('normal');
    setAttachedImages([]);
    setPreviewImage(null);
    setIsTicketModalOpen(true);
  };

  const handleAddTicketItem = () => {
    setTicketItems((prev) => [
      ...prev,
      {
        id: `it-${Date.now()}-${prev.length + 1}`,
        name: '',
        quantity: '1',
        unit: 'unidades',
        spec: '',
      },
    ]);
  };

  const handleRemoveTicketItem = (id: string) => {
    if (ticketItems.length <= 1) return;
    setTicketItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleTicketItemChange = (id: string, field: keyof TicketItem, value: string) => {
    setTicketItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setAttachedImages((prev) => [
            ...prev,
            {
              id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name: file.name,
              dataUrl: reader.result as string,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = (id: string) => {
    setAttachedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSaveSector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const newSec: Sector = {
      id: `sec-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      location: location.trim() || 'Unidade Operacional',
      manager_name: managerName.trim() || 'Gestor Responsável',
      cost_center: costCenter.trim().toUpperCase() || 'CC-GERAL',
      description: description.trim() || 'Setor operacional cadastrado.',
      active_contractors:
        hasExistingContractor && contractorName.trim()
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
    setHasExistingContractor(false);
    setContractorName('');
    setContractCode('');
    setContractScope('');
  };

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSector) return;

    const validItems = ticketItems.filter((i) => i.name.trim().length > 0);
    const primaryTitle = ticketTitle.trim() || validItems[0]?.name || 'Demanda Operacional';
    const itemsDescription =
      validItems
        .map((i) => `${i.quantity} ${i.unit} de ${i.name}${i.spec ? ` (${i.spec})` : ''}`)
        .join(', ') || 'Itens conforme chamado';

    if (onCreateTicket) {
      onCreateTicket({
        sector_id: ticketSector.id,
        sector_name: ticketSector.name,
        title: primaryTitle,
        item_description: itemsDescription,
        quantity: `${validItems.length} item(ns)`,
        items: validItems,
        urgency: ticketUrgency,
        justification: ticketJustification.trim(),
        suggested_contractor: suggestedContractor || undefined,
        images: attachedImages,
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
            <h1 className="text-base font-bold text-slate-900">
              Setores Operacionais & Frentes de Obra
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-[#0284c7] border border-sky-200">
              Compras Centralizadas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Os setores operacionais abrem chamados de necessidade de peças ou serviços. A negociação e contratação são centralizadas no Setor de Compras.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setName('');
              setCode('');
              setLocation('');
              setManagerName('');
              setCostCenter('');
              setDescription('');
              setHasExistingContractor(false);
              setContractorName('');
              setContractCode('');
              setContractScope('');
              setIsNewSectorModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Setor / Obra</span>
          </button>
        </div>
      </div>

      {/* Banner de Governança Institucional */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3 text-xs text-slate-600">
        <Lock className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 block font-semibold mb-0.5">
            Fluxo Integrado de Demandas Técnicas
          </strong>
          Os engenheiros e encarregados das frentes de obra especificam quantitativos, normas e fotos dos materiais necessários. A plataforma organiza a triagem para que a comissão de compras homologue fornecedores ou abra cotações oficiais.
        </div>
      </div>

      {/* Grid de Setores */}
      <div className="grid grid-cols-1 gap-4">
        {sectors.length === 0 && (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
            <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-[#0284c7] mx-auto border border-sky-100">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Nenhum Setor Operacional Cadastrado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Cadastre suas frentes de obra ou plantas industriais para habilitar a abertura de chamados técnicos de suprimentos diretamente pelas equipes de campo.
            </p>
            <button
              onClick={() => setIsNewSectorModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Primeiro Setor / Obra</span>
            </button>
          </div>
        )}

        {sectors.map((sec) => (
          <div
            key={sec.id}
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{sec.name}</h3>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-semibold border border-slate-200">
                    {sec.code}
                  </span>
                  <span className="text-[10px] font-mono text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded font-semibold border border-sky-200">
                    {sec.cost_center}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {sec.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-slate-400" />
                    Responsável: {sec.manager_name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenTicketModal(sec)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0284c7] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Abrir Chamado / Demanda</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{sec.description}</p>

            {/* Empresas Mobilizadas no Setor */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Empresas e Fornecedores com Contrato Vigente no Local:
                </span>
                <span className="text-[11px] text-slate-500">
                  {sec.active_contractors.length} empresa(s) vinculada(s)
                </span>
              </div>

              {sec.active_contractors.length === 0 ? (
                <div className="p-3 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Nenhum fornecedor alocado neste setor. As aquisições ocorrem via abertura de cotação (RFQ).</span>
                  <button
                    onClick={() => handleOpenTicketModal(sec)}
                    className="text-[#0284c7] font-semibold hover:underline cursor-pointer"
                  >
                    Requisitar materiais
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {sec.active_contractors.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-emerald-950">
                            {c.supplier_name}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300 font-semibold">
                            {c.contract_code}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          Escopo Vigente: {c.scope} • Ativo desde: {c.since_date}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" /> Canteiro Ativo (Zero Mobilização)
                        </span>

                        <button
                          onClick={() => handleOpenTicketModal(sec, c.supplier_name)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-[#0284c7] text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-800 my-8 max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Abrir Chamado Operacional de Suprimentos
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Encaminhado para triagem, homologação técnica e aquisição pelo Setor de Compras
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendTicket} className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
              {/* Identificação do Setor */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Setor Requisitante: {ticketSector.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Código: <span className="font-mono text-slate-700 font-semibold">{ticketSector.code}</span> • Centro de Custo: <span className="font-mono text-slate-700 font-semibold">{ticketSector.cost_center}</span>
                  </p>
                </div>
                <span className="text-[10px] bg-sky-50 text-[#0284c7] border border-sky-200 px-2 py-1 rounded-lg font-semibold shrink-0">
                  {ticketSector.location}
                </span>
              </div>

              {suggestedContractor && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-[11px] text-emerald-800">
                  <Zap className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-600" />
                  <span>
                    Indicação sugerida: <strong>{suggestedContractor}</strong> (Empresa já ativa no canteiro). O setor de compras verificará viabilidade de aditivo ou ordem direta.
                  </span>
                </div>
              )}

              {/* Título Geral do Chamado */}
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">
                  Título / Objeto Resumido do Chamado <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aquisição de tubulações, conexões e materiais para rede pluvial"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white text-xs font-medium"
                />
              </div>

              {/* Lista Dinâmica de Múltiplos Itens */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#0284c7]" />
                    Itens / Materiais / Serviços Requisitados ({ticketItems.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTicketItem}
                    className="inline-flex items-center gap-1 text-[11px] text-[#0284c7] hover:text-[#0369a1] font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Outro Item</span>
                  </button>
                </div>

                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {ticketItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">Item #{index + 1}</span>
                        {ticketItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTicketItem(item.id)}
                            className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remover este item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-6">
                          <input
                            type="text"
                            required
                            placeholder="Descrição do material ou serviço (ex: Tubo PEAD 1000mm)"
                            value={item.name}
                            onChange={(e) => handleTicketItemChange(item.id, 'name', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#0284c7]"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            required
                            placeholder="Qtd (ex: 50)"
                            value={item.quantity}
                            onChange={(e) => handleTicketItemChange(item.id, 'quantity', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#0284c7]"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <select
                            value={item.unit}
                            onChange={(e) => handleTicketItemChange(item.id, 'unit', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#0284c7]"
                          >
                            <option value="unidades">unidades</option>
                            <option value="metros">metros</option>
                            <option value="kg">kg</option>
                            <option value="peças">peças</option>
                            <option value="horas">horas</option>
                            <option value="litros">litros</option>
                            <option value="lote">lote</option>
                            <option value="m²">m²</option>
                            <option value="m³">m³</option>
                          </select>
                        </div>
                        <div className="sm:col-span-12">
                          <input
                            type="text"
                            placeholder="Especificação técnica / norma / modelo (opcional)"
                            value={item.spec || ''}
                            onChange={(e) => handleTicketItemChange(item.id, 'spec', e.target.value)}
                            className="w-full bg-slate-50/70 border border-slate-200 rounded-lg p-2 text-[11px] text-slate-700 focus:bg-white focus:outline-none focus:border-[#0284c7]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddTicketItem}
                    className="w-full py-2 border border-dashed border-sky-300 text-[#0284c7] hover:bg-sky-50/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Outro Item à Demanda</span>
                  </button>
                </div>
              </div>

              {/* Anexar Imagens / Fotos Técnicas do Canteiro */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#0284c7]" />
                    Fotos Técnicas / Croquis / Desenhos do Canteiro (Opcional)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {attachedImages.length} anexo(s)
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                  >
                    <UploadCloud className="w-4 h-4 text-[#0284c7]" />
                    <span>Anexar Imagens da Frente de Obra (PNG, JPG, WebP)</span>
                  </button>

                  {attachedImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {attachedImages.map((img) => (
                        <div
                          key={img.id}
                          className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-100 aspect-video flex items-center justify-center"
                        >
                          <img
                            src={img.dataUrl}
                            alt={img.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewImage(img.dataUrl)}
                              className="p-1 rounded-full bg-white/20 text-white hover:bg-white/40 cursor-pointer"
                              title="Ampliar"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img.id)}
                              className="p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                              title="Remover"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[9px] text-slate-200 px-1 py-0.5 truncate text-center">
                            {img.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Urgência & Justificativa (Sem travas de ferrovia/trilhos) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Grau de Urgência Operacional</label>
                  <select
                    value={ticketUrgency}
                    onChange={(e) => setTicketUrgency(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white text-xs font-medium"
                  >
                    <option value="normal">Normal (Planejado / Rotina Operacional)</option>
                    <option value="alta">Alta (Risco de Desabastecimento / Operacional)</option>
                    <option value="emergencial">Emergencial (Paralisação de Planta / Linha / Obra)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Justificativa da Frente de Obra</label>
                  <input
                    type="text"
                    placeholder="Ex: Intervenção técnica necessária para manutenção e continuidade das operações."
                    value={ticketJustification}
                    onChange={(e) => setTicketJustification(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold cursor-pointer shadow-md shadow-sky-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Encaminhar Chamado p/ Setor de Compras</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox para preview de foto do canteiro */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-slate-900 rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Modal: Cadastro de Novo Setor (Limpo, sem empreiteira mockada por padrão) */}
      {isNewSectorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col text-slate-800 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Cadastrar Novo Setor Operacional / Obra
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Estruturação de frente de trabalho para demandas e centros de custo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewSectorModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSector} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Nome do Setor / Frente de Obra <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Planta Industrial Cafelândia - Unidade de Drenagem"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Código do Setor <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: SEC-IND-01"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 uppercase focus:outline-none focus:border-[#0284c7] focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Centro de Custo</label>
                  <input
                    type="text"
                    placeholder="Ex: CC-4500"
                    value={costCenter}
                    onChange={(e) => setCostCenter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 uppercase focus:outline-none focus:border-[#0284c7] focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Localização / Trecho</label>
                  <input
                    type="text"
                    placeholder="Ex: Cafelândia - PR"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Engenheiro / Gestor Responsável</label>
                  <input
                    type="text"
                    placeholder="Ex: Eng. Responsável"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Descrição do Escopo Operacional</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Canteiro de obras e instalações industriais da unidade de Cafelândia."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white resize-none"
                />
              </div>

              {/* Empresa Já Prestadora no Setor (Opcional - inicia desmarcado para NÃO induzir dados mockados) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={hasExistingContractor}
                    onChange={(e) => {
                      setHasExistingContractor(e.target.checked);
                      if (!e.target.checked) {
                        setContractorName('');
                        setContractCode('');
                        setContractScope('');
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-[#0284c7] focus:ring-[#0284c7]"
                  />
                  <span>Vincular fornecedor ou empreiteira já mobilizada no local? (Opcional)</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Por padrão, novos setores não possuem empresas vinculadas. As contratações acontecem via abertura de cotação (RFQ).
                </p>

                {hasExistingContractor && (
                  <div className="pt-3 border-t border-slate-200 space-y-3 animate-in fade-in">
                    <div>
                      <label className="text-slate-600 block mb-1 text-[11px] font-medium">Nome da Empresa Mobilizada</label>
                      <input
                        type="text"
                        placeholder="Razão Social ou Nome Fantasia da prestadora"
                        value={contractorName}
                        onChange={(e) => setContractorName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-600 block mb-1 text-[11px] font-medium">Nº do Contrato Vigente</label>
                        <input
                          type="text"
                          placeholder="Número do contrato (se houver)"
                          value={contractCode}
                          onChange={(e) => setContractCode(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 text-[11px] font-medium">Escopo dos Serviços</label>
                        <input
                          type="text"
                          placeholder="Descrição sucinta das atividades contratadas"
                          value={contractScope}
                          onChange={(e) => setContractScope(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewSectorModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold cursor-pointer shadow-md shadow-sky-600/20"
                >
                  Salvar Setor Operacional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  Calendar,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Check,
  MapPin,
  Building2,
  Zap,
} from 'lucide-react';
import { RFQ, RFQItem, Quote, Sector } from '@/lib/mockData';
import { matchSuppliersForRFQ, Supplier } from '@/lib/suppliersData';

interface CreateRFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRFQ: (newRFQ: RFQ) => void;
  sectors?: Sector[];
}

export function CreateRFQModal({
  isOpen,
  onClose,
  onCreateRFQ,
  sectors = [],
}: CreateRFQModalProps) {
  const [title, setTitle] = useState('');
  const [scopeDescription, setScopeDescription] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('45000');
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('Em 15 dias');
  const [deadline, setDeadline] = useState('Em 5 dias');
  const [selectedSectorId, setSelectedSectorId] = useState<string>(sectors[0]?.id || '');
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  const [items, setItems] = useState<RFQItem[]>([
    {
      id: 'item-1',
      item_name: 'Tubos PEAD e Conexões de Drenagem Pluvial',
      specification: 'Tubos corrugados de alta densidade PEAD DN 400mm com juntas elásticas conforme NBR 8890.',
      quantity: 120,
      unit: 'metros',
      target_unit_price: 250.0,
    },
    {
      id: 'item-2',
      item_name: 'Caixas Coletoras e Grelhas Industriais',
      specification: 'Caixas de concreto armado pré-moldado com grelhas articuladas de ferro fundido nodular classe D400.',
      quantity: 15,
      unit: 'unidades',
      target_unit_price: 1000.0,
    },
  ]);

  // Fornecedores aptos calculados com base no escopo e itens
  const eligibleSuppliers = matchSuppliersForRFQ(
    `${title} ${scopeDescription}`,
    items.map((i) => i.item_name)
  );

  // Inicializa a seleção de fornecedores automaticamente com os mais aptos
  useEffect(() => {
    if (eligibleSuppliers.length > 0 && selectedSupplierIds.length === 0) {
      setSelectedSupplierIds(eligibleSuppliers.slice(0, 3).map((item) => item.supplier.id));
    }
  }, [eligibleSuppliers, selectedSupplierIds.length]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        item_name: '',
        specification: '',
        quantity: 1,
        unit: 'unidades',
        target_unit_price: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof RFQItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const toggleSupplier = (supId: string) => {
    setSelectedSupplierIds((prev) =>
      prev.includes(supId) ? prev.filter((id) => id !== supId) : [...prev, supId]
    );
  };

  // Modelos Rápidos de Demanda
  const handleApplyTemplate = (type: 'pluvial' | 'aco') => {
    if (type === 'pluvial') {
      setTitle('Aquisição de Tubulação e Drenagem Pluvial (Cascavel / Toledo)');
      setScopeDescription(
        'Fornecimento de tubos PEAD, canaletas e caixas coletoras para adequação da rede pluvial da ferrovia no corredor Oeste do Paraná. Necessário laudo de conformidade e entrega in-loco.'
      );
      setEstimatedBudget('45000');
      setItems([
        {
          id: 'item-1',
          item_name: 'Tubos PEAD DN 400mm Corrugados',
          specification: 'Tubos de polietileno de alta densidade conforme NBR 8890, barra 6m.',
          quantity: 120,
          unit: 'metros',
          target_unit_price: 250.0,
        },
        {
          id: 'item-2',
          item_name: 'Caixas de Drenagem e Grelhas D400',
          specification: 'Concreto armado pré-moldado com grelhas de ferro fundido para carga pesada.',
          quantity: 15,
          unit: 'unidades',
          target_unit_price: 1000.0,
        },
      ]);
    } else {
      setTitle('Fornecimento de Perfis de Aço e Solda Industrial (Canteiro Central)');
      setScopeDescription(
        'Fornecimento de vigas estruturais laminadas ASTM A572 Grau 50 e serviços de solda e fixação para reforço de via e passarelas industriais.'
      );
      setEstimatedBudget('62000');
      setItems([
        {
          id: 'item-1',
          item_name: 'Vigas Estruturais W200x26.6',
          specification: 'Aço ASTM A572 Grau 50 certificado com laudo de composição química.',
          quantity: 40,
          unit: 'peças',
          target_unit_price: 1200.0,
        },
        {
          id: 'item-2',
          item_name: 'Kits de Soldagem e Fixadores de Alta Tensão',
          specification: 'Parafusos A325 e eletrodos E7018 certificados para infraestrutura.',
          quantity: 50,
          unit: 'kits',
          target_unit_price: 280.0,
        },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scopeDescription.trim()) {
      alert('Preencha o título e o escopo da requisição.');
      return;
    }

    const calculatedTotal =
      parseFloat(estimatedBudget) ||
      items.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.target_unit_price) || 0), 0);

    const generatedCode = `RFQ-2026-${Math.floor(100 + Math.random() * 900)}`;
    const selectedSector = sectors.find((s) => s.id === selectedSectorId);

    // Identifica os fornecedores selecionados para cotar
    const suppliersToQuote = eligibleSuppliers.filter((s) =>
      selectedSupplierIds.includes(s.supplier.id)
    );

    // Gera as cotações retornadas dos fornecedores selecionados
    const generatedQuotes: Quote[] = suppliersToQuote.map((item, idx) => {
      const sup = item.supplier;
      let priceFactor = 1.0;
      let leadDays = sup.lead_time_avg_days;
      let score = sup.rating * 1.95;

      if (sup.is_mobilized_on_site) {
        priceFactor = 0.94; // 6% mais barato por já ter canteiro e equipe mobilizada no local (frete zero)
        leadDays = Math.max(3, Math.round(sup.lead_time_avg_days * 0.5));
        score = 9.8;
      } else if (idx === 0) {
        priceFactor = 0.96; // 4% de desconto regional
        leadDays = sup.lead_time_avg_days;
        score = 9.2;
      } else {
        priceFactor = 1.03; // Preço um pouco acima mas com prazo garantido
        leadDays = Math.round(sup.lead_time_avg_days * 0.8);
        score = 8.7;
      }

      const totalVal = Math.round(calculatedTotal * priceFactor);
      const savingsPct = Math.max(0, Math.round(((calculatedTotal - totalVal) / calculatedTotal) * 100));

      const summary = sup.is_mobilized_on_site
        ? `Fornecedor já atua com equipe no canteiro (${sup.location}). Zero custo de frete e atendimento imediato.`
        : `Fornecedor regional homologado (${sup.location}). Apresentou conformidade com todas as normas técnicas da RFQ.`;

      return {
        id: `quote-${Date.now()}-${sup.id}`,
        rfq_id: generatedCode,
        supplier_name: sup.name,
        supplier_rating: sup.rating,
        total_amount: totalVal,
        delivery_lead_time_days: leadDays,
        payment_terms: sup.payment_terms_standard,
        status: 'received' as const,
        ai_score: parseFloat(score.toFixed(1)),
        ai_analysis_summary: summary,
        savings_percentage: savingsPct,
        breakdown_items: items.map((i) => ({
          item_name: i.item_name,
          quantity: i.quantity,
          unit_price: Math.round(i.target_unit_price * priceFactor),
          total_price: Math.round(i.quantity * i.target_unit_price * priceFactor),
        })),
      };
    });

    const newRFQ: RFQ = {
      id: `rfq-${Date.now()}`,
      code: generatedCode,
      title: title.trim(),
      scope_description: scopeDescription.trim(),
      status: 'published',
      deadline: deadline || 'Em 5 dias',
      target_delivery_date: targetDeliveryDate || 'Em 15 dias',
      estimated_budget: calculatedTotal,
      items: items.filter((i) => i.item_name.trim() !== ''),
      quotes: generatedQuotes,
    };

    onCreateRFQ(newRFQ);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-3xl bg-[#0c1017] border border-[#223043] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-[#1c2636] flex items-center justify-between bg-[#111722]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7] flex items-center justify-center text-white shadow-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Abrir Novo Pedido de Orçamento (RFQ)
              </h2>
              <p className="text-[11px] text-slate-400">
                Dispare a requisição para fornecedores homologados e receba cotações concorrentes para comparar.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
          {/* Modelos Rápidos */}
          <div className="p-2.5 rounded-lg bg-[#101724] border border-[#1d2a3d] flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
              Modelos Prontos de Demanda:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleApplyTemplate('pluvial')}
                className="px-2.5 py-1 rounded bg-[#162234] hover:bg-[#1e2f47] border border-[#233752] text-[#38bdf8] text-[11px] font-medium transition-colors cursor-pointer"
              >
                🌊 Rede Pluvial & Tubos (Cascavel/Oeste)
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('aco')}
                className="px-2.5 py-1 rounded bg-[#162234] hover:bg-[#1e2f47] border border-[#233752] text-amber-300 text-[11px] font-medium transition-colors cursor-pointer"
              >
                ⚙️ Aço Estrutural & Solda (Canteiro)
              </button>
            </div>
          </div>

          {/* Dados Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-slate-300 font-medium">Título da Requisição / Objeto da Compra *</label>
              <input
                type="text"
                placeholder="Ex: Aquisição de Tubulação PEAD e Drenagem Pluvial"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#0b0f17] border border-[#223043] rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#0284c7]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Setor / Obra de Destino</label>
              <select
                value={selectedSectorId}
                onChange={(e) => setSelectedSectorId(e.target.value)}
                className="w-full bg-[#0b0f17] border border-[#223043] rounded px-3 py-2 text-white focus:outline-none focus:border-[#0284c7]"
              >
                {sectors.length > 0 ? (
                  sectors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))
                ) : (
                  <option value="default">Divisão de Infraestrutura - Corredor Oeste</option>
                )}
              </select>
            </div>
          </div>

          {/* Escopo Técnico */}
          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Escopo Técnico Detalhado *</label>
            <textarea
              rows={2}
              placeholder="Descreva as especificações, normas técnicas aplicáveis e requisitos de entrega..."
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              required
              className="w-full bg-[#0b0f17] border border-[#223043] rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#0284c7]"
            />
          </div>

          {/* Orçamento e Prazos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Orçamento Estimado Teto (R$)</label>
              <input
                type="number"
                placeholder="45000"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
                className="w-full bg-[#0b0f17] border border-[#223043] rounded px-3 py-2 text-white placeholder-slate-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Prazo Limite para Resposta</label>
              <input
                type="text"
                placeholder="Em 5 dias"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[#0b0f17] border border-[#223043] rounded px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Prazo Desejado de Entrega</label>
              <input
                type="text"
                placeholder="Em 15 dias"
                value={targetDeliveryDate}
                onChange={(e) => setTargetDeliveryDate(e.target.value)}
                className="w-full bg-[#0b0f17] border border-[#223043] rounded px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Itens Requisitados */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">Itens e Quantitativos Solicitados</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-[11px] text-[#38bdf8] hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Adicionar Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="p-2.5 rounded bg-[#0f141d] border border-[#1b2636] space-y-2">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Nome do Item / Material..."
                        value={item.item_name}
                        onChange={(e) => handleItemChange(item.id, 'item_name', e.target.value)}
                        className="w-full bg-[#0b0f17] border border-[#223043] rounded px-2.5 py-1.5 text-white placeholder-slate-500 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qtd"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        className="w-full bg-[#0b0f17] border border-[#223043] rounded px-2.5 py-1.5 text-white placeholder-slate-500 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                        className="w-full bg-[#0b0f17] border border-[#223043] rounded px-2 py-1.5 text-white text-xs"
                      >
                        <option value="metros">metros</option>
                        <option value="unidades">unidades</option>
                        <option value="peças">peças</option>
                        <option value="kg">kg</option>
                        <option value="kits">kits</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Preço R$"
                        value={item.target_unit_price || ''}
                        onChange={(e) => handleItemChange(item.id, 'target_unit_price', e.target.value)}
                        className="w-full bg-[#0b0f17] border border-[#223043] rounded px-2.5 py-1.5 text-white placeholder-slate-500 text-xs"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-400 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Norma técnica / especificação do material..."
                    value={item.specification}
                    onChange={(e) => handleItemChange(item.id, 'specification', e.target.value)}
                    className="w-full bg-[#0b0f17] border border-[#223043] rounded px-2.5 py-1.5 text-slate-300 placeholder-slate-500 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Fornecedores Próximos & Homologados para Cotação */}
          <div className="pt-2 border-t border-[#1a2536] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Fornecedores Homologados Próximos para Cotar ({eligibleSuppliers.length})</span>
              </label>
              <span className="text-[10px] text-slate-400">Selecione para quem enviar o pedido</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {eligibleSuppliers.map((item) => {
                const isSelected = selectedSupplierIds.includes(item.supplier.id);
                return (
                  <div
                    key={item.supplier.id}
                    onClick={() => toggleSupplier(item.supplier.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#101b2a] border-[#0284c7] ring-1 ring-[#0284c7]/40'
                        : 'bg-[#0f1520] border-[#1e2a3b] opacity-65 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-slate-700 text-[#0284c7] cursor-pointer"
                          />
                          <p className="font-semibold text-white text-xs truncate">
                            {item.supplier.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-300 pl-5">
                          <span className="flex items-center gap-1 text-[#38bdf8]">
                            <MapPin className="w-3 h-3" /> {item.supplier.location}
                          </span>
                          <span>• Lead Time: {item.supplier.lead_time_avg_days} dias</span>
                        </div>
                        {item.supplier.is_mobilized_on_site && (
                          <div className="pl-5 pt-0.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800 text-[9px] font-semibold">
                              <Zap className="w-2.5 h-2.5 fill-emerald-300" /> Mobilizado no Canteiro (Frete Zero)
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-800 shrink-0">
                        {item.matchScore}% Match
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rodapé com botão de Envio */}
          <div className="pt-3 border-t border-[#1c2636] flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              O pedido será disparado para os fornecedores selecionados. As propostas retornarão para o comparador.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded bg-[#16202e] hover:bg-[#202e42] text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={selectedSupplierIds.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Disparar Cotação para Fornecedores ({selectedSupplierIds.length})</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

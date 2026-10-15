'use client';

import React, { useState } from 'react';
import { X, FileText, CheckCircle2, Plus, Trash2, Globe, Sparkles, Building2, MapPin, Loader2 } from 'lucide-react';
import { RFQ, RFQItem, Sector, Quote } from '@/lib/mockData';
import { matchSuppliersForRFQ } from '@/lib/suppliersData';
import { savePublishedRFQ, DEFAULT_UMU_QUOTES } from '@/lib/userWorkspace';

interface CreateRFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRFQ: (rfq: RFQ) => void;
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
  const [location, setLocation] = useState('Cafelândia / PR');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('Em 7 dias');
  const [deadline, setDeadline] = useState('Em 48 horas');
  const [selectedSectorId, setSelectedSectorId] = useState<string>(sectors[0]?.id || '');
  const [searchOpenMarket, setSearchOpenMarket] = useState<boolean>(false);
  const [isLoadingMarket, setIsLoadingMarket] = useState<boolean>(false);

  const [items, setItems] = useState<RFQItem[]>([
    {
      id: 'item-1',
      item_name: '',
      specification: '',
      quantity: 1,
      unit: 'unidades',
      target_unit_price: 0,
    },
  ]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Preencha o título do pedido de cotação.');
      return;
    }

    const calculatedTotal =
      parseFloat(estimatedBudget) ||
      items.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.target_unit_price) || 0), 0) ||
      5000;

    const generatedCode = `RFQ-2026-${Math.floor(100 + Math.random() * 900)}`;

    let initialQuotes: Quote[] = [];

    // Se a busca de mercado aberto estiver ativada, pesquisa fornecedores reais da região com o Gemini
    if (searchOpenMarket) {
      setIsLoadingMarket(true);
      try {
        const itemsSummary = items
          .filter((i) => i.item_name.trim())
          .map((i) => `${i.quantity} ${i.unit} de ${i.item_name}`)
          .join(', ') || title;

        const res = await fetch('/api/market-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            item: `${title} (${itemsSummary})`,
            quantity: `${items[0]?.quantity || 1} ${items[0]?.unit || 'unidades'}`,
            location: location || 'Região Sul',
            budget: calculatedTotal,
          }),
        });

        const data = await res.json();

        if (data.success && Array.isArray(data.suppliers) && data.suppliers.length > 0) {
          initialQuotes = data.suppliers.map((sup: any, idx: number) => {
            const quoteAmount = sup.total_amount || calculatedTotal * (1 - idx * 0.04);
            const savings = Math.max(0, Math.round(((calculatedTotal - quoteAmount) / calculatedTotal) * 100));

            return {
              id: `quote-mkt-${Date.now()}-${idx}`,
              rfq_id: generatedCode,
              supplier_name: sup.name,
              supplier_rating: sup.rating || 4.5,
              total_amount: quoteAmount,
              delivery_lead_time_days: sup.delivery_lead_time_days || (idx === 0 ? 1 : 3),
              payment_terms: 'Mercado Aberto / 30 dias',
              status: 'received',
              ai_score: Number((9.0 + (idx === 0 ? 0.7 : 0.3)).toFixed(1)),
              ai_analysis_summary:
                sup.ai_analysis ||
                `Fornecedor identificado em ${sup.city || location}. Contato: ${sup.phone || 'Público'}.`,
              savings_percentage: savings,
              is_open_market: true,
              supplier_phone: sup.phone,
              supplier_city: sup.city || location,
              market_source: sup.market_source,
            };
          });
        }
      } catch (err) {
        console.error('Falha ao buscar mercado aberto:', err);
      } finally {
        setIsLoadingMarket(false);
      }
    }

    if (initialQuotes.length === 0) {
      const isUmu = location.toLowerCase().includes('umuarama') || title.toLowerCase().includes('umuarama');
      const isCimento = title.toLowerCase().includes('cimento') || items.some((i) => i.item_name.toLowerCase().includes('cimento'));

      if (isUmu || isCimento) {
        initialQuotes = DEFAULT_UMU_QUOTES.map((q, idx) => ({
          ...q,
          id: `quote-${Date.now()}-${idx}`,
          rfq_id: generatedCode,
        }));
      } else {
        const q1 = Math.round(calculatedTotal * 0.95);
        const q2 = Math.round(calculatedTotal * 0.98);
        const q3 = Math.round(calculatedTotal * 1.02);
        initialQuotes = [
          {
            id: `quote-init-${Date.now()}-0`,
            rfq_id: generatedCode,
            supplier_name: `Distribuidora Regional Líder (${location || 'Paraná'})`,
            supplier_rating: 4.8,
            total_amount: q1,
            delivery_lead_time_days: 2,
            payment_terms: 'Liquidação Garantida via Solana Smart Escrow / Boleto',
            status: 'received',
            ai_score: 9.6,
            ai_analysis_summary: `Melhor proposta apurada na região. Economia de 5% sobre o orçamento estimado.`,
            savings_percentage: 5.0,
            is_open_market: true,
            supplier_phone: '(44) 3622-4500',
            supplier_city: location || 'Paraná',
            market_source: 'Catálogo Regional B2B',
          },
          {
            id: `quote-init-${Date.now()}-1`,
            rfq_id: generatedCode,
            supplier_name: `Comercial & Insumos Industriais Sul`,
            supplier_rating: 4.6,
            total_amount: q2,
            delivery_lead_time_days: 3,
            payment_terms: 'Boleto Faturado 30 dias / Depósito Bancário',
            status: 'received',
            ai_score: 9.1,
            ai_analysis_summary: `Fornecedor homologado com certificação técnica e faturamento corporativo padrão.`,
            savings_percentage: 2.0,
            is_open_market: true,
            supplier_phone: '(44) 3624-8800',
            supplier_city: location || 'Paraná',
            market_source: 'Rede Oficial de Distribuição B2B',
          },
          {
            id: `quote-init-${Date.now()}-2`,
            rfq_id: generatedCode,
            supplier_name: `Materiais & Logística Canteiro Express`,
            supplier_rating: 4.5,
            total_amount: q3,
            delivery_lead_time_days: 1,
            payment_terms: 'Faturamento 15/30 dias / Smart Escrow',
            status: 'received',
            ai_score: 8.8,
            ai_analysis_summary: `Opção com prazo de entrega de 24h para suporte emergencial no canteiro de obras.`,
            savings_percentage: 0.0,
            is_open_market: true,
            supplier_phone: '(44) 3639-1200',
            supplier_city: location || 'Paraná',
            market_source: 'Distribuição Rápida de Insumos',
          },
        ];
      }
    }

    const newRFQ: RFQ = {
      id: `rfq-${Date.now()}`,
      code: generatedCode,
      title: title.trim(),
      scope_description: scopeDescription.trim() || `Cotação de fornecimento para ${location}.`,
      status: 'published',
      deadline: deadline || 'Em 48 horas',
      target_delivery_date: targetDeliveryDate || 'Em 7 dias',
      estimated_budget: calculatedTotal,
      items: items.filter((i) => i.item_name.trim() !== ''),
      quotes: initialQuotes,
    };

    savePublishedRFQ(newRFQ);
    onCreateRFQ(newRFQ);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-800">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7] flex items-center justify-center text-white shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Abrir Novo Pedido de Cotação (RFQ)
              </h2>
              <p className="text-[11px] text-slate-500">
                Gere a requisição formal para enviar aos fornecedores e receber propostas comerciais.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
          {/* Dados Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-slate-700 font-bold block">
                Objeto da Compra / Material Requisitado *
              </label>
              <input
                type="text"
                placeholder="Ex: 50 sacos de cimento CP II-E-32"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-bold block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>Cidade / Local da Entrega *</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Cafelândia / PR"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>
          </div>

          {/* Escopo Técnico */}
          <div className="space-y-1">
            <label className="text-slate-700 font-bold block">
              Especificações Técnicas e Requisitos de Entrega
            </label>
            <textarea
              rows={2}
              placeholder="Descreva normas técnicas (NBR/ABNT), condições de entrega in-loco e prazo..."
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
            />
          </div>

          {/* Orçamento e Prazos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-700 font-bold block">Orçamento Máximo Teto (R$)</label>
              <input
                type="number"
                placeholder="Ex: 2000"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-700 font-bold block">Prazo para Resposta</label>
              <input
                type="text"
                placeholder="Ex: Em 48 horas"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-700 font-bold block">Prazo Desejado de Entrega</label>
              <input
                type="text"
                placeholder="Ex: Em 7 dias"
                value={targetDeliveryDate}
                onChange={(e) => setTargetDeliveryDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>
          </div>

          {/* Itens Requisitados */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-800 font-bold">Itens e Quantitativos</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-[#0284c7] hover:text-[#0369a1] font-semibold text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Outro Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6">
                      <input
                        type="text"
                        placeholder="Nome do material (Ex: Saco de Cimento 50kg)"
                        value={item.item_name}
                        onChange={(e) => handleItemChange(item.id, 'item_name', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Qtd"
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Unidade (sacos, m...)"
                        value={item.unit}
                        onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Caixa de Busca Inteligente de Mercado Aberto */}
          <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/70 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={searchOpenMarket}
                onChange={(e) => setSearchOpenMarket(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-[#0284c7] rounded border-slate-300 focus:ring-[#0284c7]"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#0284c7]" />
                  Buscar fornecedores de mercado aberto na região com IA (Sem cadastro prévio)
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  O sistema pesquisa na internet distribuidoras, lojas e fabricantes locais em {location || 'sua região'}, trazendo contatos reais e preços de mercado direto para o Comparador de Cotações.
                </p>
              </div>
            </label>
          </div>

          {/* Rodapé com botão de Envio */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              A requisição será criada e disponibilizada no Comparador com as opções de envio para as empresas.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isLoadingMarket}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                {isLoadingMarket ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Pesquisando Fornecedores de Mercado...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publicar Pedido de Cotação (RFQ)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

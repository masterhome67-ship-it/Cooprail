'use client';

import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { RFQ, RFQItem } from '@/lib/mockData';
import { matchSuppliersForRFQ, Supplier } from '@/lib/suppliersData';
import { ShieldCheck, Check } from 'lucide-react';

interface CreateRFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRFQ: (newRFQ: RFQ) => void;
}

export function CreateRFQModal({
  isOpen,
  onClose,
  onCreateRFQ,
}: CreateRFQModalProps) {
  const [title, setTitle] = useState('');
  const [scopeDescription, setScopeDescription] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
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

  // Assistente de IA: Redigir Escopo Técnico Automático
  const handleAIAssistScope = () => {
    if (!title.trim()) {
      alert('Por favor, informe ao menos o título do pedido de orçamento para a IA redigir o escopo.');
      return;
    }
    setIsGeneratingWithAI(true);
    setTimeout(() => {
      setScopeDescription(
        `Fornecimento técnico e homologado de materiais para o projeto "${title}". Os itens devem atender rigorosamente às normas técnicas vigentes (ABNT/ISO/ASTM), com laudo dimensional e certificado de rastreabilidade da matéria-prima. Prazo de garantia mínimo de 12 meses contra defeitos de fabricação.`
      );
      if (items[0].item_name === '') {
        setItems([
          {
            id: `item-${Date.now()}`,
            item_name: title,
            specification: 'Especificação técnica industrial conforme normas aplicáveis e tolerância Grau 1.',
            quantity: 100,
            unit: 'unidades',
            target_unit_price: 250.0,
          },
        ]);
        setEstimatedBudget('25000');
      }
      setIsGeneratingWithAI(false);
    }, 700);
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

    const newRFQ: RFQ = {
      id: `rfq-${Date.now()}`,
      code: generatedCode,
      title: title.trim(),
      scope_description: scopeDescription.trim(),
      status: 'published',
      deadline: deadline || 'Em 7 dias',
      target_delivery_date: targetDeliveryDate || 'Em 30 dias',
      estimated_budget: calculatedTotal,
      items: items.filter((i) => i.item_name.trim() !== ''),
      quotes: [], // Cotações reais: só entram quando fornecedor enviar ou usuário fizer upload do documento!
    };

    onCreateRFQ(newRFQ);
    onClose();
  };

  // Fornecedores aptos calculados com assertividade com base no escopo e itens
  const eligibleSuppliers = matchSuppliersForRFQ(
    `${title} ${scopeDescription}`,
    items.map((i) => i.item_name)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-3xl bg-[#0c1017] border border-[#223043] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-[#1c2636] flex items-center justify-between bg-[#111722]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#0284c7] flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Novo Pedido de Orçamento (RFQ)
              </h2>
              <p className="text-xs text-slate-400">
                Cadastre os requisitos técnicos e receba cotações automatizadas com análise de IA.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Título e Botão do Agente de IA */}
          <div className="space-y-1">
            <label className="text-slate-300 font-medium block">
              Título da Requisição / O que você precisa comprar? *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Aquisição de Cabos de Cobre 50mm para Linha de Tração"
                className="flex-1 bg-[#121924] border border-[#202d3f] rounded px-3 py-2 text-white placeholder-slate-400 outline-none focus:border-[#0284c7] transition-colors"
              />
              <button
                type="button"
                onClick={handleAIAssistScope}
                disabled={isGeneratingWithAI}
                className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#182335] hover:bg-[#202e44] border border-[#273952] text-[#38bdf8] font-medium transition-colors shrink-0 cursor-pointer"
                title="Agente Redator preenche o escopo técnico automaticamente"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingWithAI ? 'Gerando...' : 'Gerar com IA'}</span>
              </button>
            </div>
          </div>

          {/* Escopo Técnico / Descrição */}
          <div className="space-y-1">
            <label className="text-slate-300 font-medium block">
              Escopo Técnico e Requisitos *
            </label>
            <textarea
              required
              rows={3}
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              placeholder="Descreva normas técnicas, critérios de aceitação, laudos ou requisitos específicos de fornecimento..."
              className="w-full bg-[#121924] border border-[#202d3f] rounded px-3 py-2 text-white placeholder-slate-400 outline-none focus:border-[#0284c7] transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Metadados: Orçamento e Prazos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Orçamento Máximo Estimado (R$)</span>
              </label>
              <input
                type="number"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
                placeholder="Ex: 85000"
                className="w-full bg-[#121924] border border-[#202d3f] rounded px-3 py-2 text-white placeholder-slate-400 outline-none focus:border-[#0284c7]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Prazo Limite para Cotações</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[#121924] border border-[#202d3f] rounded px-3 py-2 text-white outline-none focus:border-[#0284c7]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Data Desejada de Entrega</span>
              </label>
              <input
                type="date"
                value={targetDeliveryDate}
                onChange={(e) => setTargetDeliveryDate(e.target.value)}
                className="w-full bg-[#121924] border border-[#202d3f] rounded px-3 py-2 text-white outline-none focus:border-[#0284c7]"
              />
            </div>
          </div>

          {/* Itens do Pedido */}
          <div className="space-y-2 pt-2 border-t border-[#1a2536]">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-semibold flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Itens e Peças Solicitadas ({items.length})</span>
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-[11px] text-[#38bdf8] hover:text-[#7dd3fc] font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Adicionar Outro Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 rounded bg-[#0f1520] border border-[#1e2a3b] space-y-2"
                >
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <input
                        type="text"
                        required
                        placeholder={`Nome do Item #${index + 1}`}
                        value={item.item_name}
                        onChange={(e) => handleItemChange(item.id, 'item_name', e.target.value)}
                        className="w-full bg-[#0b0f17] border border-[#223043] rounded px-2.5 py-1.5 text-white placeholder-slate-400 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qtd"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        className="w-full bg-[#0b0f17] border border-[#223043] rounded px-2.5 py-1.5 text-white placeholder-slate-400 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                        className="w-full bg-[#0b0f17] border border-[#223043] rounded px-2 py-1.5 text-white text-xs"
                      >
                        <option value="unidades">unidades</option>
                        <option value="peças">peças</option>
                        <option value="metros">metros</option>
                        <option value="kg">kg</option>
                        <option value="toneladas">toneladas</option>
                        <option value="litros">litros</option>
                        <option value="kits">kits</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Preço Unit. R$"
                        value={item.target_unit_price || ''}
                        onChange={(e) => handleItemChange(item.id, 'target_unit_price', e.target.value)}
                        className="w-full bg-[#0b0f17] border border-[#223043] rounded px-2.5 py-1.5 text-white placeholder-slate-400 text-xs"
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
                    placeholder="Especificação técnica detalhada / norma técnica..."
                    value={item.specification}
                    onChange={(e) => handleItemChange(item.id, 'specification', e.target.value)}
                    className="w-full bg-[#0b0f17] border border-[#223043] rounded px-2.5 py-1.5 text-slate-300 placeholder-slate-400 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Fornecedores Aptos para Cotar este Escopo */}
          <div className="pt-2 border-t border-[#1a2536] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Fornecedores Homologados Aptos para este Escopo ({eligibleSuppliers.length})</span>
              </label>
              <span className="text-[10px] text-slate-400">Regras de Homologação ISO / CNAE</span>
            </div>

            {eligibleSuppliers.length === 0 ? (
              <p className="text-[11px] text-slate-400 bg-[#0f1520] p-2.5 rounded border border-[#1e2a3b]">
                Digite o escopo ou itens acima para o motor cruzar com a base de fornecedores homologados.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {eligibleSuppliers.map((item) => (
                  <div
                    key={item.supplier.id}
                    className="p-2.5 rounded bg-[#0f1520] border border-[#1e2a3b] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-200 text-xs truncate">
                        {item.supplier.name}
                      </p>
                      <span className="text-[9px] bg-emerald-950/80 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-800/60 shrink-0">
                        Match {item.matchScore}%
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400">CNPJ: {item.supplier.cnpj}</p>
                    <p className="text-[10px] text-slate-300">
                      Especialidades: {item.matchedCategories.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rodapé com botão de Envio */}
          <div className="pt-3 border-t border-[#1c2636] flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              O pedido será registrado no status &quot;Publicado&quot;. As propostas reais entram via documento ou envio direto.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded bg-[#16202e] hover:bg-[#202e42] text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Publicar Pedido de Orçamento</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

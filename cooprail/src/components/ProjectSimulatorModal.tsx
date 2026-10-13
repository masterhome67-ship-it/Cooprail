'use client';

import React, { useState } from 'react';
import {
  FileText,
  MapPin,
  Scale,
  ShoppingBag,
  Lock,
  CheckCircle2,
  ArrowRight,
  Play,
  RotateCcw,
  X,
  Zap,
  TrendingDown,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { RFQ, Task, Quote } from '@/lib/mockData';
import { PurchaseOrderRecord } from '@/components/SolanaSettlementModal';

interface ProjectSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteSimulation: (newRFQ: RFQ, newTask: Task, newOrder?: PurchaseOrderRecord) => void;
}

export function ProjectSimulatorModal({
  isOpen,
  onClose,
  onCompleteSimulation,
}: ProjectSimulatorModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedScenario, setSelectedScenario] = useState<'drenagem' | 'trilhos'>('drenagem');
  const [acceptedSupplierId, setAcceptedSupplierId] = useState<string>('sup-1');

  if (!isOpen) return null;

  const scenarioData = {
    drenagem: {
      rfqCode: 'RFQ-2026-DREN-04',
      title: 'Adequação de Drenagem Pluvial & Tubos PEAD (Corredor Oeste)',
      budgetBrl: 45000,
      scope: 'Fornecimento de tubos PEAD DN 400mm corrugados NBR 8890 e caixas coletoras de concreto pré-moldado classe D400 para mitigação de erosão na ferrovia.',
      suppliers: [
        {
          id: 'sup-1',
          name: 'Metalúrgica Ferro & Aço Nacional S.A.',
          location: 'Corredor Oeste / Canteiro Central',
          distance: '0 km (No canteiro)',
          isMobilized: true,
          price: 42300,
          leadDays: 4,
          score: 9.8,
          freightAdvantage: 'Frete Zero (Equipe já mobilizada na obra)',
        },
        {
          id: 'sup-2',
          name: 'Hidráulica & Tubulações Oeste Paraná Ltda',
          location: 'Cascavel / PR',
          distance: '12 km de distância',
          isMobilized: false,
          price: 43200,
          leadDays: 7,
          score: 9.2,
          freightAdvantage: 'Frete regional reduzido (Cascavel)',
        },
        {
          id: 'sup-3',
          name: 'Drenagem & Saneamento Toledo Industrial S.A.',
          location: 'Toledo / PR',
          distance: '45 km de distância',
          isMobilized: false,
          price: 46350,
          leadDays: 8,
          score: 8.7,
          freightAdvantage: 'Frete intermunicipal Toledo',
        },
      ],
      poCode: 'PO-2026-DREN-01',
      costCenter: 'CC-4100-VIA',
      sectorName: 'Divisão de Infraestrutura & Via Permanente - Corredor Oeste',
    },
    trilhos: {
      rfqCode: 'RFQ-2026-FERRO-09',
      title: 'Perfis de Aço Estrutural ASTM A572 & Solda para Truques',
      budgetBrl: 62000,
      scope: 'Aquisição de perfis metálicos laminados ASTM A572 Grau 50 e consumíveis de soldagem com certificação técnica para reforço de pontes e passarelas ferroviárias.',
      suppliers: [
        {
          id: 'sup-1',
          name: 'Metalúrgica Ferro & Aço Nacional S.A.',
          location: 'Corredor Oeste / Canteiro Central',
          distance: '0 km (No canteiro)',
          isMobilized: true,
          price: 58280,
          leadDays: 5,
          score: 9.9,
          freightAdvantage: 'Frete Zero (Oficina mecânica ativa no pátio)',
        },
        {
          id: 'sup-4',
          name: 'Trilhos Brasil Fixadores e Componentes Ltda',
          location: 'Campinas / SP',
          distance: '820 km de distância',
          isMobilized: false,
          price: 61500,
          leadDays: 14,
          score: 8.9,
          freightAdvantage: 'Frete interestadual com escolta',
        },
      ],
      poCode: 'PO-2026-ACO-02',
      costCenter: 'CC-4200-MANUT',
      sectorName: 'Oficina Central de Material Rodante & Locomotivas',
    },
  };

  const sc = scenarioData[selectedScenario];
  const chosenSupplier = sc.suppliers.find((s) => s.id === acceptedSupplierId) || sc.suppliers[0];

  const steps = [
    {
      num: 1,
      title: '1. Pedido de Orçamento (RFQ)',
      subtitle: 'Estruturação da Requisição Técnica & Orçamento Teto',
      icon: FileText,
      color: '#38bdf8',
    },
    {
      num: 2,
      title: '2. Busca de Fornecedores Próximos',
      subtitle: 'Varredura Regional (Cascavel, Toledo, Canteiro Oeste) & Frete Zero',
      icon: MapPin,
      color: '#a855f7',
    },
    {
      num: 3,
      title: '3. Comparação de Cotações & Aceite',
      subtitle: 'Análise de Propostas Concorrentes & Homologação da Proposta Vencedora',
      icon: Scale,
      color: '#10b981',
    },
    {
      num: 4,
      title: '4. Emissão da Ordem de Compra (PO)',
      subtitle: 'Formalização Contratual, Centro de Custo e Valores BRL / USDC',
      icon: ShoppingBag,
      color: '#f59e0b',
    },
    {
      num: 5,
      title: '5. Pagamento On-Chain (Solana)',
      subtitle: 'Liquidação via Smart Escrow com SPL Memo e Hash Imutável',
      icon: Lock,
      color: '#06b6d4',
    },
  ];

  const handleStartSimulation = () => {
    setIsRunning(true);
    setCurrentStep(1);

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 5) {
          clearInterval(timer);
          setIsRunning(false);
          return 5;
        }
        return prev + 1;
      });
    }, 2200);
  };

  const handleNextStep = () => {
    if (currentStep < 5) setCurrentStep((prev) => prev + 1);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleApplyToPlatform = () => {
    const generatedQuotes: Quote[] = sc.suppliers.map((s, idx) => ({
      id: `q-sim-${Date.now()}-${s.id}`,
      rfq_id: sc.rfqCode,
      supplier_name: s.name,
      supplier_rating: 4.8,
      total_amount: s.price,
      delivery_lead_time_days: s.leadDays,
      payment_terms: s.isMobilized ? '30/60 dias faturado' : '28 dias líquido',
      status: s.id === acceptedSupplierId ? ('accepted' as const) : ('received' as const),
      ai_score: s.score,
      savings_percentage: Math.round(((sc.budgetBrl - s.price) / sc.budgetBrl) * 100),
      ai_analysis_summary: s.isMobilized
        ? `Fornecedor mobilizado in-loco (${s.location}). Vantagem logística decisiva de Frete Zero e início imediato.`
        : `Fornecedor regional homologado (${s.location}). Proposta com plena conformidade técnica com o edital.`,
    }));

    const newRFQ: RFQ = {
      id: `rfq-sim-${Date.now()}`,
      code: sc.rfqCode,
      title: sc.title,
      scope_description: sc.scope,
      status: 'published',
      deadline: 'Em 3 dias',
      target_delivery_date: 'Em 10 dias',
      estimated_budget: sc.budgetBrl,
      items: [
        {
          id: 'item-1',
          item_name: 'Tubos PEAD DN 400mm Corrugados',
          specification: 'Conforme norma NBR 8890 com junta elástica',
          quantity: 120,
          unit: 'metros',
          target_unit_price: 250,
        },
        {
          id: 'item-2',
          item_name: 'Caixas Coletoras com Grelhas D400',
          specification: 'Concreto pré-moldado classe pesada',
          quantity: 15,
          unit: 'unidades',
          target_unit_price: 1000,
        },
      ],
      quotes: generatedQuotes,
    };

    const newOrder: PurchaseOrderRecord = {
      id: `po-sim-${Date.now()}`,
      po_code: sc.poCode,
      supplier_name: chosenSupplier.name,
      supplier_cnpj: '45.123.890/0001-12',
      rfq_code: sc.rfqCode,
      total_amount_brl: chosenSupplier.price,
      delivery_days: chosenSupplier.leadDays,
      created_at: 'Agora (Simulado)',
      status: currentStep === 5 ? 'settled_onchain' : 'approved',
      sector_name: sc.sectorName,
      cost_center: sc.costCenter,
      is_existing_contractor: chosenSupplier.isMobilized,
      approval_notes: `Aprovado pelo comparador. ${chosenSupplier.freightAdvantage}.`,
      settlement_data:
        currentStep === 5
          ? {
              signature: '4PT58t1KjT3P5UKXDmSSiqMY1vNEdezqYqWVd4PLgKLUjNVZvkvuqihFgeERYZepuDkbCG81esM2uA3q9kHsdAw1',
              slot: 430,
              blockTime: Math.floor(Date.now() / 1000),
              escrowPda: '8MJ17smX8e5JW1dvg4FQxkZZTrphPcHzwZD6BzY6duPN',
              networkFeeSol: 0.000005,
              tokenAmountUsdc: Math.round(chosenSupplier.price / 5.6),
              cluster: 'devnet' as const,
              status: 'finalized' as const,
              timestamp: new Date().toLocaleTimeString('pt-BR'),
              contractProgramId: 'CoopRSettL1111111111111111111111111111111111',
            }
          : undefined,
    };

    const newTask: Task = {
      id: `task-sim-${Date.now()}`,
      title: `Ordem ${newOrder.po_code} Emitida e Pronta`,
      description: `Ciclo completo de compras concluído para ${sc.title}. Fornecedor ${chosenSupplier.name} contratado por R$ ${chosenSupplier.price.toLocaleString('pt-BR')}.`,
      status: currentStep === 5 ? 'completed' : 'needs_you',
      priority: 'high',
      category: 'po_approval',
      due_date: 'Hoje',
      badge_text: currentStep === 5 ? 'Liquidado On-Chain' : 'Pronto para Pagamento',
    };

    onCompleteSimulation(newRFQ, newTask, newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#0c1017] border border-[#223043] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Topo do Modal */}
        <div className="p-4 border-b border-[#1c2636] flex items-center justify-between bg-[#111722]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">
                  Simulador de Fluxo de Compras & Liquidação Solana
                </h2>
                <span className="text-[10px] bg-[#0c2438] text-[#38bdf8] font-bold px-2 py-0.5 rounded border border-[#14446b]">
                  Ponta a Ponta (5 Fases)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Simule desde o pedido de orçamento, fornecedores próximos, comparação e aceite, até a ordem e pagamento on-chain.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Progresso dos 5 Passos */}
        <div className="px-5 py-3 bg-[#090d14] border-b border-[#182333] flex items-center justify-between overflow-x-auto gap-2">
          {steps.map((st) => {
            const Icon = st.icon;
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;

            return (
              <div
                key={st.num}
                onClick={() => !isRunning && setCurrentStep(st.num)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#132236] text-white border border-[#0284c7] font-semibold'
                    : isCompleted
                    ? 'bg-[#0f1724] text-emerald-400 border border-emerald-900/60'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-[#0284c7] text-white'
                      : 'bg-[#1b2636] text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : st.num}
                </div>
                <span className="truncate">{st.title.split('. ')[1]}</span>
              </div>
            );
          })}
        </div>

        {/* Conteúdo Dinâmico da Etapa Atual */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Seletor de Cenário caso ainda não iniciado */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#101724] border border-[#1d2a3d] space-y-2">
                <span className="text-[11px] font-semibold text-[#38bdf8] uppercase tracking-wider block">
                  Escolha o Cenário de Teste:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedScenario('drenagem')}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      selectedScenario === 'drenagem'
                        ? 'bg-[#132338] border-[#0284c7] ring-1 ring-[#0284c7]/40'
                        : 'bg-[#0b0f17] border-[#1c2636] hover:border-[#283950]'
                    }`}
                  >
                    <p className="font-semibold text-white text-xs">
                      🌊 Tubulações PEAD & Drenagem Ferroviária
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Cascavel/PR e Canteiro Central Corredor Oeste • Orçamento R$ 45.000,00
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedScenario('trilhos')}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      selectedScenario === 'trilhos'
                        ? 'bg-[#132338] border-[#0284c7] ring-1 ring-[#0284c7]/40'
                        : 'bg-[#0b0f17] border-[#1c2636] hover:border-[#283950]'
                    }`}
                  >
                    <p className="font-semibold text-white text-xs">
                      ⚙️ Aço Estrutural ASTM A572 & Solda para Truques
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Oficina Central de Locomotivas • Orçamento R$ 62.000,00
                    </p>
                  </div>
                </div>
              </div>

              {/* Prévia do Fluxo */}
              <div className="p-4 rounded-lg bg-[#0c121b] border border-[#1c2838] space-y-3">
                <h4 className="text-xs font-semibold text-white">
                  O que esta simulação vai executar em sequência:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-[11px]">
                  <div className="p-2.5 rounded bg-[#101722] border border-[#1b2536] space-y-1">
                    <span className="font-bold text-[#38bdf8]">1. Orçamento</span>
                    <p className="text-slate-400">Abertura de RFQ com especificação técnica e teto orçamentário.</p>
                  </div>
                  <div className="p-2.5 rounded bg-[#101722] border border-[#1b2536] space-y-1">
                    <span className="font-bold text-purple-400">2. Fornecedores</span>
                    <p className="text-slate-400">Varredura de proximidade: Cascavel, Toledo e equipe no canteiro.</p>
                  </div>
                  <div className="p-2.5 rounded bg-[#101722] border border-[#1b2536] space-y-1">
                    <span className="font-bold text-emerald-400">3. Aceite</span>
                    <p className="text-slate-400">Comparação das 3 cotações recebidas e aprovação formal.</p>
                  </div>
                  <div className="p-2.5 rounded bg-[#101722] border border-[#1b2536] space-y-1">
                    <span className="font-bold text-amber-400">4. Ordem (PO)</span>
                    <p className="text-slate-400">Geração da PO oficial vinculada ao setor operacional.</p>
                  </div>
                  <div className="p-2.5 rounded bg-[#101722] border border-[#1b2536] space-y-1">
                    <span className="font-bold text-cyan-400">5. Solana</span>
                    <p className="text-slate-400">Liquidação on-chain com Smart Escrow e SPL Memo gravado.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASSO 1: Pedido de Orçamento (RFQ) */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-lg bg-[#101724] border border-[#1e2d42] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#38bdf8] bg-[#0b1928] px-2 py-0.5 rounded border border-[#143352]">
                    {sc.rfqCode}
                  </span>
                  <span className="text-xs text-slate-300">
                    Teto Orçamentário:{' '}
                    <strong className="text-white">
                      {sc.budgetBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </strong>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{sc.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{sc.scope}</p>
              </div>

              <div className="bg-[#0b1017] border border-[#1a2536] rounded-lg p-3 space-y-2">
                <h4 className="text-xs font-semibold text-slate-300">
                  Especificações dos Itens da Requisição:
                </h4>
                <div className="divide-y divide-[#172232] text-xs">
                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Tubos PEAD DN 400mm Corrugados (120 metros)</p>
                      <p className="text-[11px] text-slate-400">Polietileno de alta densidade NBR 8890, barra 6m</p>
                    </div>
                    <span className="font-mono text-slate-200">R$ 30.000,00</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Caixas Coletoras com Grelhas D400 (15 unidades)</p>
                      <p className="text-[11px] text-slate-400">Concreto pré-moldado classe pesada e ferro fundido</p>
                    </div>
                    <span className="font-mono text-slate-200">R$ 15.000,00</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  Edital de Pedido de Orçamento gerado com sucesso. Prosseguindo para a busca inteligente de fornecedores regionais homologados...
                </span>
              </div>
            </div>
          )}

          {/* PASSO 2: Busca de Fornecedores Próximos */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Varredura de Proximidade & Qualificação Regional
                  </h3>
                  <p className="text-xs text-slate-400">
                    O motor localizou {sc.suppliers.length} empresas homologadas aptas para a entrega no Corredor Oeste.
                  </p>
                </div>
                <span className="text-[11px] text-[#38bdf8] font-mono bg-[#0c1e30] px-2.5 py-1 rounded border border-[#16385a]">
                  Raio: Corredor Oeste / Cascavel / Toledo
                </span>
              </div>

              <div className="space-y-2.5">
                {sc.suppliers.map((sup) => (
                  <div
                    key={sup.id}
                    className={`p-3.5 rounded-lg border transition-all ${
                      sup.isMobilized
                        ? 'bg-[#0d1a21] border-emerald-600/70 ring-1 ring-emerald-500/30'
                        : 'bg-[#101722] border-[#1d2a3d]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{sup.name}</h4>
                          {sup.isMobilized && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                              <Zap className="w-3 h-3 fill-emerald-300" /> Mobilizado no Canteiro
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-300">
                          <span className="flex items-center gap-1 text-[#38bdf8]">
                            <MapPin className="w-3.5 h-3.5" /> {sup.location} ({sup.distance})
                          </span>
                          <span>• Prazo médio: {sup.leadDays} dias</span>
                        </div>
                        <p className="text-[11px] text-emerald-400 font-medium pt-0.5">
                          ✓ {sup.freightAdvantage}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 block">Conformidade</span>
                        <span className="text-xs font-bold text-emerald-400">Score {sup.score}/10</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded bg-[#101b2a] border border-[#1d3552] text-xs text-[#38bdf8] flex items-center justify-between">
                <span>
                  Disparo de solicitação de cotação executado para todos os fornecedores qualificados.
                </span>
                <span className="font-semibold text-white">Recebendo respostas...</span>
              </div>
            </div>
          )}

          {/* PASSO 3: Comparação de Cotações & Aceite */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Comparador de Cotações Recebidas ({sc.suppliers.length} Propostas)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Selecione qual proposta deseja homologar e dar o Aceite oficial.
                  </p>
                </div>
                <span className="text-xs text-emerald-400 font-medium">
                  Teto: R$ {sc.budgetBrl.toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {sc.suppliers.map((sup) => {
                  const isAccepted = acceptedSupplierId === sup.id;
                  const savings = sc.budgetBrl - sup.price;
                  const savingsPct = Math.round((savings / sc.budgetBrl) * 100);

                  return (
                    <div
                      key={sup.id}
                      onClick={() => setAcceptedSupplierId(sup.id)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                        isAccepted
                          ? 'bg-[#122030] border-[#0284c7] ring-2 ring-[#0284c7]/50'
                          : 'bg-[#0f1520] border-[#1c2738] hover:border-[#283950]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-white leading-tight">{sup.name}</h4>
                          {sup.isMobilized && (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                              Líder
                            </span>
                          )}
                        </div>

                        <div className="p-2 rounded bg-[#0b0f17] border border-[#192434]">
                          <span className="text-[10px] text-slate-400 block">Valor da Proposta</span>
                          <span className="text-sm font-bold text-white">
                            {sup.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-400 block">
                            {savings > 0 ? `Economia: -${savingsPct}%` : 'Sem desconto'}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-300 space-y-1">
                          <p>
                            <span className="text-slate-400">Prazo: </span>
                            <strong>{sup.leadDays} dias</strong>
                          </p>
                          <p>
                            <span className="text-slate-400">Local: </span>
                            {sup.location}
                          </p>
                          <p className="text-emerald-400 text-[10px] font-medium">
                            {sup.freightAdvantage}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#1a2536] mt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAcceptedSupplierId(sup.id);
                          }}
                          className={`w-full py-1.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                            isAccepted
                              ? 'bg-[#0284c7] text-white shadow-sm'
                              : 'bg-[#16202e] text-slate-300 hover:bg-[#202e42]'
                          }`}
                        >
                          {isAccepted ? '✓ Proposta Aceita' : 'Selecionar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between">
                <span>
                  Proposta de <strong>{chosenSupplier.name}</strong> aceita por{' '}
                  <strong>{chosenSupplier.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>.
                </span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-900/80 px-2 py-0.5 rounded">
                  Aceite Homologado
                </span>
              </div>
            </div>
          )}

          {/* PASSO 4: Emissão da Ordem de Compra (PO) */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-lg bg-[#0e1622] border border-[#1c2a3d] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#38bdf8] bg-[#0c1e30] px-2 py-0.5 rounded border border-[#16385a]">
                      {sc.poCode}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      Ordem de Compra Aprovada
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Vinculado a: {sc.rfqCode}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Fornecedor Contratado:</span>
                    <strong className="text-white text-sm">{chosenSupplier.name}</strong>
                    <p className="text-[11px] text-slate-400">CNPJ: 45.123.890/0001-12 • {chosenSupplier.location}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Montante Formal da PO:</span>
                    <p className="text-base font-bold text-white">
                      {chosenSupplier.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p className="text-[11px] font-mono text-[#38bdf8]">
                      ≈ {(chosenSupplier.price / 5.6).toFixed(2)} USDC / SPL Tokens
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0a0f17] border border-[#182333] grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Setor Requisitante</span>
                    <span className="text-slate-200 font-medium truncate block">{sc.sectorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Centro de Custo</span>
                    <span className="text-slate-200 font-mono font-medium">{sc.costCenter}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Prazo de Execução</span>
                    <span className="text-slate-200 font-medium">{chosenSupplier.leadDays} dias corridos</span>
                  </div>
                </div>

                {chosenSupplier.isMobilized && (
                  <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 fill-emerald-300 shrink-0" />
                    <span>Diferencial On-Site: Empresa já mobilizada no canteiro da ferrovia (Zero custo de frete e início imediato).</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded bg-[#101b2a] border border-[#1e3450] text-xs text-slate-300 flex items-center justify-between">
                <span>
                  Ordem de Compra formal emitida e assinada. Pronta para liquidação financeira via Solana Smart Escrow.
                </span>
              </div>
            </div>
          )}

          {/* PASSO 5: Pagamento On-Chain (Solana Settlement Layer) */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-lg bg-[#0b161f] border border-cyan-800/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-600 flex items-center justify-center text-cyan-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Liquidação Financeira On-Chain (Solana Smart Escrow)
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Liquidado com Sucesso
                  </span>
                </div>

                <div className="p-3 rounded bg-[#081017] border border-[#132738] space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Cluster Solana:</span>
                    <span className="text-emerald-400 font-bold">127.0.0.1:8899 / Devnet</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Ativo Utilizado:</span>
                    <span className="text-[#38bdf8] font-bold">SPL Token COOP (4Vi4Yt...LfiLMA)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Hash da Transação:</span>
                    <span className="text-cyan-300">4PT58t1KjT3P5UKXDmSSiqMY1vNEdezqYqWVd4PLgKLU...</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Slot Confirmado:</span>
                    <span className="text-white font-bold">#430 (Finalized)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>SPL Memo Imutável:</span>
                    <span className="text-slate-400 truncate max-w-xs">
                      {`PO:${sc.poCode} | CNPJ:45.123.890/0001-12 | ESCROW:8MJ17s`}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded bg-emerald-950/50 border border-emerald-800/80 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    Custódia garantida pelo protocolo! O fornecedor receberá a liberação dos tokens conforme as medições de entrega atestadas em campo.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Controles e Navegação */}
        <div className="p-4 border-t border-[#1c2636] bg-[#111722] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded bg-[#162232] hover:bg-[#1d2d42] text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Reiniciar Simulação"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-slate-400">
              {currentStep === 0 && 'Clique em Iniciar Simulação para rodar o fluxo completo dos 5 passos.'}
              {currentStep > 0 && currentStep < 5 && `Etapa ${currentStep} de 5: ${steps[currentStep - 1]?.title}`}
              {currentStep === 5 && 'Fluxo completo finalizado com sucesso!'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentStep === 0 && (
              <button
                onClick={handleStartSimulation}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Iniciar Simulação Automática</span>
              </button>
            )}

            {currentStep > 0 && currentStep < 5 && (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <span>Avançar para Etapa {currentStep + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 5 && (
              <button
                onClick={handleApplyToPlatform}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aplicar e Ver no Sistema (Ordens de Compra)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

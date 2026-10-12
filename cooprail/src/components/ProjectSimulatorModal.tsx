'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  FileEdit,
  FileCheck2,
  MessageSquareReply,
  CheckCircle2,
  ArrowRight,
  Play,
  RotateCcw,
  X
} from 'lucide-react';
import { RFQ, Task, Quote } from '@/lib/mockData';

interface ProjectSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteSimulation: (newRFQ: RFQ, newTask: Task) => void;
}

export function ProjectSimulatorModal({
  isOpen,
  onClose,
  onCompleteSimulation,
}: ProjectSimulatorModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  if (!isOpen) return null;

  const agents = [
    {
      step: 1,
      name: 'Agente 1: Análise de Compras',
      role: 'Monitoramento de Demanda e Estoque',
      icon: Search,
      color: '#38bdf8',
      action: 'Analisando demanda de manutenção preventiva da malha ferroviária...',
      output: {
        title: 'Necessidade Crítica Detectada',
        details: 'Demanda de 300 unidades de Molas Helicoidais de Suspensão Ferroviária (Aço 5160) para evitar parada preventiva da frota em 18 dias.',
        budget: 'Orçamento Máximo Estimado: R$ 45.000,00',
      },
    },
    {
      step: 2,
      name: 'Agente 2: Redator de RFQs',
      role: 'Geração de Escopo Técnico e Especificações',
      icon: FileEdit,
      color: '#a855f7',
      action: 'Estruturando minuta do RFQ-2026-002 segundo normas ABNT e ensaios de fadiga...',
      output: {
        title: 'RFQ-2026-002 Gerado com Sucesso',
        details: 'Escopo: Molas helicoidais com dureza 44-48 HRC, laudo de ensaio não-destrutivo por partículas magnéticas e tolerância dimensional Grau 1.',
        deliverable: 'Edital e especificações técnicas compiladas prontas para envio.',
      },
    },
    {
      step: 3,
      name: 'Agente 3: Leitor de Cotações',
      role: 'OCR, Extração e Comparação Analítica',
      icon: FileCheck2,
      color: '#059669',
      action: 'Extraindo dados de 2 propostas recebidas e calculando score de custo-benefício...',
      output: {
        title: 'Cotações Processadas & Comparadas',
        details: '• Metalúrgica Tubarão: R$ 43.200,00 (Prazo: 20 dias, Score: 7.9)\n• Molas Sul Industrial: R$ 39.800,00 (Prazo: 12 dias, Score: 9.4)',
        highlight: 'Molas Sul Industrial recomendada: Economia de R$ 5.200,00 (-11.5% do teto).',
      },
    },
    {
      step: 4,
      name: 'Agente 4: Negociador',
      role: 'Comunicação Estratégica com Fornecedor',
      icon: MessageSquareReply,
      color: '#d97706',
      action: 'Redigindo contraproposta para alinhamento de frete e faturamento...',
      output: {
        title: 'Minuta de Negociação Finalizada',
        details: 'E-mail de fechamento enviado ao fornecedor Molas Sul solicitando faturamento em 30/60 dias e entrega CIF no pátio central.',
        status: 'Nova tarefa criada para aprovação final na sua esteira "Precisa de você".',
      },
    },
  ];

  const handleStartSimulation = () => {
    setIsRunning(true);
    setCurrentStep(1);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 4) {
          clearInterval(stepInterval);
          setIsRunning(false);
          return 4;
        }
        return prev + 1;
      });
    }, 1800);
  };

  const handleApplyToPlatform = () => {
    const newSimulatedRFQ: RFQ = {
      id: `rfq-sim-${Date.now()}`,
      code: 'RFQ-2026-002',
      title: 'Molas Helicoidais de Suspensão Ferroviária',
      scope_description:
        'Aquisição urgente de molas em aço 5160 tratado com laudo de partículas magnéticas para manutenção de truques.',
      status: 'analyzing',
      deadline: '24/10/2026',
      target_delivery_date: '05/11/2026',
      estimated_budget: 45000.0,
      items: [
        {
          id: 'item-sim-1',
          item_name: 'Mola Helicoidal Eixo Primário',
          specification: 'Aço SAE 5160, ensaio fadiga 2M ciclos, dureza 44-48 HRC',
          quantity: 300,
          unit: 'unidades',
          target_unit_price: 150.0,
        },
      ],
      quotes: [
        {
          id: 'q-sim-1',
          rfq_id: 'rfq-sim-1',
          supplier_name: 'Molas Sul Industrial Ltda',
          supplier_rating: 4.9,
          total_amount: 39800.0,
          delivery_lead_time_days: 12,
          payment_terms: '30/60 dias',
          status: 'shortlisted',
          ai_score: 9.4,
          savings_percentage: 11.5,
          ai_analysis_summary:
            'Proposta excelente. Economia de 11.5% em relação ao orçamento teto com prazo de entrega recorde (12 dias).',
        },
        {
          id: 'q-sim-2',
          rfq_id: 'rfq-sim-1',
          supplier_name: 'Metalúrgica Tubarão Peças',
          supplier_rating: 4.3,
          total_amount: 43200.0,
          delivery_lead_time_days: 20,
          payment_terms: '28 dias',
          status: 'received',
          ai_score: 7.9,
          savings_percentage: 4.0,
          ai_analysis_summary:
            'Prazo mais dilatado (20 dias) e preço 8.5% acima da proposta líder da Molas Sul.',
        },
      ],
    };

    const newSimulatedTask: Task = {
      id: `task-sim-${Date.now()}`,
      title: 'Aprovar Pedido de Compra para RFQ-2026-002 (Molas Helicoidais)',
      description:
        'Os 4 agentes concluíram o ciclo de compras. Fornecedor Molas Sul Industrial selecionado com R$ 5.200,00 de economia e entrega em 12 dias.',
      status: 'needs_you',
      priority: 'urgent',
      category: 'quote_decision',
      due_date: 'Hoje',
      badge_text: 'Decisão Imediata',
    };

    onCompleteSimulation(newSimulatedRFQ, newSimulatedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0c1017] border border-[#223043] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Topo do Modal */}
        <div className="p-4 border-b border-[#1c2636] flex items-center justify-between bg-[#111722]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#0284c7] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Simulador de Ciclo de Compras com os 4 Agentes
              </h2>
              <p className="text-xs text-slate-400">
                Observe a colaboração autônoma dos micro-serviços de IA em um projeto real.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo: Timeline dos 4 Agentes */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isCompleted = currentStep > agent.step;
            const isCurrent = currentStep === agent.step;
            const isPending = currentStep < agent.step;

            return (
              <div
                key={agent.step}
                className={`p-3.5 rounded border transition-all ${
                  isCurrent
                    ? 'border-[#0284c7] bg-[#131d2b] ring-1 ring-[#0284c7]/40'
                    : isCompleted
                    ? 'border-[#1e2d3f] bg-[#0f1520]'
                    : 'border-[#17212e] bg-[#0a0e15] opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-white"
                      style={{ backgroundColor: agent.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{agent.name}</h4>
                      <p className="text-[10px] text-slate-400">{agent.role}</p>
                    </div>
                  </div>

                  {isCompleted && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                    </span>
                  )}
                  {isCurrent && isRunning && (
                    <span className="flex items-center gap-1.5 text-[10px] text-[#38bdf8] font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" /> Processando...
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[10px] text-slate-600">Aguardando etapa anterior</span>
                  )}
                </div>

                {/* Conteúdo da etapa */}
                {(isCompleted || isCurrent) && (
                  <div className="mt-2.5 pt-2 border-t border-[#1a2536] text-xs space-y-1">
                    <p className="font-semibold text-slate-200">{agent.output.title}</p>
                    <p className="text-slate-300 text-[11px] whitespace-pre-line leading-relaxed">
                      {agent.output.details}
                    </p>
                    {agent.output.highlight && (
                      <p className="text-emerald-400 font-semibold text-[11px] pt-0.5">
                        {agent.output.highlight}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rodapé com Controles */}
        <div className="p-4 border-t border-[#1c2636] bg-[#111722] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {currentStep === 0 && 'Clique em Iniciar Simulação para rodar o pipeline dos 4 agentes.'}
            {currentStep > 0 && currentStep < 4 && `Executando Agente ${currentStep} de 4...`}
            {currentStep === 4 && 'Ciclo concluído com sucesso pelos 4 agentes!'}
          </div>

          <div className="flex items-center gap-2">
            {currentStep === 0 && (
              <button
                onClick={handleStartSimulation}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Iniciar Simulação</span>
              </button>
            )}

            {currentStep === 4 && (
              <button
                onClick={handleApplyToPlatform}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Incorporar Projeto na Plataforma</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

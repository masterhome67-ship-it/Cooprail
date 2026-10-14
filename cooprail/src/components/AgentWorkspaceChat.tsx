'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  FileText,
  Zap,
  ShieldCheck,
  Send,
  UploadCloud,
  Plus,
  Bot,
  User,
  Sparkles,
  Camera,
  X,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { ChatMessage } from '@/lib/mockData';
import { Language } from '@/lib/translations';

export interface SpecializedAgent {
  id: string;
  name: string;
  roleTag: string;
  slashCommand: string;
  badge: string;
  shortDesc: string;
  fullDesc: string;
  themeColor: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  icon: React.ElementType;
  quickPrompts: { label: string; prompt: string }[];
}

export const SPECIALIZED_AGENTS: SpecializedAgent[] = [
  {
    id: 'supplies',
    name: 'Agente de Suprimentos & Peças',
    roleTag: 'Módulo de Busca de Fornecedores & Peças',
    slashCommand: '/busca',
    badge: 'Catálogo & Canteiro In-Loco',
    shortDesc: 'Localiza fornecedores homologados e prestadores já mobilizados nos canteiros com frete zero.',
    fullDesc: 'Especialista em busca inteligente de catálogo, peças técnicas industriais e sinergia de contratos ativos nas unidades de campo.',
    themeColor: '#0284c7',
    borderColor: 'border-sky-300',
    bgColor: 'bg-sky-50',
    textColor: 'text-[#0284c7]',
    icon: Search,
    quickPrompts: [
      {
        label: 'Prestadores no Canteiro',
        prompt: '/busca quais empresas já estão prestando serviço no canteiro de obras?',
      },
      {
        label: 'Tubos PEAD e Válvulas',
        prompt: '/busca fornecedores homologados de tubos PEAD de alta densidade e válvulas de retenção',
      },
      {
        label: 'Fornecedores em Cascavel/PR',
        prompt: '/busca fornecedores locais na região Oeste do PR com entrega imediata',
      },
    ],
  },
  {
    id: 'rfqs',
    name: 'Agente de Demandas & RFQs',
    roleTag: 'Módulo de Organização de Demandas',
    slashCommand: '/demandas',
    badge: 'Estruturação & Editais',
    shortDesc: 'Estrutura editais de cotação técnica, agrupando necessidades dos setores operacionais.',
    fullDesc: 'Transforma solicitações soltas em requisições de compra (RFQs) estruturadas, com memorial técnico e teto de gastos.',
    themeColor: '#4f46e5',
    borderColor: 'border-indigo-300',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    icon: FileText,
    quickPrompts: [
      {
        label: 'Minuta de Manutenção',
        prompt: '/demandas estruturar edital de cotação para manutenção preventiva de rodeiros e truques ferroviários',
      },
      {
        label: 'Cabos de Sinalização',
        prompt: '/demandas especificar compra técnica de 2.000m de cabos de sinalização para o Setor Central',
      },
      {
        label: 'Consolidar Demandas',
        prompt: '/demandas consolidar solicitações pendentes dos setores operacionais',
      },
    ],
  },
  {
    id: 'finance',
    name: 'Agente Financeiro & Solana B2B',
    roleTag: 'Módulo de Pedidos & Ordens de Compra',
    slashCommand: '/pedido',
    badge: 'Smart Escrow & USDC',
    shortDesc: 'Estrutura ordens formais (PO) e executa liquidação instantânea on-chain na Solana.',
    fullDesc: 'Conecta o aceite da melhor cotação à emissão de Purchase Orders (POs) com liquidação sub-segundo em USDC e SPL Memo.',
    themeColor: '#059669',
    borderColor: 'border-emerald-300',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    icon: Zap,
    quickPrompts: [
      {
        label: 'Como Funciona a Liquidação?',
        prompt: '/pedido como funciona a liquidação instantânea em USDC na Solana com comprovante on-chain?',
      },
      {
        label: 'Economia vs TED/Boleto',
        prompt: '/pedido qual a economia estimada de taxas e tempo ao usar liquidação on-chain para grandes fornecedores?',
      },
      {
        label: 'Emitir PO da Melhor Oferta',
        prompt: '/pedido emitir ordem de compra formal para a cotação aprovada na esteira',
      },
    ],
  },
  {
    id: 'compliance',
    name: 'Agente de Compliance & Auditoria',
    roleTag: 'Módulo de Controle & Compliance',
    slashCommand: '/controle',
    badge: 'Governança & Alçadas',
    shortDesc: 'Audita pendências na esteira de compras, limites orçamentários e centros de custo.',
    fullDesc: 'Verifica conformidade fiscal, exigências de certificações ISO e respeita as alçadas de diretoria de cada centro de custo.',
    themeColor: '#d97706',
    borderColor: 'border-amber-300',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: ShieldCheck,
    quickPrompts: [
      {
        label: 'Auditar Centro de Custo',
        prompt: '/controle auditar limite orçamentário e saldo disponível do Centro de Custo 2100',
      },
      {
        label: 'Conformidade Fiscal',
        prompt: '/controle validar situação cadastral e certidões dos fornecedores cotados',
      },
      {
        label: 'Alçadas de Aprovação',
        prompt: '/controle quais os níveis de aprovação necessários para compras acima de R$ 100.000,00?',
      },
    ],
  },
];

interface AgentWorkspaceChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, slashCommand?: string, imageBase64?: string) => Promise<void> | void;
  onActionClick: (action: string) => void;
  onOpenUploadDoc: () => void;
  onNewRFQ: () => void;
  lang: Language;
}

export function AgentWorkspaceChat({
  messages,
  onSendMessage,
  onActionClick,
  onOpenUploadDoc,
  onNewRFQ,
  lang,
}: AgentWorkspaceChatProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('supplies');
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeAgent =
    SPECIALIZED_AGENTS.find((a) => a.id === selectedAgentId) || SPECIALIZED_AGENTS[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSubmitting]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if ((!text && !selectedImage) || isSubmitting) return;

    let slashCmd = activeAgent.slashCommand;
    if (text.startsWith('/')) {
      const firstWord = text.split(' ')[0].toLowerCase();
      if (['/busca', '/demandas', '/pedido', '/controle', '/compare'].includes(firstWord)) {
        slashCmd = firstWord;
      }
    }

    const currentImg = selectedImage;
    setIsSubmitting(true);
    setInputText('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      await onSendMessage(
        text || 'Por favor, identifique visualmente esta peça, normas técnicas e fornecedores homologados ou de mercado.',
        slashCmd,
        currentImg || undefined
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col">
      {/* 1. Header do Hub: Seletor de Agentes Separados */}
      <div className="border-b border-slate-200 bg-slate-50/80 p-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-[#0284c7]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900">
                  Centro de Início por Agentes Especializados
                </h3>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold px-2 py-0.2 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  4 Agentes Ativos
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Selecione o agente especialista pelo qual deseja iniciar sua operação:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenUploadDoc}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Importar Proposta em PDF"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
              <span>Anexar PDF</span>
            </button>
            <button
              onClick={onNewRFQ}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Pedido (RFQ)</span>
            </button>
          </div>
        </div>

        {/* Grade de Seleção dos 4 Agentes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
          {SPECIALIZED_AGENTS.map((agent) => {
            const Icon = agent.icon;
            const isSelected = agent.id === selectedAgentId;

            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer relative ${
                  isSelected
                    ? `bg-white ${agent.borderColor} shadow-xs ring-1 ring-[#0284c7]/30`
                    : 'bg-white/60 hover:bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected ? `${agent.bgColor} ${agent.textColor}` : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {agent.name.replace('Agente de ', '')}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1 leading-tight">
                      {agent.shortDesc}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg bg-[#0284c7]`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Banner do Agente Ativo & Sugestões de Ação Rápida */}
      <div className="px-4 py-2 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${activeAgent.bgColor} ${activeAgent.textColor}`}
          >
            <activeAgent.icon className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">{activeAgent.name}</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${activeAgent.bgColor} ${activeAgent.textColor} ${activeAgent.borderColor}`}
              >
                {activeAgent.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Chips de Ações Rápidas (1 clique para começar) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold text-slate-600 mr-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#0284c7]" />
            Começar:
          </span>
          {activeAgent.quickPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 text-slate-700 hover:text-[#0284c7] font-medium transition-all cursor-pointer shadow-2xs"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Área de Conversa e Feed de Mensagens */}
      <div className="p-4 max-h-[300px] min-h-[160px] overflow-y-auto space-y-3 bg-slate-50/40">
        {messages.length === 0 ? (
          <div className="py-4 text-center space-y-1.5">
            <div className="w-9 h-9 rounded-full bg-sky-50 text-[#0284c7] mx-auto flex items-center justify-center border border-sky-200">
              <activeAgent.icon className="w-4 h-4" />
            </div>
            <div className="max-w-md mx-auto space-y-0.5">
              <h4 className="text-xs font-bold text-slate-800">
                Inicie uma solicitação com o {activeAgent.name}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Digite sua necessidade abaixo, clique em um atalho ou use a <strong>câmera</strong> para tirar foto de uma peça e identificá-la.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender_role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 text-xs animate-in fade-in ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-lg bg-sky-100 text-[#0284c7] flex items-center justify-center shrink-0 border border-sky-200">
                    <Bot className="w-3 h-3" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-xl p-3 shadow-2xs space-y-2 ${
                    isUser
                      ? 'bg-[#0284c7] text-white'
                      : 'bg-white text-slate-800 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-75">
                    <span className="font-semibold">
                      {isUser ? 'Você' : msg.slash_command || activeAgent.name}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Foto da Peça anexada pelo usuário */}
                  {msg.image_url && (
                    <div className="pt-1">
                      <img
                        src={msg.image_url}
                        alt="Foto da peça"
                        className="max-h-48 max-w-full rounded-lg border border-slate-200/50 object-cover shadow-2xs"
                      />
                    </div>
                  )}

                  <p className="whitespace-pre-wrap leading-relaxed font-sans">{msg.content}</p>

                  {/* Card de Ação Integrado (quando gerado pelo agente) */}
                  {msg.action_card && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 space-y-2">
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span>{msg.action_card.title}</span>
                      </div>

                      {msg.action_card.metrics && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
                          {msg.action_card.metrics.map((m, i) => (
                            <div key={i} className="bg-white p-1 rounded border border-slate-100">
                              <span className="text-slate-500 block text-[9px]">{m.label}</span>
                              <span className="font-bold text-slate-900">{m.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.action_card.actions && (
                        <div className="flex gap-2 pt-0.5">
                          {msg.action_card.actions.map((act, i) => (
                            <button
                              key={i}
                              onClick={() => onActionClick(act.action)}
                              className="px-2.5 py-1 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-[10px] font-semibold transition-colors cursor-pointer shadow-xs"
                            >
                              {act.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isSubmitting && (
          <div className="flex gap-2.5 text-xs animate-in fade-in">
            <div className="w-6 h-6 rounded-lg bg-sky-100 text-[#0284c7] flex items-center justify-center shrink-0 border border-sky-200">
              <Bot className="w-3 h-3" />
            </div>
            <div className="bg-white text-slate-600 border border-slate-200 rounded-xl p-2.5 shadow-2xs flex items-center gap-2">
              <RefreshCw className="w-3 h-3 text-[#0284c7] animate-spin" />
              <span>O {activeAgent.name} está analisando os dados e buscando mercado...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Barra de Input Interativa com Botão de Câmera / Foto de Peça */}
      <div className="p-2.5 border-t border-slate-200 bg-white">
        {/* Preview da Imagem Selecionada */}
        {selectedImage && (
          <div className="mb-2 p-2 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={selectedImage}
                alt="Peça"
                className="w-10 h-10 object-cover rounded-md border border-sky-300"
              />
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-900 block truncate">
                  Foto da Peça Anexada
                </span>
                <span className="text-[10px] text-slate-500">
                  A IA inspecionará o componente e normas aplicáveis
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedImage(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
              title="Remover foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Input oculto para upload de imagem ou captura de câmera */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              selectedImage
                ? 'bg-sky-100 text-[#0284c7] border-sky-300'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title="Tirar Foto ou Enviar Imagem da Peça"
          >
            <Camera className="w-4 h-4 text-[#0284c7]" />
            <span className="hidden md:inline text-[11px]">Foto da Peça</span>
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              placeholder={
                selectedImage
                  ? 'Foto anexada! Pressione Enviar ou adicione detalhes da peça...'
                  : `Pergunte ao ${activeAgent.name} (ex: buscar peças, estruturar RFQ, auditar)...`
              }
              className="w-full pl-3 pr-20 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-[9px] font-mono text-slate-500 bg-white border border-slate-200 px-1 py-0.5 rounded shadow-2xs hidden sm:inline">
                Enter ↵
              </span>
            </div>
          </div>

          <button
            onClick={() => handleSend()}
            disabled={(!inputText.trim() && !selectedImage) || isSubmitting}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              (inputText.trim() || selectedImage) && !isSubmitting
                ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

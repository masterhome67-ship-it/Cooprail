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
    name: 'Agente de Suprimentos & Mercado',
    roleTag: 'Módulo de Busca de Fornecedores & Peças',
    slashCommand: '/busca',
    badge: 'Catálogo & Canteiro',
    shortDesc: 'Localiza fornecedores, distribuidoras e cotações de insumos.',
    fullDesc: 'Pesquisa inteligente de fornecedores locais, consulta de distribuidores e cotação de materiais e insumos para canteiro.',
    themeColor: '#0284c7',
    borderColor: 'border-sky-300',
    bgColor: 'bg-sky-50',
    textColor: 'text-[#0284c7]',
    icon: Search,
    quickPrompts: [
      {
        label: 'Buscar Fornecedores Locais',
        prompt: '/busca fornecedores e distribuidoras com pronta-entrega na região',
      },
      {
        label: 'Cotar Insumos e Materiais',
        prompt: '/busca cotação de insumos para canteiro de obras com frete incluso',
      },
      {
        label: 'Consultar Situação de CNPJ',
        prompt: '/busca consultar dados cadastrais e conformidade de fornecedor por CNPJ',
      },
    ],
  },
  {
    id: 'rfqs',
    name: 'Agente de Demandas & RFQs',
    roleTag: 'Módulo de Organização de Demandas',
    slashCommand: '/demandas',
    badge: 'Estruturação & Editais',
    shortDesc: 'Estrutura pedidos de cotação e especificações técnicas.',
    fullDesc: 'Transforma necessidades de compra em requisições de cotação (RFQs) estruturadas, com memorial técnico e teto orçamentário.',
    themeColor: '#4f46e5',
    borderColor: 'border-indigo-300',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    icon: FileText,
    quickPrompts: [
      {
        label: 'Nova Cotação de Cimento',
        prompt: '/demandas cotar 50 sacos de cimento Portland para entrega imediata',
      },
      {
        label: 'Estruturar Nova RFQ',
        prompt: '/demandas criar requisição técnica de compra com memorial descritivo',
      },
      {
        label: 'Consolidar Demandas',
        prompt: '/demandas consolidar solicitações de materiais e verificar centros de custo',
      },
    ],
  },
  {
    id: 'finance',
    name: 'Agente Financeiro & Solana B2B',
    roleTag: 'Módulo de Pedidos & Ordens de Compra',
    slashCommand: '/pedido',
    badge: 'Smart Escrow & PO',
    shortDesc: 'Emite ordens de compra e executa liquidação formal.',
    fullDesc: 'Conecta o aceite da cotação à emissão de Purchase Orders (POs) formais com liquidação garantida via Solana Smart Escrow.',
    themeColor: '#059669',
    borderColor: 'border-emerald-300',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    icon: Zap,
    quickPrompts: [
      {
        label: 'Como Funciona o Smart Escrow',
        prompt: '/pedido como funciona a garantia on-chain com Solana Smart Escrow?',
      },
      {
        label: 'Emitir Ordem de Compra (PO)',
        prompt: '/pedido emitir Purchase Order formal para a proposta aprovada',
      },
      {
        label: 'Vantagens de Liquidação On-Chain',
        prompt: '/pedido quais as vantagens e taxas de liquidação instantânea via Solana?',
      },
    ],
  },
  {
    id: 'compliance',
    name: 'Agente de Compliance & Auditoria',
    roleTag: 'Módulo de Controle & Compliance',
    slashCommand: '/controle',
    badge: 'Governança & Alçadas',
    shortDesc: 'Audita conformidade fiscal, limites orçamentários e alçadas.',
    fullDesc: 'Audita notas fiscais, situação na Receita Federal/SEFAZ e valida limites orçamentários antes do fechamento.',
    themeColor: '#d97706',
    borderColor: 'border-amber-300',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: ShieldCheck,
    quickPrompts: [
      {
        label: 'Auditar Situação Cadastral',
        prompt: '/controle verificar certidões negativas e conformidade de fornecedor',
      },
      {
        label: 'Auditoria de Centro de Custo',
        prompt: '/controle auditar limites orçamentários e saldo disponível do centro de custo',
      },
      {
        label: 'Alçadas de Aprovação',
        prompt: '/controle quais os níveis de aprovação necessários para compras corporativas?',
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
      {/* 1. Header do Hub: Central de Agentes */}
      <div className="border-b border-slate-200 bg-slate-50/80 p-3 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-[#0284c7] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900">
                  Central de Agentes Especializados
                </h3>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  4 Agentes Ativos
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Selecione a especialidade para operar cotações, demandas, pagamentos ou compliance:
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

        {/* Barra de Seleção dos 4 Agentes com Abas Elegantes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {SPECIALIZED_AGENTS.map((agent) => {
            const Icon = agent.icon;
            const isSelected = agent.id === selectedAgentId;

            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? `bg-white ${agent.borderColor} shadow-xs ring-2 ring-[#0284c7]/20`
                    : 'bg-white/70 hover:bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? `${agent.bgColor} ${agent.textColor}` : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {agent.name.replace('Agente de ', '')}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border shrink-0 ${
                      isSelected
                        ? `${agent.bgColor} ${agent.textColor} ${agent.borderColor}`
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    {agent.slashCommand}
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 line-clamp-1 leading-snug">
                  {agent.shortDesc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Faixa do Agente Ativo: Capacidade e Ações Rápidas */}
      <div className="px-4 py-2 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-bold text-slate-800 shrink-0">{activeAgent.name}:</span>
          <span className="text-[11px] text-slate-500 truncate">{activeAgent.fullDesc}</span>
        </div>

        {/* Chips de Ações Rápidas (1 clique para começar) */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#0284c7]" />
            Ações Rápidas:
          </span>
          {activeAgent.quickPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              className="text-[10px] px-2.5 py-1 rounded-md bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-700 hover:text-[#0284c7] font-medium transition-all cursor-pointer shadow-2xs"
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

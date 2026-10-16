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
  RotateCcw,
  ChevronUp,
  FileEdit,
  ScanText,
  ShoppingBag,
  BarChart3,
  CornerDownRight,
  Paperclip,
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
  icon: React.ElementType;
}

export const SPECIALIZED_AGENTS: SpecializedAgent[] = [
  {
    id: 'supplies',
    name: 'Busca de Fornecedores & Mercado',
    roleTag: 'Módulo de Busca de Fornecedores & Peças',
    slashCommand: '/busca',
    badge: 'Catálogo & Mercado',
    shortDesc: 'Localiza distribuidores locais, fornecedores no canteiro e cotações de insumos.',
    fullDesc: 'Pesquisa inteligente de fornecedores locais, consulta de distribuidores e cotação de materiais e insumos para canteiro.',
    icon: Search,
  },
  {
    id: 'rfqs',
    name: 'Redator de RFQs & Demandas',
    roleTag: 'Módulo de Organização de Demandas',
    slashCommand: '/demandas',
    badge: 'Estruturação & Editais',
    shortDesc: 'Estrutura editais de cotação técnica com memorial descritivo e normas ABNT.',
    fullDesc: 'Transforma necessidades de compra em requisições de cotação (RFQs) estruturadas, com memorial técnico e teto orçamentário.',
    icon: FileEdit,
  },
  {
    id: 'comparator',
    name: 'Leitor de Cotações & Comparador',
    roleTag: 'Módulo de Comparação de Cotações',
    slashCommand: '/compare',
    badge: 'Propostas & Análise',
    shortDesc: 'Cruza propostas do Portal do Parceiro, planilhas e identifica o menor preço.',
    fullDesc: 'Lê e normaliza propostas comerciais de fornecedores, comparando preço unitário, frete e prazos de entrega.',
    icon: ScanText,
  },
  {
    id: 'finance',
    name: 'Ordens de Compra & Liquidação',
    roleTag: 'Módulo de Pedidos & Ordens de Compra',
    slashCommand: '/pedido',
    badge: 'Smart Escrow & PO',
    shortDesc: 'Emite Purchase Orders formais e executa garantia on-chain via Solana.',
    fullDesc: 'Conecta o aceite da cotação à emissão de Purchase Orders (POs) formais com liquidação garantida via Solana Smart Escrow.',
    icon: ShoppingBag,
  },
  {
    id: 'compliance',
    name: 'Compliance & Auditoria Fiscal',
    roleTag: 'Módulo de Controle & Compliance',
    slashCommand: '/controle',
    badge: 'Receita & SEFAZ',
    shortDesc: 'Valida CNPJ na Receita Federal e cruza notas SEFAZ com Certificado Digital A1.',
    fullDesc: 'Audita notas fiscais, situação na Receita Federal/SEFAZ e valida limites orçamentários antes do fechamento.',
    icon: ShieldCheck,
  },
  {
    id: 'budget',
    name: 'Controle Orçamentário & Centros de Custo',
    roleTag: 'Módulo de Controle & Compliance',
    slashCommand: '/controle',
    badge: 'Alçadas & Verba',
    shortDesc: 'Audita saldo orçamentário disponível e alçadas de aprovação por diretoria.',
    fullDesc: 'Monitora centros de custo operacionais, saldos remanescentes e evita estouro de verba em compras industriais.',
    icon: BarChart3,
  },
];

export const STARTER_ACTIONS = [
  {
    label: 'Pesquisar fornecedores e distribuidores de insumos na região',
    prompt: '/busca fornecedores e distribuidores com pronta-entrega na região',
    agentId: 'supplies',
  },
  {
    label: 'Estruturar edital de cotação para nova demanda de obra',
    prompt: '/demandas criar edital de cotação técnica com memorial descritivo',
    agentId: 'rfqs',
  },
  {
    label: 'Como estão as propostas recebidas no Portal do Parceiro?',
    prompt: '/compare como estão as propostas dos fornecedores para as RFQs abertas?',
    agentId: 'comparator',
  },
  {
    label: 'Auditar situação cadastral de fornecedor e notas na SEFAZ',
    prompt: '/controle auditar certidões de fornecedor e status na Receita Federal',
    agentId: 'compliance',
  },
  {
    label: 'Quais ordens de compra precisam da minha aprovação hoje?',
    prompt: '/pedido listar ordens de compra e decisões pendentes de aprovação',
    agentId: 'finance',
  },
];

interface AgentWorkspaceChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, slashCommand?: string, imageBase64?: string) => Promise<void> | void;
  onClearChat?: () => void;
  onActionClick: (action: string) => void;
  onOpenUploadDoc: () => void;
  onNewRFQ: () => void;
  lang: Language;
}

export function AgentWorkspaceChat({
  messages,
  onSendMessage,
  onClearChat,
  onActionClick,
  onOpenUploadDoc,
  onNewRFQ,
  lang,
}: AgentWorkspaceChatProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('supplies');
  const [isAgentsOpen, setIsAgentsOpen] = useState<boolean>(true);
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
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col flex-1 h-full min-h-0">
      {/* 1. Barra de Cabeçalho com Seção Retrátil de Agentes (FIXO NO TOPO) */}
      <div className="shrink-0 border-b border-slate-200 bg-slate-50/70 p-3 sm:px-4">
        <div className="flex items-center justify-between gap-3">
          {/* Botão de Toggle "Agentes ^" */}
          <button
            type="button"
            onClick={() => setIsAgentsOpen(!isAgentsOpen)}
            className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-[#0284c7] transition-colors cursor-pointer group"
          >
            <span>Agentes Especializados</span>
            <span className="text-[10px] bg-sky-100 text-[#0284c7] font-mono px-1.5 py-0.2 rounded-full font-semibold">
              6 disponíveis
            </span>
            <ChevronUp
              className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284c7] transition-transform duration-200 ${
                isAgentsOpen ? '' : 'rotate-180'
              }`}
            />
          </button>

          {/* Ações Rápidas de Topo */}
          <div className="flex items-center gap-2">
            {onClearChat && (
              <button
                type="button"
                onClick={onClearChat}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Limpar consultas e iniciar nova pesquisa"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Nova Pesquisa</span>
              </button>
            )}
            <button
              onClick={onOpenUploadDoc}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Importar Proposta em PDF"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Anexar PDF</span>
            </button>
            <button
              onClick={onNewRFQ}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Pedido (RFQ)</span>
            </button>
          </div>
        </div>

        {/* 2. Lista Central de Agentes em 2 Colunas Limpas (Estilo Bido Minimalista) */}
        {isAgentsOpen && (
          <div className="mt-3 pt-3 border-t border-slate-200/80 animate-in fade-in duration-200 space-y-3 max-h-[36vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {SPECIALIZED_AGENTS.map((agent) => {
                const Icon = agent.icon;
                const isSelected = agent.id === selectedAgentId;

                return (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgentId(agent.id);
                      setInputText(`${agent.slashCommand} `);
                    }}
                    className={`flex items-start gap-2.5 p-2 rounded-lg text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50/80 text-[#0284c7] font-semibold ring-1 ring-sky-200'
                        : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#0284c7]' : 'text-slate-400'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-medium truncate">{agent.name}</span>
                        <span className="text-[10px] font-mono text-slate-600 bg-white border border-slate-200 px-1 py-0.2 rounded shrink-0">
                          {agent.slashCommand}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 line-clamp-1 mt-0.5">
                        {agent.shortDesc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sugestões de Ações Rápidas com ↳ */}
            <div className="pt-2 border-t border-slate-200/60 space-y-1">
              {STARTER_ACTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedAgentId(item.agentId);
                    handleSend(item.prompt);
                  }}
                  className="w-full flex items-center gap-2 text-left py-1 px-1.5 rounded hover:bg-slate-100 text-[11px] text-slate-600 hover:text-[#0284c7] transition-colors cursor-pointer group"
                >
                  <span className="text-slate-600 group-hover:text-[#0284c7] font-mono">↳</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Área de Conversa e Feed de Mensagens (ROLAGEM EXCLUSIVA DESTE BLOCO) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="py-6 text-center space-y-1.5">
            <div className="w-9 h-9 rounded-full bg-sky-50 text-[#0284c7] mx-auto flex items-center justify-center border border-sky-200">
              <Bot className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              Copiloto Operacional de Compras Pronto
            </p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Selecione um agente acima ou clique em uma das ações com ↳ para iniciar sua cotação.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender_role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-lg bg-sky-100 text-[#0284c7] flex items-center justify-center shrink-0 border border-sky-200">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3 shadow-2xs space-y-2 ${
                    isUser
                      ? 'bg-[#0284c7] text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {/* Badge de papel/comando se houver */}
                  {msg.slash_command && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
                          isUser
                            ? 'bg-sky-600 border-sky-500 text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        {msg.slash_command}
                      </span>
                      <span
                        className={`text-[9px] ${
                          isUser ? 'text-sky-200' : 'text-slate-600'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  )}

                  {/* Foto de peça anexada na mensagem */}
                  {msg.image_url && (
                    <div className="rounded-lg overflow-hidden border border-slate-200 max-w-xs mb-1">
                      <img
                        src={msg.image_url}
                        alt="Peça Anexada"
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}

                  <div className="whitespace-pre-wrap leading-relaxed text-xs">
                    {msg.content}
                  </div>

                  {/* Card Interativo de Decisão */}
                  {msg.action_card && (
                    <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-slate-900 truncate">
                          {msg.action_card.title}
                        </span>
                      </div>

                      {msg.action_card.metrics && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
                          {msg.action_card.metrics.map((m, idx) => (
                            <div key={idx} className="bg-white p-1.5 rounded border border-slate-200">
                              <span className="text-slate-500 block truncate">{m.label}</span>
                              <span className="font-bold text-slate-900 block truncate">{m.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.action_card.actions && (
                        <div className="flex items-center gap-1.5 pt-1">
                          {msg.action_card.actions.map((act, idx) => (
                            <button
                              key={idx}
                              onClick={() => onActionClick(act.action)}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                                idx === 0
                                  ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-2xs'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
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

      {/* 4. Barra de Input Interativa com Ícone de Anexo / Câmera (FIXO NA PARTE INFERIOR) */}
      <div className="shrink-0 p-2.5 border-t border-slate-200 bg-white">
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
            title="Anexar Imagem / Foto Técnica de Peça"
          >
            <Paperclip className="w-4 h-4 text-[#0284c7]" />
            <span className="hidden md:inline text-[11px]">Anexar</span>
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              placeholder="Pergunte qualquer coisa — digite / para habilidades dos agentes..."
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

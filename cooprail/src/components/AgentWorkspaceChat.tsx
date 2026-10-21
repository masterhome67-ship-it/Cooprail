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
import ReactMarkdown from 'react-markdown';

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
    name: 'Ordens de Compra & Faturamento',
    roleTag: 'Módulo de Pedidos & Ordens de Compra',
    slashCommand: '/pedido',
    badge: 'Faturamento & PO',
    shortDesc: 'Emite Purchase Orders formais e autorizações de fornecimento B2B.',
    fullDesc: 'Conecta o aceite da cotação à emissão de Purchase Orders (POs) formais com faturamento direto e boleto corporativo.',
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
  const [selectedAgentId, setSelectedAgentId] = useState<string>('auto');
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSubmitting]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setSelectedImage(compressedDataUrl);
        } else {
          setSelectedImage(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if ((!text && !selectedImage) || isSubmitting) return;

    let slashCmd: string | undefined = undefined;
    if (selectedAgentId === 'supplies') slashCmd = '/busca';
    else if (selectedAgentId === 'rfqs') slashCmd = '/demandas';
    else if (selectedAgentId === 'comparator') slashCmd = '/compare';
    else if (selectedAgentId === 'compliance') slashCmd = '/controle';
    else if (selectedAgentId === 'finance') slashCmd = '/pedido';

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
      {/* 1. Barra de Cabeçalho Executiva (Limpa e Focada) */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284c7] flex items-center justify-center border border-sky-200 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-900">
                  Assistente Autônomo de Suprimentos
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Pesquisa regional de mercado, cotações e análise de fornecedores
              </p>
            </div>
          </div>

          {/* Ações Rápidas de Topo */}
          <div className="flex items-center gap-2">
            {onClearChat && (
              <button
                type="button"
                onClick={onClearChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Limpar conversa e iniciar nova pesquisa"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Nova Pesquisa</span>
              </button>
            )}
            <button
              onClick={onOpenUploadDoc}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Importar Proposta em PDF"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
              <span>Anexar Proposta (PDF)</span>
            </button>
          </div>
        </div>
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
                  {/* Topo da Mensagem: Badge de comando / Selo de IA / Timestamp */}
                  {!isUser && (
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      {msg.slash_command && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border font-semibold bg-slate-100 border-slate-200 text-slate-700">
                          {msg.slash_command}
                        </span>
                      )}

                      {/* Selo pequeno de IA ou Modo Contingência */}
                      {msg.provider && msg.provider !== 'local_fallback' ? (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-sky-50 text-[#0284c7] border border-sky-200">
                          IA · {msg.modelUsed || 'Online'}
                        </span>
                      ) : msg.provider === 'local_fallback' ? (
                        <span
                          title={msg.fallbackReason || 'IA temporariamente indisponível'}
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 cursor-help"
                        >
                          ⚠ Modo contingência
                        </span>
                      ) : null}

                      <span className="text-[9px] text-slate-500">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}

                  {isUser && msg.slash_command && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold bg-sky-600 border-sky-500 text-white">
                        {msg.slash_command}
                      </span>
                      <span className="text-[9px] text-sky-200">
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

                  {/* Conteúdo da mensagem (ReactMarkdown para o assistente) */}
                  <div className="leading-relaxed text-xs">
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div className="space-y-1.5 break-words">
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => <p className="mb-1.5 last:mb-0 leading-relaxed" {...props} />,
                            strong: ({ node, ...props }) => (
                              <strong className="font-semibold text-slate-900" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul className="list-disc pl-4 space-y-0.5 my-1 text-slate-700" {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol className="list-decimal pl-4 space-y-0.5 my-1 text-slate-700" {...props} />
                            ),
                            li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                            code: ({ node, ...props }) => (
                              <code
                                className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800"
                                {...props}
                              />
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
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
              <span>O Assistente de Suprimentos está analisando as especificações e pesquisando mercado...</span>
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

        {/* Pílulas de Modos Especializados (Discretas e sem poluição) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] mb-2">
          <button
            type="button"
            onClick={() => setSelectedAgentId('auto')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              selectedAgentId === 'auto'
                ? 'bg-[#0284c7] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            ⚡ Automático (IA)
          </button>
          <button
            type="button"
            onClick={() => setSelectedAgentId('supplies')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              selectedAgentId === 'supplies'
                ? 'bg-[#0284c7] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            🔍 Buscar Mercado
          </button>
          <button
            type="button"
            onClick={() => setSelectedAgentId('rfqs')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              selectedAgentId === 'rfqs'
                ? 'bg-[#0284c7] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            📋 Estruturar Demanda
          </button>
          <button
            type="button"
            onClick={() => setSelectedAgentId('comparator')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              selectedAgentId === 'comparator'
                ? 'bg-[#0284c7] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            ⚖️ Comparar Cotações
          </button>
          <button
            type="button"
            onClick={() => setSelectedAgentId('compliance')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              selectedAgentId === 'compliance'
                ? 'bg-[#0284c7] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            🛡️ Compliance Fiscal
          </button>
        </div>

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
              placeholder="Digite os materiais e quantidades desejadas ou anexe um documento..."
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

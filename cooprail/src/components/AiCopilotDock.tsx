'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/lib/mockData';
import { Send, Paperclip, Sparkles, Terminal, FileCheck, CheckCircle2 } from 'lucide-react';

interface AiCopilotDockProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, slashCommand?: string) => void;
  onActionClick: (action: string) => void;
  onOpenUploadDoc?: () => void;
}

export function AiCopilotDock({
  messages,
  onSendMessage,
  onActionClick,
  onOpenUploadDoc,
}: AiCopilotDockProps) {
  const [inputText, setInputText] = useState('');
  const [showCommandsDropdown, setShowCommandsDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const availableCommands = [
    {
      command: '/busca',
      label: 'Agente de Busca de Fornecedores & Peças',
      desc: 'Pesquisa catálogo de suprimentos, especificações técnicas e prestadores in-loco nos setores',
    },
    {
      command: '/controle',
      label: 'Agente de Controle & Compliance',
      desc: 'Audita pendências na esteira de compras, limites orçamentários e centros de custo',
    },
    {
      command: '/pedido',
      label: 'Agente de Pedidos & Ordens de Compra',
      desc: 'Estruturação de ordens formais (PO) e preparação de liquidação on-chain na Solana',
    },
    {
      command: '/demandas',
      label: 'Agente de Organização de Demandas',
      desc: 'Agrupamento de necessidades dos setores operacionais e redação de editais técnicos',
    },
    {
      command: '/compare',
      label: 'Comparar Propostas Comerciais',
      desc: 'Análise analítica de preços, prazos e aderência técnica',
    },
  ];

  const quickPrompts = [
    '/busca empresas mobilizadas no canteiro',
    '/busca peças e válvulas para a Unidade Oeste',
    '/controle status orçamentário',
    '/demandas consolidar necessidades do setor',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    setShowCommandsDropdown(val.startsWith('/'));
  };

  const handleSelectCommand = (cmd: string) => {
    setInputText(`${cmd} `);
    setShowCommandsDropdown(false);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let slashCmd: string | undefined;
    const lower = inputText.toLowerCase();
    if (lower.startsWith('/busca') || lower.startsWith('/agente de busca')) slashCmd = '/busca';
    else if (lower.startsWith('/controle') || lower.startsWith('/agente de controle')) slashCmd = '/controle';
    else if (lower.startsWith('/pedido') || lower.startsWith('/agente de pedido')) slashCmd = '/pedido';
    else if (lower.startsWith('/demandas') || lower.startsWith('/agente de organizacao de demandas') || lower.startsWith('/agente de demandas')) slashCmd = '/demandas';
    else if (lower.startsWith('/rfq')) slashCmd = '/rfq';
    else if (lower.startsWith('/compare')) slashCmd = '/compare';
    else if (lower.startsWith('/negotiate')) slashCmd = '/negotiate';

    onSendMessage(inputText, slashCmd);
    setInputText('');
    setShowCommandsDropdown(false);
  };

  return (
    <div className="h-full flex flex-col border-l border-[#1c2636] bg-[#0c1017] w-88 shrink-0">
      {/* Header do Copiloto */}
      <div className="p-3 border-b border-[#1c2636] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#1e2b3e] flex items-center justify-center text-[#38bdf8]">
            <Terminal className="w-3 h-3" />
          </div>
          <span className="text-xs font-semibold text-white">Assistente Operacional</span>
        </div>
        <span className="text-[10px] text-slate-400 bg-[#131b26] px-1.5 py-0.5 rounded border border-[#1e2a3b]">
          Motor de Conformidade Ativo
        </span>
      </div>

      {/* Sugestões Rápidas de Prompt */}
      <div className="p-2 border-b border-[#1c2636] bg-[#090d14] flex gap-1 overflow-x-auto">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(prompt)}
            className="text-[10px] whitespace-nowrap px-2 py-1 rounded bg-[#111722] hover:bg-[#182332] text-slate-300 border border-[#1f2c3e] transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Histórico de Mensagens */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender_role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[92%] p-2.5 rounded-lg text-xs leading-relaxed ${
                msg.sender_role === 'user'
                  ? 'bg-[#0284c7] text-white'
                  : 'bg-[#131b26] border border-[#1e2b3d] text-slate-200'
              }`}
            >
              {msg.slash_command && (
                <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-[#7dd3fc] mb-1">
                  <Terminal className="w-3 h-3" />
                  <span>{msg.slash_command}</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Action Card da IA */}
              {msg.action_card && (
                <div className="mt-2.5 pt-2 border-t border-[#223247] space-y-2">
                  <p className="text-[11px] font-semibold text-white flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
                    {msg.action_card.title}
                  </p>

                  {msg.action_card.metrics && (
                    <div className="grid grid-cols-2 gap-1.5 bg-[#0b1018] p-2 rounded border border-[#1a2637]">
                      {msg.action_card.metrics.map((m, i) => (
                        <div key={i}>
                          <p className="text-[9px] text-slate-400">{m.label}</p>
                          <p className="text-[11px] font-bold text-slate-200">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.action_card.actions && (
                    <div className="flex gap-1.5 pt-1">
                      {msg.action_card.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => onActionClick(act.action)}
                          className="flex-1 py-1 px-2 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-[10px] font-medium transition-colors text-center"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Menu Dropdown de Slash Commands */}
      {showCommandsDropdown && (
        <div className="p-2 border-t border-[#1c2636] bg-[#101724] space-y-1">
          <p className="text-[10px] font-semibold text-slate-400 px-1">Comandos Disponíveis</p>
          {availableCommands.map((cmd) => (
            <button
              key={cmd.command}
              onClick={() => handleSelectCommand(cmd.command)}
              className="w-full text-left p-1.5 rounded hover:bg-[#182335] text-xs flex items-center justify-between transition-colors"
            >
              <div>
                <span className="font-mono text-[#38bdf8] font-bold">{cmd.command}</span>
                <span className="text-slate-200 ml-2">{cmd.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Caixa de Entrada Persistente */}
      <form onSubmit={handleSend} className="p-2.5 border-t border-[#1c2636] bg-[#0c1017]">
        <div className="flex items-center gap-1.5 bg-[#121924] border border-[#202d3f] rounded-md px-2 py-1.5 focus-within:border-[#0284c7] transition-colors">
          <button
            type="button"
            onClick={onOpenUploadDoc}
            className="p-1 text-slate-400 hover:text-[#38bdf8] transition-colors cursor-pointer"
            title="Fazer upload de PDF/planilha para conferência e extração automática de dados"
          >
            <Paperclip className="w-3.5 h-3.5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Digite / para comandos ou pergunte..."
            className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-slate-400"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-1 rounded bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-30 disabled:hover:bg-[#0284c7] text-white transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}

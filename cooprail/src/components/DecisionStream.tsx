'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/mockData';
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, Check } from 'lucide-react';

interface DecisionStreamProps {
  tasks: Task[];
  onApproveTask: (taskId: string) => void;
  onOpenComparator: () => void;
}

export function DecisionStream({
  tasks,
  onApproveTask,
  onOpenComparator,
}: DecisionStreamProps) {
  const [filter, setFilter] = useState<'needs_you' | 'waiting_others' | 'completed'>('needs_you');

  const filteredTasks = tasks.filter((task) => task.status === filter);
  const needsYouCount = tasks.filter((t) => t.status === 'needs_you').length;
  const waitingOthersCount = tasks.filter((t) => t.status === 'waiting_others').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-4">
      {/* Cabeçalho da Seção com Tabs de Estado */}
      <div className="flex items-center justify-between border-b border-[#1c2636] pb-3">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Central de Decisões e Tarefas
          </h2>
          <p className="text-xs text-slate-400">
            Itens que exigem validação de compras ou aguardam retorno de fornecedores.
          </p>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-1 bg-[#0f1520] p-1 rounded-md border border-[#1e2a3b]">
          <button
            onClick={() => setFilter('needs_you')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
              filter === 'needs_you'
                ? 'bg-[#1e2b3e] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Precisa de você</span>
            {needsYouCount > 0 && (
              <span className="bg-[#d97706] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {needsYouCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter('waiting_others')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
              filter === 'waiting_others'
                ? 'bg-[#1e2b3e] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Aguardando terceiros</span>
            {waitingOthersCount > 0 && (
              <span className="bg-[#243347] text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full">
                {waitingOthersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              filter === 'completed'
                ? 'bg-[#1e2b3e] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Concluídas ({completedCount})</span>
          </button>
        </div>
      </div>

      {/* Lista de Decisões */}
      {filteredTasks.length === 0 ? (
        <div className="p-8 text-center rounded border border-[#1c2636] bg-[#0d131c]">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-medium text-slate-200">Nenhuma pendência nesta etapa</p>
          <p className="text-xs text-slate-500 mt-1">
            {filter === 'needs_you'
              ? 'Todas as aprovações foram respondidas. O agente de compras monitora o mercado.'
              : 'Nenhum fornecedor pendente de resposta no momento.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded border border-[#1f2c3e] bg-[#111722] hover:border-[#2b3c54] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      task.priority === 'high'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {task.badge_text || 'Ação Requerida'}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Prazo: {task.due_date}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-100">{task.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>
              </div>

              {/* Botões Operacionais */}
              {task.status === 'needs_you' && (
                <div className="flex items-center gap-2 shrink-0">
                  {task.category === 'quote_decision' && (
                    <button
                      onClick={onOpenComparator}
                      className="px-3 py-1.5 rounded bg-[#182332] hover:bg-[#202e42] border border-[#273850] text-slate-200 text-xs font-medium transition-colors"
                    >
                      Comparar Propostas
                    </button>
                  )}
                  <button
                    onClick={() => onApproveTask(task.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-medium transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aprovar Decisão</span>
                  </button>
                </div>
              )}

              {task.status === 'waiting_others' && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Aguardando e-mail do fornecedor</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Central de Decisões e Tarefas
          </h2>
          <p className="text-xs text-slate-500">
            Itens que exigem validação de compras ou aguardam retorno de fornecedores.
          </p>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setFilter('needs_you')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'needs_you'
                ? 'bg-white text-[#0284c7] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Precisa de você</span>
            {needsYouCount > 0 && (
              <span className="bg-[#d97706] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                {needsYouCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter('waiting_others')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'waiting_others'
                ? 'bg-white text-[#0284c7] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Aguardando terceiros</span>
            {waitingOthersCount > 0 && (
              <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {waitingOthersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-white text-[#0284c7] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Concluídas ({completedCount})</span>
          </button>
        </div>
      </div>

      {/* Lista de Decisões */}
      {filteredTasks.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-slate-200 bg-white shadow-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-90" />
          <p className="text-sm font-bold text-slate-800">Nenhuma pendência nesta etapa</p>
          <p className="text-xs text-slate-500 mt-1">
            {filter === 'needs_you'
              ? 'Todas as aprovações foram respondidas. O fluxo de compras está em dia.'
              : 'Nenhum fornecedor pendente de resposta no momento.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      task.priority === 'high'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {task.badge_text || 'Ação Requerida'}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" /> Prazo: {task.due_date}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>
              </div>

              {/* Botões Operacionais */}
              {task.status === 'needs_you' && (
                <div className="flex items-center gap-2 shrink-0">
                  {task.category === 'quote_decision' && (
                    <button
                      onClick={onOpenComparator}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      Comparar Propostas
                    </button>
                  )}
                  <button
                    onClick={() => onApproveTask(task.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aprovar Decisão</span>
                  </button>
                </div>
              )}

              {task.status === 'waiting_others' && (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Aguardando retorno formal do fornecedor</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

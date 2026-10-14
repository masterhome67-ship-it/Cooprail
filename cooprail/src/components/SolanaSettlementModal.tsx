'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  Lock,
  Layers,
  FileCheck,
  Building2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { executeEnterpriseSettlement, SettlementResult } from '@/lib/solanaSettlement';

export interface PurchaseOrderRecord {
  id: string;
  po_code: string;
  supplier_name: string;
  supplier_cnpj?: string;
  rfq_code?: string;
  total_amount_brl: number;
  delivery_days: number;
  created_at: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'settled_onchain';
  settlement_data?: SettlementResult;
  sector_name?: string;
  cost_center?: string;
  is_existing_contractor?: boolean;
  approval_notes?: string;
}

interface SolanaSettlementModalProps {
  order: PurchaseOrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSettlementComplete: (orderId: string, result: SettlementResult) => void;
}

export function SolanaSettlementModal({
  order,
  isOpen,
  onClose,
  onSettlementComplete,
}: SolanaSettlementModalProps) {
  const [step, setStep] = useState<'review' | 'processing' | 'confirmed'>('review');
  const [copied, setCopied] = useState(false);
  const [settlementResult, setSettlementResult] = useState<SettlementResult | null>(
    order?.settlement_data || null
  );

  if (!isOpen || !order) return null;

  const usdRate = 5.60;
  const usdcAmount = Math.round((order.total_amount_brl / usdRate) * 100) / 100;

  const handleStartSettlement = async () => {
    setStep('processing');
    try {
      const result = await executeEnterpriseSettlement({
        poCode: order.po_code,
        supplierName: order.supplier_name,
        totalBrl: order.total_amount_brl,
      });
      setSettlementResult(result);
      setStep('confirmed');
      onSettlementComplete(order.id, result);
    } catch (err) {
      console.error(err);
      setStep('review');
    }
  };

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-800">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7] flex items-center justify-center text-white shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
                Protocolo de Liquidação On-Chain
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-[#0284c7] border border-sky-200">
                  Solana Settlement Layer
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Garantia e custódia financeira via Smart Contract vinculada à Ordem {order.po_code}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-5">
          {step === 'review' && (
            <>
              {/* Card Resumo do Pedido */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                      Ordem de Fornecimento
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {order.supplier_name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Identificador: <span className="font-mono text-slate-800 font-semibold">{order.po_code}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                      Total Faturado
                    </span>
                    <p className="text-base font-extrabold text-slate-900 tracking-tight">
                      {order.total_amount_brl.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                    <p className="text-[11px] font-mono text-[#0284c7] font-bold">
                      ≈ {usdcAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Prazo Acordado:</span>
                    <span className="text-slate-800 font-semibold">{order.delivery_days} dias corridos</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Modelo de Liquidação:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Smart Escrow Corporativo
                    </span>
                  </div>
                </div>
              </div>

              {/* Parâmetros da Transação */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Especificações do Bloco de Liquidação
                </h5>
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs shadow-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rede de Liquidação:</span>
                    <span className="text-slate-900 font-mono font-bold">Solana Cluster (High-Throughput)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Taxa Estimada da Rede (Network Fee):</span>
                    <span className="text-slate-800 font-mono">0.000005 SOL (~$0.0008 USD)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tempo de Finalização Estimado:</span>
                    <span className="text-emerald-700 font-mono font-bold">~400 ms (Consenso PoH)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Garantia Contratual:</span>
                    <span className="text-slate-800 font-medium">Custódia On-Chain com liberação pós-aceite de entrega</span>
                  </div>
                </div>
              </div>

              {/* Botão de Ação */}
              <div className="pt-2">
                <button
                  onClick={handleStartSettlement}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Assinar e Liquidar via Tesouraria On-Chain</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-2">
                  A assinatura registra o compromisso de custódia diretamente no livro-razão auditável da Solana.
                </p>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="py-10 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-[#0284c7] border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Processando Liquidação On-Chain</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Construindo transação criptográfica, alocando conta de garantia (PDA) e registrando assinatura no cluster Solana...
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-mono text-[#0284c7] font-bold">
                <span>Tempo médio de bloco: 400ms</span>
              </div>
            </div>
          )}

          {step === 'confirmed' && settlementResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-800">
                    Liquidação Confirmada no Registro On-Chain
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed font-medium">
                    A ordem de pagamento foi registrada e custodiada com sucesso. Os fundos estão garantidos via Smart Escrow e vinculados à entrega.
                  </p>
                </div>
              </div>

              {/* Detalhes Técnicos da Transação */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block mb-1">
                    Assinatura da Transação (Transaction Hash)
                  </span>
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <span className="font-mono text-[11px] text-[#0284c7] font-semibold truncate select-all flex-1">
                      {settlementResult.signature}
                    </span>
                    <button
                      onClick={() => handleCopyHash(settlementResult.signature)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                      title="Copiar Hash"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Conta Garantida (Escrow PDA):</span>
                    <span className="font-mono text-[10px] text-slate-800 font-semibold truncate block">
                      {settlementResult.escrowPda.slice(0, 16)}...
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Slot do Bloco / Confirmação:</span>
                    <span className="font-mono text-[10px] text-emerald-700 font-bold block">
                      #{settlementResult.slot} (Confirmed)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Volume Custodiado:</span>
                    <span className="font-mono text-xs text-slate-900 font-extrabold block">
                      {settlementResult.tokenAmountUsdc.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Taxa Efetiva de Rede:</span>
                    <span className="font-mono text-xs text-slate-800 font-semibold block">
                      {settlementResult.networkFeeSol} SOL
                    </span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-2 pt-2">
                <a
                  href={`https://explorer.solana.com/tx/${settlementResult.signature}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
                >
                  <span>Auditar no Solana Explorer</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Concluir e Retornar às Ordens
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

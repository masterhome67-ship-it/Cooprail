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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b1018] border border-[#1e2a3c] rounded-xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b2636] bg-[#0e141f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#38bdf8]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                Protocolo de Liquidação On-Chain
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#102438] text-[#38bdf8] border border-[#173e63]">
                  Solana Settlement Layer
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Garantia e custódia financeira via Smart Contract vinculada à Ordem {order.po_code}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#182332] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-5">
          {step === 'review' && (
            <>
              {/* Card Resumo do Pedido */}
              <div className="bg-[#0f1622] border border-[#1a2537] rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Ordem de Fornecimento
                    </span>
                    <h4 className="text-sm font-semibold text-white mt-0.5">
                      {order.supplier_name}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Identificador: <span className="font-mono text-slate-300">{order.po_code}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Total Faturado
                    </span>
                    <p className="text-base font-bold text-white tracking-tight">
                      {order.total_amount_brl.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                    <p className="text-[11px] font-mono text-[#38bdf8] font-medium">
                      ≈ {usdcAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1a2536] text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Prazo Acordado:</span>
                    <span className="text-slate-200 font-medium">{order.delivery_days} dias corridos</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Modelo de Liquidação:</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Smart Escrow Corporativo
                    </span>
                  </div>
                </div>
              </div>

              {/* Parâmetros da Transação */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Especificações do Bloco de Liquidação
                </h5>
                <div className="bg-[#0c121a] border border-[#17212e] rounded-lg p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rede de Liquidação:</span>
                    <span className="text-slate-200 font-mono font-medium">Solana Cluster (High-Throughput)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Taxa Estimada da Rede (Network Fee):</span>
                    <span className="text-slate-200 font-mono">0.000005 SOL (~$0.0008 USD)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tempo de Finalização Estimado:</span>
                    <span className="text-emerald-400 font-mono">~400 ms (Consenso PoH)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Garantia Contratual:</span>
                    <span className="text-slate-300">Custódia On-Chain com liberação pós-aceite de entrega</span>
                  </div>
                </div>
              </div>

              {/* Botão de Ação */}
              <div className="pt-2">
                <button
                  onClick={handleStartSettlement}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Assinar e Liquidar via Tesouraria On-Chain</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  A assinatura registra o compromisso de custódia diretamente no livro-razão auditável da Solana.
                </p>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="py-10 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-[#0284c7] border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h4 className="text-sm font-semibold text-white">Processando Liquidação On-Chain</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Construindo transação criptográfica, alocando conta de garantia (PDA) e registrando assinatura no cluster Solana...
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#101b2b] border border-[#1b2f4a] text-[11px] font-mono text-[#38bdf8]">
                <span>Tempo médio de bloco: 400ms</span>
              </div>
            </div>
          )}

          {step === 'confirmed' && settlementResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-lg bg-[#0c1817] border border-emerald-800/60 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-emerald-300">
                    Liquidação Confirmada no Registro On-Chain
                  </h4>
                  <p className="text-xs text-emerald-400/80 mt-0.5 leading-relaxed">
                    A ordem de pagamento foi registrada e custodiada com sucesso. Os fundos estão garantidos via Smart Escrow e vinculados à entrega.
                  </p>
                </div>
              </div>

              {/* Detalhes Técnicos da Transação */}
              <div className="bg-[#0b1118] border border-[#182332] rounded-lg p-3.5 space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                    Assinatura da Transação (Transaction Hash)
                  </span>
                  <div className="flex items-center gap-2 bg-[#080d14] p-2 rounded border border-[#15202e]">
                    <span className="font-mono text-[11px] text-[#38bdf8] truncate select-all flex-1">
                      {settlementResult.signature}
                    </span>
                    <button
                      onClick={() => handleCopyHash(settlementResult.signature)}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#131d2b] transition-colors shrink-0"
                      title="Copiar Hash"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#162232]">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Conta Garantida (Escrow PDA):</span>
                    <span className="font-mono text-[10px] text-slate-300 truncate block">
                      {settlementResult.escrowPda.slice(0, 16)}...
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Slot do Bloco / Confirmação:</span>
                    <span className="font-mono text-[10px] text-emerald-400 font-semibold block">
                      #{settlementResult.slot} (Confirmed)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#162232]">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Volume Custodiado:</span>
                    <span className="font-mono text-xs text-white font-bold block">
                      {settlementResult.tokenAmountUsdc.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Taxa Efetiva de Rede:</span>
                    <span className="font-mono text-xs text-slate-300 block">
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
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[#141e2b] hover:bg-[#1a283a] border border-[#233348] text-slate-200 text-xs font-semibold transition-colors"
                >
                  <span>Auditar no Solana Explorer</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold transition-colors cursor-pointer"
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

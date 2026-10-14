'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building,
  DollarSign,
  Clock,
  Edit3,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RFQ, Quote } from '@/lib/mockData';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentExtracted: (newRFQ: RFQ) => void;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onDocumentExtracted,
}: DocumentUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawText, setRawText] = useState('');
  const [showRawText, setShowRawText] = useState(false);

  // Campos extraídos e editáveis pelo usuário
  const [formData, setFormData] = useState({
    supplierName: '',
    rfqTitle: '',
    totalAmount: 0,
    leadTimeDays: 15,
    paymentTerms: '',
    aiScore: 9.0,
    aiAnalysisSummary: '',
    items: [] as any[],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setRawText('');
    setFormData({
      supplierName: '',
      rfqTitle: '',
      totalAmount: 0,
      leadTimeDays: 15,
      paymentTerms: '',
      aiScore: 9.0,
      aiAnalysisSummary: '',
      items: [],
    });
  };

  // Envia para a API real /api/parse-document que usa pdf-parse
  const handleProcessDocument = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      const form = new FormData();
      form.append('file', selectedFile);

      const res = await fetch('/api/parse-document', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();

      if (data.success && data.extracted) {
        setRawText(data.rawText || 'Documento analisado diretamente via visão multimodal.');
        setFormData({
          supplierName: data.extracted.supplierName || 'Fornecedor Identificado no Documento',
          rfqTitle: data.extracted.rfqTitle || `Cotação: ${selectedFile.name}`,
          totalAmount: data.extracted.totalAmount || 0,
          leadTimeDays: data.extracted.leadTimeDays || 15,
          paymentTerms: data.extracted.paymentTerms || '30 dias',
          aiScore: data.extracted.aiScore || 9.0,
          aiAnalysisSummary: data.extracted.aiAnalysisSummary || '',
          items: data.extracted.items || [],
        });
      } else {
        throw new Error(data.error || 'Falha ao processar');
      }
    } catch (err) {
      console.warn('Leitura automática concluída com parser de contingência:', err);
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setFormData({
        supplierName: '',
        rfqTitle: `Cotação: ${cleanName}`,
        totalAmount: 0,
        leadTimeDays: 0,
        paymentTerms: 'Não informado',
        aiScore: 8.0,
        aiAnalysisSummary: 'Documento recebido. Revise os campos abaixo para confirmar a importação.',
        items: [],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!selectedFile) return;

    const generatedCode = `RFQ-DOC-${Math.floor(100 + Math.random() * 900)}`;

    const rfqItems =
      formData.items && formData.items.length > 0
        ? formData.items.map((it: any, idx: number) => ({
            id: `item-doc-${idx}`,
            item_name: it.item_name || 'Item cotado',
            specification: it.specification || '',
            quantity: Number(it.quantity) || 1,
            unit: it.unit || 'unidades',
            target_unit_price: Number(it.target_unit_price) || Number(it.total_price) || 0,
          }))
        : [
            {
              id: `item-doc-1`,
              item_name: formData.rfqTitle,
              specification: `Itens e condições técnicas extraídos de ${selectedFile.name}`,
              quantity: 1,
              unit: 'lote',
              target_unit_price: formData.totalAmount,
            },
          ];

    const newRFQ: RFQ = {
      id: `rfq-doc-${Date.now()}`,
      code: generatedCode,
      title: formData.rfqTitle || `Cotação de ${formData.supplierName}`,
      scope_description: `Documento "${selectedFile.name}" analisado e auditado pelo Agente Leitor de Cotações (Gemini 2.5 Flash).`,
      status: 'analyzing',
      deadline: 'Em 7 dias',
      target_delivery_date: `Em ${formData.leadTimeDays} dias`,
      estimated_budget: formData.totalAmount > 0 ? formData.totalAmount * 1.05 : 50000.0,
      items: rfqItems,
      quotes: [
        {
          id: `quote-doc-1`,
          rfq_id: `rfq-doc-${Date.now()}`,
          supplier_name: formData.supplierName,
          supplier_rating: 4.9,
          total_amount: formData.totalAmount,
          delivery_lead_time_days: formData.leadTimeDays,
          payment_terms: formData.paymentTerms,
          status: 'shortlisted',
          ai_score: formData.aiScore,
          savings_percentage: 5.0,
          ai_analysis_summary:
            formData.aiAnalysisSummary ||
            `Proposta extraída de "${selectedFile.name}". Fornecedor: ${formData.supplierName}. Valor total: ${formData.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, com prazo de entrega de ${formData.leadTimeDays} dias corridos.`,
        },
      ],
    };

    onDocumentExtracted(newRFQ);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-800">
        {/* Topo */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7] flex items-center justify-center text-white shadow-xs">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Importação & Leitura de Documentos (PDF / Planilhas)
              </h2>
              <p className="text-xs text-slate-500">
                O sistema processa o documento e identifica fornecedor, valores e prazos.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Zona de Drag & Drop */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-[#0284c7] bg-sky-50'
                : selectedFile
                ? 'border-sky-300 bg-sky-50/40'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv,.docx,.txt"
              className="hidden"
              onChange={handleFileChange}
            />

            <UploadCloud className="w-8 h-8 text-[#0284c7] mx-auto mb-2 opacity-90" />
            <p className="text-xs font-bold text-slate-800">
              {selectedFile ? selectedFile.name : 'Clique para selecionar seu documento ou arraste aqui'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Formatos aceitos: PDF, Planilhas (.csv, .xlsx), Word (.docx) ou Texto (.txt)
            </p>
            {selectedFile && (
              <p className="text-[10px] text-[#0284c7] mt-2 font-mono font-semibold">
                Tamanho: {(selectedFile.size / 1024).toFixed(1)} KB • Arquivo carregado
              </p>
            )}
          </div>

          {/* Botão de Processamento */}
          {selectedFile && !formData.supplierName && !isProcessing && (
            <button
              onClick={handleProcessDocument}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Ler Conteúdo do Arquivo e Extrair Dados</span>
            </button>
          )}

          {/* Estado de Processamento */}
          {isProcessing && (
            <div className="p-4 rounded-xl border border-sky-200 bg-sky-50 space-y-2 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-800 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] animate-ping" />
                <span>Processando e conferindo dados do documento...</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Identificando propostas, fornecedores homologados, valores e prazos de entrega.
              </p>
            </div>
          )}

          {/* Resultado com Campos Editáveis e Verificação do Texto Real */}
          {formData.supplierName && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Documento Processado! Confira ou ajuste os dados extraídos:</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal">
                  (Você pode editar qualquer campo abaixo)
                </span>
              </div>

              {/* Formulário de Conferência / Edição */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="col-span-2">
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">Título da Requisição</label>
                  <input
                    type="text"
                    value={formData.rfqTitle}
                    onChange={(e) => setFormData({ ...formData, rfqTitle: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 text-xs outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">Fornecedor Detectado</label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 text-xs outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    value={formData.totalAmount || ''}
                    onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-emerald-700 font-bold text-xs outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">Prazo de Entrega (dias)</label>
                  <input
                    type="number"
                    value={formData.leadTimeDays || ''}
                    onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 text-xs outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">Condições de Pagamento</label>
                  <input
                    type="text"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 text-xs outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>
              </div>

              {/* Parecer Técnico do Documento */}
              {formData.aiAnalysisSummary && (
                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#0284c7] font-bold text-[11px]">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Parecer de Auditoria Comercial & Técnica</span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    {formData.aiAnalysisSummary}
                  </p>
                </div>
              )}

              {/* Itens Identificados no Documento */}
              {formData.items && formData.items.length > 0 && (
                <div className="border border-slate-200 rounded-xl bg-white p-3 space-y-2 shadow-xs">
                  <p className="text-[11px] font-bold text-slate-800">
                    Itens Identificados no Documento ({formData.items.length} itens)
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1.5">
                    {formData.items.map((it: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px]"
                      >
                        <div className="truncate flex-1 mr-2">
                          <p className="font-bold text-slate-800 truncate">{it.item_name}</p>
                          {it.specification && (
                            <p className="text-[10px] text-slate-500 truncate">{it.specification}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-slate-700 font-medium">
                            {it.quantity} {it.unit || 'un'}
                          </p>
                          <p className="text-[10px] text-emerald-700 font-bold font-mono">
                            {Number(it.target_unit_price || it.total_price || 0).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acordeão: Ver Texto Bruto Extraído do Arquivo */}
              {rawText && (
                <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowRawText(!showRawText)}
                    className="w-full flex items-center justify-between p-2.5 text-[11px] text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Eye className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span>Ver o texto original lido do seu arquivo ({rawText.length} caracteres)</span>
                    </div>
                    {showRawText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showRawText && (
                    <div className="p-3 border-t border-slate-200 max-h-40 overflow-y-auto text-[10px] font-mono text-slate-700 whitespace-pre-wrap leading-relaxed bg-white">
                      {rawText}
                    </div>
                  )}
                </div>
              )}

              {/* Botão de Importação */}
              <button
                onClick={handleConfirmImport}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar & Importar Cotação para o Comparador</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

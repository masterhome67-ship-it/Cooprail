'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Building2,
  Calendar,
  MapPin,
  ShieldCheck,
  Send,
  Bot,
  User,
  CheckCircle2,
  Sparkles,
  UploadCloud,
  ChevronRight,
  Eye,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Coins,
  Lock,
  Layers,
  Wrench,
  PackageCheck,
  FileCheck2,
  Loader2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
  MessageSquare,
  Info,
  LogOut,
  KeyRound,
  Check,
} from 'lucide-react';
import { getSavedSuppliers } from '@/lib/suppliersData';
import {
  getPublishedRFQByCode,
  getAllPublishedRFQs,
  PublishedRFQ,
  formatCurrencyBRLInput,
  parseCurrencyBRL,
} from '@/lib/userWorkspace';

// Figuras e desenhos técnicos reais extraídos do Memorial Descritivo da Copacol (Cafelândia/PR)
const DEFAULT_MEMORIAL_IMAGES = [
  {
    title: 'Figura 01 - Visão Geral da Linha Final da Rede Pluvial',
    description: 'Traçado de 370m de vala com interligações, cotas de nível e escoamento direcionado ao rio receptor.',
    url: '/memorial_copacol/pagina_2.png',
    tag: 'Planta Geral / Traçado (Cafelândia/PR)',
  },
  {
    title: 'Figura 02 – Linha Atual da Rede e Projeção da Nova',
    description: 'Alinhamento da tubulação existente em relação à nova linha projetada de dreno industrial.',
    url: '/memorial_copacol/pagina_3.png',
    tag: 'Alinhamento Técnico',
  },
  {
    title: 'Figura 03 – Representação Gráfica da Caixa de Inspeção (2,50x1,50x2,00m)',
    description: 'Detalhamento do bloco dissipador em concreto (70cm), estaca de 1,5m armada com 4 barras CA-50 3/8" e estribos CA-60.',
    url: '/memorial_copacol/pagina_4.png',
    tag: 'Estrutural / Armadura CA-50 & CA-60',
  },
  {
    title: 'Figura 04 – Condição Atual do Local de Assentamento da Tubulação',
    description: 'Topografia e subleito real onde serão assentados os 740m de tubo corrugado PEAD DN 1.000 mm fornecidos pela Copacol.',
    url: '/memorial_copacol/pagina_5.png',
    tag: 'Canteiro Industrial da Copacol',
  },
  {
    title: 'Figura 05 – Canal de Descida Revestido em Concreto (3m x 3m)',
    description: 'Canal de concreto armado sobre base regularizada para condução final ao corpo receptor com segurança hidráulica.',
    url: '/memorial_copacol/pagina_6.png',
    tag: 'Dissipação & Descarga Hidráulica',
  },
];

// Planilha oficial dos itens e escopo extraídos do Memorial Técnico
const MEMORIAL_ITEMS_TO_QUOTE = [
  {
    num: '01',
    item: 'Escavação de Vala para Drenagem',
    quantity: '370 m lineares',
    dimensao: '1,5m prof. × 2,5m larg.',
    responsabilidade: 'contratada',
    responsabilidadeText: 'Fornecido pela CONTRATADA',
    detalhes: 'Garantir inclinações do sistema e medidas de estabilidade das paredes da vala. Fundo regularizado para assentamento.',
  },
  {
    num: '02',
    item: 'Execução de 05 Caixas de Inspeção Estruturadas',
    quantity: '5 unidades',
    dimensao: '2,50m × 1,50m × 2,00m prof.',
    responsabilidade: 'contratada',
    responsabilidadeText: 'Fornecido pela CONTRATADA',
    detalhes: 'Fundo em concreto 15cm, bloco dissipador de 70cm sobre estaca de 1,5m armada com 4 barras CA-50 3/8" e estribos CA-60 4,2mm.',
  },
  {
    num: '03',
    item: 'Locação e Assentamento de Tubos PEAD DN 1000mm',
    quantity: '740 m lineares',
    dimensao: 'Diâmetro DN 1.000 mm',
    responsabilidade: 'contratante',
    responsabilidadeText: '⚠️ Materiais fornecidos pela CONTRATANTE (Copacol)',
    detalhes: 'Tubos corrugados PEAD fornecidos pela Copacol. A contratada cota mão de obra, alinhamento, declividades e interligações.',
  },
  {
    num: '04',
    item: 'Reaterro de Vala e Regularização do Solo',
    quantity: '1 serviço global',
    dimensao: 'Extensão de 370 metros',
    responsabilidade: 'contratada',
    responsabilidadeText: 'Fornecido pela CONTRATADA',
    detalhes: 'Preenchimento em camadas sucessivas com compactação mecânica para minimizar recalques futuros.',
  },
  {
    num: '05',
    item: 'Execução de Canal de Descida Revestido',
    quantity: '1 estrutura',
    dimensao: '3,00m × 3,00m',
    responsabilidade: 'contratada',
    responsabilidadeText: 'Fornecido pela CONTRATADA',
    detalhes: 'Concreto armado 10cm com malha de ferro sobre base compactada para conduzir águas pluviais até o rio receptor.',
  },
];

function SupplierPortalContent() {
  const searchParams = useSearchParams();
  const rawRfqParam = searchParams.get('rfq');

  // Cotação ativa carregada dinamicamente (Umuarama cimento, Copacol ou criada no sistema)
  const [availableRfqs, setAvailableRfqs] = useState<PublishedRFQ[]>([]);
  const [selectedRfqCode, setSelectedRfqCode] = useState<string>(rawRfqParam || 'RFQ-2026-UMU-01');
  const [activeRfq, setActiveRfq] = useState<PublishedRFQ>(() => getPublishedRFQByCode(rawRfqParam));

  // Modalidade de Fornecimento Selecionada pelo Parceiro
  const [quoteMode, setQuoteMode] = useState<'turnkey' | 'parts_only' | 'service_only'>('turnkey');

  // Imagem selecionada para visualização ampliada
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Assistente de IA do Memorial: Ativa APENAS sob demanda do usuário
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'assistant'; text: string; time: string }[]
  >([
    {
      sender: 'assistant',
      text: 'Olá! Sou o Assistente Técnico Especializado da Cooprail. Posso esclarecer especificações dos materiais, exigências de entrega no canteiro, faturamento e conformidade técnica desta cotação. Em que posso ajudar?',
      time: 'Agora',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Estado de Autenticação Segura do Fornecedor & Reconhecimento de Novos Parceiros
  const [isSupplierAuthenticated, setIsSupplierAuthenticated] = useState(false);
  const [authCnpj, setAuthCnpj] = useState('');
  const [authRfqCode, setAuthRfqCode] = useState(() => activeRfq.code);
  const [authContactName, setAuthContactName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [isConsultingReceita, setIsConsultingReceita] = useState(false);
  const [receitaData, setReceitaData] = useState<any | null>(null);
  const [receitaError, setReceitaError] = useState<string | null>(null);
  const [isNewSupplier, setIsNewSupplier] = useState(false);

  useEffect(() => {
    const list = getAllPublishedRFQs();
    setAvailableRfqs(list);
    const resolved = getPublishedRFQByCode(selectedRfqCode);
    setActiveRfq(resolved);
    setAuthRfqCode(resolved.code);
  }, [selectedRfqCode]);

  useEffect(() => {
    if (rawRfqParam) {
      setSelectedRfqCode(rawRfqParam);
    }
  }, [rawRfqParam]);

  useEffect(() => {
    if (isAiDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isAiDrawerOpen]);

  const handleLookupCnpj = async (cnpjInput?: string) => {
    const raw = cnpjInput || authCnpj;
    const clean = raw.replace(/\D/g, '');
    if (!clean || clean.length !== 14) {
      setReceitaError('Digite um CNPJ válido com 14 dígitos numéricos.');
      setReceitaData(null);
      return;
    }
    setIsConsultingReceita(true);
    setReceitaError(null);
    try {
      const res = await fetch(`/api/receita-federal?cnpj=${clean}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setReceitaError(data.error || 'Empresa não localizada na base da Receita Federal.');
        setReceitaData(null);
      } else {
        const sup = data.supplier;
        setReceitaData(sup);
        setSupplierName(sup.name);
        setCnpj(sup.cnpj);
        if (sup.email && !authEmail) setAuthEmail(sup.email);
        if (sup.phone && !authPhone) setAuthPhone(sup.phone);

        // Identifica se é novo fornecedor ou já existente
        const saved = getSavedSuppliers();
        const exists = saved.some((s) => s.cnpj === sup.cnpj || s.clean_cnpj === sup.clean_cnpj);
        setIsNewSupplier(!exists);
      }
    } catch {
      setReceitaError('Falha ao comunicar com a Receita Federal. Tente novamente.');
    } finally {
      setIsConsultingReceita(false);
    }
  };

  const handleUnlockPortal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receitaData) {
      setReceitaError('Valide o CNPJ da sua empresa na Receita Federal antes de acessar.');
      return;
    }
    if (!authContactName.trim()) {
      setReceitaError('Informe o nome do responsável comercial.');
      return;
    }
    if (!authEmail.trim()) {
      setReceitaError('Informe o e-mail corporativo para contato e recibo técnico.');
      return;
    }

    setContactName(authContactName);
    setEmail(authEmail);
    setPhone(authPhone);
    setIsSupplierAuthenticated(true);
  };

  // Campos do Formulário de Cotação (Iniciam limpos, sem dados mockados)
  const [supplierName, setSupplierName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [partsAmount, setPartsAmount] = useState<string>('');
  const [serviceAmount, setServiceAmount] = useState<string>('');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(30);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(24);
  const [commercialNotes, setCommercialNotes] = useState('');
  const [proposalPdfName, setProposalPdfName] = useState<string | null>(null);
  const [isParsingProposal, setIsParsingProposal] = useState(false);
  const [aiAuditReport, setAiAuditReport] = useState<{
    score?: number;
    summary?: string;
    model?: string;
  } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Upload de Proposta Comercial Real do Fornecedor para Leitura Automática por IA
  const handleProcessProposalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingProposal(true);
    setProposalPdfName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse-document', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.extracted) {
          const ext = data.extracted;
          if (ext.supplierName && ext.supplierName !== 'Não identificado no documento') {
            setSupplierName(ext.supplierName);
          }
          if (ext.totalAmount > 0) {
            setTotalAmount(
              ext.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            );
          }
          if (ext.leadTimeDays > 0) {
            setLeadTimeDays(ext.leadTimeDays);
          }
          if (ext.paymentTerms && ext.paymentTerms !== 'Não informado') {
            setCommercialNotes((prev) =>
              prev ? `${prev} • Condição: ${ext.paymentTerms}` : `Condição de Pagamento: ${ext.paymentTerms}`
            );
          }
          if (ext.aiAnalysisSummary) {
            setAiAuditReport({
              score: ext.aiScore || 9.0,
              summary: ext.aiAnalysisSummary,
              model: data.aiModel || 'Motor de Auditoria Técnica Cooprail',
            });
          }
        }
      }
    } catch (err) {
      console.error('Erro ao auditar proposta:', err);
    } finally {
      setIsParsingProposal(false);
    }
  };

  // Enviar Dúvida Técnica (IA Travada Somente no Memorial)
  const handleSendQuestion = async (customQuestion?: string) => {
    const q = (customQuestion || chatInput).trim();
    if (!q || isChatLoading) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setChatMessages((prev) => [...prev, { sender: 'user', text: q, time: timeStr }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: activeRfq.hasCopacolDrawings
            ? `[DÚVIDA TÉCNICA ESTRITA DO MEMORIAL COPACOL CAFELÂNDIA]: ${q}. RESPONDA EXCLUSIVAMENTE COM BASE NO DOCUMENTO FORNECIDO.`
            : `[DÚVIDA TÉCNICA DA COTAÇÃO ${activeRfq.code} - ${activeRfq.title}]: ${q}. Escopo: ${activeRfq.scope_description}. Itens: ${JSON.stringify(activeRfq.items)}. Local de Entrega: ${activeRfq.location || 'Umuarama/PR'}.`,
          slashCommand: '/busca',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: data.reply || 'Informação conferida nas especificações técnicas.',
            time: timeStr,
          },
        ]);
        return;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsChatLoading(false);
    }

    // Fallback estrito offline personalizado
    setTimeout(() => {
      let reply = '';
      if (activeRfq.hasCopacolDrawings) {
        reply = 'Conforme o Memorial Técnico da Copacol (Cafelândia/PR), os 740 metros de tubos PEAD DN 1000mm são fornecidos pela CONTRATANTE (Copacol). A CONTRATADA é responsável pela escavação de 370m de vala, 5 caixas de inspeção estruturadas, reaterro com compactação e canal de descida 3x3m até o rio receptor.';
      } else {
        reply = `Para esta solicitação (${activeRfq.title} • ${activeRfq.code}), a entrega é para ${activeRfq.location || 'Umuarama - PR'}. Os materiais devem atender às normas ABNT NBR aplicáveis, sacaria intacta de 50kg, com entrega CIF e descarga no canteiro. A liquidação é garantida pela Cooprail.`;
      }
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: reply, time: timeStr }]);
      setIsChatLoading(false);
    }, 500);
  };

  // Submeter Cotação
  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim() || !totalAmount) return;

    const numericAmount = parseCurrencyBRL(totalAmount);

    const newQuoteRecord = {
      id: `quote-${Date.now()}`,
      rfq_id: activeRfq.code,
      supplier_name: supplierName,
      cnpj: cnpj || 'Não informado',
      contact_name: contactName,
      email: email,
      phone: phone,
      supplier_phone: phone,
      supplier_rating: 4.8,
      total_amount: numericAmount || 0,
      delivery_lead_time_days: Number(leadTimeDays) || 2,
      payment_terms: 'Liquidação Garantida via Solana Smart Escrow / Boleto',
      status: 'received',
      ai_score: aiAuditReport?.score || 9.4,
      ai_analysis_summary: `Proposta recebida via Portal do Parceiro para "${activeRfq.title}". Modalidade: ${
        quoteMode === 'turnkey'
          ? 'Fornecimento + Descarga'
          : quoteMode === 'parts_only'
          ? 'Apenas Material'
          : 'Mão de Obra / Serviço'
      }. Documento: ${proposalPdfName || 'Preenchimento Manual'}.`,
      savings_percentage: 5.0,
      quote_mode: quoteMode,
    };

    try {
      const existing = localStorage.getItem('cooprail_partner_quotes');
      const list = existing ? JSON.parse(existing) : [];
      list.push(newQuoteRecord);
      localStorage.setItem('cooprail_partner_quotes', JSON.stringify(list));
    } catch (err) {
      console.error(err);
    }

    setIsSubmitted(true);
  };

  const activeImg = DEFAULT_MEMORIAL_IMAGES[activeImageIndex];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-[#0284c7] selection:text-white pb-16">
      {/* 1. Header Corporativo Limpo */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 lg:px-12 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <img src="/cooprail-logo.png" alt="COOPRAIL" className="h-7 md:h-8 w-auto object-contain" />
          <div className="border-l border-slate-200 pl-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200 font-mono">
                CADERNO TÉCNICO & PORTAL DO FORNECEDOR
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Consulta de Especificações Técnicas & Envio de Propostas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Botão de Ativação da IA sob Demanda (Apenas após autenticado) */}
          {isSupplierAuthenticated && (
            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0284c7] font-semibold transition-colors cursor-pointer shadow-2xs"
              title="Abrir Assistente Técnico do Memorial"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dúvidas sobre o Memorial</span>
            </button>
          )}

          {isSupplierAuthenticated && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded text-xs truncate max-w-[200px]">
                {supplierName}
              </span>
              <button
                onClick={() => {
                  setIsSupplierAuthenticated(false);
                  setReceitaData(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Encerrar Sessão"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Seletor de Cotação Ativa */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px] hidden md:inline">Cotação:</span>
            <select
              value={selectedRfqCode}
              onChange={(e) => setSelectedRfqCode(e.target.value)}
              className="bg-slate-100 hover:bg-slate-200/80 border border-slate-300 text-slate-800 font-mono text-[11px] font-bold px-2 py-1 rounded cursor-pointer outline-none transition-colors max-w-[200px] sm:max-w-[280px] truncate"
              title="Alternar cotação ativa"
            >
              {availableRfqs.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.code} • {r.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Barreira de Acesso Fechado do Fornecedor / Reconhecimento de Novos Parceiros */}
      {!isSupplierAuthenticated ? (
        <main className="max-w-2xl mx-auto p-4 md:p-12 space-y-6">
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-sky-50 border border-sky-200 rounded-2xl mx-auto flex items-center justify-center text-[#0284c7]">
                <KeyRound className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#0284c7] uppercase tracking-wider bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200 inline-block">
                Acesso Restrito & Homologação
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Credenciamento do Fornecedor
              </h1>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Para consultar as especificações técnicas e enviar sua proposta comercial para <strong>{activeRfq.title} ({activeRfq.code})</strong>, identifique sua empresa pelo CNPJ.
              </p>
            </div>

            <form onSubmit={handleUnlockPortal} className="space-y-4">
              {/* Campo RFQ */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Demanda / Cotação Selecionada
                </label>
                <select
                  value={selectedRfqCode}
                  onChange={(e) => setSelectedRfqCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#0284c7] cursor-pointer"
                >
                  {availableRfqs.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.code} — {r.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo CNPJ + Consulta Receita */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CNPJ da Empresa Proponente <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={authCnpj}
                    onChange={(e) => {
                      setAuthCnpj(e.target.value);
                      if (e.target.value.replace(/\D/g, '').length === 14) {
                        handleLookupCnpj(e.target.value);
                      }
                    }}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0284c7] focus:bg-white font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleLookupCnpj()}
                    disabled={isConsultingReceita}
                    className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0284c7] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isConsultingReceita ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Consultando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Validar CNPJ</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Novos fornecedores são reconhecidos e homologados instantaneamente via Receita Federal.
                </p>
              </div>

              {/* Erro de consulta */}
              {receitaError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{receitaError}</span>
                </div>
              )}

              {/* Card de Dados Oficiais da Receita Federal */}
              {receitaData && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#0284c7]" />
                      Dados Oficiais da Receita Federal
                    </span>
                    {isNewSupplier ? (
                      <span className="text-[10px] bg-sky-100 text-[#0284c7] border border-sky-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        ✨ Novo Parceiro • Habilitação Automática
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Parceiro Credenciado
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Razão Social:</span>
                      <strong className="text-slate-900">{receitaData.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Situação na Receita Federal:</span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <Check className="w-3 h-3" /> {receitaData.status_receita || (receitaData.is_active ? 'ATIVA' : 'REGULAR')}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-500 text-[10px] block">Atividade Econômica / CNAE:</span>
                      <span className="text-slate-700 text-[11px] font-medium">
                        {receitaData.cnae_principal || receitaData.cnae_main || 'Serviços de Engenharia e Obras'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Município / UF:</span>
                      <span className="text-slate-700 font-semibold">
                        {receitaData.city ? `${receitaData.city} - ${receitaData.state}` : (receitaData.location || 'Brasil')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">CNPJ Oficial:</span>
                      <span className="text-slate-700 font-mono font-semibold">{receitaData.cnpj}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dados do Contato Comercial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Responsável Comercial <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos Eduardo de Oliveira"
                    value={authContactName}
                    onChange={(e) => setAuthContactName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail Corporativo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="comercial@empresa.com.br"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone / WhatsApp Comercial
                  </label>
                  <input
                    type="tel"
                    placeholder="(45) 99999-9999"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!receitaData}
                className="w-full py-3.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                <KeyRound className="w-4 h-4" />
                <span>Desbloquear Caderno Técnico & Iniciar Cotação</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </main>
      ) : (
        /* Conteúdo Principal Liberado para o Parceiro */
        <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        {/* Banner do Objeto Técnico da Contratação */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#0284c7] uppercase tracking-wide bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
              {activeRfq.hasCopacolDrawings ? 'Memorial Técnico Descritivo Oficial' : 'Requisição de Cotação Ativa'} • {activeRfq.code}
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-semibold">
              Recebendo Propostas
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            {activeRfq.title}
          </h1>
          <p className="text-xs text-slate-600 max-w-4xl leading-relaxed">
            {activeRfq.scope_description}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Local de Entrega / Região</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#0284c7]" />
                {activeRfq.location || 'Umuarama - PR'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Prazo para Envio de Propostas</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                {activeRfq.deadline || 'Em 24 horas'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Previsão de Entrega Desejada</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                {activeRfq.target_delivery_date || 'Até 2 dias úteis'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. PLANILHA CLARA DO QUE PRECISA SER COTADO */}
        {activeRfq.hasCopacolDrawings ? (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0284c7]" />
                  Planilha Oficial de Itens & Escopo Técnico a Cotar
                </h2>
                <p className="text-xs text-slate-500">
                  Verifique detalhadamente a divisão de responsabilidade entre Contratada e Contratante:
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 self-start sm:self-auto">
                5 Itens de Escopo
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] text-slate-600 font-bold uppercase">
                    <th className="py-2.5 px-3 w-12 text-center">Item</th>
                    <th className="py-2.5 px-3">Descrição da Atividade</th>
                    <th className="py-2.5 px-3">Quantitativo</th>
                    <th className="py-2.5 px-3">Dimensões / Seção</th>
                    <th className="py-2.5 px-3">Fornecimento de Materiais</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {MEMORIAL_ITEMS_TO_QUOTE.map((it) => (
                    <tr key={it.num} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">{it.num}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{it.item}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{it.detalhes}</p>
                      </td>
                      <td className="py-3 px-3 font-semibold font-mono text-slate-700 whitespace-nowrap">{it.quantity}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">{it.dimensao}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                            it.responsabilidade === 'contratante'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-sky-50 text-[#0284c7] border-sky-200'
                          }`}
                        >
                          {it.responsabilidadeText}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0284c7]" />
                  Planilha Oficial de Itens & Insumos Requisitados
                </h2>
                <p className="text-xs text-slate-500">
                  Itens e quantidades requeridas para fornecimento imediato em {activeRfq.location || 'Umuarama/PR'}:
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 self-start sm:self-auto">
                {activeRfq.items?.length || 1} {activeRfq.items?.length === 1 ? 'Item Solicitado' : 'Itens Solicitados'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] text-slate-600 font-bold uppercase">
                    <th className="py-2.5 px-3 w-12 text-center">Item</th>
                    <th className="py-2.5 px-3">Descrição do Material / Insumo</th>
                    <th className="py-2.5 px-3">Quantitativo Solicitado</th>
                    <th className="py-2.5 px-3">Norma / Especificação Técnica</th>
                    <th className="py-2.5 px-3">Modalidade de Entrega</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {(activeRfq.items || []).map((it, idx) => (
                    <tr key={it.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{it.item_name}</p>
                      </td>
                      <td className="py-3 px-3 font-semibold font-mono text-slate-800 whitespace-nowrap">
                        {it.quantity} {it.unit}
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px]">
                        {it.specification || 'Padrão industrial ABNT'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border bg-sky-50 text-[#0284c7] border-sky-200">
                          Fornecido pela Proponente (CIF {activeRfq.location || 'Umuarama/PR'})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. SEÇÃO TÉCNICA (DESENHOS PARA COPACOL OU DIRETRIZES DE QUALIDADE PARA DEMAIS) */}
        {activeRfq.hasCopacolDrawings ? (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#0284c7]" />
                  Plantas, Seções Estruturais & Croquis Técnicos do Memorial
                </h2>
                <p className="text-xs text-slate-500">
                  Clique na imagem principal para ampliar e conferir cotas, bitolas de aço e alinhamentos:
                </p>
              </div>
              <button
                onClick={() => {
                  setZoomLevel(1);
                  setIsLightboxOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs self-start sm:self-auto"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>Ampliar em Tela Cheia</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Imagem Ampliada em Grande Destaque (8 colunas) */}
              <div
                onClick={() => {
                  setZoomLevel(1);
                  setIsLightboxOpen(true);
                }}
                className="lg:col-span-8 relative rounded-xl overflow-hidden border border-slate-200 bg-white min-h-[460px] flex items-center justify-center group shadow-xs cursor-zoom-in"
                title="Clique para abrir o visualizador com zoom"
              >
                <img
                  src={activeImg.url}
                  alt={activeImg.title}
                  className="w-full h-auto max-h-[560px] object-contain p-3 transition-transform duration-200 group-hover:scale-101"
                />
                <div className="absolute top-3 right-3 bg-slate-900/75 hover:bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 backdrop-blur-xs transition-colors shadow-sm">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Clique para Zoom</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-transparent p-4 text-white">
                  <span className="text-[10px] font-mono bg-[#0284c7] text-white px-2 py-0.5 rounded w-fit font-bold mb-1 inline-block">
                    {activeImg.tag}
                  </span>
                  <h3 className="text-sm font-bold">{activeImg.title}</h3>
                  <p className="text-xs text-slate-200 leading-snug">{activeImg.description}</p>
                </div>
              </div>

              {/* Miniaturas Clicáveis para Seleção (4 colunas) */}
              <div className="lg:col-span-4 space-y-2 flex flex-col justify-between max-h-[560px] overflow-y-auto pr-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Selecione o Desenho / Figura:
                </span>
                {DEFAULT_MEMORIAL_IMAGES.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'bg-sky-50 border-sky-400 ring-1 ring-sky-300'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-16 h-14 object-contain rounded-lg shrink-0 border border-slate-200 bg-white"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-mono font-bold text-[#0284c7] block">
                        {img.tag}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 truncate">{img.title}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{img.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
                Diretrizes Técnicas de Qualidade & Entrega em {activeRfq.location || 'Umuarama/PR'}
              </h2>
              <p className="text-xs text-slate-500">
                Critérios de conformidade exigidos pela Cooprail para homologação, faturamento e liquidação financeira:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#0284c7] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Norma ABNT & Sacaria</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Insumos em conformidade com as normas ABNT NBR aplicáveis (NBR 16697). Sacaria intacta, sem umidade, empedramento ou rasgos, com lote e validade visíveis.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Descarga no Local (CIF)</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Entrega no canteiro de obras de {activeRfq.location || 'Umuarama - PR'}. Carga paletizada com filme protetor ou descarregamento manual direto no depósito.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Coins className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Liquidação Garantida</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Faturamento com NF eletrônica. Liquidação assegurada via Smart Escrow Solana ou depósito corporativo 30 dias após conferência de recebimento físico.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. FORMULÁRIO DE SUBMISSÃO DA PROPOSTA COMERCIAL */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Submissão de Proposta Comercial do Parceiro
            </h2>
            <p className="text-xs text-slate-500">
              Escolha a modalidade de participação e anexe sua proposta comercial em PDF ou preencha os valores:
            </p>
          </div>

          {/* Upload de Proposta Real com IA */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0284c7]" />
                Importar Proposta em PDF / Orçamento Comercial
              </span>
              <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                Auditoria via IA
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Ao anexar a proposta timbrada, a IA preenche automaticamente Razão Social, CNPJ, valor total e prazos:
            </p>

            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 hover:border-[#0284c7] rounded-xl bg-white hover:bg-sky-50/50 cursor-pointer transition-all shadow-2xs">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleProcessProposalFile}
                className="hidden"
              />
              {isParsingProposal ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0284c7]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Lendo documento e extraindo dados com IA...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <UploadCloud className="w-4 h-4 text-[#0284c7]" />
                  <span>
                    {proposalPdfName ? (
                      <strong className="text-[#0284c7]">{proposalPdfName} (Clique para trocar de arquivo)</strong>
                    ) : (
                      'Clique para anexar sua Proposta Comercial ou Orçamento em PDF'
                    )}
                  </span>
                </div>
              )}
            </label>

            {aiAuditReport && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-1 mt-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Proposta Auditada • Conformidade: {aiAuditReport.score}/10
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {aiAuditReport.model}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-snug">
                  {aiAuditReport.summary}
                </p>
              </div>
            )}
          </div>

          {/* Seletor das 3 Modalidades de Fornecimento */}
          <div className="space-y-1.5">
            <label className="font-bold text-xs text-slate-800 block">
              Selecione a Modalidade de Participação:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setQuoteMode('turnkey')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  quoteMode === 'turnkey'
                    ? 'bg-sky-50 border-[#0284c7] text-[#0284c7] ring-1 ring-[#0284c7]/30'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <Layers className="w-4 h-4 mb-1.5" />
                <span className="font-bold text-xs block">Pacote Completo</span>
                <span className="text-[10px] text-slate-500 block leading-tight">
                  Fornecimento das Peças + Instalação Turnkey
                </span>
              </button>

              <button
                type="button"
                onClick={() => setQuoteMode('parts_only')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  quoteMode === 'parts_only'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-700 ring-1 ring-emerald-500/30'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <PackageCheck className="w-4 h-4 mb-1.5" />
                <span className="font-bold text-xs block">Apenas Peças / Materiais</span>
                <span className="text-[10px] text-slate-500 block leading-tight">
                  Fornecimento direto de fábrica (sem instalação)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setQuoteMode('service_only')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  quoteMode === 'service_only'
                    ? 'bg-amber-50 border-amber-600 text-amber-700 ring-1 ring-amber-500/30'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <Wrench className="w-4 h-4 mb-1.5" />
                <span className="font-bold text-xs block">Apenas Execução</span>
                <span className="text-[10px] text-slate-500 block leading-tight">
                  Mão de obra e maquinário no canteiro
                </span>
              </button>
            </div>
          </div>

          {isSubmitted ? (
            <div className="p-8 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-900">
                Proposta Registrada com Sucesso!
              </h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                Sua proposta comercial foi transmitida para a comissão de suprimentos. Os valores e prazos já estão computados para análise concorrencial.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setSupplierName('');
                    setCnpj('');
                    setTotalAmount('');
                    setProposalPdfName(null);
                    setAiAuditReport(null);
                  }}
                  className="text-xs text-emerald-700 underline font-semibold cursor-pointer"
                >
                  Submeter outra proposta ou atualizar valores
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitProposal} className="space-y-4 text-xs">
              {/* Dados da Empresa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Razão Social / Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome oficial da empresa proponente"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#0284c7] focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Responsável Técnico</label>
                  <input
                    type="text"
                    placeholder="Engenheiro ou contato"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">E-mail Comercial</label>
                  <input
                    type="email"
                    placeholder="contato@empresa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(DDD) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                </div>
              </div>

              {/* Valores Financeiros */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-900 block mb-1">
                      Valor Total Líquido da Proposta (R$) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="R$ 0,00"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(formatCurrencyBRLInput(e.target.value))}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 font-mono focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Prazo de Obra/Entrega</label>
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          value={leadTimeDays}
                          onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                          className="w-full text-slate-900 font-bold focus:outline-none font-mono"
                        />
                        <span className="text-slate-500 text-[10px]">dias</span>
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Garantia Técnica</label>
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          value={warrantyMonths}
                          onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                          className="w-full text-slate-900 font-bold focus:outline-none font-mono"
                        />
                        <span className="text-slate-500 text-[10px]">meses</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalhamento Turnkey */}
                {quoteMode === 'turnkey' && (
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200 text-[11px]">
                    <div>
                      <label className="text-slate-600 block mb-0.5">Parcela de Peças/Material (opcional)</label>
                      <input
                        type="text"
                        placeholder="R$ 0,00"
                        value={partsAmount}
                        onChange={(e) => setPartsAmount(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-0.5">Parcela de Mão de Obra (opcional)</label>
                      <input
                        type="text"
                        placeholder="R$ 0,00"
                        value={serviceAmount}
                        onChange={(e) => setServiceAmount(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Observações Comerciais */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Observações Comerciais, Validade e Especificações Propostas
                </label>
                <textarea
                  rows={2}
                  placeholder="Descreva detalhes da sua proposta, marcas equivalentes, laudos técnicos anexos ou prazos de faturamento..."
                  value={commercialNotes}
                  onChange={(e) => setCommercialNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                />
              </div>

              {/* Botão de Envio */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Enviar Cotação Formal para a Comissão de Suprimentos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </main>
      )}

      {/* 5. MODAL LIGHTBOX COM ZOOM EM TELA CHEIA PARA OS DESENHOS TÉCNICOS */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 animate-in fade-in">
          {/* Barra Superior do Lightbox */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-[#0284c7] font-bold block">
                {activeImg.tag}
              </span>
              <h3 className="text-sm font-bold truncate max-w-xl">{activeImg.title}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-2 text-slate-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="px-2 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                100%
              </button>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white ml-3 cursor-pointer"
                title="Fechar (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Área de Visualização com Zoom */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <div
              style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
              className="origin-center max-w-full max-h-full flex items-center justify-center"
            >
              <img
                src={activeImg.url}
                alt={activeImg.title}
                className="max-h-[82vh] w-auto object-contain rounded-lg shadow-2xl bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. DRAWER SLIDE-OVER DO ASSISTENTE DE IA (SÓ ATIVA QUANDO O USUÁRIO CHAMA) */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
            {/* Header do Drawer */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-[#0284c7] flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Assistente Técnico do Memorial
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Restrito exclusivamente às especificações do documento
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chips de Dúvidas Rápidas */}
            <div className="p-2.5 border-b border-slate-100 bg-white flex flex-wrap gap-1.5 text-[10px]">
              <button
                onClick={() => handleSendQuestion('Quem fornece os tubos PEAD DN 1000mm?')}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-sky-50 hover:text-[#0284c7] border border-slate-200 transition-colors cursor-pointer text-left"
              >
                Quem fornece os tubos de 1000mm?
              </button>
              <button
                onClick={() => handleSendQuestion('Qual o detalhamento das caixas de inspeção e estacas?')}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-sky-50 hover:text-[#0284c7] border border-slate-200 transition-colors cursor-pointer text-left"
              >
                Armadura das Caixas de Inspeção?
              </button>
              <button
                onClick={() => handleSendQuestion('Qual a dimensão do canal de descida?')}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-sky-50 hover:text-[#0284c7] border border-slate-200 transition-colors cursor-pointer text-left"
              >
                Dimensões do Canal 3x3m?
              </button>
            </div>

            {/* Feed de Mensagens */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 text-xs">
              {chatMessages.map((m, i) => {
                const isUser = m.sender === 'user';
                return (
                  <div key={i} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-6 h-6 rounded-md bg-sky-100 text-[#0284c7] flex items-center justify-center shrink-0 border border-sky-200">
                        <Bot className="w-3 h-3" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-xl p-3 shadow-2xs leading-relaxed ${
                        isUser
                          ? 'bg-[#0284c7] text-white'
                          : 'bg-white border border-slate-200 text-slate-800'
                      }`}
                    >
                      <p>{m.text}</p>
                      <span className="block text-[9px] opacity-70 text-right mt-1">{m.time}</span>
                    </div>
                  </div>
                );
              })}
              {isChatLoading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-md bg-sky-100 text-[#0284c7] flex items-center justify-center shrink-0">
                    <Bot className="w-3 h-3" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-slate-500 text-xs flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0284c7]" />
                    Consultando memorial Copacol...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input do Chat */}
            <div className="p-3 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendQuestion()}
                  placeholder="Pergunte sobre escavação, estacas ou canal..."
                  className="flex-1 px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0284c7]"
                />
                <button
                  onClick={() => handleSendQuestion()}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="p-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SupplierPortalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Carregando Caderno Técnico do Fornecedor...</div>}>
      <SupplierPortalContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DecisionStream } from '@/components/DecisionStream';
import { QuoteComparator } from '@/components/QuoteComparator';
import { AgentWorkspaceChat } from '@/components/AgentWorkspaceChat';
import { CommandPaletteModal } from '@/components/CommandPaletteModal';
import { CreateRFQModal } from '@/components/CreateRFQModal';
import { DocumentUploadModal } from '@/components/DocumentUploadModal';
import { SolanaSettlementModal, PurchaseOrderRecord } from '@/components/SolanaSettlementModal';
import { OrderConfirmationModal } from '@/components/OrderConfirmationModal';
import { SectorsView, OperationalTicketData } from '@/components/SectorsView';
import { LandingPage } from '@/components/LandingPage';
import { LoginModal } from '@/components/LoginModal';
import { Language, translations } from '@/lib/translations';
import { SettlementResult } from '@/lib/solanaSettlement';
import {
  qualifiedSuppliers,
  getSavedSuppliers,
  saveCustomSupplier,
  removeCustomSupplier,
  Supplier,
} from '@/lib/suppliersData';
import {
  RegisteredAccount,
  defaultAccounts,
  loadUserWorkspace,
  saveUserWorkspace,
  getActiveSessionUserId,
  setActiveSessionUserId,
  getRegisteredAccounts,
  registerNewAccount,
} from '@/lib/userWorkspace';
import {
  initialOrganization,
  initialUserProfile,
  initialTasks,
  initialRFQs,
  initialChatMessages,
  initialSectors,
  Organization,
  Sector,
  Task,
  RFQ,
  Quote,
  ChatMessage,
  UserProfile,
} from '@/lib/mockData';
import {
  FileText,
  Building2,
  Settings,
  ShoppingBag,
  CheckCircle2,
  Plus,
  TrendingDown,
  Layers,
  UploadCloud,
  Lock,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Zap,
  Search,
  Scale,
  ArrowRight,
  Trash2,
  RefreshCw,
  AlertCircle,
  Phone,
  Mail,
  Sparkles,
  Check,
} from 'lucide-react';

const initialOrders: PurchaseOrderRecord[] = [
  {
    id: 'po-1',
    po_code: 'PO-2026-089',
    supplier_name: 'Metalúrgica Ferro & Aço Nacional S.A.',
    supplier_cnpj: '12.345.678/0001-90',
    rfq_code: 'RFQ-2026-001',
    total_amount_brl: 81500.0,
    delivery_days: 15,
    created_at: 'Hoje, 10:30',
    status: 'approved',
    sector_name: 'Divisão de Infraestrutura & Via Permanente - Corredor Oeste',
    cost_center: 'CC-4100-VIA',
    is_existing_contractor: true,
  },
];

export default function Home() {
  const [lang, setLang] = useState<Language>('pt');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<RegisteredAccount | null>(null);
  const [organization, setOrganization] = useState<Organization>(initialOrganization);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [orders, setOrders] = useState<PurchaseOrderRecord[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateRFQOpen, setIsCreateRFQOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [selectedQuoteForConfirmation, setSelectedQuoteForConfirmation] = useState<Quote | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedOrderForSettlement, setSelectedOrderForSettlement] = useState<PurchaseOrderRecord | null>(null);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<'all' | 'nearby' | 'mobilized'>('all');

  // Gestão de Fornecedores Reais & Integração Receita Federal
  const [customSuppliers, setCustomSuppliers] = useState<Supplier[]>([]);
  const [cnpjQuery, setCnpjQuery] = useState('');
  const [isSearchingReceita, setIsSearchingReceita] = useState(false);
  const [receitaResult, setReceitaResult] = useState<any | null>(null);
  const [receitaError, setReceitaError] = useState<string | null>(null);
  const [receitaSource, setReceitaSource] = useState<string | null>(null);

  useEffect(() => {
    setCustomSuppliers(getSavedSuppliers());
  }, []);

  const handleSearchReceita = async (targetCnpj?: string) => {
    const rawCnpj = targetCnpj || cnpjQuery;
    const clean = rawCnpj.replace(/\D/g, '');
    if (!clean || clean.length !== 14) {
      setReceitaError('Digite um CNPJ válido com 14 dígitos numéricos.');
      setReceitaResult(null);
      return;
    }
    if (targetCnpj) {
      setCnpjQuery(targetCnpj);
    }
    setIsSearchingReceita(true);
    setReceitaError(null);
    setReceitaResult(null);
    try {
      const res = await fetch(`/api/receita-federal?cnpj=${clean}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setReceitaError(data.error || 'Empresa não encontrada na base da Receita Federal.');
      } else {
        setReceitaResult(data.supplier);
        setReceitaSource(data.source || 'Receita Federal do Brasil');
      }
    } catch {
      setReceitaError('Falha ao comunicar com a Receita Federal. Tente novamente.');
    } finally {
      setIsSearchingReceita(false);
    }
  };

  const handleSaveSupplier = (sup: any) => {
    const updated = saveCustomSupplier(sup);
    setCustomSuppliers(updated);
    setReceitaResult(null);
    setCnpjQuery('');
    showToast(`Fornecedor ${sup.name} homologado com sucesso no workspace!`);
  };

  const handleRemoveSupplier = (id: string, name: string) => {
    const updated = removeCustomSupplier(id);
    setCustomSuppliers(updated);
    showToast(`Fornecedor ${name} removido do catálogo.`);
  };

  const handleLoginSuccess = useCallback((account: RegisteredAccount) => {
    setCurrentUser(account);
    setActiveSessionUserId(account.id);
    const ws = loadUserWorkspace(account);
    setOrganization(ws.organization);
    setTasks(ws.tasks);
    setRfqs(ws.rfqs);
    setOrders(ws.orders);
    setSectors(ws.sectors);
    setChatMessages(ws.chatMessages);
    setIsNewUser(ws.isNewUser);
    setIsAuthenticated(true);
    setIsLoginOpen(false);

    showToast(
      lang === 'pt'
        ? `Bem-vindo, ${account.full_name}! Workspace de ${account.company_name} conectado.`
        : `Welcome, ${account.full_name}! Connected to ${account.company_name} workspace.`
    );
  }, [lang]);

  // Restaura sessão existente ou processa retorno OAuth oficial do Google
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      if (accessToken) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => res.json())
          .then((googleProfile) => {
            if (googleProfile?.email) {
              const accounts = getRegisteredAccounts();
              const matched = accounts.find(
                (a) => a.email.toLowerCase() === googleProfile.email.toLowerCase()
              );
              if (matched) {
                handleLoginSuccess(matched);
              } else {
                const created = registerNewAccount({
                  full_name: googleProfile.name || googleProfile.email.split('@')[0],
                  email: googleProfile.email,
                  company_name: 'Minha Empresa Global',
                  role: lang === 'pt' ? 'Diretor de Suprimentos' : 'Head of Procurement',
                  avatar_url: googleProfile.picture || '',
                });
                handleLoginSuccess(created);
              }
              window.history.replaceState(null, '', window.location.pathname);
            }
          })
          .catch((err) => console.error('Erro ao processar Google OAuth token:', err));
        return;
      }
    }

    const activeUserId = getActiveSessionUserId();
    if (activeUserId) {
      const accounts = getRegisteredAccounts();
      const user = accounts.find((a) => a.id === activeUserId);
      if (user) {
        setCurrentUser(user);
        const ws = loadUserWorkspace(user);
        setOrganization(ws.organization);
        setTasks(ws.tasks);
        setRfqs(ws.rfqs);
        setOrders(ws.orders);
        setSectors(ws.sectors);
        setChatMessages(ws.chatMessages);
        setIsNewUser(ws.isNewUser);
        setIsAuthenticated(true);
      }
    }
  }, [handleLoginSuccess, lang]);

  // Salva no workspace isolado do usuário ativo sempre que houver alteração
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      saveUserWorkspace(currentUser.id, {
        organization,
        user: currentUser,
        tasks,
        rfqs,
        orders,
        sectors,
        chatMessages,
        isNewUser: sectors.length === 0 && rfqs.length === 0,
      });
    }
  }, [tasks, rfqs, orders, sectors, chatMessages, organization, isAuthenticated, currentUser]);

  const handleLogout = () => {
    setActiveSessionUserId(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setTasks([]);
    setRfqs([]);
    setOrders([]);
    setSectors([]);
    setChatMessages([]);
    setIsNewUser(false);
    showToast(lang === 'pt' ? 'Sessão encerrada com sucesso.' : 'Logged out successfully.');
  };

  const handleDocumentExtracted = (newRFQ: RFQ) => {
    setRfqs((prev) => [newRFQ, ...prev]);

    const newTask: Task = {
      id: `task-doc-${Date.now()}`,
      title: `Demanda Estruturada: ${newRFQ.title}`,
      description: `Memorial técnico analisado com ${newRFQ.items.length} itens extraídos. Selecione os fornecedores para disparar a solicitação de cotação.`,
      status: 'waiting_others',
      priority: 'high',
      category: 'rfq_review',
      due_date: newRFQ.deadline || 'Em 7 dias',
      badge_text: 'Aguardando Cotações',
    };
    setTasks((prev) => [newTask, ...prev]);

    showToast(`Projeto estruturado! Demanda ${newRFQ.code} pronta para envio aos fornecedores.`);
    setActiveTab('rfqs');

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const docChatMsg: ChatMessage = {
      id: `msg-doc-${Date.now()}`,
      sender_role: 'assistant',
      content: `O memorial técnico do projeto "${newRFQ.title}" foi processado e auditado com sucesso pelo Motor de Conformidade Cooprail! Foram identificados ${newRFQ.items.length} itens e especificações técnicas. A demanda está pronta para envio aos fornecedores homologados para recebermos propostas reais.`,
      timestamp: timeStr,
      action_card: {
        type: 'rfq_scope',
        title: `Demanda Técnica: ${newRFQ.title}`,
        metrics: [
          { label: 'Itens', value: `${newRFQ.items.length} itens` },
          { label: 'Status', value: 'Aguardando Cotações' },
          { label: 'Prazo', value: newRFQ.deadline || 'Em 7 dias' },
        ],
        actions: [{ label: 'Abrir Painel de Demandas (RFQs)', action: 'open_rfq' }],
      },
    };
    setChatMessages((prev) => [...prev, docChatMsg]);
  };

  const handleCreateRFQ = (newRFQ: RFQ) => {
    setRfqs((prev) => [newRFQ, ...prev]);

    const newTask: Task = {
      id: `task-rfq-${Date.now()}`,
      title: `Decisão de Compra: Comparar propostas para ${newRFQ.code}`,
      description: `${newRFQ.quotes.length} propostas comerciais recebidas de fornecedores próximos homologados. Avalie as cotações concorrentes e emita a Ordem de Compra.`,
      status: 'needs_you',
      priority: 'high',
      category: 'quote_decision',
      due_date: newRFQ.deadline,
      badge_text: `${newRFQ.quotes.length} Cotações Prontas`,
    };
    setTasks((prev) => [newTask, ...prev]);

    showToast(`Pedido ${newRFQ.code} emitido! ${newRFQ.quotes.length} cotações recebidas dos fornecedores próximos.`);
    setActiveTab('comparator');

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const rfqChatMsg: ChatMessage = {
      id: `msg-rfq-${Date.now()}`,
      sender_role: 'assistant',
      content: `O pedido de orçamento ${newRFQ.code} ("${newRFQ.title}") foi disparado para os fornecedores próximos. Recebemos ${newRFQ.quotes.length} propostas comerciais. Navegue no Comparador de Cotações para avaliar os preços, prazos e emitir a Ordem de Compra.`,
      timestamp: timeStr,
      action_card: {
        type: 'quote_recommendation',
        title: `Propostas Recebidas: ${newRFQ.code}`,
        metrics: [
          { label: 'Propostas', value: `${newRFQ.quotes.length} fornecedores` },
          { label: 'Teto', value: newRFQ.estimated_budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
        ],
        actions: [{ label: 'Ver no Comparador', action: 'inspect' }],
      },
    };
    setChatMessages((prev) => [...prev, rfqChatMsg]);
  };

  // Escuta atalho Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Ação: Aprovar Tarefa
  const handleApproveTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' as const } : t))
    );
    showToast('Decisão aprovada com sucesso! Pedido de compra em geração.');
  };

  // Ação: Abrir Prévia e Confirmação da Cotação antes de Gerar Pedido
  const handleGeneratePO = (quote: Quote) => {
    setSelectedQuoteForConfirmation(quote);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmOrder = ({
    quote,
    sectorId,
    approvalNotes,
    isExistingContractor,
  }: {
    quote: Quote;
    sectorId: string;
    approvalNotes: string;
    isExistingContractor: boolean;
  }) => {
    const selectedSector = sectors.find((s) => s.id === sectorId);
    const newOrder: PurchaseOrderRecord = {
      id: `po-${Date.now()}`,
      po_code: `PO-2026-${String(orders.length + 90).padStart(3, '0')}`,
      supplier_name: quote.supplier_name,
      supplier_cnpj: '12.345.678/0001-90',
      rfq_code: rfqs[0]?.code || 'RFQ-2026-001',
      total_amount_brl: quote.total_amount,
      delivery_days: quote.delivery_lead_time_days,
      created_at: 'Agora',
      status: 'approved',
      sector_name: selectedSector?.name || 'Setor Operacional Padrão',
      cost_center: selectedSector?.cost_center || 'CC-GERAL',
      is_existing_contractor: isExistingContractor,
      approval_notes: approvalNotes,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setIsConfirmationModalOpen(false);
    setSelectedQuoteForConfirmation(null);
    showToast(
      isExistingContractor
        ? `Ordem ${newOrder.po_code} emitida! Empresa já mobilizada no setor (sem frete extra).`
        : `Ordem de Compra ${newOrder.po_code} emitida com sucesso!`
    );
    setActiveTab('orders');
  };

  const handleAddSector = (newSector: Sector) => {
    setSectors((prev) => [newSector, ...prev]);
    showToast(`Setor ${newSector.code} cadastrado com sucesso!`);
  };

  // Ação: Setor Operacional abre chamado que cai na triagem de Compras
  const handleCreateTicket = (ticket: OperationalTicketData) => {
    const newTaskId = `task-ticket-${Date.now()}`;
    const newTask: Task = {
      id: newTaskId,
      title: `Triagem de Chamado: ${ticket.item_description}`,
      description: `Chamado aberto pelo setor ${ticket.sector_name}. Qtd: ${ticket.quantity}. Justificativa: ${ticket.justification || 'Necessidade de campo'}.${ticket.suggested_contractor ? ` Sugerido verificar empresa já mobilizada no canteiro: ${ticket.suggested_contractor}.` : ''} Setor de compras deve analisar e verificar a melhor estratégia de suprimento.`,
      status: 'needs_you',
      priority: ticket.urgency === 'emergencial' ? 'urgent' : ticket.urgency === 'alta' ? 'high' : 'medium',
      category: 'quote_decision',
      due_date: ticket.urgency === 'emergencial' ? 'Imediato (Urgência)' : 'Hoje',
      badge_text: 'Chamado Operacional',
    };

    setTasks((prev) => [newTask, ...prev]);
    showToast(`Chamado encaminhado para análise e verificação do Setor de Compras!`);
    setActiveTab('dashboard');
  };

  const handleRequestFromContractor = (supplierName: string, sectorName: string) => {
    showToast(`Iniciando requisição de fornecimento para ${supplierName} no setor ${sectorName}`);
    setIsCreateRFQOpen(true);
  };

  const handleOpenSettlement = (order: PurchaseOrderRecord) => {
    setSelectedOrderForSettlement(order);
    setIsSettlementModalOpen(true);
  };

  const handleSettlementComplete = (orderId: string, result: SettlementResult) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'settled_onchain', settlement_data: result }
          : o
      )
    );
    showToast(`Ordem liquidada on-chain com sucesso no cluster Solana!`);
  };

  const handleCreateTestOrder = () => {
    const testPo: PurchaseOrderRecord = {
      id: `po-test-${Date.now()}`,
      po_code: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier_name: 'Metalúrgica Ferro & Aço Nacional S.A.',
      supplier_cnpj: '18.234.567/0001-90',
      rfq_code: 'RFQ-2026-IND-01',
      total_amount_brl: 45000.0,
      delivery_days: 7,
      created_at: 'Hoje',
      status: 'pending_approval',
      sector_name: 'Divisão de Infraestrutura & Via Permanente - Corredor Oeste',
      cost_center: 'CC-4200',
      is_existing_contractor: true,
      approval_notes: 'Empresa já mobilizada no canteiro da Unidade Oeste. Homologada sem custo adicional de frete.',
    };
    setOrders((prev) => [testPo, ...prev]);
    showToast('Ordem de compra de teste criada! Agora você pode simular a liquidação.');
  };

  // Envio de Mensagem no Chat do Assistente Operacional (com suporte a Fotos e Visão de Peças)
  const handleSendMessage = async (text: string, slashCommand?: string, imageBase64?: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender_role: 'user',
      content: text,
      timestamp: timeStr,
      slash_command: slashCommand,
      image_url: imageBase64,
    };

    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          slashCommand,
          imageBase64,
          history: chatMessages.slice(-6),
          rfqs,
          orders,
          sectors,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          sender_role: 'assistant',
          content: data.reply || 'Consulta processada.',
          timestamp: timeStr,
          slash_command: data.agentRole || slashCommand,
          action_card: data.unhomologatedSuppliersFound ? {
            type: 'rfq_scope',
            title: 'Fornecedores de Mercado Identificados',
            metrics: [
              { label: 'Status', value: 'Mercado Aberto' },
              { label: 'Qualificação', value: 'Aguardando RFQ' }
            ],
            actions: [
              { label: '+ Abrir RFQ desta Peça', action: 'create_rfq' }
            ]
          } : undefined,
        };
        setChatMessages((prev) => [...prev, replyMsg]);
        return;
      }
    } catch (e) {
      console.error('Erro ao chamar /api/chat:', e);
    }

    // Fallback caso a API esteja indisponível
    const fallbackMsg: ChatMessage = {
      id: `ast-${Date.now()}`,
      sender_role: 'assistant',
      content:
        'Consulta recebida. Não identificamos fornecedor específico para esse material no cadastro local. Recomenda-se registrar um novo RFQ para cotação direta no mercado.',
      timestamp: timeStr,
    };
    setChatMessages((prev) => [...prev, fallbackMsg]);
  };

  const pendingTasksCount = tasks.filter((t) => t.status === 'needs_you').length;

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="relative min-h-screen bg-[#f8fafc]">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 border border-slate-700 text-white text-xs px-4 py-2.5 rounded-md shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
            <span>{toastMessage}</span>
          </div>
        )}

        <LandingPage
          lang={lang}
          onToggleLang={setLang}
          onOpenLogin={() => setIsLoginOpen(true)}
        />

        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          lang={lang}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-800">
      {/* 1. Sidebar Técnica */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        organization={organization}
        user={currentUser}
        pendingTasksCount={pendingTasksCount}
        lang={lang}
        onLogout={handleLogout}
      />

      {/* Conteúdo Central */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Header com Cmd+K, Simulação e Upload */}
        <Header
          lang={lang}
          onToggleLang={setLang}
          onLogout={handleLogout}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenUploadDoc={() => setIsUploadDocOpen(true)}
          onNewRFQ={() => setIsCreateRFQOpen(true)}
        />

        {/* 3. Área Principal de Trabalho */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-16 right-6 z-50 bg-slate-900 border border-slate-700 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Visão: Painel Inicial Enxuto & Centro de Agentes */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              {/* Barra Executiva de Indicadores em Linha Única */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Decisões Pendentes
                    </span>
                    <span className="text-lg font-bold text-amber-600 leading-tight">
                      {pendingTasksCount}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                    ⚡
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      RFQs em Aberto
                    </span>
                    <span className="text-lg font-bold text-slate-900 leading-tight">
                      {rfqs.length}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284c7] flex items-center justify-center font-bold text-xs">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Economia Negociada
                    </span>
                    <span className="text-lg font-bold text-emerald-600 leading-tight">
                      -4.1%
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Fornecedores Homologados
                    </span>
                    <span className="text-lg font-bold text-slate-900 leading-tight">
                      24
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Centro de Início por Agentes Especializados (Protagonista da Tela) */}
              <AgentWorkspaceChat
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onActionClick={(action) => {
                  if (action === 'approve') {
                    if (tasks.length > 0) handleApproveTask(tasks[0].id);
                    else showToast('Nenhuma decisão pendente para aprovar.');
                  } else if (action === 'create_rfq') {
                    setIsCreateRFQOpen(true);
                  } else {
                    setActiveTab('comparator');
                  }
                }}
                onOpenUploadDoc={() => setIsUploadDocOpen(true)}
                onNewRFQ={() => setIsCreateRFQOpen(true)}
                lang={lang}
              />

              {/* Fluxo Central de Decisões Imediatas ("Precisa de Você") */}
              {tasks.length > 0 && (
                <div className="pt-1">
                  <DecisionStream
                    tasks={tasks}
                    onApproveTask={handleApproveTask}
                    onOpenComparator={() => setActiveTab('comparator')}
                  />
                </div>
              )}
            </div>
          )}

          {/* Visão: Comparador de Cotações (Fase 3) */}
          {activeTab === 'comparator' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-base font-bold text-slate-900">Comparador de Cotações</h1>
                  <p className="text-xs text-slate-500">
                    Análise técnica e financeira com recomendação automatizada de fornecedores.
                  </p>
                </div>
              </div>
              <QuoteComparator
                rfq={rfqs[0]}
                onGeneratePO={handleGeneratePO}
                onOpenCreateRFQ={() => setIsCreateRFQOpen(true)}
              />
            </div>
          )}

          {/* Visão: Requisições (RFQs) */}
          {activeTab === 'rfqs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-base font-bold text-slate-900">Requisições de Compra (RFQs)</h1>
                  <p className="text-xs text-slate-500">Listagem de escopos técnicos e status no mercado.</p>
                </div>
                <button
                  onClick={() => setIsCreateRFQOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo RFQ</span>
                </button>
              </div>

              {rfqs.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">Nenhum pedido de orçamento registrado ainda</p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setIsCreateRFQOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Criar RFQ Manualmente
                    </button>
                    <button
                      onClick={() => setIsUploadDocOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Importar por Documento
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                  {rfqs.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#0284c7] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                          {r.code}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{r.title}</h4>
                        <p className="text-xs text-slate-500">{r.items.length} itens cadastrados • Entrega: {r.target_delivery_date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveTab('comparator')}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer shadow-xs"
                        >
                          Ver Cotações ({r.quotes.length})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Visão: Pedidos de Compra */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-base font-bold text-slate-900">Ordens de Compra & Liquidação On-Chain</h1>
                  <p className="text-xs text-slate-500">
                    Gestão de pedidos aprovados, garantias contratuais e liquidação via Solana Settlement Layer.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    Total de Ordens: <strong className="text-slate-900">{orders.length}</strong>
                  </span>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                  <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">Nenhuma ordem de compra emitida</p>
                  <p className="text-xs text-slate-500">
                    Aprove uma proposta no comparador de cotações ou gere uma ordem para simulação imediata de liquidação.
                  </p>
                  <button
                    onClick={handleCreateTestOrder}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer mx-auto mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Gerar Ordem para Simular Pagamento On-Chain</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((po) => {
                    const isSettled = po.status === 'settled_onchain';
                    const usdEquivalent = Math.round((po.total_amount_brl / 5.60) * 100) / 100;

                    return (
                      <div
                        key={po.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isSettled
                            ? 'bg-white border-emerald-300 shadow-xs ring-1 ring-emerald-500/10'
                            : 'bg-white border-slate-200 shadow-xs'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                {po.po_code}
                              </span>
                              {isSettled ? (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Liquidado On-Chain (Smart Escrow)
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  Aprovado • Pendente de Liquidação
                                </span>
                              )}
                              <span className="text-[11px] text-slate-500">• Emitido: {po.created_at}</span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900">{po.supplier_name}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                              <span>Prazo de entrega: <strong className="text-slate-800">{po.delivery_days} dias</strong></span>
                              {po.rfq_code && <span> • Vinculado à {po.rfq_code}</span>}
                              {po.sector_name && (
                                <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  <MapPin className="w-3 h-3 text-[#0284c7]" /> {po.sector_name}
                                </span>
                              )}
                              {po.is_existing_contractor && (
                                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-semibold">
                                  <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" /> Empresa Mobilizada no Setor (Zero Custo Extra)
                                </span>
                              )}
                            </div>

                            {/* Informações On-Chain se já liquidado */}
                            {isSettled && po.settlement_data && (
                              <div className="mt-2 pt-2 border-t border-emerald-100 flex flex-wrap items-center gap-3 text-[11px] font-mono text-emerald-800">
                                <span>
                                  Slot: <strong>#{po.settlement_data.slot}</strong>
                                </span>
                                <span>•</span>
                                <span>
                                  Taxa: <strong>{po.settlement_data.networkFeeSol} SOL</strong>
                                </span>
                                <span>•</span>
                                <span className="text-slate-500">
                                  Hash: {po.settlement_data.signature.slice(0, 16)}...
                                </span>
                                <a
                                  href={`https://explorer.solana.com/tx/${po.settlement_data.signature}?cluster=devnet`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#0284c7] hover:underline inline-flex items-center gap-0.5 font-sans font-medium"
                                >
                                  Explorer <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col md:items-end justify-between gap-3">
                            <div className="text-left md:text-right">
                              <p className="text-base font-bold text-slate-900 tracking-tight">
                                {po.total_amount_brl.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                })}
                              </p>
                              <p className="text-[11px] font-mono font-semibold text-[#0284c7]">
                                ≈ {usdEquivalent.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                              </p>
                            </div>

                            <div>
                              {isSettled ? (
                                <button
                                  onClick={() => handleOpenSettlement(po)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0284c7] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Ver Protocolo de Custódia</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenSettlement(po)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Liquidar via Solana (Smart Escrow)</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Visão: Setores Operacionais & Frentes de Obra */}
          {activeTab === 'sectors' && (
            <SectorsView
              sectors={sectors}
              onAddSector={handleAddSector}
              onCreateTicket={handleCreateTicket}
            />
          )}

          {/* Visão: Fornecedores Homologados & Consulta Receita Federal */}
          {activeTab === 'suppliers' && (() => {
            const filteredSaved = customSuppliers.filter((sup) => {
              const q = supplierSearchQuery.toLowerCase().trim();
              if (!q) return true;
              return (
                sup.name.toLowerCase().includes(q) ||
                (sup.trade_name && sup.trade_name.toLowerCase().includes(q)) ||
                sup.cnpj.includes(q) ||
                sup.location.toLowerCase().includes(q) ||
                (sup.categories || []).some((c) => c.toLowerCase().includes(q))
              );
            });

            return (
              <div className="space-y-6">
                {/* Cabeçalho da Visão */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-base font-bold text-slate-900">
                      Pesquisa & Homologação de Fornecedores
                    </h1>
                    <p className="text-xs text-slate-500">
                      Consulte qualquer empresa diretamente na base oficial da Receita Federal por CNPJ para homologar e salvar no seu workspace.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreateRFQOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Pedido de Orçamento (RFQ)</span>
                  </button>
                </div>

                {/* Box de Pesquisa de CNPJ na Receita Federal */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Search className="w-4 h-4 text-[#0284c7]" />
                        Pesquisar Fornecedor por CNPJ na Receita Federal
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Informe o CNPJ de qualquer empresa brasileira para extrair Razão Social, Situação Cadastral (Ativa/Baixada), CNAE, Endereço e Quadro de Sócios (QSA).
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSearchReceita();
                    }}
                    className="flex flex-col sm:flex-row items-stretch gap-2.5"
                  >
                    <div className="relative flex-1">
                      <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Digite o CNPJ (ex: 33.000.167/0001-01 ou apenas números)..."
                        value={cnpjQuery}
                        onChange={(e) => setCnpjQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearchingReceita}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] disabled:bg-slate-300 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      {isSearchingReceita ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Consultando Receita...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5" />
                          <span>Consultar na Receita Federal</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Mensagem de Erro da Receita Federal */}
                  {receitaError && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <div>
                        <p className="font-semibold">Erro na consulta</p>
                        <p className="text-[11px] mt-0.5">{receitaError}</p>
                      </div>
                    </div>
                  )}

                  {/* Resultado Oficial da Receita Federal */}
                  {receitaResult && (
                    <div className="p-4 rounded-xl bg-slate-50 border-2 border-[#0284c7]/40 shadow-xs space-y-4 transition-all animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-[#0284c7] text-white px-2 py-0.5 rounded">
                              Dados Oficiais
                            </span>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                                receitaResult.is_active
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              Situação: {receitaResult.status_receita}
                            </span>
                            {receitaSource && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                Fonte: {receitaSource}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-slate-900 mt-1">
                            {receitaResult.name}
                          </h3>
                          {receitaResult.trade_name && (
                            <p className="text-xs text-slate-500 font-medium">
                              Nome Fantasia: {receitaResult.trade_name}
                            </p>
                          )}
                          <p className="text-xs font-mono text-[#0284c7] font-semibold mt-0.5">
                            CNPJ: {receitaResult.cnpj}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSaveSupplier(receitaResult)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
                        >
                          <Check className="w-4 h-4" />
                          <span>Homologar e Salvar no Workspace</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
                        <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                          <p className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#0284c7]" /> Endereço Oficial Cadastrado
                          </p>
                          <p className="text-slate-600">{receitaResult.address || 'Não informado'}</p>
                          <p className="text-[11px] text-slate-400">Município/UF: {receitaResult.location}</p>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                          <p className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#0284c7]" /> Atividade Econômica (CNAE)
                          </p>
                          <p className="text-slate-600 font-medium">{receitaResult.cnae_principal || 'Não informado'}</p>
                          {receitaResult.capital_social > 0 && (
                            <p className="text-[11px] text-slate-500">
                              Capital Social: {receitaResult.capital_social.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                          )}
                        </div>

                        {receitaResult.qsa && receitaResult.qsa.length > 0 && (
                          <div className="bg-white p-3 rounded-lg border border-slate-200 md:col-span-2 space-y-1">
                            <p className="text-[11px] font-bold text-slate-900">
                              Quadro de Sócios e Administradores (QSA):
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {receitaResult.qsa.map((socio: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200"
                                >
                                  <strong>{socio.name}</strong> ({socio.role})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Lista de Fornecedores Homologados no Workspace */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Fornecedores Homologados no Workspace ({customSuppliers.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        {customSuppliers.length === 0
                          ? 'Zero dados fictícios. Homologue empresas reais através da consulta da Receita Federal acima.'
                          : 'Empresas validadas com CNPJ ativo e prontas para receber RFQs.'}
                      </p>
                    </div>

                    {customSuppliers.length > 0 && (
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Filtrar fornecedores salvos..."
                          value={supplierSearchQuery}
                          onChange={(e) => setSupplierSearchQuery(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Estado Vazio (Sem nenhum mock) */}
                  {customSuppliers.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-[#0284c7] flex items-center justify-center mx-auto">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Nenhum fornecedor cadastrado no workspace
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Nenhum fornecedor cadastrado. Digite qualquer CNPJ de empresa brasileira no campo de busca acima para puxar os dados oficiais da <strong>Receita Federal</strong> e homologá-la no seu workspace.
                      </p>
                    </div>
                  ) : filteredSaved.length === 0 ? (
                    <div className="p-6 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                      Nenhum fornecedor corresponde ao filtro de busca &ldquo;{supplierSearchQuery}&rdquo;.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredSaved.map((sup) => (
                        <div
                          key={sup.id}
                          className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 transition-all bg-white shadow-xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-bold text-slate-900">{sup.name}</h4>
                              {sup.trade_name && (
                                <p className="text-xs text-slate-500">{sup.trade_name}</p>
                              )}
                              <p className="text-[11px] font-mono text-[#0284c7] font-semibold">
                                CNPJ: {sup.cnpj}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                                🟢 {sup.status_receita || 'ATIVA'}
                              </span>
                              <button
                                type="button"
                                title="Remover fornecedor"
                                onClick={() => handleRemoveSupplier(sup.id, sup.name)}
                                className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            {sup.address && (
                              <p className="flex items-start gap-1.5 text-slate-700">
                                <MapPin className="w-3.5 h-3.5 text-[#0284c7] shrink-0 mt-0.5" />
                                <span>{sup.address}</span>
                              </p>
                            )}
                            {sup.cnae_principal && (
                              <p className="text-[11px] text-slate-500">
                                <strong>CNAE:</strong> {sup.cnae_principal}
                              </p>
                            )}
                            {(sup.phone || sup.email) && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-2 pt-0.5">
                                {sup.phone && <span>📞 {sup.phone}</span>}
                                {sup.email && <span>✉️ {sup.email}</span>}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              Homologado via Receita Federal
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                showToast(`Abrindo solicitação de cotação para ${sup.name}...`);
                                setIsCreateRFQOpen(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0284c7] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                            >
                              <Zap className="w-3 h-3 text-[#0284c7]" />
                              <span>Solicitar Cotação / RFQ</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        </main>
      </div>


      {/* 5. Modal de Paleta de Comandos (Cmd+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectAction={(action) => {
          if (action === 'open_comparator') setActiveTab('comparator');
          else if (action === 'open_rfq') setActiveTab('rfqs');
          else if (action === 'open_supplier') setActiveTab('suppliers');
        }}
      />


      {/* 7. Modal de Criação Real de Pedido de Orçamento (RFQ) */}
      <CreateRFQModal
        isOpen={isCreateRFQOpen}
        onClose={() => setIsCreateRFQOpen(false)}
        onCreateRFQ={handleCreateRFQ}
        sectors={sectors}
      />

      {/* 8. Modal de Upload e Conferência de Documentos */}
      <DocumentUploadModal
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
        onDocumentExtracted={handleDocumentExtracted}
      />

      {/* 9. Modal de Liquidação On-Chain Solana */}
      <SolanaSettlementModal
        order={selectedOrderForSettlement}
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        onSettlementComplete={handleSettlementComplete}
      />

      {/* 10. Modal de Revisão e Confirmação da Cotação / Emissão de PO */}
      <OrderConfirmationModal
        quote={selectedQuoteForConfirmation}
        rfq={rfqs[0]}
        sectors={sectors}
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirmOrder={handleConfirmOrder}
      />
    </div>
  );
}

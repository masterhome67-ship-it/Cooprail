'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DecisionStream } from '@/components/DecisionStream';
import { QuoteComparator } from '@/components/QuoteComparator';
import { AiCopilotDock } from '@/components/AiCopilotDock';
import { CommandPaletteModal } from '@/components/CommandPaletteModal';
import { ProjectSimulatorModal } from '@/components/ProjectSimulatorModal';
import { CreateRFQModal } from '@/components/CreateRFQModal';
import { DocumentUploadModal } from '@/components/DocumentUploadModal';
import { SolanaSettlementModal, PurchaseOrderRecord } from '@/components/SolanaSettlementModal';
import { OrderConfirmationModal } from '@/components/OrderConfirmationModal';
import { SectorsView, OperationalTicketData } from '@/components/SectorsView';
import { LandingPage } from '@/components/LandingPage';
import { LoginModal } from '@/components/LoginModal';
import { Language, translations } from '@/lib/translations';
import { SettlementResult } from '@/lib/solanaSettlement';
import { qualifiedSuppliers } from '@/lib/suppliersData';
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
  Sparkles
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
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isCreateRFQOpen, setIsCreateRFQOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [selectedQuoteForConfirmation, setSelectedQuoteForConfirmation] = useState<Quote | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedOrderForSettlement, setSelectedOrderForSettlement] = useState<PurchaseOrderRecord | null>(null);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      title: `Decisão de Suprimentos: ${newRFQ.title}`,
      description: `Auditoria de conformidade extraiu a proposta comercial. Fornecedor ${newRFQ.quotes[0]?.supplier_name} com índice de adesão ${newRFQ.quotes[0]?.ai_score}/10.`,
      status: 'needs_you',
      priority: 'high',
      category: 'quote_decision',
      due_date: 'Hoje',
      badge_text: 'Proposta Homologada',
    };
    setTasks((prev) => [newTask, ...prev]);

    showToast(`Documento processado! Proposta de ${newRFQ.quotes[0]?.supplier_name} analisada.`);
    setActiveTab('comparator');

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const docChatMsg: ChatMessage = {
      id: `msg-doc-${Date.now()}`,
      sender_role: 'assistant',
      content: `A proposta comercial foi processada e conferida. Identificada cotação de ${newRFQ.quotes[0]?.supplier_name} no montante de ${newRFQ.quotes[0]?.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. A decisão foi registrada na esteira operacional.`,
      timestamp: timeStr,
      action_card: {
        type: 'quote_recommendation',
        title: `Proposta: ${newRFQ.quotes[0]?.supplier_name}`,
        metrics: [
          {
            label: 'Valor',
            value: newRFQ.quotes[0]?.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || '',
          },
          { label: 'Prazo', value: `${newRFQ.quotes[0]?.delivery_lead_time_days} dias` },
          { label: 'Adesão Técnica', value: `${newRFQ.quotes[0]?.ai_score} / 10` },
        ],
        actions: [{ label: 'Emitir Pedido de Compra', action: 'approve' }],
      },
    };
    setChatMessages((prev) => [...prev, docChatMsg]);
  };

  const handleCreateRFQ = (newRFQ: RFQ) => {
    setRfqs((prev) => [newRFQ, ...prev]);

    const newTask: Task = {
      id: `task-rfq-${Date.now()}`,
      title: `Disparar solicitação de cotação para ${newRFQ.code} (${newRFQ.title})`,
      description: `Pedido de orçamento publicado no mercado. Motor de qualificação identificou fornecedores aptos cadastrados. Aguardando recebimento de propostas comerciais.`,
      status: 'waiting_others',
      priority: 'medium',
      category: 'rfq_review',
      due_date: newRFQ.deadline,
      badge_text: 'Aguardando Fornecedores',
    };
    setTasks((prev) => [newTask, ...prev]);

    showToast(`Pedido de Orçamento ${newRFQ.code} publicado! Aguardando cotações.`);
    setActiveTab('rfqs');

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const rfqChatMsg: ChatMessage = {
      id: `msg-rfq-${Date.now()}`,
      sender_role: 'assistant',
      content: `O pedido de orçamento ${newRFQ.code} ("${newRFQ.title}") foi publicado. O motor de qualificação identificou as empresas homologadas para este escopo. Quando receber as propostas em PDF, clique em "Ler Proposta (PDF)" para auditá-las.`,
      timestamp: timeStr,
    };
    setChatMessages((prev) => [...prev, rfqChatMsg]);
  };

  const handleCompleteSimulation = (newRFQ: RFQ, newTask: Task) => {
    setRfqs((prev) => [newRFQ, ...prev]);
    setTasks((prev) => [newTask, ...prev]);
    showToast('Projeto simulado! RFQ-2026-002 e decisão gerados pelos 4 agentes.');

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const autoLogMsg: ChatMessage = {
      id: `sim-log-${Date.now()}`,
      sender_role: 'assistant',
      content:
        'Pipeline dos 4 Agentes finalizado para o projeto RFQ-2026-002 (Molas Helicoidais). A recomendação da Molas Sul Industrial (R$ 39.800,00) foi inserida na sua aba "Precisa de você".',
      timestamp: timeStr,
      action_card: {
        type: 'quote_recommendation',
        title: 'Recomendação: Molas Sul Industrial Ltda',
        metrics: [
          { label: 'Valor', value: 'R$ 39.800,00' },
          { label: 'Economia', value: 'R$ 5.200,00 (-11.5%)' },
          { label: 'Entrega', value: '12 dias' },
          { label: 'Score IA', value: '9.4 / 10' },
        ],
        actions: [{ label: 'Ver no Comparador', action: 'inspect' }],
      },
    };
    setChatMessages((prev) => [...prev, autoLogMsg]);
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

  // Envio de Mensagem no Chat do Assistente Operacional
  const handleSendMessage = async (text: string, slashCommand?: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender_role: 'user',
      content: text,
      timestamp: timeStr,
      slash_command: slashCommand,
    };

    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          slashCommand,
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d14] text-[#f1f5f9]">
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
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onOpenUploadDoc={() => setIsUploadDocOpen(true)}
          onNewRFQ={() => setIsCreateRFQOpen(true)}
        />

        {/* 3. Área Principal de Trabalho */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-16 right-6 z-50 bg-[#0f172a] border border-[#0284c7] text-white text-xs px-4 py-2.5 rounded-md shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Visão: Painel & Decisões (Fases 1 e 2) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Card de Configuração Inicial / Onboarding para Novo Usuário */}
              {sectors.length === 0 && (
                <div className="p-5 rounded-xl border border-[#0284c7]/40 bg-gradient-to-r from-[#0b1624] via-[#0d1b2d] to-[#09111c] space-y-3.5 shadow-xl animate-in fade-in">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0284c7]/20 text-[#38bdf8] font-bold border border-[#0284c7]/40 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#38bdf8]" />
                          {lang === 'pt' ? 'NOVO WORKSPACE EXCLUSIVO' : 'NEW DEDICATED WORKSPACE'}
                        </span>
                        <span className="text-xs text-slate-300 font-semibold">
                          {currentUser.company_name}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {lang === 'pt'
                          ? 'Ambiente Pronto do Zero: Inicie Cadastrando suas Unidades Operacionais'
                          : 'Workspace Ready from Scratch: Begin by Setting Up Your Operational Units'}
                      </h3>
                      <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                        {lang === 'pt'
                          ? 'Para aproveitar o diferencial de acionar empresas e prestadores que já estão atuando em suas plantas ou canteiros (eliminando custos de mobilização e frete), cadastre sua primeira unidade de operação.'
                          : 'To leverage the strategic advantage of contracting vendors already mobilized on-site (eliminating mobilization fees), start by registering your first operational unit.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('sectors')}
                      className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{lang === 'pt' ? 'Cadastrar Unidades & Setores' : 'Setup Units & Sectors'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Métricas Operacionais Resumidas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded border border-[#1c2636] bg-[#111722]">
                  <p className="text-[11px] text-slate-400">Decisões Pendentes</p>
                  <p className="text-xl font-bold text-amber-400 mt-1">{pendingTasksCount}</p>
                </div>
                <div className="p-3.5 rounded border border-[#1c2636] bg-[#111722]">
                  <p className="text-[11px] text-slate-400">RFQs em Andamento</p>
                  <p className="text-xl font-bold text-white mt-1">{rfqs.length}</p>
                </div>
                <div className="p-3.5 rounded border border-[#1c2636] bg-[#111722]">
                  <p className="text-[11px] text-slate-400">Economia Média de Cotações</p>
                  <div className="flex items-center gap-1 text-emerald-400 mt-1">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-xl font-bold">4.1%</span>
                  </div>
                </div>
                <div className="p-3.5 rounded border border-[#1c2636] bg-[#111722]">
                  <p className="text-[11px] text-slate-400">Fornecedores Homologados</p>
                  <p className="text-xl font-bold text-white mt-1">24</p>
                </div>
              </div>

              {/* Fluxo Central "Precisa de Você" */}
              <DecisionStream
                tasks={tasks}
                onApproveTask={handleApproveTask}
                onOpenComparator={() => setActiveTab('comparator')}
              />

              {/* Prévia do Comparador de Cotações ou Onboarding inicial */}
              {rfqs.length > 0 ? (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-slate-300">
                      Cotação em Foco: {rfqs[0].code}
                    </h3>
                    <button
                      onClick={() => setActiveTab('comparator')}
                      className="text-xs text-[#38bdf8] hover:underline font-medium cursor-pointer"
                    >
                      Ver comparador completo →
                    </button>
                  </div>
                  <QuoteComparator rfq={rfqs[0]} onGeneratePO={handleGeneratePO} />
                </div>
              ) : (
                <div className="p-8 rounded border border-[#1e2a3b] bg-[#0d131c] text-center space-y-4">
                  <div className="w-12 h-12 rounded bg-[#131f2f] border border-[#1e344e] flex items-center justify-center text-[#38bdf8] mx-auto">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Ambiente de Compras Inicializado (Sem Dados Mocados)
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      Você pode criar um pedido de orçamento agora ou enviar um documento em PDF/planilha para o Agente Leitor de Cotações fazer a extração automática.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      onClick={() => setIsCreateRFQOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Criar Primeiro RFQ</span>
                    </button>
                    <button
                      onClick={() => setIsUploadDocOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#132338] hover:bg-[#1a2f4a] border border-[#1e3c5e] text-[#38bdf8] text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload de Documento (PDF)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Visão: Comparador de Cotações (Fase 3) */}
          {activeTab === 'comparator' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-base font-bold text-white">Comparador de Cotações</h1>
                  <p className="text-xs text-slate-400">
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
                  <h1 className="text-base font-bold text-white">Requisições de Compra (RFQs)</h1>
                  <p className="text-xs text-slate-400">Listagem de escopos técnicos e status no mercado.</p>
                </div>
                <button
                  onClick={() => setIsCreateRFQOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo RFQ</span>
                </button>
              </div>

              {rfqs.length === 0 ? (
                <div className="p-8 text-center rounded border border-[#1c2636] bg-[#0d131c] space-y-3">
                  <FileText className="w-8 h-8 text-slate-500 mx-auto opacity-60" />
                  <p className="text-xs font-medium text-slate-300">Nenhum pedido de orçamento registrado ainda</p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setIsCreateRFQOpen(true)}
                      className="px-3 py-1.5 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold cursor-pointer"
                    >
                      Criar RFQ Manualmente
                    </button>
                    <button
                      onClick={() => setIsUploadDocOpen(true)}
                      className="px-3 py-1.5 rounded bg-[#132338] hover:bg-[#1a2f4a] border border-[#1e3c5e] text-[#38bdf8] text-xs font-semibold cursor-pointer"
                    >
                      Importar por Documento
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded border border-[#1c2636] bg-[#111722] space-y-3">
                  {rfqs.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded bg-[#0b0f17] border border-[#1a2536]">
                      <div>
                        <span className="text-[10px] font-mono text-[#38bdf8] bg-[#0d1c2d] px-1.5 py-0.5 rounded">
                          {r.code}
                        </span>
                        <h4 className="text-sm font-semibold text-white mt-1">{r.title}</h4>
                        <p className="text-xs text-slate-400">{r.items.length} itens cadastrados • Entrega: {r.target_delivery_date}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('comparator')}
                        className="px-3 py-1.5 rounded bg-[#182332] hover:bg-[#202e42] text-xs font-medium text-slate-200 cursor-pointer"
                      >
                        Ver Cotações ({r.quotes.length})
                      </button>
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
                  <h1 className="text-base font-bold text-white">Ordens de Compra & Liquidação On-Chain</h1>
                  <p className="text-xs text-slate-400">
                    Gestão de pedidos aprovados, garantias contratuais e liquidação via Solana Settlement Layer.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-300 bg-[#121a26] px-2.5 py-1 rounded border border-[#1e2c3e]">
                    Total de Ordens: <strong className="text-white">{orders.length}</strong>
                  </span>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 text-center rounded border border-[#1c2636] bg-[#0d131c] space-y-3">
                  <ShoppingBag className="w-8 h-8 text-slate-500 mx-auto opacity-60" />
                  <p className="text-xs font-medium text-slate-300">Nenhuma ordem de compra emitida</p>
                  <p className="text-xs text-slate-500">
                    Aprove uma proposta no comparador de cotações ou gere uma ordem para simulação imediata de liquidação.
                  </p>
                  <button
                    onClick={handleCreateTestOrder}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-md transition-all cursor-pointer mx-auto mt-2"
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
                        className={`p-4 rounded-lg border transition-all ${
                          isSettled
                            ? 'bg-[#0b1319] border-emerald-800/60'
                            : 'bg-[#101722] border-[#1e2a3c]'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold text-[#38bdf8] bg-[#0b1928] px-2 py-0.5 rounded border border-[#143352]">
                                {po.po_code}
                              </span>
                              {isSettled ? (
                                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" /> Liquidado On-Chain (Smart Escrow)
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                                  Aprovado • Pendente de Liquidação
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400">• Emitido: {po.created_at}</span>
                            </div>

                            <h4 className="text-sm font-semibold text-white">{po.supplier_name}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                              <span>Prazo de entrega: <strong className="text-slate-300">{po.delivery_days} dias</strong></span>
                              {po.rfq_code && <span> • Vinculado à {po.rfq_code}</span>}
                              {po.sector_name && (
                                <span className="flex items-center gap-1 text-slate-300 bg-[#0d1624] px-2 py-0.5 rounded border border-[#172b44]">
                                  <MapPin className="w-3 h-3 text-[#38bdf8]" /> {po.sector_name}
                                </span>
                              )}
                              {po.is_existing_contractor && (
                                <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 text-[10px] font-semibold">
                                  <Zap className="w-3 h-3 fill-emerald-400" /> Empresa Mobilizada no Setor (Zero Custo Extra)
                                </span>
                              )}
                            </div>

                            {/* Informações On-Chain se já liquidado */}
                            {isSettled && po.settlement_data && (
                              <div className="mt-2 pt-2 border-t border-emerald-950/80 flex flex-wrap items-center gap-3 text-[11px] font-mono text-emerald-300/90">
                                <span>
                                  Slot: <strong>#{po.settlement_data.slot}</strong>
                                </span>
                                <span>•</span>
                                <span>
                                  Taxa: <strong>{po.settlement_data.networkFeeSol} SOL</strong>
                                </span>
                                <span>•</span>
                                <span className="text-slate-400">
                                  Hash: {po.settlement_data.signature.slice(0, 16)}...
                                </span>
                                <a
                                  href={`https://explorer.solana.com/tx/${po.settlement_data.signature}?cluster=devnet`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#38bdf8] hover:underline inline-flex items-center gap-0.5"
                                >
                                  Explorer <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col md:items-end justify-between gap-3">
                            <div className="text-left md:text-right">
                              <p className="text-base font-bold text-white tracking-tight">
                                {po.total_amount_brl.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                })}
                              </p>
                              <p className="text-[11px] font-mono text-[#38bdf8]">
                                ≈ {usdEquivalent.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                              </p>
                            </div>

                            <div>
                              {isSettled ? (
                                <button
                                  onClick={() => handleOpenSettlement(po)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#102230] hover:bg-[#162e42] border border-[#1b3d5c] text-[#38bdf8] text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Ver Protocolo de Custódia</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenSettlement(po)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
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

          {/* Visão: Fornecedores Homologados */}
          {activeTab === 'suppliers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-base font-bold text-white">Fornecedores Homologados & Aptos</h1>
                  <p className="text-xs text-slate-400">
                    Base cadastral com CNPJ, conformidade técnica, certificações e especialidades atendidas.
                  </p>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800 font-medium">
                  {qualifiedSuppliers.length} Empresas Qualificadas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {qualifiedSuppliers.map((sup) => (
                  <div
                    key={sup.id}
                    className="p-4 rounded border border-[#1c2636] bg-[#111722] space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{sup.name}</h4>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">CNPJ: {sup.cnpj}</p>
                      </div>
                      <span className="text-[10px] bg-emerald-950/80 text-emerald-400 font-semibold px-2 py-0.5 rounded border border-emerald-800/60 shrink-0">
                        {sup.status === 'homologado' ? 'Homologado' : 'Em Auditoria'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1 bg-[#0b0f17] p-2.5 rounded border border-[#1a2536]">
                      <p>
                        <span className="text-slate-400">Contato: </span>
                        {sup.contact_name} • {sup.email} • {sup.phone}
                      </p>
                      <p>
                        <span className="text-slate-400">Prazo Médio: </span>
                        {sup.lead_time_avg_days} dias corridos • Faturamento: {sup.payment_terms_standard}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold mb-1">Especialidades:</p>
                      <div className="flex flex-wrap gap-1">
                        {sup.categories.map((cat, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-[#162335] text-[#38bdf8] px-2 py-0.5 rounded border border-[#1f334d]"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold mb-1">Certificações:</p>
                      <div className="flex flex-wrap gap-1">
                        {sup.certifications.map((cert, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-[#18202c] text-slate-300 px-2 py-0.5 rounded border border-[#232f3f]"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visão: Configurações */}
          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-base font-bold text-white">Configurações da Organização</h1>
              <div className="p-4 rounded border border-[#1c2636] bg-[#111722] space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nome da Empresa</label>
                  <input
                    type="text"
                    defaultValue="Juliano's Organization"
                    className="w-full bg-[#0b0f17] border border-[#223043] rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Rodapé Padrão dos RFQs</label>
                  <input
                    type="text"
                    defaultValue="Termos de confidencialidade padrão aplicados."
                    className="w-full bg-[#0b0f17] border border-[#223043] rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">URL do Supabase</label>
                  <input
                    type="text"
                    placeholder="https://seu-projeto.supabase.co"
                    className="w-full bg-[#0b0f17] border border-[#223043] rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <button
                  onClick={() => showToast('Configurações salvas.')}
                  className="px-3 py-1.5 rounded bg-[#0284c7] hover:bg-[#0369a1] text-xs font-medium text-white"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 4. Dock Lateral: Copiloto de IA Conversacional (Fase 4) */}
      <AiCopilotDock
        messages={chatMessages}
        onOpenUploadDoc={() => setIsUploadDocOpen(true)}
        onSendMessage={handleSendMessage}
        onActionClick={(action) => {
          if (action === 'approve') {
            if (tasks.length > 0) handleApproveTask(tasks[0].id);
            else showToast('Nenhuma decisão pendente para aprovar.');
          } else {
            setActiveTab('comparator');
          }
        }}
      />

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

      {/* 6. Modal do Simulador de Ciclo com os 4 Agentes */}
      <ProjectSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onCompleteSimulation={handleCompleteSimulation}
      />

      {/* 7. Modal de Criação Real de Pedido de Orçamento (RFQ) */}
      <CreateRFQModal
        isOpen={isCreateRFQOpen}
        onClose={() => setIsCreateRFQOpen(false)}
        onCreateRFQ={handleCreateRFQ}
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

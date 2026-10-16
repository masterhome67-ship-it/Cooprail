'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { QuoteComparator } from '@/components/QuoteComparator';
import { AgentWorkspaceChat } from '@/components/AgentWorkspaceChat';
import { CommandPaletteModal } from '@/components/CommandPaletteModal';
import { CreateRFQModal } from '@/components/CreateRFQModal';
import { DocumentUploadModal } from '@/components/DocumentUploadModal';
import { SolanaSettlementModal, PurchaseOrderRecord } from '@/components/SolanaSettlementModal';
import { OrderConfirmationModal } from '@/components/OrderConfirmationModal';
import { FiscalCertificateModal } from '@/components/FiscalCertificateModal';
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
  getHelpAgentInitialMessage,
} from '@/lib/userWorkspace';
import {
  detectQuotationIntent,
  parseQuotationParams,
  executeAutonomousQuotation,
} from '@/lib/autonomousQuotation';
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
  Pencil,
  Users,
  Eye,
  Clock,
} from 'lucide-react';
import { TeamBuyersView, TeamMember } from '@/components/TeamBuyersView';


export default function Home() {
  const [lang, setLang] = useState<Language>('pt');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<RegisteredAccount | null>(null);
  const [organization, setOrganization] = useState<Organization>(initialOrganization);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRfqId, setSelectedRfqId] = useState<string>('');
  const [editingRFQ, setEditingRFQ] = useState<RFQ | null>(null);
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
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
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

    setSelectedRfqId(newRFQ.id);
    showToast(
      newRFQ.quotes.length > 0
        ? `Cotação ${newRFQ.code} aberta com ${newRFQ.quotes.length} fornecedores identificados! Compare propostas no comparador.`
        : `Cotação ${newRFQ.code} aberta com sucesso! Copie o link do portal para as empresas ou dispare via WhatsApp.`
    );
    setActiveTab('comparator');

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const rfqChatMsg: ChatMessage = {
      id: `msg-rfq-${Date.now()}`,
      sender_role: 'assistant',
      content: `A Requisição de Cotação ${newRFQ.code} ("${newRFQ.title}") foi aberta na esteira de compras. Há ${newRFQ.quotes.length} proposta(s) pronta(s). Envie o link do portal para fornecedores ou busque mais cotações no Comparador antes de emitir a Ordem de Compra formal.`,
      timestamp: timeStr,
      action_card: {
        type: 'quote_recommendation',
        title: `Cotação em Aberto: ${newRFQ.code}`,
        metrics: [
          { label: 'Propostas', value: `${newRFQ.quotes.length} recebida(s)` },
          { label: 'Teto Máx', value: newRFQ.estimated_budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
        ],
        actions: [{ label: 'Abrir no Comparador', action: 'inspect' }],
      },
    };
    setChatMessages((prev) => [...prev, rfqChatMsg]);
  };

  const handleUpdateRFQ = (updatedRFQ: RFQ) => {
    setRfqs((prev) => prev.map((r) => (r.id === updatedRFQ.id ? updatedRFQ : r)));
    setEditingRFQ(null);
    showToast(`Requisição ${updatedRFQ.code} atualizada com sucesso!`);
  };

  const handleDeleteRFQ = (rfqId: string, rfqTitle: string) => {
    if (window.confirm(`Deseja realmente excluir a requisição "${rfqTitle}"?`)) {
      setRfqs((prev) => prev.filter((r) => r.id !== rfqId));
      if (selectedRfqId === rfqId) {
        setSelectedRfqId('');
      }
      showToast('Requisição de compra excluída.');
    }
  };

  const handleConfirmRFQ = (rfqId: string) => {
    setRfqs((prev) =>
      prev.map((r) => (r.id === rfqId ? { ...r, status: 'published' as const } : r))
    );
    showToast('Requisição confirmada e aberta para cotações no mercado!');
  };

  const handleEditRFQ = (rfq: RFQ) => {
    setEditingRFQ(rfq);
    setIsCreateRFQOpen(true);
  };

  const handleGoToComparator = (rfqId: string) => {
    setSelectedRfqId(rfqId);
    setActiveTab('comparator');
    showToast('Requisição carregada no Comparador de Cotações!');
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
    const itemsSummary =
      ticket.items && ticket.items.length > 0
        ? ticket.items.map((i) => `${i.quantity} ${i.unit} de ${i.name}${i.spec ? ` [${i.spec}]` : ''}`).join('; ')
        : ticket.item_description || 'Itens diversos';
    const imagesNote =
      ticket.images && ticket.images.length > 0
        ? ` 📸 Contém ${ticket.images.length} imagem(ns) técnica(s) em anexo.`
        : '';

    const newTask: Task = {
      id: newTaskId,
      title: `Chamado Técnico: ${ticket.title || ticket.item_description || 'Demanda do Canteiro'}`,
      description: `Chamado aberto pelo setor ${ticket.sector_name}. Itens requisitados: ${itemsSummary}.${imagesNote} Justificativa: ${ticket.justification || 'Necessidade operacional de campo'}.${ticket.suggested_contractor ? ` Fornecedor in-loco sugerido: ${ticket.suggested_contractor}.` : ''} O Setor de Compras deve analisar e abrir cotação formal.`,
      status: 'needs_you',
      priority: ticket.urgency === 'emergencial' ? 'urgent' : ticket.urgency === 'alta' ? 'high' : 'medium',
      category: 'quote_decision',
      due_date: ticket.urgency === 'emergencial' ? 'Imediato (Urgência)' : 'Hoje',
      badge_text: 'Chamado de Suprimentos',
    };

    setTasks((prev) => [newTask, ...prev]);
    showToast(`Chamado "${ticket.title || 'Demanda'}" encaminhado ao Setor de Compras com sucesso!`);
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

    // 1. FLUXO AUTÔNOMO: Se a mensagem contiver intenção de cotação / busca de materiais
    if (detectQuotationIntent(text)) {
      try {
        const params = parseQuotationParams(text);
        const { rfq: newRFQ, quotes, summaryText } = await executeAutonomousQuotation(params);

        // Atualiza a esteira de RFQs e seleciona para o Comparador
        setRfqs((prev) => [newRFQ, ...prev]);
        setSelectedRfqId(newRFQ.id);

        // Gera a pendência de decisão imediata na esteira
        const hasQuotes = quotes && quotes.length > 0;
        const newTask: Task = {
          id: `task-auto-${Date.now()}`,
          title: hasQuotes
            ? `Decisão de Compra: ${newRFQ.code} (${quotes.length} Cotações Prontas)`
            : `Cotação Ativa: Aguardando Propostas para ${newRFQ.code}`,
          description: hasQuotes
            ? `Cotação realizada para ${params.quantity} ${params.unit} de ${params.material} em ${params.location}. Melhor oferta: ${quotes[0].supplier_name} (${quotes[0].total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}).`
            : `Requisição ${newRFQ.code} aberta no mercado para ${params.quantity} ${params.unit} de ${params.material}. Aguardando propostas pelo Portal do Parceiro ou inserção manual.`,
          status: 'needs_you',
          priority: 'high',
          category: 'quote_decision',
          due_date: newRFQ.deadline,
          badge_text: hasQuotes ? 'Cotação Pronta' : 'Aguardando Propostas',
        };
        setTasks((prev) => [newTask, ...prev]);

        // Responde no Chat com Card Interativo de Decisão
        const autoReplyMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          sender_role: 'assistant',
          content: summaryText,
          timestamp: timeStr,
          slash_command: '/demandas',
          action_card: hasQuotes
            ? {
                type: 'quote_recommendation',
                title: `Cotação Autônoma: ${newRFQ.code}`,
                metrics: [
                  {
                    label: 'Melhor Oferta',
                    value: quotes[0].total_amount.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }),
                  },
                  { label: 'Fornecedor', value: quotes[0].supplier_name },
                  { label: 'Prazo', value: `${quotes[0].delivery_lead_time_days} dia(s)` },
                ],
                actions: [
                  { label: '📊 Abrir no Comparador', action: 'inspect' },
                  { label: '✓ Aprovar Menor Preço', action: 'approve' },
                ],
              }
            : {
                type: 'rfq_scope',
                title: `Requisição Aberta no Mercado: ${newRFQ.code}`,
                metrics: [
                  {
                    label: 'Orçamento Teto',
                    value: newRFQ.estimated_budget.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }),
                  },
                  { label: 'Status', value: 'Aguardando Propostas' },
                  { label: 'Prazo', value: newRFQ.deadline || 'Em 24h' },
                ],
                actions: [
                  { label: '📊 Ver no Comparador de Cotações', action: 'inspect' },
                ],
              },
        };

        setChatMessages((prev) => [...prev, autoReplyMsg]);
        showToast(
          hasQuotes
            ? `Cotação ${newRFQ.code} coletada com ${quotes.length} fornecedores!`
            : `Requisição ${newRFQ.code} aberta com sucesso! Aguardando propostas.`
        );
        return;
      } catch (err) {
        console.warn('Fallback da cotação autônoma para chat padrão:', err);
      }
    }

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

  const handleClearChat = () => {
    const initialMsg = getHelpAgentInitialMessage();
    setChatMessages([initialMsg]);
    if (currentUser) {
      const key = `cooprail_workspace_tenant_${currentUser.id}`;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.chatMessages = [initialMsg];
          localStorage.setItem(key, JSON.stringify(parsed));
        }
      } catch (e) {
        console.error('Erro ao limpar chat:', e);
      }
    }
    showToast('Histórico limpo. Pronto para nova pesquisa!');
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
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* 2. Header com Cmd+K, Simulação e Upload */}
        <Header
          lang={lang}
          onToggleLang={setLang}
          onLogout={handleLogout}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenUploadDoc={() => setIsUploadDocOpen(true)}
          onNewRFQ={() => setIsCreateRFQOpen(true)}
          onOpenCertificateModal={() => setIsCertModalOpen(true)}
        />

        {/* 3. Área Principal de Trabalho */}
        <main
          className={`flex-1 ${
            activeTab === 'dashboard'
              ? 'overflow-hidden p-4 sm:p-5 flex flex-col min-h-0'
              : 'overflow-y-auto p-6 space-y-6'
          }`}
        >
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-16 right-6 z-50 bg-slate-900 border border-slate-700 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Visão: Painel Inicial — Exclusivo dos Agentes Especializados */}
          {activeTab === 'dashboard' && (
            <div className="flex-1 h-full min-h-0 flex flex-col">
              {/* Centro de Início por Agentes Especializados (Protagonista Exclusivo do Painel) */}
              <AgentWorkspaceChat
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onClearChat={handleClearChat}
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
            </div>
          )}

          {/* Visão: Comparador de Cotações (Fase 3) */}
          {activeTab === 'comparator' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-base font-bold text-slate-900">Comparador de Cotações</h1>
                  <p className="text-xs text-slate-500">
                    Análise técnica e financeira de propostas com busca de mercado aberto em tempo real.
                  </p>
                </div>

                {rfqs.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">RFQ:</span>
                    <select
                      value={selectedRfqId || rfqs[0]?.id}
                      onChange={(e) => setSelectedRfqId(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#0284c7]"
                    >
                      {rfqs.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.code} - {r.title.slice(0, 35)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <QuoteComparator
                rfq={rfqs.find((r) => r.id === selectedRfqId) || rfqs[0]}
                onGeneratePO={handleGeneratePO}
                onOpenCreateRFQ={() => setIsCreateRFQOpen(true)}
                onUpdateQuotes={(rfqId, updatedQuotes) => {
                  setRfqs((prev) =>
                    prev.map((r) => (r.id === rfqId ? { ...r, quotes: updatedQuotes } : r))
                  );
                  showToast('Cotações de mercado atualizadas no comparador!');
                }}
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
                  {rfqs.map((r) => {
                    const isPublished = r.status === 'published';
                    const isAwarded = r.status === 'awarded';

                    return (
                      <div
                        key={r.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-[#0284c7] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                              {r.code}
                            </span>

                            {isAwarded ? (
                              <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-[#0284c7]" /> Concluída / Homologada
                              </span>
                            ) : isPublished ? (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aberta para Cotações
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" /> Rascunho / Pendente de Confirmação
                              </span>
                            )}

                            {r.location && (
                              <span className="text-[10px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 text-[#0284c7]" /> {r.location}
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-slate-900">{r.title}</h4>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>
                              Itens: <strong className="text-slate-700">{r.items.length} cadastrado(s)</strong>
                            </span>
                            <span>
                              Entrega: <strong className="text-slate-700">{r.target_delivery_date}</strong>
                            </span>
                            <span>
                              Prazo de Propostas: <strong className="text-slate-700">{r.deadline}</strong>
                            </span>
                            {r.estimated_budget > 0 && (
                              <span>
                                Teto Orçado:{' '}
                                <strong className="text-slate-800">
                                  {r.estimated_budget.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                  })}
                                </strong>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ações da Requisição */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleGoToComparator(r.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                            title="Abrir no Comparador de Cotações para buscar fornecedores"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>Ver Cotações ({r.quotes.length})</span>
                          </button>

                          {!isPublished && !isAwarded && (
                            <button
                              onClick={() => handleConfirmRFQ(r.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold transition-colors cursor-pointer"
                              title="Confirmar e abrir requisição para fornecedores"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirmar</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleEditRFQ(r)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                            title="Ajustar itens, quantidades ou prazos"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-500" />
                            <span>Ajustar</span>
                          </button>

                          <button
                            onClick={() => handleDeleteRFQ(r.id, r.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                            title="Excluir requisição"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Visão: Pedidos de Compra (PO Corporativo - Sem Solana) */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-base font-bold text-slate-900">Ordens & Pedidos de Compra (PO)</h1>
                  <p className="text-xs text-slate-500">
                    Gestão corporativa de pedidos emitidos, faturamento direto, autorizações de fornecimento e confirmação de entrega.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    Total de Pedidos: <strong className="text-slate-900">{orders.length}</strong>
                  </span>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                  <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">Nenhum pedido de compra emitido</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    As Ordens de Compra formais são geradas automaticamente quando você aprova uma proposta comercial vencedora no Comparador de Cotações.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((po) => {
                    const isSettled = po.status === 'settled_onchain';

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
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Pedido Confirmado & Emitido
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600" /> Aguardando Confirmação do Comprador
                                </span>
                              )}
                              <span className="text-[11px] text-slate-500">• Emitido: {po.created_at}</span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900">{po.supplier_name}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                              <span>Prazo de entrega: <strong className="text-slate-800">{po.delivery_days} dias corridos</strong></span>
                              {po.rfq_code && <span> • Vinculado à {po.rfq_code}</span>}
                              {po.sector_name && (
                                <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  <MapPin className="w-3 h-3 text-[#0284c7]" /> {po.sector_name}
                                </span>
                              )}
                              {po.is_existing_contractor && (
                                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-semibold">
                                  <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" /> Fornecedor Homologado no Setor
                                </span>
                              )}
                            </div>

                            {/* Informações corporativas de autorização se confirmado */}
                            {isSettled && po.settlement_data && (
                              <div className="mt-2 pt-2 border-t border-emerald-100 flex flex-wrap items-center gap-3 text-[11px] font-mono text-emerald-800">
                                <span>
                                  Protocolo de Autorização: <strong>{po.settlement_data.signature || `AUT-${po.po_code}`}</strong>
                                </span>
                                <span>•</span>
                                <span className="text-slate-600 font-sans">
                                  Condição: <strong>Faturamento Corporativo (Boleto Bancário / TED)</strong>
                                </span>
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
                              <p className="text-[11px] text-slate-500 font-medium">
                                Faturamento Direto com Fornecedor
                              </p>
                            </div>

                            <div>
                              {isSettled ? (
                                <button
                                  onClick={() => handleOpenSettlement(po)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Ver Autorização do Pedido</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenSettlement(po)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Confirmar Pedido de Compra</span>
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

          {/* Visão: Equipe & Compradores (Autenticador de Usuários) */}
          {activeTab === 'team' && (
            <TeamBuyersView
              sectors={sectors}
              activeBuyerId={currentUser?.id}
              onSelectActiveBuyer={(member: TeamMember) => {
                setCurrentUser((prev) =>
                  prev
                    ? {
                        ...prev,
                        name: member.name,
                        email: member.email,
                        role: member.role_title,
                      }
                    : prev
                );
                showToast(`Autenticado como: ${member.name} (${member.role_title})`);
              }}
              showToast={showToast}
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
                    <div className="flex items-center gap-2">
                      <h1 className="text-base font-bold text-slate-900">
                        Catálogo & Homologação de Fornecedores Industriais
                      </h1>
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                        Exclusivo Fornecedores PJ
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Base exclusiva para consulta e homologação de parceiros externos, fabricantes e distribuidores. (Para gerenciar compradores e setores internos, acesse a aba <strong>Equipe & Compradores</strong>).
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


      {/* 7. Modal de Criação / Edição de Pedido de Orçamento (RFQ) */}
      <CreateRFQModal
        isOpen={isCreateRFQOpen}
        onClose={() => {
          setIsCreateRFQOpen(false);
          setEditingRFQ(null);
        }}
        onCreateRFQ={handleCreateRFQ}
        onUpdateRFQ={handleUpdateRFQ}
        initialRFQ={editingRFQ}
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

      {/* 11. Modal de Certificado Digital A1 da Empresa (SEFAZ DF-e) */}
      <FiscalCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        tenantName={currentUser?.company_name || organization.name}
      />
    </div>
  );
}

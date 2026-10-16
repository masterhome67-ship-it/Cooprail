'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileKey,
  ShieldCheck,
  Lock,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Server,
  RefreshCw,
  Building2,
  Calendar,
  Eye,
  EyeOff,
  Trash2,
  Info,
  Layers,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { CertificateInfo } from '@/app/api/fiscal-certificate/route';

interface FiscalCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantName?: string;
  tenantCNPJ?: string;
}

const STORAGE_KEY_CERT_CONFIG = 'cooprail_active_fiscal_cert';

export function FiscalCertificateModal({
  isOpen,
  onClose,
  tenantName = 'Sua Empresa',
  tenantCNPJ,
}: FiscalCertificateModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [environment, setEnvironment] = useState<'homologacao' | 'producao'>('homologacao');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [activeCert, setActiveCert] = useState<CertificateInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'multi_empresa_security'>('config');

  // Carrega configuração salva localmente do tenant
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CERT_CONFIG);
      if (saved) {
        setActiveCert(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erro ao ler certificado do localStorage:', e);
    }
  }, []);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'pfx' && ext !== 'p12') {
        setErrorMsg('Formato inválido. Por favor selecione um arquivo de certificado A1 (.pfx ou .p12).');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleValidateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Selecione o arquivo do certificado (.pfx ou .p12).');
      return;
    }
    if (!password) {
      setErrorMsg('Digite a senha do certificado digital A1.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('certificate', selectedFile);
      formData.append('password', password);
      formData.append('environment', environment);

      const res = await fetch('/api/fiscal-certificate', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Falha ao validar o certificado digital.');
      }

      const certData: CertificateInfo = json.data;
      setActiveCert(certData);
      localStorage.setItem(STORAGE_KEY_CERT_CONFIG, JSON.stringify(certData));

      setSuccessMsg('Certificado validado com sucesso e homologado com o WebService da SEFAZ!');
      setSelectedFile(null);
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado ao validar o certificado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCertificate = () => {
    if (confirm('Deseja realmente desconectar e remover o certificado digital ativo desta empresa?')) {
      setActiveCert(null);
      localStorage.removeItem(STORAGE_KEY_CERT_CONFIG);
      setSuccessMsg('Certificado removido do ambiente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-[#0284c7]">
              <FileKey className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Configuração de Certificado Digital A1</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> SEFAZ DF-e
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Integração oficial para leitura automática de NF-e, CT-e e Ciência da Emissão
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas Superiores */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-[#0284c7] text-[#0284c7]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Configuração & Status</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('multi_empresa_security')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'multi_empresa_security'
                ? 'border-[#0284c7] text-[#0284c7]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Isolamento Multi-Empresa & LGPD</span>
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Mensagens de Alerta */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-bold">Atenção na validação</p>
                <p className="mt-0.5 text-rose-600">{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="font-bold">Operação concluída</p>
                <p className="mt-0.5 text-emerald-700">{successMsg}</p>
              </div>
            </div>
          )}

          {activeTab === 'config' ? (
            <>
              {/* Card de Certificado Ativo se já configurado */}
              {activeCert ? (
                <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-900">Certificado Digital A1 Conectado</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {activeCert.environment === 'producao' ? 'Produção SEFAZ' : 'Homologação'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveCertificate}
                      className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 p-1 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Desconectar</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <p className="text-[11px] text-slate-500 font-medium">Razão Social Vinculada</p>
                      <p className="font-bold text-slate-800 truncate mt-0.5">{activeCert.companyName}</p>
                      <p className="text-[11px] text-[#0284c7] font-mono font-semibold mt-1">
                        CNPJ: {activeCert.cnpj}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <p className="text-[11px] text-slate-500 font-medium">Autoridade Emissora (ICP-Brasil)</p>
                      <p className="font-bold text-slate-800 truncate mt-0.5">{activeCert.issuer}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-[11px] text-slate-600 font-medium">
                          Expira em {activeCert.daysRemaining} dias ({new Date(activeCert.validTo || '').toLocaleDateString('pt-BR')})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status da Conexão com SEFAZ */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Server className="w-4 h-4 text-[#0284c7]" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          SEFAZ WebService NFeDistribuicaoDFe
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {activeCert.sefazEndpoint}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {activeCert.sefazStatus === 'online' ? '🟢 Operacional' : '🟡 Teste Concluído'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Latência: {activeCert.sefazLatencyMs}ms</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Formulário de Configuração/Substituição de Certificado */}
              <form onSubmit={handleValidateCertificate} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {activeCert ? 'Substituir ou Atualizar Certificado' : 'Carregar Certificado Digital A1 (.pfx)'}
                  </h4>
                  <span className="text-[11px] text-slate-500">Padrão ICP-Brasil (e-CNPJ)</span>
                </div>

                {/* Upload do Arquivo */}
                <div className="border-2 border-dashed border-slate-200 hover:border-[#0284c7] rounded-xl p-5 text-center transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    id="cert-file-input"
                    accept=".pfx,.p12"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="cert-file-input" className="cursor-pointer block">
                    <UploadCloud className="w-8 h-8 text-[#0284c7] mx-auto mb-2" />
                    {selectedFile ? (
                      <div>
                        <p className="text-xs font-bold text-slate-800">{selectedFile.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB • Clique para escolher outro
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          Clique para selecionar ou arraste o arquivo do Certificado A1
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Extensões aceitas: <strong>.pfx</strong> ou <strong>.p12</strong> (Certificado de arquivo com chave privada)
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Campo de Senha e Seleção de Ambiente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Senha do Certificado Digital
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite a senha do arquivo .pfx"
                        className="w-full px-3 py-2 pr-9 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0284c7]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      A senha é utilizada apenas pelo runtime seguro para assinar as requisições SOAP à SEFAZ.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ambiente de Destino SEFAZ
                    </label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] bg-white cursor-pointer"
                    >
                      <option value="homologacao">Ambiente de Homologação (Testes SEFAZ sem validade jurídica)</option>
                      <option value="producao">Ambiente de Produção (SEFAZ Real Oficial)</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Recomendamos testar primeiro em Homologação antes de ativar Produção.
                    </p>
                  </div>
                </div>

                {/* Botão de Envio */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || !selectedFile || !password}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] disabled:bg-slate-300 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Validando Certificado e Testando Conexão SEFAZ...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Validar Certificado & Conectar à SEFAZ</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Informações Técnicas */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Info className="w-4 h-4 text-[#0284c7]" />
                  <span>O que este certificado permite fazer?</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600">
                  <li>
                    <strong>Consulta de Notas Emitidas Contra seu CNPJ:</strong> O sistema baixa os XMLs completos de todas as mercadorias faturadas para a sua empresa (Insumos, Cimento, Aço, etc).
                  </li>
                  <li>
                    <strong>Manifestação do Destinatário Automática:</strong> Envia a "Ciência da Emissão" e "Confirmação da Operação" diretamente para a Secretaria de Fazenda.
                  </li>
                  <li>
                    <strong>Auditoria e Fechamento de Compras:</strong> Cruza automaticamente os itens do Pedido de Compra com a Nota Fiscal entregue pelo fornecedor.
                  </li>
                </ul>
              </div>
            </>
          ) : (
            /* Aba Explicativa de Segurança Multi-Empresa */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs space-y-2">
                <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
                  <span>Como os dados ficam salvos e separados por empresa?</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Quando múltiplos clientes ou empresas (CNPJs diferentes) utilizam a plataforma, os dados de cada um ficam <strong>completamente isolados e blindados</strong>. Nenhuma empresa consegue visualizar as cotações, fornecedores, faturamentos ou notas fiscais da outra.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Pilar 1: Tenant ID e RLS */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-6 h-6 rounded bg-sky-100 text-[#0284c7] flex items-center justify-center text-xs">1</span>
                    <span>Row-Level Security (RLS)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    No banco de dados (PostgreSQL/Supabase), cada tabela possui uma coluna mandatória <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">tenant_id</code> (CNPJ/Organization ID). O banco rejeita nativamente qualquer query que tente ler dados de outro tenant.
                  </p>
                </div>

                {/* Pilar 2: Cofre Criptográfico de Certificados */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">2</span>
                    <span>Cofre de Certificados (KMS / Vault)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Os arquivos de Certificado A1 (.pfx) são criptografados em repouso com algoritmo <strong>AES-256-GCM</strong> utilizando chaves únicas por empresa geradas via HSM/KMS. Nem os administradores do sistema conseguem ver a chave privada em texto limpo.
                  </p>
                </div>

                {/* Pilar 3: Sigilo Fiscal da SEFAZ */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-6 h-6 rounded bg-purple-100 text-purple-700 flex items-center justify-center text-xs">3</span>
                    <span>Sigilo Fiscal da SEFAZ</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    A própria SEFAZ aplica controle de acesso criptográfico: a consulta de notas (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">NFeDistribuicaoDFe</code>) só retorna documentos em que o CNPJ do certificado conste como <strong>Destinatário</strong>.
                  </p>
                </div>

                {/* Pilar 4: Portal do Parceiro com Tokens de Acesso Único */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-6 h-6 rounded bg-amber-100 text-amber-700 flex items-center justify-center text-xs">4</span>
                    <span>Link Protegido por Requisição</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    O fornecedor que acessa o Portal do Parceiro só enxerga a requisição específica (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">RFQ-CODE</code>) para a qual recebeu o link. Ele não tem acesso ao painel interno nem a outras cotações.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Transmissão segura com criptografia ponta a ponta</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

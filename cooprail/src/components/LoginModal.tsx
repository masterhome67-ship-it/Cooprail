'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserPlus,
  Briefcase,
  User,
  Zap,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/mockData';
import { Language } from '@/lib/translations';
import {
  RegisteredAccount,
  defaultAccounts,
  getRegisteredAccounts,
  registerNewAccount,
  hashPassword,
  ensureDemoAccount,
  resetAccountPassword,
  DEMO_ACCOUNT_EMAIL,
} from '@/lib/userWorkspace';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: RegisteredAccount) => void;
  lang?: Language;
  initialTab?: 'signin' | 'signup' | 'forgot';
}

// Carregador assíncrono garantido da biblioteca Google Identity Services (GIS)
function loadGoogleScript(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject();
    const g = (window as any).google;
    if (g?.accounts?.oauth2) return resolve(g);

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).google));
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve((window as any).google);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  lang = 'pt',
  initialTab = 'signin',
}: LoginModalProps) {
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialTab]);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Autenticação Real com a API do Google (Google Identity Services Oficial)
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      setLoading(false);
      setErrorMsg(
        lang === 'pt'
          ? 'Google OAuth Client ID não configurado no ambiente de produção.'
          : 'Google OAuth Client ID not configured in production environment.'
      );
      return;
    }

    try {
      const google = await loadGoogleScript();
      if (google?.accounts?.oauth2) {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              setLoading(false);
              setErrorMsg(
                lang === 'pt' ? 'Autenticação Google cancelada.' : 'Google authentication cancelled.'
              );
              return;
            }

            if (tokenResponse?.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleProfile = await res.json();

                if (googleProfile?.email) {
                  const accounts = getRegisteredAccounts();
                  const existing = accounts.find(
                    (a) => a.email.toLowerCase() === googleProfile.email.toLowerCase()
                  );

                  if (existing) {
                    onLoginSuccess(existing);
                  } else {
                    const created = registerNewAccount({
                      full_name: googleProfile.name || googleProfile.email.split('@')[0],
                      email: googleProfile.email,
                      company_name: 'Minha Empresa Global',
                      role: lang === 'pt' ? 'Diretor de Suprimentos' : 'Head of Procurement',
                      avatar_url: googleProfile.picture || '',
                    });
                    onLoginSuccess(created);
                  }
                  setLoading(false);
                  return;
                }
              } catch (err) {
                console.error('Erro ao ler perfil do Google:', err);
              }
            }
            setLoading(false);
          },
        });

        client.requestAccessToken({ prompt: 'select_account' });
        return;
      }
    } catch (err) {
      console.error('Falha ao inicializar Google GIS:', err);
      setLoading(false);
      setErrorMsg(
        lang === 'pt'
          ? 'Não foi possível carregar a janela oficial da Google. Verifique o bloqueador de popups.'
          : 'Could not load official Google authentication dialog.'
      );
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg(lang === 'pt' ? 'Informe seu e-mail corporativo.' : 'Enter your corporate email.');
      return;
    }
    if (!password) {
      setErrorMsg(lang === 'pt' ? 'Informe sua senha de acesso.' : 'Enter your password.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      const accounts = getRegisteredAccounts();
      const matched = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());

      if (!matched) {
        setLoading(false);
        setErrorMsg(
          lang === 'pt'
            ? 'Conta corporativa não encontrada. Crie uma nova conta na aba "Criar Conta".'
            : 'Corporate account not found. Please register in the Sign Up tab.'
        );
        return;
      }

      const hashedInput = await hashPassword(password);
      const isPasswordValid =
        (matched.password_hash && matched.password_hash === hashedInput) ||
        (matched.password && matched.password === password);

      if (!isPasswordValid) {
        setLoading(false);
        setErrorMsg(
          lang === 'pt'
            ? 'Senha incorreta. Verifique suas credenciais corporativas.'
            : 'Incorrect password. Check your corporate credentials.'
        );
        return;
      }

      setLoading(false);
      onLoginSuccess(matched);
    } catch (err) {
      setLoading(false);
      setErrorMsg(lang === 'pt' ? 'Falha ao validar credenciais.' : 'Failed to validate credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newCompany.trim()) {
      setErrorMsg(
        lang === 'pt'
          ? 'Por favor, preencha todos os campos obrigatórios.'
          : 'Please fill in all required fields.'
      );
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg(
        lang === 'pt'
          ? 'A senha deve conter no mínimo 6 caracteres.'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const hashed = await hashPassword(newPassword);
      const created = registerNewAccount({
        full_name: newName,
        email: newEmail,
        company_name: newCompany,
        role: newRole || (lang === 'pt' ? 'Diretor de Suprimentos' : 'Head of Procurement'),
        password_hash: hashed,
      });

      setLoading(false);
      onLoginSuccess(created);
    } catch (err) {
      setLoading(false);
      setErrorMsg(lang === 'pt' ? 'Falha ao registrar conta.' : 'Failed to register account.');
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const demoAccount = await ensureDemoAccount();
      setLoading(false);
      onLoginSuccess(demoAccount);
    } catch (err) {
      setLoading(false);
      setErrorMsg(lang === 'pt' ? 'Falha ao acessar conta de demonstração.' : 'Failed to access demo account.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotNewPassword) {
      setErrorMsg(lang === 'pt' ? 'Preencha o e-mail e a nova senha.' : 'Enter email and new password.');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setErrorMsg(
        lang === 'pt'
          ? 'A nova senha deve ter no mínimo 6 caracteres.'
          : 'New password must be at least 6 characters.'
      );
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const ok = await resetAccountPassword(forgotEmail, forgotNewPassword);
    setLoading(false);
    if (ok) {
      setSuccessMsg(
        lang === 'pt'
          ? 'Senha corporativa redefinida com sucesso! Redirecionando para login...'
          : 'Corporate password reset successfully! Redirecting to sign in...'
      );
      setTimeout(() => {
        setEmail(forgotEmail);
        setTab('signin');
        setSuccessMsg(null);
      }, 1500);
    } else {
      setErrorMsg(
        lang === 'pt'
          ? 'E-mail corporativo não localizado na base. Verifique ou crie uma nova conta.'
          : 'Corporate email not found. Please register a new account.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col text-slate-800">
        {/* Topo Off-White */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <img src="/cooprail-logo.png" alt="COOPRAIL" className="h-7 w-auto object-contain" />
            <div className="border-l border-slate-200 pl-2.5">
              <h3 className="text-xs font-bold text-slate-900">
                {lang === 'pt' ? 'Acesso ao Portal Corporativo' : 'Enterprise Portal Access'}
              </h3>
              <p className="text-[10px] text-slate-500">Enterprise Procurement System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Abas: Entrar vs Criar Conta */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 text-xs font-semibold">
          <button
            onClick={() => {
              setTab('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 text-center transition-all cursor-pointer border-b-2 ${
              tab === 'signin'
                ? 'border-[#0284c7] text-[#0284c7] bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {lang === 'pt' ? 'Já sou Cadastrado' : 'Sign In'}
          </button>
          <button
            onClick={() => {
              setTab('signup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 text-center transition-all cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
              tab === 'signup'
                ? 'border-[#0284c7] text-[#0284c7] bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{lang === 'pt' ? 'Primeiro Acesso / Cadastrar' : 'Sign Up'}</span>
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN (JÁ SOU CADASTRADO) */}
          {tab === 'signin' && (
            <div className="space-y-4">
              {/* Botão Oficial Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-all shadow-xs cursor-pointer group"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{lang === 'pt' ? 'Continuar com o Google' : 'Continue with Google'}</span>
              </button>

              <div className="relative flex py-0.5 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase font-mono">
                  {lang === 'pt' ? 'ou entre com e-mail corporativo' : 'or enter with work email'}
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Formulário de Login */}
              <form onSubmit={handleSignIn} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">
                    {lang === 'pt' ? 'E-mail Corporativo' : 'Corporate Email'}
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus-within:border-[#0284c7] focus-within:bg-white">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-xs text-slate-900 placeholder:text-slate-400"
                      placeholder="seu.email@empresa.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-semibold">
                      {lang === 'pt' ? 'Senha' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('forgot');
                        setForgotEmail(email);
                        setErrorMsg(null);
                      }}
                      className="text-[11px] text-slate-500 hover:text-[#0284c7] underline cursor-pointer"
                    >
                      {lang === 'pt' ? 'Esqueci minha senha' : 'Forgot password?'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus-within:border-[#0284c7] focus-within:bg-white">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-xs text-slate-900 placeholder:text-slate-400"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs transition-all shadow-md shadow-sky-600/20 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{lang === 'pt' ? 'Entrar no Portal Corporativo' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Botão de Demonstração Rápida (1 Clique) */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-all shadow-2xs cursor-pointer group"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500 group-hover:scale-110 transition-transform" />
                  <span>{lang === 'pt' ? '⚡ Acesso Rápido de Demonstração (1 Clique)' : '⚡ Quick Demo Access (1 Click)'}</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-1">
                  {lang === 'pt'
                    ? 'Acesso instantâneo homologado como Diretor de Suprimentos da Cooprail'
                    : 'Instant access as approved Cooprail Procurement Director'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SIGN UP (PRIMEIRO ACESSO) */}
          {tab === 'signup' && (
            <div className="space-y-3.5 text-xs">
              {/* Botão Oficial Google para Cadastro */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-all shadow-xs cursor-pointer group"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{lang === 'pt' ? 'Cadastrar com o Google' : 'Sign Up with Google'}</span>
              </button>

              <div className="relative flex py-0.5 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase font-mono">
                  {lang === 'pt' ? 'ou preencha os dados da sua empresa' : 'or enter details manually'}
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">
                    {lang === 'pt' ? 'Nome do Gestor / Responsável' : 'Full Name'} *
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus-within:border-[#0284c7] focus-within:bg-white">
                    <User className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-xs text-slate-900 placeholder:text-slate-400"
                      placeholder="Ex: Carlos Eduardo de Oliveira"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">
                    {lang === 'pt' ? 'E-mail Corporativo' : 'Corporate Email'} *
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus-within:border-[#0284c7] focus-within:bg-white">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-xs text-slate-900 placeholder:text-slate-400"
                      placeholder="carlos@minhaempresa.com.br"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">
                    {lang === 'pt' ? 'Razão Social / Nome da Empresa' : 'Company / Organization Name'} *
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus-within:border-[#0284c7] focus-within:bg-white">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-xs text-slate-900 placeholder:text-slate-400"
                      placeholder="Ex: Construtora Paranaense Ltda"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">
                      {lang === 'pt' ? 'Cargo / Função' : 'Job Title'}
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus-within:border-[#0284c7] focus-within:bg-white">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="bg-transparent border-none outline-none w-full text-xs text-slate-900 placeholder:text-slate-400"
                        placeholder="Ex: Diretor de Obras"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">
                      {lang === 'pt' ? 'Senha' : 'Password'} *
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus-within:border-[#0284c7] focus-within:bg-white">
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-transparent border-none outline-none w-full text-xs text-slate-900 placeholder:text-slate-400"
                        placeholder="Mín. 6 dígitos"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs transition-all shadow-md shadow-sky-600/20 cursor-pointer disabled:opacity-50 mt-1"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {lang === 'pt' ? 'Concluir Cadastro & Abrir Painel' : 'Create Corporate Account'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: FORGOT PASSWORD (REDEFINIR SENHA) */}
          {tab === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
              <div className="text-center space-y-1 pb-1">
                <div className="w-10 h-10 bg-sky-50 rounded-xl mx-auto flex items-center justify-center text-[#0284c7] border border-sky-100">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  {lang === 'pt' ? 'Redefinir Senha de Acesso' : 'Reset Account Password'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {lang === 'pt'
                    ? 'Informe seu e-mail corporativo cadastrado para definir uma nova senha.'
                    : 'Enter your registered work email to set a new password.'}
                </p>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">
                  {lang === 'pt' ? 'E-mail Corporativo' : 'Work Email'} *
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus-within:border-[#0284c7] focus-within:bg-white">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-xs text-slate-900"
                    placeholder="seu.email@empresa.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">
                  {lang === 'pt' ? 'Nova Senha (Mínimo 6 caracteres)' : 'New Password (Min 6 chars)'} *
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus-within:border-[#0284c7] focus-within:bg-white">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-xs text-slate-900"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-md shadow-sky-600/20 cursor-pointer disabled:opacity-50"
              >
                {lang === 'pt' ? 'Salvar Nova Senha' : 'Save New Password'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-[11px] text-slate-500 hover:text-[#0284c7] underline cursor-pointer"
                >
                  {lang === 'pt' ? '← Voltar para o Login' : '← Back to Sign In'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            {lang === 'pt' ? 'Ambiente Privado e Seguro' : 'Encrypted Private Tenant'}
          </span>
          <span className="font-mono text-[10px]">Cooprail v2.6 Enterprise</span>
        </div>
      </div>
    </div>
  );
}

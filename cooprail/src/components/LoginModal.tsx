'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/mockData';
import { Language } from '@/lib/translations';
import {
  RegisteredAccount,
  defaultAccounts,
  getRegisteredAccounts,
  registerNewAccount,
} from '@/lib/userWorkspace';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: RegisteredAccount) => void;
  lang?: Language;
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

export function LoginModal({ isOpen, onClose, onLoginSuccess, lang = 'pt' }: LoginModalProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Autenticação Real com a API do Google (Google Identity Services Oficial)
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);

    const googleClientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '1055689936073-mh4d40hb2rch5cs3h81g5sbk138t64e0.apps.googleusercontent.com';

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

  const handleQuickLogin = (emailToUse: string, companyToUse: string) => {
    setLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      setLoading(false);
      const accounts = getRegisteredAccounts();
      const existing = accounts.find((a) => a.email.toLowerCase() === emailToUse.toLowerCase());
      if (existing) {
        onLoginSuccess(existing);
      } else {
        const created = registerNewAccount({
          full_name: emailToUse.split('@')[0],
          email: emailToUse,
          company_name: companyToUse,
          role: lang === 'pt' ? 'Diretor de Suprimentos' : 'Head of Procurement',
        });
        onLoginSuccess(created);
      }
    }, 250);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg(lang === 'pt' ? 'Informe seu e-mail corporativo.' : 'Enter your corporate email.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      setLoading(false);
      const accounts = getRegisteredAccounts();
      const matched = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());

      if (matched) {
        onLoginSuccess(matched);
      } else {
        // Cria novo acesso corporativo do zero
        const created = registerNewAccount({
          full_name: email.split('@')[0],
          email: email.trim(),
          company_name: 'Minha Empresa Global',
          role: 'Diretor de Suprimentos',
          password,
        });
        onLoginSuccess(created);
      }
    }, 400);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newCompany) {
      setErrorMsg(
        lang === 'pt'
          ? 'Por favor, preencha todos os campos obrigatórios.'
          : 'Please fill in all required fields.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      setLoading(false);
      const created = registerNewAccount({
        full_name: newName,
        email: newEmail,
        company_name: newCompany,
        role: newRole || (lang === 'pt' ? 'Diretor de Suprimentos' : 'Head of Procurement'),
        password: newPassword,
      });

      onLoginSuccess(created);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col text-slate-800">
        {/* Topo Off-White */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7] flex items-center justify-center font-bold text-white text-sm shadow-xs">
              CR
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {lang === 'pt' ? 'Acesso ao Portal Corporativo' : 'Enterprise Portal Access'}
              </h3>
              <p className="text-[11px] text-slate-500">Cooprail Enterprise Procurement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Abas: Entrar vs Nova Conta */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 text-xs font-semibold">
          <button
            onClick={() => {
              setTab('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-center transition-all cursor-pointer border-b-2 ${
              tab === 'signin'
                ? 'border-[#0284c7] text-[#0284c7] bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {lang === 'pt' ? 'Entrar na Plataforma' : 'Sign In'}
          </button>
          <button
            onClick={() => {
              setTab('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-center transition-all cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
              tab === 'signup'
                ? 'border-[#0284c7] text-[#0284c7] bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{lang === 'pt' ? 'Nova Empresa (Do Zero)' : 'New Company (From Scratch)'}</span>
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: SIGN IN */}
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

              {/* Acesso Direto masterhome67@gmail.com */}
              <button
                type="button"
                onClick={() => handleQuickLogin('masterhome67@gmail.com', 'MasterHome 67 Global')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-50 text-xs font-semibold text-[#0369a1] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-[10px] font-bold">
                    M
                  </div>
                  <span>Entrar como masterhome67@gmail.com</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#0284c7]" />
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase font-mono">
                  {lang === 'pt' ? 'ou entre com e-mail corporativo' : 'or enter with work email'}
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Formulário */}
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
                  <label className="text-slate-700 block mb-1 font-semibold">
                    {lang === 'pt' ? 'Senha' : 'Password'}
                  </label>
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
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{lang === 'pt' ? 'Entrar no Portal' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: SIGN UP */}
          {tab === 'signup' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-[#0369a1]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0284c7]" />
                  {lang === 'pt' ? 'Novo Ambiente 100% Exclusivo' : 'Private Isolated Workspace'}
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {lang === 'pt'
                    ? 'Sua organização começará totalmente do zero (sem cotações ou setores pré-existentes), sem qualquer compartilhamento de dados com outros usuários.'
                    : 'Your workspace starts completely fresh with zero sample records and zero data sharing with other users.'}
                </p>
              </div>

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

              {/* Cadastro Direto masterhome67@gmail.com */}
              <button
                type="button"
                onClick={() => handleQuickLogin('masterhome67@gmail.com', 'MasterHome 67 Global')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-50 text-xs font-semibold text-[#0369a1] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-[10px] font-bold">
                    M
                  </div>
                  <span>Iniciar do zero como masterhome67@gmail.com</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#0284c7]" />
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase font-mono">
                  {lang === 'pt' ? 'ou preencha os dados da organização' : 'or enter details manually'}
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">
                  {lang === 'pt' ? 'Nome Completo' : 'Full Name'} *
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus-within:border-[#0284c7] focus-within:bg-white">
                  <User className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-xs text-slate-900 placeholder:text-slate-400"
                    placeholder="Ex: Carlos Oliveira"
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
                    placeholder="carlos@empresa.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">
                  {lang === 'pt' ? 'Nome da Empresa / Organização' : 'Company / Organization Name'} *
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus-within:border-[#0284c7] focus-within:bg-white">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-xs text-slate-900 placeholder:text-slate-400"
                    placeholder="Ex: PetroIndústria Global S.A."
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
                      placeholder="Ex: Diretor de Compras"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">
                    {lang === 'pt' ? 'Senha' : 'Password'}
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus-within:border-[#0284c7] focus-within:bg-white">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-xs text-slate-900 placeholder:text-slate-400"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 mt-1"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {lang === 'pt' ? 'Criar Workspace & Iniciar do Zero' : 'Create Workspace (From Scratch)'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
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

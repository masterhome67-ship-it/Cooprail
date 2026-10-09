# 📋 Checklist Mestre de Execução — Colosseum Solana Hackathon

Este documento consolida **todas as etapas, tarefas e definições necessárias** para levar o projeto do zero até a submissão e entrevista final da Colosseum, sem deixar absolutamente nada de fora.

---

## 🏁 ETAPA 0: Infraestrutura, Blindagem & Papéis (Semana 0)

- [ ] **Configuração Técnica & Repositório:**
  - [x] Repositório Git inicializado na branch `main`.
  - [x] `.gitignore` blindado para arquivos sensíveis e caches.
  - [x] Solana AI Kit instalado com skills essenciais (`hackathon`, `idea-sprint`, `pitch-deck`).
  - [x] Carteira Devnet gerada (`8MJ17smX8e5JW1dvg4FQxkZZTrphPcHzwZD6BzY6duPN`).
  - [ ] **Abastecer a carteira:**
    - [ ] Obter SOL no faucet (faucet.solana.com) para taxas e deploys.
    - [ ] Obter USDC no faucet Circle (faucet.circle.com).
    - [ ] Validar com `node check_wallet.js` que ambos os saldos saíram do zero.
- [ ] **Definição dos Quatro Papéis ([team-card.md](team-card.md)):**
  - [ ] **Builder:** Nome atribuído (entrega o recorte da demo funcional).
  - [ ] **Responsável pela Concorrência:** Nome atribuído (relatório de prós e contras até 21/09).
  - [ ] **Responsável por Parcerias:** Nome atribuído (vende a ideia para projetos vizinhos).
  - [ ] **Storyteller:** Nome atribuído (cuida da frase do pitch e log de feedback).
- [ ] **Blindagem contra Desclassificação (Regras de Ouro):**
  - [ ] Confirmar que nenhum membro do time participa de um segundo projeto neste hackathon.
  - [ ] Definir o **Líder do Time** oficial que será o único responsável por clicar em "Submit".
  - [ ] Declarar desde o início se há algum código pré-existente (para transparência total).

---

## 📌 ETAPA 1: Ponto 1 - Visão Geral do Projeto (Meta Informações)

- [ ] **Nome do Projeto:** Definir um nome forte, memorável e disponível.
- [ ] **One-Liner (Tagline):** Escrever a frase de alto impacto explicando em 1 linha o que o produto faz.
- [ ] **Categoria Principal na Colosseum:**
  - [ ] Escolher uma: `DeFi` | `Payments` | `DePIN` | `AI & Agents` | `Consumer` | `Infrastructure` | `Gaming`.
- [ ] **Side Tracks Selecionados:**
  - [x] **Side Track Superteam Brasil (US$ 10,000 USDG)**.
  - [ ] Avaliar outros side tracks compatíveis (ex: Visa, Tether, Umbra, LI.FI, Jupiter, etc.).
- [ ] **Presença Digital Inicial:**
  - [ ] Criar ou reservar o perfil no Twitter/X do projeto.
  - [ ] Definir canal de contato direto do time (Telegram / Discord).

---

## 👥 ETAPA 2: Ponto 2 - Founder + Market Fit *(Esse time aguenta?)*

- [ ] **Perfil dos Fundadores:**
  - [ ] Documentar histórico técnico e vivência no ecossistema Solana/Web3 de cada membro.
  - [ ] Detalhar o domínio de mercado sobre a indústria que está sendo atacada.
- [ ] **História Pessoal:**
  - [ ] Articular por que esse problema específico dói nos fundadores (skin in the game).
- [ ] **Compromisso Pós-Hackathon:**
  - [ ] Confirmar intenção de dedicação integral e aplicação para o **Colosseum Accelerator**.

---

## 🔍 ETAPA 3: Ponto 3 - Mapeamento da Concorrência *(Semana 1: até 21/09)*

- [ ] Mapear os 3 principais concorrentes (soluções Web2 e dApps Web3 existentes).
- [ ] Identificar o que eles fazem muito bem.
- [ ] Identificar onde eles falham gravemente (lentidão, taxas, UX, isolamento).
- [ ] Consolidar o relatório escrito até o final da Semana 1 para alimentar o Insight.

---

## 💡 ETAPA 4: Ponto 4 - O Problema Real & The Insight *(O problema é real?)*

- [ ] **Declaração do Problema Real:**
  - [ ] Descrever a dor com números e dinheiro real na mesa (quem perde dinheiro e quanto).
- [ ] **Por que as tentativas anteriores falharam:**
  - [ ] Por que bancos tradicionais, soluções Web2 ou outras blockchains (EVM) não resolveram isso?
- [ ] **The Insight Não-Óbvio (A Virada de Chave):**
  - [ ] Qual é o segredo / verdade de mercado que só o seu time percebeu?
- [ ] **Por que Solana (Why Solana):**
  - [ ] Justificar tecnicamente por que o projeto exige a Solana (400ms finality, sub-cent fees, Token Extensions, paralelismo SVM).

---

## 🛠️ ETAPA 5: Ponto 5 - Product + Execution *(O produto funciona?)*

- [ ] **Estratégia de Escopo (MVP Core Loop):**
  - [ ] Definir o fluxo principal ponta a ponta (Passo 1 -> Passo 2 -> Passo 3).
  - [ ] Cortar deliberadamente funcionalidades secundárias para garantir entrega impecável.
- [ ] **Desenvolvimento On-Chain:**
  - [ ] Criar os smart contracts em Rust usando **Anchor Framework**.
  - [ ] Fazer o deploy do programa na **Devnet** e salvar o Program ID.
  - [ ] Testar instruções com testes unitários/integração em TypeScript.
- [ ] **Desenvolvimento Frontend:**
  - [ ] Construir a interface dApp moderna e fluida.
  - [ ] Integrar conexão de carteiras Solana (Phantom, Solflare via Wallet Adapter).
  - [ ] Implementar feedback de transações em tempo real (assinatura e confirmação na tela).
- [ ] **Auditoria de Autoria:**
  - [ ] Garantir histórico de commits consistente durante a janela do hackathon.
  - [ ] Separar claramente no README o código do time vs bibliotecas de terceiros.

---

## 📈 ETAPA 6: Ponto 6 - Mercado & Viabilidade *(TAM & Viability)*

- [ ] **Dimensionamento do Mercado:**
  - [ ] Calcular TAM (Mercado Total Endereçável).
  - [ ] Calcular SAM (Mercado Atendível Disponível).
  - [ ] Definir SOM (Objetivo realista dos primeiros 12 a 18 meses).
- [ ] **Modelo de Negócio Sustentável:**
  - [ ] Definir como o protocolo/negócio gera receita real (taxas de uso, spread, assinaturas).
  - [ ] Provar sustentabilidade econômica sem depender de inflação de token vazio.

---

## 🤝 ETAPA 7: Ponto 7 - Tração & Parcerias *(Semanas 3 e 4)*

- [ ] **Parcerias com Projetos Vizinhos:**
  - [ ] Apresentar o projeto para membros e builders da **Superteam Brasil**.
  - [ ] Fechar pelo menos 1 a 2 parcerias preliminares, LOIs ou integrações técnicas.
- [ ] **Tração On-Chain Real:**
  - [ ] Abrir o dApp para testes comunitários na Devnet.
  - [ ] Registrar métricas reais: número de carteiras únicas conectadas, número de transações executadas e volume transacionado simulado.

---

## 🎬 ETAPA 8: Ponto 8 - Pitch Deck & Vídeo Demo *(A história convence?)*

- [ ] **Frase do Pitch (Storyteller):**
  - [ ] Refinar a frase semanalmente até chegar à versão definitiva para a primeira linha do deck.
- [ ] **Gravação do Vídeo Pitch (Máximo 3 Minutos):**
  - [ ] `0:00 - 0:30` (30s): Gancho, Problema & Insight (fundador na câmera).
  - [ ] `0:30 - 2:00` (90s): Live Demo real do dApp funcionando ao vivo (sem slides).
  - [ ] `2:00 - 2:30` (30s): Arquitetura e por que Solana.
  - [ ] `2:30 - 3:00` (30s): Tração no hackathon, time e visão de escala.
  - [ ] Subir para o YouTube ou Loom em modo **Público** ou **Não Listado** e testar o link em aba anônima.
- [ ] **Repositório GitHub & Documentação:**
  - [ ] README.md impecável: descrição, arquitetura, Program ID, como rodar localmente e declaração de autoria.

---

## 🚀 ETAPA 9: Ponto 9 - Checklist Final & Submissão na Colosseum

- [ ] Validar que a Live Demo está online (Vercel/Cloudflare) e funcionando sem login complexo.
- [ ] Validar que o vídeo abre perfeitamente.
- [ ] Confirmar que o Side Track **Superteam Brasil** está assinalado no formulário.
- [ ] Submeter **com pelo menos 3 horas de antecedência** pelo **Líder do Time**.

---

## 🎙️ ETAPA 10: Ponto 10 - Preparação para a Entrevista de 15 Minutos

- [ ] Treinar resposta para: *"O que vocês aprenderam nessas 4 semanas que ninguém mais sabe?"*
- [ ] Treinar resposta para: *"Quem são os concorrentes e por que vocês não serão esmagados?"*
- [ ] Treinar resposta para: *"Por que agora? O que mudou no ecossistema?"*
- [ ] Treinar resposta para: *"Vocês estão prontos para tocar isso full-time no Accelerator?"*

# 🤖 Solana Engineering Agents — Gemini & Antigravity Suite

Este repositório possui uma suíte com **15 Agentes Especializados em Solana** e **Skills Nativas** integradas ao Antigravity/Gemini sob a pasta `.agents/plugins/solana-suite/`.

---

## 👥 Os 15 Agentes Disponíveis

| Agente | Arquivo de Definição | Especialidade / Atuação |
|---|---|---|
| **`token-engineer`** | [.agents/plugins/solana-suite/agents/token-engineer.md](.agents/plugins/solana-suite/agents/token-engineer.md) | **Token Extensions (Token-2022)**, Interest-Bearing Mints, Transfer Hooks, Metadados on-chain. |
| **`anchor-engineer`** | [.agents/plugins/solana-suite/agents/anchor-engineer.md](.agents/plugins/solana-suite/agents/anchor-engineer.md) | **Anchor 1.x**, accounts, constraints, CPIs, IDL, migrações e testes em Rust LiteSVM. |
| **`solana-architect`** | [.agents/plugins/solana-suite/agents/solana-architect.md](.agents/plugins/solana-suite/agents/solana-architect.md) | Desenho de contas, modelo de PDAs, arquitetura multi-program e otimização de espaço. |
| **`solana-frontend-engineer`** | [.agents/plugins/solana-suite/agents/solana-frontend-engineer.md](.agents/plugins/solana-suite/agents/solana-frontend-engineer.md) | Wallet Adapter, React/Vite, `@solana/web3.js`, transações assinadas e UX fluida. |
| **`solana-qa-engineer`** | [.agents/plugins/solana-suite/agents/solana-qa-engineer.md](.agents/plugins/solana-suite/agents/solana-qa-engineer.md) | Testes de integração, benchmark de Compute Units (CU), fuzzing e auditoria pré-deploy. |
| **`defi-engineer`** | [.agents/plugins/solana-suite/agents/defi-engineer.md](.agents/plugins/solana-suite/agents/defi-engineer.md) | Mecânicas de liquidez, AMMs, pools e cofres de rendimento. |
| **`pinocchio-engineer`** | [.agents/plugins/solana-suite/agents/pinocchio-engineer.md](.agents/plugins/solana-suite/agents/pinocchio-engineer.md) | Otimização extrema de CU e Rust nativo sem Anchor para caminhos críticos. |
| **`devops-engineer`** | [.agents/plugins/solana-suite/agents/devops-engineer.md](.agents/plugins/solana-suite/agents/devops-engineer.md) | Deploys na Devnet/Mainnet, RPCs, scripts de automação e CI/CD. |
| **`mobile-engineer`** | [.agents/plugins/solana-suite/agents/mobile-engineer.md](.agents/plugins/solana-suite/agents/mobile-engineer.md) | Integração Mobile Wallet Adapter e PWAs para celular. |
| **`rust-backend-engineer`** | [.agents/plugins/solana-suite/agents/rust-backend-engineer.md](.agents/plugins/solana-suite/agents/rust-backend-engineer.md) | Indexadores, microserviços em Rust e listeners de eventos on-chain. |
| **`solana-guide`** | [.agents/plugins/solana-suite/agents/solana-guide.md](.agents/plugins/solana-suite/agents/solana-guide.md) | Tutoriais, onboarding de builders e boas práticas do ecossistema. |
| **`solana-researcher`** | [.agents/plugins/solana-suite/agents/solana-researcher.md](.agents/plugins/solana-suite/agents/solana-researcher.md) | Pesquisa de ecossistema, protocolos de referência e benchmarking on-chain. |
| **`tech-docs-writer`** | [.agents/plugins/solana-suite/agents/tech-docs-writer.md](.agents/plugins/solana-suite/agents/tech-docs-writer.md) | Documentação técnica, especificações de IDL e READMEs de repositório. |
| **`game-architect`** | [.agents/plugins/solana-suite/agents/game-architect.md](.agents/plugins/solana-suite/agents/game-architect.md) | Sessões efêmeras, state compression e gaming on-chain. |
| **`unity-engineer`** | [.agents/plugins/solana-suite/agents/unity-engineer.md](.agents/plugins/solana-suite/agents/unity-engineer.md) | SDKs de jogos e integração nativa com engines. |

---

## 🛠️ Como o Gemini utiliza esses agentes

Ao pedir qualquer instrução no chat (ex: *"Crie o mint do Token-2022 com taxa de juros"* ou *"Escreva os testes do Anchor"*), o assistente Gemini adota automaticamente os padrões, convenções de código e checklists do agente correspondente (`token-engineer` e `anchor-engineer`).

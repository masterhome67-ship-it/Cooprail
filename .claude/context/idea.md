# Memorando de Ideias — Idea Sprint (Colosseum Hackathon)
*Data da sessão:* 2026-10-09  
*Fonte do método:* skill `idea-sprint` (solanabr/solana-ai-kit, adaptação upstream de sendaifun/solana-new `find-next-crypto-idea` e `validate-idea`)  
*Fonte da pesquisa:* Vencedores das temporadas Cypherpunk e Frontier da Colosseum (blog.colosseum.com e colosseum.com/companies)

---

## 🧭 Critérios de Pontuação (0 a 15)
- **Problema Real e Dor Comprovada (0 a 5):** Alguém perde dinheiro, tempo ou clientes hoje de verdade?
- **Portão de Necessidade de Cripto (0 a 5):** Se fosse feito com MySQL e app comum, o que quebraria?
- **Viabilidade e Velocidade de Entrega (0 a 5):** O time consegue entregar um MVP funcional e testar em 4 semanas?
- **Linhas de Decisão:** $\ge 8$ = **GO** | $6$ a $7$ = **CONDICIONAL** (com condição nomeada) | $< 6$ = **NO-GO** (com pivô junto)

---

## 🏆 Candidatos Avaliados

### [ESCOLHIDO] Candidato 1: O Lojista do Balcão e a Fricção Invisível de Recompra
* **Primeira linha (Pessoa & Problema):** O operador de caixa de estabelecimento parceiro que não consegue validar cupons/pontos no momento da compra sem gerar filas e atrito, e o lojista que não consegue comprovar a economia real e a taxa de retorno gerada para os clientes.
* **O que acontece hoje:** O cliente mostra a tela do app de relance; o caixa não digita dados no sistema para não travar a fila; escanear cupom fiscal falha por CNPJ divergente ou falta de emissão; o lojista não registra a economia e o cliente vê seus pontos expirarem. (Casos em que o fluxo foi cumprido no Arms Pass registraram R$ 100k+ em vendas e R$ 20k+ em economia comprovada).
* **Portão de Necessidade de Cripto:** *Se fosse feito com banco de dados MySQL comum, o que quebraria?*  
  Quebraria a reconciliação e a retenção sem atrito: o caixa ainda precisaria fazer input manual ou integrar ERPs pesados, o ponto continuaria sendo um passivo estático que expira e o cliente não teria incentivo para guardar o saldo. Na Solana, o pagamento no cartão Visa/Pix aciona o smart contract sem nenhuma digitação do caixa (Zero-Touch), creditando USDG com Token Extensions (Interest-Bearing) que rende juros todo dia até a próxima compra.
* **Pontuação:**
  - Dor e Comprovação Real: 5 / 5
  - Necessidade de Cripto (Portão): 4 / 5
  - Viabilidade de Entrega (4 semanas): 4 / 5
  - **TOTAL: 13 / 15 ──► GO (ESCOLHIDO)**

---

### Candidato 2: O Profissional Autônomo e a Cobrança Recorrente sem Maquininha
* **Primeira linha (Pessoa & Problema):** O personal trainer ou profissional autônomo de serviços que cobra mensalidades de alunos via Pix avulso e perde clientes por falta de um mecanismo automatizado de retenção e cashback.
* **O que acontece hoje:** O profissional cobra no WhatsApp todo dia 5; alunos atrasam ou esquecem; ele não tem margem para contratar gateways tradicionais de recorrência que cobram mensalidades fixas.
* **Portão de Necessidade de Cripto:** *Se fosse feito com banco de dados MySQL comum, o que quebraria?*  
  Pouca coisa quebraria: plataformas Web2 como Asaas, Cora ou Mercado Pago já processam Pix e cobranças com taxas acessíveis. O uso de blockchain só se justificaria se houvesse uma rede compartilhada de clientes entre diferentes profissionais.
* **Pontuação:**
  - Dor e Comprovação Real: 3 / 5
  - Necessidade de Cripto (Portão): 2 / 5
  - Viabilidade de Entrega (4 semanas): 2 / 5
  - **TOTAL: 7 / 15 ──► CONDICIONAL**
  - **Condição nomeada:** *Só se torna GO se responder: "Quem mais precisa ler o registro além do próprio profissional?" (Necessita de uma rede multilateral de prestadores para justificar estado compartilhado).*

---

### Candidato 3: O Cartão Fidelidade de Carimbos da Cafeteria
* **Primeira linha (Pessoa & Problema):** O dono de cafeteria que distribui cartões de papel carimbados ("junte 10 carimbos e ganhe um café") querendo digitalizar o programa como NFTs na Solana.
* **O que acontece hoje:** O cliente perde o papelzinho ou esquece na carteira; a cafeteria arca com pequenas fraudes de carimbo mas o custo é marginal.
* **Portão de Necessidade de Cripto:** *Se fosse feito com banco de dados MySQL comum, o que quebraria?*  
  **Nada quebra.** Um banco de dados simples ou o próprio papel já cumprem a função. Forçar o cliente de café a interagir com NFT on-chain adiciona uma fricção destrutiva que ninguém pediu.
* **Pontuação:**
  - Dor e Comprovação Real: 2 / 5
  - Necessidade de Cripto (Portão): 1 / 5
  - Viabilidade de Entrega (4 semanas): 1 / 5
  - **TOTAL: 4 / 15 ──► NO-GO**
  - **Pivô obrigatório:** *Abandone a ideia de "NFT para fidelidade simples"; volte para problemas onde há perda financeira real de receita no balcão e necessidade de liquidação sem atrito.*

---

## 🔎 Análise de Lacunas (Gap Analysis) no Registro da Colosseum
*Pesquisado em:* 2026-10-09  
*Base consultada:* Posts de vencedores das temporadas Cypherpunk e Frontier (blog.colosseum.com) e perfis em colosseum.com/companies.

### 📌 Nota de Lacuna — Candidato 1: Engagy Giftback (O Escolhido)
* **Projeto mais parecido no registro:** **TipLink** e **Decaf** (Temporadas anteriores / Tracks Consumer e Payments).
* **O que eles construíram:** Links ultraleves para distribuição de fundos e saques de stablecoins sem necessidade de carteira prévia instalada, e checkout de pagamentos digitais na Solana.
* **O que eles NÃO fizeram (A NOSSA LACUNA):** Nenhum deles construiu a camada de retenção para o varejo físico com reconciliação **Zero-Touch no caixa** (integrada aos trilhos de pagamento Visa/Pix) e **cashback que rende juros on-chain** via Token Extensions (Interest-Bearing Mint). Eles focaram em "pagar e transferir"; nós focamos em "reconhecer a compra sem tocar no caixa e fazer o dinheiro render para forçar a recompra".
* **Segundo mais parecido:** **Sphere Labs** (Vencedor de Payments Track) / *Não fez:* Mecanismo de giftback e fidelidade B2B2C com painel de atribuição de recompra para o lojista físico.

### 📌 Nota de Lacuna — Candidato 2: Cobrança Recorrente para Autônomos
* **Projeto mais parecido no registro:** **Helio** (Web3 Payments).
* **O que construiu:** Plataforma de checkout de pagamentos e assinaturas recorrentes on-chain para criadores e e-commerces.
* **O que NÃO fez:** Não atacou o prestador de serviços físicos local nem resolveu a integração com pagamentos instantâneos locais (Pix).

### 📌 Nota de Lacuna — Candidato 3: Cartão de Carimbos NFT (NO-GO)
* **Projeto mais parecido no registro:** Projetos de programas de fidelidade e NFTs de marcas de temporadas antigas da Solana.
* **O que construiu:** Emissão de NFTs de coleção para clientes de marcas Web3.
* **O que NÃO fez (Por que falhou):** Não eliminou a barreira de entrada para clientes do mundo real; exigia que o cliente tivesse carteira com SOL para pagar taxas, provando exatamente por que o Candidato 3 é um NO-GO estrutural.

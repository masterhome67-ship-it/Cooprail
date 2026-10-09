# 🚀 Template Oficial de Submissão & Pitch — Colosseum Solana Hackathon

> **Instruções:** Este arquivo está pronto para edição. Substitua os campos entre colchetes `[exemplo]` pelas informações do seu projeto. O template está 100% alinhado às **4 perguntas fundamentais da banca da Colosseum** e ao formato oficial exigido na plataforma.

### 🧭 As 4 Perguntas que a Banca fará ao avaliar este documento:
1. **O problema é real?** → Respondido no *Insight*, *Market Size* e *Viability* (com dinheiro/skin-in-the-game na mesa).
2. **O produto funciona?** → Respondido no *Product + Execution* (velocidade de entrega e produto funcional na Solana).
3. **A história convence?** → Respondido na *Founder Communication* (respostas escritas, vídeo demo de 3 min e narrativa).
4. **Esse time aguenta?** → Respondido no *Founder + Market Fit*, *Revisão de Repositório* e *Entrevista de 15 min*.

---

## 📌 1. Visão Geral do Projeto (Meta Informações)

- **Nome do Projeto:** `[Engagy Giftback]`
- **Tagline (One-Liner de alto impacto):** `[O primeiro programa de recompensas via WhatsApp na Solana onde o cashback não expira — ele rende juros até sua próxima compra.]`
- **Categoria Principal da Colosseum:** `Consumer` (Fidelidade, Comércio & Pagamentos)
- **Side Tracks Inscritos:**
  - `[x] Side Track Superteam Brasil (US$ 10,000 USDG)`
  - `[x] Visa Frontier Hackathon Track (US$ 10,000 USDG)`
  - `[x] theMiracle — In-Wallet Brand Activation (US$ 10,000 USDC)`
- **Links Essenciais:**
  - 🌐 **Live Demo (dApp funcional):** `[https://engagy-giftback.vercel.app]`
  - 💻 **Repositório GitHub (Open Source):** `[https://github.com/julianobrustolin/engagy-giftback]`
  - 🎥 **Vídeo Demo (YouTube/Loom público, máx. 3 min):** `[https://youtu.be/seu-video]`
  - 🐦 **Twitter/X do Projeto:** `[@engagygiftback]`
  - 💬 **Contato Principal (Telegram / Discord):** `[@julianobrustolin]`

---

## 👥 2. Founder + Market Fit *(Critério 1)*
*Objetivo: Demonstrar por que este time é imbatível na execução dessa ideia.*

- **Fundador (Solo Founder & Full-Stack Builder):**
  - **Nome e Função:** `Juliano Brustolin (Fundador, Produto & Engenharia)`
  - **Histórico Relevante:** `Desenvolvedor e empreendedor com experiência prática em plataformas de benefícios e programas de fidelidade. Criador do aplicativo Arms Pass, membro ativo da comunidade Superteam Brasil.`
  - **Por que este problema importa para você:** `Sou o criador do Arms Pass, aplicativo em produção que opera concessão de descontos para usuários. Na operação direta com lojistas e estabelecimentos parceiros, senti na pele a maior dor do setor: a fricção operacional imensa para o caixa validar pontos manualmente, a falta de transparência contábil e a dificuldade de comprovar a economia real gerada para o cliente final. O Engagy Giftback é a evolução direta dessa vivência para eliminar esse atrito usando a infraestrutura instantânea da Solana.`
- **Compromisso Pós-Hackathon:**
  - `[x] Aplicação formal para o Colosseum Accelerator e dedicação em tempo integral ao Engagy Giftback.`
  - **Piloto Imediato nos primeiros 60 dias:** Plugar o protocolo do Engagy Giftback como a camada de fidelidade e liquidação on-chain nos parceiros comerciais já existentes do Arms Pass, validando a velocidade de validação no caixa e a reação dos consumidores ao saldo rendendo.
  - **Lançamento em Mainnet:** Deploy oficial na Solana Mainnet integrando a stablecoin USDG para os lojistas do ecossistema Superteam Brasil e expansão do modelo para o varejo físico e e-commerces.

---

## 💡 3. The Insight & Problema *(Critério 2)*
*Objetivo: Mostrar a constatação não-óbvia que sustenta a sua tese.*

- **O Problema Real:**
  `Em programas de benefícios e fidelidade, validar pontos no balcão é um pesadelo operacional: lojistas e operadores de caixa sofrem com processos lentos e manuais que geram filas, atrito e desconfiança. Pior ainda: o comércio não tem como comprovar ao cliente de forma transparente e imediata a economia real gerada, enquanto o consumidor vê seus pontos expirarem em sistemas fechados e burocráticos.`
- **O que os concorrentes fazem de errado / Tentativas anteriores:**
  `Sistemas de CRM e fidelidade Web2 continuam presos a painéis engessados e checagens manuais no PDV que os funcionários evitam usar. Já as tentativas anteriores em Web3 tentaram forçar carteiras complexas (Metamask/EVM) e taxas de gás inviáveis, que tornam impossível uma validação em menos de 2 segundos no caixa da loja.`
- **O Insight Não-Óbvio (A Virada de Chave):**
  `A validação de benefícios não pode exigir nenhum esforço do caixa e o saldo precisa crescer com o tempo para que a economia seja matematicamente comprovada e irrefutável. Ao transformar o giftback em um saldo na Solana entregue por link direto no WhatsApp, a validação no caixa acontece em 400ms via bip de QR Code, e o saldo do cliente rende juros on-chain automaticamente todo dia. O lojista ganha retenção sem atrito no caixa, e o cliente vê seu dinheiro crescendo até a próxima compra.`
- **Por que Solana? (Por que NÃO outra blockchain):**
  `Finalidade de bloco de 400ms (não trava a fila do caixa), taxas de US$ 0,0002 por transação (micropagamentos viáveis em compras do dia a dia) e o recurso nativo de Token Extensions (Token-2022 Interest-Bearing), que permite que o cashback renda juros automaticamente sem a necessidade de contratos pesados de staking ou yield.`

---

## 🛠️ 4. Product + Execution & Repositório *(Critério 3 & Auditoria de Código)*
*Objetivo: Comprovar execução técnica, autoria autêntica e priorização estratégica dentro da janela do hackathon.*

> **Nota da Banca da Colosseum:** A avaliação de código procura *trabalho significativo feito pelo próprio time na janela do hackathon* e *priorização estratégica de features*. Eles **não** penalizam linguagem, framework, padrões de design ou estilo de código.

- **Comprovação de Trabalho na Janela do Hackathon:**
  - **Janela de Desenvolvimento:** `[Data de início] a [Data de submissão]`
  - **Histórico de Commits:** `[Link ou indicação de commits constantes feitos pelos membros do time no período]`
- **Autoria do Time (O que nós fizemos vs Terceiros):**
  - **Código proprietário construído pelo time:** `[Ex: Programa Anchor completo com 4 instruções on-chain, algoritmos de liquidação e interface React personalizada]`
  - **Bibliotecas / SDKs de terceiros utilizados:** `[Ex: @solana/web3.js, Anchor CLI, Tailwind CSS]`
  - **Garantia de Autoria:** `[x] Declaramos que todo o código core foi concebido e codificado pelo time inscrito, sem terceirização.`
- **Priorização Estratégica de Funcionalidades:**
  - **O que priorizamos no MVP (Core Loop):** `[Ex: Foco 100% no fluxo de depósito, trava no PDA e liquidação atômica instantânea para provar a viabilidade técnica.]`
  - **O que decidimos NÃO fazer estrategicamente para o Hackathon:** `[Ex: Deixamos sistemas secundários de governança e analytics complexos para a fase pós-aceleração.]`
- **Arquitetura Técnica:**
  - **Smart Contract ID (Devnet/Mainnet):** `[Ex: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU]`
  - **Frameworks & Ferramentas:** `[Anchor, Rust, Next.js, Solana Web3.js / Umi, etc.]`
  - **Fluxo Principal do Usuário:**
    1. `Passo 1: [Usuário conecta a carteira e inicia o fluxo]`
    2. `Passo 2: [O smart contract processa a validação on-chain e tranca os ativos no PDA]`
    3. `Passo 3: [A liquidação ocorre de forma atômica e os tokens são creditados]`

---

## 📈 5. Potential Market Size & Business Model *(Critérios 4 & 6: Viability & TAM)*
*Objetivo: Demonstrar viabilidade econômica e tamanho de oportunidade investível.*

- **Tamanho do Mercado:**
  - **TAM (Mercado Total Endereçável):** `[Ex: US$ 50B+ em antecipação de recebíveis no mercado da América Latina]`
  - **SAM (Mercado Disponível):** `[Ex: US$ 5B em crédito para PMEs digitais e e-commerces]`
  - **SOM (Meta de 12-18 meses):** `[Ex: US$ 50M de volume transacionado on-chain]`
- **Modelo de Negócio & Monetização:**
  - **Como o projeto gera receita:** `[Ex: Taxa de protocolo de 0.25% sobre o volume originado / Spread em pools de liquidez]`
  - **Sustentabilidade Econômica:** `[Sem dependência de emissão inflacionária de tokens; receita gerada a partir de utilidade real e transações em USDG/USDC.]`

---

## 📊 6. Traction & Comunidade *(Critério 7)*
*Objetivo: Exibir dados reais obtidos durante o período do hackathon.*

- **Métricas On-Chain:**
  - **Carteiras únicas que testaram o dApp:** `[Ex: 120 carteiras distintas]`
  - **Transações executadas na Devnet/Mainnet:** `[Ex: 1.450 transações registradas]`
  - **Volume simulado/transacionado:** `[Ex: US$ 85.000 em volume de testes]`
- **Validação de Usuários & Parcerias:**
  - `[Ex: Testado e validado com 15 membros da comunidade Superteam Brasil no Discord.]`
  - `[Ex: Conversas iniciadas com os protocolos X e Y para provimento de liquidez inicial.]`

---

## 🎬 7. Roteiro do Vídeo Pitch (Máximo 3 Minutos) *(Critério 5: Founder Communication)*

*Duração recomendada: exatamente entre 2m30s e 3m00s.*

| Tempo | Seção | O que falar e mostrar na tela |
|---|---|---|
| **0:00 - 0:30** (30s) | **Gancho, Problema & Insight** | Mostre o fundador na câmera. Fale direto sobre a dor no mercado, por que as soluções atuais falham e apresente seu insight inovador. |
| **0:30 - 2:00** (90s) | **Live Demo do Produto** | Compartilhe a tela. Mostre o dApp funcionando ao vivo: conexão de carteira, aprovação de transação na Solana, saldo atualizando em tempo real. Sem slides, apenas produto real! |
| **2:00 - 2:30** (30s) | **Arquitetura & Por que Solana** | Destaque rápido do programa Anchor, uso de PDAs, velocidade de liquidação e por que Solana foi essencial para viabilizar o projeto. |
| **2:30 - 3:00** (30s) | **Tração, Time & Visão Futura** | Números do teste no hackathon, quem é o time e o compromisso de acelerar no Colosseum Accelerator pós-hackathon. |

---

## ✅ Checklist Final Antes de Clicar em "Submit"

- [ ] **Blindagem contra Desclassificação (Regras Colosseum):**
  - [ ] Nenhum membro do time está inscrito ou colaborando em outro projeto neste hackathon (1 submissão por pessoa).
  - [ ] A submissão será concluída e enviada formalmente pelo **Líder do Time** (indicado no brief) antes do deadline oficial.
  - [ ] Todo código pré-existente, fork ou biblioteca externa está 100% declarado no README (sem mascarar histórico de desenvolvimento).
- [ ] Live demo está acessível publicamente sem necessidade de login complexo ou permissões fechadas.
- [ ] Vídeo no YouTube/Loom está configurado como **Público** ou **Não listado** (Unlisted), testado em aba anônima.
- [ ] O repositório no GitHub possui um `README.md` estruturado com instruções claras de como rodar localmente e IDs dos contratos.
- [ ] O Side Track **Superteam Brasil** está explicitamente marcado na submissão.
- [ ] Todos os membros do time foram adicionados ao time na plataforma da Colosseum.

---

## 🎙️ 8. Guia de Preparação para a Entrevista de 15 Minutos (Filtro Final)
*Objetivo: Responder às perguntas que decidem a premiação e o cheque de aceleração.*

A entrevista com os sócios da Colosseum é rápida, direta e sem slides. Eles testam se **"esse time aguenta"** e se **"o problema é real"**:

1. **"O que vocês aprenderam construindo isso nas últimas 4 semanas que ninguém mais sabe?"**
   - *Como responder:* Não repita generalidades. Fale de um atrito técnico real que superaram ou de uma reação surpreendente de um usuário real durante os testes.
2. **"Quem são seus concorrentes e por que vocês não serão esmagados por eles?"**
   - *Como responder:* Reconheça a existência deles com respeito e mostre seu diferencial estrutural (ex: custo de infraestrutura 10x menor na Solana, modelo de distribuição na Superteam Brasil ou insight proprietário).
3. **"Por que agora? O que impede que isso tenha sido feito 2 anos atrás?"**
   - *Como responder:* Aponte avanços recentes no ecossistema (ex: maturidade das stablecoins, Token Extensions, Firedancer, adoção local de pagamentos digitais).
4. **"Vocês estão prontos para largar tudo e tocar isso full-time se entrarem na aceleradora?"**
   - *Como responder:* Seja firme e transparente. Os fundadores que entram no Accelerator são aqueles com compromisso total de construir uma venture global.


# Critérios de Julgamento — Colosseum Solana Hackathon
*Fonte de referência: colosseum.com/hackathon (lido em 2026-09-06)*

A Colosseum avalia projetos sob a ótica de uma aceleradora de capital de risco (venture capital), buscando produtos com capacidade de se tornarem protocolos ou empresas globais sustentáveis e investíveis.

---

## 🎯 A Matriz das 4 Perguntas da Banca

Em última análise, os 7 critérios formais se reduzem a apenas 4 perguntas que os jurados e parceiros da Colosseum buscam responder:

| Pergunta da Banca | Critérios / Onde é avaliado | O teste definitivo |
|---|---|---|
| **1. O problema é real?** | **Insight**, **Potential Market Size**, **Viability** | *Perguntado com dinheiro junto:* Há usuários dispostos a pagar ou movimentar capital real nisso? O mercado é grande o suficiente para justificar venture capital? |
| **2. O produto funciona?** | **Product + Execution** | *Velocidade de entrega vs concorrência:* A concorrência e a velocidade de entrega são a mesma pergunta ao longo do tempo. O dApp executa de verdade na Solana sem travar? |
| **3. A história convence?** | **Founder Communication** | *Respostas escritas, vídeo demo (3 min) e entrevista de 15 min:* O fundador articula o insight e a solução com clareza cristalina, sem jargões vazios? |
| **4. Esse time aguenta?** | **Founder + Market Fit**, **Revisão de Repositório**, **Entrevista** | *Trabalho feito pelo próprio time:* O time tem estômago, domínio técnico e histórico para aguentar o tranco pós-hackathon e construir um unicórnio? |

---

## 1. Founder + Market Fit
- **O que avaliam:** Por que este time específico é o mais qualificado para resolver este problema?
- **Evidências:** Experiência prévia em Web3/Solana, conhecimento de domínio da indústria, histórico técnico e dedicação full-time ao projeto.
- **Dica:** Conte como a vivência dos fundadores revelou o problema que outros não enxergam.

## 2. Insight
- **O que avaliam:** A constatação não-óbvia ou segredo de mercado.
- **Evidências:** Qual mecanismo ou tese diferencia sua solução de concorrentes existentes? Por que as tentativas anteriores falharam e o que mudou agora?
- **Dica:** Conecte o insight a capacidades únicas da Solana (ex: alto throughput, transações quase gratuitas, token extensions, atomicidade).

## 3. Product + Execution
- **O que avaliam:** O que foi construído de fato durante o hackathon e a qualidade da execução.
- **Evidências:** Contratos inteligentes funcionais (Anchor/Rust), interface intuitiva (UI/UX limpa e moderna), estabilidade na Devnet/Mainnet e ausência de bugs impeditivos.
- **Dica:** Uma aplicação funcional com 2 fluxos perfeitos vale muito mais que 10 telas com botões sem ação.

## 4. Potential Market Size
- **O que avaliam:** O tamanho do mercado endereçável (TAM) e potencial de escala global.
- **Evidências:** Estimativa fundamentada de volume de transações, base de usuários potenciais e capacidade de expansão para além de nichos restritos.
- **Dica:** Apresente números com fontes claras (Bottom-up e Top-down).

## 5. Founder Communication
- **O que avaliam:** A capacidade do fundador de articular sua visão com clareza, concisão e persuasão.
- **Evidências:** Vídeo pitch/demo (máximo de 3 minutos) sem enrolação, README do GitHub explicativo e didático, arquitetura desenhada e narrativa fluida.
- **Dica:** Dedique os primeiros 30 segundos ao problema/insight, os 90 segundos centrais à demonstração prática e os 60 segundos finais à tração e visão.

## 6. Viability
- **O que avaliam:** Sustentabilidade financeira, viabilidade técnica e conformidade regulatória.
- **Evidências:** Modelo de receita transparente (taxas de protocolo, monetização, tokenomics sustentável) e plano de custos operacionais viável na Solana.
- **Dica:** Evite esquemas inflacionários vazios. Mostre geração de valor real e fluxo de caixa ou retenção de liquidez.

## 7. Traction
- **O que avaliam:** Validação no mundo real obtida durante o período do hackathon.
- **Evidências:** Usuários ativos em teste, número de transações on-chain, volume movimentado, feedback de usuários na comunidade (X, Discord, Superteam) e parcerias preliminares.
- **Dica:** Mostre dados reais: "Nas primeiras 72h em devnet, tivemos 150 carteiras conectadas e 4.200 transações executadas".

---

## 🔍 Diretrizes de Revisão de Repositório (Audit do GitHub)
*Fonte: colosseum.com/hackathon (lido em 2026-09-06)*

A banca da Colosseum faz uma checagem técnica do repositório com foco estrito em **autoria, escopo e estratégia**, desmistificando mitos sobre "código perfeito":

### ✅ O que a Colosseum PROCURA:
1. **Trabalho significativo dentro da janela do hackathon:**
   - Histórico de commits consistente durante as datas oficiais da competição.
   - Prova de que a solução foi desenvolvida para e durante o hackathon (não um projeto antigo reempacotado).
2. **Trabalho feito pelo time, não por terceiros:**
   - Autoria autêntica dos integrantes cadastrados.
   - Não tentar passar repositórios clonados, templates genéricos ou código terceirizado como desenvolvimento próprio.
3. **Funcionalidades priorizadas com estratégia:**
   - Foco cirúrgico no núcleo da proposta de valor (Core Loop / MVP).
   - Demonstração de que o time sabe o que cortar e o que priorizar para validar a tese no prazo.

### ❌ O que a Colosseum NÃO OLHA:
- **Linguagem:** Não há penalidade ou preferência dogmática.
- **Framework:** Livre escolha para web, mobile ou infraestrutura.
- **Padrões de projeto:** Não cobram arquitetura de software acadêmica ou overengineering.
- **Qualidade / Estilo de código:** Não julgam pontuação de linters, formatação ou estética de código — o foco é o funcionamento real e a entrega do valor prometido.

---

## 🚫 Motivos de Desclassificação Imediata (Tolerância Zero)
*Fonte: colosseum.com/hackathon (lido em 2026-09-06)*

A Colosseum aplica regras rígidas de integridade. A violação de qualquer um destes pontos resulta em **desclassificação, banimento da plataforma e revogação retroativa de prêmios**:

1. **Exclusividade de submissão (1 projeto por pessoa):**
   - Apenas **uma submissão de produto por time** e, portanto, **uma por pessoa**.
   - Nenhum participante pode entrar ou colaborar com um segundo projeto "por fora" ou sob pseudônimos.
2. **Submissão concluída pelo Líder do Time antes do prazo:**
   - A submissão precisa ser finalizada e enviada formalmente pelo **Líder do Time** (indicado no brief) estritamente antes do deadline final. Submissões incompletas ou enviadas por outros membros não contam.
3. **Deturpação de histórico e código não declarado:**
   - Mentir sobre quando o código foi escrito, falsificar datas de commits ou omitir código/bases que já existiam antes do hackathon é infração gravíssima.
   - **Regra de ouro:** Se o time utilizou uma base, biblioteca própria ou trabalho anterior, isso **deve ser explicitamente declarado no README e no formulário**. Apenas o que foi construído durante a janela conta para a avaliação, mas a transparência é mandatória para evitar banimento.



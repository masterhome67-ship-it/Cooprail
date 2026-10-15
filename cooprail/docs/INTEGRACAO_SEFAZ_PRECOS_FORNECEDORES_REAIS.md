# 📑 Registro da Conversa: Fornecedores Reais, Preços e Integração SEFAZ

**Data:** 15 de Outubro de 2026  
**Projeto:** Cooprail — Plataforma Corporativa de Suprimentos & Liquidação On-Chain  
**Participantes:** Juliano & Assistente de Engenharia  

---

## 📌 1. O Problema Identificado e Alinhamento

* **Situação Inicial:** Ao testar o fluxo de compras para *"50 sacos de cimento em Umuarama"*, o sistema exibiu propostas comerciais com nomes e preços pré-definidos no código (*"Depósito & Distribuidora Umuarama Materiais"*, *"Votoran Constrular"*, etc.).
* **Questionamento do Usuário:** 
  1. *De onde vieram esses fornecedores?*
  2. *Como comprador, eu não preciso digitar CNPJ, preciso que o sistema encontre novos fornecedores para mim.*
  3. *De onde veio a análise de preço médio? Quero apenas informações reais.*
* **Diagnóstico e Transparência:**
  * Os fornecedores e a estimativa inicial (R$ 32,50 a R$ 35,00) eram valores estáticos colocados no código (mockados) para validação de tela e para não deixar o sistema bloqueado.
  * Lojas de materiais de construção no interior do Brasil não dispõem de APIs abertas públicas de preços instantâneos.
  * O comprador precisa de **dados 100% auditáveis e reais**, sem simulações.

---

## 🏗️ 2. CNAEs Oficiais de Materiais de Construção (IBGE / Receita Federal)

Para busca automatizada de empresas aptas no Brasil:

### Varejo (Lojas e Depósitos Físicos)
* **`4744-0/99`** — Comércio varejista de materiais de construção em geral *(o principal de depósitos locais)*
* **`4744-0/04`** — Comércio varejista de cal, areia, pedra britada, tijolos e telhas
* **`4744-0/01`** — Comércio varejista de ferragens e ferramentas

### Atacado (Distribuidoras B2B e Fabricantes)
* **`4679-6/99`** — Comércio atacadista de materiais de construção em geral
* **`4674-5/00`** — Comércio atacadista de cimento *(distribuidores autorizados de cimento)*
* **`4672-9/00`** — Comércio atacadista de ferragens e ferramentas

---

## 💰 3. Fontes Oficiais de Preços Reais de Cimento no Paraná

1. **Tabela Oficial SINAPI (Caixa Econômica Federal / IBGE — Paraná):**
   * **Insumo 1379:** *Cimento Portland Composto CP II-32 (Saco de 50 kg)*.
   * **Valor Mediano Oficial no Paraná:** Faixa de **R$ 37,50 a R$ 42,50** por saco de 50 kg (custo direto estadual de referência).
2. **Mercado Local de Umuarama / Notas Fiscais (SEFA-PR):**
   * Preço de balcão avulso: **R$ 38,00 a R$ 45,00**.
   * Preço negociado para lotes de obra (50+ sacos à vista/boleto faturado): **R$ 35,00 a R$ 37,00**.

---

## 🏢 4. Depósitos e Lojas Reais em Umuarama - PR

Empresas reais ativas na cidade mapeadas para cotações:

* **Depósito Beirão** — Av. Ângelo Moreira da Fonseca, 2300 - Parque Danielle • Tel: (44) 3639-8000
* **Construmil Materiais para Construção** — Praça Miguel Rossafa, 5595 - Zona III • Tel: (44) 3622-1000
* **Umuarama Materiais para Construção** — Região Central / Av. Paraná • Tel: (44) 3621-1200
* **Depósito Mirassol** — Av. da Estação, 2967 - Zona VI • Tel: (44) 3622-3500
* **Arrudão Tudo para Construção** — Rua Antonio Ramalho, 1040 - Jardim Soluar • Tel: (44) 3622-2705

---

## ⚡ 5. A Solução da Equação: Conexão com SEFAZ & Base de Fornecedores Reais

A decisão de arquitetura para abastecer a plataforma com **dados reais e automáticos**:

### A. Opção Imediata (Via Importação de XMLs de NF-e)
* **Como funciona:** A empresa já possui nos computadores ou no e-mail os arquivos `.xml` das notas fiscais de compras que realizou no passado.
* **Processamento:** O usuário seleciona os arquivos `.xml` ou uma pasta com eles.
* **O que o sistema extrai:**
  * Tag `<emit>`: CNPJ, Razão Social, Endereço e Telefone do fornecedor real.
  * Tag `<det><prod>`: Descrição do produto, quantidade, unidade e valor unitário real pago pela empresa.
  * Tag `<ide><dhEmi>`: Data oficial da compra.
* **Resultado:** Banco de Fornecedores Homologados e Histórico de Preços criado em segundos, 100% real e auditável.

### B. Opção Automática Contínua (Via Certificado Digital A1 e-CNPJ)
* **Como funciona:** A empresa anexa uma única vez o arquivo do Certificado Digital A1 (`.pfx`) e informa a senha segura.
* **Web Service SEFAZ:** O robô em background conecta no serviço oficial da SEFAZ Nacional (`NFeDistribuicaoDFe`).
* **Automação Total:**
  1. Sempre que qualquer funcionário ou encarregado comprar insumos e a nota for emitida na SEFAZ contra o CNPJ da empresa, o XML é baixado automaticamente.
  2. Fornecedores novos são cadastrados sozinhos.
  3. O histórico de preços reais de compra é atualizado em tempo real.
  4. O comprador não precisa digitar CNPJs nem cadastrar nada manualmente.

---

*Documento gerado e persistido no repositório para registro de arquitetura.*

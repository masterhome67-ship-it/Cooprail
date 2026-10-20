import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import pdfParse from 'pdf-parse-fork';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || 'AQ.Ab8RN6ItAV-vgZyBqp4DL6JTY-95Aeftxv_8nI0banuSct8z-w';
const DEEPSEEK_API_KEY =
  process.env.DEEPSEEK_API_KEY || 'sk-4077c9902d66496ebba33169f354754d';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Proteção contra DoS e esgotamento de memória (limite de 15MB)
    const MAX_FILE_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo excede o limite máximo permitido de 15MB.' },
        { status: 413 }
      );
    }

    const fileName = (file.name || '').toLowerCase();
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.csv', '.txt'];
    const hasAllowedExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!hasAllowedExtension) {
      return NextResponse.json(
        { error: 'Extensão de arquivo não permitida. Envie arquivos nos formatos: PDF, PNG, JPG, CSV ou TXT.' },
        { status: 415 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    let mimeType = file.type || 'application/pdf';
    if (fileName.endsWith('.pdf')) mimeType = 'application/pdf';
    else if (fileName.endsWith('.png')) mimeType = 'image/png';
    else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) mimeType = 'image/jpeg';
    else if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) mimeType = 'text/plain';

    // Extrai texto localmente para análise textual precisa
    let localText = '';
    if (mimeType === 'application/pdf') {
      try {
        const parsed = await pdfParse(buffer);
        localText = parsed.text || '';
      } catch (e) {
        console.error('pdfParse local error:', e);
      }
    } else if (mimeType === 'text/plain') {
      localText = buffer.toString('utf-8');
    }

    const prompt = `Você é o Engenheiro Especialista em Análise de Memoriais Descritivos, Editais e Cotações da plataforma Cooprail.
Analise com rigor técnico este documento (texto extraído e anexo binário).

SUA MISSÃO:
Extrair com fidelidade absoluta TODOS os itens, materiais, equipamentos ou serviços descritos no documento para estruturar uma Requisição de Compra (RFQ).

DIRETRIZES ESTREITAS:
1. ITENS TÉCNICOS (CRÍTICO):
- Extraia TODOS os materiais, peças, equipamentos e serviços descritos no memorial como itens individuais na lista "items".
- Exemplo: se o memorial fala de "quadros de distribuição para 24 e 18 disjuntores monopolares", "eletrodutos", "fiação", "entrada de energia bloco A", crie um item para cada elemento com o respectivo quantitativo e especificação técnica.
- NUNCA agrupe tudo em "1 lote genérico" se houver múltiplos componentes ou descrições no texto.
- Se a quantidade não estiver em número exato, indique 1 e unidade adequada ("serviço", "un", "metros", "verba").

2. FORNECEDOR / EMISSOR:
- Se for uma PROPOSTA COMERCIAL com nome de empresa vendedora ou CNPJ, extraia em "supplierName".
- Se for um MEMORIAL DESCRITIVO / PROJETO TÉCNICO (sem fornecedor concorrente), preencha "Demanda Interna / Projeto".
- PROIBIÇÃO ABSOLUTA: NUNCA preencha "supplierName" com títulos de capítulos ou tópicos do documento (como "1. OBJETIVO", "SUMÁRIO", "INTRODUÇÃO", "ESCOPO").

3. TÍTULO E LOCALIZAÇÃO:
- "rfqTitle": Crie um título técnico claro e condizente com o documento (ex: "Instalações e Reforma Elétrica - Bloco A").
- NUNCA force localizações de exemplo como "Umuarama" a não ser que a cidade esteja expressamente escrita no texto.

Texto extraído do documento:
"""
${localText.slice(0, 15000)}
"""

Retorne OBRIGATORIAMENTE um JSON estrito:
{
  "rfqTitle": "Título técnico do projeto/demanda",
  "supplierName": "Nome do fornecedor (ou 'Demanda Interna / Projeto')",
  "quoteCode": "Código de controle do documento (ou 'Não informado')",
  "totalAmount": 0.0,
  "leadTimeDays": 0,
  "paymentTerms": "Condições financeiras (ou 'Não informado')",
  "validUntil": "Validade (ou 'Não informado')",
  "items": [
    {
      "item_name": "Nome técnico exato do insumo ou serviço",
      "specification": "Especificação técnica e exigências normativas descritas",
      "quantity": 1,
      "unit": "un / m / peças / barras / serviço",
      "target_unit_price": 0.0,
      "total_price": 0.0
    }
  ],
  "aiScore": 9.2,
  "aiAnalysisSummary": "Parecer técnico conciso resumindo o escopo auditado e principais componentes extraídos."
}`;

    // 1. TENTATIVA COM GOOGLE GEMINI (3.8-flash oficial com fallback multimodal)
    if (GEMINI_API_KEY) {
      const parts: any[] = [{ text: prompt }];

      if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        });
      }

      const candidateModels = [
        'gemini-3.8-flash',
        'gemini-flash-latest',
        'gemini-pro-latest',
      ];

      for (const model of candidateModels) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

          const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
              },
            }),
          });

          if (geminiRes.ok) {
            const geminiJson = await geminiRes.json();
            const rawResponseText =
              geminiJson.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

            let extractedData: any = {};
            try {
              extractedData = JSON.parse(rawResponseText);
            } catch (parseErr) {
              console.warn('Falha no JSON parse do Gemini:', parseErr);
              extractedData = {};
            }

            if (extractedData.items && extractedData.items.length > 0) {
              // Sanitiza fornecedor se veio com cabeçalho
              let cleanSupplier = extractedData.supplierName || 'Demanda Interna / Projeto';
              if (/^(1\.|2\.|3\.|objetivo|introdução|sumário|escopo)/i.test(cleanSupplier.trim())) {
                cleanSupplier = 'Demanda Interna / Projeto';
              }

              return NextResponse.json({
                success: true,
                isAIAgentActive: true,
                aiModel: `${model} (Google AI Oficial)`,
                rawText: localText.slice(0, 4000) || 'Documento analisado diretamente via visão multimodal.',
                extracted: {
                  rfqTitle: extractedData.rfqTitle || `Demanda: ${file.name.replace(/\.[^/.]+$/, '')}`,
                  supplierName: cleanSupplier,
                  quoteCode: extractedData.quoteCode || 'Não informado',
                  totalAmount: Number(extractedData.totalAmount) || 0,
                  leadTimeDays: Number(extractedData.leadTimeDays) || 0,
                  paymentTerms: extractedData.paymentTerms || 'Não informado',
                  validUntil: extractedData.validUntil || 'Não informado',
                  items: extractedData.items,
                  aiScore: Number(extractedData.aiScore) || 9.2,
                  aiAnalysisSummary: extractedData.aiAnalysisSummary || 'Memória técnica auditada e estruturada com sucesso pela IA.',
                },
              });
            }
          }
        } catch (modelErr) {
          console.warn(`Tentativa com Gemini ${model} falhou:`, modelErr);
        }
      }
    }

    // 2. TENTATIVA COM DEEPSEEK (se Gemini falhar ou não retornar itens)
    if (DEEPSEEK_API_KEY && localText.length > 20) {
      try {
        const deepseekRes = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            response_format: { type: 'json_object' },
            temperature: 0.1,
            messages: [
              {
                role: 'system',
                content: 'Você é um assistente de engenharia que extrai itens de memoriais técnicos e retorna JSON estrito.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
          }),
        });

        if (deepseekRes.ok) {
          const dsJson = await deepseekRes.json();
          const dsText = dsJson.choices?.[0]?.message?.content || '{}';
          const dsParsed = JSON.parse(dsText);

          if (dsParsed.items && dsParsed.items.length > 0) {
            let cleanSupplier = dsParsed.supplierName || 'Demanda Interna / Projeto';
            if (/^(1\.|2\.|3\.|objetivo|introdução|sumário|escopo)/i.test(cleanSupplier.trim())) {
              cleanSupplier = 'Demanda Interna / Projeto';
            }

            return NextResponse.json({
              success: true,
              isAIAgentActive: true,
              aiModel: 'DeepSeek V3 (Oficial)',
              rawText: localText.slice(0, 4000),
              extracted: {
                rfqTitle: dsParsed.rfqTitle || `Demanda: ${file.name.replace(/\.[^/.]+$/, '')}`,
                supplierName: cleanSupplier,
                quoteCode: dsParsed.quoteCode || 'Não informado',
                totalAmount: Number(dsParsed.totalAmount) || 0,
                leadTimeDays: Number(dsParsed.leadTimeDays) || 0,
                paymentTerms: dsParsed.paymentTerms || 'Não informado',
                validUntil: dsParsed.validUntil || 'Não informado',
                items: dsParsed.items,
                aiScore: Number(dsParsed.aiScore) || 9.0,
                aiAnalysisSummary: dsParsed.aiAnalysisSummary || 'Memória técnica auditada pelo motor DeepSeek.',
              },
            });
          }
        }
      } catch (dsErr) {
        console.warn('Tentativa com DeepSeek falhou:', dsErr);
      }
    }

    // 3. PROCESSADOR INTELIGENTE LOCAL (Heurística sem "1 lote" genérico)
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const extractedItems: any[] = [];

    if (localText) {
      // Divide por sentenças / linhas com conteúdo técnico relevante
      const technicalKeywords = [
        'disjuntor', 'disjuntores', 'quadro', 'quadros', 'fiação', 'condutor', 'condutores',
        'eletroduto', 'eletrodutos', 'cabo', 'cabos', 'energia', 'tubulação', 'tubo',
        'válvula', 'cimento', 'concreto', 'malha', 'aço', 'bomba', 'transformador',
        'aterramento', 'iluminação', 'tomada', 'interruptor', 'bloco', 'estaca'
      ];

      const sentences = localText.split(/[.;\n]/).map((s) => s.trim()).filter((s) => s.length > 15);

      for (const sent of sentences) {
        const lowerSent = sent.toLowerCase();
        const matchesKey = technicalKeywords.some((k) => lowerSent.includes(k));
        if (matchesKey && extractedItems.length < 10) {
          // Extrai número se houver
          const numMatch = sent.match(/(\d+)/);
          const qty = numMatch ? parseInt(numMatch[1], 10) : 1;

          extractedItems.push({
            item_name: sent.slice(0, 60),
            specification: sent,
            quantity: qty,
            unit: sent.includes('metro') ? 'metros' : sent.includes('disjuntor') || sent.includes('quadro') ? 'unidades' : 'serviço',
            target_unit_price: 0,
            total_price: 0,
          });
        }
      }
    }

    if (extractedItems.length === 0) {
      extractedItems.push({
        item_name: `Execução e fornecimento conforme ${cleanTitle}`,
        specification: localText.slice(0, 200) || 'Conforme memorial descritivo em anexo.',
        quantity: 1,
        unit: 'serviço global',
        target_unit_price: 0,
        total_price: 0,
      });
    }

    return NextResponse.json({
      success: true,
      isAIAgentActive: false,
      isFallback: true,
      aiModel: 'Processador Estrutural de Documentos',
      rawText: localText.slice(0, 3000),
      extracted: {
        rfqTitle: `Projeto: ${cleanTitle}`,
        supplierName: 'Demanda Interna / Projeto',
        quoteCode: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        totalAmount: 0,
        leadTimeDays: 0,
        paymentTerms: 'Faturamento conforme medição técnica',
        validUntil: 'A definir',
        items: extractedItems,
        aiScore: 8.5,
        aiAnalysisSummary: `Documento "${file.name}" analisado. ${extractedItems.length} componentes e especificações técnicas foram estruturados para cotação.`,
      },
    });
  } catch (error: any) {
    console.error('Erro geral em parse-document:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar' }, { status: 500 });
  }
}

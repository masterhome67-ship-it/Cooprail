import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { item, quantity, location, budget } = await req.json();

    if (!item) {
      return NextResponse.json({ error: 'Item ou descrição da cotação é obrigatório' }, { status: 400 });
    }

    const geminiKey =
      process.env.GEMINI_API_KEY || 'AQ.Ab8RN6JHQj9CgF1IkhwGxofNjLPuU7dS953tW-BH4cf7DOR8NA';

    const prompt = `Você é um motor de cotações industriais e busca de suprimentos B2B da plataforma Cooprail.
O comprador abriu uma requisição de cotação para:
- Item/Material: "${item}"
- Quantidade: "${quantity || '1 lote'}"
- Local de Entrega / Região: "${location || 'Região Sul / Paraná'}"
${budget ? `- Teto Orçamentário Estimado: R$ ${budget}` : ''}

Sua tarefa:
1. Realize uma pesquisa em tempo real por FORNECEDORES REAIS DE MERCADO ABERTO (distribuidoras, fabricantes, lojas de materiais industriais/construção) localizados na cidade/região citada ou que façam entrega no local.
2. Identifique os preços de mercado praticados atualmente para este material.
3. Retorne OBRIGATORIAMENTE um JSON puro (sem markdown, sem blocos de código com crases) com a seguinte estrutura:

{
  "suppliers": [
    {
      "name": "Nome da Empresa ou Distribuidora Real",
      "city": "Cidade/UF",
      "distance_km": 15,
      "phone": "(XX) XXXX-XXXX ou canal de contato público",
      "estimated_unit_price": 32.50,
      "total_amount": 1625.00,
      "delivery_lead_time_days": 2,
      "rating": 4.8,
      "market_source": "Fonte da cotação ou site público",
      "ai_analysis": "Parecer conciso sobre o fornecedor, capacidade de atendimento e logística."
    }
  ]
}

Traga entre 2 a 4 fornecedores reais e preços de mercado realistas. Responda APENAS com o JSON.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        tools: [{ googleSearch: {} }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4000,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Erro na API do Gemini:', err);
      return NextResponse.json({ error: 'Erro ao consultar motor de mercado' }, { status: 502 });
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Remove qualquer marcação de bloco de código ```json e ```
    const cleanJson = candidateText.replace(/```(?:json)?/gi, '').trim();

    try {
      const parsed = JSON.parse(cleanJson);
      return NextResponse.json({
        success: true,
        suppliers: parsed.suppliers || [],
      });
    } catch (parseErr) {
      // Se não vier JSON estrito, tenta extrair com regex
      const jsonMatch = candidateText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            success: true,
            suppliers: parsed.suppliers || [],
          });
        } catch {}
      }
      return NextResponse.json({
        success: false,
        error: 'Não foi possível estruturar as cotações em JSON',
        raw: candidateText,
      });
    }
  } catch (error: any) {
    console.error('Erro em /api/market-search:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}

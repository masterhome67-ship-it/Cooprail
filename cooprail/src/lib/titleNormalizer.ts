/**
 * Normaliza nomes de arquivo em títulos legíveis sem hífens e com acentuação correta
 * Exemplo: "memorial-eletrica.pdf" -> "Memorial Elétrica"
 */
export function normalizeTitleFromFilename(filename: string): string {
  if (!filename) return 'Memorial Técnico';
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  const clean = withoutExt.replace(/[-_]+/g, ' ').trim();

  return clean
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === 'eletrica') return 'Elétrica';
      if (lower === 'eletrico') return 'Elétrico';
      if (lower === 'hidraulica') return 'Hidráulica';
      if (lower === 'hidraulico') return 'Hidráulico';
      if (lower === 'mecanica') return 'Mecânica';
      if (lower === 'mecanico') return 'Mecânico';
      if (lower === 'orcamento') return 'Orçamento';
      if (lower === 'cotacao') return 'Cotação';
      if (lower === 'padrao') return 'Padrão';
      if (lower === 'versao') return 'Versão';
      if (lower === 'memorial') return 'Memorial';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

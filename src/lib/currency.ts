// Philippine Peso currency formatting helpers, used everywhere a monetary
// value is displayed across the site (gallery pricing, deposits, admin
// forms, emails, and the AI chat assistant).

export function formatPHP(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? Number(amount) : amount;
  if (num === null || num === undefined || Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(num);
}

export function formatPHPRange(
  min: number | string | null | undefined,
  max: number | string | null | undefined
): string {
  const minNum = typeof min === 'string' ? Number(min) : min;
  const maxNum = typeof max === 'string' ? Number(max) : max;
  const hasMin = minNum !== null && minNum !== undefined && !Number.isNaN(minNum);
  const hasMax = maxNum !== null && maxNum !== undefined && !Number.isNaN(maxNum);

  if (!hasMin && !hasMax) return 'Price on consultation';
  if (hasMin && hasMax) {
    if (minNum === maxNum) return formatPHP(minNum);
    return `${formatPHP(minNum)} – ${formatPHP(maxNum)}`;
  }
  return formatPHP(hasMin ? minNum : maxNum);
}

const MINOR_AMOUNT_PATTERN = /^(-?)(\d+)$/;

export function formatMinorAmount(minorAmount: string): string {
  const match = MINOR_AMOUNT_PATTERN.exec(minorAmount);
  if (!match) return 'R$ 0,00';

  const [, sign, digits] = match;
  const integerPart = digits.length > 2 ? digits.slice(0, -2) : '0';
  const cents = digits.slice(-2).padStart(2, '0');
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${sign}R$ ${groupedInteger},${cents}`;
}

/**
 * Formatea un precio para mostrar en la UI
 * Soporta Decimal de Prisma, number y string
 */
export function formatPrice(price: { toString(): string } | number | string): string {
  const numPrice = typeof price === 'object' && 'toString' in price
    ? parseFloat(price.toString())
    : typeof price === 'string'
      ? parseFloat(price)
      : price;
  
  return `$${numPrice.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Compara dos precios para determinar si son diferentes (hay descuento)
 */
export function hasDiscount(price: { toString(): string } | number | string, originalPrice: { toString(): string } | number | string): boolean {
  const p1 = typeof price === 'object' && 'toString' in price ? price.toString() : String(price);
  const p2 = typeof originalPrice === 'object' && 'toString' in originalPrice ? originalPrice.toString() : String(originalPrice);
  return p1 !== p2;
}

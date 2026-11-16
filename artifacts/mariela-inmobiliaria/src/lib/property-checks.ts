// Chequeos para cargar bien las propiedades desde el panel.

// "mm-00023 " -> "MM-00023"
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

// ¿La dirección tiene altura (un número de 2 a 5 cifras)? Las esquinas
// ("X y Y") también sirven para ubicar bien el pin.
export function addressHasNumber(address: string): boolean {
  const a = address.trim();
  if (!a) return false;
  if (/\b\d{2,5}\b/.test(a.replace(/\bkm\.?\s*[\d,.]+/i, ""))) return true;
  return /(&|\/|\sy\s|\se\s|esq)/i.test(a);
}

// Precio 0 = "Consultar" (el panel guarda 0 cuando se marca "Precio a consultar").
export function isPriceOnRequest(price: number | null | undefined): boolean {
  return !price || price <= 0;
}

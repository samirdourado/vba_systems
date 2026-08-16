export const formatCentsToBRL = (cents: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format((cents || 0) / 100);
};

export const parseBRLToCents = (value: string): number => {
  const cleanValue = value.replace(/\D/g, '');
  return Number(cleanValue);
};
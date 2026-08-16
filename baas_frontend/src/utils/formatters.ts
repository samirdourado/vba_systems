export const formatCentsToBRL = (cents: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format((cents || 0) / 100);
};

export const formatDateBR = (value?: string | null): string => {
  if (!value) {
    return 'Data indisponível';
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
};

export const parseBRLToCents = (value: string): number => {
  const cleanValue = value.replace(/\D/g, '');
  return Number(cleanValue);
};

export const normalizeTransactionStatus = (status?: string): string => {
  const map: Record<string, string> = {
    APPROVED: 'Aprovado',
    DENIED: 'Rejeitado',
    PENDING: 'Pendente',
    EXPIRED: 'Expirado',
    CANCELLED: 'Cancelado',
  }

  return map[status ?? ''] || (status ? status : 'Pendente')
}

export const normalizeTransactionType = (type?: string): string => {
  const map: Record<string, string> = {
    PIX: 'Pix',
    CARD: 'Cartão de crédito',
    CREDIT_CARD: 'Cartão de crédito',
    WITHDRAWAL: 'Saque',
  }

  return map[(type || '').toUpperCase()] || (type || 'Pagamento')
}

export const getStatusBadgeClasses = (status?: string): string => {
  const normalized = (status || '').toUpperCase()

  switch (normalized) {
    case 'APPROVED':
      return 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-100'
    case 'DENIED':
      return 'border border-red-500/40 bg-red-500/15 text-red-100'
    case 'PENDING':
      return 'border border-amber-500/40 bg-amber-500/15 text-amber-100'
    case 'EXPIRED':
      return 'border border-orange-500/40 bg-orange-500/15 text-orange-100'
    case 'CANCELLED':
      return 'border border-slate-400/40 bg-slate-500/15 text-slate-100'
    default:
      return 'border border-white/10 bg-white/5 text-slate-100'
  }
}
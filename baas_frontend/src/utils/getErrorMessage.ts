export const getErrorMessage = (statusCode?: number): string => {
  switch (statusCode) {
    case 400:
      return 'Dados inválidos.';
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    case 403:
      return 'Você não possui permissão para realizar esta operação.';
    case 404:
      return 'Recurso não encontrado.';
    case 409:
      return 'Já existe uma transação com essa referência.';
    case 422:
      return 'Os dados informados não puderam ser processados.';
    case 500:
      return 'Erro interno do servidor.';
    default:
      return 'Ocorreu um erro inesperado.';
  }
};
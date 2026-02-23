export interface Cliente {
  id: number;
  nome: string;
  nomeIndicador: string;
  enderecoRua: string;
  enderecoBairro: string;
  enderecoNumero: number;
}

export interface Relatorio {
  totalEmprestado: number;
  totalPago: number;
  totalAberto: number;
  parcelasAtrasadas: number;
  totalEmprestimos: number;
  totalParcelas: number;
  parcelasPagas: number;
  parcelasAVencer: number;
}

export interface Emprestimo {
  id: number;
  valorEmprestado: number;
  valorRecebido: number;
  valorAReceber: number;
}

export interface Parcela {
  status: "PENDENTE" | "PAGO";
  dataVencimento: string;
}
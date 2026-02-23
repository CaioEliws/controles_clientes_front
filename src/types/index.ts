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

export type StatusParcela =
  | "PENDENTE"
  | "ATRASADO"
  | "PAGO"
  | "PARCIAL";

export interface ParcelaResponse {
  numeroParcela: number;
  valorParcela: number;
  valorPago?: number;
  status: StatusParcela;
  dataVencimento: string;
  idEmprestimo: number;
  nomeCliente?: string;
}
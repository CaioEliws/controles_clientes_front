export type EmprestimoStatus = "EM_ABERTO" | "QUITADO";

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

export interface EmprestimoDetalhado {
  id: number;
  nomeCliente: string;

  dataEmprestimo: string;

  formaPagamento: string;

  valorEmprestado: number;
  valorTotalEmprestimo: number;
  valorParcela: number;
  valorRecebido: number;
  valorAReceber: number;

  inicioPagamento: string;
  finalPagamento: string;

  status: EmprestimoStatus | string;

  quantidadeParcelas: number;

  parcelasPagas: number;
  parcelasPendentes: number;
  parcelasAtrasadas: number;
}

export type StatusParcela =
  | "PENDENTE"
  | "ATRASADO"
  | "PAGO"
  | "PARCIAL";

export interface ParcelaResponse {
  idEmprestimo: number;
  numeroParcela: number;
  nomeCliente: string;
  valorParcela: number | string | null;
  valorPago?: number | string | null;
  dataVencimento: string | Date | null;
  status: StatusParcela;
}
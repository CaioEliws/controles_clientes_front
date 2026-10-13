export type EmprestimoStatus = "EM_ABERTO" | "QUITADO";

export const ESTADOS_CIVIS = ["SOLTEIRO", "CASADO", "DIVORCIADO", "VIUVO", "UNIAO_ESTAVEL", "SEPARADO"] as const;
export type EstadoCivil = (typeof ESTADOS_CIVIS)[number];
export const ESTADO_CIVIL_LABELS: Record<EstadoCivil, string> = {
  SOLTEIRO: "Solteiro(a)", CASADO: "Casado(a)", DIVORCIADO: "Divorciado(a)",
  VIUVO: "Viúvo(a)", UNIAO_ESTAVEL: "União estável", SEPARADO: "Separado(a)",
};

export type SexoDocumento = "MASCULINO" | "FEMININO";

export interface DadosPessoais {
  sexoDocumento?: SexoDocumento | null;
  nacionalidade?: string | null;
  estadoCivil?: EstadoCivil | null;
  profissao?: string | null;
  rg?: string | null;
  rgOrgaoExpedidor?: string | null;
  cpf?: string | null;
  enderecoRua?: string | null;
  enderecoBairro?: string | null;
  enderecoNumero?: number | null;
  enderecoComplemento?: string | null;
  enderecoCep?: string | null;
  enderecoCidade?: string | null;
  enderecoEstado?: string | null;
}

export interface Cliente extends DadosPessoais {
  quantidadeEmprestimos?: number | null;
  id: number;
  nome: string;
  nomeIndicador?: string | null;
}

export interface ParteContrato {
  sexoDocumento?: SexoDocumento | null;
  nomeCompleto: string | null;
  nacionalidade: string | null;
  estadoCivil: EstadoCivil | null;
  profissao: string | null;
  rg: string | null;
  rgOrgaoExpedidor: string | null;
  cpf: string | null;
  enderecoRua: string | null;
  enderecoNumero: number | null;
  enderecoComplemento: string | null;
  enderecoBairro: string | null;
  enderecoCep: string | null;
  enderecoCidade: string | null;
  enderecoEstado: string | null;
}

export interface EmprestimoContrato {
  valorEmprestado: number | null;
  taxaDeJuros: number | null;
  valorParcela: number | null;
  valorTotalEmprestimo: number | null;
  quantidadeParcelas: number | null;
  dataDoEmprestimo: string | null;
  inicioPagamento: string | null;
  finalPagamento: string | null;
  formaPagamento: "PIX" | "DINHEIRO" | null;
  frequenciaPagamento: FrequenciaPagamento | null;
  tipoContrato: TipoContrato | null;
  emprestimoStatus: "EM_ABERTO" | "QUITADO" | "REFINANCIADO" | null;
}

export interface ParcelaContrato {
  numeroParcela: number | null;
  dataVencimento: string | null;
  valorParcela: number | null;
}

export interface DadosContrato {
  camposDocumento?: Record<string, string | null>;
  emprestimoId: number;
  credor: ParteContrato;
  devedor: ParteContrato;
  fiador: ParteContrato | null;
  emprestimo: EmprestimoContrato;
  parcelas: ParcelaContrato[];
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
  valorTotalEmprestimo: number;
  valorRecebido: number;
  valorAReceber: number;
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

export type FrequenciaPagamento =
  | "DIARIO"
  | "SEMANAL"
  | "QUINZENAL"
  | "MENSAL";

export type TipoContrato = "FISICO" | "DIGITAL";

export interface EmprestimoDetalhado {
  id: number;
  fiadorId?: number | null;
  fiadorNome?: string | null;
  nomeCliente: string;
  dataEmprestimo: string;
  formaPagamento: string;
  frequenciaPagamento: FrequenciaPagamento;
  tipoContrato: TipoContrato;
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

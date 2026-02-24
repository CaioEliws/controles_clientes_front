export interface SimulacaoInput {
  valor: number;
  juros: number;
  parcelas: number;
}

export interface ParcelaSimulada {
  numero: number;
  valorParcela: number;
  jurosParcela: number;
  saldoDevedor: number;
}

export interface SimulacaoOutput {
  valorParcela: number;
  totalPago: number;
  totalJuros: number;
  listaParcelas: ParcelaSimulada[];
}

export function calcularSimulacao({
  valor,
  juros,
  parcelas,
}: SimulacaoInput): SimulacaoOutput | null {
  if (!valor || !juros || !parcelas) return null;

  const i = juros / 100;

  const potencia = Math.pow(1 + i, parcelas);
  const denominador = 1 - 1 / potencia;
  const valorParcela = (valor * i) / denominador;

  let saldoDevedor = valor;
  const listaParcelas: ParcelaSimulada[] = [];

  for (let numero = 1; numero <= parcelas; numero++) {
    const jurosParcela = saldoDevedor * i;
    const amortizacao = valorParcela - jurosParcela;
    saldoDevedor -= amortizacao;

    listaParcelas.push({
      numero,
      valorParcela,
      jurosParcela,
      saldoDevedor: saldoDevedor > 0 ? saldoDevedor : 0,
    });
  }

  const totalPago = valorParcela * parcelas;
  const totalJuros = totalPago - valor;

  return {
    valorParcela,
    totalPago,
    totalJuros,
    listaParcelas,
  };
}
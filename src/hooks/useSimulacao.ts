import { useMemo, useState } from "react";
import { calcularSimulacao } from "@/services/simulacao.service";

export function useSimulacaoEmprestimo() {
  const [valor, setValor] = useState("");
  const [juros, setJuros] = useState("");
  const [parcelas, setParcelas] = useState("");

  const simulacao = useMemo(() => {
    return calcularSimulacao({
      valor: Number(valor),
      juros: Number(juros),
      parcelas: Number(parcelas),
    });
  }, [valor, juros, parcelas]);

  return {
    valor,
    juros,
    parcelas,
    setValor,
    setJuros,
    setParcelas,
    simulacao,
  };
}
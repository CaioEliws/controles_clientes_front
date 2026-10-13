import type { DadosContrato, ParteContrato } from "@/types";
import { ESTADO_CIVIL_LABELS } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";

function Pessoa({ titulo, parte, apresentacao = {} }: { titulo: string; parte: ParteContrato | null; apresentacao?: Record<string, string | null> }) {
  const valor = (campo: string, original: string | null | undefined) => apresentacao[`${titulo.toUpperCase()}_${campo}`] ?? original;
  const endereco = parte ? [parte.enderecoRua, parte.enderecoNumero == null ? null : `nº ${parte.enderecoNumero}`, parte.enderecoComplemento, parte.enderecoBairro,
    [parte.enderecoCidade, parte.enderecoEstado].filter(Boolean).join(" / "), parte.enderecoCep ? `CEP ${parte.enderecoCep}` : null].filter(Boolean).join(", ") : "—";
  const campos = [
    ["Nome", valor("NOME", parte?.nomeCompleto)], ["CPF", valor("CPF", parte?.cpf)], ["RG", valor("RG", parte?.rg)], ["Profissão", valor("PROFISSAO", parte?.profissao)],
    ["Nacionalidade", valor("NACIONALIDADE", parte?.nacionalidade)], ["Órgão expedidor", valor("RG_ORGAO", parte?.rgOrgaoExpedidor)],
    ["Estado civil", valor("ESTADO_CIVIL", parte?.estadoCivil ? ESTADO_CIVIL_LABELS[parte.estadoCivil] : null)], ["Endereço", valor("ENDERECO", endereco)],
  ];
  return <section className="rounded-2xl border bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-lg font-semibold">{titulo}</h2>
    <dl className="space-y-3">{campos.map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="break-words text-sm">{value || "—"}</dd></div>)}</dl>
  </section>;
}

export function DadosContratoResumo({ dados }: { dados: DadosContrato }) {
  const e = dados.emprestimo;
  const valores = [
    ["Valor total", e.valorTotalEmprestimo == null ? "—" : formatCurrency(e.valorTotalEmprestimo)],
    ["Quantidade de parcelas", String(e.quantidadeParcelas ?? "—")],
    ["Valor da parcela", e.valorParcela == null ? "—" : formatCurrency(e.valorParcela)],
    ["Primeiro vencimento", formatDate(e.inicioPagamento)], ["Último vencimento", formatDate(e.finalPagamento)],
    ["Frequência", e.frequenciaPagamento ?? "—"],
  ];
  return <div className="space-y-5">
    <div className="grid gap-5 md:grid-cols-2"><Pessoa titulo="Devedor" parte={dados.devedor} apresentacao={dados.camposDocumento} /><Pessoa titulo="Fiador" parte={dados.fiador} apresentacao={dados.camposDocumento} /></div>
    <section className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-semibold">Empréstimo</h2>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{valores.map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="text-sm font-medium">{value}</dd></div>)}</dl>
    </section>
  </div>;
}

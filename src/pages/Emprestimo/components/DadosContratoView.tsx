import type { DadosContrato, ParteContrato } from "@/types";
import { ESTADO_CIVIL_LABELS } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const texto = (value: string | number | null | undefined) =>
  value == null || String(value).trim() === "" ? "—" : String(value);
const moeda = (value: number | null) => value == null ? "—" : formatCurrency(value);
const data = (value: string | null) => value ? formatDate(value) : "—";
const labels: Record<string, string> = {
  DIARIO: "Diário", SEMANAL: "Semanal", QUINZENAL: "Quinzenal", MENSAL: "Mensal",
  FISICO: "Físico", DIGITAL: "Digital", EM_ABERTO: "Em aberto", QUITADO: "Quitado", REFINANCIADO: "Refinanciado",
};

function Campos({ valores }: { valores: [string, string][] }) {
  return <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {valores.map(([label, value]) => <div key={label} className="min-w-0">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="break-words text-sm text-slate-900">{value}</dd>
    </div>)}
  </dl>;
}

function Parte({ titulo, parte, campos = {} }: { titulo: string; parte: ParteContrato | null; campos?: Record<string, string | null> }) {
  const prefixo = titulo.toUpperCase();
  const valor = (campo: string, original: string | null) => campos[`${prefixo}_${campo}`] ?? original;
  if (!parte) return <section><h3 className="mb-3 font-semibold">{titulo}</h3><p>—</p></section>;
  const endereco = [
    parte.enderecoRua,
    parte.enderecoNumero == null ? null : `nº ${parte.enderecoNumero}`,
    parte.enderecoComplemento, parte.enderecoBairro,
    [parte.enderecoCidade, parte.enderecoEstado].filter(Boolean).join(" / "),
    parte.enderecoCep ? `CEP ${parte.enderecoCep}` : null,
  ].filter((value) => value != null && String(value).trim() !== "").join(", ");
  return <section className="rounded-xl border border-slate-200 p-4">
    <h3 className="mb-3 font-semibold text-slate-900">{titulo}</h3>
    <Campos valores={[
      ["Nome completo", texto(valor("NOME", parte.nomeCompleto))], ["Nacionalidade", texto(valor("NACIONALIDADE", parte.nacionalidade))],
      ["Estado civil", valor("ESTADO_CIVIL", parte.estadoCivil ? ESTADO_CIVIL_LABELS[parte.estadoCivil] : null) ?? "—"],
      ["Profissão", texto(valor("PROFISSAO", parte.profissao))], ["CPF", texto(valor("CPF", parte.cpf))], ["RG", texto(valor("RG", parte.rg))],
      ["Órgão expedidor", texto(valor("RG_ORGAO", parte.rgOrgaoExpedidor))], ["Endereço", texto(valor("ENDERECO", endereco))],
    ]} />
  </section>;
}

export function DadosContratoView({ dados }: { dados: DadosContrato }) {
  const e = dados.emprestimo;
  return <div className="space-y-5">
    <Parte titulo="Credor" parte={dados.credor} />
    <Parte titulo="Devedor" parte={dados.devedor} campos={dados.camposDocumento} />
    <Parte titulo="Fiador" parte={dados.fiador} campos={dados.camposDocumento} />
    <section className="rounded-xl border border-slate-200 p-4">
      <h3 className="mb-3 font-semibold">Empréstimo</h3>
      <Campos valores={[
        ["Valor emprestado", moeda(e.valorEmprestado)], ["Juros", e.taxaDeJuros == null ? "—" : `${e.taxaDeJuros.toLocaleString("pt-BR")}%`],
        ["Quantidade de parcelas", texto(e.quantidadeParcelas)], ["Valor da parcela", moeda(e.valorParcela)],
        ["Valor total", moeda(e.valorTotalEmprestimo)], ["Data do empréstimo", data(e.dataDoEmprestimo)],
        ["Início dos pagamentos", data(e.inicioPagamento)], ["Final dos pagamentos", data(e.finalPagamento)],
        ["Forma de pagamento", texto(e.formaPagamento)], ["Frequência", e.frequenciaPagamento ? labels[e.frequenciaPagamento] ?? e.frequenciaPagamento : "—"],
        ["Tipo do contrato", e.tipoContrato ? labels[e.tipoContrato] ?? e.tipoContrato : "—"],
        ["Status", e.emprestimoStatus ? labels[e.emprestimoStatus] ?? e.emprestimoStatus : "—"],
      ]} />
    </section>
    <section>
      <h3 className="mb-3 font-semibold">Parcelas</h3>
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader><TableRow><TableHead>Nº</TableHead><TableHead>Vencimento</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
          <TableBody>
            {dados.parcelas.map((p, index) => <TableRow key={`${p.numeroParcela}-${index}`}>
              <TableCell>{texto(p.numeroParcela)}</TableCell><TableCell>{data(p.dataVencimento)}</TableCell><TableCell className="text-right">{moeda(p.valorParcela)}</TableCell>
            </TableRow>)}
            {dados.parcelas.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-slate-500">Nenhuma parcela informada.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </section>
  </div>;
}

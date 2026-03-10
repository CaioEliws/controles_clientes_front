import {
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";

const headClassName =
  "whitespace-nowrap px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:px-4";

export function EmprestimosTableHeader() {
  return (
    <TableHeader className="bg-slate-50/90">
      <TableRow className="border-b border-slate-200 hover:bg-slate-50/90">
        <TableHead className={headClassName}>Data</TableHead>
        <TableHead className={headClassName}>Forma</TableHead>
        <TableHead className={headClassName}>Frequência</TableHead>
        <TableHead className={headClassName}>Contrato</TableHead>
        <TableHead className={headClassName}>Emprestado</TableHead>
        <TableHead className={headClassName}>A receber</TableHead>
        <TableHead className={headClassName}>Parcela</TableHead>
        <TableHead className={headClassName}>Recebido</TableHead>
        <TableHead className={headClassName}>Total</TableHead>
        <TableHead className={headClassName}>Início</TableHead>
        <TableHead className={headClassName}>Final</TableHead>
        <TableHead className={headClassName}>Status</TableHead>
      </TableRow>
    </TableHeader>
  );
}
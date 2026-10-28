import type { ParcelaResponse } from "@/types";

const ddds = new Set("11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99".split(" "));
export function normalizarWhatsapp(valor?: string | null): string | null {
  if (!valor?.trim() || valor.length > 40 || !/^\+?[0-9()\s.-]+$/.test(valor)) return null;
  let n = valor.replace(/[^0-9]/g, "");
  if ((n.length === 12 || n.length === 13) && n.startsWith("55")) n = n.slice(2);
  else if (valor.startsWith("+")) return null;
  if (!ddds.has(n.slice(0, 2)) || !(/^[0-9]{2}9[0-9]{8}$/.test(n) || /^[0-9]{2}[2-5][0-9]{7}$/.test(n))) return null;
  return `55${n}`;
}
export function formatarWhatsapp(valor: string): string {
  let n = valor.replace(/[^0-9]/g, "");
  if ((n.length === 12 || n.length === 13) && n.startsWith("55")) n = n.slice(2);
  if (n.length > 11) return valor;
  if (!n) return "";
  if (n.length <= 2) return `(${n}`;
  const corte = n.length > 10 ? 7 : 6;
  return `(${n.slice(0, 2)}) ${n.slice(2, corte)}${n.length > corte ? `-${n.slice(corte)}` : ""}`;
}
export function dataSaoPaulo(agora = new Date()): string {
  const partes = new Intl.DateTimeFormat("en-CA", {timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit"}).formatToParts(agora);
  return ["year", "month", "day"].map(tipo => partes.find(p => p.type === tipo)!.value).join("-");
}
function dataValida(valor: unknown): valor is string {
  if (typeof valor !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(valor)) return false;
  const data = new Date(`${valor}T12:00:00Z`);
  return Number.isFinite(data.getTime()) && data.toISOString().slice(0, 10) === valor;
}
function centavos(valor: unknown): number | null {
  if (valor == null || valor === "") return null;
  const s = typeof valor === "string" ? valor.trim() : String(valor);
  if (!/^[0-9]+(?:\.[0-9]{1,2})?$/.test(s)) return null;
  const n = Math.round(Number(s) * 100);
  return Number.isSafeInteger(n) ? n : null;
}
export function parcelaCobravel(parcela: ParcelaResponse, agora = new Date(), incluirHoje = false): boolean {
  const valor = centavos(parcela.valorParcela), pago = centavos(parcela.valorPago);
  return dataValida(parcela.dataVencimento) && (parcela.dataVencimento < dataSaoPaulo(agora) || (incluirHoje && parcela.dataVencimento === dataSaoPaulo(agora)))
    && valor !== null && pago !== null && valor > pago;
}
export function mensagemCobranca(nome: unknown, vencimento: unknown): string | null {
  if (typeof nome !== "string") return null;
  const primeiro = nome.trim().split(/\s+/u)[0];
  if (!/^\p{L}[\p{L}\p{M}'’-]*$/u.test(primeiro) || !dataValida(vencimento)) return null;
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `Bom dia ${primeiro}, a parcela venceu ${vencimento.slice(8, 10)} de ${meses[Number(vencimento.slice(5, 7)) - 1]} e ainda nao foi pago.`;
}
export function linkWhatsapp(telefone: string, mensagem: string): string | null {
  const numero = normalizarWhatsapp(telefone);
  return numero && mensagem ? `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}` : null;
}

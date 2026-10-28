import { z } from "zod";
import { normalizarWhatsapp, formatarWhatsapp } from "@/utils/whatsapp";
import { ESTADOS_CIVIS, type DadosPessoais } from "@/types";
import type { ClienteCreatePayload, ClienteUpdatePayload } from "@/services/clientes.service";

const numeroSchema = z.string().refine((value) => {
  if (!value.trim()) return true;
  const numero = Number(value);
  return Number.isInteger(numero) && numero >= -2147483648 && numero <= 2147483647;
}, "Informe um número inteiro válido.");

export function cpfValido(valor: string): boolean {
  if (!valor.trim()) return true;
  const cpf = valor.replace(/[.\-\s]/g, "");
  if (!/^[0-9]{11}$/.test(cpf) || new Set(cpf).size === 1) return false;
  for (let tamanho = 9; tamanho <= 10; tamanho++) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
    const resto = 11 - soma % 11;
    if (Number(cpf[tamanho]) !== (resto > 9 ? 0 : resto)) return false;
  }
  return true;
}
// Documentos são opcionais no cadastro mínimo; quando preenchidos devem ser válidos.
export const clienteBaseSchema = z.object({
  nome: z.string().trim().min(1, "Nome obrigatório."),
  sexoDocumento: z.union([z.enum(["MASCULINO", "FEMININO"]), z.literal("")]),
  telefoneWhatsapp: z.string().refine(v => !v.trim() || normalizarWhatsapp(v) !== null, "WhatsApp inválido: informe o número completo com DDD."),
  nomeIndicador: z.string(), nomeCompleto: z.string(), nacionalidade: z.string(),
  estadoCivil: z.union([z.enum(ESTADOS_CIVIS), z.literal("")]),
  profissao: z.string(),
  cpf: z.string().refine(cpfValido, "CPF inválido: confira os 11 dígitos e os verificadores."),
  rg: z.string().refine(v => !v.trim() || /^(?:[0-9]{7,13}|[0-9]{6,12}X)$/.test(v.replace(/[.\-/\s]/g, "").toUpperCase()), "RG inválido: use 7 a 13 caracteres e X somente no final."),
  rgOrgaoExpedidor: z.string(),
  enderecoRua: z.string(), enderecoNumero: numeroSchema, enderecoComplemento: z.string(),
  enderecoBairro: z.string(), enderecoCep: z.string().refine(v => !v.trim() || /^[0-9]{8}$/.test(v.replace(/[\s-]/g, "")), "CEP incompleto: informe 8 dígitos."), enderecoCidade: z.string(), enderecoEstado: z.string(),
});
const sexoObrigatorio = clienteBaseSchema.shape.sexoDocumento.refine((value) => !!value, "Informe o sexo/forma gramatical para o documento.");
export const clienteCreateSchema = clienteBaseSchema.extend({
  sexoDocumento: sexoObrigatorio,
  nome: z.string().trim().min(3, "Nome obrigatório (mín 3 caracteres).").max(80),
  nomeIndicador: z.string().trim().max(80),
  enderecoRua: z.string().trim().min(1, "Rua obrigatória.").max(120),
  enderecoBairro: z.string().trim().min(1, "Bairro obrigatório.").max(80),
  enderecoNumero: numeroSchema.refine((value) => value.trim() !== "" && Number(value) >= 0, "Informe o número, incluindo zero quando aplicável."),
});
export const clienteUpdateSchema = clienteBaseSchema;
export const perfilUpdateSchema = clienteBaseSchema;
export type DadosCadastraisForm = z.infer<typeof clienteBaseSchema>;
export type ClienteCreateForm = DadosCadastraisForm;

type RegistroCadastral = DadosPessoais & { telefoneWhatsapp?: string | null; nome: string; nomeIndicador?: string | null; nomeCompleto?: string | null };
export function dadosParaFormulario(dados?: RegistroCadastral): DadosCadastraisForm {
  return {
    nome: dados?.nome ?? "", nomeIndicador: dados?.nomeIndicador ?? "", nomeCompleto: dados?.nomeCompleto ?? "",
    sexoDocumento: dados?.sexoDocumento ?? "",
    telefoneWhatsapp: formatarWhatsapp(dados?.telefoneWhatsapp ?? ""),
    nacionalidade: dados?.nacionalidade ?? "", estadoCivil: dados?.estadoCivil ?? "", profissao: dados?.profissao ?? "",
    cpf: dados?.cpf ?? "", rg: dados?.rg ?? "", rgOrgaoExpedidor: dados?.rgOrgaoExpedidor ?? "",
    enderecoRua: dados?.enderecoRua ?? "", enderecoNumero: dados?.enderecoNumero == null ? "" : String(dados.enderecoNumero),
    enderecoComplemento: dados?.enderecoComplemento ?? "", enderecoBairro: dados?.enderecoBairro ?? "",
    enderecoCep: dados?.enderecoCep ?? "", enderecoCidade: dados?.enderecoCidade ?? "", enderecoEstado: dados?.enderecoEstado ?? "",
  };
}
const textoOpcional = (value: string): string | null => value.trim() === "" ? null : value;
export function dadosPessoaisPayload(data: DadosCadastraisForm): DadosPessoais {
  return {
    nacionalidade: textoOpcional(data.nacionalidade), estadoCivil: data.estadoCivil || null,
    profissao: textoOpcional(data.profissao), cpf: textoOpcional(data.cpf), rg: textoOpcional(data.rg),
    rgOrgaoExpedidor: textoOpcional(data.rgOrgaoExpedidor), enderecoRua: textoOpcional(data.enderecoRua),
    enderecoNumero: data.enderecoNumero.trim() ? Number(data.enderecoNumero) : null,
    enderecoComplemento: textoOpcional(data.enderecoComplemento), enderecoBairro: textoOpcional(data.enderecoBairro),
    enderecoCep: textoOpcional(data.enderecoCep), enderecoCidade: textoOpcional(data.enderecoCidade), enderecoEstado: textoOpcional(data.enderecoEstado),
  };
}
export function clienteUpdatePayload(data: DadosCadastraisForm): ClienteUpdatePayload {
  return { telefoneWhatsapp: normalizarWhatsapp(data.telefoneWhatsapp), nome: data.nome, nomeIndicador: textoOpcional(data.nomeIndicador), ...dadosPessoaisPayload(data), sexoDocumento: data.sexoDocumento || null };
}
export function clienteCreatePayload(data: DadosCadastraisForm): ClienteCreatePayload {
  return { ...clienteUpdatePayload(data), enderecoRua: data.enderecoRua, enderecoBairro: data.enderecoBairro, enderecoNumero: Number(data.enderecoNumero) };
}

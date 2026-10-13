import { z } from "zod";
import { ESTADOS_CIVIS, type DadosPessoais } from "@/types";
import type { ClienteCreatePayload, ClienteUpdatePayload } from "@/services/clientes.service";

const numeroSchema = z.string().refine((value) => {
  if (!value.trim()) return true;
  const numero = Number(value);
  return Number.isInteger(numero) && numero >= -2147483648 && numero <= 2147483647;
}, "Informe um número inteiro válido.");

// CPF, RG, CEP e UF são texto na API, sem restrição de máscara/formato.
export const clienteBaseSchema = z.object({
  nome: z.string().trim().min(1, "Nome obrigatório."),
  sexoDocumento: z.union([z.enum(["MASCULINO", "FEMININO"]), z.literal("")]),
  nomeIndicador: z.string(), nomeCompleto: z.string(), nacionalidade: z.string(),
  estadoCivil: z.union([z.enum(ESTADOS_CIVIS), z.literal("")]),
  profissao: z.string(), cpf: z.string(), rg: z.string(), rgOrgaoExpedidor: z.string(),
  enderecoRua: z.string(), enderecoNumero: numeroSchema, enderecoComplemento: z.string(),
  enderecoBairro: z.string(), enderecoCep: z.string(), enderecoCidade: z.string(), enderecoEstado: z.string(),
});
const sexoObrigatorio = clienteBaseSchema.shape.sexoDocumento.refine((value) => !!value, "Informe o sexo/forma gramatical para o documento.");
export const clienteCreateSchema = clienteBaseSchema.extend({
  sexoDocumento: sexoObrigatorio,
  nome: z.string().trim().min(3, "Nome obrigatório (mín 3 caracteres).").max(80),
  nomeIndicador: z.string().trim().max(80),
  enderecoRua: z.string().trim().min(1, "Rua obrigatória.").max(120),
  enderecoBairro: z.string().trim().min(1, "Bairro obrigatório.").max(80),
  enderecoNumero: numeroSchema.refine((value) => value.trim() !== "" && Number(value) > 0, "Número obrigatório e maior que zero."),
});
export const clienteUpdateSchema = clienteBaseSchema.extend({ sexoDocumento: sexoObrigatorio });
export const perfilUpdateSchema = clienteBaseSchema;
export type DadosCadastraisForm = z.infer<typeof clienteBaseSchema>;
export type ClienteCreateForm = DadosCadastraisForm;

type RegistroCadastral = DadosPessoais & { nome: string; nomeIndicador?: string | null; nomeCompleto?: string | null };
export function dadosParaFormulario(dados?: RegistroCadastral): DadosCadastraisForm {
  return {
    nome: dados?.nome ?? "", nomeIndicador: dados?.nomeIndicador ?? "", nomeCompleto: dados?.nomeCompleto ?? "",
    sexoDocumento: dados?.sexoDocumento ?? "",
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
  return { nome: data.nome, nomeIndicador: textoOpcional(data.nomeIndicador), ...dadosPessoaisPayload(data), sexoDocumento: data.sexoDocumento || null };
}
export function clienteCreatePayload(data: DadosCadastraisForm): ClienteCreatePayload {
  return { ...clienteUpdatePayload(data), enderecoRua: data.enderecoRua, enderecoBairro: data.enderecoBairro, enderecoNumero: Number(data.enderecoNumero) };
}

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { emprestimosService } from "@/services/emprestimos.service";
import type { CriarEmprestimoDTO } from "@/services/emprestimos.service";
import { parseCurrency } from "@/utils/format";
import { useProfile } from "@/contexts/ProfileContext";
import type { Cliente } from "@/types";
import { ApiError } from "@/services/apiError";

const schema = z.object({
  clienteId: z.string().min(1, "Selecione um cliente"),
  fiadorId: z.string().min(1, "Selecione um fiador.").refine((value) => value === "" || (Number.isSafeInteger(Number(value)) && Number(value) > 0), "Selecione um fiador válido."),

  valorEmprestado: z
    .string()
    .trim()
    .min(1, "Informe o valor")
    .refine((v) => parseCurrency(v) > 0, "Informe um valor emprestado maior que zero."),

  quantidadeParcelas: z
    .string()
    .trim()
    .min(1, "Informe a quantidade")
    .refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n > 0;
    }, "A quantidade de parcelas deve ser um número inteiro maior que zero."),

  jurosCobrado: z
    .string()
    .trim()
    .min(1, "Informe o juros")
    .refine((v) => {
      const n = Number(v.replace(",", "."));
      return Number.isFinite(n) && n >= 0;
    }, "Informe uma taxa de juros válida e não negativa."),

  formaPagamento: z.string().min(1, "Selecione a forma"),

  frequenciaPagamento: z.enum([
    "DIARIO",
    "SEMANAL",
    "QUINZENAL",
    "MENSAL",
  ]),

  tipoContrato: z.enum(["FISICO", "DIGITAL"]),
});

export type EmprestimoFormData = z.infer<typeof schema>;

export function useEmprestimo(clientes: Cliente[]) {
  const { perfilAtivo } = useProfile();

  const form = useForm<EmprestimoFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      clienteId: "",
      fiadorId: "",
      valorEmprestado: "",
      quantidadeParcelas: "",
      jurosCobrado: "",
      formaPagamento: "",
      frequenciaPagamento: "MENSAL",
      tipoContrato: "FISICO",
    },
  });

  async function onSubmit(data: EmprestimoFormData) {
    if (!perfilAtivo) {
      throw new Error("Nenhum perfil selecionado.");
    }
    if (!clientes.some((cliente) => cliente.id === Number(data.clienteId))) {
      throw new ApiError("O cliente selecionado não foi encontrado. Atualize a lista e tente novamente.", 404, "CLIENTE_NAO_ENCONTRADO", [], "naoEncontrado");
    }
    if (!data.fiadorId || !clientes.some((cliente) => cliente.id === Number(data.fiadorId))) {
      throw new ApiError("Selecione um fiador do Perfil ativo.", 400, "FIADOR_INVALIDO", [{ campo: "fiadorId", mensagem: "Selecione um fiador do Perfil ativo para continuar." }], "validacao");
    }

    const payload: CriarEmprestimoDTO = {
      valorEmprestado: parseCurrency(data.valorEmprestado),
      quantidadeParcelas: Number(data.quantidadeParcelas),
      jurosCobrado: Number(data.jurosCobrado.replace(",", ".")),
      formaPagamento: data.formaPagamento,
      frequenciaPagamento: data.frequenciaPagamento,
      tipoContrato: data.tipoContrato,
      fiadorId: Number(data.fiadorId),
    };

    await emprestimosService.create(Number(data.clienteId), payload);

    form.reset({
      clienteId: "",
      fiadorId: "",
      valorEmprestado: "",
      quantidadeParcelas: "",
      jurosCobrado: "",
      formaPagamento: "",
      frequenciaPagamento: "MENSAL",
      tipoContrato: "FISICO",
    });
  }

  return {
    ...form,
    onSubmit,
  };
}

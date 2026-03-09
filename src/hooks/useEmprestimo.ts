import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { emprestimosService } from "@/services/emprestimos.service";
import type { CriarEmprestimoDTO } from "@/services/emprestimos.service";
import { parseCurrency } from "@/utils/format";

const schema = z.object({
  clienteId: z.string().min(1, "Selecione um cliente"),

  valorEmprestado: z
    .string()
    .trim()
    .min(1, "Informe o valor")
    .refine((v) => parseCurrency(v) > 0, "Valor deve ser maior que 0"),

  quantidadeParcelas: z
    .string()
    .trim()
    .min(1, "Informe a quantidade")
    .refine((v) => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0;
    }, "Parcelas deve ser maior que 0"),

  jurosCobrado: z
    .string()
    .trim()
    .min(1, "Informe o juros")
    .refine((v) => {
      const n = Number(v.replace(",", "."));
      return Number.isFinite(n) && n >= 0 && n <= 100;
    }, "Juros deve estar entre 0 e 100"),

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

export function useEmprestimo() {
  const form = useForm<EmprestimoFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      clienteId: "",
      valorEmprestado: "",
      quantidadeParcelas: "",
      jurosCobrado: "",
      formaPagamento: "",
      frequenciaPagamento: "MENSAL",
      tipoContrato: "FISICO",
    },
  });

  async function onSubmit(data: EmprestimoFormData) {
    const payload: CriarEmprestimoDTO = {
      valorEmprestado: parseCurrency(data.valorEmprestado),
      quantidadeParcelas: Number(data.quantidadeParcelas),
      jurosCobrado: Number(data.jurosCobrado.replace(",", ".")),
      formaPagamento: data.formaPagamento,
      frequenciaPagamento: data.frequenciaPagamento,
      tipoContrato: data.tipoContrato,
    };

    await emprestimosService.create(Number(data.clienteId), payload);

    form.reset({
      clienteId: "",
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
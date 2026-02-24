import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { emprestimosService } from "@/services/emprestimos.service";

const schema = z.object({
  clienteId: z.string().min(1, "Selecione um cliente"),
  valorEmprestado: z
    .string()
    .min(1, "Informe o valor")
    .refine((v) => Number(v) > 0, "Valor deve ser maior que 0"),
  quantidadeParcelas: z
    .string()
    .min(1, "Informe a quantidade")
    .refine((v) => Number(v) > 0, "Parcelas deve ser maior que 0"),
  jurosCobrado: z
    .string()
    .min(1, "Informe o juros")
    .refine(
      (v) => Number(v) >= 0 && Number(v) <= 100,
      "Juros deve estar entre 0 e 100"
    ),
  formaPagamento: z.string().min(1, "Selecione a forma"),
});

export type EmprestimoFormData = z.infer<typeof schema>;

export function useEmprestimo() {
  const form = useForm<EmprestimoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      clienteId: "",
      valorEmprestado: "",
      quantidadeParcelas: "",
      jurosCobrado: "",
      formaPagamento: "",
    },
  });

  async function onSubmit(data: EmprestimoFormData) {
    await emprestimosService.create(Number(data.clienteId), {
      valorEmprestado: Number(data.valorEmprestado),
      quantidadeParcelas: Number(data.quantidadeParcelas),
      jurosCobrado: Number(data.jurosCobrado),
      formaPagamento: data.formaPagamento,
    });

    form.reset();
  }

  return {
    ...form,
    onSubmit,
  };
}
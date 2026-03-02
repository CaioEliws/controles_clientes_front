import { z } from "zod";
import { parseCurrency } from "@/utils/format";

const safeSearchRegex = /^[\p{L}\p{N}\s.'()-]*$/u;

export const parcelasSearchSchema = z
  .string()
  .max(60, "Pesquisa muito longa (máx 60 caracteres).")
  .refine(
    (s) => safeSearchRegex.test(s),
    "Use apenas letras/números e (.,'()-)."
  );

export const pagarParcelaBaseSchema = z.object({
  valorPago: z
    .string()
    .trim()
    .min(1, "Informe o valor.")
    .refine((v) => parseCurrency(v) > 0, "Valor inválido."),

  dataPagamento: z
    .string()
    .trim()
    .min(1, "Informe a data.")
    .refine(
      (v) => /^\d{4}-\d{2}-\d{2}$/.test(v),
      "Data inválida (use AAAA-MM-DD)."
    ),
});

export type PagarParcelaForm = z.infer<typeof pagarParcelaBaseSchema>;

export function createPagarParcelaSchema(valorParcela: number) {
  return pagarParcelaBaseSchema.superRefine((data, ctx) => {
    const pago = parseCurrency(data.valorPago);
    if (pago > valorParcela + 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["valorPago"],
        message: "Valor excede o saldo!",
      });
    }
  });
}

export const alterarVencimentoSchema = z.object({
  dataVencimento: z
    .string()
    .trim()
    .min(1, "Informe a nova data.")
    .refine(
      (v) => /^\d{4}-\d{2}-\d{2}$/.test(v),
      "Data inválida (use AAAA-MM-DD)."
    ),
});

export type AlterarVencimentoForm = z.infer<typeof alterarVencimentoSchema>;
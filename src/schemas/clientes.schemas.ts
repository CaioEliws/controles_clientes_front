import { z } from "zod";

export const clienteCreateSchema = z.object({
  nome: z.string().trim().min(3, "Nome obrigatório (mín 3 caracteres).").max(80),
  nomeIndicador: z.string().trim().max(80).optional().or(z.literal("")),
  enderecoRua: z.string().trim().min(1, "Rua obrigatória.").max(120),
  enderecoBairro: z.string().trim().min(1, "Bairro obrigatório.").max(80),

  enderecoNumero: z
    .string()
    .min(1, "Número obrigatório")
    .refine((val) => {
      const n = Number(val);
      return Number.isFinite(n) && n > 0;
    }, "Número inválido"),
});

export type ClienteCreateForm = z.infer<typeof clienteCreateSchema>;
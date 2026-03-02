import { z } from "zod";

const safeSearchRegex = /^[\p{L}\p{N}\s.'()-]*$/u;

export const clienteSearchSchema = z
  .string()
  .max(60, "Pesquisa muito longa (máx 60 caracteres).")
  .refine((s) => safeSearchRegex.test(s), "Use apenas letras/números e (.,'()-).");
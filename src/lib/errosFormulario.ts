import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { ApiError } from "@/services/apiError";

export function aplicarErrosFormulario<T extends FieldValues>(erro: unknown, form: UseFormReturn<T>) {
  if (!(erro instanceof ApiError)) return;
  const valores = form.getValues();
  const campos = erro.campos.filter(p => !p.pessoa && Object.hasOwn(valores, p.campo));
  for (const p of campos) form.setError(p.campo as Path<T>, { type: "server", message: p.mensagem });
  if (campos[0]) window.setTimeout(() => form.setFocus(campos[0].campo as Path<T>), 0);
}

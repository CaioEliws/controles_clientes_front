import { useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { DadosCadastraisForm } from "@/schemas/clientes.schemas";
import { buscarCep, cepValido, normalizarCep } from "@/services/cep.service";

export function useBuscaCep(form: UseFormReturn<DadosCadastraisForm>) {
  const [status, setStatus] = useState<string | null>(null);
  const pendente = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; pendente.current?.abort(); };
  }, []);

  function consultar(valor: string) {
    pendente.current?.abort();
    pendente.current = null;
    setStatus(null);
    if (!cepValido(valor)) return;
    const controller = new AbortController();
    pendente.current = controller;
    setStatus("Buscando endereço...");
    const timeout = window.setTimeout(() => controller.abort(), 4000);
    void buscarCep(valor, controller.signal).then((endereco) => {
      if (!mounted.current || pendente.current !== controller || controller.signal.aborted
          || normalizarCep(form.getValues("enderecoCep")) !== normalizarCep(valor)) return;
      if (!endereco) { setStatus("CEP não encontrado."); return; }
      for (const [campo, texto] of Object.entries(endereco)) {
        if (texto) form.setValue(campo as keyof typeof endereco, texto, { shouldDirty: true, shouldValidate: true });
      }
      setStatus(null);
      // Do not steal focus after the user moves to another field while waiting.
      if (document.activeElement?.id.endsWith("-enderecoCep")) form.setFocus("enderecoNumero");
    }).catch(() => {
      if (mounted.current && pendente.current === controller) {
        setStatus("Não foi possível consultar o CEP. Preencha o endereço manualmente.");
      }
    }).finally(() => {
      window.clearTimeout(timeout);
      if (pendente.current === controller) pendente.current = null;
    });
  }
  return { status, consultar };
}

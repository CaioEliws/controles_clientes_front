import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { ApiError, rotulosCampos, textoPublico } from "@/services/apiError";

export function ErroOperacao({ erro, titulo, children }: { erro: unknown; titulo: string; children?: ReactNode }) {
  if (!erro) return null;
  const api = erro instanceof ApiError ? erro : null;
  const mensagem = textoPublico(api?.resumo ?? (erro instanceof Error ? erro.message : erro));
  const campos = api?.campos ?? [];
  return <div role="alert" className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-slate-800">
    <div className="flex items-start gap-2"><AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
      <h3 className="font-semibold">{api?.codigo === "CPF_DUPLICADO" ? "CPF já cadastrado" : api?.codigo === "DADOS_CONTRATO_INCOMPLETOS" ? "Dados pendentes para gerar o contrato" : titulo}</h3></div>
    {campos.length ? <><p>{campos.length === 1 ? "Encontramos uma pendência:" : `Encontramos ${campos.length} pendências:`}</p>
      <ul className="list-disc space-y-1 pl-5">{campos.map((p, i) => <li key={i}>
        {p.pessoa === "DEVEDOR" ? "Devedor — " : p.pessoa === "FIADOR" ? "Fiador — " : ""}
        <span className="font-medium">{rotulosCampos[p.campo] ?? "Campo"}</span>: {p.mensagem}
      </li>)}</ul></> : <p className="whitespace-pre-line break-words">{mensagem}</p>}
    {api?.codigo === "CPF_DUPLICADO" ? <p>Verifique o cadastro existente neste Perfil antes de continuar.</p>
      : campos.length > 0 ? <p>Corrija as informações indicadas e tente novamente. Seus dados preenchidos foram mantidos.</p> : null}
    {api?.categoria === "naoEncontrado" && <p>Atualize a lista e confira o Perfil ativo antes de tentar novamente.</p>}
    {children}
  </div>;
}

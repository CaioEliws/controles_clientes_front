import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/contexts/ProfileContext";
import type { Perfil } from "@/contexts/profileContextState";
import { ExcluirPerfilDialog } from "./ExcluirPerfilDialog";

export function GerenciarExclusaoPerfis() {
  const { perfis, perfilAtivo, loading, avisoExclusaoPerfil } = useProfile();
  const [alvo, setAlvo] = useState<Perfil | null>(null);
  return <section className="space-y-5 rounded-3xl border border-red-200 bg-white p-6 shadow-sm md:p-7">
    <div className="flex items-start gap-3">
      <Trash2 className="mt-1 h-5 w-5 shrink-0 text-red-700" />
      <div><h2 className="text-xl font-semibold text-slate-900">Exclusão permanente de perfil</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Remova um perfil e todo o seu histórico. Escolha o perfil abaixo e confira os dados antes de confirmar.</p></div>
    </div>
    {avisoExclusaoPerfil && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{avisoExclusaoPerfil}</p>}
    {perfis.length === 0 && <p className="text-sm text-slate-500">Nenhum perfil disponível para excluir. Use Criar novo perfil para começar.</p>}
    <div className="space-y-3">{perfis.map(perfil => <div key={perfil.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
      <div className="min-w-0"><p className="break-words font-medium text-slate-900">{perfil.nome}</p>
        {perfilAtivo?.id === perfil.id && <p className="text-xs text-slate-500">Perfil ativo</p>}</div>
      <Button type="button" variant="outline" disabled={loading} className="shrink-0 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800" aria-label={`Excluir perfil ${perfil.nome}`} onClick={() => setAlvo(perfil)}>
        <Trash2 className="mr-2 h-4 w-4" />Excluir perfil
      </Button>
    </div>)}</div>
    {alvo && <ExcluirPerfilDialog key={alvo.id} perfil={alvo} onClose={() => setAlvo(null)} />}
  </section>;
}

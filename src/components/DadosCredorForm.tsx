import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProfile, type Perfil, type PerfilUpdatePayload } from "@/contexts/ProfileContext";
import { dadosParaFormulario, dadosPessoaisPayload, perfilUpdateSchema, type DadosCadastraisForm } from "@/schemas/clientes.schemas";
import { ClienteFormFields } from "@/components/ClienteFormFields";
import { Button } from "@/components/ui/button";

export function DadosCredorForm({ perfil }: { perfil: Perfil }) {
  const { carregarPerfilDetalhado, atualizarPerfil } = useProfile();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const submitting = useRef(false);
  const mounted = useRef(true);
  const form = useForm<DadosCadastraisForm>({ resolver: zodResolver(perfilUpdateSchema), mode: "onChange", defaultValues: dadosParaFormulario(perfil) });
  const { reset } = form;
  useEffect(() => {
    let alive = true;
    mounted.current = true;
    carregarPerfilDetalhado(perfil.id).then((dados) => {
      if (!alive) return;
      reset(dadosParaFormulario(dados)); setPronto(true);
    }).catch((error: unknown) => { if (alive) setErro(error instanceof Error ? error.message : "Não foi possível consultar os dados do credor."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; mounted.current = false; };
  }, [perfil.id, carregarPerfilDetalhado, reset, tentativa]);

  async function onSubmit(data: DadosCadastraisForm) {
    if (submitting.current || !pronto) return;
    submitting.current = true; setErro(null); setSucesso(false);
    const payload: PerfilUpdatePayload = {
      nome: data.nome, nomeCompleto: data.nomeCompleto.trim() ? data.nomeCompleto : null,
      ...dadosPessoaisPayload(data),
    };
    try {
      const atualizado = await atualizarPerfil(perfil.id, payload);
      if (!mounted.current) return;
      reset(dadosParaFormulario(atualizado)); setSucesso(true);
    } catch (error) { if (mounted.current) setErro(error instanceof Error ? error.message : "Não foi possível salvar os dados do credor."); }
    finally { submitting.current = false; }
  }
  const busy = form.formState.isSubmitting;
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
    <h2 className="text-xl font-semibold text-slate-900">Dados do credor</h2>
    <p className="mb-6 mt-2 text-sm text-slate-500">Perfil ativo: {perfil.nome}. Apenas o nome de exibição é obrigatório.</p>
    {loading && <p role="status" className="mb-4 text-sm">Carregando dados do credor...</p>}
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <ClienteFormFields form={form} perfil disabled={loading || busy || !pronto} />
      {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}
      {sucesso && <p role="status" className="text-sm text-emerald-700">Dados do credor salvos.</p>}
      <div className="flex flex-wrap justify-end gap-2">
        {!pronto && !loading && <Button type="button" variant="outline" onClick={() => { setLoading(true); setErro(null); setTentativa((value) => value + 1); }}>Tentar novamente</Button>}
        <Button type="submit" disabled={loading || busy || !pronto}>{busy ? "Salvando..." : "Salvar dados do credor"}</Button>
      </div>
    </form>
  </section>;
}

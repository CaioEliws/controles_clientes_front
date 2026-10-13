import { useEffect, useId, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ESTADOS_CIVIS, ESTADO_CIVIL_LABELS } from "@/types";
import type { DadosCadastraisForm } from "@/schemas/clientes.schemas";
import { opcoesDocumentoService, type OpcoesDocumento } from "@/services/opcoes-documento.service";
import { useBuscaCep } from "@/hooks/useBuscaCep";
import { formatarCep, normalizarCep } from "@/services/cep.service";

type Props = { form: UseFormReturn<DadosCadastraisForm>; perfil?: boolean; disabled?: boolean; layout?: "padrao" | "edicao" };
type Campo = { nome: keyof DadosCadastraisForm; label: string; numeric?: boolean; largo?: boolean };
const brasileira = (valor: string) => ["BRASIL", "BRASILEIRO", "BRASILEIRA"].includes(valor.trim().toUpperCase());
const estiloSelect = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

export function ClienteFormFields({ form, perfil = false, disabled = false, layout = "padrao" }: Props) {
  const id = useId();
  const buscaCep = useBuscaCep(form);
  const edicao = layout === "edicao" && !perfil;
  const espacoCampo = edicao ? "space-y-1.5" : "space-y-2";
  const grid = edicao ? "grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2" : "grid grid-cols-1 gap-4 sm:grid-cols-2";
  const [opcoes, setOpcoes] = useState<OpcoesDocumento | null>(null);
  const [erroOpcoes, setErroOpcoes] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [outra, setOutra] = useState(false);
  useEffect(() => {
    if (perfil) return;
    let alive = true;
    opcoesDocumentoService.get().then((dados) => { if (alive) { setOpcoes(dados); setErroOpcoes(false); } })
      .catch(() => { if (alive) setErroOpcoes(true); });
    return () => { alive = false; };
  }, [perfil, tentativa]);
  const sexo = form.watch("sexoDocumento");
  const nacionalidade = form.watch("nacionalidade");
  const estrangeira = outra || (!!nacionalidade.trim() && !brasileira(nacionalidade));
  const nacionalidadeBrasil = opcoes?.sexos.find((s) => s.codigo === sexo)?.nacionalidade;
  const labelBrasil = nacionalidadeBrasil ? nacionalidadeBrasil[0].toUpperCase() + nacionalidadeBrasil.slice(1) : "Brasileiro(a)";
  const pessoais: Campo[] = [
    { nome: "nome", label: perfil ? "Nome de exibição" : "Nome completo" },
    perfil ? { nome: "nomeCompleto", label: "Nome completo" } : { nome: "nomeIndicador", label: "Quem indicou?" },
    ...(perfil ? [{ nome: "nacionalidade" as const, label: "Nacionalidade" }] : []),
    { nome: "profissao", label: "Profissão" },
  ];
  const documentos: Campo[] = [{ nome: "cpf", label: "CPF" }, { nome: "rg", label: "RG" }];
  const endereco: Campo[] = [
    { nome: "enderecoCep", label: "CEP" }, { nome: "enderecoRua", label: "Rua" },
    { nome: "enderecoNumero", label: "Número", numeric: true }, { nome: "enderecoComplemento", label: "Complemento" },
    { nome: "enderecoBairro", label: "Bairro" }, { nome: "enderecoCidade", label: "Cidade" },
  ];
  function erro(nome: keyof DadosCadastraisForm) {
    const mensagem = form.formState.errors[nome]?.message;
    return mensagem && <p id={`${id}-${nome}-erro`} role="alert" className="text-xs text-red-600">{mensagem}</p>;
  }
  function campo({ nome, label, numeric, largo }: Campo) {
    const invalido = !!form.formState.errors[nome];
    const consultaCep = nome === "enderecoCep" && !perfil;
    const registro = form.register(nome);
    return <div key={nome} className={`${espacoCampo}${largo ? " sm:col-span-2" : ""}`}>
      <Label htmlFor={`${id}-${nome}`}>{label}</Label>
      <Input id={`${id}-${nome}`} inputMode={numeric || consultaCep ? "numeric" : "text"} maxLength={nome === "rg" ? 20 : undefined} {...registro} onChange={(event) => {
        const anterior = form.getValues(nome);
        void registro.onChange(event);
        if (consultaCep) {
          const valor = event.target.value;
          form.setValue("enderecoCep", formatarCep(valor), { shouldDirty: true, shouldValidate: true });
          if (normalizarCep(valor) !== normalizarCep(anterior)) buscaCep.consultar(valor);
        }
      }} aria-invalid={invalido} aria-describedby={[invalido ? `${id}-${nome}-erro` : "", consultaCep && buscaCep.status ? `${id}-cep-status` : ""].filter(Boolean).join(" ") || undefined} />
      {consultaCep && buscaCep.status && <p id={`${id}-cep-status`} role="status" className="text-xs text-slate-500">{buscaCep.status}</p>}
      {erro(nome)}
    </div>;
  }
  function uf(nome: "rgOrgaoExpedidor" | "enderecoEstado", label: string) {
    const valor = form.watch(nome);
    const conhecido = !valor || opcoes?.ufs.some((u) => valor === (nome === "rgOrgaoExpedidor" ? `SSP/${u.codigo}` : u.codigo));
    return <div className={espacoCampo}>
      <Label htmlFor={`${id}-${nome}`}>{label}</Label>
      <select id={`${id}-${nome}`} {...form.register(nome)} value={valor} disabled={!opcoes} className={estiloSelect}>
        <option value="">Selecionar UF</option>
        {!conhecido && <option value={valor}>Valor legado: {valor} — selecione uma UF</option>}
        {opcoes?.ufs.map((u) => <option key={u.codigo} value={nome === "rgOrgaoExpedidor" ? `SSP/${u.codigo}` : u.codigo}>
          {nome === "rgOrgaoExpedidor" ? `SSP/${u.codigo}` : `${u.descricao} — ${u.codigo}`}
        </option>)}
      </select>
      {erro(nome)}
    </div>;
  }

  const sexoCampo = (<div className={espacoCampo}>
            <Label htmlFor={`${id}-sexoDocumento`}>Sexo para o documento</Label>
            <select id={`${id}-sexoDocumento`} value={sexo} {...form.register("sexoDocumento", { onChange: (event) => {
              if (event.target.value && (!nacionalidade.trim() || brasileira(nacionalidade))) form.setValue("nacionalidade", "BRASIL", { shouldDirty: true });
            } })} disabled={!opcoes} className={estiloSelect} aria-invalid={!!form.formState.errors.sexoDocumento}>
              <option value="">Selecionar forma gramatical</option>
              {opcoes?.sexos.map((s) => <option key={s.codigo} value={s.codigo}>{s.descricao}</option>)}
            </select>
            {erro("sexoDocumento")}
          </div>);
  const nacionalidadeCampo = (<div className={espacoCampo}>
            <Label htmlFor={`${id}-nacionalidade-opcao`}>Nacionalidade</Label>
            <select id={`${id}-nacionalidade-opcao`} value={estrangeira ? "OUTRA" : brasileira(nacionalidade) ? "BRASIL" : ""} className={estiloSelect} onChange={(event) => {
              setOutra(event.target.value === "OUTRA");
              form.setValue("nacionalidade", event.target.value === "BRASIL" ? "BRASIL" : "", { shouldDirty: true });
            }}>
              <option value="">Não informado</option><option value="BRASIL">{labelBrasil}</option><option value="OUTRA">Outra nacionalidade</option>
            </select>
            {estrangeira && <><Label htmlFor={`${id}-nacionalidade`}>Informe a nacionalidade</Label><Input id={`${id}-nacionalidade`} {...form.register("nacionalidade")} required /></>}
          </div>);
  const estadoCivilCampo = (<div className={espacoCampo}>
          <Label htmlFor={`${id}-estadoCivil`}>Estado civil</Label>
          <select id={`${id}-estadoCivil`} {...form.register("estadoCivil")} className={estiloSelect}>
            <option value="">Não informado</option>
            {ESTADOS_CIVIS.map((value) => <option key={value} value={value}>{ESTADO_CIVIL_LABELS[value]}</option>)}
          </select>
          {erro("estadoCivil")}
        </div>);
  return <fieldset disabled={disabled} className={edicao ? "space-y-4" : "space-y-6"}>
    {erroOpcoes && <p role="alert" className="text-sm text-red-600">Não foi possível carregar as opções. <button type="button" className="underline" onClick={() => setTentativa((n) => n + 1)}>Tentar novamente</button></p>}
    <section className={edicao ? "space-y-3" : "space-y-4"}>
      <h3 className="border-b pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Dados pessoais</h3>
      <div className={grid}>
        {edicao ? <>
          {campo({ nome: "nome", label: "Nome completo" })}{sexoCampo}
          {estadoCivilCampo}{nacionalidadeCampo}
          {campo({ nome: "profissao", label: "Profissão" })}{campo({ nome: "nomeIndicador", label: "Quem indicou?" })}
        </> : <>{pessoais.map(campo)}{!perfil && <>{sexoCampo}{nacionalidadeCampo}</>}{estadoCivilCampo}</>}
      </div>
    </section>
    <section className={edicao ? "space-y-3" : "space-y-4"}>
      <h3 className="border-b pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Documentos</h3>
      <div className={grid}>{documentos.map(campo)}{perfil ? campo({ nome: "rgOrgaoExpedidor", label: "Órgão expedidor" }) : uf("rgOrgaoExpedidor", "Órgão expedidor / UF emissora")}</div>
    </section>
    <section className={edicao ? "space-y-3" : "space-y-4"}>
      <h3 className="border-b pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Endereço</h3>
      <div className={grid}>{edicao ? <>
        {campo({ nome: "enderecoCep", label: "CEP" })}{uf("enderecoEstado", "Estado / UF")}
        {campo({ nome: "enderecoCidade", label: "Cidade" })}{campo({ nome: "enderecoBairro", label: "Bairro" })}
        {campo({ nome: "enderecoRua", label: "Rua" })}{campo({ nome: "enderecoNumero", label: "Número", numeric: true })}
        {campo({ nome: "enderecoComplemento", label: "Complemento", largo: true })}
      </> : <>{endereco.map(campo)}{perfil ? campo({ nome: "enderecoEstado", label: "Estado / UF" }) : uf("enderecoEstado", "Estado / UF")}</>}</div>
    </section>
  </fieldset>;
}

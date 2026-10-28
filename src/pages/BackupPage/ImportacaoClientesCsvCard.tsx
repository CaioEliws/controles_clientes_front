import { useRef, useState } from "react";
import { FileSpreadsheet, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiClient } from "@/services/apiClient";
import { ErroOperacao } from "@/components/ErroOperacao";
import { textoPublico, rotulosCampos } from "@/services/apiError";

type Detalhe = { linha: number; nome: string | null; cpf: string | null; status: string; motivo: string; camposConflitantes: string[]; camposPreenchidos: string[]; statusCsv: string; classificacao: string; comAviso: boolean; camposAusentes: string[]; match: string; nomeEncontrado?: string | null; confianca?: string | null; acao?: string; nomeAtualizado?: string | null };
type Resultado = { previa: boolean; totalLinhas: number; criados: number; existentes: number; atualizados: number; ignorados: number; conflitos: number; erros: number; detalhesTruncados: boolean; detalhes: Detalhe[]; importaveisSemRessalvas: number; importaveisComAviso: number; importadosComAviso: number; bloqueados: number; semWord: number; duplicidadesRevisar: number; clientesEncontradosPorNome: number; clientesEncontradosPorCpf: number; camposPreenchidos: number; conflitosPreservados: number; ambiguos: number; conflitosIdentidade: number; clientesAtualizados: number; clientesEncontradosPorNomeAbreviado?: number; nomesExpandidos?: number };

export function ImportacaoClientesCsvCard() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previa, setPrevia] = useState<Resultado | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState<unknown>(null);
  const [filtro, setFiltro] = useState("Todos");
  const [ocupado, setOcupado] = useState(false);
  const perfilPrevia = useRef<string | null>(null);
  const enviando = useRef(false);
  const input = useRef<HTMLInputElement>(null);

  function limpar() {
    setArquivo(null); setPrevia(null); setResultado(null); setErro(null); perfilPrevia.current = null;
    if (input.current) input.current.value = "";
  }
  async function enviar(confirmar: boolean) {
    if (!arquivo || enviando.current) return;
    const perfil = localStorage.getItem("perfil_ativo_id");
    if (!perfil) { setErro("Selecione um perfil antes de importar."); return; }
    if (confirmar && (!previa || perfilPrevia.current !== perfil)) {
      setPrevia(null); setErro("O perfil foi alterado. Pré-visualize o arquivo novamente antes de confirmar."); return;
    }
    const form = new FormData(); form.append("file", arquivo);
    enviando.current = true; setOcupado(true); setErro(null);
    try {
      const resposta = await apiClient.post<Resultado>(confirmar ? "/import/clientes" : "/import/clientes/preview", form);
      if (confirmar) { setResultado(resposta); setPrevia(null); }
      else { setPrevia(resposta); perfilPrevia.current = perfil; setResultado(null); }
    } catch (error) {
      setErro(error);
      // Uma tentativa que falhou exige nova prévia; o backend deduplica uma eventual repetição.
      setPrevia(null);
    } finally { enviando.current = false; setOcupado(false); }
  }
  function baixarRelatorio() {
    if (!resultado) return;
    const cell = (value: unknown) => {
      const texto = String(value ?? "");
      return `"${(/^[=+@\-\t\r]/.test(texto) ? "'" : "") + texto.replaceAll('"', '""')}"`;
    };
    const linhas = [["linha", "nome", "cpf", "statusCsv", "classificacao", "acao", "match", "clienteEncontrado", "confianca", "nomeAtualizado", "motivo"], ...resultado.detalhes.map(d => [d.linha, d.nome, d.cpf, d.statusCsv, d.classificacao, d.status, d.match, d.nomeEncontrado, d.confianca, d.nomeAtualizado, d.motivo])];
    const blob = new Blob(["\uFEFF" + linhas.map(l => l.map(cell).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = "resultado_importacao_clientes.csv"; link.click(); URL.revokeObjectURL(url);
  }
  const resumo = previa ?? resultado;
  const detalhesFiltrados = resumo?.detalhes.filter(d => {
    if (filtro === "Novos") return d.status === "CRIADO";
    if (filtro === "Com aviso") return d.comAviso;
    if (filtro === "Conflitos") return ["CONFLITO", "CONFLITO_PRESERVADO", "CONFLITO_IDENTIDADE"].includes(d.classificacao);
    if (filtro === "Bloqueados") return d.classificacao?.startsWith("BLOQUEADO") || ["SEM_WORD", "ERRO", "CONFLITO_IDENTIDADE"].includes(d.classificacao) || d.classificacao?.startsWith("AMBIGUO");
    if (filtro === "Erros") return d.classificacao === "ERRO";
    return true;
  }) ?? [];
  return <Card className="w-full max-w-xl shadow-xl rounded-2xl border">
    <CardHeader className="space-y-2">
      <CardTitle className="text-2xl font-bold flex items-center gap-2">
        <UploadCloud className="w-6 h-6 shrink-0" />
        Importar dados de clientes
      </CardTitle>
      <CardDescription>Esta importação procura clientes existentes pelo nome e CPF e completa os dados cadastrais. Empréstimos não são alterados.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <label htmlFor="clientes-csv" className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 hover:bg-muted/40 transition focus-within:ring-2 focus-within:ring-ring ${ocupado ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
        <FileSpreadsheet className="w-10 h-10 mb-3 text-muted-foreground" />
        <span className="max-w-full break-words text-center font-medium">
          {arquivo ? arquivo.name : "Clique para selecionar o arquivo"}
        </span>
        <span className="text-sm text-muted-foreground mt-1 text-center">Apenas arquivos .csv são permitidos</span>
        <input ref={input} id="clientes-csv" aria-label="Selecionar CSV" type="file" accept=".csv" disabled={ocupado} className="sr-only"
          onChange={event => { setArquivo(event.target.files?.[0] ?? null); setPrevia(null); setResultado(null); setErro(null); perfilPrevia.current = null; }} />
      </label>
      <p className="text-sm text-muted-foreground">UTF-8, separado por ponto e vírgula. Linhas válidas e registros com avisos podem ser importados após confirmação. Registros bloqueados são preservados para revisão. Dados preenchidos no cadastro são preservados; nomes abreviados podem ser expandidos com segurança.</p>
      <ErroOperacao erro={erro} titulo="Não foi possível processar o CSV" />
      {!previa && !resultado && <Button className="w-full rounded-xl text-base disabled:cursor-not-allowed" disabled={!arquivo || ocupado} onClick={() => void enviar(false)}>
        {ocupado ? "Pré-visualizando..." : "Pré-visualizar CSV"}
      </Button>}
      {resumo && <div aria-live="polite" className="space-y-3 rounded-lg border p-4">
        <h3 className="font-semibold">{previa ? "Confira antes de importar" : "Importação concluída"}</h3>
        <p className="break-words text-sm">Arquivo: {arquivo?.name}</p>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt>Linhas</dt><dd>{resumo.totalLinhas}</dd>
          <dt>{previa ? "Novos clientes" : "Criados"}</dt><dd>{resumo.criados}</dd>
          <dt>Clientes encontrados por nome normalizado</dt><dd>{resumo.clientesEncontradosPorNome}</dd>
          <dt>Clientes encontrados por nome abreviado</dt><dd>{resumo.clientesEncontradosPorNomeAbreviado ?? 0}</dd>
          <dt>{previa ? "Nomes a expandir" : "Nomes expandidos"}</dt><dd>{resumo.nomesExpandidos ?? 0}</dd>
          <dt>Clientes encontrados por CPF</dt><dd>{resumo.clientesEncontradosPorCpf}</dd>
          <dt>{previa ? "A preencher" : "Atualizados"}</dt><dd>{resumo.clientesAtualizados}</dd>
          <dt>Conflitos preservados</dt><dd>{resumo.conflitos}</dd>
          <dt>{previa ? "Importáveis com aviso" : "Importados com aviso"}</dt><dd>{previa ? resumo.importaveisComAviso : resumo.importadosComAviso}</dd>
          <dt>Ambíguos</dt><dd>{resumo.ambiguos}</dd>
          <dt>Conflitos de identidade</dt><dd>{resumo.conflitosIdentidade}</dd>
          <dt>{previa ? "Campos a preencher" : "Campos preenchidos"}</dt><dd>{resumo.camposPreenchidos}</dd>
          <dt>Bloqueados</dt><dd>{resumo.bloqueados}</dd>
          <dt>Sem Word</dt><dd>{resumo.semWord}</dd>
          <dt>Duplicidades para revisar</dt><dd>{resumo.duplicidadesRevisar}</dd>
          <dt>Inválidos / erros</dt><dd>{resumo.erros}</dd>
        </dl>
        {resumo.conflitos > 0 && <p className="text-sm">Campos em conflito serão mantidos. Campos vazios dessas linhas podem ser preenchidos.</p>}
        {previa && <p className="text-sm">Serão processados {resumo.importaveisSemRessalvas} registros sem ressalvas e {resumo.importaveisComAviso} com avisos. Não serão importados {resumo.bloqueados} registros bloqueados. Valores preenchidos no banco continuam preservados, exceto a expansão segura do nome abreviado. Serão criados {resumo.criados} clientes e completados {resumo.clientesAtualizados} cadastros existentes.</p>}
        <label htmlFor="filtro-csv" className="block text-sm font-medium">Filtrar registros</label>
        <select id="filtro-csv" className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={filtro} onChange={event => setFiltro(event.target.value)}>
          {["Todos", "Novos", "Com aviso", "Conflitos", "Bloqueados", "Erros"].map(item => <option key={item}>{item}</option>)}
        </select>
        <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
          {detalhesFiltrados.map(d => <div key={d.linha} className={`rounded-md border p-3 text-sm break-words ${d.status === "ERRO" || d.status === "BLOQUEADO" ? "border-red-200 bg-red-50/50" : d.comAviso ? "border-amber-200 bg-amber-50/50" : "border-slate-200"}`}>
            <p className="font-medium">Linha {d.linha}: {d.nome || "Sem nome"}{d.cpf ? ` (${d.cpf})` : ""}</p>
            <p>CSV: {d.statusCsv || "não informado"} · Importação: {d.classificacao?.replaceAll("_", " ") || d.status}</p>
            <p>Match: {d.match || "não identificado"}{d.confianca ? ` · Confiança: ${d.confianca}` : ""}</p>
            {d.nomeEncontrado && <p>Encontrado como: {d.nomeEncontrado}</p>}
            {d.acao === "ATUALIZAR_CLIENTE_EXISTENTE" && <p>{previa ? "Será atualizado o cadastro existente." : "Cadastro existente atualizado."}</p>}
            {d.nomeAtualizado && <p>{previa ? "Nome será atualizado" : "Nome atualizado"}: {d.nomeEncontrado} → {d.nomeAtualizado}</p>}
            <p>{textoPublico(d.motivo, "Revise os dados desta linha antes de tentar novamente.")}</p>
            {d.camposConflitantes?.length > 0 && <p className="text-amber-800">Campos em conflito: {d.camposConflitantes.map(c => rotulosCampos[c] ?? "Campo cadastral").join(", ")}. Confira o cadastro existente; os valores preenchidos serão preservados.</p>}
            {d.camposAusentes?.length > 0 && <p className="text-slate-600">Dados ausentes: {d.camposAusentes.map(c => rotulosCampos[c] ?? "Campo cadastral").join(", ")}. Complete-os quando necessários à operação desejada.</p>}
          </div>)}
          {detalhesFiltrados.length === 0 && <p className="text-sm text-muted-foreground">Nenhum registro neste filtro.</p>}
        </div>
        {resumo.detalhesTruncados && <p className="text-sm text-muted-foreground">Detalhes limitados aos primeiros 500 registros; totais incluem todo o arquivo.</p>}
      </div>}
      {previa && <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" disabled={ocupado} onClick={limpar}>Cancelar</Button>
        <Button disabled={ocupado || previa.totalLinhas === 0 || (previa.criados + previa.atualizados + previa.conflitos === 0)} onClick={() => void enviar(true)}>
          {ocupado ? "Importando..." : "Confirmar importação"}
        </Button>
      </div>}
      {resultado && <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={baixarRelatorio}>Baixar relatório{resultado.detalhesTruncados ? " (primeiros 500)" : ""}</Button>
        <Button variant="outline" onClick={limpar}>Selecionar outro CSV</Button>
      </div>}
    </CardContent>
  </Card>;
}

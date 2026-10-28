export interface PendenciaApi { campo: string; mensagem: string; pessoa?: string }
export type CategoriaErro = "validacao" | "negocio" | "conflito" | "naoEncontrado" | "perfil" | "comunicacao" | "interno";
export const rotulosCampos: Record<string, string> = {
  nomeConfirmacao: "Nome de confirmação", nome: "Nome", nomeCompleto: "Nome completo", cpf: "CPF", rg: "RG", rgOrgaoExpedidor: "Órgão expedidor / UF",
  sexoDocumento: "Sexo para o documento", enderecoCep: "CEP", enderecoNumero: "Número", enderecoRua: "Rua",
  enderecoBairro: "Bairro", enderecoCidade: "Cidade", enderecoEstado: "Estado / UF", nacionalidade: "Nacionalidade",
  profissao: "Profissão", estadoCivil: "Estado civil", valorEmprestado: "Valor emprestado", quantidadeParcelas: "Quantidade de parcelas",
  jurosCobrado: "Juros", formaPagamento: "Forma de pagamento", frequenciaPagamento: "Frequência de pagamento",
  tipoContrato: "Tipo de contrato", fiadorId: "Fiador", clienteId: "Devedor",
};
export function textoPublico(valor: unknown, fallback = "Não foi possível concluir a operação."): string {
  return typeof valor === "string" && valor.trim() && !/SQL|Hibernate|constraint|stack\s*trace|java\.|org\.|jdbc:|Exception\b|<\/?(?:html|script|body)|[A-Z]:[\\/]|file:\/\/|\/(?:home|Users|var|tmp|app|workspace|etc|usr|opt|srv|root)\/|\bat\s+\w+[.$]\w+\(/i.test(valor)
    ? valor.trim() : fallback;
}
export class ApiError extends Error {
  constructor(public resumo: string, public status = 0, public codigo = "", public campos: PendenciaApi[] = [],
    public categoria: CategoriaErro = "negocio") {
    super(campos.length ? `${resumo}\n${campos.map(p => `${p.pessoa === "DEVEDOR" ? "Devedor — " : p.pessoa === "FIADOR" ? "Fiador — " : ""}${rotulosCampos[p.campo] ?? "Campo"}: ${p.mensagem}`).join("\n")}` : resumo);
    this.name = "ApiError";
  }
}
export function erroDaApi(data: unknown, status: number, fallback: string): ApiError {
  if (status >= 500) return new ApiError(`${fallback} O serviço apresentou uma falha. Tente novamente em instantes.`, status, "ERRO_INTERNO", [], "interno");
  const obj = data && typeof data === "object" ? data as Record<string, unknown> : {};
  const resumo = textoPublico(obj.mensagem ?? obj.message ?? obj.error ?? data, fallback);
  const campos: PendenciaApi[] = [];
  if (Array.isArray(obj.campos)) for (const item of obj.campos) {
    if (!item || typeof item !== "object") continue;
    const campo = typeof item.campo === "string" ? item.campo : "";
    const mensagem = textoPublico(item.mensagem ?? item.message, "");
    const pessoa = ["DEVEDOR", "FIADOR"].includes(item.pessoa) ? item.pessoa : undefined;
    if (campo && mensagem) campos.push({ campo, mensagem, pessoa });
  }
  if (obj.fields && typeof obj.fields === "object") for (const [campo, valor] of Object.entries(obj.fields)) {
    for (const texto of Array.isArray(valor) ? valor : [valor]) {
      const mensagem = textoPublico(texto, "");
      if (mensagem) campos.push({ campo, mensagem });
    }
  }
  let codigo = typeof obj.codigo === "string" ? obj.codigo : "";
  let categoria: CategoriaErro = campos.length || status === 422 ? "validacao" : status === 409 ? "conflito" : status === 404 ? "naoEncontrado" : "negocio";
  if (codigo === "PERFIL_NAO_ENCONTRADO")
    return new ApiError(resumo, status, codigo, [], "naoEncontrado");
  if (/X-Perfil-Id|perfil (?:ativo )?(?:não informado|não encontrado|inválido)|nenhum perfil/i.test(resumo)) {
    return new ApiError("Selecione um Perfil válido em Configurações e tente novamente.", status, "PERFIL_INVALIDO", [], "perfil");
  }
  if (!campos.length) {
    const inferencias: [string, RegExp][] = [["cpf", /CPF/i], ["rg", /^RG\b/i], ["enderecoCep", /^CEP\b/i],
      ["nome", /nome (?:é obrigatório|igual|excede)|cliente com nome/i], ["fiadorId", /fiador/i],
      ["quantidadeParcelas", /quantidade de parcelas/i], ["valorEmprestado", /valor emprestado/i], ["jurosCobrado", /taxa de juros/i]];
    const campo = inferencias.find(([, regex]) => regex.test(resumo))?.[0];
    if (campo) campos.push({ campo, mensagem: resumo });
    if (status === 409 && /CPF/i.test(resumo)) codigo = "CPF_DUPLICADO";
  }
  if (codigo === "DADOS_CONTRATO_INCOMPLETOS") categoria = "validacao";
  return new ApiError(resumo, status, codigo, campos, categoria);
}

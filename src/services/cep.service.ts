export const normalizarCep = (valor: string) => valor.replace(/[\s-]/g, "");
export const cepValido = (valor: string) => /^[0-9]{8}$/.test(normalizarCep(valor));
export const formatarCep = (valor: string) => cepValido(valor)
  ? normalizarCep(valor).replace(/^(\d{5})(\d{3})$/, "$1-$2") : valor;

export interface EnderecoCep {
  enderecoRua?: string;
  enderecoBairro?: string;
  enderecoCidade?: string;
  enderecoEstado?: string;
}

export async function buscarCep(cep: string, signal: AbortSignal): Promise<EnderecoCep | null> {
  const codigo = normalizarCep(cep);
  if (!/^[0-9]{8}$/.test(codigo)) throw new Error("CEP inválido.");
  // External requests deliberately carry no application headers or Perfil identity.
  const response = await fetch(`https://viacep.com.br/ws/${codigo}/json/`, { signal });
  if (!response.ok) throw new Error("Consulta de CEP indisponível.");
  const dados: unknown = await response.json();
  if (!dados || typeof dados !== "object") throw new Error("Resposta de CEP inválida.");
  const objeto = dados as Record<string, unknown>;
  if (objeto.erro === true || objeto.erro === "true") return null;
  const texto = (campo: string) => typeof objeto[campo] === "string" && objeto[campo].trim()
    ? objeto[campo].trim() : undefined;
  const uf = texto("uf");
  return { enderecoRua: texto("logradouro"), enderecoBairro: texto("bairro"),
    enderecoCidade: texto("localidade"), enderecoEstado: uf && /^[A-Z]{2}$/.test(uf) ? uf : undefined };
}

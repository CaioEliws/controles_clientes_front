export async function gerarImagemRelatorio(elemento: HTMLElement): Promise<Blob> {
  const copia = elemento.cloneNode(true) as HTMLElement;
  const suporte = document.createElement("div");
  suporte.setAttribute("aria-hidden", "true");
  Object.assign(suporte.style, { position: "fixed", left: "-20000px", top: "0", width: "800px", pointerEvents: "none" });
  Object.assign(copia.style, { width: "800px", maxWidth: "none", margin: "0", padding: "32px", backgroundColor: "#ffffff" });
  copia.querySelectorAll<HTMLElement>("[id]").forEach((node) => node.removeAttribute("id"));
  suporte.append(copia); document.body.append(suporte);
  try {
    await document.fonts.ready;
    const { toBlob } = await import("html-to-image");
    const altura = Math.ceil(copia.getBoundingClientRect().height);
    const pixelRatio = Math.min(2, 16000 / altura, Math.sqrt(64_000_000 / (800 * altura)));
    const blob = await toBlob(copia, { backgroundColor: "#ffffff", width: 800, height: altura, pixelRatio, skipFonts: true });
    if (!blob) throw new Error("Não foi possível criar o PNG.");
    return blob;
  } finally { suporte.remove(); }
}

export function nomeImagemRelatorio(cliente: string, emprestimoId: number) {
  const nome = cliente.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100) || "cliente";
  return `parcelas-${nome}-emprestimo-${emprestimoId}.png`;
}

export function baixarImagem(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = nome; document.body.append(link);
  try { link.click(); } finally { link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
}

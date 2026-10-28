import { useEffect } from "react";

// Compatibilidade com os formulários de cliente existentes.
export { dialogLayout as clienteModalLayout, dialogFieldClassName as clienteCampoClassName } from "./ui/dialog-layout";

// Mantém o campo em edição acessível quando a altura útil muda (teclado móvel).
export function useClienteModalViewport(open: boolean) {
  useEffect(() => {
    if (!open) return;
    let frame = 0;
    const reposicionar = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const campo = document.activeElement;
        if (campo instanceof HTMLElement && campo.closest("[data-cliente-form-scroll]"))
          campo.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    };
    const observer = new ResizeObserver(reposicionar);
    const inicial = window.requestAnimationFrame(() => {
      const area = document.querySelector("[data-cliente-form-scroll]");
      if (area) observer.observe(area);
    });
    window.addEventListener("resize", reposicionar);
    window.visualViewport?.addEventListener("resize", reposicionar);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(inicial);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", reposicionar);
      window.visualViewport?.removeEventListener("resize", reposicionar);
    };
  }, [open]);
}

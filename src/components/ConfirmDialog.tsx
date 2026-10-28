import { useRef, useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: ReactNode; confirmText: string; destructive?: boolean; onConfirm: () => Promise<void> | void };
export function ConfirmDialog({ open, onOpenChange, title, description, confirmText, destructive = false, onConfirm }: Props) {
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const lock = useRef(false), cancelar = useRef<HTMLButtonElement>(null);
  function mudar(value: boolean) { if (!lock.current) { setErro(null); onOpenChange(value); } }
  async function confirmar() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setErro(null);
    try { await onConfirm(); onOpenChange(false); }
    catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível concluir a operação."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <Dialog open={open} onOpenChange={mudar}>
    <DialogContent role="alertdialog" onOpenAutoFocus={event => { event.preventDefault(); cancelar.current?.focus(); }} onEscapeKeyDown={event => { if (lock.current) event.preventDefault(); }} onInteractOutside={event => { if (lock.current) event.preventDefault(); }}>
      <DialogHeader><DialogTitle className="flex items-center gap-3">{destructive && <AlertTriangle aria-hidden="true" className="h-5 w-5 shrink-0 text-red-600" />}{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
      {erro && <DialogBody><p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erro}</p></DialogBody>}
      <DialogFooter><Button ref={cancelar} type="button" variant="outline" disabled={busy} onClick={() => mudar(false)}>Cancelar</Button><Button type="button" variant={destructive ? "destructive" : "default"} disabled={busy} onClick={() => { void confirmar(); }}>{busy ? "Processando..." : confirmText}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}

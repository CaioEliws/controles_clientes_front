import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EditarClienteDialog } from "@/components/EditarClienteDialog";
import { ErroOperacao } from "@/components/ErroOperacao";
import { ApiError } from "@/services/apiError";
import { clientesService } from "@/services/clientes.service";
import { emprestimosService } from "@/services/emprestimos.service";
import type { Cliente } from "@/types";

export function CorrecaoDadosContrato({ erro, clienteId, emprestimoId, onCorrigido }: {
  erro: unknown; clienteId: number; emprestimoId: number; onCorrigido: () => void;
}) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erroCadastro, setErroCadastro] = useState<unknown>(null);
  const lock = useRef(false), mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const campos = erro instanceof ApiError ? erro.campos : [];
  const texto = erro instanceof Error ? erro.message : typeof erro === "string" ? erro : "";
  const semFiador = /não possui fiador|fiador não pode ser.*próprio|fiador e devedor devem ser pessoas diferentes/i.test(texto);
  const devedor = campos.some(p => p.pessoa === "DEVEDOR") || /dados do devedor incompletos/i.test(texto);
  const fiador = !semFiador && (campos.some(p => p.pessoa === "FIADOR") || /dados do fiador incompletos/i.test(texto));
  async function editar(pessoa: "DEVEDOR" | "FIADOR") {
    if (lock.current) return;
    lock.current = true; setCarregando(true); setErroCadastro(null);
    try {
      let id = clienteId;
      if (pessoa === "FIADOR") {
        const emprestimo = (await emprestimosService.getByCliente(clienteId)).find(e => e.id === emprestimoId);
        if (!emprestimo?.fiadorId) throw new Error("Este empréstimo não possui fiador associado. Regularize o vínculo na tela Empréstimo e consulte novamente.");
        id = emprestimo.fiadorId;
      }
      const registro = await clientesService.getById(id);
      if (mounted.current) setCliente(registro);
    } catch (error) { if (mounted.current) setErroCadastro(error); }
    finally { lock.current = false; if (mounted.current) setCarregando(false); }
  }
  if (!devedor && !fiador && !semFiador && !cliente && !erroCadastro && !carregando) return null;
  return <div className="space-y-3">
    {(devedor || fiador || semFiador) && <div className="flex flex-wrap gap-2">
      {devedor && <Button variant="outline" type="button" disabled={carregando} onClick={() => { void editar("DEVEDOR"); }}>Editar devedor</Button>}
      {fiador && <Button variant="outline" type="button" disabled={carregando} onClick={() => { void editar("FIADOR"); }}>Editar fiador</Button>}
      {semFiador && <Link className="text-sm underline" to={`/emprestimo?selectedCliente=${clienteId}`}>Regularizar fiador em Empréstimos</Link>}
    </div>}
    {carregando && <p role="status" className="text-sm text-slate-500">Carregando o cadastro correto...</p>}
    <ErroOperacao erro={erroCadastro} titulo="Não foi possível abrir o cadastro" />
    {cliente && <EditarClienteDialog cliente={cliente} onClose={() => setCliente(null)} onSuccess={() => { setCliente(null); onCorrigido(); }} />}
  </div>;
}

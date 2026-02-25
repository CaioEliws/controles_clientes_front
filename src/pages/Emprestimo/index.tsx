import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { emprestimosService } from "@/services/emprestimos.service";
import { clientesService } from "@/services/clientes.service";

import type { Cliente, EmprestimoDetalhado } from "@/types";

import { NovoEmprestimoDialog } from "@/pages/Emprestimo/components/NovoEmprestimoDialog";
import { EmprestimosTable } from "@/pages/Emprestimo/components/EmprestimosTable";

export function Emprestimo() {
  const [emprestimos, setEmprestimos] = useState<EmprestimoDetalhado[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const navigate = useNavigate();

  const handleOpenParcelas = ({ emprestimoId, cliente }: { emprestimoId: number; cliente: string }) => {
    const params = new URLSearchParams();
    params.set("cliente", cliente);
    params.set("emprestimoId", String(emprestimoId));
    navigate(`/parcelas?${params.toString()}`);
  };

  useEffect(() => {
    let alive = true;

    clientesService.getAll().then((data) => {
      if (!alive) return;
      setClientes(data);
    });

    return () => {
      alive = false;
    };
  }, []);

  const fetchEmprestimos = useCallback(async (clienteId: number) => {
    setLoading(true);
    try {
      const data = await emprestimosService.getByCliente(clienteId);
      setEmprestimos(data);
    } catch {
      setEmprestimos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectCliente = (id: number | null) => {
    setSelectedCliente(id);
    setEmprestimos([]);

    if (!id) {
      setLoading(false);
      return;
    }

    fetchEmprestimos(id);
  };

  const selectedClienteName = useMemo(() => {
    if (!selectedCliente) return null;
    return clientes.find((c) => c.id === selectedCliente)?.nome ?? null;
  }, [clientes, selectedCliente]);

  const emprestimosView = useMemo(() => {
    const sorted = [...emprestimos].sort((a, b) => {
      const da = new Date(a.dataEmprestimo).getTime();
      const db = new Date(b.dataEmprestimo).getTime();
      return sortOrder === "asc" ? db - da : da - db;
    });

    return sorted;
  }, [emprestimos, sortOrder]);

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-2xl font-semibold">Empréstimos</h1>
        <p className="text-sm text-slate-500">
          Selecione um cliente para listar os empréstimos.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            className="h-10 w-full sm:w-[320px] rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400"
            value={selectedCliente ?? ""}
            onChange={(e) =>
              handleSelectCliente(
                e.target.value ? Number(e.target.value) : null
              )
            }
          >
            <option value="">Selecione um cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <select
            className="h-10 w-full sm:w-[200px] rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            disabled={!selectedCliente}
          >
            <option value="desc">Mais antigos</option>
            <option value="asc">Mais recentes</option>
          </select>
        </div>

        <NovoEmprestimoDialog
          disabled={!selectedCliente}
          selectedClienteId={selectedCliente}
          selectedClienteName={selectedClienteName}
          onCreated={() => {
            if (selectedCliente) fetchEmprestimos(selectedCliente);
          }}
        />
      </div>

      <EmprestimosTable
        loading={loading}
        emprestimos={emprestimosView}
        selectedClienteName={selectedClienteName}
        onOpenParcelas={handleOpenParcelas}
      />
    </div>
  );
}
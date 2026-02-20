import { useState, useEffect } from "react";
import { env } from "@/config/env";
import type { Cliente, Emprestimo } from "@/types";

const API = env.API_URL;

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEmprestimos, setTotalEmprestimos] = useState(0);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/clientes`);
      const data: Cliente[] = await response.json();
      setClientes(data);
      
      let total = 0;
      for (const cliente of data) {
        const res = await fetch(`${API}/clientes/${cliente.id}/emprestimos`);
        const emprestimos: Emprestimo[] = await res.json();
        total += emprestimos.length;
      }
      setTotalEmprestimos(total);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletarCliente = async (id: number) => {
    if (!window.confirm("Deseja realmente deletar?")) return;
    await fetch(`${API}/clientes/${id}`, { method: "DELETE" });
    fetchClientes();
  };

  useEffect(() => { fetchClientes(); }, []);

  return { clientes, loading, totalEmprestimos, fetchClientes, deletarCliente, API };
}
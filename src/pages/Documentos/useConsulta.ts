import { useEffect, useRef, useState } from "react";

export function useConsulta<T>(carregar: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const pedido = useRef<{ carregar: typeof carregar; tentativa: number; promise: Promise<T> } | null>(null);
  useEffect(() => {
    let alive = true;
    if (!pedido.current || pedido.current.carregar !== carregar || pedido.current.tentativa !== tentativa) {
      pedido.current = { carregar, tentativa, promise: carregar() };
    }
    pedido.current.promise.then((response) => { if (alive) setData(response); })
      .catch((erro: unknown) => { if (alive) setError(erro instanceof Error ? erro.message : "Não foi possível carregar os dados."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [carregar, tentativa]);
  function recarregar() {
    setLoading(true);
    setError(null);
    setTentativa((value) => value + 1);
  }
  return { data, setData, loading, error, recarregar };
}

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  FiBarChart2, 
  FiDollarSign, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiTrendingUp, 
  FiLayers 
} from "react-icons/fi";
import type { Relatorio, Emprestimo, Parcela } from "@/types";

interface Props { clienteId: number; API: string; }

export function ModalRelatorio({ clienteId, API }: Props) {
  const [loading, setLoading] = useState(false);
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);

  const buscarRelatorio = async () => {
    setLoading(true);
    try {
      const resEmp = await fetch(`${API}/clientes/${clienteId}/emprestimos`);
      const emprestimos: Emprestimo[] = await resEmp.json();

      let tEmp = 0, tPago = 0, tAberto = 0, pAtrasadas = 0;

      for (const emp of emprestimos) {
        tEmp += emp.valorEmprestado;
        tPago += emp.valorRecebido;
        tAberto += (emp.valorAReceber - emp.valorRecebido);

        const resParc = await fetch(`${API}/clientes/${clienteId}/emprestimos/${emp.id}/parcelas`);
        const parcelas: Parcela[] = await resParc.json();
        pAtrasadas += parcelas.filter(p => 
          p.status === "PENDENTE" && new Date(p.dataVencimento) < new Date()
        ).length;
      }

      setRelatorio({ 
        totalEmprestado: tEmp, 
        totalPago: tPago, 
        totalAberto: tAberto, 
        parcelasAtrasadas: pAtrasadas, 
        totalEmprestimos: emprestimos.length 
      });
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Dialog onOpenChange={(open) => open && buscarRelatorio()}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2 border-emerald-500/20 hover:bg-emerald-50 transition-all">
          <FiBarChart2 className="text-emerald-600" /> Relatório
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-800">Resumo Financeiro</DialogTitle>
              <DialogDescription>Acompanhamento de entradas e pendências do cliente.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : relatorio && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {/* VERDES: Entradas e Totais */}
            <StatSmallCard 
              label="Total Contratado" 
              value={formatCurrency(relatorio.totalEmprestado)} 
              icon={<FiLayers />}
              variant="neutral"
            />
            <StatSmallCard 
              label="Total Recebido" 
              value={formatCurrency(relatorio.totalPago)} 
              icon={<FiCheckCircle />}
              variant="success"
            />

            {/* VERMELHOS: Pendências e Riscos */}
            <StatSmallCard 
              label="Saldo devedor" 
              value={formatCurrency(relatorio.totalAberto)} 
              icon={<FiDollarSign />}
              variant="danger"
              className="sm:col-span-2"
            />
            <StatSmallCard 
              label="Parcelas em Atraso" 
              value={relatorio.parcelasAtrasadas} 
              icon={<FiAlertCircle />}
              variant={relatorio.parcelasAtrasadas > 0 ? "danger" : "neutral"}
            />
            
            <StatSmallCard 
              label="Qtd. Empréstimos" 
              value={relatorio.totalEmprestimos} 
              icon={<FiBarChart2 />}
              variant="neutral"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface CardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant: "success" | "danger" | "neutral";
  className?: string;
}

const StatSmallCard = ({ label, value, icon, variant, className }: CardProps) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
    neutral: "bg-slate-50"
  };

  return (
    <Card className={`p-4 border shadow-none flex items-center gap-4 transition-all ${styles[variant]} ${className}`}>
      <div className={`p-2 rounded-lg bg-white/60 shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">{label}</p>
        <h3 className="text-lg font-black leading-tight">
          {value}
        </h3>
      </div>
    </Card>
  );
};
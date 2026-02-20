import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Importação que estava faltando
import { FiUserPlus } from "react-icons/fi";
import { env } from "@/config/env";

const API = env.API_URL;

interface ModalCadastroProps {
  onSuccess: () => void;
}

// Interface para o formulário (evita o uso de 'any')
interface ClienteForm {
  nome: string;
  nomeIndicador: string;
  enderecoRua: string;
  enderecoBairro: string;
  enderecoNumero: number;
}

export function ModalCadastro({ onSuccess }: ModalCadastroProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ClienteForm>({
    nome: "",
    nomeIndicador: "",
    enderecoRua: "",
    enderecoBairro: "",
    enderecoNumero: 0,
  });

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API}/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Erro ao cadastrar");

      // Resetar formulário e fechar modal
      setForm({
        nome: "",
        nomeIndicador: "",
        enderecoRua: "",
        enderecoBairro: "",
        enderecoNumero: 0,
      });
      setOpen(false);
      onSuccess(); // Atualiza a lista de clientes
    } catch (error) {
      console.error(error);
      alert("Falha ao salvar o cliente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <FiUserPlus /> Novo Cliente
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para adicionar um novo cliente ao sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Nome */}
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: João Silva"
            />
          </div>

          {/* Indicador */}
          <div className="grid gap-2">
            <Label htmlFor="indicador">Quem indicou?</Label>
            <Input
              id="indicador"
              value={form.nomeIndicador}
              onChange={(e) => setForm({ ...form, nomeIndicador: e.target.value })}
              placeholder="Nome do indicador"
            />
          </div>

          {/* Endereço (Rua e Número) */}
          <div className="flex gap-4">
            <div className="grid gap-2 flex-[3]">
              <Label htmlFor="rua">Rua</Label>
              <Input
                id="rua"
                value={form.enderecoRua}
                onChange={(e) => setForm({ ...form, enderecoRua: e.target.value })}
              />
            </div>
            <div className="grid gap-2 flex-[1]">
              <Label htmlFor="numero">Nº</Label>
              <Input
                id="numero"
                type="number"
                onChange={(e) => setForm({ ...form, enderecoNumero: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Bairro */}
          <div className="grid gap-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              id="bairro"
              value={form.enderecoBairro}
              onChange={(e) => setForm({ ...form, enderecoBairro: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full">
            Salvar Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiUserPlus } from "react-icons/fi";
import { env } from "@/config/env";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { clienteCreateSchema, type ClienteCreateForm } from "@/schemas/clientes.schemas";

const API = env.API_URL;

interface ModalCadastroProps {
  onSuccess: () => void;
}

export function ModalCadastro({ onSuccess }: ModalCadastroProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ClienteCreateForm>({
    resolver: zodResolver(clienteCreateSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      nomeIndicador: "",
      enderecoRua: "",
      enderecoBairro: "",
      enderecoNumero: "",
    },
  });

  const onSubmit = async (data: ClienteCreateForm) => {
    const payload = {
      ...data,
      nomeIndicador: data.nomeIndicador?.trim() ? data.nomeIndicador.trim() : null,
      enderecoNumero: Number(data.enderecoNumero),
    };

    const response = await fetch(`${API}/clientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      alert("Falha ao salvar o cliente.");
      return;
    }

    reset();
    setOpen(false);
    onSuccess();
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

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input id="nome" {...register("nome")} placeholder="Ex: João Silva" />
            {errors.nome && <p className="text-red-600 text-xs font-medium">{errors.nome.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="indicador">Quem indicou?</Label>
            <Input id="indicador" {...register("nomeIndicador")} placeholder="Nome do indicador (opcional)" />
            {errors.nomeIndicador && (
              <p className="text-red-600 text-xs font-medium">{errors.nomeIndicador.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="grid gap-2 flex-[3]">
              <Label htmlFor="rua">Rua</Label>
              <Input id="rua" {...register("enderecoRua")} placeholder="Ex: Rua Humberto" />
              {errors.enderecoRua && (
                <p className="text-red-600 text-xs font-medium">{errors.enderecoRua.message}</p>
              )}
            </div>

            <div className="grid gap-2 flex-[1]">
              <Label htmlFor="numero">Nº</Label>
              <Input id="numero" inputMode="numeric" {...register("enderecoNumero")} placeholder="Ex: 441" />
              {errors.enderecoNumero && (
                <p className="text-red-600 text-xs font-medium">{errors.enderecoNumero.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" {...register("enderecoBairro")} placeholder="Ex: Jardim Sol" />
            {errors.enderecoBairro && (
              <p className="text-red-600 text-xs font-medium">{errors.enderecoBairro.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting || !isValid}>
              {isSubmitting ? "Salvando..." : "Salvar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
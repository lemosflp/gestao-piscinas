import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const TestClienteForm: React.FC = () => {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("clientes")
      .insert([
        { nome, telefone, email, endereco, cidade, observacoes },
      ])
      .select("*")
      .single();

    setLoading(false);
    if (error) {
      setMessage(`Erro: ${error.message}`);
      console.error("TestClienteForm insert error:", error);
      return;
    }

    setMessage(`Inserido com id ${data?.id}`);
    setNome("");
    setTelefone("");
    setEmail("");
    setEndereco("");
    setCidade("");
    setObservacoes("");
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-lg font-semibold mb-3">Formulário de teste - clientes</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm">Telefone</label>
          <input value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm">Endereço</label>
          <input value={endereco} onChange={(e) => setEndereco(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm">Cidade</label>
          <input value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm">Observações</label>
          <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>

        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? "Enviando..." : "Inserir cliente"}
          </button>
        </div>
      </form>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
};

export default TestClienteForm;

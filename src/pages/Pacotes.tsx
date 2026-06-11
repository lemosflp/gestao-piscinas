import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Package, Gift, Users } from "lucide-react";
import { usePacotesContext } from "@/contexts/PacotesContext";
import { useAdicionaisContext } from "@/contexts/AdicionaisContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useEquipesContext } from "@/contexts/EquipesContext";

export default function Pacotes() {
  const { pacotes, addPacote, updatePacote, removePacote } = usePacotesContext();
  const { adicionais, addAdicional, updateAdicional, removeAdicional } = useAdicionaisContext();
  const { equipes, addEquipe, updateEquipe, removeEquipe } = useEquipesContext();

  // ESTADO PACOTES
  const [showForm, setShowForm] = useState(false);
  const [editingPacoteId, setEditingPacoteId] = useState<string | null>(null);
  const [selectedPacoteId, setSelectedPacoteId] = useState<string | null>(null);
  const [pacoteForm, setPacoteForm] = useState({
    nome: "",
    duracaoHoras: "",
    convidadosBase: "",
    valorBase: "",
    valorPorPessoa: "",
    descricao: "",
  });

  // ESTADO ADICIONAIS
  const [showAdicionalForm, setShowAdicionalForm] = useState(false);
  const [editingAdicionalId, setEditingAdicionalId] = useState<string | null>(null);
  const [selectedAdicionalId, setSelectedAdicionalId] = useState<string | null>(null);
  const [adicionalForm, setAdicionalForm] = useState({
    nome: "",
    modelo: "valor_pessoa",
    valor: "",
    duracaoHoras: "",
    descricao: "",
    observacao: false,
  });

  // ESTADO EQUIPES
  const [showEquipeForm, setShowEquipeForm] = useState(false);
  const [editingEquipeId, setEditingEquipeId] = useState<string | null>(null);
  const [selectedEquipeId, setSelectedEquipeId] = useState<string | null>(null);
  const [equipeNome, setEquipeNome] = useState("");
  const [profissionais, setProfissionais] = useState<
    { id: string; nome: string; quantidade: string }[]
  >([]);
  const [profissionalNome, setProfissionalNome] = useState("");
  const [profissionalQuantidade, setProfissionalQuantidade] = useState("");

  // Definir selectedPacote, selectedAdicional, selectedEquipe ANTES dos useEffect
  const selectedPacote = selectedPacoteId
    ? pacotes.find(p => p.id === selectedPacoteId) ?? null
    : null;

  const selectedAdicional = selectedAdicionalId
    ? adicionais.find(a => a.id === selectedAdicionalId) ?? null
    : null;

  const selectedEquipe = selectedEquipeId
    ? equipes.find(e => e.id === selectedEquipeId) ?? null
    : null;

  // REFS para auto-scroll
  const formPacoteRef = useRef<HTMLDivElement>(null);
  const formAdicionalRef = useRef<HTMLDivElement>(null);
  const formEquipeRef = useRef<HTMLDivElement>(null);
  const detailPacoteRef = useRef<HTMLDivElement>(null);
  const detailAdicionalRef = useRef<HTMLDivElement>(null);
  const detailEquipeRef = useRef<HTMLDivElement>(null);

  // Auto-scroll Pacotes
  useEffect(() => {
    if (showForm && formPacoteRef.current) {
      setTimeout(() => {
        formPacoteRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showForm]);

  useEffect(() => {
    if (selectedPacote && detailPacoteRef.current) {
      setTimeout(() => {
        detailPacoteRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [selectedPacote]);

  // Auto-scroll Adicionais
  useEffect(() => {
    if (showAdicionalForm && formAdicionalRef.current) {
      setTimeout(() => {
        formAdicionalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showAdicionalForm]);

  useEffect(() => {
    if (selectedAdicional && detailAdicionalRef.current) {
      setTimeout(() => {
        detailAdicionalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [selectedAdicional]);

  // Auto-scroll Equipes
  useEffect(() => {
    if (showEquipeForm && formEquipeRef.current) {
      setTimeout(() => {
        formEquipeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showEquipeForm]);

  useEffect(() => {
    if (selectedEquipe && detailEquipeRef.current) {
      setTimeout(() => {
        detailEquipeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [selectedEquipe]);

  // HANDLERS PACOTES
  const handlePacoteChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPacoteForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetPacoteForm = () =>
    setPacoteForm({
      nome: "",
      duracaoHoras: "",
      convidadosBase: "",
      valorBase: "",
      valorPorPessoa: "",
      descricao: "",
    });

  const handleSubmitPacote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacoteForm.nome.trim()) return;

    const payload = {
      nome: pacoteForm.nome.trim(),
      duracaoHoras: Number(pacoteForm.duracaoHoras) || 0,
      convidadosBase: Number(pacoteForm.convidadosBase) || 0,
      valorBase: Number(pacoteForm.valorBase) || 0,
      valorPorPessoa: Number(pacoteForm.valorPorPessoa) || 0,
      descricao: pacoteForm.descricao.trim() || undefined,
    };

    if (editingPacoteId) {
      updatePacote(editingPacoteId, payload);
      setEditingPacoteId(null);
    } else {
      addPacote(payload);
    }

    resetPacoteForm();
    setShowForm(false);
  };

  const handleEditPacote = (id: string) => {
    const p = pacotes.find(p => p.id === id);
    if (!p) return;
    setPacoteForm({
      nome: p.nome,
      duracaoHoras: String(p.duracaoHoras),
      convidadosBase: String(p.convidadosBase),
      valorBase: String(p.valorBase),
      valorPorPessoa: String(p.valorPorPessoa),
      descricao: p.descricao ?? "",
    });
    setEditingPacoteId(id);
    setShowForm(true);
    setSelectedPacoteId(null); // ← Fechar detalhes
  };

  const handleCancelEditPacote = () => {
    setEditingPacoteId(null);
    resetPacoteForm();
    setShowForm(false);
  };

  // HANDLERS ADICIONAIS
  const handleAdicionalChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAdicionalForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdicionalModeloChange = (value: string) => {
    setAdicionalForm(prev => ({
      ...prev,
      modelo: value,
    }));
  };

  const handleAdicionalObservacaoChange = (checked: boolean) => {
    setAdicionalForm(prev => ({
      ...prev,
      observacao: checked,
    }));
  };

  const resetAdicionalForm = () =>
    setAdicionalForm({
      nome: "",
      modelo: "valor_pessoa",
      valor: "",
      duracaoHoras: "",
      descricao: "",
      observacao: false,
    });

  const handleSubmitAdicional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adicionalForm.nome.trim()) return;

    const payload = {
      nome: adicionalForm.nome.trim(),
      modelo: adicionalForm.modelo as "valor_pessoa" | "valor_unidade" | "valor_festa",
      valor: Number(adicionalForm.valor) || 0,
      duracaoHoras: Number(adicionalForm.duracaoHoras) || 0,
      descricao: adicionalForm.descricao.trim() || undefined,
      observacao: adicionalForm.observacao || undefined,
    };

    if (editingAdicionalId) {
      updateAdicional(editingAdicionalId, payload);
      setEditingAdicionalId(null);
    } else {
      addAdicional(payload);
    }

    resetAdicionalForm();
    setShowAdicionalForm(false);
  };

  const handleEditAdicional = (id: string) => {
    const a = adicionais.find(a => a.id === id);
    if (!a) return;
    setAdicionalForm({
      nome: a.nome,
      modelo: a.modelo,
      valor: String(a.valor),
      duracaoHoras: String(a.duracaoHoras ?? 0),
      descricao: a.descricao ?? "",
      observacao: !!a.observacao,
    });
    setEditingAdicionalId(id);
    setShowAdicionalForm(true);
    setSelectedAdicionalId(null); // ← Fechar detalhes
  };

  const handleCancelEditAdicional = () => {
    setEditingAdicionalId(null);
    resetAdicionalForm();
    setShowAdicionalForm(false);
  };

  // HANDLERS EQUIPES
  const resetEquipeForm = () => {
    setEquipeNome("");
    setProfissionais([]);
    setProfissionalNome("");
    setProfissionalQuantidade("");
  };

  const handleAddProfissional = () => {
    if (!profissionalNome.trim()) return;
    setProfissionais(prev => [
      ...prev,
      {
        id: String(Date.now() + Math.random()),
        nome: profissionalNome.trim(),
        quantidade: profissionalQuantidade || "1",
      },
    ]);
    setProfissionalNome("");
    setProfissionalQuantidade("");
  };

  const handleRemoveProfissional = (id: string) => {
    setProfissionais(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmitEquipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipeNome.trim()) return;

    const payload = {
      nome: equipeNome.trim(),
      profissionais: profissionais.map(p => ({
        id: p.id,
        nome: p.nome,
        quantidade: Number(p.quantidade) || 0,
      })),
    };

    if (editingEquipeId) {
      updateEquipe(editingEquipeId, payload);
      setEditingEquipeId(null);
    } else {
      addEquipe(payload);
    }

    resetEquipeForm();
    setShowEquipeForm(false);
  };

  const handleEditEquipe = (id: string) => {
    const equipe = equipes.find(e => e.id === id);
    if (!equipe) return;
    setEquipeNome(equipe.nome);
    setProfissionais(
      equipe.profissionais.map(p => ({
        id: p.id,
        nome: p.nome,
        quantidade: String(p.quantidade),
      }))
    );
    setEditingEquipeId(id);
    setShowEquipeForm(true);
    setSelectedEquipeId(null); // ← Fechar detalhes
  };

  const handleCancelEditEquipe = () => {
    setEditingEquipeId(null);
    resetEquipeForm();
    setShowEquipeForm(false);
  };

  // helper para somar profissionais de uma equipe
  const getTotalProfissionais = (equipe: { profissionais: { quantidade: number }[] }) =>
    equipe.profissionais.reduce((sum, p) => sum + p.quantidade, 0);

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Propostas, Adicionais e Equipes</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie todos os componentes para seus Eventos
        </p>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-wrap gap-3 mb-8">
        {/* Botão Equipes */}
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 flex items-center gap-2"
          onClick={() => {
            if (showEquipeForm && !editingEquipeId) {
              resetEquipeForm();
            }
            setShowEquipeForm(prev => !prev);
          }}
        >
          <Users size={18} />
          {showEquipeForm ? "Cancelar" : "Cadastrar Equipe"}
        </Button>

        {/* Botão Adicionais */}
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 flex items-center gap-2"
          onClick={() => {
            if (showAdicionalForm && !editingAdicionalId) {
              resetAdicionalForm();
            }
            setShowAdicionalForm(prev => !prev);
          }}
        >
          <Gift size={18} />
          {showAdicionalForm ? "Cancelar" : "Cadastrar Adicional"}
        </Button>

        {/* Botão Pacotes */}
        <Button
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 flex items-center gap-2"
          onClick={() => {
            if (showForm && !editingPacoteId) {
              resetPacoteForm();
            }
            setShowForm(prev => !prev);
          }}
        >
          <Package size={18} />
          {showForm ? "Cancelar" : "Cadastrar Proposta"}
        </Button>
      </div>

      {/* FORMULÁRIO EQUIPES */}
      {showEquipeForm && (
        <div ref={formEquipeRef}>
          <Card className="mb-8 border-l-4 border-l-blue-600 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Users size={20} />
                {editingEquipeId ? "Editar Equipe" : "Cadastrar Nova Equipe"}
              </CardTitle>
              <p className="text-xs text-blue-700 mt-1">Gerencie os profissionais da sua equipe</p>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitEquipe} className="space-y-4">
                <Input
                  name="nomeEquipe"
                  value={equipeNome}
                  onChange={e => setEquipeNome(e.target.value)}
                  placeholder="Ex: Infantil"
                  required
                  className="text-base"
                />

                <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <label className="text-sm font-semibold text-blue-900">Adicionar Profissionais</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <Input
                      name="profissionalNome"
                      value={profissionalNome}
                      onChange={e => setProfissionalNome(e.target.value)}
                      placeholder="Nome do profissional"
                    />
                    <Input
                      name="profissionalQuantidade"
                      type="number"
                      min={1}
                      value={profissionalQuantidade}
                      onChange={e => setProfissionalQuantidade(e.target.value)}
                      placeholder="Quantidade"
                    />
                    <Button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleAddProfissional}
                    >
                      Adicionar
                    </Button>
                  </div>

                  {profissionais.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <label className="text-xs font-semibold text-blue-700 uppercase">Profissionais Adicionados</label>
                      {profissionais.map(p => (
                        <div
                          key={p.id}
                          className="flex justify-between items-center bg-white border border-blue-300 rounded px-3 py-2 hover:shadow-sm transition"
                        >
                          <div>
                            <span className="font-medium text-slate-700">{p.nome}</span>
                            <span className="text-slate-500 ml-2">({p.quantidade})</span>
                          </div>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                            onClick={() => handleRemoveProfissional(p.id)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                    {editingEquipeId ? "Salvar Alterações" : "Salvar Equipe"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancelEditEquipe}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FORMULÁRIO ADICIONAIS */}
      {showAdicionalForm && (
        <div ref={formAdicionalRef}>
          <Card className="mb-8 border-l-4 border-l-blue-500 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Gift size={20} />
                {editingAdicionalId ? "Editar Adicional" : "Cadastrar Novo Adicional"}
              </CardTitle>
              <p className="text-xs text-blue-600 mt-1">Adicione Eventos extras aos seus Eventos</p>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitAdicional} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    name="nome"
                    value={adicionalForm.nome}
                    onChange={handleAdicionalChange}
                    placeholder="Ex: Fotografia Profissional"
                    className="md:col-span-2"
                    required
                  />
                  <Select
                    value={adicionalForm.modelo}
                    onValueChange={handleAdicionalModeloChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Modelo de precificação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="valor_pessoa">💰 Valor por pessoa</SelectItem>
                      <SelectItem value="valor_unidade">📦 Valor por unidade</SelectItem>
                      <SelectItem value="valor_festa">🎉 Valor por festa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    name="valor"
                    type="number"
                    min={0}
                    step="0.01"
                    value={adicionalForm.valor}
                    onChange={handleAdicionalChange}
                    placeholder="Valor (R$)"
                  />
                  <Input
                    name="duracaoHoras"
                    type="number"
                    min={0}
                    value={adicionalForm.duracaoHoras}
                    onChange={handleAdicionalChange}
                    placeholder="Duração (horas)"
                  />
                </div>

                <Textarea
                  name="descricao"
                  value={adicionalForm.descricao}
                  onChange={handleAdicionalChange}
                  placeholder="Descrição detalhada (opcional)"
                  rows={3}
                />

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      id="observacao"
                      checked={adicionalForm.observacao}
                      onCheckedChange={checked =>
                        handleAdicionalObservacaoChange(Boolean(checked))
                      }
                    />
                    <span className="text-sm font-medium text-blue-900">
                      Permitir observações do cliente para este adicional
                    </span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white flex-1">
                    {editingAdicionalId ? "Salvar Alterações" : "Salvar Adicional"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancelEditAdicional}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FORMULÁRIO PACOTES */}
      {showForm && (
        <div ref={formPacoteRef}>
          <Card className="mb-8 border-l-4 border-l-blue-700 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-300">
              <CardTitle className="flex items-center gap-2 text-blue-950">
                <Package size={20} />
                {editingPacoteId ? "Editar Proposta" : "Cadastrar Nova Proposta"}
              </CardTitle>
              <p className="text-xs text-blue-800 mt-1">Configure o pacote base para seus Eventos</p>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitPacote} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    name="nome"
                    value={pacoteForm.nome}
                    onChange={handlePacoteChange}
                    placeholder="Ex: Pacote Premium"
                    className="md:col-span-2"
                    required
                  />
                  <Input
                    name="duracaoHoras"
                    type="number"
                    min={1}
                    value={pacoteForm.duracaoHoras}
                    onChange={handlePacoteChange}
                    placeholder="Duração (h)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-blue-100 p-4 rounded-lg border border-blue-300">
                  <div>
                    <label className="text-xs font-semibold text-blue-900">Convidados Base</label>
                    <Input
                      name="convidadosBase"
                      type="number"
                      min={0}
                      value={pacoteForm.convidadosBase}
                      onChange={handlePacoteChange}
                      placeholder="Ex: 40"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-blue-900">Valor Base (R$)</label>
                    <Input
                      name="valorBase"
                      type="number"
                      min={0}
                      step="0.01"
                      value={pacoteForm.valorBase}
                      onChange={handlePacoteChange}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-blue-900">Valor/Pessoa (R$)</label>
                    <Input
                      name="valorPorPessoa"
                      type="number"
                      min={0}
                      step="0.01"
                      value={pacoteForm.valorPorPessoa}
                      onChange={handlePacoteChange}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                </div>

                <Textarea
                  name="descricao"
                  value={pacoteForm.descricao}
                  onChange={handlePacoteChange}
                  placeholder="Descrição completa da proposta (opcional)"
                  rows={3}
                />

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white flex-1">
                    {editingPacoteId ? "Salvar Alterações" : "Salvar Proposta"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancelEditPacote}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* LISTA DE PACOTES */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-700 rounded-lg">
            <Package size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Propostas</h2>
          <span className="ml-auto text-sm text-muted-foreground">{pacotes.length} proposta(s)</span>
        </div>
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            {pacotes.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-blue-200 mb-3" />
                <p className="text-muted-foreground">Nenhuma proposta cadastrada</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pacotes.map(p => (
                  <Card
                    key={p.id}
                    className="bg-white border-blue-200 hover:shadow-lg transition cursor-pointer hover:border-blue-400"
                    onClick={() => setSelectedPacoteId(p.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-base text-blue-800 flex-1">{p.nome}</h4>
                        <div className="bg-blue-100 px-2 py-1 rounded text-xs text-blue-700 font-medium">
                          {p.duracaoHoras}h
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex justify-between">
                          <span>👥 Convidados:</span>
                          <span className="font-medium">{p.convidadosBase}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>💰 Valor Base:</span>
                          <span className="font-medium">R$ {p.valorBase.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-3 text-blue-700 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPacoteId(p.id);
                        }}
                      >
                        <Edit size={16} className="mr-2" /> Ver Detalhes
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* LISTA DE ADICIONAIS */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Gift size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Adicionais</h2>
          <span className="ml-auto text-sm text-muted-foreground">{adicionais.length} adicional(is)</span>
        </div>
        <Card className="bg-gradient-to-br from-cyan-50 to-white border-blue-200">
          <CardContent className="pt-6">
            {adicionais.length === 0 ? (
              <div className="text-center py-12">
                <Gift size={48} className="mx-auto text-blue-200 mb-3" />
                <p className="text-muted-foreground">Nenhum adicional cadastrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adicionais.map(a => (
                  <Card
                    key={a.id}
                    className="bg-white border-blue-200 hover:shadow-lg transition cursor-pointer hover:border-blue-400"
                    onClick={() => setSelectedAdicionalId(a.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-base text-blue-700 flex-1">{a.nome}</h4>
                        <div className="bg-blue-50 px-2 py-1 rounded text-xs text-blue-600 font-medium border border-blue-200">
                          {a.modelo === "valor_pessoa" ? "Pessoa" : a.modelo === "valor_unidade" ? "Unidade" : "Festa"}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex justify-between">
                          <span>💰 Valor:</span>
                          <span className="font-medium">R$ {a.valor.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>⏱️ Duração:</span>
                          <span className="font-medium">{a.duracaoHoras}h</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-3 text-blue-600 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAdicionalId(a.id);
                        }}
                      >
                        <Edit size={16} className="mr-2" /> Ver Detalhes
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* LISTA DE EQUIPES */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Users size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Equipes</h2>
          <span className="ml-auto text-sm text-muted-foreground">{equipes.length} equipe(s)</span>
        </div>
        <Card className="bg-gradient-to-br from-blue-100 to-white border-blue-300">
          <CardContent className="pt-6">
            {equipes.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-blue-200 mb-3" />
                <p className="text-muted-foreground">Nenhuma equipe cadastrada</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipes.map(equipe => (
                  <Card
                    key={equipe.id}
                    className="bg-white border-blue-300 hover:shadow-lg transition cursor-pointer hover:border-blue-500"
                    onClick={() => setSelectedEquipeId(equipe.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-base text-blue-900 flex-1">{equipe.nome}</h4>
                        <div className="bg-blue-200 px-2 py-1 rounded text-xs text-blue-800 font-semibold">
                          {getTotalProfissionais(equipe)}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        {equipe.profissionais.length > 0 && (
                          <div className="mt-2 text-xs space-y-1">
                            {equipe.profissionais.slice(0, 2).map(p => (
                              <div key={p.id} className="flex justify-between text-slate-500">
                                <span>• {p.nome}</span>
                                <span>({p.quantidade})</span>
                              </div>
                            ))}
                            {equipe.profissionais.length > 2 && (
                              <div className="text-slate-400 italic">
                                +{equipe.profissionais.length - 2} mais...
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-3 text-blue-800 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEquipeId(equipe.id);
                        }}
                      >
                        <Edit size={16} className="mr-2" /> Ver Detalhes
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* DETALHES */}
      {selectedPacote && (
        <div ref={detailPacoteRef}>
          <section className="mt-6">
            <Card className="border-l-4 border-l-blue-700 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-200">
                <CardTitle className="text-2xl text-blue-900">{selectedPacote.nome}</CardTitle>
                <p className="text-xs text-blue-600 mt-1">Detalhes da proposta</p>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-800 flex items-center gap-2">
                      <Package size={16} className="text-blue-600" />
                      Estrutura da proposta
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Duração:</span>
                        <span className="font-semibold text-blue-700">{selectedPacote.duracaoHoras}h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Convidados base:</span>
                        <span className="font-semibold text-blue-700">{selectedPacote.convidadosBase}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-800 flex items-center gap-2">
                      <span>💰</span>
                      Valores
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Valor base:</span>
                        <span className="font-semibold text-blue-700">
                          R$ {selectedPacote.valorBase.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Valor por pessoa:</span>
                        <span className="font-semibold text-blue-700">
                          R$ {selectedPacote.valorPorPessoa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedPacote.descricao && (
                  <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-800 mb-3 flex items-center gap-2">
                      <span>📝</span>
                      Descrição
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {selectedPacote.descricao}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 justify-end pt-4 border-t border-blue-100">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => setSelectedPacoteId(null)}
                  >
                    Voltar
                  </Button>

                  <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      handleEditPacote(selectedPacote.id);
                    }}
                  >
                    <Edit size={16} className="mr-2" />
                    Editar
                  </Button>

                  <Button
                    type="button"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      removePacote(selectedPacote.id);
                      setSelectedPacoteId(null);
                    }}
                  >
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      )}

      {selectedAdicional && (
        <div ref={detailAdicionalRef}>
          <section className="mt-6">
            <Card className="border-l-4 border-l-blue-500 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-white border-b border-blue-200">
                <CardTitle className="text-2xl text-blue-800">{selectedAdicional.nome}</CardTitle>
                <p className="text-xs text-blue-600 mt-1">Detalhes do adicional</p>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-800">
                      Modelo
                    </h3>
                    <div className="text-sm">
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-xs">
                        {selectedAdicional.modelo === "valor_pessoa"
                          ? "💰 Valor por pessoa"
                          : selectedAdicional.modelo === "valor_unidade"
                          ? "📦 Valor por unidade"
                          : "🎉 Valor por festa"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-800">
                      Valor e duração
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Valor:</span>
                        <span className="font-semibold text-blue-700">
                          R$ {selectedAdicional.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Duração:</span>
                        <span className="font-semibold text-blue-700">{selectedAdicional.duracaoHoras}h</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedAdicional.descricao && (
                  <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-800 mb-3">
                      Descrição
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {selectedAdicional.descricao}
                    </p>
                  </div>
                )}

                {selectedAdicional.observacao && (
                  <div className="rounded-lg border border-blue-300 bg-blue-50 p-3 text-sm text-blue-700 flex items-center gap-2">
                    <span>✓</span>
                    Observação habilitada para este adicional
                  </div>
                )}

                <div className="flex flex-wrap gap-2 justify-end pt-4 border-t border-blue-100">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => setSelectedAdicionalId(null)}
                  >
                    Voltar
                  </Button>

                  <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      handleEditAdicional(selectedAdicional.id);
                    }}
                  >
                    <Edit size={16} className="mr-2" />
                    Editar
                  </Button>

                  <Button
                    type="button"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      removeAdicional(selectedAdicional.id);
                      setSelectedAdicionalId(null);
                    }}
                  >
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      )}

      {selectedEquipe && (
        <div ref={detailEquipeRef}>
          <section className="mt-6">
            <Card className="border-l-4 border-l-blue-600 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-white border-b border-blue-200">
                <CardTitle className="text-2xl text-blue-900">{selectedEquipe.nome}</CardTitle>
                <p className="text-xs text-blue-600 mt-1">Composição da equipe</p>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-800 mb-4 flex items-center gap-2">
                    <Users size={16} className="text-blue-600" />
                    Profissionais
                  </h3>
                  {selectedEquipe.profissionais.length === 0 ? (
                    <div className="text-sm text-slate-500 italic">
                      Nenhum profissional cadastrado para esta equipe.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedEquipe.profissionais.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 bg-white border border-blue-100 rounded-lg hover:shadow-sm transition"
                        >
                          <span className="font-medium text-slate-700">{p.nome}</span>
                          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                            {p.quantidade} {p.quantidade === 1 ? "profissional" : "profissionais"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 justify-end pt-4 border-t border-blue-100">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => setSelectedEquipeId(null)}
                  >
                    Voltar
                  </Button>

                  <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      handleEditEquipe(selectedEquipe.id);
                    }}
                  >
                    <Edit size={16} className="mr-2" />
                    Editar
                  </Button>

                  <Button
                    type="button"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      removeEquipe(selectedEquipe.id);
                      setSelectedEquipeId(null);
                    }}
                  >
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      )}
    </div>
  );
}

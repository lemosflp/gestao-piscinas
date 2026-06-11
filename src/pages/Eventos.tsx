import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar, Clock, MapPin, Edit, CheckCircle2, Users } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { usePacotesContext } from "@/contexts/PacotesContext";
import { useAdicionaisContext } from "@/contexts/AdicionaisContext";
import { useEquipesContext } from "@/contexts/EquipesContext";
import { Evento } from "@/types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function Eventos() {
  const location = useLocation();
  const locationShowForm = (location.state as any)?.showForm as boolean | undefined;
  const { Eventos, clientes, addEvento, updateEvento, removeEvento } = useAppContext();
  const { pacotes } = usePacotesContext();
  const { adicionais } = useAdicionaisContext();
  const { equipes } = useEquipesContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(!!locationShowForm);

  const [editingEventoId, setEditingEventoId] = useState<string | null>(null);
  const [selectedEventoId, setSelectedEventoId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Evento>>({
    titulo: "",
    clienteId: "",
    clienteNome: "",
    data: "",
    horaInicio: "",
    horaFim: "",
    tipo: "festa",
    status: "pendente",
    observacoes: "",
    valor: 0,
    pacoteId: "",
    convidados: undefined,
    decoracao: "",
    equipeId: "",
    equipeProfissionais: [],
    adicionaisIds: [],
    valorEntrada: undefined,
    formaPagamento: "",
    aniversariantes: [], // [{ nome, idade? }]
  });

  const [adicionaisObservacoesMap, setAdicionaisObservacoesMap] = useState<Record<string, string>>({});
  const [adicionaisQuantidadeMap, setAdicionaisQuantidadeMap] = useState<Record<string, number>>({});

  const [eventoEquipeProfissionais, setEventoEquipeProfissionais] = useState<
    { id: string; nome: string; quantidade: number }[]
  >([]);

  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredEventos = Eventos.filter(evento =>
    evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEvento = selectedEventoId
    ? Eventos.find(e => e.id === selectedEventoId) ?? null
    : null;

  const handleInputChange = (field: keyof Evento, value: string | number | string[] | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClienteSelect = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    setFormData(prev => ({
      ...prev,
      clienteId,
      clienteNome: cliente ? `${cliente.nome} ${cliente.sobrenome}` : ""
    }));
  };

  const handlePacoteSelect = (pacoteId: string) => {
    const pacote = pacotes.find(p => p.id === pacoteId);
    setFormData(prev => ({
      ...prev,
      pacoteId,
      convidados: prev.convidados, // mantém o que o usuário já tinha digitado
    }));
  };

  const handleEquipeSelect = (equipeId: string) => {
    const equipe = equipes.find(e => e.id === equipeId);
    setFormData(prev => ({
      ...prev,
      equipeId,
    }));
    if (equipe) {
      setEventoEquipeProfissionais(
        equipe.profissionais.map(p => ({
          id: p.id,
          nome: p.nome,
          quantidade: p.quantidade,
        }))
      );
    } else {
      setEventoEquipeProfissionais([]);
    }
  };

  const handleAdicionalToggle = (adicionalId: string) => {
    setFormData(prev => {
      const current = prev.adicionaisIds || [];
      const exists = current.includes(adicionalId);
      const nextIds = exists
        ? current.filter(id => id !== adicionalId)
        : [...current, adicionalId];

      if (exists) {
        setAdicionaisObservacoesMap(prevMap => {
          const copy = { ...prevMap };
          delete copy[adicionalId];
          return copy;
        });
        setAdicionaisQuantidadeMap(prevMap => {
          const copy = { ...prevMap };
          delete copy[adicionalId];
          return copy;
        });
      }

      return {
        ...prev,
        adicionaisIds: nextIds,
      };
    });
  };

  const handleAdicionalObservacaoChange = (adicionalId: string, value: string) => {
    setAdicionaisObservacoesMap(prev => ({
      ...prev,
      [adicionalId]: value,
    }));
  };

  const handleAdicionalQuantidadeChange = (adicionalId: string, valueStr: string) => {
    const value = valueStr === "" ? 0 : Number(valueStr) || 0;
    setAdicionaisQuantidadeMap(prev => ({
      ...prev,
      [adicionalId]: value,
    }));
  };

  const handleEquipeProfissionalChange = (id: string, quantidade: number) => {
    setEventoEquipeProfissionais(prev =>
      prev.map(p => (p.id === id ? { ...p, quantidade } : p))
    );
  };

  const handleAniversarianteChange = (
    index: number,
    field: "nome" | "idade",
    value: string
  ) => {
    setFormData(prev => {
      const list = prev.aniversariantes ? [...prev.aniversariantes] : [];
      const item = list[index] ?? { nome: "" };
      if (field === "nome") {
        item.nome = value;
      } else {
        item.idade = value === "" ? undefined : Number(value) || 0;
      }
      list[index] = item;
      return { ...prev, aniversariantes: list };
    });
  };

  const handleAddAniversariante = () => {
    setFormData(prev => ({
      ...prev,
      aniversariantes: [...(prev.aniversariantes || []), { nome: "", idade: undefined }],
    }));
  };

  const handleRemoveAniversariante = (index: number) => {
    setFormData(prev => {
      const list = prev.aniversariantes ? [...prev.aniversariantes] : [];
      list.splice(index, 1);
      return { ...prev, aniversariantes: list };
    });
  };

  const selectedPacote = useMemo(
    () => (formData.pacoteId ? pacotes.find(p => p.id === formData.pacoteId) || undefined : undefined),
    [formData.pacoteId, pacotes]
  );

  const selecionadosAdicionais = useMemo(
    () =>
      (formData.adicionaisIds || []).map(id => adicionais.find(a => a.id === id)).filter(Boolean),
    [formData.adicionaisIds, adicionais]
  ) as typeof adicionais;

  const diffHorasPacote = useMemo(() => {
    if (!selectedPacote || !formData.horaInicio || !formData.horaFim) {
      return {
        extra: 0,
        extraInt: 0,
        deficit: 0,
        deficitInt: 0,
        hasExtra: false,
        hasDeficit: false,
        duracaoHoras: 0,
      };
    }

    const [hiH, hiM] = formData.horaInicio.split(":").map(Number);
    const [hfH, hfM] = formData.horaFim.split(":").map(Number);
    const inicioMin = hiH * 60 + hiM;
    let fimMin = hfH * 60 + hfM;
    
    // Se o horário de fim for menor que o de início, significa que passou da meia-noite
    // Adiciona 24h (1440 minutos) ao horário de fim
    if (fimMin <= inicioMin) {
      fimMin += 24 * 60; // Adiciona 1440 minutos (24 horas)
    }

    const duracaoMin = fimMin - inicioMin;
    const duracaoHoras = duracaoMin / 60;

    const extra = Math.max(0, duracaoHoras - selectedPacote.duracaoHoras);
    const deficit = Math.max(0, selectedPacote.duracaoHoras - duracaoHoras);

    const extraInt = Math.ceil(extra);
    const deficitInt = Math.ceil(deficit);

    return {
      extra,
      extraInt,
      deficit,
      deficitInt,
      hasExtra: extraInt > 0,
      hasDeficit: deficitInt > 0,
      duracaoHoras,
    };
  }, [selectedPacote, formData.horaInicio, formData.horaFim]);

  const [valorEditadoManualmente, setValorEditadoManualmente] = useState(false);

  const valorCalculado = useMemo(() => {
    if (!selectedPacote) return 0;

    const base = selectedPacote.valorBase;
    const convidadosEvento = formData.convidados || selectedPacote.convidadosBase;
    const excedente = Math.max(0, convidadosEvento - selectedPacote.convidadosBase);
    const valorExcedente = excedente * selectedPacote.valorPorPessoa;

    const valorAdicionais = selecionadosAdicionais.reduce((sum, a) => {
      if (a.modelo === "valor_festa") {
        return sum + a.valor;
      }

      if (a.modelo === "valor_unidade") {
        const qtd = adicionaisQuantidadeMap[a.id] ?? 0;
        return sum + a.valor * qtd;
      }

      const convidados = convidadosEvento || 0;
      return sum + a.valor * convidados;
    }, 0);

    return base + valorExcedente + valorAdicionais;
  }, [
    selectedPacote,
    formData.convidados,
    selecionadosAdicionais,
    adicionaisQuantidadeMap,
  ]);

  useEffect(() => {
    if (!selectedPacote) return;
    if (valorEditadoManualmente) return;

    setFormData(prev => ({
      ...prev,
      valor: valorCalculado,
    }));
  }, [valorCalculado, selectedPacote, valorEditadoManualmente]);

  const valorDigitado = formData.valor ?? 0;
  const diffValor = valorDigitado - valorCalculado;
  const hasDiffValor = Math.abs(diffValor) >= 0.01;

  const handleConvidadosChange = (valorStr: string) => {
    const valor = valorStr === "" ? undefined : Number(valorStr) || 0;
    setFormData(prev => ({
      ...prev,
      convidados: valor,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const aniversariantesValidos = (formData.aniversariantes || []).filter(
      a => a.nome && a.nome.trim()
    );

    if (
      !formData.clienteId ||
      !formData.pacoteId ||
      !formData.data ||
      !formData.horaInicio ||
      !formData.formaPagamento ||
      formData.convidados == null || formData.convidados === undefined || formData.convidados <= 0 ||
      aniversariantesValidos.length === 0
    ) {
      toast({
        title: "Erro no cadastro",
        description:
          "Preencha todos os campos obrigatórios (cliente, proposta, data, início, convidados, ao menos um aniversariante/homenageado e forma de pagamento).",
        variant: "destructive",
      });
      return;
    }

    if (selectedPacote && (formData.convidados || 0) < selectedPacote.convidadosBase) {
      toast({
        title: "Número de convidados inválido",
        description: `A proposta selecionada possui mínimo de ${selectedPacote.convidadosBase} convidados.`,
        variant: "destructive",
      });
      return;
    }

    const payloadBase: Omit<Evento, "id"> = {
      titulo:
        (formData.titulo && formData.titulo.trim()) ||
        (formData.clienteNome
          ? `Evento - ${formData.clienteNome}`
          : "Evento"),
      clienteId: formData.clienteId!,
      clienteNome: formData.clienteNome || "",
      data: formData.data!,
      horaInicio: formData.horaInicio!,
      horaFim: formData.horaFim,
      tipo: formData.tipo || "festa",
      status: formData.status || "pendente",
      observacoes: formData.observacoes || "",
      valor: valorDigitado,
      pacoteId: formData.pacoteId,
      convidados: formData.convidados,
      decoracao: formData.decoracao,
      equipeId: formData.equipeId,
      equipeProfissionais: eventoEquipeProfissionais,
      adicionaisIds: formData.adicionaisIds || [],
      valorEntrada: formData.valorEntrada || 0,
      formaPagamento: formData.formaPagamento || "",
      aniversariantes: aniversariantesValidos.map(a => ({
        nome: a.nome.trim(),
        idade:
          a.idade !== undefined && a.idade !== null && a.idade !== 0
            ? a.idade
            : undefined,
      })),
      adicionaisObservacoes: (formData.adicionaisIds || [])
        .map(adicionalId => {
          const obs = adicionaisObservacoesMap[adicionalId];
          if (!obs?.trim()) return null;
          return { adicionalId, observacao: obs.trim() };
        })
        .filter(Boolean) as { adicionalId: string; observacao: string }[],
      adicionaisQuantidade: (formData.adicionaisIds || [])
        .map(adicionalId => ({
          adicionalId,
          quantidade: adicionaisQuantidadeMap[adicionalId] ?? 0,
        }))
        .filter(item => item.quantidade > 0),
    };

    if (editingEventoId) {
      await updateEvento(editingEventoId, payloadBase);
      toast({
        title: "Evento atualizado com sucesso!",
        description: `${payloadBase.titulo} foi atualizado.`,
      });
    } else {
      await addEvento(payloadBase);
      toast({
        title: "Evento cadastrado com sucesso!",
        description: `${payloadBase.titulo} foi adicionado ao calendário.`,
      });
    }

    setShowForm(false);
    setEditingEventoId(null);
    setSelectedEventoId(null);
    setFormData({
      titulo: "",
      clienteId: "",
      clienteNome: "",
      data: "",
      horaInicio: "",
      horaFim: "",
      tipo: "festa",
      status: "pendente",
      observacoes: "",
      valor: 0,
      pacoteId: "",
      convidados: undefined,
      decoracao: "",
      equipeId: "",
      equipeProfissionais: [],
      adicionaisIds: [],
      valorEntrada: undefined,
      formaPagamento: "",
      aniversariantes: [],
    });
    setEventoEquipeProfissionais([]);
    setAdicionaisObservacoesMap({});
    setAdicionaisQuantidadeMap({});
    setValorEditadoManualmente(false);
  };

  const handleEditEvento = (id: string) => {
    const ev = Eventos.find(e => e.id === id);
    if (!ev) {
      console.warn("[handleEditEvento] Evento não encontrado:", id);
      return;
    }

    console.log("[handleEditEvento] Evento encontrado:", {
      clienteId: ev.clienteId,
      pacoteId: ev.pacoteId,
      titulo: ev.titulo,
    });

    // Popula os dados do evento
    setFormData({
      titulo: ev.titulo,
      clienteId: ev.clienteId || "",  // garantir que não é undefined
      clienteNome: ev.clienteNome || "",
      data: ev.data,
      horaInicio: ev.horaInicio,
      horaFim: ev.horaFim || "",
      tipo: ev.tipo === "aniversario" ? "festa" : ev.tipo,
      status: ev.status,
      observacoes: ev.observacoes || "",
      valor: ev.valor || 0,
      pacoteId: ev.pacoteId || "",  // garantir que não é undefined
      convidados: ev.convidados ?? 0,
      decoracao: ev.decoracao || "",
      equipeId: ev.equipeId || "",
      equipeProfissionais: ev.equipeProfissionais || [],
      adicionaisIds: ev.adicionaisIds || [],
      valorEntrada: ev.valorEntrada ?? 0,
      formaPagamento: ev.formaPagamento || "",
      aniversariantes: ev.aniversariantes || [],
    });

    // Carrega os profissionais da equipe se houver
    if (ev.equipeId) {
      const equipeEncontrada = equipes.find(e => e.id === ev.equipeId);
      if (equipeEncontrada) {
        setEventoEquipeProfissionais(
          equipeEncontrada.profissionais.map(p => ({
            id: p.id,
            nome: p.nome,
            quantidade: p.quantidade,
          }))
        );
      }
    } else {
      setEventoEquipeProfissionais(ev.equipeProfissionais ?? []);
    }

    // Carrega as observações e quantidades de adicionais
    const mapFromEventoObs: Record<string, string> = {};
    ev.adicionaisObservacoes?.forEach(item => {
      mapFromEventoObs[item.adicionalId] = item.observacao;
    });
    setAdicionaisObservacoesMap(mapFromEventoObs);

    const mapFromEventoQtd: Record<string, number> = {};
    ev.adicionaisQuantidade?.forEach(item => {
      mapFromEventoQtd[item.adicionalId] = item.quantidade;
    });
    setAdicionaisQuantidadeMap(mapFromEventoQtd);

    setEditingEventoId(id);
    setShowForm(true);
    setSelectedEventoId(null); // ← Fechar detalhes
    setValorEditadoManualmente(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEventoId(null);
    setFormData({
      titulo: "",
      clienteId: "",
      clienteNome: "",
      data: "",
      horaInicio: "",
      horaFim: "",
      tipo: "festa",
      status: "pendente",
      observacoes: "",
      valor: 0,
      pacoteId: "",
      convidados: undefined,
      decoracao: "",
      equipeId: "",
      equipeProfissionais: [],
      adicionaisIds: [],
      valorEntrada: undefined,
      formaPagamento: "",
      aniversariantes: [],
    });
    setEventoEquipeProfissionais([]);
    setAdicionaisObservacoesMap({});
    setAdicionaisQuantidadeMap({});
    setValorEditadoManualmente(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'casamento': return 'bg-purple-100 text-purple-800';
      case 'corporativo': return 'bg-blue-100 text-blue-800';
      case 'festa': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const [showAdicionaisPicker, setShowAdicionaisPicker] = useState(false);

  // NOVO: helpers para detalhes
  const getPacoteById = (id?: string) =>
    id ? pacotes.find(p => p.id === id) : undefined;

  const getEquipeById = (id?: string) =>
    id ? equipes.find(e => e.id === id) : undefined;

  const calcularTotalAdicionalEvento = (
    adicional: (typeof adicionais)[number],
    evento: Evento
  ) => {
    const convidados = evento.convidados ?? 0;

    if (adicional.modelo === "valor_festa") {
      return adicional.valor;
    }

    if (adicional.modelo === "valor_unidade") {
      const qtdItem = evento.adicionaisQuantidade?.find(
        q => q.adicionalId === adicional.id
      );
      const qtd = qtdItem?.quantidade ?? 0;
      return adicional.valor * qtd;
    }

    // valor_pessoa
    return adicional.valor * convidados;
  };

  const selectedEventoRef = useRef<HTMLDivElement>(null);
  const showFormRef = useRef<HTMLDivElement>(null);

  // Auto-scroll quando abre formulário
  useEffect(() => {
    if (showForm && showFormRef.current) {
      setTimeout(() => {
        showFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showForm]);

  // Auto-scroll quando seleciona evento
  useEffect(() => {
    if (selectedEvento && selectedEventoRef.current) {
      setTimeout(() => {
        selectedEventoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [selectedEvento]);

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Eventos</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie seus Eventos e festas
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 flex items-center gap-2"
          onClick={() => {
            if (showForm && !editingEventoId) {
              handleCancelForm();
            } else {
              setShowForm(prev => !prev);
            }
          }}
        >
          <Plus size={18} />
          {showForm ? "Cancelar" : editingEventoId ? "Editar Evento" : "Cadastrar Evento"}
        </Button>
      </div>

      {!showForm && (
        <Card className="mb-6 bg-white border-blue-200">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Pesquisar evento"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <div ref={showFormRef}>
          <Card className="mb-8 border-l-4 border-l-blue-600 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <CardTitle className="text-blue-900">
                {editingEventoId ? "Editar evento" : "Cadastrar evento"}
              </CardTitle>
              <p className="text-xs text-blue-700 mt-1">Configure todos os detalhes do evento</p>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cliente">Cliente: <span className="text-red-500">*</span></Label>
                    <Select value={formData.clienteId} onValueChange={handleClienteSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nome} {cliente.sobrenome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>
                      Aniversariantes / Homenageados:{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddAniversariante}
                    >
                      Adicionar pessoa
                    </Button>
                  </div>

                  {(formData.aniversariantes || []).length === 0 && (
                    <div className="text-xs text-muted-foreground">
                      Adicione pelo menos uma pessoa (ex.: aniversariante ou casal de noivos).
                    </div>
                  )}

                  <div className="space-y-2">
                    {(formData.aniversariantes || []).map((a, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-2 items-center"
                      >
                        <div>
                          <Label className="text-xs" htmlFor={`aniv-nome-${index}`}>
                            Nome
                          </Label>
                          <Input
                            id={`aniv-nome-${index}`}
                            value={a.nome || ""}
                            onChange={e =>
                              handleAniversarianteChange(index, "nome", e.target.value)
                            }
                            placeholder="Ex.: Ana Beatriz"
                          />
                        </div>
                        <div>
                          <Label className="text-xs" htmlFor={`aniv-idade-${index}`}>
                            Idade (opcional)
                          </Label>
                          <Input
                            id={`aniv-idade-${index}`}
                            type="number"
                            min={0}
                            value={a.idade ?? ""}
                            onChange={e =>
                              handleAniversarianteChange(index, "idade", e.target.value)
                            }
                            placeholder="Ex.: 7"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAniversariante(index)}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Proposta: <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.pacoteId}
                      onValueChange={handlePacoteSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a proposta" />
                      </SelectTrigger>
                      <SelectContent>
                        {pacotes.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome} ({p.duracaoHoras}h / {p.convidadosBase} convidados)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="data">Data: <span className="text-red-500">*</span></Label>
                    <Input
                      id="data"
                      type="date"
                      required
                      value={formData.data}
                      onChange={(e) => handleInputChange("data", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="horaInicio">Início: <span className="text-red-500">*</span></Label>
                      <Input
                        id="horaInicio"
                        type="time"
                        required
                        value={formData.horaInicio}
                        onChange={(e) => handleInputChange("horaInicio", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="horaFim">Fim:</Label>
                      <Input
                        id="horaFim"
                        type="time"
                        value={formData.horaFim}
                        onChange={(e) => handleInputChange("horaFim", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {selectedPacote && (diffHorasPacote.hasExtra || diffHorasPacote.hasDeficit) && (
                  <div className="text-xs bg-amber-50 border border-amber-200 rounded px-3 py-2 text-amber-800 space-y-1">
                    <div>
                      Duração selecionada:{" "}
                      <strong>{diffHorasPacote.duracaoHoras.toFixed(2)}h</strong>{" "}
                      (proposta: <strong>{selectedPacote.duracaoHoras}h</strong>)
                    </div>

                    {diffHorasPacote.hasExtra && (
                      <div>
                        {diffHorasPacote.extraInt}{" "}
                        {diffHorasPacote.extraInt === 1 ? "hora extra" : "horas extras"}.
                      </div>
                    )}

                    {diffHorasPacote.hasDeficit && (
                      <div>
                        {diffHorasPacote.deficitInt}{" "}
                        {diffHorasPacote.deficitInt === 1
                          ? "hora a menos que o pacote."
                          : "horas a menos que o pacote."}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="convidados">
                      Convidados: <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="convidados"
                      type="number"
                      value={formData.convidados ?? ""}
                      onChange={(e) => handleConvidadosChange(e.target.value)}
                      placeholder={
                        selectedPacote
                          ? `Mínimo ${selectedPacote.convidadosBase}`
                          : "Quantidade de convidados"
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="decoracao">Decoração:</Label>
                    <Input
                      id="decoracao"
                      value={formData.decoracao || ""}
                      onChange={(e) => handleInputChange("decoracao", e.target.value)}
                      placeholder="Decoração (ex: Jardim)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Equipe:</Label>
                  <Select
                    value={formData.equipeId}
                    onValueChange={handleEquipeSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a equipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipes.map(equipe => (
                        <SelectItem key={equipe.id} value={equipe.id}>
                          {equipe.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {eventoEquipeProfissionais.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {eventoEquipeProfissionais.map(p => (
                        <div
                          key={p.id}
                          className="flex justify-between items-center text-sm border rounded px-3 py-2 bg-muted/60"
                        >
                          <span className="font-medium">{p.nome}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Qtd.</span>
                            <Input
                              type="number"
                              min={0}
                              value={p.quantidade}
                              onChange={e =>
                                handleEquipeProfissionalChange(
                                  p.id,
                                  Number(e.target.value) || 0
                                )
                              }
                              className="w-16 h-8 text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Adicionais:</Label>

                  {adicionais.length === 0 ? (
                    <div className="text-xs text-muted-foreground">
                      Nenhum adicional cadastrado. Cadastre em Propostas &gt; Adicionais.
                    </div>
                  ) : (
                    <>
                      {selecionadosAdicionais.length === 0 ? (
                        <div className="text-xs text-muted-foreground">
                          Nenhum adicional selecionado.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {selecionadosAdicionais.map(a => (
                            <span
                              key={a.id}
                              className="px-2 py-1 rounded-full bg-primary/5 border border-primary/40 text-primary"
                            >
                              {a.nome}
                            </span>
                          ))}
                        </div>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 text-xs md:text-sm"
                        onClick={() => setShowAdicionaisPicker(true)}
                      >
                        Selecionar adicionais
                      </Button>

                      {showAdicionaisPicker && (
                        <div className="mt-3 border rounded-md bg-muted/40">
                          <div className="px-3 py-2 border-b text-xs text-muted-foreground">
                            Marque os adicionais desejados, preencha as observações/quantidades e clique em &quot;Aplicar seleção&quot;.
                          </div>

                          <div className="max-h-64 overflow-y-auto divide-y">
                            {adicionais.map(a => {
                              const checked = (formData.adicionaisIds || []).includes(a.id);
                              const obsValue = adicionaisObservacoesMap[a.id] || "";
                              const qtdValue = adicionaisQuantidadeMap[a.id] ?? 0;
                              return (
                                <div key={a.id} className="px-3 py-2 text-xs md:text-sm">
                                  <label className="flex items-center justify-between cursor-pointer hover:bg-muted/40 rounded px-1 py-1">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => handleAdicionalToggle(a.id)}
                                        className="h-4 w-4"
                                      />
                                      <div>
                                        <div className="font-medium text-sm">{a.nome}</div>
                                        <div className="text-muted-foreground text-xs">
                                          {a.modelo === "valor_pessoa"
                                            ? "Valor por pessoa"
                                            : a.modelo === "valor_unidade"
                                            ? "Valor por unidade"
                                            : "Valor por festa"}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-xs font-medium whitespace-nowrap ml-2">
                                      R$ {a.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </div>
                                  </label>

                                  {checked && a.modelo === "valor_unidade" && (
                                    <div className="mt-2 pl-6 flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">Quantidade:</span>
                                      <Input
                                        type="number"
                                        min={0}
                                        value={qtdValue === 0 ? "" : qtdValue}
                                        onChange={e =>
                                          handleAdicionalQuantidadeChange(a.id, e.target.value)
                                        }
                                        className="w-24 h-8 text-xs"
                                        placeholder="Qtd."
                                      />
                                    </div>
                                  )}

                                  {checked && a.observacao && (
                                    <div className="mt-2 pl-6">
                                      <Textarea
                                        rows={2}
                                        placeholder="Observação para este adicional"
                                        value={obsValue}
                                        onChange={e =>
                                          handleAdicionalObservacaoChange(a.id, e.target.value)
                                        }
                                        className="text-xs md:text-sm"
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex justify-end gap-2 px-3 py-2 border-t">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAdicionaisPicker(false)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              className="bg-primary hover:bg-primary-hover text-primary-foreground"
                              onClick={() => setShowAdicionaisPicker(false)}
                            >
                              Aplicar seleção
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valorEvento">Valor do evento (R$):</Label>
                    <Input
                      id="valorEvento"
                      type="number"
                      min={0}
                      step="0.01"
                      value={formData.valor ?? 0}
                      onChange={e => {
                        setValorEditadoManualmente(true);
                        handleInputChange(
                          "valor",
                          e.target.value === "" ? 0 : parseFloat(e.target.value) || 0
                        );
                      }}
                      placeholder={
                        valorCalculado
                          ? `Sugestão: R$ ${valorCalculado.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}`
                          : "Informe o valor do evento"
                      }
                    />

                    {selectedPacote && hasDiffValor && (
                      <div className="text-[11px] mt-1 px-3 py-2 rounded border bg-amber-50 border-amber-200 text-amber-800">
                        O valor sugerido para este evento é{" "}
                        <strong>
                          R$ {valorCalculado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </strong>
                        , mas você definiu{" "}
                        <strong>
                          R$ {valorDigitado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </strong>
                        . Diferença de{" "}
                        <strong>
                          R$ {Math.abs(diffValor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </strong>
                        .{" "}
                        {diffValor < 0
                          ? "Verifique se todos os custos (ex.: convidados extras e adicionais) estão contemplados."
                          : "Lembre-se de alinhar este valor com o cliente e registrar as condições em forma de pagamento/contrato."}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valorEntrada">Entrada (R$):</Label>
                    <Input
                      id="valorEntrada"
                      type="number"
                      min={0}
                      step="0.01"
                      value={formData.valorEntrada ?? ""}
                      onChange={e =>
                        handleInputChange(
                          "valorEntrada",
                          e.target.value === "" ? undefined : parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="Valor da entrada"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formaPagamento">
                      Formas de pagamento: <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="formaPagamento"
                      value={formData.formaPagamento || ""}
                      onChange={e => handleInputChange("formaPagamento", e.target.value)}
                      placeholder="Ex.: Pix"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações:</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange("observacoes", e.target.value)}
                    placeholder="Informações adicionais sobre o evento"
                  />
                </div>

                <div className="flex justify-center pt-4 gap-2">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-primary-foreground px-8"
                  >
                    {editingEventoId ? "Salvar alterações" : "Cadastrar Evento"}
                  </Button>
                  {editingEventoId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelForm}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {!showForm && (
        <div className="space-y-4">
          {filteredEventos.length === 0 ? (
            <Card className="bg-white border-blue-200">
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  {searchTerm ? "Nenhum evento encontrado com os critérios de busca." : "Nenhum evento cadastrado ainda."}
                </div>
                {!searchTerm && (
                  <Button 
                    className="mt-4 bg-primary hover:bg-primary-hover text-primary-foreground"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus size={16} className="mr-2" />
                    Cadastrar primeiro evento
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredEventos.map((evento) => (
                <Card 
                  key={evento.id} 
                  className="bg-white border-blue-200 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer"
                  onClick={() => setSelectedEventoId(evento.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Coluna Principal */}
                      <div className="flex-1 space-y-3">
                        {/* Título e Status */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-lg text-blue-900">{evento.titulo}</h3>
                          <Badge className={getTipoColor(evento.tipo)} variant="outline">
                            {evento.tipo}
                          </Badge>
                          <Badge className={getStatusColor(evento.status)} variant="outline">
                            {evento.status}
                          </Badge>
                        </div>

                        {/* Grid de informações principais */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2 bg-slate-50 rounded px-3 py-2">
                            <Calendar size={16} className="text-blue-600 flex-shrink-0" />
                            <span className="text-slate-700">
                              {format(parseISO(evento.data), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 bg-slate-50 rounded px-3 py-2">
                            <Clock size={16} className="text-blue-600 flex-shrink-0" />
                            <span className="text-slate-700">
                              {evento.horaInicio}{evento.horaFim ? ` - ${evento.horaFim}` : ""}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 bg-slate-50 rounded px-3 py-2">
                            <Users size={16} className="text-blue-600 flex-shrink-0" />
                            <span className="text-slate-700">{evento.convidados} convidados</span>
                          </div>

                          <div className="flex items-center gap-2 bg-blue-50 rounded px-3 py-2 border border-blue-200">
                            <span className="text-blue-600 font-bold">
                              R$ {evento.valor?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0"}
                            </span>
                          </div>
                        </div>

                        {/* Cliente e Decoração */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-blue-600 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-slate-500 font-semibold">Cliente</div>
                              <div className="text-slate-700 font-medium">{evento.clienteNome}</div>
                            </div>
                          </div>

                          {evento.decoracao && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 font-semibold">Decoração:</span>
                              <span className="text-slate-700 bg-orange-50 px-2 py-1 rounded text-xs font-medium">
                                {evento.decoracao}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Observações */}
                        {evento.observacoes && (
                          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
                            <span className="font-semibold">📝 Obs:</span> {evento.observacoes.substring(0, 100)}
                            {evento.observacoes.length > 100 ? "..." : ""}
                          </div>
                        )}
                      </div>

                      {/* Coluna de Ações */}
                      <div className="flex flex-col gap-2 ml-2">
                        {evento.status === "pendente" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 whitespace-nowrap"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateEvento(evento.id, { status: "confirmado" });
                            }}
                          >
                            <CheckCircle2 size={14} className="mr-1" />
                            Confirmar
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEventoId(evento.id);
                          }}
                        >
                          <Edit size={14} className="mr-1" />
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedEvento && (
        <div ref={selectedEventoRef}>
          <section className="mt-6">
            <Card className="border-l-4 border-l-blue-600 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-3">
                      <span>{selectedEvento.titulo}</span>
                      <Badge className={getStatusColor(selectedEvento.status)}>
                        {selectedEvento.status}
                      </Badge>
                      <Badge className={getTipoColor(selectedEvento.tipo)}>
                        {selectedEvento.tipo}
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <Calendar size={14} />
                      {format(parseISO(selectedEvento.data), "dd/MM/yyyy", { locale: ptBR })} •{" "}
                      <Clock size={14} />
                      {selectedEvento.horaInicio}
                      {selectedEvento.horaFim && ` - ${selectedEvento.horaFim}`} •{" "}
                      <MapPin size={14} />
                      {selectedEvento.clienteNome}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div className="font-medium">Valor total</div>
                    <div className="text-lg font-semibold text-foreground">
                      R$ {selectedEvento.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                    {selectedEvento.valorEntrada !== undefined && (
                      <div className="mt-1 space-y-0.5">
                        <div>
                          Entrada:{" "}
                          <span className="font-medium">
                            R$ {(selectedEvento.valorEntrada || 0).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div>
                          Saldo:{" "}
                          <span className="font-medium">
                            R$ {(
                              selectedEvento.valor - (selectedEvento.valorEntrada || 0)
                            ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-4 text-sm">
                {/* Grid de 2 colunas principais */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Coluna esquerda */}
                  <div className="space-y-4">
                    {/* Cliente / Proposta */}
                    <div className="rounded-lg border bg-slate-50/60 p-3 space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Informações principais
                      </h3>
                      <div>
                        <span className="font-medium text-foreground">Cliente: </span>
                        {selectedEvento.clienteNome}
                      </div>
                      {(() => {
                        const pacote = getPacoteById(selectedEvento.pacoteId);
                        if (!pacote) return null;
                        return (
                          <div className="mt-1">
                            <span className="font-medium text-foreground">Proposta: </span>
                            {pacote.nome}
                            <div className="text-xs text-muted-foreground mt-1 space-y-0.5 ml-1">
                              <div>• Duração: {pacote.duracaoHoras}h</div>
                              <div>• Convidados base: {pacote.convidadosBase}</div>
                              <div>
                                • Valor base: R$ {pacote.valorBase.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </div>
                              <div>
                                • Valor por pessoa: R$ {pacote.valorPorPessoa.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      {selectedEvento.convidados !== undefined && (
                        <div className="mt-1">
                          <span className="font-medium text-foreground">Convidados: </span>
                          {selectedEvento.convidados}
                        </div>
                      )}
                      {selectedEvento.decoracao && (
                        <div>
                          <span className="font-medium text-foreground">Decoração: </span>
                          {selectedEvento.decoracao}
                        </div>
                      )}
                    </div>

                    {/* Aniversariantes */}
                    {selectedEvento.aniversariantes &&
                      selectedEvento.aniversariantes.length > 0 && (
                        <div className="rounded-lg border bg-slate-50/60 p-3">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                            Aniversariantes / Homenageados
                          </h3>
                          <ul className="space-y-1 text-sm">
                            {selectedEvento.aniversariantes.map((a, idx) => (
                              <li
                                key={idx}
                                className="flex items-center justify-between border rounded px-2 py-1 bg-white/70"
                              >
                                <span className="font-medium">{a.nome}</span>
                                {a.idade !== undefined && (
                                  <span className="text-xs text-muted-foreground">
                                    {a.idade} anos
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>

                  {/* Coluna direita */}
                  <div className="space-y-4">
                    {/* Equipe */}
                    {(() => {
                      const equipe = getEquipeById(selectedEvento.equipeId);
                      if (!equipe && !selectedEvento.equipeProfissionais?.length) return null;

                      return (
                        <div className="rounded-lg border bg-slate-50/60 p-3 space-y-2">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Equipe
                          </h3>
                          {equipe && (
                            <div>
                              <span className="font-medium text-foreground">Equipe principal: </span>
                              {equipe.nome}
                            </div>
                          )}
                          {selectedEvento.equipeProfissionais &&
                            selectedEvento.equipeProfissionais.length > 0 && (
                              <div className="mt-1">
                                <span className="font-medium text-foreground">
                                  Profissionais:
                                </span>
                                <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                                  {selectedEvento.equipeProfissionais.map((p) => (
                                    <li key={p.id}>
                                      {p.nome}{" "}
                                      <span className="text-muted-foreground">
                                        (Qtd.: {p.quantidade})
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                      );
                    })()}

                    {/* Adicionais */}
                    {selectedEvento.adicionaisIds &&
                      selectedEvento.adicionaisIds.length > 0 && (
                        <div className="rounded-lg border bg-slate-50/60 p-3 space-y-2">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Adicionais contratados
                          </h3>
                          <ul className="space-y-2 text-xs">
                            {selectedEvento.adicionaisIds.map((adicionalId) => {
                              const adicional = adicionais.find((a) => a.id === adicionalId);
                              if (!adicional) return null;

                              const obsItem = selectedEvento.adicionaisObservacoes?.find(
                                (o) => o.adicionalId === adicionalId
                              );
                              const qtdItem = selectedEvento.adicionaisQuantidade?.find(
                                (q) => q.adicionalId === adicionalId
                              );
                              const totalAdicional = calcularTotalAdicionalEvento(
                                adicional,
                                selectedEvento
                              );

                              const modeloLabel =
                                adicional.modelo === "valor_pessoa"
                                  ? "por pessoa"
                                  : adicional.modelo === "valor_unidade"
                                  ? "por unidade"
                                  : "por festa";

                              return (
                                <li
                                  key={adicionalId}
                                  className="rounded border bg-white/80 px-2 py-1.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="font-medium">{adicional.nome}</span>{" "}
                                      <span className="text-muted-foreground">
                                        ({modeloLabel})
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      R$ {totalAdicional.toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                      })}
                                    </div>
                                  </div>
                                  <div className="text-[11px] text-muted-foreground mt-0.5">
                                    Valor base: R$ {adicional.valor.toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                    })}
                                    {qtdItem && qtdItem.quantidade > 0 && (
                                      <> • Qtd.: {qtdItem.quantidade}</>
                                    )}
                                  </div>
                                  {obsItem?.observacao && (
                                    <div className="text-[11px] text-muted-foreground mt-0.5">
                                      Obs.: {obsItem.observacao}
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>

                {/* Pagamento e Observações */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedEvento.formaPagamento && (
                    <div className="rounded-lg border bg-slate-50/60 p-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                        Pagamento
                      </h3>
                      <p className="text-sm">{selectedEvento.formaPagamento}</p>
                    </div>
                  )}

                  {selectedEvento.observacoes && (
                    <div className="rounded-lg border bg-slate-50/60 p-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                        Observações gerais
                      </h3>
                      <p className="text-sm whitespace-pre-line">
                        {selectedEvento.observacoes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Botões */}
                <div className="mt-2 flex flex-wrap gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedEventoId(null)}
                  >
                    Voltar
                  </Button>

                  <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      handleEditEvento(selectedEvento.id);
                    }}
                  >
                    Editar
                  </Button>

                  {selectedEvento.status === "pendente" && (
                    <Button
                      type="button"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        updateEvento(selectedEvento.id, { status: "confirmado" });
                      }}
                    >
                      <CheckCircle2 size={16} className="mr-1" />
                      Confirmar festa
                    </Button>
                  )}

                  <Button
                    type="button"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      removeEvento(selectedEvento.id);
                      setSelectedEventoId(null);
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
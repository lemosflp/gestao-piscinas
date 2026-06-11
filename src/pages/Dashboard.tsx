import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext";
import { Calendar, Users, PartyPopper, CheckCircle2, Clock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { format, isAfter, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { usePacotesContext } from "@/contexts/PacotesContext";
import { useAdicionaisContext } from "@/contexts/AdicionaisContext";
import { Package, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { clientes, Eventos } = useAppContext();
  const { pacotes } = usePacotesContext();
  const { adicionais } = useAdicionaisContext();
  const [showFinancialValues, setShowFinancialValues] = useState(false);

  // métricas simples
  const totalClientes = clientes.length;
  const totalEventos = Eventos.length;
  const totalConfirmados = Eventos.filter(e => e.status === "confirmado").length;
  const totalPendentes = Eventos.filter(e => e.status === "pendente").length;

  const faturamentoEstimado = useMemo(
    () => Eventos.reduce((sum, e) => sum + (e.valor || 0), 0),
    [Eventos]
  );

  const proximosEventos = useMemo(() => {
    const now = new Date();
    return [...Eventos]
      .filter(e => isAfter(parseISO(e.data), now))
      .sort((a, b) => parseISO(a.data).getTime() - parseISO(b.data).getTime())
      .slice(0, 4);
  }, [Eventos]);

  // Calcular valores do mês atual
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const EventosDoMes = useMemo(() => {
    return Eventos.filter(e => {
      const date = parseISO(e.data);
      return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
    });
  }, [Eventos]);

  const faturamentoMes = useMemo(
    () => EventosDoMes.reduce((sum, e) => sum + (e.valor || 0), 0),
    [EventosDoMes]
  );

  const entradasMes = useMemo(
    () => EventosDoMes.reduce((sum, e) => sum + (e.valorEntrada || 0), 0),
    [EventosDoMes]
  );

  const saldoMes = faturamentoMes - entradasMes;
  
  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Bem-vindo ao seu painel de controle</p>
      </div>


      {/* Grid de conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Próximos Eventos */}
        <Card className="border-l-4 border-l-blue-600 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Calendar size={20} />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {proximosEventos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum evento próximo</p>
                <Button
                  size="sm"
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate("/Eventos")}
                >
                  + Cadastrar Evento
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {proximosEventos.map(evento => (
                  <div
                    key={evento.id}
                    className="p-3 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-white hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-blue-900">{evento.titulo}</h4>
                        <p className="text-xs text-slate-600 mt-1">
                          📅 {new Date(evento.data).toLocaleDateString('pt-BR')} às {evento.horaInicio}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        evento.status === 'confirmado' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {evento.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo de Vendas - Mês Atual */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <TrendingUp size={20} />
                Resumo Financeiro - {format(new Date(), "MMMM/yyyy", { locale: ptBR })}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFinancialValues(!showFinancialValues)}
                className="text-slate-600 hover:text-blue-700"
              >
                {showFinancialValues ? (
                  <Eye size={18} />
                ) : (
                  <EyeOff size={18} />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg">
                <p className="text-xs text-slate-600">Valor Total em Eventos</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {showFinancialValues 
                    ? `R$ ${faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : "••••••"
                  }
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-lg">
                <p className="text-xs text-slate-600">Entradas Recebidas</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {showFinancialValues 
                    ? `R$ ${entradasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : "••••••"
                  }
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-lg">
                <p className="text-xs text-slate-600">Saldo a Receber</p>
                <p className="text-2xl font-bold text-orange-700 mt-1">
                  {showFinancialValues 
                    ? `R$ ${saldoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : "••••••"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-200">
          <CardTitle className="text-blue-900">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/Eventos")}
            >
              + Novo Evento
            </Button>
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/clientes")}
            >
              + Novo Cliente
            </Button>
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/Relatorios")}
            >
              Gerar Relatório
            </Button>
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/calendario")}
            >
              Ver Calendário
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
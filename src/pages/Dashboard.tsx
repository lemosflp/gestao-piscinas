import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Eye, EyeOff } from "lucide-react";
import { format, isAfter, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabaseClient";

interface ProximoServico {
  id: string;
  tipo_servico: string | null;
  data_agendamento: string;
  horario: string | null;
  status: string | null;
  cliente_nome: string;
  endereco_piscina: string | null;
  cidade_piscina: string | null;
}

interface ResumoFinanceiro {
  valorTotalMes: number;
  totalPagoMes: number;
  saldoReceberMes: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [showFinancialValues, setShowFinancialValues] = useState(false);
  const [proximosServicos, setProximosServicos] = useState<ProximoServico[]>([]);
  const [resumo, setResumo] = useState<ResumoFinanceiro>({ valorTotalMes: 0, totalPagoMes: 0, saldoReceberMes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        // obter usuário atual (necessário para RLS)
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) console.error('[Dashboard] erro ao obter usuário:', userErr);
        const userId = userData?.user?.id ?? null;
        if (!userId) {
          console.warn('[Dashboard] usuário não autenticado');
          setProximosServicos([]);
          setResumo({ valorTotalMes: 0, totalPagoMes: 0, saldoReceberMes: 0 });
          setLoading(false);
          return;
        }

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const mesInicio = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
        const lastDay = new Date(currentYear, currentMonth, 0).getDate();
        const mesFim = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

        // --- Próximos serviços ---
        const { data: servicosData, error: servicosError } = await supabase
          .from("servicos")
          .select(`
          id, tipo_servico, data_agendamento, horario, status,
          clientes(nome, sobrenome, cidade),
          piscinas(endereco)
        `)
          .eq('user_id', userId)
          .gte("data_agendamento", now.toISOString().split("T")[0])
          .order("data_agendamento", { ascending: true })
          .limit(4);

        if (servicosError) console.error("Erro ao buscar serviços:", servicosError);

        const proximosMapped: ProximoServico[] = (servicosData ?? []).map((s: any) => ({
          id: s.id,
          tipo_servico: s.tipo_servico,
          data_agendamento: s.data_agendamento,
          horario: s.horario,
          status: s.status,
          cliente_nome: s.clientes ? `${s.clientes.nome} ${s.clientes.sobrenome}` : "—",
          endereco_piscina: s.piscinas?.endereco ?? null,
          cidade_piscina: s.clientes?.cidade ?? null,
        }));
        setProximosServicos(proximosMapped);

        // --- Cobranças do mês ---
        const { data: cobrancasData, error: cobrancasError } = await supabase
          .from("cobrancas")
          .select("id, valor, status, data_vencimento")
          .eq('user_id', userId)
          .gte("data_vencimento", mesInicio)
          .lte("data_vencimento", mesFim);

        if (cobrancasError) console.error("Erro ao buscar cobranças:", cobrancasError);

        const cobrancas = cobrancasData ?? [];
        const valorTotalMes = (cobrancas as any[]).reduce((s: number, c: any) => s + (Number(c.valor) || 0), 0);
        const cobrancaIds = cobrancas.map((c: any) => c.id);

        // --- Pagamentos das cobranças do mês ---
        let totalPagoMes = 0;
        if (cobrancaIds.length > 0) {
          const { data: pagamentosData, error: pagamentosError } = await supabase
            .from("pagamentos")
            .select("valor_pago")
            .eq('user_id', userId)
            .in("cobranca_id", cobrancaIds);

          if (pagamentosError) console.error("Erro ao buscar pagamentos:", pagamentosError);

          totalPagoMes = (pagamentosData ?? []).reduce((s: number, p: any) => s + (Number(p.valor_pago) || 0), 0);
        }

        setResumo({
          valorTotalMes,
          totalPagoMes,
          saldoReceberMes: Math.max(0, valorTotalMes - totalPagoMes),
        });
      } catch (err) {
        console.error("fetchDashboard - erro:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Bem-vindo ao seu painel de controle</p>
      </div>

      {/* Grid de conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Próximos Serviços */}
        <Card className="border-l-4 border-l-blue-600 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Calendar size={20} />
              Próximos Serviços
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : proximosServicos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum serviço próximo</p>
                <Button
                  size="sm"
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate("/Eventos")}
                >
                  + Agendar Serviço
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {proximosServicos.map(servico => (
                  <div
                    key={servico.id}
                    onClick={() => navigate('/eventos', { state: { showForm: false, selectedServico: true, pagamentoModal: false, viewId: servico.id } })}
                    className="cursor-pointer flex p-3 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-white hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-blue-900">{servico.cliente_nome}</h4>
                        <p className="text-xs text-slate-600 mt-1">
                          {servico.tipo_servico && <span className="mr-2">🔧 {servico.tipo_servico}</span>}
                          📅 {servico.data_agendamento
                            ? new Date(servico.data_agendamento + "T00:00:00").toLocaleDateString("pt-BR")
                            : "—"}
                          {servico.horario ? ` às ${servico.horario}` : ""}
                        </p>
                        {servico.endereco_piscina && (
                          <p className="text-xs text-slate-500 mt-0.5">📍 {servico.endereco_piscina} / {servico.cidade_piscina}</p>
                        )}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        servico.status === "confirmado"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {servico.status ?? "pendente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
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
                {showFinancialValues ? <Eye size={18} /> : <EyeOff size={18} />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg">
                  <p className="text-xs text-slate-600">Valor Total em Serviços</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">
                    {showFinancialValues
                      ? `R$ ${resumo.valorTotalMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : "••••••"}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-lg">
                  <p className="text-xs text-slate-600">Entradas Recebidas</p>
                  <p className="text-2xl font-bold text-green-700 mt-1">
                    {showFinancialValues
                      ? `R$ ${resumo.totalPagoMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : "••••••"}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-lg">
                  <p className="text-xs text-slate-600">Saldo a Receber</p>
                  <p className="text-2xl font-bold text-orange-700 mt-1">
                    {showFinancialValues
                      ? `R$ ${resumo.saldoReceberMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : "••••••"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-200">
          <CardTitle className="text-blue-900">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/Eventos")}
            >
              + Novo Serviço
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
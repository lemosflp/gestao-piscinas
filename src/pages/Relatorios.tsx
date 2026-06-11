import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Calendar, DollarSign, TrendingUp, Users, Filter } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAppContext } from "@/contexts/AppContext";
import { usePacotesContext } from "@/contexts/PacotesContext";
import * as XLSX from "xlsx";

export default function Relatorios() {
  const { Eventos } = useAppContext();
  const { pacotes } = usePacotesContext();

  // Estado dos filtros
  const [reportType, setReportType] = useState<string>("geral");
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");

  // Gerar lista de anos disponíveis
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    Eventos.forEach(ev => {
      const year = parseISO(ev.data).getFullYear();
      years.add(year);
    });
    // Adiciona ano atual se não houver Eventos
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [Eventos]);

  // Filtrar Eventos baseado nos critérios
  const filteredEventos = useMemo(() => {
    let result = [...Eventos];

    switch (reportType) {
      case "por-ano":
        result = result.filter(ev => {
          const eventYear = parseISO(ev.data).getFullYear();
          return eventYear === Number(selectedYear);
        });
        break;

      case "por-mes":
        result = result.filter(ev => {
          const date = parseISO(ev.data);
          return (
            date.getFullYear() === Number(selectedYear) &&
            date.getMonth() + 1 === Number(selectedMonth)
          );
        });
        break;

      case "por-pacote":
        result = result.filter(ev => ev.pacoteId === selectedPackage);
        if (selectedYear && selectedYear !== "todos") {
          result = result.filter(ev => {
            const eventYear = parseISO(ev.data).getFullYear();
            return eventYear === Number(selectedYear);
          });
        }
        break;

      case "por-pacote-mes":
        result = result.filter(
          ev =>
            ev.pacoteId === selectedPackage &&
            parseISO(ev.data).getFullYear() === Number(selectedYear) &&
            parseISO(ev.data).getMonth() + 1 === Number(selectedMonth)
        );
        break;

      case "contratos":
        result = result.filter(ev => ev.status === "confirmado");
        break;

      case "pendentes":
        result = result.filter(ev => ev.status === "pendente");
        break;

      default:
        // geral - sem filtros
        break;
    }

    // Filtrar por status adicional se aplicável
    if (selectedStatus !== "todos" && reportType !== "contratos" && reportType !== "pendentes") {
      result = result.filter(ev => ev.status === selectedStatus);
    }

    return result;
  }, [Eventos, reportType, selectedYear, selectedMonth, selectedPackage, selectedStatus]);

  // Cálculos
  const totalReceita = filteredEventos.reduce((total, ev) => total + (ev.valor || 0), 0);
  const totalEntradas = filteredEventos.reduce((total, ev) => total + (ev.valorEntrada || 0), 0);
  const totalSaldo = totalReceita - totalEntradas;
  const EventosConfirmados = filteredEventos.filter(ev => ev.status === "confirmado").length;
  const EventosPendentes = filteredEventos.filter(ev => ev.status === "pendente").length;

  // Receita por pacote
  const receitaPorPacote = useMemo(() => {
    return filteredEventos.reduce(
      (acc, ev) => {
        const pacote = pacotes.find(p => p.id === ev.pacoteId);
        const pacoteName = pacote?.nome || "Sem pacote";
        acc[pacoteName] = (acc[pacoteName] || 0) + (ev.valor || 0);
        return acc;
      },
      {} as Record<string, number>
    );
  }, [filteredEventos, pacotes]);

  // Média de valor por evento
  const mediaValor =
    filteredEventos.length > 0 ? totalReceita / filteredEventos.length : 0;

  // Função para baixar relatório como CSV
  const downloadRelatorio = () => {
    let csv = "RELATÓRIO DE Eventos\n";
    csv += `Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}\n\n`;

    csv += "RESUMO GERAL\n";
    csv += `Período: ${
      reportType === "por-mes"
        ? `${selectedMonth}/${selectedYear}`
        : reportType === "por-ano"
        ? selectedYear
        : reportType === "por-pacote"
        ? pacotes.find(p => p.id === selectedPackage)?.nome || "N/A"
        : "Geral"
    }\n`;
    csv += `Total de Eventos: ${filteredEventos.length}\n`;
    csv += `Confirmados: ${EventosConfirmados}\n`;
    csv += `Pendentes: ${EventosPendentes}\n`;
    csv += `Receita Total: R$ ${totalReceita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
    csv += `Entradas: R$ ${totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
    csv += `Saldo: R$ ${totalSaldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
    csv += `Média por Evento: R$ ${mediaValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\n`;

    csv += "DETALHES DOS Eventos\n";
    csv += "Data,Título,Cliente,Pacote,Status,Convidados,Valor,Entrada\n";
    filteredEventos.forEach(ev => {
      const pacote = pacotes.find(p => p.id === ev.pacoteId)?.nome || "N/A";
      csv += `"${format(parseISO(ev.data), "dd/MM/yyyy")}","${ev.titulo}","${ev.clienteNome}","${pacote}","${ev.status}","${ev.convidados}","R$ ${ev.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}","R$ ${(ev.valorEntrada || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}"\n`;
    });

    const element = document.createElement("a");
    element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    element.setAttribute("download", `relatorio_${format(new Date(), "dd-MM-yyyy-HHmm")}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Função para baixar relatório como Excel
  const downloadRelatorioExcel = () => {
    const dados = filteredEventos.map(ev => {
      const pacote = pacotes.find(p => p.id === ev.pacoteId)?.nome || "N/A";
      return {
        "Data": format(parseISO(ev.data), "dd/MM/yyyy"),
        "Título": ev.titulo,
        "Cliente": ev.clienteNome,
        "Pacote": pacote,
        "Status": ev.status,
        "Convidados": ev.convidados,
        "Valor": `R$ ${ev.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        "Entrada": `R$ ${(ev.valorEntrada || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        "Saldo": `R$ ${(ev.valor - (ev.valorEntrada || 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
      };
    });

    // Criar workbook
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Eventos");

    // Adicionar resumo em outra aba
    const resumo = [
      ["RESUMO GERAL"],
      [""],
      ["Período", 
        reportType === "por-mes"
          ? `${selectedMonth}/${selectedYear}`
          : reportType === "por-ano"
          ? selectedYear
          : reportType === "por-pacote"
          ? pacotes.find(p => p.id === selectedPackage)?.nome || "N/A"
          : "Geral"
      ],
      ["Total de Eventos", filteredEventos.length],
      ["Confirmados", EventosConfirmados],
      ["Pendentes", EventosPendentes],
      ["Receita Total", `R$ ${totalReceita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
      ["Entradas", `R$ ${totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
      ["Saldo", `R$ ${totalSaldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
      ["Média por Evento", `R$ ${mediaValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
      ["Taxa de Confirmação", `${filteredEventos.length > 0 ? ((EventosConfirmados / filteredEventos.length) * 100).toFixed(0) : "0"}%`]
    ];

    const wsResumo = XLSX.utils.aoa_to_sheet(resumo);
    XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo", 0);

    // Definir larguras das colunas
    ws["!cols"] = [
      { wch: 12 },
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];

    // Baixar arquivo
    XLSX.writeFile(wb, `relatorio_${format(new Date(), "dd-MM-yyyy-HHmm")}.xlsx`);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground mt-2">Análises e métricas do seu negócio</p>
      </div>

      {/* Controles de Filtro */}
      <Card className="mb-6 border-l-4 border-l-blue-600 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Filter size={20} />
            Gerar Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">
                Tipo de Relatório
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Geral (Todos)</SelectItem>
                  <SelectItem value="por-ano">Por Ano</SelectItem>
                  <SelectItem value="por-mes">Por Mês</SelectItem>
                  <SelectItem value="por-pacote">Por Pacote</SelectItem>
                  <SelectItem value="por-pacote-mes">Pacote + Mês</SelectItem>
                  <SelectItem value="contratos">Contratos Fechados</SelectItem>
                  <SelectItem value="pendentes">Eventos Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(reportType === "por-ano" ||
              reportType === "por-mes" ||
              reportType === "por-pacote" ||
              reportType === "por-pacote-mes") && (
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Ano
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(reportType === "por-mes" || reportType === "por-pacote-mes") && (
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Mês
                </label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <SelectItem key={month} value={String(month)}>
                        {format(new Date(2024, month - 1), "MMMM", { locale: ptBR })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(reportType === "por-pacote" || reportType === "por-pacote-mes") && (
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Pacote
                </label>
                <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pacotes.map(pacote => (
                      <SelectItem key={pacote.id} value={pacote.id}>
                        {pacote.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {reportType !== "contratos" && reportType !== "pendentes" && (
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Status
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="confirmado">Confirmados</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-end gap-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={downloadRelatorioExcel}
              >
                <Download size={16} className="mr-2" />
                Excel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={downloadRelatorio}
              >
                <Download size={16} className="mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="bg-white border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Eventos
              </CardTitle>
              <FileText size={16} className="text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{filteredEventos.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {EventosConfirmados} confirmados, {EventosPendentes} pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Total
              </CardTitle>
              <DollarSign size={16} className="text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceita.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Média: R$ {mediaValor.toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Entradas Recebidas
              </CardTitle>
              <TrendingUp size={16} className="text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {totalEntradas.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalEntradas > 0 ? `${((totalEntradas / totalReceita) * 100).toFixed(1)}% do total` : "Nenhuma"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo a Receber
              </CardTitle>
              <Calendar size={16} className="text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              R$ {totalSaldo.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalSaldo > 0 ? `${((totalSaldo / totalReceita) * 100).toFixed(1)}% pendente` : "Quitado"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Confirmação
              </CardTitle>
              <Users size={16} className="text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">
              {filteredEventos.length > 0
                ? `${((EventosConfirmados / filteredEventos.length) * 100).toFixed(0)}%`
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              De todos os Eventos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Receita por Pacote */}
      {Object.keys(receitaPorPacote).length > 0 && (
        <Card className="mb-8 bg-white border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <CardTitle>Receita por Pacote</CardTitle>
              <div className="flex gap-2">
                {reportType === "geral" || reportType === "por-ano" || reportType === "por-mes" ? (
                  <>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map(year => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {reportType === "por-mes" && (
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <SelectItem key={month} value={String(month)}>
                              {format(new Date(2024, month - 1), "MMMM", { locale: ptBR })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {Object.entries(receitaPorPacote)
                .sort(([, a], [, b]) => b - a)
                .map(([pacote, valor]) => {
                  const percentage = (valor / totalReceita) * 100;
                  const count = filteredEventos.filter(
                    ev => (pacotes.find(p => p.id === ev.pacoteId)?.nome || "Sem pacote") === pacote
                  ).length;

                  return (
                    <div key={pacote} className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="font-medium w-32 truncate text-sm" title={pacote}>
                          {pacote}
                        </span>
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            className="h-2 bg-green-600 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right ml-4 w-44">
                        <div className="font-semibold text-slate-800">
                          R$ {valor.toLocaleString("pt-BR")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% ({count} evento{count !== 1 ? "s" : ""})
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Eventos */}
      {filteredEventos.length > 0 && (
        <Card className="bg-white border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <CardTitle>Detalhamento dos Eventos</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-300">
                    <th className="text-left p-2 font-semibold text-slate-700">Data</th>
                    <th className="text-left p-2 font-semibold text-slate-700">Evento</th>
                    <th className="text-left p-2 font-semibold text-slate-700">Cliente</th>
                    <th className="text-left p-2 font-semibold text-slate-700">Pacote</th>
                    <th className="text-center p-2 font-semibold text-slate-700">Convidados</th>
                    <th className="text-right p-2 font-semibold text-slate-700">Valor</th>
                    <th className="text-right p-2 font-semibold text-slate-700">Entrada</th>
                    <th className="text-center p-2 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEventos.map(ev => {
                    const pacote = pacotes.find(p => p.id === ev.pacoteId);
                    return (
                      <tr key={ev.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2 text-slate-700">
                          {format(parseISO(ev.data), "dd/MM/yyyy")}
                        </td>
                        <td className="p-2 text-slate-700 font-medium">{ev.titulo}</td>
                        <td className="p-2 text-slate-600">{ev.clienteNome}</td>
                        <td className="p-2 text-slate-600">{pacote?.nome || "N/A"}</td>
                        <td className="p-2 text-center text-slate-700">{ev.convidados}</td>
                        <td className="p-2 text-right text-slate-700">
                          R$ {ev.valor.toLocaleString("pt-BR")}
                        </td>
                        <td className="p-2 text-right text-slate-700">
                          R$ {(ev.valorEntrada || 0).toLocaleString("pt-BR")}
                        </td>
                        <td className="p-2 text-center">
                          <Badge
                            variant={ev.status === "confirmado" ? "default" : "secondary"}
                            className={
                              ev.status === "confirmado"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {ev.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredEventos.length === 0 && (
        <Card className="bg-white border-blue-200">
          <CardContent className="p-12 text-center">
            <FileText size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-muted-foreground">
              Nenhum evento encontrado com os critérios selecionados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
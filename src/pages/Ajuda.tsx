import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  Book, 
  Send,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendSupportEmail } from "@/services/emailService";

export default function Ajuda() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const faqs = [
    {
      question: "Como cadastrar um novo cliente?",
      answer: "Acesse a seção 'Clientes' no menu lateral e clique em 'Novo Cliente'. Preencha todos os campos obrigatórios e clique em 'Cadastrar'.",
      category: "Clientes"
    },
    {
      question: "Como criar um evento no calendário?",
      answer: "Na tela de Eventos, clique em 'Cadastrar Evento' e preencha as informações do evento, incluindo data, horário e cliente.",
      category: "Eventos"
    },
    {
      question: "Como gerenciar propostas e adicionais?",
      answer: "Na seção 'Propostas, Adicionais e Equipes' você pode criar e gerenciar todos os componentes dos seus Eventos.",
      category: "Propostas"
    },
    {
      question: "Como calcular o valor de um evento?",
      answer: "O sistema calcula automaticamente baseado na proposta selecionada, número de convidados e adicionais escolhidos.",
      category: "Eventos"
    },
    {
      question: "Como visualizar o calendário de Eventos?",
      answer: "Acesse a seção 'Calendário' para visualizar todos os Eventos organizados por data com filtros por status.",
      category: "Calendário"
    }
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const result = await sendSupportEmail({
      name: formData.name,
      from: formData.email,
      subject: formData.subject,
      message: formData.message,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Mensagem enviada com sucesso!",
        description: "Nossa equipe entrará em contato em breve.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } else {
      toast({
        title: "Erro ao enviar mensagem",
        description: result.error || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Central de Ajuda</h1>
        <p className="text-muted-foreground mt-2">
          Encontre respostas e entre em contato com nosso suporte
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Form */}
          <Card className="border-l-4 border-l-blue-600 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <MessageSquare size={20} />
                Enviar Mensagem de Suporte
              </CardTitle>
              <p className="text-xs text-blue-700 mt-1">
                Nossa equipe responderá em até 24 horas úteis
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Nome <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Seu nome completo"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      E-mail <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Assunto <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Assunto da sua mensagem"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Mensagem <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Descreva sua dúvida ou problema detalhadamente..."
                    rows={6}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="border-l-4 border-l-blue-500 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <HelpCircle size={20} />
                Perguntas Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-blue-200 rounded-lg p-4 bg-gradient-to-r from-blue-50/30 to-white hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground pr-4">
                        {faq.question}
                      </h3>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
                        {faq.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card className="border-l-4 border-l-blue-600 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <CardTitle className="text-base text-blue-900">
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail size={16} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">E-mail</div>
                  <div className="text-sm text-muted-foreground">
                  meusalao.suporte@gmail.com
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
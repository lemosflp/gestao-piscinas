import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        navigate("/", { replace: true });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Coluna esquerda: faixa azul simples */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 text-white">
        <div className="flex flex-col justify-between px-10 py-10 w-full">
          <header className="text-sm text-blue-100/90">
          AquaHub • Painel de gestã<object data="" type=""></object>
          </header>

          <main className="space-y-4 max-w-md">
            <h1 className="text-3xl font-semibold leading-tight">
              Gestão e agenda
              <br />
              em um só lugar.
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Acompanhe Serviços, clientes e financeiro de forma simples,
              sem planilhas espalhadas.
            </p>
          </main>

          <footer className="text-[11px] text-blue-100/80">
            © {new Date().getFullYear()} AquaHub
          </footer>
        </div>
      </div>

      {/* Coluna direita: fundo branco e MeuSalão grande */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-10 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* topo / logo + título grande */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                AH
              </div>
              <span className="text-xs text-slate-500">Painel de gestão</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              AquaHub
            </h1>
            <p className="text-sm text-slate-500">
              Faça login para acessar o painel administrativo.
            </p>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-slate-900">
                Entrar no painel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs text-slate-700">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs text-slate-700">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white"
                  />
                </div>

                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-10 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {busy && <Loader2 size={16} className="mr-2 animate-spin" />}
                  Entrar
                </Button>

                <p className="text-[11px] text-slate-400 text-center pt-1">
                  Acesso restrito. Usuários cadastrados pelo administrador.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
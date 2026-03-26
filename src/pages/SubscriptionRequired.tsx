import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CreditCard, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function SubscriptionRequired() {
  const navigate = useNavigate();
  const { subscription } = useAuth();

  const getStatusMessage = () => {
    if (!subscription) {
      return {
        title: "Assinatura Necessária",
        description: "Você precisa de uma assinatura ativa para acessar o LeadExtract.",
        icon: <AlertCircle className="h-12 w-12 text-yellow-500" />,
      };
    }

    if (subscription.status === "expired") {
      return {
        title: "Assinatura Expirada",
        description: "Sua assinatura expirou. Renove para continuar usando o LeadExtract.",
        icon: <AlertCircle className="h-12 w-12 text-red-500" />,
      };
    }

    if (subscription.status === "cancelled") {
      return {
        title: "Assinatura Cancelada",
        description: "Sua assinatura foi cancelada. Reative para continuar usando o LeadExtract.",
        icon: <AlertCircle className="h-12 w-12 text-orange-500" />,
      };
    }

    return {
      title: "Assinatura Pendente",
      description: "Sua assinatura está pendente de ativação. Entre em contato com o suporte.",
      icon: <AlertCircle className="h-12 w-12 text-blue-500" />,
    };
  };

  const status = getStatusMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            {status.icon}
          </div>
          <CardTitle className="text-3xl font-bold">
            {status.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {status.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Plano Standard */}
            <div className="border-2 border-cyan-500/50 rounded-lg p-6 space-y-4 hover:border-cyan-500 transition-colors">
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-cyan-500" />
                <h3 className="text-xl font-bold">Plano Standard</h3>
              </div>
              <div className="text-3xl font-bold">R$ 97<span className="text-sm text-muted-foreground">/mês</span></div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                  50 Empresas Qualificadas/mês
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                  Nome do Dono e Capital Social
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                  Detecção Básica de Pixel/Ads
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                  Exportação CSV/Excel
                </li>
              </ul>
            </div>

            {/* Plano Premium */}
            <div className="border-2 border-purple-500/50 rounded-lg p-6 space-y-4 hover:border-purple-500 transition-colors bg-gradient-to-br from-purple-500/5 to-transparent">
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-purple-500" />
                <h3 className="text-xl font-bold">Plano Premium</h3>
              </div>
              <div className="text-3xl font-bold">R$ 1.000<span className="text-sm text-muted-foreground">/mês</span></div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  Extração Ilimitada
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  WhatsApp Direto dos Decisores
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  Auditoria Completa de Marketing
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  Exclusividade Regional
                </li>
              </ul>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full"
            size="lg"
            onClick={() => navigate("/")}
          >
            Ver Planos e Assinar
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Voltar ao Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Calendar, X, Check, RefreshCw } from "lucide-react";
import { supabase, subscriptionService, type Subscription, type SubscriptionPlan, type SubscriptionStatus } from "@/lib/supabase";

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        user_profiles (
          name,
          user_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      setError("Erro ao carregar assinaturas");
      setLoading(false);
      return;
    }

    setSubscriptions(data || []);
    setLoading(false);
  };

  const handleUpdateSubscription = async (
    subscriptionId: string,
    updates: Partial<Subscription>
  ) => {
    setError("");
    setSuccess("");

    const { error } = await subscriptionService.updateSubscription(subscriptionId, updates);

    if (error) {
      setError("Erro ao atualizar assinatura");
      return;
    }

    setSuccess("Assinatura atualizada com sucesso!");
    loadSubscriptions();
  };

  const handleExpireSubscription = async (subscriptionId: string) => {
    if (!confirm("Tem certeza que deseja expirar esta assinatura?")) return;

    setError("");
    setSuccess("");

    const { error } = await subscriptionService.expireSubscription(subscriptionId);

    if (error) {
      setError("Erro ao expirar assinatura");
      return;
    }

    setSuccess("Assinatura expirada com sucesso!");
    loadSubscriptions();
  };

  const handleRenewSubscription = async (subscriptionId: string) => {
    setError("");
    setSuccess("");

    const { error } = await subscriptionService.renewSubscription(subscriptionId, null);

    if (error) {
      setError("Erro ao renovar assinatura");
      return;
    }

    setSuccess("Assinatura renovada com sucesso!");
    loadSubscriptions();
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    const variants: Record<SubscriptionStatus, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      expired: "destructive",
      cancelled: "secondary",
      pending: "outline",
    };

    const labels: Record<SubscriptionStatus, string> = {
      active: "Ativo",
      expired: "Expirado",
      cancelled: "Cancelado",
      pending: "Pendente",
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getPlanBadge = (plan: SubscriptionPlan) => {
    return (
      <Badge variant={plan === "premium" ? "default" : "secondary"}>
        {plan === "premium" ? "Premium" : "Standard"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-cyan-500" />
          <h1 className="text-3xl font-bold text-white">
            Gerenciar Assinaturas
          </h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500 bg-green-500/10">
            <AlertDescription className="text-green-500">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          {subscriptions.map((subscription: any) => (
            <Card key={subscription.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {subscription.user_profiles?.name || "Usuário"}
                    </CardTitle>
                    <CardDescription>
                      ID: {subscription.user_id}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {getPlanBadge(subscription.plan)}
                    {getStatusBadge(subscription.status)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Iniciado em</Label>
                    <p className="font-medium">
                      {new Date(subscription.started_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Expira em</Label>
                    <p className="font-medium">
                      {subscription.expires_at
                        ? new Date(subscription.expires_at).toLocaleDateString('pt-BR')
                        : "Nunca (Controle Manual)"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Select
                    value={subscription.plan}
                    onValueChange={(value) =>
                      handleUpdateSubscription(subscription.id, { plan: value as SubscriptionPlan })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Alterar plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    className="w-[180px]"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleUpdateSubscription(subscription.id, {
                          expires_at: new Date(e.target.value).toISOString(),
                        });
                      }
                    }}
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateSubscription(subscription.id, { expires_at: null })}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Sem Expiração
                  </Button>

                  {subscription.status === "active" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleExpireSubscription(subscription.id)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Expirar
                    </Button>
                  )}

                  {(subscription.status === "expired" || subscription.status === "cancelled") && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleRenewSubscription(subscription.id)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Renovar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

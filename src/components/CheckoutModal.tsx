import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Check, CreditCard, QrCode } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CheckoutModal = ({ open, onOpenChange }: CheckoutModalProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix">("pix");
  const [pixData, setPixData] = useState<{ qrCode: string; pixCode: string } | null>(null);
  const [cardErrorMessage, setCardErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
  });

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d)(\d{4})$/, "$1-$2");
    }
    return value;
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 16) {
      return numbers.replace(/(\d{4})(?=\d)/g, "$1 ");
    }
    return value;
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 4) {
      return numbers.replace(/(\d{2})(\d)/, "$1/$2");
    }
    return value;
  };

  const copyPixCode = () => {
    if (pixData?.pixCode) {
      navigator.clipboard.writeText(pixData.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2); // Ir para seleção de método de pagamento
  };

  const handleCardUnavailable = () => {
    const message = "Desculpe, o pagamento com cartão está temporariamente fora do ar. Pedimos desculpas pelo transtorno e volte a tentar mais tarde.";
    setCardErrorMessage(message);
    alert(message);
  };

  const handlePaymentMethodSelect = async (method: "pix") => {
    setCardErrorMessage("");
    setPaymentMethod(method);
    
    if (method === "pix") {
      setLoading(true);
      try {
        // Validar dados antes de enviar
        const cleanCpf = formData.cpf.replace(/\D/g, "");
        const cleanPhone = formData.phone.replace(/\D/g, "");
        
        if (!formData.name || !formData.email || !cleanCpf) {
          alert("Por favor, preencha todos os campos obrigatórios.");
          setLoading(false);
          return;
        }
        
        if (cleanCpf.length !== 11) {
          alert("CPF inválido. Deve conter 11 dígitos.");
          setLoading(false);
          return;
        }
        
        // Formato correto da API SigiloPay
        const requestBody = {
          identifier: `lead-extractor-${Date.now()}`,
          amount: 1000,
          client: {
            name: formData.name,
            email: formData.email,
            document: cleanCpf,
            ...(cleanPhone && { phone: cleanPhone }),
          },
          expiresIn: 3600,
        };
        
        console.log("Enviando requisição PIX:", requestBody);
        
        const response = await fetch("http://localhost:3001/api/payment/pix", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error("Erro da API:", data);
          alert(`Erro ao processar pagamento: ${data.message || "Erro desconhecido"}`);
          setLoading(false);
          return;
        }

        console.log("Resposta PIX completa:", JSON.stringify(data, null, 2));
        console.log("Campos disponíveis:", Object.keys(data));
        console.log("Tentando extrair QR Code...");
        
        // A API da SigiloPay retorna os dados dentro do objeto "pix", muitas vezes em pix.pix
        const pixInfo = data.pix || data;
        const payload = pixInfo.pix || pixInfo;

        // Tentar diferentes campos para o QR Code e para o código PIX
        const qrCodeImage =
          payload.base64 ||
          payload.qrCode ||
          payload.qrcode ||
          payload.qr_code ||
          payload.image ||
          payload.qrCodeBase64 ||
          payload.qrCodeImage ||
          pixInfo.base64 ||
          pixInfo.qrCode ||
          pixInfo.qrcode ||
          pixInfo.qr_code ||
          pixInfo.image ||
          "";

        const pixCode =
          payload.code ||
          payload.pixCopyPaste ||
          payload.brCode ||
          payload.emv ||
          payload.pix_copy_paste ||
          payload.payload ||
          pixInfo.code ||
          pixInfo.pixCopyPaste ||
          pixInfo.brCode ||
          pixInfo.emv ||
          pixInfo.pix_copy_paste ||
          pixInfo.payload ||
          "";

        console.log("QR Code encontrado:", qrCodeImage ? "SIM" : "NÃO");
        console.log("PIX Code encontrado:", pixCode ? "SIM" : "NÃO");

        setPixData({
          qrCode: qrCodeImage || "",
          pixCode: pixCode || "Código PIX não disponível",
        });
        
        setStep(3);
      } catch (error) {
        console.error("Erro no checkout PIX:", error);
        const errorMsg = error instanceof Error ? error.message : "Falha ao conectar com o servidor de pagamento";
        alert(
          `Erro ao gerar QR Code PIX:\n\n${errorMsg}\n\nVerifique sua conexão de internet e tente novamente.`
        );
        setLoading(false);
        setStep(2); // Volta para seleção de método
      } finally {
        setLoading(false);
      }
    }
  };



  const handleClose = () => {
    setStep(1);
    setPixData(null);
    setCardErrorMessage("");
    setPaymentMethod("pix");
    setFormData({ name: "", email: "", cpf: "", phone: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Finalizar Compra" : "Pagamento via PIX"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? "Preencha seus dados para continuar" : "Escaneie o QR Code ou copie o código PIX para pagar"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                placeholder="João da Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="joao@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                maxLength={14}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (WhatsApp)</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                maxLength={15}
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Continuar para Pagamento"
                )}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              🔒 Seus dados estão seguros e criptografados
            </p>
          </form>
        ) : (
          <div className="space-y-4">
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-3 hover:border-accent hover:bg-accent/5 w-full"
              onClick={() => handlePaymentMethodSelect("pix")}
              disabled={loading}
            >
              {loading && paymentMethod === "pix" ? (
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              ) : (
                <QrCode className="h-8 w-8 text-accent" />
              )}
              <div className="text-center">
                <p className="font-semibold">PIX</p>
                <p className="text-xs text-muted-foreground">Aprovação instantânea</p>
              </div>
            </Button>

            <button
              type="button"
              className="w-full p-8 border-2 border-dashed border-destructive/30 rounded-xl bg-destructive/5 text-center"
              onClick={handleCardUnavailable}
            >
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-destructive/70" />
              <h3 className="font-bold text-lg mb-2 text-destructive/90">Pagamento com Cartão Fora do Ar</h3>
              <p className="text-sm text-muted-foreground mb-4">Desculpe, temporariamente indisponível. Use PIX para pagamento instantâneo.</p>
            </button>

            {cardErrorMessage && (
              <div className="rounded-lg border border-destructive/80 bg-destructive/10 p-3 text-sm text-destructive">
                {cardErrorMessage}
              </div>
            )}

            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm font-semibold mb-1">Valor Mensal</p>
              <p className="text-2xl font-bold text-accent">R$ 1.000,00</p>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setStep(1)}
            >
              Voltar
            </Button>
          </div>
        ) : paymentMethod === "pix" ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-lg border-2 border-border bg-white p-4">
                {pixData?.qrCode && (
                  <img
                    src={`data:image/png;base64,${pixData.qrCode}`}
                    alt="QR Code PIX"
                    className="h-64 w-64"
                  />
                )}
              </div>

              <div className="w-full space-y-2">
                <Label>Código PIX Copia e Cola</Label>
                <div className="flex gap-2">
                  <Input
                    value={pixData?.pixCode || ""}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyPixCode}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-semibold mb-2">Como pagar:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Abra o app do seu banco</li>
                  <li>Escolha pagar com PIX</li>
                  <li>Escaneie o QR Code ou cole o código</li>
                  <li>Confirme o pagamento de R$ 1.000,00</li>
                </ol>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Após a confirmação do pagamento, você receberá o link de download por email.
              </p>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStep(2)}
              >
                Voltar para Métodos de Pagamento
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

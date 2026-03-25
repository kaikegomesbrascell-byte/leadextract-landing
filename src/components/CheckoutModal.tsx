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
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [pixData, setPixData] = useState<{ qrCode: string; pixCode: string } | null>(null);
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
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

  const handlePaymentMethodSelect = async (method: "pix" | "card") => {
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
        
        // A API da SigiloPay retorna os dados dentro do objeto "pix"
        const pixInfo = data.pix || data;
        
        // Tentar diferentes campos para o QR Code
        const qrCodeImage = pixInfo.base64 || data.qrCode || data.qrcode || data.qr_code || data.image || data.qrCodeBase64 || data.qrCodeImage;
        const pixCode = pixInfo.code || data.pixCopyPaste || data.brCode || data.emv || data.pix_copy_paste || data.code || data.payload;
        
        console.log("QR Code encontrado:", qrCodeImage ? "SIM" : "NÃO");
        console.log("PIX Code encontrado:", pixCode ? "SIM" : "NÃO");
        
        setPixData({
          qrCode: qrCodeImage || "",
          pixCode: pixCode || "Código PIX não disponível",
        });
        
        setStep(3);
      } catch (error) {
        console.error("Erro no checkout PIX:", error);
        alert("Erro ao processar pagamento PIX. Verifique sua conexão e tente novamente.");
      } finally {
        setLoading(false);
      }
    } else {
      setStep(3); // Ir para formulário de cartão
    }
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/payment/card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: {
            name: "Lead Extractor - Licença Completa",
            price: 1000,
          },
          customer: {
            name: formData.name,
            email: formData.email,
            document: formData.cpf.replace(/\D/g, ""),
            phone: formData.phone.replace(/\D/g, ""),
          },
          payment: {
            method: "credit_card",
            card: {
              number: cardData.number.replace(/\s/g, ""),
              holder_name: cardData.name,
              exp_month: cardData.expiry.split("/")[0],
              exp_year: cardData.expiry.split("/")[1],
              cvv: cardData.cvv,
            },
          },
          trackProps: {
            source: "landing-page",
            product: "lead-extractor",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao processar pagamento com cartão");
      }

      const data = await response.json();
      
      alert("Pagamento aprovado! Você receberá o link de download por email.");
      handleClose();
    } catch (error) {
      console.error("Erro no pagamento com cartão:", error);
      alert("Erro ao processar pagamento com cartão. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setPixData(null);
    setPaymentMethod("pix");
    setCardData({ number: "", name: "", expiry: "", cvv: "" });
    setFormData({ name: "", email: "", cpf: "", phone: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Finalizar Compra" : step === 2 ? "Escolha o Método de Pagamento" : paymentMethod === "pix" ? "Pagamento PIX" : "Pagamento com Cartão"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? "Preencha seus dados para continuar" : step === 2 ? "Selecione como deseja pagar" : paymentMethod === "pix" ? "Escaneie o QR Code ou copie o código PIX" : "Preencha os dados do seu cartão"}
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
        ) : step === 2 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-3 hover:border-accent hover:bg-accent/5"
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

              <Button
                variant="outline"
                className="h-32 flex flex-col gap-3 hover:border-accent hover:bg-accent/5"
                onClick={() => handlePaymentMethodSelect("card")}
                disabled={loading}
              >
                <CreditCard className="h-8 w-8 text-accent" />
                <div className="text-center">
                  <p className="font-semibold">Cartão</p>
                  <p className="text-xs text-muted-foreground">Crédito ou Débito</p>
                </div>
              </Button>
            </div>

            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm font-semibold mb-1">Valor Total</p>
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
        ) : (
          <form onSubmit={handleCardPayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número do Cartão *</Label>
              <Input
                id="cardNumber"
                placeholder="0000 0000 0000 0000"
                value={cardData.number}
                onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                maxLength={19}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardName">Nome no Cartão *</Label>
              <Input
                id="cardName"
                placeholder="NOME COMO ESTÁ NO CARTÃO"
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Validade *</Label>
                <Input
                  id="expiry"
                  placeholder="MM/AA"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                  maxLength={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  placeholder="000"
                  type="password"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "") })}
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Valor Total</span>
                <span className="text-xl font-bold text-accent">R$ 1.000,00</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando Pagamento...
                  </>
                ) : (
                  "Finalizar Pagamento"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep(2)}
              >
                Voltar para Métodos de Pagamento
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              🔒 Pagamento seguro e criptografado
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

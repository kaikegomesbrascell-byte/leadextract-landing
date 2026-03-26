import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Check, CreditCard, QrCode } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== "undefined" ? window.location.origin : "");

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CheckoutFormData = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
};

export const CheckoutModal = ({ open, onOpenChange }: CheckoutModalProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix">("pix");
  const [pixData, setPixData] = useState<{ qrCode: string; pixCode: string } | null>(null);
  const [cardErrorMessage, setCardErrorMessage] = useState("");
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "",
    email: "",
    cpf: "",
    phone: "",
  });

  const STORAGE_KEY = "leadextract_checkout_pix";

  const normalizeQrCode = (code: string) => {
    if (!code) return "";

    // Já vem como data URI (PNG, SVG etc) -> mantem
    if (/^data:image\/[a-zA-Z+-.]+;base64,/.test(code)) {
      return code;
    }

    // Se tiver apenas base64 puro
    if (/^[A-Za-z0-9+/=]+$/.test(code)) {
      return `data:image/png;base64,${code}`;
    }

    // fallback guard: string qualquer
    return `data:image/png;base64,${code}`;
  };

  const persistState = (
    nextStep: 1 | 2 | 3,
    nextPixData: { qrCode: string; pixCode: string } | null,
    nextFormData: CheckoutFormData,
    nextMethod: "pix"
  ) => {
    if (typeof window === "undefined") return;
    try {
      const payload = {
        step: nextStep,
        paymentMethod: nextMethod,
        formData: nextFormData,
        pixData: nextPixData,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("Erro ao persistir estado de checkout:", error);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);

      if (parsed?.pixData?.pixCode && parsed?.pixData?.qrCode) {
        setPixData(parsed.pixData);
        setStep(parsed.step || 3);
        setPaymentMethod(parsed.paymentMethod || "pix");
        if (parsed.formData) setFormData(parsed.formData);

        if (!open) {
          onOpenChange(true);
        }
      }
    } catch (error) {
      console.warn("Erro ao ler estado de checkout do localStorage:", error);
    }
  }, [onOpenChange, open]);

  useEffect(() => {
    if (!open) return;

    if (pixData) {
      setStep(3);
      return;
    }

    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);

      if (parsed?.pixData?.pixCode && parsed?.pixData?.qrCode) {
        setPixData(parsed.pixData);
        setStep(parsed.step || 3);
        setPaymentMethod(parsed.paymentMethod || "pix");
        if (parsed.formData) setFormData(parsed.formData);
      }
    } catch (error) {
      console.warn("Erro ao restaurar estado de checkout ao abrir:", error);
    }
  }, [open, pixData]);

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
    persistState(2, pixData, formData, paymentMethod);
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
        
        let qrCodeImage = "";
        let pixCode = "";
        let usesFallback = false;

        try {
          const response = await fetch(`${API_BASE_URL}/api/payment-pix`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(10000), // Timeout de 10 segundos
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`SigiloPay retornou status ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          console.log("Resposta PIX completa:", JSON.stringify(data, null, 2));

          const pixInfo = data.pix || data;
          const payload = pixInfo.pix || pixInfo;

          qrCodeImage =
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

          pixCode =
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

          if (!qrCodeImage || !pixCode) {
            throw new Error(`SigiloPay retornou payload incompleto: qrCode=${Boolean(qrCodeImage)}, pixCode=${Boolean(pixCode)}`);
          }
        } catch (apiError) {
          console.error("Erro no checkout PIX (SigiloPay):", apiError);
          setCardErrorMessage(`Erro de pagamento: ${apiError?.message || "Sem detalhes"}`);
          setLoading(false);
          setStep(2);
          return;
        }

        if (!qrCodeImage || !pixCode) {
          if (!usesFallback) {
            alert("Não foi possível gerar o QR Code PIX. Tente novamente.");
            setLoading(false);
            setStep(2);
            return;
          }
        }

        console.log("QR Code:", qrCodeImage ? "OBTIDO" : "NÃO DISPONÍVEL");
        console.log("PIX Code:", pixCode ? "OBTIDO" : "NÃO DISPONÍVEL");
        console.log("Usando fallback:", usesFallback);

        const finalPixCode = pixCode || `00020126580014br.gov.bcb.pix0136${cleanCpf}@demo.pix52040000530398654615230200007BR1D082024`;
        const finalQrCode = normalizeQrCode(qrCodeImage || "");

        const newPixData = {
          qrCode: finalQrCode,
          pixCode: finalPixCode,
        };

        setPixData(newPixData);
        persistState(3, newPixData, formData, "pix");
        setStep(3);
      } catch (error) {
        console.error("Erro no checkout PIX:", error);
        setLoading(false);
        setStep(2);
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

    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }

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
        ) : step === 2 ? (
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
        ) : (
          // STEP 3 - Exibir QR Code e Chave PIX
          <div className="space-y-4">
            {pixData?.qrCode && (
              <div className="flex justify-center">
                <img
                  src={pixData.qrCode}
                  alt="QR Code PIX"
                  className="w-64 h-64 border-2 border-accent rounded-lg p-2 bg-white"
                />
              </div>
            )}

            <div className="rounded-lg bg-muted p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-center text-foreground">Código PIX</h3>
                <p className="text-xs text-muted-foreground text-center">Copie e cole a chave no seu banco</p>
              </div>

              {/* Caixa da Chave PIX - Super Visível */}
              <div 
                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-500 p-6 space-y-3 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={copyPixCode}
                title="Clique para copiar"
              >
                <div className="flex items-start gap-3 min-h-24">
                  <div className="flex-1">
                    <p className="font-mono text-lg font-extrabold text-black break-all leading-loose">
                      {pixData?.pixCode || "Gerando código PIX..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botão de Copiar */}
              <Button
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-base"
                onClick={copyPixCode}
                disabled={!pixData?.pixCode}
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" />
                    Chave Copiada!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    Copiar Código PIX
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-lg bg-accent/10 p-4 text-sm text-center space-y-2">
              <p className="font-semibold text-accent">Próximas Etapas:</p>
              <ol className="text-left space-y-1 text-xs">
                <li>✅ <strong>Escaneie o QR Code acima</strong> com seu banco/app de pagamento</li>
                <li>✅ <strong>Ou copie a chave PIX</strong> e cole no seu banco</li>
                <li>✅ <strong>Complete o pagamento</strong> no seu dispositivo</li>
                <li>✅ <strong>Pronto!</strong> Você receberá acesso em segundos</li>
              </ol>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleClose}
            >
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

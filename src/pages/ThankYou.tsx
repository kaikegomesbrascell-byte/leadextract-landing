import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, MessageCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

const ThankYou = () => {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    
    // Event snippet for Compra conversion page
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-18030639277/mg8YCPyF4Y0cEK3x1pVD',
        'value': 297.0,
        'currency': 'BRL',
        'transaction_id': ''
      });
    }
  }, []);

  const handleDownload = () => {
    // Trigger download from public folder
    window.location.href = "/lead-extractor.zip";
  };

  const handleWhatsAppSupport = () => {
    // Substitua pelo seu número de WhatsApp (formato: 5511999999999)
    const phoneNumber = "5516994260416"; // ALTERE AQUI
    const message = encodeURIComponent("Olá! Acabei de adquirir o LeadExtract e preciso de ajuda com a instalação.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        {/* Ícone de sucesso animado */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl" />
            <div className="relative bg-accent/10 rounded-full p-6">
              <CheckCircle2 className="h-20 w-20 text-accent" />
            </div>
          </div>
        </motion.div>

        {/* Título */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Pagamento Confirmado! 🎉
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-accent mb-6">
            Bem-vindo ao LeadExtract
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Você acaba de adquirir a ferramenta definitiva para escalar suas vendas B2B 
            <strong className="text-foreground"> sem mensalidades</strong>.
          </p>
        </motion.div>

        {/* Botão de Download Principal */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.3 }}
        >
          <Button
            variant="hero"
            size="xl"
            className="w-full gap-3 text-lg py-8"
            onClick={handleDownload}
          >
            <Download className="h-6 w-6" />
            Baixar LeadExtract + Bônus (95 MB)
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-3">
            Inclui: Software + Guia Anti-Ban + Scripts de Vendas
          </p>
        </motion.div>

        {/* Próximos Passos */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
            Próximos Passos
          </h3>
          
          <div className="space-y-4">
            {/* Passo 1 */}
            <div className="flex items-start gap-4 p-6 rounded-lg border border-border bg-card hover:border-accent/40 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-1">
                  Extraia seus primeiros leads
                </h4>
                <p className="text-sm text-muted-foreground">
                  Descompacte o arquivo, abra o LeadExtractor.exe e comece a extrair leads do Google Maps. 
                  É simples e rápido!
                </p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex items-start gap-4 p-6 rounded-lg border border-border bg-card hover:border-accent/40 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-1">
                  Siga o Guia Anti-Ban
                </h4>
                <p className="text-sm text-muted-foreground">
                  Leia o PDF "Guia Anti-Ban WhatsApp" para proteger seu número ao fazer prospecção em massa. 
                  Técnicas comprovadas incluídas.
                </p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex items-start gap-4 p-6 rounded-lg border border-border bg-card hover:border-accent/40 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-1">
                  Use os Scripts de Vendas inclusos
                </h4>
                <p className="text-sm text-muted-foreground">
                  Aplique os 3 scripts de alta conversão do PDF "Scripts de Vendas" para fechar mais negócios 
                  desde o primeiro contato.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Garantia */}
        <motion.div
          className="mb-8 p-6 rounded-lg border-2 border-accent/30 bg-accent/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="h-5 w-5 text-accent" />
            <h4 className="text-lg font-semibold text-foreground">
              Garantia de 7 Dias
            </h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Se em 7 dias você não extrair seus primeiros 500 leads, devolvemos 100% do seu dinheiro. 
            Sem perguntas, sem burocracia.
          </p>
        </motion.div>

        {/* Botão de Suporte WhatsApp */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.6 }}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Precisa de ajuda com a instalação?
          </p>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 border-accent/30 hover:bg-accent/10 hover:border-accent"
            onClick={handleWhatsAppSupport}
          >
            <MessageCircle className="h-5 w-5 text-accent" />
            Falar com Suporte no WhatsApp
          </Button>
        </motion.div>

        {/* Rodapé */}
        <motion.div
          className="mt-12 pt-8 border-t border-border text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease, delay: 0.7 }}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Obrigado por confiar no LeadExtract! 🚀
          </p>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 text-accent hover:text-accent/80"
          >
            <a href="/">
              Voltar para a página inicial
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ThankYou;

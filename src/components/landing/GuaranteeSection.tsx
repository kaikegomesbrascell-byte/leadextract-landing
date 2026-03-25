import { Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";

const ease = [0.16, 1, 0.3, 1] as const;

const GuaranteeSection = () => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <section
      className="border-t px-6 py-20 md:py-28"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background:
          "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16,185,129,0.05) 0%, transparent 70%)",
      }}
    >
      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
      <div className="mx-auto max-w-5xl">
        <motion.div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(16,185,129,0.3)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 0 60px rgba(16,185,129,0.06), 0 40px 80px rgba(0,0,0,0.4)",
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease }}
        >
          <div
            className="absolute -right-12 top-8 rotate-45 px-16 py-2 text-center text-sm font-bold uppercase shadow-lg"
            style={{ background: "#10b981", color: "#000" }}
          >
            Garantia
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col items-center text-center">
              <motion.div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: "rgba(16,185,129,0.12)", boxShadow: "0 0 30px rgba(16,185,129,0.15)" }}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: 0.2 }}
              >
                <Shield className="h-10 w-10" style={{ color: "#10b981" }} />
              </motion.div>

              <motion.h2
                className="mb-4 text-3xl md:text-5xl font-extrabold"
                style={{ color: "#f0f4ff" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: 0.3 }}
              >
                Garantia Incondicional de 7 Dias
              </motion.h2>

              <motion.div
                className="mb-8 max-w-3xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: 0.4 }}
              >
                <p className="text-xl md:text-2xl font-semibold mb-4" style={{ color: "#10b981" }}>
                  "Se em 7 dias você não extrair seus primeiros 500 leads, eu devolvo cada centavo."
                </p>
                <p className="text-lg" style={{ color: "hsl(220 15% 60%)" }}>
                  Isso tira o peso da decisão das suas costas e coloca no nosso software. E nós
                  sabemos que ele funciona.
                </p>
              </motion.div>

              <motion.div
                className="mb-8 grid gap-4 text-left md:grid-cols-3 w-full max-w-4xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: 0.5 }}
              >
                {[
                  {
                    title: "Sem Perguntas",
                    body: "Não gostou? Devolvo 100% do seu dinheiro, sem burocracia.",
                  },
                  {
                    title: "Risco Zero",
                    body: "Teste o sistema por 7 dias completos sem nenhum risco.",
                  },
                  {
                    title: "Suporte Total",
                    body: "Ajudamos você a extrair seus primeiros 500 leads.",
                  },
                ].map(item => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#10b981" }} />
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: "#f0f4ff" }}>
                        {item.title}
                      </h3>
                      <p className="text-sm" style={{ color: "hsl(220 15% 55%)" }}>
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: 0.6 }}
              >
                <button
                  className="flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg,#0099cc,#00d4ff)",
                    color: "#000",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 0 30px rgba(0,212,255,0.3)",
                  }}
                  onClick={() => setCheckoutOpen(true)}
                  onMouseEnter={e =>
                    ((e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 0 50px rgba(0,212,255,0.5)")
                  }
                  onMouseLeave={e =>
                    ((e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 0 30px rgba(0,212,255,0.3)")
                  }
                >
                  Começar Agora Sem Riscos
                  <ArrowRight className="h-5 w-5" />
                </button>
                <p className="text-sm" style={{ color: "hsl(220 15% 50%)" }}>
                  💳 Pagamento único de R$ 1.000,00 • Garantia de 7 dias • Acesso vitalício
                </p>
              </motion.div>

              <motion.div
                className="mt-8 rounded-xl p-6 max-w-2xl"
                style={{
                  background: "rgba(16,185,129,0.05)",
                  border: "1px solid rgba(16,185,129,0.15)",
                }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: 0.7 }}
              >
                <p className="text-sm text-center" style={{ color: "hsl(220 15% 60%)" }}>
                  <strong style={{ color: "#f0f4ff" }}>Por que oferecemos essa garantia?</strong>
                  <br />
                  Porque confiamos 100% no nosso sistema. Milhares de usuários já extraíram centenas
                  de milhares de leads com sucesso. Queremos que você tenha a mesma experiência, sem
                  riscos.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GuaranteeSection;

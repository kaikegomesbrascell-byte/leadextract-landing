import { Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface Testimonial {
  name: string;
  role: string;
  location: string;
  content: string;
  avatar: string;
  rating: number;
  metric?: { label: string; value: string };
}

const testimonials: Testimonial[] = [
  {
    name: "Carlos Silva",
    role: "Proprietário de Agência Digital",
    location: "São Paulo, SP",
    content: "Em 2 semanas usando LeadExtract, consegui 500 leads qualificados. Minha base de clientes aumentou 300%. Ferramenta imprescindível!",
    avatar: "👨‍💼",
    rating: 5,
    metric: { label: "Leads Capturados", value: "500+" }
  },
  {
    name: "Maria Santos",
    role: "Consultora de Negócios",
    location: "Rio de Janeiro, RJ",
    content: "Nunca tive tantaleads de qualidade. O sistema antiduplicas é ouro puro. Economizei horas de trabalho manual.",
    avatar: "👩‍💻",
    rating: 5,
    metric: { label: "Horas Economizadas", value: "120+" }
  },
  {
    name: "Alex Oliveira",
    role: "Gestor de Tráfego",
    location: "Belo Horizonte, MG",
    content: "LeadExtract realmente revolucionou meu trabalho. Os intervalos humanos funcionam perfeitamente. Zero bloqueios!",
    avatar: "🧑‍💼",
    rating: 5,
    metric: { label: "Taxa Sucesso", value: "99.8%" }
  },
  {
    name: "Patricia Lima",
    role: "Proprietária E-commerce",
    location: "Curitiba, PR",
    content: "Não consigo imaginar voltar ao jeito antigo. LeadExtract multiplicou minhas vendas. Recomendo para todos!",
    avatar: "👩‍🔬",
    rating: 5,
    metric: { label: "Aumento Vendas", value: "280%" }
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="relative border-t border-border bg-background px-6 py-24 md:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-0 h-80 w-80 bg-accent/5 rounded-full blur-[128px]" />
        <div className="absolute -bottom-40 left-0 h-80 w-80 bg-accent/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          className="mb-16 max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
          <span className="font-mono-data text-xs font-medium uppercase tracking-widest text-accent">Depoimentos</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Veja o que nossos clientes conseguiram
          </h2>
          <p className="mt-4 text-muted-foreground">
            Milhares de usuários já transformaram seus negócios com LeadExtract
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow duration-300 relative group"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease, delay: i * 0.1 }}
            >
              {/* Card glow effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10 flex flex-col h-full">
                {/* Rating stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-sm text-foreground leading-relaxed mb-4 flex-grow">
                  "{testimonial.content}"
                </p>

                {/* Metric display */}
                {testimonial.metric && (
                  <div className="mb-4 rounded-lg bg-accent/10 border border-accent/30 p-3">
                    <p className="text-xs text-muted-foreground font-medium">{testimonial.metric.label}</p>
                    <p className="text-lg font-bold text-accent">{testimonial.metric.value}</p>
                  </div>
                )}

                {/* Author info */}
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{testimonial.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust section */}
        <motion.div
          className="mt-16 rounded-lg border border-accent/20 bg-accent/5 p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease, delay: 0.4 }}
        >
          <p className="text-sm text-muted-foreground">
            Mais de <span className="font-bold text-foreground">15.000+</span> usuários em{" "}
            <span className="font-bold text-foreground">todo Brasil</span> já aumentaram suas vendas com LeadExtract
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

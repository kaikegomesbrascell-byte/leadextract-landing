import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

const navLinks: [string, string][] = [
  ["#features", "Recursos"],
  ["#how-it-works", "Como Funciona"],
  ["#pricing", "Preço"],
];

const Navbar = () => {
  return (
    <motion.nav
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: "rgba(3,7,18,0.8)",
      }}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md"
            style={{ background: "linear-gradient(135deg,#0099cc,#00d4ff)" }}
          >
            <Zap className="h-4 w-4 text-black" />
          </div>
          <span
            className="text-lg font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(135deg,#00d4ff,#10b981)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            LeadExtract
          </span>
          <span
            className="hidden sm:inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#00d4ff", color: "#000" }}
          >
            6.0
          </span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-sm transition-colors duration-200"
              style={{ color: "hsl(220 15% 55%)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#00d4ff")}
              onMouseLeave={e => (e.currentTarget.style.color = "hsl(220 15% 55%)")}
            >
              {label}
            </a>
          ))}
        </div>

        <Button
          variant="hero"
          size="default"
          asChild
          style={{
            background: "linear-gradient(135deg,#0099cc,#00d4ff)",
            color: "#000",
            fontWeight: 700,
            boxShadow: "0 0 20px rgba(0,212,255,0.3)",
          }}
        >
          <a href="#pricing">Adquirir Agora</a>
        </Button>
      </div>
    </motion.nav>
  );
};

export default Navbar;

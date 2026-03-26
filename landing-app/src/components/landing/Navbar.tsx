import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <motion.nav
      className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
            <Zap className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            LeadExtract
          </span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Recursos
          </a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Como Funciona
          </a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Preço
          </a>
        </div>

        <Button variant="hero" size="default" asChild>
          <a href="#pricing">Adquirir Agora</a>
        </Button>
      </div>
    </motion.nav>
  );
};

export default Navbar;

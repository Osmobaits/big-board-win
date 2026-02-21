import { motion } from "framer-motion";
import { ArrowLeft, Target, Trophy, Grid3X3, Undo2, Handshake, RotateCcw } from "lucide-react";

interface GameRulesProps {
  onBack: () => void;
}

const rules = [
  {
    icon: Grid3X3,
    title: "Plansza",
    desc: "Gra toczy się na planszy 12×12 pól.",
  },
  {
    icon: Target,
    title: "Pierwszy ruch",
    desc: "Pierwszy ruch musi być wykonany na jednym z 4 środkowych pól planszy (podświetlone na starcie).",
  },
  {
    icon: Trophy,
    title: "Cel gry",
    desc: "Wygrywa gracz, który jako pierwszy ułoży 5 swoich znaków w linii — poziomo, pionowo lub po skosie.",
  },
  {
    icon: Undo2,
    title: "Cofanie ruchu",
    desc: "Można cofnąć ostatni ruch (w grze z AI cofane są 2 ruchy).",
  },
  {
    icon: Handshake,
    title: "Remis",
    desc: "Gracze mogą w dowolnym momencie ogłosić remis za obopólną zgodą.",
  },
  {
    icon: RotateCcw,
    title: "Zmiana stron",
    desc: "Po zakończeniu partii i resecie planszy gracze automatycznie zamieniają się znakami (X ↔ O).",
  },
];

const GameRules = ({ onBack }: GameRulesProps) => {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md px-4">
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-xl sm:text-2xl font-black tracking-wide text-center"
        style={{
          fontFamily: "'Press Start 2P', cursive",
          color: "hsl(var(--primary))",
          textShadow: "var(--neon-glow)",
        }}
      >
        Zasady gry
      </motion.h1>

      <div className="flex flex-col gap-3 w-full">
        {rules.map((rule, i) => (
          <motion.div
            key={rule.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex gap-3 p-3 rounded-lg"
            style={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <rule.icon
              className="w-5 h-5 mt-0.5 shrink-0"
              style={{ color: "hsl(var(--primary))" }}
            />
            <div>
              <h3
                className="font-bold text-xs mb-1"
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "0.55rem",
                  color: "hsl(var(--primary))",
                }}
              >
                {rule.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {rule.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        onClick={onBack}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center justify-center gap-3 w-full py-3 rounded font-bold text-sm uppercase tracking-wider transition-colors"
        style={{
          fontFamily: "'Press Start 2P', cursive",
          fontSize: "0.7rem",
          backgroundColor: "hsl(var(--muted))",
          border: "3px solid hsl(var(--border))",
          color: "hsl(var(--muted-foreground))",
        }}
      >
        <ArrowLeft className="w-5 h-5" />
        Powrót
      </motion.button>
    </div>
  );
};

export default GameRules;

import { motion } from "framer-motion";
import { ArrowLeft, Target, Trophy, Grid3X3, Undo2, Handshake, RotateCcw } from "lucide-react";
import { t, useLang } from "@/lib/i18n";

interface GameRulesProps {
  onBack: () => void;
}

const GameRules = ({ onBack }: GameRulesProps) => {
  const [lang] = useLang();

  const rules = [
    { icon: Grid3X3, title: t("rules.board"), desc: t("rules.boardDesc") },
    { icon: Target, title: t("rules.firstMove"), desc: t("rules.firstMoveDesc") },
    { icon: Trophy, title: t("rules.goal"), desc: t("rules.goalDesc") },
    { icon: Undo2, title: t("rules.undo"), desc: t("rules.undoDesc") },
    { icon: Handshake, title: t("rules.drawRule"), desc: t("rules.drawRuleDesc") },
    { icon: RotateCcw, title: t("rules.swap"), desc: t("rules.swapDesc") },
  ];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md px-4">
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-xl sm:text-2xl font-black tracking-wide text-center"
        style={{ fontFamily: "'Press Start 2P', cursive", color: "hsl(var(--primary))", textShadow: "var(--neon-glow)" }}
      >
        {t("rules.title")}
      </motion.h1>

      <div className="flex flex-col gap-3 w-full">
        {rules.map((rule, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <rule.icon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "hsl(var(--primary))" }} />
            <div>
              <h3 className="font-bold text-xs mb-1" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "0.55rem", color: "hsl(var(--primary))" }}>
                {rule.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{rule.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button onClick={onBack} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        className="flex items-center justify-center gap-3 w-full py-3 rounded font-bold text-sm uppercase tracking-wider transition-colors"
        style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "0.7rem", backgroundColor: "hsl(var(--muted))", border: "3px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
        <ArrowLeft className="w-5 h-5" />
        {t("rules.back")}
      </motion.button>
    </div>
  );
};

export default GameRules;

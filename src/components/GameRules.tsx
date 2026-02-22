import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Target, Trophy, Grid3X3, Undo2, Handshake, RotateCcw, Circle, SkipForward, Lightbulb } from "lucide-react";
import { t, useLang } from "@/lib/i18n";
import { getThemeConfig, useTheme } from "@/lib/theme";

interface GameRulesProps {
  onBack: () => void;
}

const GameRules = ({ onBack }: GameRulesProps) => {
  const [lang] = useLang();
  const [themeId] = useTheme();
  const theme = getThemeConfig(themeId);
  const [tab, setTab] = useState<"fiveStrike" | "reversi">("fiveStrike");

  const fiveStrikeRules = [
    { icon: Grid3X3, title: t("rules.board"), desc: t("rules.boardDesc") },
    { icon: Target, title: t("rules.firstMove"), desc: t("rules.firstMoveDesc") },
    { icon: Trophy, title: t("rules.goal"), desc: t("rules.goalDesc") },
    { icon: Undo2, title: t("rules.undo"), desc: t("rules.undoDesc") },
    { icon: Handshake, title: t("rules.drawRule"), desc: t("rules.drawRuleDesc") },
    { icon: RotateCcw, title: t("rules.swap"), desc: t("rules.swapDesc") },
  ];

  const reversiRules = [
    { icon: Grid3X3, title: t("rules.reversiBoard"), desc: t("rules.reversiBoardDesc") },
    { icon: Circle, title: t("rules.reversiMoves"), desc: t("rules.reversiMovesDesc") },
    { icon: SkipForward, title: t("rules.reversiPass"), desc: t("rules.reversiPassDesc") },
    { icon: Trophy, title: t("rules.reversiGoal"), desc: t("rules.reversiGoalDesc") },
    { icon: Lightbulb, title: t("rules.reversiStrategy"), desc: t("rules.reversiStrategyDesc") },
  ];

  const rules = tab === "fiveStrike" ? fiveStrikeRules : reversiRules;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md px-4">
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-xl sm:text-2xl font-black tracking-wide text-center"
        style={{ fontFamily: theme.headingFont, color: "hsl(var(--primary))", textShadow: "var(--neon-glow)" }}
      >
        {t("rules.title")}
      </motion.h1>

      {/* Game tabs */}
      <div className="flex gap-2 w-full">
        <button onClick={() => setTab("fiveStrike")}
          className="flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
          style={{
            fontFamily: theme.headingFont,
            fontSize: themeId === "arcade" ? "0.5rem" : "0.65rem",
            backgroundColor: tab === "fiveStrike" ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted))",
            border: `2px solid ${tab === "fiveStrike" ? "hsl(var(--primary) / 0.5)" : "hsl(var(--border))"}`,
            color: tab === "fiveStrike" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
          }}>
          ✕○ Five Strike
        </button>
        <button onClick={() => setTab("reversi")}
          className="flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
          style={{
            fontFamily: theme.headingFont,
            fontSize: themeId === "arcade" ? "0.5rem" : "0.65rem",
            backgroundColor: tab === "reversi" ? "hsl(var(--secondary) / 0.15)" : "hsl(var(--muted))",
            border: `2px solid ${tab === "reversi" ? "hsl(var(--secondary) / 0.5)" : "hsl(var(--border))"}`,
            color: tab === "reversi" ? "hsl(var(--secondary))" : "hsl(var(--muted-foreground))",
          }}>
          ⚫⚪ Reversi
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
          className="flex flex-col gap-3 w-full">
          {rules.map((rule, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              <rule.icon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: tab === "fiveStrike" ? "hsl(var(--primary))" : "hsl(var(--secondary))" }} />
              <div>
                <h3 className="font-bold text-sm mb-1" style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "0.6rem" : undefined, color: tab === "fiveStrike" ? "hsl(var(--primary))" : "hsl(var(--secondary))" }}>
                  {rule.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{rule.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <motion.button onClick={onBack} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        className="flex items-center justify-center gap-3 w-full py-3 rounded font-bold text-sm uppercase tracking-wider transition-colors"
        style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "0.6rem" : "0.75rem", backgroundColor: "hsl(var(--muted))", border: "2px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
        <ArrowLeft className="w-5 h-5" />
        {t("rules.back")}
      </motion.button>
    </div>
  );
};

export default GameRules;

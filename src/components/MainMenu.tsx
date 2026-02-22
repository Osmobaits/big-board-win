import { useState } from "react";
import { Swords, Trophy, Users, Play, Trash2, BarChart3, BookOpen, Globe, Palette, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { hasSavedSingleGame, hasSavedTournament, clearSingleGame, clearTournament, hasSavedReversiSingle, hasSavedReversiTournament, clearReversiSingleGame, clearReversiTournament } from "@/lib/storage";
import { VERSION_STRING } from "@/lib/version";
import { t, useLang, LANG_OPTIONS } from "@/lib/i18n";
import { useTheme, THEMES, getThemeConfig } from "@/lib/theme";

export type GameType = "fiveStrike" | "reversi";

interface MainMenuProps {
  onSingleGame: () => void;
  onDuel: () => void;
  onTournament: () => void;
  onResumeSingle: () => void;
  onResumeTournament: () => void;
  onReversiSingle: () => void;
  onReversiDuel: () => void;
  onReversiTournament: () => void;
  onResumeReversiSingle: () => void;
  onResumeReversiTournament: () => void;
  onHistory: () => void;
  onRules: () => void;
}

const MainMenu = ({
  onSingleGame, onDuel, onTournament, onResumeSingle, onResumeTournament,
  onReversiSingle, onReversiDuel, onReversiTournament, onResumeReversiSingle, onResumeReversiTournament,
  onHistory, onRules,
}: MainMenuProps) => {
  const [hasSingle, setHasSingle] = useState(hasSavedSingleGame());
  const [hasTournament, setHasTournament] = useState(hasSavedTournament());
  const [hasReversiSingle, setHasReversiSingle] = useState(hasSavedReversiSingle());
  const [hasReversiTournament, setHasReversiTournament] = useState(hasSavedReversiTournament());
  const [confirmDelete, setConfirmDelete] = useState<"single" | "tournament" | "reversi-single" | "reversi-tournament" | null>(null);
  const [lang, setLang] = useLang();
  const [showLang, setShowLang] = useState(false);
  const [themeId, setTheme] = useTheme();
  const [showTheme, setShowTheme] = useState(false);
  const [gameType, setGameType] = useState<GameType>("fiveStrike");
  const theme = getThemeConfig(themeId);

  const handleDelete = () => {
    if (confirmDelete === "single") { clearSingleGame(); setHasSingle(false); }
    else if (confirmDelete === "tournament") { clearTournament(); setHasTournament(false); }
    else if (confirmDelete === "reversi-single") { clearReversiSingleGame(); setHasReversiSingle(false); }
    else if (confirmDelete === "reversi-tournament") { clearReversiTournament(); setHasReversiTournament(false); }
    setConfirmDelete(null);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md px-4">
      {/* Top bar: theme + language */}
      <div className="flex justify-between w-full">
        <div className="relative">
          <button onClick={() => { setShowTheme(!showTheme); setShowLang(false); }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors hover:bg-muted"
            style={{ color: "hsl(var(--muted-foreground))" }}>
            <Palette className="w-3.5 h-3.5" /> {theme.emoji}
          </button>
          {showTheme && (
            <div className="absolute left-0 top-full mt-1 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden">
              {THEMES.map((th) => (
                <button key={th.id} onClick={() => { setTheme(th.id); setShowTheme(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-xs text-left transition-colors hover:bg-muted ${themeId === th.id ? "bg-primary/10 text-primary" : "text-foreground"}`}>
                  <span>{th.emoji}</span><span>{th.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => { setShowLang(!showLang); setShowTheme(false); }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors hover:bg-muted"
            style={{ color: "hsl(var(--muted-foreground))" }}>
            <Globe className="w-3.5 h-3.5" /> {LANG_OPTIONS.find((l) => l.code === lang)?.flag}
          </button>
          {showLang && (
            <div className="absolute right-0 top-full mt-1 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden">
              {LANG_OPTIONS.map((l) => (
                <button key={l.code} onClick={() => { setLang(l.code); setShowLang(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-xs text-left transition-colors hover:bg-muted ${lang === l.code ? "bg-primary/10 text-primary" : "text-foreground"}`}>
                  <span>{l.flag}</span><span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Game selector */}
      <div className="flex gap-2 w-full">
        <button onClick={() => setGameType("fiveStrike")}
          className="flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
          style={{
            fontFamily: theme.headingFont,
            fontSize: themeId === "arcade" ? "0.55rem" : "0.7rem",
            backgroundColor: gameType === "fiveStrike" ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted))",
            border: `2px solid ${gameType === "fiveStrike" ? "hsl(var(--primary) / 0.5)" : "hsl(var(--border))"}`,
            color: gameType === "fiveStrike" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
            textShadow: gameType === "fiveStrike" ? "var(--neon-glow)" : "none",
          }}>
          ✕○ Five Strike
        </button>
        <button onClick={() => setGameType("reversi")}
          className="flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
          style={{
            fontFamily: theme.headingFont,
            fontSize: themeId === "arcade" ? "0.55rem" : "0.7rem",
            backgroundColor: gameType === "reversi" ? "hsl(var(--secondary) / 0.15)" : "hsl(var(--muted))",
            border: `2px solid ${gameType === "reversi" ? "hsl(var(--secondary) / 0.5)" : "hsl(var(--border))"}`,
            color: gameType === "reversi" ? "hsl(var(--secondary))" : "hsl(var(--muted-foreground))",
            textShadow: gameType === "reversi" ? "var(--neon-glow-secondary)" : "none",
          }}>
          ⚫⚪ Reversi
        </button>
      </div>

      {/* Title */}
      <AnimatePresence mode="wait">
        <motion.div key={gameType} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="flex flex-col items-center gap-2">
          {gameType === "fiveStrike" ? (
            <>
              <motion.h1
                className="text-3xl sm:text-4xl font-black tracking-wide text-center leading-relaxed"
                style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? undefined : "2.5rem", color: "hsl(var(--primary))", textShadow: "var(--neon-glow), 0 0 40px hsl(var(--primary) / 0.3)" }}>
                FIVE <span style={{ color: "hsl(var(--secondary))", textShadow: "var(--neon-glow-secondary)" }}>STRIKE</span>
              </motion.h1>
              <p className="text-muted-foreground text-xs tracking-widest text-center uppercase" style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "0.6rem" : "0.75rem" }}>
                {t("menu.subtitle")}
              </p>
              <div className="flex items-center gap-4 text-2xl font-bold">
                <span className="text-primary" style={{ textShadow: "var(--neon-glow)", fontFamily: theme.headingFont }}>✕</span>
                <span className="text-muted-foreground text-xs">VS</span>
                <span className="text-secondary" style={{ textShadow: "var(--neon-glow-secondary)", fontFamily: theme.headingFont }}>○</span>
              </div>
            </>
          ) : (
            <>
              <motion.h1
                className="text-3xl sm:text-4xl font-black tracking-wide text-center leading-relaxed"
                style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "1.5rem" : "2.5rem", color: "hsl(var(--secondary))", textShadow: "var(--neon-glow-secondary), 0 0 40px hsl(var(--secondary) / 0.3)" }}>
                REVERSI
              </motion.h1>
              <p className="text-muted-foreground text-xs tracking-widest text-center uppercase" style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "0.6rem" : "0.75rem" }}>
                {t("reversi.subtitle")}
              </p>
              <div className="flex items-center gap-4 text-2xl font-bold">
                <span className="w-6 h-6 rounded-full inline-block" style={{ backgroundColor: "hsl(var(--primary))", boxShadow: "var(--neon-glow)" }} />
                <span className="text-muted-foreground text-xs">VS</span>
                <span className="w-6 h-6 rounded-full inline-block" style={{ backgroundColor: "hsl(var(--secondary))", boxShadow: "var(--neon-glow-secondary)" }} />
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Menu buttons */}
      <div className="flex flex-col gap-4 w-full mt-4">
        {/* Continue buttons */}
        {gameType === "fiveStrike" && hasSingle && (
          <ContinueButton label={t("menu.continueGame")} onContinue={onResumeSingle} onDelete={() => setConfirmDelete("single")} />
        )}
        {gameType === "fiveStrike" && hasTournament && (
          <ContinueButton label={t("menu.continueTournament")} onContinue={onResumeTournament} onDelete={() => setConfirmDelete("tournament")} />
        )}
        {gameType === "reversi" && hasReversiSingle && (
          <ContinueButton label={t("menu.continueGame")} onContinue={onResumeReversiSingle} onDelete={() => setConfirmDelete("reversi-single")} />
        )}
        {gameType === "reversi" && hasReversiTournament && (
          <ContinueButton label={t("menu.continueTournament")} onContinue={onResumeReversiTournament} onDelete={() => setConfirmDelete("reversi-tournament")} />
        )}

        {/* Main actions */}
        {[
          { onClick: gameType === "fiveStrike" ? onSingleGame : onReversiSingle, icon: Swords, label: t("menu.singleGame"), variant: "primary" as const },
          { onClick: gameType === "fiveStrike" ? onDuel : onReversiDuel, icon: Users, label: t("menu.duel"), variant: "secondary" as const },
          { onClick: gameType === "fiveStrike" ? onTournament : onReversiTournament, icon: Trophy, label: t("menu.tournament"), variant: "accent" as const },
        ].map(({ onClick, icon: Icon, label, variant }) => (
          <motion.button key={label} onClick={onClick} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-3 w-full py-4 rounded font-bold text-sm uppercase tracking-wider transition-colors"
            style={{
              fontFamily: theme.headingFont,
              fontSize: themeId === "arcade" ? "0.7rem" : "0.85rem",
              backgroundColor: `hsl(var(--${variant}) / 0.15)`,
              border: `3px solid hsl(var(--${variant}) / 0.5)`,
              color: `hsl(var(--${variant}))`,
              textShadow: `var(--neon-glow${variant === "primary" ? "" : `-${variant}`})`,
              boxShadow: `var(--neon-glow${variant === "primary" ? "" : `-${variant}`}), inset 0 0 20px hsl(var(--${variant}) / 0.05)`,
            }}>
            <Icon className="w-5 h-5" /> {label}
          </motion.button>
        ))}

        <motion.button onClick={onHistory} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-3 w-full py-4 rounded font-bold text-sm uppercase tracking-wider transition-colors"
          style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "0.7rem" : "0.85rem", backgroundColor: "hsl(var(--muted))", border: "3px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
          <BarChart3 className="w-5 h-5" /> {t("menu.scoreboard")}
        </motion.button>

        <motion.button onClick={onRules} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-3 w-full py-3 rounded font-bold text-sm uppercase tracking-wider transition-colors"
          style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "0.6rem" : "0.75rem", backgroundColor: "transparent", border: "2px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
          <BookOpen className="w-4 h-4" /> {t("menu.rules")}
        </motion.button>
      </div>

      <p className="text-muted-foreground/50 text-center mt-2" style={{ fontFamily: theme.headingFont, fontSize: "0.45rem" }}>
        {VERSION_STRING}
      </p>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "hsl(0 0% 0% / 0.7)" }} onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-4 p-6 rounded-xl max-w-sm w-full"
              style={{ backgroundColor: "hsl(var(--card))", border: "2px solid hsl(0 60% 50% / 0.4)", boxShadow: "0 0 30px hsl(0 60% 50% / 0.2)" }}
              onClick={(e) => e.stopPropagation()}>
              <Trash2 className="w-8 h-8" style={{ color: "hsl(0 60% 50%)" }} />
              <p className="text-center text-foreground font-bold text-sm">
                {confirmDelete.includes("tournament") ? t("confirm.deleteTournament") : t("confirm.deleteGame")}
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 rounded-lg font-bold uppercase text-xs tracking-wider bg-muted text-foreground hover:bg-border transition-colors">
                  {t("btn.cancel")}
                </button>
                <button onClick={handleDelete} className="flex-1 py-2 rounded-lg font-bold uppercase text-xs tracking-wider transition-colors"
                  style={{ backgroundColor: "hsl(0 60% 50%)", color: "hsl(0 0% 100%)" }}>
                  {t("btn.delete")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper component for continue buttons
const ContinueButton = ({ label, onContinue, onDelete }: { label: string; onContinue: () => void; onDelete: () => void }) => (
  <div className="flex gap-2 w-full">
    <button onClick={onContinue}
      className="flex items-center justify-center gap-3 flex-1 py-3 rounded-xl font-bold text-base uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
      style={{ backgroundColor: "hsl(var(--accent) / 0.1)", border: "2px solid hsl(var(--accent) / 0.4)", color: "hsl(var(--accent))", textShadow: "var(--neon-glow-accent)", boxShadow: "var(--neon-glow-accent)" }}>
      <Play className="w-5 h-5" /> {label}
    </button>
    <button onClick={onDelete}
      className="flex items-center justify-center px-3 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-[1.05]"
      style={{ backgroundColor: "hsl(0 60% 50% / 0.15)", border: "2px solid hsl(0 60% 50% / 0.4)", color: "hsl(0 60% 50%)" }}>
      <Trash2 className="w-5 h-5" />
    </button>
  </div>
);

export default MainMenu;

import { useState } from "react";
import { Swords, Trophy, Users, Play, Trash2, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { hasSavedSingleGame, hasSavedTournament, clearSingleGame, clearTournament } from "@/lib/storage";
import logoArcade from "@/assets/logo-arcade.png";

interface MainMenuProps {
  onSingleGame: () => void;
  onDuel: () => void;
  onTournament: () => void;
  onResumeSingle: () => void;
  onResumeTournament: () => void;
  onHistory: () => void;
}

const MainMenu = ({ onSingleGame, onDuel, onTournament, onResumeSingle, onResumeTournament, onHistory }: MainMenuProps) => {
  const [hasSingle, setHasSingle] = useState(hasSavedSingleGame());
  const [hasTournament, setHasTournament] = useState(hasSavedTournament());
  const [confirmDelete, setConfirmDelete] = useState<"single" | "tournament" | null>(null);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md px-4">
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="text-3xl sm:text-4xl font-black tracking-wide text-center leading-relaxed"
        style={{
          fontFamily: "'Press Start 2P', cursive",
          color: "hsl(var(--primary))",
          textShadow: "var(--neon-glow), 0 0 40px hsl(var(--primary) / 0.3)",
        }}
      >
        FIVE{" "}
        <span style={{ color: "hsl(var(--secondary))", textShadow: "var(--neon-glow-secondary)" }}>STRIKE</span>
      </motion.h1>
      <p className="text-muted-foreground text-xs tracking-widest text-center uppercase" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "0.6rem" }}>
        Plansza 12×12 · Wygrywa 5 w linii
      </p>

      {/* Pixel-art X vs O decorative symbols */}
      <div className="flex items-center gap-4 text-2xl font-bold">
        <span className="text-primary" style={{ textShadow: "var(--neon-glow)", fontFamily: "'Press Start 2P', cursive" }}>✕</span>
        <span className="text-muted-foreground text-xs">VS</span>
        <span className="text-secondary" style={{ textShadow: "var(--neon-glow-secondary)", fontFamily: "'Press Start 2P', cursive" }}>○</span>
      </div>

      <div className="flex flex-col gap-4 w-full mt-4">
        {/* Resume buttons */}
        {hasSingle && (
          <div className="flex gap-2 w-full">
            <button
              onClick={onResumeSingle}
              className="flex items-center justify-center gap-3 flex-1 py-3 rounded-xl font-bold text-base uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: "hsl(var(--accent) / 0.1)",
                border: "2px solid hsl(var(--accent) / 0.4)",
                color: "hsl(var(--accent))",
                textShadow: "var(--neon-glow-accent)",
                boxShadow: "var(--neon-glow-accent)",
              }}
            >
              <Play className="w-5 h-5" />
              Kontynuuj grę
            </button>
            <button
              onClick={() => setConfirmDelete("single")}
              className="flex items-center justify-center px-3 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-[1.05]"
              style={{
                backgroundColor: "hsl(0 60% 50% / 0.15)",
                border: "2px solid hsl(0 60% 50% / 0.4)",
                color: "hsl(0 60% 50%)",
              }}
              title="Usuń zapisaną grę"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}

        {hasTournament && (
          <div className="flex gap-2 w-full">
            <button
              onClick={onResumeTournament}
              className="flex items-center justify-center gap-3 flex-1 py-3 rounded-xl font-bold text-base uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: "hsl(var(--accent) / 0.1)",
                border: "2px solid hsl(var(--accent) / 0.4)",
                color: "hsl(var(--accent))",
                textShadow: "var(--neon-glow-accent)",
                boxShadow: "var(--neon-glow-accent)",
              }}
            >
              <Play className="w-5 h-5" />
              Kontynuuj turniej
            </button>
            <button
              onClick={() => setConfirmDelete("tournament")}
              className="flex items-center justify-center px-3 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-[1.05]"
              style={{
                backgroundColor: "hsl(0 60% 50% / 0.15)",
                border: "2px solid hsl(0 60% 50% / 0.4)",
                color: "hsl(0 60% 50%)",
              }}
              title="Usuń zapisany turniej"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}

        <motion.button
          onClick={onSingleGame}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-3 w-full py-4 rounded font-bold text-sm uppercase tracking-wider transition-colors"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "0.7rem",
            backgroundColor: "hsl(var(--primary) / 0.15)",
            border: "3px solid hsl(var(--primary) / 0.5)",
            color: "hsl(var(--primary))",
            textShadow: "var(--neon-glow)",
            boxShadow: "var(--neon-glow), inset 0 0 20px hsl(var(--primary) / 0.05)",
          }}
        >
          <Swords className="w-5 h-5" />
          Pojedyncza gra
        </motion.button>

        <motion.button
          onClick={onDuel}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-3 w-full py-4 rounded font-bold text-sm uppercase tracking-wider transition-colors"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "0.7rem",
            backgroundColor: "hsl(var(--secondary) / 0.15)",
            border: "3px solid hsl(var(--secondary) / 0.5)",
            color: "hsl(var(--secondary))",
            textShadow: "var(--neon-glow-secondary)",
            boxShadow: "var(--neon-glow-secondary), inset 0 0 20px hsl(var(--secondary) / 0.05)",
          }}
        >
          <Users className="w-5 h-5" />
          Turniej 1 vs 1
        </motion.button>

        <motion.button
          onClick={onTournament}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-3 w-full py-4 rounded font-bold text-sm uppercase tracking-wider transition-colors"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "0.7rem",
            backgroundColor: "hsl(var(--accent) / 0.15)",
            border: "3px solid hsl(var(--accent) / 0.5)",
            color: "hsl(var(--accent))",
            textShadow: "var(--neon-glow-accent)",
            boxShadow: "var(--neon-glow-accent), inset 0 0 20px hsl(var(--accent) / 0.05)",
          }}
        >
          <Trophy className="w-5 h-5" />
          Turniej wieloosobowy
        </motion.button>

        <motion.button
          onClick={onHistory}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-3 w-full py-4 rounded font-bold text-sm uppercase tracking-wider transition-colors"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "0.7rem",
            backgroundColor: "hsl(var(--muted))",
            border: "3px solid hsl(var(--border))",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          <BarChart3 className="w-5 h-5" />
          Tablica wyników
        </motion.button>
      </div>

      {/* Confirmation dialog */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "hsl(0 0% 0% / 0.7)" }}
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-4 p-6 rounded-xl max-w-sm w-full"
              style={{
                backgroundColor: "hsl(var(--card))",
                border: "2px solid hsl(0 60% 50% / 0.4)",
                boxShadow: "0 0 30px hsl(0 60% 50% / 0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="w-8 h-8" style={{ color: "hsl(0 60% 50%)" }} />
              <p className="text-center text-foreground font-bold text-sm">
                {confirmDelete === "single"
                  ? "Czy na pewno chcesz usunąć zapisaną grę?"
                  : "Czy na pewno chcesz usunąć zapisany turniej?"}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2 rounded-lg font-bold uppercase text-xs tracking-wider bg-muted text-foreground hover:bg-border transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={() => {
                    if (confirmDelete === "single") {
                      clearSingleGame();
                      setHasSingle(false);
                    } else {
                      clearTournament();
                      setHasTournament(false);
                    }
                    setConfirmDelete(null);
                  }}
                  className="flex-1 py-2 rounded-lg font-bold uppercase text-xs tracking-wider transition-colors"
                  style={{
                    backgroundColor: "hsl(0 60% 50%)",
                    color: "hsl(0 0% 100%)",
                  }}
                >
                  Usuń
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainMenu;

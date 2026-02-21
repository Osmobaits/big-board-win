import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainMenu from "@/components/MainMenu";
import SingleGame from "@/components/SingleGame";
import TournamentMode from "@/components/TournamentMode";
import GameRules from "@/components/GameRules";
import GameHistory from "@/components/GameHistory";
import { loadSingleGame, loadTournament } from "@/lib/storage";
import { useTheme, getThemeConfig } from "@/lib/theme";

type Screen = "menu" | "single" | "single-resume" | "duel" | "tournament" | "tournament-resume" | "history" | "rules";

const screenVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -20 },
};

const Index = () => {
  const [screen, setScreen] = useState<Screen>("menu");
  const [themeId] = useTheme();
  const theme = getThemeConfig(themeId);

  const savedSingle = screen === "single-resume" ? loadSingleGame() : null;
  const savedTournament = screen === "tournament-resume" ? loadTournament() : null;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-8 p-4 relative"
      style={{
        backgroundImage: `url(${theme.bg})`,
        backgroundSize: "512px 512px",
        backgroundRepeat: "repeat",
      }}
    >
      <div className="absolute inset-0 bg-background/70" />
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 w-full flex-1">
        <AnimatePresence mode="wait">
          {screen === "menu" && (
            <motion.div key="menu" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="w-full flex flex-col items-center">
              <MainMenu onSingleGame={() => setScreen("single")} onDuel={() => setScreen("duel")} onTournament={() => setScreen("tournament")} onResumeSingle={() => setScreen("single-resume")} onResumeTournament={() => setScreen("tournament-resume")} onHistory={() => setScreen("history")} onRules={() => setScreen("rules")} />
            </motion.div>
          )}
          {(screen === "single" || screen === "single-resume") && (
            <motion.div key="single" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="w-full flex flex-col items-center">
              <SingleGame onBack={() => setScreen("menu")} resumeData={savedSingle} />
            </motion.div>
          )}
          {screen === "duel" && (
            <motion.div key="duel" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="w-full flex flex-col items-center">
              <TournamentMode onBack={() => setScreen("menu")} maxPlayers={2} />
            </motion.div>
          )}
          {screen === "tournament" && (
            <motion.div key="tournament" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="w-full flex flex-col items-center">
              <TournamentMode onBack={() => setScreen("menu")} minPlayers={3} />
            </motion.div>
          )}
          {screen === "tournament-resume" && savedTournament && (
            <motion.div key="tournament-resume" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="w-full flex flex-col items-center">
              <TournamentMode onBack={() => setScreen("menu")} resumePlayers={savedTournament.players} resumeMatches={savedTournament.matches} />
            </motion.div>
          )}
          {screen === "history" && (
            <motion.div key="history" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="w-full flex flex-col items-center">
              <GameHistory onBack={() => setScreen("menu")} />
            </motion.div>
          )}
          {screen === "rules" && (
            <motion.div key="rules" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="w-full flex flex-col items-center">
              <GameRules onBack={() => setScreen("menu")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;

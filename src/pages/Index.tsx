import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainMenu from "@/components/MainMenu";
import SingleGame from "@/components/SingleGame";
import ReversiSingleGame from "@/components/ReversiSingleGame";
import TournamentMode from "@/components/TournamentMode";
import SpaceInvaders from "@/components/SpaceInvaders";
import GameRules from "@/components/GameRules";
import GameHistory from "@/components/GameHistory";
import ReversiBoard from "@/components/ReversiBoard";
import { loadSingleGame, loadTournament, loadReversiSingleGame, loadReversiTournament } from "@/lib/storage";
import { useTheme, getThemeConfig } from "@/lib/theme";

type Screen =
  | "menu"
  | "single" | "single-resume" | "duel" | "tournament" | "tournament-resume"
  | "reversi-single" | "reversi-single-resume" | "reversi-duel" | "reversi-tournament" | "reversi-tournament-resume"
  | "galaga"
  | "history" | "rules";

const screenVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -20 },
};

const MotionWrap = ({ children, screenKey }: { children: React.ReactNode; screenKey: string }) => (
  <motion.div key={screenKey} variants={screenVariants} initial="initial" animate="animate" exit="exit"
    transition={{ duration: 0.25, ease: "easeOut" }} className="w-full flex flex-col items-center">
    {children}
  </motion.div>
);

const Index = () => {
  const [screen, setScreen] = useState<Screen>("menu");
  const [themeId] = useTheme();
  const theme = getThemeConfig(themeId);

  const savedSingle = screen === "single-resume" ? loadSingleGame() : null;
  const savedTournament = screen === "tournament-resume" ? loadTournament() : null;
  const savedReversiSingle = screen === "reversi-single-resume" ? loadReversiSingleGame() : null;
  const savedReversiTournament = screen === "reversi-tournament-resume" ? loadReversiTournament() : null;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-8 p-4 relative"
      style={{ backgroundImage: `url(${theme.bg})`, backgroundSize: "512px 512px", backgroundRepeat: "repeat" }}
    >
      <div className="absolute inset-0 bg-background/70" />
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 w-full flex-1">
        <AnimatePresence mode="wait">
          {screen === "menu" && (
            <MotionWrap screenKey="menu">
              <MainMenu
                onSingleGame={() => setScreen("single")}
                onDuel={() => setScreen("duel")}
                onTournament={() => setScreen("tournament")}
                onResumeSingle={() => setScreen("single-resume")}
                onResumeTournament={() => setScreen("tournament-resume")}
                onReversiSingle={() => setScreen("reversi-single")}
                onReversiDuel={() => setScreen("reversi-duel")}
                onReversiTournament={() => setScreen("reversi-tournament")}
                onResumeReversiSingle={() => setScreen("reversi-single-resume")}
                onResumeReversiTournament={() => setScreen("reversi-tournament-resume")}
                onHistory={() => setScreen("history")}
                onRules={() => setScreen("rules")}
                onGalaga={() => setScreen("galaga")}
              />
            </MotionWrap>
          )}

          {/* Five Strike modes */}
          {(screen === "single" || screen === "single-resume") && (
            <MotionWrap screenKey="single">
              <SingleGame onBack={() => setScreen("menu")} resumeData={savedSingle} />
            </MotionWrap>
          )}
          {screen === "duel" && (
            <MotionWrap screenKey="duel">
              <TournamentMode onBack={() => setScreen("menu")} maxPlayers={2} />
            </MotionWrap>
          )}
          {screen === "tournament" && (
            <MotionWrap screenKey="tournament">
              <TournamentMode onBack={() => setScreen("menu")} minPlayers={3} />
            </MotionWrap>
          )}
          {screen === "tournament-resume" && savedTournament && (
            <MotionWrap screenKey="tournament-resume">
              <TournamentMode onBack={() => setScreen("menu")} resumePlayers={savedTournament.players} resumeMatches={savedTournament.matches} />
            </MotionWrap>
          )}

          {/* Reversi modes */}
          {(screen === "reversi-single" || screen === "reversi-single-resume") && (
            <MotionWrap screenKey="reversi-single">
              <ReversiSingleGame onBack={() => setScreen("menu")} resumeData={savedReversiSingle} />
            </MotionWrap>
          )}
          {screen === "reversi-duel" && (
            <MotionWrap screenKey="reversi-duel">
              <TournamentMode onBack={() => setScreen("menu")} maxPlayers={2} BoardComponent={ReversiBoard} gameId="reversi" />
            </MotionWrap>
          )}
          {screen === "reversi-tournament" && (
            <MotionWrap screenKey="reversi-tournament">
              <TournamentMode onBack={() => setScreen("menu")} minPlayers={3} BoardComponent={ReversiBoard} gameId="reversi" />
            </MotionWrap>
          )}
          {screen === "reversi-tournament-resume" && savedReversiTournament && (
            <MotionWrap screenKey="reversi-tournament-resume">
              <TournamentMode onBack={() => setScreen("menu")} resumePlayers={savedReversiTournament.players} resumeMatches={savedReversiTournament.matches} BoardComponent={ReversiBoard} gameId="reversi" />
            </MotionWrap>
          )}

          {/* Galaga */}
          {screen === "galaga" && (
            <MotionWrap screenKey="galaga">
              <SpaceInvaders onBack={() => setScreen("menu")} />
            </MotionWrap>
          )}

          {/* Shared */}
          {screen === "history" && (
            <MotionWrap screenKey="history">
              <GameHistory onBack={() => setScreen("menu")} />
            </MotionWrap>
          )}
          {screen === "rules" && (
            <MotionWrap screenKey="rules">
              <GameRules onBack={() => setScreen("menu")} />
            </MotionWrap>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;

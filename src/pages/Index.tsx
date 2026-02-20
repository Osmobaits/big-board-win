import { useState } from "react";
import MainMenu from "@/components/MainMenu";
import SingleGame from "@/components/SingleGame";
import TournamentMode from "@/components/TournamentMode";
import { loadSingleGame, loadTournament, clearSingleGame } from "@/lib/storage";
import bgArcade from "@/assets/bg-arcade.png";

type Screen = "menu" | "single" | "single-resume" | "duel" | "tournament" | "tournament-resume";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("menu");

  const savedSingle = screen === "single-resume" ? loadSingleGame() : null;
  const savedTournament = screen === "tournament-resume" ? loadTournament() : null;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-8 p-4 relative"
      style={{
        backgroundImage: `url(${bgArcade})`,
        backgroundSize: "512px 512px",
        backgroundRepeat: "repeat",
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-background/70" />
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 w-full flex-1">
        {screen === "menu" && (
          <MainMenu
            onSingleGame={() => { clearSingleGame(); setScreen("single"); }}
            onDuel={() => setScreen("duel")}
            onTournament={() => setScreen("tournament")}
            onResumeSingle={() => setScreen("single-resume")}
            onResumeTournament={() => setScreen("tournament-resume")}
          />
        )}
        {(screen === "single" || screen === "single-resume") && (
          <SingleGame
            onBack={() => setScreen("menu")}
            resumeData={savedSingle}
          />
        )}
        {screen === "duel" && (
          <TournamentMode onBack={() => setScreen("menu")} maxPlayers={2} />
        )}
        {screen === "tournament" && (
          <TournamentMode onBack={() => setScreen("menu")} minPlayers={3} />
        )}
        {screen === "tournament-resume" && savedTournament && (
          <TournamentMode
            onBack={() => setScreen("menu")}
            resumePlayers={savedTournament.players}
            resumeMatches={savedTournament.matches}
          />
        )}
      </div>
    </div>
  );
};

export default Index;

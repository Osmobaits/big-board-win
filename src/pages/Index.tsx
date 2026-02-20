import { useState } from "react";
import MainMenu from "@/components/MainMenu";
import SingleGame from "@/components/SingleGame";
import TournamentMode from "@/components/TournamentMode";
import { loadSingleGame, loadTournament, clearSingleGame } from "@/lib/storage";

type Screen = "menu" | "single" | "single-resume" | "tournament" | "tournament-resume";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("menu");

  const savedSingle = screen === "single-resume" ? loadSingleGame() : null;
  const savedTournament = screen === "tournament-resume" ? loadTournament() : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      {screen === "menu" && (
        <MainMenu
          onSingleGame={() => { clearSingleGame(); setScreen("single"); }}
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
      {screen === "tournament" && (
        <TournamentMode onBack={() => setScreen("menu")} />
      )}
      {screen === "tournament-resume" && savedTournament && (
        <TournamentMode
          onBack={() => setScreen("menu")}
          resumePlayers={savedTournament.players}
          resumeMatches={savedTournament.matches}
        />
      )}
    </div>
  );
};

export default Index;

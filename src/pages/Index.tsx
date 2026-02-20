import { useState } from "react";
import MainMenu from "@/components/MainMenu";
import SingleGame from "@/components/SingleGame";
import TournamentMode from "@/components/TournamentMode";

type Screen = "menu" | "single" | "tournament";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("menu");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      {screen === "menu" && (
        <MainMenu
          onSingleGame={() => setScreen("single")}
          onTournament={() => setScreen("tournament")}
        />
      )}
      {screen === "single" && (
        <SingleGame onBack={() => setScreen("menu")} />
      )}
      {screen === "tournament" && (
        <TournamentMode onBack={() => setScreen("menu")} />
      )}
    </div>
  );
};

export default Index;

import { useState } from "react";
import { Swords, Trophy, ArrowLeft } from "lucide-react";

interface MainMenuProps {
  onSingleGame: () => void;
  onTournament: () => void;
}

const MainMenu = ({ onSingleGame, onTournament }: MainMenuProps) => {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md px-4">
      <h1
        className="text-4xl sm:text-5xl font-black tracking-widest text-primary uppercase text-center"
        style={{ textShadow: "var(--neon-glow)" }}
      >
        5 w rzędzie
      </h1>
      <p className="text-muted-foreground text-sm tracking-wide text-center">
        Plansza 12×12 · Wygrywa 5 w linii
      </p>

      <div className="flex flex-col gap-4 w-full mt-4">
        <button
          onClick={onSingleGame}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
          style={{
            backgroundColor: "hsl(var(--primary) / 0.1)",
            border: "2px solid hsl(var(--primary) / 0.4)",
            color: "hsl(var(--primary))",
            textShadow: "var(--neon-glow)",
            boxShadow: "var(--neon-glow)",
          }}
        >
          <Swords className="w-6 h-6" />
          Pojedyncza gra
        </button>

        <button
          onClick={onTournament}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
          style={{
            backgroundColor: "hsl(var(--secondary) / 0.1)",
            border: "2px solid hsl(var(--secondary) / 0.4)",
            color: "hsl(var(--secondary))",
            textShadow: "var(--neon-glow-secondary)",
            boxShadow: "var(--neon-glow-secondary)",
          }}
        >
          <Trophy className="w-6 h-6" />
          Turniej
        </button>
      </div>
    </div>
  );
};

export default MainMenu;

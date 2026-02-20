import { Swords, Trophy, Users, Play } from "lucide-react";
import { hasSavedSingleGame, hasSavedTournament } from "@/lib/storage";

interface MainMenuProps {
  onSingleGame: () => void;
  onDuel: () => void;
  onTournament: () => void;
  onResumeSingle: () => void;
  onResumeTournament: () => void;
}

const MainMenu = ({ onSingleGame, onDuel, onTournament, onResumeSingle, onResumeTournament }: MainMenuProps) => {
  const hasSingle = hasSavedSingleGame();
  const hasTournament = hasSavedTournament();

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
        {/* Resume buttons */}
        {hasSingle && (
          <button
            onClick={onResumeSingle}
            className="flex items-center justify-center gap-3 w-full py-3 rounded-xl font-bold text-base uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
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
        )}

        {hasTournament && (
          <button
            onClick={onResumeTournament}
            className="flex items-center justify-center gap-3 w-full py-3 rounded-xl font-bold text-base uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
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
        )}

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
          onClick={onDuel}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
          style={{
            backgroundColor: "hsl(var(--secondary) / 0.1)",
            border: "2px solid hsl(var(--secondary) / 0.4)",
            color: "hsl(var(--secondary))",
            textShadow: "var(--neon-glow-secondary)",
            boxShadow: "var(--neon-glow-secondary)",
          }}
        >
          <Users className="w-6 h-6" />
          Turniej 1 vs 1
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
          Turniej wieloosobowy
        </button>
      </div>
    </div>
  );
};

export default MainMenu;

import { useState } from "react";
import { ArrowLeft, Bot, Users } from "lucide-react";
import GameBoard, { BoardState } from "./GameBoard";
import { saveSingleGame, loadSingleGame, clearSingleGame, SavedSingleGame } from "@/lib/storage";

interface SingleGameProps {
  onBack: () => void;
  resumeData?: SavedSingleGame | null;
}

const SingleGame = ({ onBack, resumeData }: SingleGameProps) => {
  const [playerX, setPlayerX] = useState(resumeData?.playerX ?? "");
  const [playerO, setPlayerO] = useState(resumeData?.playerO ?? "");
  const [vsAI, setVsAI] = useState(resumeData?.isAI ?? false);
  const [started, setStarted] = useState(!!resumeData);
  const [initialState] = useState<BoardState | undefined>(
    resumeData
      ? {
          board: resumeData.board as any,
          isXTurn: resumeData.isXTurn,
          history: resumeData.history as any,
        }
      : undefined
  );

  const handleSave = (state: BoardState) => {
    saveSingleGame({
      playerX: playerX.trim() || resumeData?.playerX || "",
      playerO: vsAI ? "AI" : (playerO.trim() || resumeData?.playerO || ""),
      isAI: vsAI,
      board: state.board,
      isXTurn: state.isXTurn,
      history: state.history,
      savedAt: Date.now(),
    });
  };

  const handleExit = () => {
    // Auto-save is handled by GameBoard calling onSave before onExit
    onBack();
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-sm px-4">
        <button
          onClick={onBack}
          className="self-start flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Menu
        </button>
        <h2 className="text-2xl font-bold text-primary" style={{ textShadow: "var(--neon-glow)" }}>
          Pojedyncza gra
        </h2>

        <div className="flex gap-2 w-full">
          <button
            onClick={() => setVsAI(false)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all"
            style={{
              backgroundColor: !vsAI ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted))",
              border: `2px solid ${!vsAI ? "hsl(var(--primary) / 0.5)" : "hsl(var(--border))"}`,
              color: !vsAI ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
            }}
          >
            <Users className="w-4 h-4" />
            2 graczy
          </button>
          <button
            onClick={() => { setVsAI(true); setPlayerO("AI"); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all"
            style={{
              backgroundColor: vsAI ? "hsl(var(--secondary) / 0.15)" : "hsl(var(--muted))",
              border: `2px solid ${vsAI ? "hsl(var(--secondary) / 0.5)" : "hsl(var(--border))"}`,
              color: vsAI ? "hsl(var(--secondary))" : "hsl(var(--muted-foreground))",
            }}
          >
            <Bot className="w-4 h-4" />
            vs AI
          </button>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
              {vsAI ? "Twoje imię" : "Gracz X"}
            </label>
            <input
              value={playerX}
              onChange={(e) => setPlayerX(e.target.value)}
              placeholder={vsAI ? "Twoje imię" : "Imię gracza X"}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {!vsAI && (
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Gracz O</label>
              <input
                value={playerO}
                onChange={(e) => setPlayerO(e.target.value)}
                placeholder="Imię gracza O"
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
          )}
          <button
            onClick={() => { clearSingleGame(); setStarted(true); }}
            disabled={!playerX.trim() || (!vsAI && !playerO.trim())}
            className="w-full py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              boxShadow: "var(--neon-glow)",
            }}
          >
            {vsAI ? "Graj z AI" : "Rozpocznij grę"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <GameBoard
        playerX={playerX.trim() || resumeData?.playerX || "X"}
        playerO={vsAI ? "AI" : (playerO.trim() || resumeData?.playerO || "O")}
        isAI={vsAI}
        initialState={initialState}
        onSave={handleSave}
        onExit={handleExit}
      />
    </div>
  );
};

export default SingleGame;

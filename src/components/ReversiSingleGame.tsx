import { useState } from "react";
import { ArrowLeft, Bot, Users } from "lucide-react";
import ReversiBoard, { ReversiBoardState, GameResult } from "./ReversiBoard";
import {
  saveReversiSingleGame,
  loadReversiSingleGame,
  clearReversiSingleGame,
  SavedReversiSingleGame,
  addGameToHistory,
} from "@/lib/storage";
import { t, useLang } from "@/lib/i18n";

interface ReversiSingleGameProps {
  onBack: () => void;
  resumeData?: SavedReversiSingleGame | null;
}

const ReversiSingleGame = ({ onBack, resumeData }: ReversiSingleGameProps) => {
  const [lang] = useLang();
  const [playerBlack, setPlayerBlack] = useState(resumeData?.playerBlack ?? "");
  const [playerWhite, setPlayerWhite] = useState(resumeData?.playerWhite ?? "");
  const [vsAI, setVsAI] = useState(resumeData?.isAI ?? false);
  const [started, setStarted] = useState(!!resumeData);
  const [initialState] = useState<ReversiBoardState | undefined>(
    resumeData
      ? {
          board: resumeData.board as any,
          currentPlayer: resumeData.currentPlayer as any,
          history: resumeData.history as any,
        }
      : undefined
  );

  const handleSave = (state: ReversiBoardState) => {
    saveReversiSingleGame({
      playerBlack: playerBlack.trim() || resumeData?.playerBlack || "",
      playerWhite: vsAI ? "AI" : (playerWhite.trim() || resumeData?.playerWhite || ""),
      isAI: vsAI,
      board: state.board,
      currentPlayer: state.currentPlayer,
      history: state.history,
      savedAt: Date.now(),
    });
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-sm px-4">
        <button
          onClick={onBack}
          className="self-start flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> {t("nav.menu")}
        </button>
        <h2
          className="text-2xl font-bold text-primary"
          style={{ textShadow: "var(--neon-glow)" }}
        >
          Reversi
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
            <Users className="w-4 h-4" /> {t("single.2players")}
          </button>
          <button
            onClick={() => {
              setVsAI(true);
              setPlayerWhite("AI");
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all"
            style={{
              backgroundColor: vsAI ? "hsl(var(--secondary) / 0.15)" : "hsl(var(--muted))",
              border: `2px solid ${vsAI ? "hsl(var(--secondary) / 0.5)" : "hsl(var(--border))"}`,
              color: vsAI ? "hsl(var(--secondary))" : "hsl(var(--muted-foreground))",
            }}
          >
            <Bot className="w-4 h-4" /> {t("single.vsAI")}
          </button>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
              {vsAI ? t("single.yourName") : t("reversi.playerBlack")}
            </label>
            <input
              value={playerBlack}
              onChange={(e) => setPlayerBlack(e.target.value)}
              placeholder={vsAI ? t("single.yourName") : t("reversi.playerBlack")}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {!vsAI && (
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                {t("reversi.playerWhite")}
              </label>
              <input
                value={playerWhite}
                onChange={(e) => setPlayerWhite(e.target.value)}
                placeholder={t("reversi.playerWhite")}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
          )}
          <button
            onClick={() => {
              clearReversiSingleGame();
              setStarted(true);
            }}
            disabled={!playerBlack.trim() || (!vsAI && !playerWhite.trim())}
            className="w-full py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              boxShadow: "var(--neon-glow)",
            }}
          >
            {vsAI ? t("single.playAI") : t("single.startGame")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <ReversiBoard
        playerX={playerBlack.trim() || resumeData?.playerBlack || "Black"}
        playerO={vsAI ? "AI" : (playerWhite.trim() || resumeData?.playerWhite || "White")}
        isAI={vsAI}
        initialState={initialState}
        onSave={handleSave}
        onExit={onBack}
        onGameEnd={(result: GameResult) => {
          const pB = playerBlack.trim() || resumeData?.playerBlack || "Black";
          const pW = vsAI ? "AI" : (playerWhite.trim() || resumeData?.playerWhite || "White");
          addGameToHistory({
            playerX: pB,
            playerO: pW,
            winner: result.winner,
            isDraw: result.isDraw,
            mode: "single",
            game: "reversi",
          });
          clearReversiSingleGame();
        }}
      />
    </div>
  );
};

export default ReversiSingleGame;

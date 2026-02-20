import { useState } from "react";
import { ArrowLeft, Plus, X, Trophy } from "lucide-react";
import { Player, TournamentMatch, generateRoundRobinMatches, calculateStandings } from "@/lib/tournament";
import GameBoard, { GameResult } from "./GameBoard";

interface TournamentModeProps {
  onBack: () => void;
}

type TournamentPhase = "setup" | "bracket" | "playing";

const TournamentMode = ({ onBack }: TournamentModeProps) => {
  const [phase, setPhase] = useState<TournamentPhase>("setup");
  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState("");
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [currentMatch, setCurrentMatch] = useState<TournamentMatch | null>(null);

  const addPlayer = () => {
    const name = newName.trim();
    if (!name || players.some((p) => p.name === name)) return;
    setPlayers([...players, { id: crypto.randomUUID(), name }]);
    setNewName("");
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  const startTournament = () => {
    const generated = generateRoundRobinMatches(players);
    setMatches(generated);
    setPhase("bracket");
  };

  const playMatch = (match: TournamentMatch) => {
    setCurrentMatch(match);
    setPhase("playing");
  };

  const handleGameEnd = (result: GameResult) => {
    if (!currentMatch) return;
    setMatches((prev) =>
      prev.map((m) =>
        m.id === currentMatch.id
          ? { ...m, winner: result.winner, isDraw: result.isDraw, played: true }
          : m
      )
    );
  };

  const backToBracket = () => {
    setCurrentMatch(null);
    setPhase("bracket");
  };

  // SETUP PHASE
  if (phase === "setup") {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-md px-4">
        <button
          onClick={onBack}
          className="self-start flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Menu
        </button>
        <h2
          className="text-2xl font-bold"
          style={{ color: "hsl(var(--secondary))", textShadow: "var(--neon-glow-secondary)" }}
        >
          <Trophy className="w-6 h-6 inline mr-2" />
          Turniej
        </h2>
        <p className="text-muted-foreground text-sm text-center">
          Dodaj graczy (min. 3), każdy zagra z każdym
        </p>

        {/* Add player input */}
        <div className="flex gap-2 w-full">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPlayer()}
            placeholder="Imię gracza"
            className="flex-1 px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary transition-colors"
          />
          <button
            onClick={addPlayer}
            disabled={!newName.trim()}
            className="px-4 py-3 rounded-lg transition-colors disabled:opacity-30"
            style={{
              backgroundColor: "hsl(var(--secondary))",
              color: "hsl(var(--secondary-foreground))",
            }}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Player list */}
        <div className="flex flex-col gap-2 w-full">
          {players.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center justify-between px-4 py-2 rounded-lg bg-card border border-border"
            >
              <span className="text-sm font-bold">
                <span className="text-muted-foreground mr-2">{i + 1}.</span>
                {p.name}
              </span>
              <button
                onClick={() => removePlayer(p.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {players.length >= 3 && (
          <button
            onClick={startTournament}
            className="w-full py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all"
            style={{
              backgroundColor: "hsl(var(--secondary))",
              color: "hsl(var(--secondary-foreground))",
              boxShadow: "var(--neon-glow-secondary)",
            }}
          >
            Rozpocznij turniej ({(players.length * (players.length - 1)) / 2} meczy)
          </button>
        )}
      </div>
    );
  }

  // PLAYING PHASE
  if (phase === "playing" && currentMatch) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <GameBoard
          playerX={currentMatch.playerA.name}
          playerO={currentMatch.playerB.name}
          onGameEnd={handleGameEnd}
          onBack={backToBracket}
        />
      </div>
    );
  }

  // BRACKET PHASE
  const standings = calculateStandings(players, matches);
  const playedCount = matches.filter((m) => m.played).length;
  const allPlayed = playedCount === matches.length;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl px-4">
      <button
        onClick={onBack}
        className="self-start flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Menu
      </button>

      <h2
        className="text-2xl font-bold"
        style={{ color: "hsl(var(--secondary))", textShadow: "var(--neon-glow-secondary)" }}
      >
        Turniej — {playedCount}/{matches.length} meczy
      </h2>

      {/* Standings table */}
      <div className="w-full rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="text-left px-3 py-2 font-bold text-muted-foreground">#</th>
              <th className="text-left px-3 py-2 font-bold text-muted-foreground">Gracz</th>
              <th className="text-center px-2 py-2 font-bold text-muted-foreground">W</th>
              <th className="text-center px-2 py-2 font-bold text-muted-foreground">R</th>
              <th className="text-center px-2 py-2 font-bold text-muted-foreground">P</th>
              <th className="text-center px-2 py-2 font-bold text-primary">Pkt</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr
                key={s.player.id}
                className={`border-t border-border ${i === 0 && allPlayed ? "" : ""}`}
                style={i === 0 && allPlayed ? {
                  backgroundColor: "hsl(var(--accent) / 0.1)",
                } : {}}
              >
                <td className="px-3 py-2 text-muted-foreground">
                  {i === 0 && allPlayed ? (
                    <Trophy className="w-4 h-4 inline text-accent" style={{ filter: "drop-shadow(0 0 4px hsl(50 100% 60% / 0.6))" }} />
                  ) : (
                    i + 1
                  )}
                </td>
                <td className="px-3 py-2 font-bold">{s.player.name}</td>
                <td className="text-center px-2 py-2 text-primary">{s.wins}</td>
                <td className="text-center px-2 py-2 text-muted-foreground">{s.draws}</td>
                <td className="text-center px-2 py-2 text-destructive">{s.losses}</td>
                <td className="text-center px-2 py-2 font-bold text-primary">{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Winner banner */}
      {allPlayed && (
        <div
          className="w-full text-center py-4 rounded-lg font-bold text-xl uppercase tracking-wider animate-pulse"
          style={{
            color: "hsl(var(--accent))",
            textShadow: "var(--neon-glow-accent)",
            border: "2px solid hsl(var(--accent) / 0.4)",
            backgroundColor: "hsl(var(--accent) / 0.05)",
          }}
        >
          🏆 {standings[0].player.name} wygrywa turniej!
        </div>
      )}

      {/* Match list / bracket */}
      <h3 className="text-lg font-bold text-foreground mt-2">Drzewko meczy</h3>
      <div className="flex flex-col gap-2 w-full">
        {matches.map((m, i) => (
          <div
            key={m.id}
            className="flex items-center justify-between px-4 py-3 rounded-lg border transition-all"
            style={{
              borderColor: m.played ? "hsl(var(--border))" : "hsl(var(--primary) / 0.3)",
              backgroundColor: m.played ? "hsl(var(--card))" : "hsl(var(--primary) / 0.03)",
            }}
          >
            <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
              <span className="text-muted-foreground text-xs w-6">{i + 1}.</span>
              <span
                className={`font-bold truncate ${m.played && m.winner === m.playerA.name ? "text-primary" : ""}`}
                style={m.played && m.winner === m.playerA.name ? { textShadow: "var(--neon-glow)" } : {}}
              >
                {m.playerA.name}
              </span>
              <span className="text-muted-foreground text-xs">vs</span>
              <span
                className={`font-bold truncate ${m.played && m.winner === m.playerB.name ? "text-primary" : ""}`}
                style={m.played && m.winner === m.playerB.name ? { textShadow: "var(--neon-glow)" } : {}}
              >
                {m.playerB.name}
              </span>
              {m.played && m.isDraw && (
                <span className="text-xs text-accent ml-1">remis</span>
              )}
            </div>
            {!m.played ? (
              <button
                onClick={() => playMatch(m)}
                className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                style={{
                  backgroundColor: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                }}
              >
                Graj
              </button>
            ) : (
              <span className="text-xs text-muted-foreground shrink-0">✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentMode;

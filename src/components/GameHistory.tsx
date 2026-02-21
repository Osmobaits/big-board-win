import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Trophy, Handshake, Swords, Users, Bot, Download, Upload } from "lucide-react";
import { getGameHistory, clearGameHistory, GameHistoryEntry } from "@/lib/storage";
import { t, useLang, getLang } from "@/lib/i18n";

interface GameHistoryProps {
  onBack: () => void;
}

const modeLabel = (mode: GameHistoryEntry["mode"]) => {
  switch (mode) {
    case "single": return t("history.modeSingle");
    case "duel": return t("history.modeDuel");
    case "tournament": return t("history.modeTournament");
  }
};

const modeIcon = (mode: GameHistoryEntry["mode"]) => {
  switch (mode) {
    case "single": return <Swords className="w-3.5 h-3.5" />;
    case "duel": return <Users className="w-3.5 h-3.5" />;
    case "tournament": return <Trophy className="w-3.5 h-3.5" />;
  }
};

const formatDate = (timestamp: number) => {
  const d = new Date(timestamp);
  const locale = getLang() === "de" ? "de-DE" : getLang() === "es" ? "es-ES" : getLang() === "en" ? "en-GB" : "pl-PL";
  return d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " + d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
};

const GameHistory = ({ onBack }: GameHistoryProps) => {
  const [lang] = useLang();
  const [history, setHistory] = useState(getGameHistory);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => { clearGameHistory(); setHistory([]); setConfirmClear(false); };

  const handleExport = () => {
    const data = JSON.stringify(history, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `five-strike-historia-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string) as GameHistoryEntry[];
        if (!Array.isArray(imported)) return;
        const existingIds = new Set(history.map((g) => g.id));
        const newEntries = imported.filter((g) => g.id && !existingIds.has(g.id));
        const merged = [...newEntries, ...history].sort((a, b) => b.date - a.date).slice(0, 100);
        localStorage.setItem("fiveinarow_history", JSON.stringify(merged));
        setHistory(merged);
      } catch { /* ignore invalid files */ }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const totalGames = history.length;
  const totalWins = history.filter((g) => g.winner).length;
  const totalDraws = history.filter((g) => g.isDraw).length;

  const playerStats = new Map<string, { wins: number; losses: number; draws: number; games: number }>();
  history.forEach((g) => {
    const update = (name: string) => {
      const s = playerStats.get(name) || { wins: 0, losses: 0, draws: 0, games: 0 };
      s.games++;
      if (g.isDraw) s.draws++;
      else if (g.winner === name) s.wins++;
      else s.losses++;
      playerStats.set(name, s);
    };
    update(g.playerX);
    update(g.playerO);
  });

  const topPlayers = [...playerStats.entries()].map(([name, s]) => ({ name, ...s })).sort((a, b) => b.wins - a.wins).slice(0, 5);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg px-4">
      <button onClick={onBack} className="self-start flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> {t("nav.menu")}
      </button>

      <h2 className="text-xl font-bold" style={{ color: "hsl(var(--accent))", textShadow: "var(--neon-glow-accent)" }}>
        <Trophy className="w-6 h-6 inline mr-2" /> {t("history.title")}
      </h2>

      {totalGames > 0 && (
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { label: t("history.games"), value: totalGames, color: "primary" },
            { label: t("history.winsCount"), value: totalWins, color: "primary" },
            { label: t("history.drawsCount"), value: totalDraws, color: "accent" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center py-3 rounded-lg border"
              style={{ borderColor: `hsl(var(--${stat.color}) / 0.3)`, backgroundColor: `hsl(var(--${stat.color}) / 0.05)` }}>
              <span className="text-xl font-bold" style={{ color: `hsl(var(--${stat.color}))` }}>{stat.value}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {topPlayers.length > 0 && (
        <div className="w-full">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">{t("history.topPlayers")}</h3>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left px-3 py-2 font-bold text-muted-foreground">#</th>
                  <th className="text-left px-3 py-2 font-bold text-muted-foreground">{t("table.player")}</th>
                  <th className="text-center px-2 py-2 font-bold text-primary">{t("table.wins")}</th>
                  <th className="text-center px-2 py-2 font-bold text-accent">{t("table.draws")}</th>
                  <th className="text-center px-2 py-2 font-bold text-destructive">{t("table.losses")}</th>
                  <th className="text-center px-2 py-2 font-bold text-muted-foreground">{t("table.total")}</th>
                </tr>
              </thead>
              <tbody>
                {topPlayers.map((p, i) => (
                  <tr key={p.name} className="border-t border-border">
                    <td className="px-3 py-2 text-muted-foreground">
                      {i === 0 ? <Trophy className="w-4 h-4 inline text-accent" style={{ filter: "drop-shadow(0 0 4px hsl(45 100% 55% / 0.6))" }} /> : i + 1}
                    </td>
                    <td className="px-3 py-2 font-bold">{p.name}</td>
                    <td className="text-center px-2 py-2 text-primary">{p.wins}</td>
                    <td className="text-center px-2 py-2 text-accent">{p.draws}</td>
                    <td className="text-center px-2 py-2 text-destructive">{p.losses}</td>
                    <td className="text-center px-2 py-2 text-muted-foreground">{p.games}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("history.gameHistory")}</h3>
          <div className="flex items-center gap-3">
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors" title={t("history.import")}>
              <Upload className="w-3.5 h-3.5" /> {t("history.import")}
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            {history.length > 0 && (
              <>
                <button onClick={handleExport} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors" title={t("history.export")}>
                  <Download className="w-3.5 h-3.5" /> {t("history.export")}
                </button>
                <button onClick={() => setConfirmClear(true)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> {t("history.clear")}
                </button>
              </>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">{t("history.noGames")}</div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
            {history.map((game, i) => (
              <motion.div key={game.id} initial={i < 10 ? { opacity: 0, x: -10 } : false} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03, duration: 0.2 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card">
                <span className="text-muted-foreground shrink-0" title={modeLabel(game.mode)}>{modeIcon(game.mode)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className={`font-bold truncate ${game.winner === game.playerX ? "text-primary" : ""}`} style={game.winner === game.playerX ? { textShadow: "var(--neon-glow)" } : {}}>
                      {game.playerX}
                    </span>
                    <span className="text-muted-foreground text-xs">vs</span>
                    <span className={`font-bold truncate ${game.winner === game.playerO ? "text-secondary" : ""}`} style={game.winner === game.playerO ? { textShadow: "var(--neon-glow-secondary)" } : {}}>
                      {game.playerO}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(game.date)}</span>
                </div>
                <span className="shrink-0">
                  {game.isDraw ? <Handshake className="w-4 h-4 text-accent" /> : <Trophy className="w-4 h-4 text-primary" style={{ filter: "drop-shadow(0 0 3px hsl(170 100% 50% / 0.5))" }} />}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {confirmClear && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "hsl(0 0% 0% / 0.7)" }} onClick={() => setConfirmClear(false)}>
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            className="flex flex-col items-center gap-4 p-6 rounded-xl max-w-sm w-full"
            style={{ backgroundColor: "hsl(var(--card))", border: "2px solid hsl(0 60% 50% / 0.4)", boxShadow: "0 0 30px hsl(0 60% 50% / 0.2)" }}
            onClick={(e) => e.stopPropagation()}>
            <Trash2 className="w-8 h-8" style={{ color: "hsl(0 60% 50%)" }} />
            <p className="text-center text-foreground font-bold text-sm">{t("confirm.clearHistory")}</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setConfirmClear(false)} className="flex-1 py-2 rounded-lg font-bold uppercase text-xs tracking-wider bg-muted text-foreground hover:bg-border transition-colors">
                {t("btn.cancel")}
              </button>
              <button onClick={handleClear} className="flex-1 py-2 rounded-lg font-bold uppercase text-xs tracking-wider transition-colors"
                style={{ backgroundColor: "hsl(0 60% 50%)", color: "hsl(0 0% 100%)" }}>
                {t("btn.clear")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default GameHistory;

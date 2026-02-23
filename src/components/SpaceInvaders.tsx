import { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import { t, useLang } from "@/lib/i18n";
import { useTheme, getThemeConfig } from "@/lib/theme";
import { playWin, playDraw } from "@/lib/sounds";

interface SpaceInvadersProps {
  onBack: () => void;
}

// Game constants
const CANVAS_W = 360;
const CANVAS_H = 540;
const PLAYER_W = 32;
const PLAYER_H = 20;
const BULLET_W = 3;
const BULLET_H = 10;
const ENEMY_W = 28;
const ENEMY_H = 20;
const ENEMY_BULLET_W = 3;
const ENEMY_BULLET_H = 8;
const ENEMY_COLS = 8;
const ENEMY_ROWS = 4;
const ENEMY_GAP_X = 38;
const ENEMY_GAP_Y = 32;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ENEMY_BULLET_SPEED = 3;
const SHOOT_COOLDOWN = 250;

interface Entity { x: number; y: number; w: number; h: number; alive?: boolean }
interface Bullet extends Entity { }
interface Enemy extends Entity { alive: boolean; type: number }

function createEnemies(level: number): Enemy[] {
  const rows = Math.min(ENEMY_ROWS + Math.floor(level / 3), 6);
  const cols = ENEMY_COLS;
  const offsetX = (CANVAS_W - cols * ENEMY_GAP_X) / 2 + 5;
  const enemies: Enemy[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      enemies.push({
        x: offsetX + c * ENEMY_GAP_X,
        y: 40 + r * ENEMY_GAP_Y,
        w: ENEMY_W, h: ENEMY_H,
        alive: true,
        type: r % 3,
      });
    }
  }
  return enemies;
}

function collides(a: Entity, b: Entity) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

const SpaceInvaders = ({ onBack }: SpaceInvadersProps) => {
  const [lang] = useLang();
  const [themeId] = useTheme();
  const theme = getThemeConfig(themeId);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover" | "levelup">("menu");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem("galaga_highscore") || "0", 10);
  });

  const stateRef = useRef({
    player: { x: CANVAS_W / 2 - PLAYER_W / 2, y: CANVAS_H - 40, w: PLAYER_W, h: PLAYER_H },
    bullets: [] as Bullet[],
    enemyBullets: [] as Bullet[],
    enemies: createEnemies(1),
    enemyDir: 1,
    enemySpeed: 0.5,
    enemyMoveTimer: 0,
    lastShot: 0,
    score: 0,
    level: 1,
    lives: 3,
    keys: new Set<string>(),
    touchX: null as number | null,
    shooting: false,
    gameState: "menu" as string,
    animFrame: 0,
  });

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.player.x = CANVAS_W / 2 - PLAYER_W / 2;
    s.bullets = [];
    s.enemyBullets = [];
    s.enemies = createEnemies(1);
    s.enemyDir = 1;
    s.enemySpeed = 0.5;
    s.enemyMoveTimer = 0;
    s.score = 0;
    s.level = 1;
    s.lives = 3;
    s.gameState = "playing";
    setScore(0);
    setLevel(1);
    setLives(3);
    setGameState("playing");
  }, []);

  const nextLevel = useCallback(() => {
    const s = stateRef.current;
    s.level++;
    s.player.x = CANVAS_W / 2 - PLAYER_W / 2;
    s.bullets = [];
    s.enemyBullets = [];
    s.enemies = createEnemies(s.level);
    s.enemyDir = 1;
    s.enemySpeed = 0.5 + s.level * 0.15;
    s.enemyMoveTimer = 0;
    s.gameState = "playing";
    setLevel(s.level);
    setGameState("playing");
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const getColors = () => {
      const style = getComputedStyle(document.documentElement);
      return {
        primary: style.getPropertyValue("--primary").trim(),
        secondary: style.getPropertyValue("--secondary").trim(),
        accent: style.getPropertyValue("--accent").trim(),
        fg: style.getPropertyValue("--foreground").trim(),
        bg: style.getPropertyValue("--background").trim(),
        muted: style.getPropertyValue("--muted-foreground").trim(),
      };
    };

    const drawShip = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.fill();
      // engine glow
      ctx.fillStyle = `hsl(${color.includes("primary") ? "180 100% 50%" : "40 100% 60%"} / 0.5)`;
      ctx.fillRect(x + w / 2 - 3, y + h, 6, 4);
    };

    const drawEnemy = (e: Enemy, colors: ReturnType<typeof getColors>) => {
      const hues = [colors.secondary, colors.accent, colors.primary];
      const hue = hues[e.type % 3];
      ctx.fillStyle = `hsl(${hue})`;
      // body
      ctx.fillRect(e.x + 4, e.y + 4, e.w - 8, e.h - 8);
      // wings
      ctx.fillRect(e.x, e.y + 6, 6, e.h - 12);
      ctx.fillRect(e.x + e.w - 6, e.y + 6, 6, e.h - 12);
      // eyes
      ctx.fillStyle = `hsl(${colors.bg})`;
      ctx.fillRect(e.x + 8, e.y + 8, 4, 4);
      ctx.fillRect(e.x + e.w - 12, e.y + 8, 4, 4);
    };

    const loop = () => {
      const s = stateRef.current;
      const colors = getColors();
      s.animFrame++;

      ctx.fillStyle = `hsl(${colors.bg})`;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Stars
      ctx.fillStyle = `hsl(${colors.muted} / 0.3)`;
      for (let i = 0; i < 40; i++) {
        const sx = (i * 97 + s.animFrame * 0.1 * ((i % 3) + 1)) % CANVAS_W;
        const sy = (i * 53 + s.animFrame * 0.2 * ((i % 2) + 1)) % CANVAS_H;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      if (s.gameState !== "playing") {
        raf = requestAnimationFrame(loop);
        return;
      }

      // Player movement
      const moveLeft = s.keys.has("ArrowLeft") || s.keys.has("a");
      const moveRight = s.keys.has("ArrowRight") || s.keys.has("d");
      if (moveLeft) s.player.x = Math.max(0, s.player.x - PLAYER_SPEED);
      if (moveRight) s.player.x = Math.min(CANVAS_W - PLAYER_W, s.player.x + PLAYER_SPEED);

      // Touch control
      if (s.touchX !== null) {
        const targetX = s.touchX - PLAYER_W / 2;
        const diff = targetX - s.player.x;
        s.player.x += Math.sign(diff) * Math.min(Math.abs(diff), PLAYER_SPEED + 2);
        s.player.x = Math.max(0, Math.min(CANVAS_W - PLAYER_W, s.player.x));
      }

      // Shooting
      const now = Date.now();
      if ((s.keys.has(" ") || s.keys.has("ArrowUp") || s.shooting) && now - s.lastShot > SHOOT_COOLDOWN) {
        s.bullets.push({ x: s.player.x + PLAYER_W / 2 - BULLET_W / 2, y: s.player.y - BULLET_H, w: BULLET_W, h: BULLET_H });
        s.lastShot = now;
      }

      // Update bullets
      s.bullets = s.bullets.filter(b => { b.y -= BULLET_SPEED; return b.y > -BULLET_H; });
      s.enemyBullets = s.enemyBullets.filter(b => { b.y += ENEMY_BULLET_SPEED; return b.y < CANVAS_H + ENEMY_BULLET_H; });

      // Bullet-enemy collision
      for (const bullet of s.bullets) {
        for (const enemy of s.enemies) {
          if (enemy.alive && collides(bullet, enemy)) {
            enemy.alive = false;
            bullet.y = -100; // remove
            s.score += (enemy.type + 1) * 10;
            setScore(s.score);
          }
        }
      }

      // Enemy-player bullet collision
      for (const eb of s.enemyBullets) {
        if (collides(eb, s.player)) {
          eb.y = CANVAS_H + 100;
          s.lives--;
          setLives(s.lives);
          if (s.lives <= 0) {
            s.gameState = "gameover";
            setGameState("gameover");
            if (s.score > highScore) {
              setHighScore(s.score);
              localStorage.setItem("galaga_highscore", String(s.score));
            }
            playDraw();
          }
        }
      }

      // Enemy movement
      s.enemyMoveTimer++;
      if (s.enemyMoveTimer >= Math.max(3, 15 - s.level)) {
        s.enemyMoveTimer = 0;
        let edgeHit = false;
        for (const e of s.enemies) {
          if (!e.alive) continue;
          if ((s.enemyDir > 0 && e.x + e.w + s.enemySpeed >= CANVAS_W) ||
              (s.enemyDir < 0 && e.x - s.enemySpeed <= 0)) {
            edgeHit = true;
            break;
          }
        }
        if (edgeHit) {
          s.enemyDir *= -1;
          for (const e of s.enemies) { if (e.alive) e.y += 12; }
        } else {
          for (const e of s.enemies) { if (e.alive) e.x += s.enemyDir * s.enemySpeed * 8; }
        }
      }

      // Enemy shooting
      const aliveEnemies = s.enemies.filter(e => e.alive);
      if (aliveEnemies.length > 0 && Math.random() < 0.02 + s.level * 0.005) {
        const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        s.enemyBullets.push({ x: shooter.x + ENEMY_W / 2, y: shooter.y + ENEMY_H, w: ENEMY_BULLET_W, h: ENEMY_BULLET_H });
      }

      // Check if enemies reached player
      for (const e of aliveEnemies) {
        if (e.y + e.h >= s.player.y) {
          s.gameState = "gameover";
          setGameState("gameover");
          if (s.score > highScore) {
            setHighScore(s.score);
            localStorage.setItem("galaga_highscore", String(s.score));
          }
          playDraw();
          break;
        }
      }

      // Level complete
      if (aliveEnemies.length === 0) {
        s.gameState = "levelup";
        setGameState("levelup");
        playWin();
      }

      // Draw player
      drawShip(s.player.x, s.player.y, PLAYER_W, PLAYER_H, `hsl(${colors.primary})`);

      // Draw bullets
      ctx.fillStyle = `hsl(${colors.primary})`;
      ctx.shadowColor = `hsl(${colors.primary})`;
      ctx.shadowBlur = 6;
      for (const b of s.bullets) ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.shadowBlur = 0;

      // Draw enemy bullets
      ctx.fillStyle = `hsl(${colors.secondary})`;
      ctx.shadowColor = `hsl(${colors.secondary})`;
      ctx.shadowBlur = 4;
      for (const b of s.enemyBullets) ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.shadowBlur = 0;

      // Draw enemies
      for (const e of s.enemies) {
        if (e.alive) drawEnemy(e, colors);
      }

      // Draw HUD
      ctx.fillStyle = `hsl(${colors.fg})`;
      ctx.font = "bold 14px 'Press Start 2P', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`${t("galaga.score")}: ${s.score}`, 8, 20);
      ctx.textAlign = "right";
      ctx.fillText(`❤️ ${s.lives}`, CANVAS_W - 8, 20);
      ctx.textAlign = "center";
      ctx.fillText(`LV ${s.level}`, CANVAS_W / 2, 20);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [highScore]);

  // Keyboard handlers
  useEffect(() => {
    const s = stateRef.current;
    const onDown = (e: KeyboardEvent) => {
      s.keys.add(e.key);
      if (e.key === " ") e.preventDefault();
    };
    const onUp = (e: KeyboardEvent) => s.keys.delete(e.key);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    stateRef.current.touchX = ((touch.clientX - rect.left) / rect.width) * CANVAS_W;
    stateRef.current.shooting = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    stateRef.current.touchX = ((touch.clientX - rect.left) / rect.width) * CANVAS_W;
  }, []);

  const handleTouchEnd = useCallback(() => {
    stateRef.current.touchX = null;
    stateRef.current.shooting = false;
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md px-2">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <button onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-foreground font-bold text-xs uppercase tracking-wider hover:bg-border transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t("rules.back")}
        </button>
        <div className="text-xs text-muted-foreground" style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "0.5rem" : "0.65rem" }}>
          HI: {highScore}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-black tracking-wide text-center"
        style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "1rem" : "1.5rem", color: "hsl(var(--accent))", textShadow: "var(--neon-glow-accent)" }}>
        GALAGA
      </h1>

      {/* Canvas */}
      <div className="relative w-full" style={{ maxWidth: CANVAS_W, aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full h-full rounded-lg border border-primary/20"
          style={{ boxShadow: "var(--neon-glow)", imageRendering: "pixelated" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* Overlays */}
        {gameState === "menu" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-lg"
            style={{ backgroundColor: "hsl(var(--background) / 0.85)" }}>
            <p className="text-muted-foreground text-xs text-center px-4" style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "0.45rem" : "0.65rem" }}>
              {t("galaga.controls")}
            </p>
            <motion.button onClick={startGame} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors"
              style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "0.6rem" : "0.8rem", backgroundColor: "hsl(var(--primary) / 0.15)", border: "3px solid hsl(var(--primary) / 0.5)", color: "hsl(var(--primary))", textShadow: "var(--neon-glow)", boxShadow: "var(--neon-glow)" }}>
              <Play className="w-5 h-5" /> {t("galaga.start")}
            </motion.button>
          </motion.div>
        )}

        {gameState === "gameover" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-lg"
            style={{ backgroundColor: "hsl(var(--background) / 0.9)" }}>
            <h2 className="text-xl font-black" style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "0.8rem" : "1.2rem", color: "hsl(var(--destructive, 0 60% 50%))" }}>
              GAME OVER
            </h2>
            <p className="text-foreground font-bold" style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "0.5rem" : "0.75rem" }}>
              {t("galaga.score")}: {score}
            </p>
            <motion.button onClick={startGame} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-colors"
              style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "0.5rem" : "0.7rem", backgroundColor: "hsl(var(--primary) / 0.15)", border: "2px solid hsl(var(--primary) / 0.5)", color: "hsl(var(--primary))" }}>
              <RotateCcw className="w-4 h-4" /> {t("galaga.retry")}
            </motion.button>
          </motion.div>
        )}

        {gameState === "levelup" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-lg"
            style={{ backgroundColor: "hsl(var(--background) / 0.9)" }}>
            <h2 className="text-xl font-black" style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "0.8rem" : "1.2rem", color: "hsl(var(--accent))", textShadow: "var(--neon-glow-accent)" }}>
              {t("galaga.levelComplete")}
            </h2>
            <p className="text-foreground font-bold" style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "0.5rem" : "0.75rem" }}>
              {t("galaga.score")}: {score}
            </p>
            <motion.button onClick={nextLevel} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-colors"
              style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "0.5rem" : "0.7rem", backgroundColor: "hsl(var(--accent) / 0.15)", border: "2px solid hsl(var(--accent) / 0.5)", color: "hsl(var(--accent))", textShadow: "var(--neon-glow-accent)" }}>
              <Play className="w-4 h-4" /> {t("galaga.nextLevel")}
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Mobile shoot button */}
      <div className="flex gap-4 sm:hidden w-full justify-center">
        <button
          onTouchStart={() => { stateRef.current.keys.add("ArrowLeft"); }}
          onTouchEnd={() => { stateRef.current.keys.delete("ArrowLeft"); }}
          className="px-6 py-4 rounded-lg font-bold text-lg transition-colors"
          style={{ backgroundColor: "hsl(var(--muted))", border: "2px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
          ◀
        </button>
        <button
          onTouchStart={() => { stateRef.current.shooting = true; stateRef.current.keys.add(" "); }}
          onTouchEnd={() => { stateRef.current.shooting = false; stateRef.current.keys.delete(" "); }}
          className="px-8 py-4 rounded-lg font-bold text-lg transition-colors"
          style={{ backgroundColor: "hsl(var(--primary) / 0.15)", border: "2px solid hsl(var(--primary) / 0.5)", color: "hsl(var(--primary))" }}>
          🔫
        </button>
        <button
          onTouchStart={() => { stateRef.current.keys.add("ArrowRight"); }}
          onTouchEnd={() => { stateRef.current.keys.delete("ArrowRight"); }}
          className="px-6 py-4 rounded-lg font-bold text-lg transition-colors"
          style={{ backgroundColor: "hsl(var(--muted))", border: "2px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
          ▶
        </button>
      </div>

      <p className="text-muted-foreground text-center text-xs hidden sm:block" style={{ fontFamily: theme.headingFont, fontSize: themeId === "arcade" ? "0.4rem" : "0.6rem" }}>
        ← → {t("galaga.moveKeys")} · SPACE {t("galaga.shootKey")}
      </p>
    </div>
  );
};

export default SpaceInvaders;

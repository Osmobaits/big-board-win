import GameBoard from "@/components/GameBoard";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <h1 className="text-4xl sm:text-5xl font-black tracking-widest text-primary uppercase" style={{ textShadow: "var(--neon-glow)" }}>
        5 w rzędzie
      </h1>
      <p className="text-muted-foreground text-sm tracking-wide">Plansza 12×12 · Wygrywa 5 w linii</p>
      <GameBoard />
    </div>
  );
};

export default Index;

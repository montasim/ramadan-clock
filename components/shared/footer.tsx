export function Footer() {
  return (
    <footer className="relative border-t border-border/50 py-6 md:py-0">
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "var(--grad-primary)" }}
      />
      <div className="flex flex-col items-center justify-center gap-3 px-4 md:h-14">
        <div className="flex w-full max-w-5xl flex-col items-center justify-between gap-2 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}{" "}
            <span className="gradient-text font-semibold">Ramadan Clock</span>.
            All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ for the Ramadan community
          </p>
        </div>
      </div>
    </footer>
  );
}

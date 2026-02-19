export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="flex flex-col items-center justify-center gap-4 px-4 md:h-12">
        <div className="flex w-full max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Ramadan Clock. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ for the Ramadan community
          </p>
        </div>
      </div>
    </footer>
  );
}

const Footer = () => {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 sm:flex-row">
        <p className="label-mono text-muted-foreground">
          Oasis · BITS Pilani, Pilani campus
        </p>
        <p className="text-sm text-muted-foreground">
          Built by{" "}
          <a
            href="https://bits-dvm.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            DVM
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

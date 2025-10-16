const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-sm text-muted-foreground">
          Made with{" "}
          <span className="text-red-500" aria-label="love">
            ❤️
          </span>{" "}
          by{" "}
          <a
            href="https://bits-dvm.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline transition-colors"
          >
            DVM
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

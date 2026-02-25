export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/30 backdrop-blur-xl mt-16">
      <div className="max-w-7xl mx-auto px-6 py-8 text-center">
        <p className="text-slate-500 text-sm">
          &copy; 2026 <span className="text-brand-primary font-semibold">Alcheme</span> – Psychometric Engine. Wszystkie prawa zastrzeżone.
        </p>
        <p className="text-slate-600 text-xs mt-2">
          <a
            href="/regulamin.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-400 transition underline underline-offset-2"
          >
            Regulamin Usługi
          </a>
        </p>
      </div>
    </footer>
  );
}

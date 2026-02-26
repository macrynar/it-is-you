export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-black/30 backdrop-blur-xl mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Col 1 – brand + contact */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" style={{ display: 'inline-block', marginBottom: 8, textDecoration: 'none' }}>
              <span style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: '.14em',
                background: 'linear-gradient(120deg,#fff 0%,rgba(0,240,255,.88) 55%,rgba(112,0,255,.75) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Alcheme</span>
            </a>
            <p className="text-slate-500 text-sm leading-relaxed">
              Naukowa diagnoza potencjału w formie przystępnej grywalizacji.
            </p>
            <a
              href="mailto:hello@alcheme.io"
              className="inline-block mt-4 text-sm text-cyan-400/80 hover:text-cyan-300 transition"
            >
              hello@alcheme.io
            </a>
          </div>

          {/* Col 2 – Metodologia */}
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Metodologia</h4>
            <ul className="space-y-1.5 text-slate-500 text-sm" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li><a href="/methodology" className="hover:text-indigo-400 transition">Metodologia</a></li>
            </ul>
          </div>

          {/* Col 3 – Projekt */}
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Projekt</h4>
            <ul className="space-y-1.5 text-slate-500 text-sm" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                ['Strona główna',  '/'],
                ['Cennik',         '/pricing'],
                ['Metodologia',    '/methodology'],
                ['Testy',          '/user-profile-tests'],
                ['Karta Postaci',  '/character'],
              ].map(([label, href]) => (
                <li key={label}><a href={href} className="hover:text-indigo-400 transition">{label}</a></li>
              ))}
            </ul>
          </div>

          {/* Col 4 – Legal */}
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Legal</h4>
            <ul className="space-y-1.5 text-slate-500 text-sm" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li><a href="/privacy-policy"       className="hover:text-indigo-400 transition">Polityka Prywatności</a></li>
              <li><a href="/regulamin.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition">Regulamin</a></li>
              <li><a href="/privacy-policy#rodo"  className="hover:text-indigo-400 transition">RODO</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>&copy; {year} Alcheme. All rights reserved.</span>
          <span>Disclaimer: To narzędzie rozwojowe, nie diagnoza kliniczna.</span>
        </div>
      </div>
    </footer>
  );
}

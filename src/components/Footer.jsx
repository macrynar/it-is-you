export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/30 backdrop-blur-xl mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <span className="font-bold text-lg text-white tracking-tight block mb-2">Alcheme</span>
            <p className="text-slate-500 text-sm leading-relaxed">Naukowa diagnoza potencjału w formie przystępnej grywalizacji.</p>
            <a href="mailto:hello@alcheme.io" className="inline-block mt-4 text-sm text-cyan-400/80 hover:text-cyan-300 transition">hello@alcheme.io</a>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Metodologia</h4>
            <ul className="space-y-1.5 text-slate-500 text-sm">
              {[['HEXACO & Big Five', '/methodology#hexaco'], ['Enneagram RHETI', '/methodology#enneagram'], ['O*NET Database', '/methodology#career'], ['Dark Triad SD3', '/methodology#darktriad']].map(([l, href]) => (
                <li key={l}><a href={href} className="hover:text-indigo-400 transition">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Projekt</h4>
            <ul className="space-y-1.5 text-slate-500 text-sm">
              {[['Cennik', '/pricing'], ['Metodologia', '/methodology'], ['Testy', '/user-profile-tests'], ['Karta Postaci', '/character']].map(([l, href]) => (
                <li key={l}><a href={href} className="hover:text-indigo-400 transition">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Legal</h4>
            <ul className="space-y-1.5 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition">Polityka Prywatności</a></li>
              <li><a href="/regulamin.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition">Regulamin</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition">RODO</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Alcheme. All rights reserved. Disclaimer: To narzędzie rozwojowe, nie diagnoza kliniczna.
        </div>
      </div>
    </footer>
  );
}

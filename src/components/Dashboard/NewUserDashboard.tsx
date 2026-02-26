import React from 'react';
import { Lock, LogOut, User, AlertCircle } from 'lucide-react';
import AlchemeLogo from '../AlchemeLogo';

interface NewUserDashboardProps {
  username: string;
  onStartTest: () => void;
  onLogout: () => void;
}

export default function NewUserDashboard({
  username,
  onStartTest,
  onLogout,
}: NewUserDashboardProps) {
  return (
    <div className="min-h-screen">
      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <AlchemeLogo href="/" size={30} />

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Account Status Badge */}
            <span className="badge badge-pending">Konto Free</span>

            {/* User Info */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center ring-2 ring-brand-primary/30">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-200 hidden sm:block">{username}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="btn-ghost p-2 rounded-lg"
              title="Wyloguj się"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* HERO SECTION */}
        <section className="mb-16">
          <div className="text-center mb-12">
            {/* Alert Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center border border-amber-500/20 shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]">
                <AlertCircle className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-4 font-brand">
              System Niezakalibrowany
            </h1>

            {/* Subtext */}
            <p className="text-lg text-text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
              Twój profil psychometryczny jest pusty. Wykonaj test bazowy, aby wygenerować swoją unikalną Kartę Postaci i odkryć swoją psychologiczną naturę.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={onStartTest}
                className="btn-primary-lg animate-glow-pulse hover:animate-none"
              >
                <Zap className="w-5 h-5" />
                <span>ROZPOCZNIJ TEST OSOBOWOŚCI</span>
                <span className="text-sm font-normal opacity-70">(15 min)</span>
              </button>
            </div>

            {/* Calibration Progress Bar */}
            <div className="max-w-xl mx-auto">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Postęp Kalibracji
                </span>
                <span className="text-xs font-bold text-brand-primary">5%</span>
              </div>
              <div className="stat-bar-track">
                <div className="stat-bar-fill" style={{ width: '5%' }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Wymagany test bazowy, aby rozp ocząć kalibrację systemu
              </p>
            </div>
          </div>
        </section>

        {/* GHOST CHARACTER SHEET */}
        <section className="mb-8">
          <div className="glass-panel rounded-3xl overflow-hidden shadow-glow-primary">
            {/* Character Card Grid */}
            <div className="grid md:grid-cols-12 gap-0">
              {/* COLUMN 1: IDENTITY & CLASS (30%) */}
              <div className="md:col-span-4 bg-bg-surface/50 p-6 border-r border-white/5 flex flex-col relative">
                {/* Avatar Placeholder */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-24 h-24 rounded-full bg-bg-surface border-2 border-white/10 flex items-center justify-center flex-shrink-0 ring-2 ring-brand-primary/20">
                    <User className="w-12 h-12 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-600 mb-2">???</h2>
                    <p className="text-slate-600">Archetyp Nieznany</p>
                  </div>
                </div>

                {/* Core Stats (Disabled) */}
                <div className="w-full space-y-3 mb-8">
                  <div className="flex justify-between items-center bg-slate-950/60 px-3 py-2.5 rounded border border-slate-700 opacity-50">
                    <span className="text-[10px] text-slate-600 uppercase font-bold">Klasa (DISC)</span>
                    <span className="text-sm font-bold text-slate-600">---</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/60 px-3 py-2.5 rounded border border-slate-700 opacity-50">
                    <span className="text-[10px] text-slate-600 uppercase font-bold">Typ (MBTI)</span>
                    <span className="text-sm font-bold text-slate-600">---</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/60 px-3 py-2.5 rounded border border-slate-700 opacity-50">
                    <span className="text-[10px] text-slate-600 uppercase font-bold">Enneagram</span>
                    <span className="text-sm font-bold text-slate-600">---</span>
                  </div>
                </div>

                {/* Archetype Badge (Disabled) */}
                <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 w-full mb-6 relative group cursor-not-allowed opacity-50">
                  <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-bold flex justify-between">
                    <span>Archetyp Operacyjny</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-slate-600 font-bold text-lg mb-1">
                    <Lock className="w-5 h-5" />
                    Zablokowany
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1 leading-tight text-center">
                    Dostępny po wykonaniu testu psychometrycznego
                  </p>
                </div>

                {/* Values Tags (Disabled) */}
                <div className="w-full text-left mt-auto">
                  <h5 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 opacity-50">Kompas Wartości</h5>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-slate-800/30 border border-slate-700/50 rounded text-[10px] text-slate-600 font-medium opacity-50">---</span>
                    <span className="px-2 py-1 bg-slate-800/30 border border-slate-700/50 rounded text-[10px] text-slate-600 font-medium opacity-50">---</span>
                    <span className="px-2 py-1 bg-slate-800/30 border border-slate-700/50 rounded text-[10px] text-slate-600 font-medium opacity-50">---</span>
                  </div>
                </div>
              </div>

              {/* COLUMN 2: STATS & BEHAVIOR (35%) - LOCKED */}
              <div className="md:col-span-4 p-8 border-r border-white/5 bg-bg-surface/30 relative">
                {/* Lock Overlay */}
                <div className="absolute inset-0 backdrop-blur-sm bg-black/30 rounded-lg flex items-center justify-center group hover:bg-black/40 transition z-20">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-slate-500 mx-auto mb-2 group-hover:text-slate-400 transition" />
                    <p className="text-xs text-slate-500 font-semibold">Zablokowane</p>
                  </div>
                </div>

                {/* Disabled Stats */}
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-6 flex items-center gap-2 opacity-50">
                  <div className="w-4 h-4 bg-slate-700 rounded"></div>
                  Statystyki Główne (Big Five)
                </h4>

                <div className="space-y-5 opacity-50">
                  {['Otwartość', 'Stabilność', 'Ekstrawersja', 'Ugodowość', 'Sumienność'].map((stat) => (
                    <div key={stat} className="group">
                      <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                        <span>{stat}</span>
                        <span>---%</span>
                      </div>
                      <div className="stat-bar-container bg-slate-800/30 h-2 rounded border border-slate-700/50 overflow-hidden">
                        <div className="h-full bg-slate-700/30 rounded w-0"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLUMN 3: TALENTS & ENERGY (25%) - LOCKED */}
              <div className="md:col-span-4 p-8 bg-bg-surface/30 flex flex-col gap-6 relative">
                {/* Lock Overlay */}
                <div className="absolute inset-0 backdrop-blur-sm bg-black/30 rounded-lg flex items-center justify-center group hover:bg-black/40 transition z-20">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-slate-500 mx-auto mb-2 group-hover:text-slate-400 transition" />
                    <p className="text-xs text-slate-500 font-semibold">Zablokowane</p>
                  </div>
                </div>

                {/* Disabled Talents */}
                <div className="opacity-50">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">Ekwipunek (Talenty)</h4>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center border border-slate-700 flex-shrink-0">
                          <div className="w-3 h-3 bg-slate-700 rounded"></div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-600">Talent {i}</div>
                          <div className="text-[11px] text-slate-600 leading-tight">Opis niedostępny</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disabled Energy */}
                <div className="grid grid-cols-1 gap-4 mt-2 opacity-50">
                  <div className="bg-slate-800/20 border border-slate-700/50 rounded-lg p-3">
                    <h5 className="text-[10px] font-bold text-slate-600 uppercase mb-2 flex items-center gap-1">
                      Co Cię Ładuje
                    </h5>
                    <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                      <li>Niedostępne</li>
                    </ul>
                  </div>

                  <div className="bg-slate-800/20 border border-slate-700/50 rounded-lg p-3">
                    <h5 className="text-[10px] font-bold text-slate-600 uppercase mb-2 flex items-center gap-1">
                      Co Cię Drenuje
                    </h5>
                    <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                      <li>Niedostępne</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Message */}
        <div className="text-center mt-12 p-8 glass-panel-brand rounded-2xl">
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl mx-auto">
            Każdy element Twojej karty postaci zostanie wygenerowany na podstawie odpowiedzi w teście psychometrycznym. Test trwa około 15 minut i nie wymaga żadnej specjalnej wiedzy — odpowiadaj szczerze!
          </p>
        </div>
      </main>

      {/* FOOTER */}
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
    </div>
  );
}
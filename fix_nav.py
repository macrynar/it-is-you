import re
import os

NAV_CSS = """    /* ALCHEME NAV */
    .alcheme-logo{display:flex;align-items:center;gap:11px;cursor:pointer;user-select:none;text-decoration:none;}
    .alcheme-logo-texts{display:flex;flex-direction:column;gap:2px;}
    .alcheme-logo-name{font-family:'Cinzel',serif;font-size:17px;font-weight:600;letter-spacing:.14em;line-height:1;background:linear-gradient(120deg,#fff 0%,rgba(0,240,255,.88) 55%,rgba(112,0,255,.75) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .alcheme-logo-sub{font-family:'Raleway',sans-serif;font-size:6.5px;font-weight:300;letter-spacing:.36em;text-transform:uppercase;color:rgba(255,255,255,.28);padding-left:1px;}
    .glass-panel{background:rgba(15,23,42,.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.08);box-shadow:0 4px 30px rgba(0,0,0,.1);}
    .iiy-nav-link{position:relative;color:rgba(255,255,255,.5);font-size:13.5px;font-weight:600;text-decoration:none;padding:4px 0;transition:color .2s;white-space:nowrap;letter-spacing:.2px;font-family:'Space Grotesk',-apple-system,sans-serif;}
    .iiy-nav-link::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:1.5px;border-radius:2px;background:linear-gradient(90deg,#00f0ff,#7000ff);box-shadow:0 0 8px rgba(0,240,255,.55);transition:width .25s ease;}
    .iiy-nav-link:hover{color:rgba(255,255,255,.9);}.iiy-nav-link:hover::after{width:100%;}
    .iiy-nav-link.active{color:#fff;}.iiy-nav-link.active::after{width:100%;}
    .nav-icon-btn{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;color:rgba(255,255,255,.45);border:1px solid transparent;background:none;cursor:pointer;transition:all .2s;text-decoration:none;}
    .nav-icon-btn:hover{color:#fff;background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.1);}
    .nav-icon-btn.logout:hover{color:#f87171;background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.2);}"""

NAV_HTML = """<nav id="main-nav" class="fixed w-full z-50 glass-panel border-b border-white/5 bg-slate-950/80">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-20">
      <a href="/" class="alcheme-logo">
        <svg width="38" height="38" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
          <defs><filter id="alch-gs"><feGaussianBlur stdDeviation=".9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="alch-gm"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="alch-gl"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          <circle cx="50" cy="50" r="47" fill="rgba(10,4,40,.55)" stroke="rgba(255,255,255,.18)" stroke-width="1.2"/><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.07)" stroke-width=".4"/>
          <polygon points="50,8 92,50 50,92 8,50" fill="rgba(112,0,255,.08)" stroke="rgba(167,139,250,.55)" stroke-width="1.2" stroke-linejoin="round"/>
          <polygon points="79.7,20.3 79.7,79.7 20.3,79.7 20.3,20.3" fill="rgba(112,0,255,.08)" stroke="rgba(167,139,250,.55)" stroke-width="1.2" stroke-linejoin="round"/>
          <polygon points="50,8 79.7,79.7 8,50 79.7,20.3 50,92 20.3,20.3 92,50 20.3,79.7" fill="rgba(0,240,255,.07)" stroke="#00f0ff" stroke-width="1.4" stroke-linejoin="round" filter="url(#alch-gs)"/>
          <circle cx="50" cy="8" r="3.5" fill="#00f0ff" filter="url(#alch-gm)"/><circle cx="79.7" cy="20.3" r="3" fill="#c4b5fd" filter="url(#alch-gs)"/><circle cx="92" cy="50" r="3.5" fill="#00f0ff" filter="url(#alch-gm)"/><circle cx="79.7" cy="79.7" r="3" fill="#c4b5fd" filter="url(#alch-gs)"/><circle cx="50" cy="92" r="3.5" fill="#00f0ff" filter="url(#alch-gm)"/><circle cx="20.3" cy="79.7" r="3" fill="#c4b5fd" filter="url(#alch-gs)"/><circle cx="8" cy="50" r="3.5" fill="#00f0ff" filter="url(#alch-gm)"/><circle cx="20.3" cy="20.3" r="3" fill="#c4b5fd" filter="url(#alch-gs)"/>
          <circle cx="50" cy="50" r="14" fill="rgba(0,240,255,.09)" filter="url(#alch-gl)"><animate attributeName="opacity" values=".3;.75;.3" dur="3s" repeatCount="indefinite"/></circle>
          <circle cx="50" cy="50" r="11" fill="#040115"/><circle cx="50" cy="50" r="11" fill="none" stroke="#00f0ff" stroke-width="2" filter="url(#alch-gs)"><animate attributeName="stroke-opacity" values=".5;1;.5" dur="3s" repeatCount="indefinite"/></circle>
          <circle cx="50" cy="50" r="3.5" fill="#00f0ff" filter="url(#alch-gm)"><animate attributeName="r" values="2.8;4.2;2.8" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".75;1;.75" dur="3s" repeatCount="indefinite"/></circle>
        </svg>
        <div class="alcheme-logo-texts">
          <div class="alcheme-logo-name">Alcheme</div>
          <div class="alcheme-logo-sub">Know yourself \u00b7 Transform</div>
        </div>
      </a>
      <div class="hidden md:flex items-center gap-8" id="nav-links">
        <a href="/baza-wiedzy/" class="iiy-nav-link active">Baza Wiedzy</a>
        <a href="/methodology" class="iiy-nav-link">Metodologia</a>
        <a href="/pricing" class="iiy-nav-link">Cennik</a>
      </div>
      <div class="flex items-center gap-4" id="nav-actions">
        <a href="/auth" class="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden sm:block">Zaloguj</a>
        <a href="/auth" class="bg-white text-slate-950 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-50 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)]">Wykonaj test</a>
      </div>
    </div>
  </div>
</nav>"""

SUPABASE_URL = "https://uvzilorpyuqicuwkufky.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2emlsb3JweXVxaWN1d2t1Zmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDQzNTAsImV4cCI6MjA4NjkyMDM1MH0.jNIkqASHNl_7WbLq0jBZ86kRDmRP2jzIbI-db9l9teA"

SETTINGS_SVG = '<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>'
LOGOUT_SVG = '<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>'

AUTH_JS = f"""  <script type="module">
    import {{ createClient }} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
    const supabase = createClient('{SUPABASE_URL}','{SUPABASE_KEY}');
    const SETTINGS_SVG = `{SETTINGS_SVG}`;
    const LOGOUT_SVG = `{LOGOUT_SVG}`;
    const {{ data: {{ session }} }} = await supabase.auth.getSession();
    if (session) {{
      document.getElementById('nav-links').innerHTML = `
        <a href="/baza-wiedzy/" class="iiy-nav-link active">Baza Wiedzy</a>
        <a href="/methodology" class="iiy-nav-link">Metodologia</a>
        <a href="/pricing" class="iiy-nav-link">Cennik</a>
        <a href="/character" class="iiy-nav-link">Karta Postaci</a>
        <a href="/user-profile-tests" class="iiy-nav-link">Moje testy</a>
      `;
      document.getElementById('nav-actions').innerHTML = `
        <a href="/settings" class="nav-icon-btn" title="Ustawienia">${{SETTINGS_SVG}}</a>
        <button class="nav-icon-btn logout" onclick="(async()=>{{const s=createClient('{SUPABASE_URL}','{SUPABASE_KEY}');await s.auth.signOut();location.href='/'}})()" title="Wyloguj">${{LOGOUT_SVG}}</button>
      `;
    }}
  </script>"""

files = [
    '/Users/maciejrynarzewski/projects/it-is-you/public/baza-wiedzy/index.html',
    '/Users/maciejrynarzewski/projects/it-is-you/public/baza-wiedzy/enneagram/index.html',
    '/Users/maciejrynarzewski/projects/it-is-you/public/baza-wiedzy/enneagram/typ-1-reformator.html',
    '/Users/maciejrynarzewski/projects/it-is-you/public/baza-wiedzy/enneagram/typ-4-indywidualista.html',
    '/Users/maciejrynarzewski/projects/it-is-you/public/baza-wiedzy/hexaco/index.html',
]

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Add Cinzel + Raleway to font link (if not already there)
    if 'Cinzel' not in html:
        html = html.replace(
            'family=Space+Grotesk:wght@400;500;600;700',
            'family=Space+Grotesk:wght@400;500;600;700&family=Cinzel:wght@600&family=Raleway:wght@300'
        )

    # 2. Replace custom nav CSS block
    html = re.sub(
        r'\s*/\* NAV \*/.*?\.nav-cta:hover\s*\{[^}]*\}',
        '\n' + NAV_CSS,
        html,
        flags=re.DOTALL
    )

    # 3. Replace <nav>...</nav> (first occurrence only, the main nav)
    html = re.sub(
        r'<nav>.*?</nav>',
        NAV_HTML,
        html,
        count=1,
        flags=re.DOTALL
    )

    # 4. Add body padding-top for fixed nav
    if 'padding-top: 80px' not in html:
        html = re.sub(
            r'(body\s*\{[^}]*?)(\})',
            r'\1  padding-top: 80px;\n    \2',
            html,
            count=1,
            flags=re.DOTALL
        )

    # 5. Add auth JS before </body> (if not already present)
    if 'supabase.auth.getSession' not in html:
        html = html.replace('</body>', AUTH_JS + '\n</body>')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f'OK: {path}')

print('All done.')

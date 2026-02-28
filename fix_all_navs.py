import re

# =========================================================
# 1. Add tw.css to all 5 baza-wiedzy HTML pages
# =========================================================
baza_files = [
    '/Users/maciejrynarzewski/projects/it-is-you/public/baza-wiedzy/index.html',
    '/Users/maciejrynarzewski/projects/it-is-you/public/baza-wiedzy/enneagram/index.html',
    '/Users/maciejrynarzewski/projects/it-is-you/public/baza-wiedzy/enneagram/typ-1-reformator.html',
    '/Users/maciejrynarzewski/projects/it-is-you/public/baza-wiedzy/enneagram/typ-4-indywidualista.html',
    '/Users/maciejrynarzewski/projects/it-is-you/public/baza-wiedzy/hexaco/index.html',
]

for path in baza_files:
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    if '/tw.css' not in html:
        # Insert after <head>
        html = html.replace('<head>', '<head>\n  <link rel="stylesheet" href="/tw.css">', 1)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'tw.css added: {path}')
    else:
        print(f'tw.css already present: {path}')

print()

# =========================================================
# 2. Replace nav in CharacterSheet.tsx
# =========================================================
cs_path = '/Users/maciejrynarzewski/projects/it-is-you/src/components/CharacterSheet/CharacterSheet.tsx'
with open(cs_path, 'r', encoding='utf-8') as f:
    cs = f.read()

# Add import
if "import MainNav" not in cs:
    cs = cs.replace(
        "import AlchemeLogo from '../AlchemeLogo';",
        "import AlchemeLogo from '../AlchemeLogo';\nimport MainNav from '../shared/MainNav';"
    )
    print('Added MainNav import to CharacterSheet.tsx')

# Replace the big authenticated nav block:
# Find from '{/* TOP NAV */}' to the end of '))}' that closes the nav conditional
# The block ends right before <main
TOP_NAV_START = '      {/* TOP NAV */}\n      {!demoMode && (!isPublic ? (\n      <nav className="border-b border-white/5 bg-bg-surface/80 backdrop-blur-xl sticky top-0 z-50 nav-neural">'

if TOP_NAV_START in cs:
    # Find the public nav variant and closing brackets
    public_nav = '''      ) : (
      <nav className="border-b border-white/5 bg-bg-surface/80 backdrop-blur-xl sticky top-0 z-50 nav-neural">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <AlchemeLogo href="/" size={32} />
            <a
              href="/auth"
              className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(120deg, rgba(112,0,255,.75) 0%, rgba(0,200,220,.8) 100%)',
                boxShadow: '0 0 18px -4px rgba(0,240,255,.35)',
                textDecoration: 'none',
              }}
            >
              Stwórz swoją kartę
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
          </div>
        </div>
      </nav>
      ))}'''

    REPLACEMENT = '''      {/* TOP NAV */}
      {!demoMode && (!isPublic ? (
        <MainNav activeLink="character" theme={theme} onThemeToggle={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} />
      ) : (
      <nav className="border-b border-white/5 bg-bg-surface/80 backdrop-blur-xl sticky top-0 z-50 nav-neural">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <AlchemeLogo href="/" size={32} />
            <a
              href="/auth"
              className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(120deg, rgba(112,0,255,.75) 0%, rgba(0,200,220,.8) 100%)',
                boxShadow: '0 0 18px -4px rgba(0,240,255,.35)',
                textDecoration: 'none',
              }}
            >
              Stwórz swoją kartę
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
          </div>
        </div>
      </nav>
      ))}'''

    # Find the start of the auth nav block
    start_idx = cs.find('      {/* TOP NAV */}')
    # Find the end - the public nav closing
    end_marker = '      ))}\n\n      <main'
    end_idx = cs.find('      ))}\n\n      <main')
    if end_idx == -1:
        end_marker = '      ))}\n      <main'
        end_idx = cs.find(end_marker)
    
    if start_idx != -1 and end_idx != -1:
        cs = cs[:start_idx] + REPLACEMENT + '\n\n      <main' + cs[end_idx + len(end_marker):]
        print('Replaced nav block in CharacterSheet.tsx')
    else:
        print(f'Could not find end_marker in CharacterSheet.tsx (start_idx={start_idx}, end_idx={end_idx})')
else:
    print('TOP_NAV_START not found in CharacterSheet.tsx - nav may already use MainNav')

# Remove mobileMenuOpen state since MainNav handles it now
cs = re.sub(r'  const \[mobileMenuOpen, setMobileMenuOpen\] = useState\(false\);\n', '', cs)
print('Removed mobileMenuOpen state from CharacterSheet.tsx')

with open(cs_path, 'w', encoding='utf-8') as f:
    f.write(cs)
print('CharacterSheet.tsx saved')
print()

# =========================================================
# 3. Replace nav in NewUserDashboard.tsx
# =========================================================
nud_path = '/Users/maciejrynarzewski/projects/it-is-you/src/components/Dashboard/NewUserDashboard.tsx'
with open(nud_path, 'r', encoding='utf-8') as f:
    nud = f.read()

# Check if AlchemeLogo is imported (it already is based on earlier search result)
# Add MainNav import
if "import MainNav" not in nud:
    if "import AlchemeLogo" in nud:
        nud = nud.replace(
            "import AlchemeLogo",
            "import MainNav from '../shared/MainNav';\nimport AlchemeLogo"
        )
    else:
        # Find first import and add after it
        nud = re.sub(r'(import[^\n]+\n)', r'\1import MainNav from \'../shared/MainNav\';\n', nud, count=1)
    print('Added MainNav import to NewUserDashboard.tsx')

# Replace the nav block (lines 20-48 based on earlier reading)
OLD_NUD_NAV = '      {/* NAVBAR */}\n      <nav className="border-b border-white/5 bg-bg-surface/80 backdrop-blur-md sticky top-0 z-50">'
if OLD_NUD_NAV in nud:
    # Find nav end </nav> after this
    nav_start = nud.find(OLD_NUD_NAV)
    nav_end = nud.find('      </nav>', nav_start) + len('      </nav>')
    
    nud = nud[:nav_start] + '      {/* NAVBAR */}\n      <MainNav activeLink="tests" />' + nud[nav_end:]
    print('Replaced nav in NewUserDashboard.tsx')
else:
    print('Nav block not found in NewUserDashboard.tsx')

with open(nud_path, 'w', encoding='utf-8') as f:
    f.write(nud)
print('NewUserDashboard.tsx saved')
print()
print('All done!')

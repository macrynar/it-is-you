import re

# === CharacterSheet.tsx ===
path = '/Users/maciejrynarzewski/projects/it-is-you/src/components/CharacterSheet/CharacterSheet.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the giant nav block with shared MainNav component
# Pattern: from {/* TOP NAV */} through end of nav conditional
old = re.search(r'(\s+\{/\* TOP NAV \*/\}\s+\{!demoMode &&.*?)\}\}\)\}\s*\n(\s+<main)', content, re.DOTALL)
if old:
    # Build the replacement
    repl = '''      {/* TOP NAV */}
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
      ))}
'''
    start = old.start(1)
    end = old.end(1) + len('))}')
    
    # Find what's immediately after the nav conditional
    after_nav = content[end:]
    # Find the <main start
    main_match = re.search(r'\s*\n(\s+<main)', after_nav)
    if main_match:
        end = end + main_match.start()
    
    content = content[:old.start(1)] + repl + content[end:]
    print(f'Replacement done. New length: {len(content)}')
else:
    print('Pattern NOT matched')

# Add MainNav import after AlchemeLogo import
if "import MainNav" not in content:
    content = content.replace(
        "import AlchemeLogo from '../AlchemeLogo';",
        "import AlchemeLogo from '../AlchemeLogo';\nimport MainNav from '../shared/MainNav';"
    )
    print('Import added')

# Remove mobileMenuOpen state since MainNav handles it
old_state = re.search(r'\s+const \[mobileMenuOpen, setMobileMenuOpen\] = useState\(false\);\n', content)
if old_state:
    content = content[:old_state.start()] + '\n' + content[old_state.end():]
    print('mobileMenuOpen state removed')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('CharacterSheet.tsx done')

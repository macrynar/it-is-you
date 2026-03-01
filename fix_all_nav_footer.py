#!/usr/bin/env python3
"""
fix_all_nav_footer.py — Unified nav/footer fix for all HTML files.

Canonical rules:
  - Public desktop links: Baza Wiedzy, Metodologia, Cennik
  - Auth   desktop links: Baza Wiedzy, Metodologia, Cennik, Karta Postaci, Moje Testy
  - Nav action (public):  single gradient "Zaloguj się" button
  - Nav action (auth):    Settings icon + Logout icon
  - Remove dark/light mode toggle everywhere
  - Canonical footer on all pages
  - Logo href always "/"
"""

import re, os, glob

BASE = "/Users/maciejrynarzewski/projects/it-is-you/public"

# ─── Canonical snippets ──────────────────────────────────────────────────────

NAV_ACTION_PUBLIC = (
    '<div class="hidden md:flex items-center gap-4" id="nav-actions">\n'
    '          <a href="/auth" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all" style="background:linear-gradient(120deg,rgba(112,0,255,.75) 0%,rgba(0,200,220,.8) 100%);box-shadow:0 0 18px -4px rgba(0,240,255,.35);text-decoration:none;">Zaloguj się <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg></a>\n'
    '        </div>'
)

NAV_ACTION_PUBLIC_ALT = (
    '<div id="nav-actions" class="hidden md:flex items-center gap-4">\n'
    '        <a href="/auth" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all" style="background:linear-gradient(120deg,rgba(112,0,255,.75) 0%,rgba(0,200,220,.8) 100%);box-shadow:0 0 18px -4px rgba(0,240,255,.35);text-decoration:none;">Zaloguj się <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg></a>\n'
    '      </div>'
)

# Mobile menu "Zaloguj się" single button (used in public pages)
MOBILE_LOGIN_BTN = (
    '<a href="/auth" class="flex items-center justify-center gap-2 mb-2 py-3 '
    'rounded-xl text-sm font-semibold text-white transition-all" '
    'style="text-decoration:none;background:linear-gradient(120deg,rgba(112,0,255,.75),rgba(0,200,220,.8));">'
    'Zaloguj się</a>'
)

# Canonical footer HTML
CANONICAL_FOOTER = '''  <footer class="border-t border-white/5 bg-black/30 backdrop-blur-xl mt-16">
    <div class="max-w-7xl mx-auto px-6 py-10">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
        <div class="col-span-2 md:col-span-1">
          <a href="/" style="display:inline-block;margin-bottom:8px;text-decoration:none;">
            <span style="font-family:'Cinzel',serif;font-size:18px;font-weight:600;letter-spacing:.14em;background:linear-gradient(120deg,#fff 0%,rgba(0,240,255,.88) 55%,rgba(112,0,255,.75) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Alcheme</span>
          </a>
          <p style="color:rgba(100,116,139,1);font-size:14px;line-height:1.6;">Naukowa diagnoza potencjału w formie przystępnej grywalizacji.</p>
          <a href="mailto:hello@alcheme.io" style="display:inline-block;margin-top:16px;font-size:14px;color:rgba(34,211,238,.8);text-decoration:none;">hello@alcheme.io</a>
        </div>
        <div>
          <h4 style="color:#fff;font-weight:700;margin-bottom:12px;font-size:14px;">Projekt</h4>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;">
            <li><a href="/" style="color:rgba(100,116,139,1);font-size:14px;text-decoration:none;" onmouseover="this.style.color='#818cf8'" onmouseout="this.style.color='rgba(100,116,139,1)'">Strona główna</a></li>
            <li><a href="/pricing" style="color:rgba(100,116,139,1);font-size:14px;text-decoration:none;" onmouseover="this.style.color='#818cf8'" onmouseout="this.style.color='rgba(100,116,139,1)'">Cennik</a></li>
            <li><a href="/methodology" style="color:rgba(100,116,139,1);font-size:14px;text-decoration:none;" onmouseover="this.style.color='#818cf8'" onmouseout="this.style.color='rgba(100,116,139,1)'">Metodologia</a></li>
            <li><a href="/user-profile-tests" style="color:rgba(100,116,139,1);font-size:14px;text-decoration:none;" onmouseover="this.style.color='#818cf8'" onmouseout="this.style.color='rgba(100,116,139,1)'">Testy</a></li>
            <li><a href="/character" style="color:rgba(100,116,139,1);font-size:14px;text-decoration:none;" onmouseover="this.style.color='#818cf8'" onmouseout="this.style.color='rgba(100,116,139,1)'">Karta Postaci</a></li>
          </ul>
        </div>
        <div>
          <h4 style="color:#fff;font-weight:700;margin-bottom:12px;font-size:14px;">Baza Wiedzy</h4>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;">
            <li><a href="/baza-wiedzy/" style="color:rgba(100,116,139,1);font-size:14px;text-decoration:none;" onmouseover="this.style.color='#818cf8'" onmouseout="this.style.color='rgba(100,116,139,1)'">Wszystkie modele</a></li>
            <li><a href="/baza-wiedzy/enneagram/" style="color:rgba(100,116,139,1);font-size:14px;text-decoration:none;" onmouseover="this.style.color='#818cf8'" onmouseout="this.style.color='rgba(100,116,139,1)'">Enneagram</a></li>
            <li><a href="/baza-wiedzy/hexaco/" style="color:rgba(100,116,139,1);font-size:14px;text-decoration:none;" onmouseover="this.style.color='#818cf8'" onmouseout="this.style.color='rgba(100,116,139,1)'">HEXACO</a></li>
          </ul>
        </div>
        <div>
          <h4 style="color:#fff;font-weight:700;margin-bottom:12px;font-size:14px;">Legal</h4>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;">
            <li><a href="/privacy-policy" style="color:rgba(100,116,139,1);font-size:14px;text-decoration:none;" onmouseover="this.style.color='#818cf8'" onmouseout="this.style.color='rgba(100,116,139,1)'">Polityka Prywatności</a></li>
            <li><a href="/regulamin.pdf" target="_blank" rel="noopener noreferrer" style="color:rgba(100,116,139,1);font-size:14px;text-decoration:none;" onmouseover="this.style.color='#818cf8'" onmouseout="this.style.color='rgba(100,116,139,1)'">Regulamin</a></li>
            <li><a href="/privacy-policy#rodo" style="color:rgba(100,116,139,1);font-size:14px;text-decoration:none;" onmouseover="this.style.color='#818cf8'" onmouseout="this.style.color='rgba(100,116,139,1)'">RODO</a></li>
          </ul>
        </div>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.05);padding-top:24px;display:flex;flex-direction:column;gap:8px;align-items:center;justify-content:space-between;" class="sm:flex-row">
        <span style="color:rgba(100,116,139,1);font-size:12px;">&copy; 2026 Alcheme. All rights reserved.</span>
        <span style="color:rgba(100,116,139,1);font-size:12px;">Disclaimer: To narzędzie rozwojowe, nie diagnoza kliniczna.</span>
      </div>
    </div>
  </footer>'''

# ─── Helper functions ─────────────────────────────────────────────────────────

def remove_theme_toggle_css(html: str) -> str:
    """Remove all .theme-toggle CSS rules."""
    # Remove multi-line .theme-toggle block
    html = re.sub(
        r'\s*\.theme-toggle\s*\{[^}]*\}',
        '', html
    )
    html = re.sub(
        r'\s*\.theme-toggle:hover\s*\{[^}]*\}',
        '', html
    )
    html = re.sub(
        r'\s*\.theme-toggle-slider\s*\{[^}]*\}',
        '', html
    )
    html = re.sub(
        r'\s*\.theme-toggle\.light\s+\.theme-toggle-slider\s*\{[^}]*\}',
        '', html
    )
    html = re.sub(
        r'\s*\.theme-icon\s*\{[^}]*\}',
        '', html
    )
    html = re.sub(
        r'\s*\.theme-icon-moon\s*\{[^}]*\}',
        '', html
    )
    html = re.sub(
        r'\s*\.theme-icon-sun\s*\{[^}]*\}',
        '', html
    )
    html = re.sub(
        r'\s*\.theme-toggle\.light\s+\.theme-icon-moon\s*\{[^}]*\}',
        '', html
    )
    html = re.sub(
        r'\s*\.theme-toggle\.light\s+\.theme-icon-sun\s*\{[^}]*\}',
        '', html
    )
    return html

def remove_theme_toggle_button(html: str) -> str:
    """Remove the static nav-theme-btn button element."""
    html = re.sub(
        r'\s*<button[^>]*id=["\']nav-theme-btn["\'][^>]*>.*?</button>',
        '', html, flags=re.DOTALL
    )
    return html

def remove_theme_toggle_js(html: str) -> str:
    """Remove MOON_SVG, SUN_SVG constants and theme toggle inject code from JS."""
    html = re.sub(r'\s*const MOON_SVG\s*=\s*`[^`]*`;', '', html)
    html = re.sub(r'\s*const SUN_SVG\s*=\s*`[^`]*`;', '', html)
    # Remove theme toggle injection lines
    html = re.sub(
        r'\s*(?:document\.getElementById\(["\']nav-theme-btn["\'\)][^;]*;|const toggles?\s*=.*?theme-toggle[^;]*;[^}]*)',
        '', html, flags=re.DOTALL
    )
    # Remove the long theme toggle inject block in index.html
    html = re.sub(
        r'\s*document\.querySelectorAll\([\'"]\.theme-toggle[\'"]\).*?;',
        '', html, flags=re.DOTALL
    )
    return html

def fix_nav_actions_two_buttons(html: str) -> str:
    """Replace 'Zaloguj + Wykonaj test' two-button pattern with single gradient button."""
    
    # Pattern variant 1: id comes after class
    # <div class="hidden md:flex items-center gap-4" id="nav-actions">
    pattern1 = re.compile(
        r'(<div class="hidden md:flex items-center gap-4" id="nav-actions">)\s*'
        r'<a href="/auth"[^>]*>Zaloguj</a>\s*'
        r'<a href="/auth"[^>]*(?:shadow[^"]*"[^>]*)?>(?:\s*\n\s*)?Wykonaj test(?:\s*\n\s*)?</a>\s*'
        r'(</div>)',
        re.DOTALL
    )
    repl1 = (
        '<div class="hidden md:flex items-center gap-4" id="nav-actions">\n'
        '          <a href="/auth" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all" style="background:linear-gradient(120deg,rgba(112,0,255,.75) 0%,rgba(0,200,220,.8) 100%);box-shadow:0 0 18px -4px rgba(0,240,255,.35);text-decoration:none;">Zaloguj się <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg></a>\n'
        '        </div>'
    )
    html = pattern1.sub(repl1, html)
    
    # Pattern variant 2: id comes first
    # <div id="nav-actions" class="hidden md:flex items-center gap-4">
    pattern2 = re.compile(
        r'(<div id="nav-actions" class="hidden md:flex items-center gap-4">)\s*'
        r'<a href="/auth"[^>]*>Zaloguj</a>\s*'
        r'<a href="/auth"[^>]*(?:shadow[^"]*"[^>]*)?>(?:\s*\n\s*)?Wykonaj test(?:\s*\n\s*)?</a>\s*'
        r'(</div>)',
        re.DOTALL
    )
    repl2 = (
        '<div id="nav-actions" class="hidden md:flex items-center gap-4">\n'
        '        <a href="/auth" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all" style="background:linear-gradient(120deg,rgba(112,0,255,.75) 0%,rgba(0,200,220,.8) 100%);box-shadow:0 0 18px -4px rgba(0,240,255,.35);text-decoration:none;">Zaloguj się <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg></a>\n'
        '      </div>'
    )
    html = pattern2.sub(repl2, html)
    
    # Also remove extra "Wykonaj test" button from mobile menu
    html = re.sub(
        r'\s*<a href="/auth"[^>]*bg-white[^>]*text-slate-950[^>]*>(?:\s*\n\s*)?Wykonaj test(?:\s*\n\s*)?</a>',
        '', html, flags=re.DOTALL
    )
    # Remove "Zaloguj" plain link if still present as separate item (before the gradient button)
    html = re.sub(
        r'\s*<a href="/auth" class="text-sm font-medium text-slate-400[^"]*"(?:\s+[^>]*)?>Zaloguj</a>',
        '', html
    )
    # Also handle hidden sm:block variant
    html = re.sub(
        r'\s*<a href="/auth" class="text-sm font-medium text-slate-400[^"]*hidden sm:block[^"]*"(?:\s+[^>]*)?>Zaloguj</a>',
        '', html
    )
    return html

def fix_mobile_menu_remove_wykonaj(html: str) -> str:
    """Remove 'Wykonaj test' link from mobile menu."""
    html = re.sub(
        r'\s*<a href="/auth"[^>]*(?:font-bold text-slate-950 bg-white|bg-white[^>]*text-slate-950)[^>]*>\s*Wykonaj test\s*</a>',
        '', html, flags=re.DOTALL
    )
    return html

def add_baza_wiedzy_to_nav_links(html: str, active_key: str = None) -> str:
    """Ensure Baza Wiedzy appears as first desktop nav link."""
    # If already present, skip
    if 'href="/baza-wiedzy/"' in html and 'iiy-nav-link' in html:
        # Check if it's in the nav-links div specifically
        # We'll check for the desktop nav-links section
        nav_links_match = re.search(r'id="nav-links"[^>]*>.*?</div>', html, re.DOTALL)
        if nav_links_match and '/baza-wiedzy/' in nav_links_match.group(0):
            return html  # Already has it

    # Pattern: find the nav-links div and prepend Baza Wiedzy
    def add_baza(m):
        content = m.group(0)
        if '/baza-wiedzy/' not in content[:500]:
            baza_active = ' active' if active_key == 'baza-wiedzy' else ''
            baza_link = f'<a href="/baza-wiedzy/" class="iiy-nav-link{baza_active}">Baza Wiedzy</a>\n          '
            # Insert after the opening div tag
            content = re.sub(
                r'(id="nav-links"[^>]*>\s*)',
                r'\1' + baza_link,
                content
            )
        return content

    html = re.sub(
        r'<div[^>]*id="nav-links"[^>]*>.*?</div>',
        add_baza,
        html, flags=re.DOTALL, count=1
    )
    return html

def remove_korzysc_from_nav(html: str) -> str:
    """Remove 'Korzyści' link from nav."""
    html = re.sub(
        r'\s*<a href="[^"]*#features[^"]*" class="iiy-nav-link[^"]*">Korzyści</a>',
        '', html
    )
    # Also remove from mobile menu
    html = re.sub(
        r'\s*<a href="[^"]*#features[^"]*"[^>]*>Korzyści</a>',
        '', html
    )
    return html

def fix_logo_href(html: str) -> str:
    """Ensure logo href points to / not https://www.alcheme.io/"""
    html = html.replace(
        'href="https://www.alcheme.io/" class="alcheme-logo"',
        'href="/" class="alcheme-logo"'
    )
    return html

def fix_auth_js_links(html: str, active_key: str = '') -> str:
    """Ensure JS auth injection includes Baza Wiedzy in nav-links and correct mobile menu."""
    
    # Fix the authenticated nav-links JS injection to include Baza Wiedzy
    # Look for patterns where JS sets nav-links.innerHTML without Baza Wiedzy
    def fix_auth_nav_links(m):
        block = m.group(0)
        if '/baza-wiedzy/' not in block:
            baza_active = ' active' if active_key == 'baza-wiedzy' else ''
            baza_link = f'<a href="/baza-wiedzy/" class="iiy-nav-link{baza_active}">Baza Wiedzy</a>'
            # Insert at start of the innerHTML
            block = re.sub(
                r"(nav-links['\"].innerHTML\s*=\s*`\s*\n?\s*)",
                r'\1' + baza_link + r'\n        ',
                block
            )
        return block
    
    html = re.sub(
        r"document\.getElementById\('nav-links'\)\.innerHTML\s*=\s*`[^`]*`\s*;",
        fix_auth_nav_links,
        html, flags=re.DOTALL
    )
    
    # Also fix mobile-menu-content auth injection to include Baza Wiedzy
    def fix_auth_mobile_links(m):
        block = m.group(0)
        if '/baza-wiedzy/' not in block:
            baza_link = (
                '<a href="/baza-wiedzy/" class="flex items-center gap-3 px-4 py-3 '
                'rounded-xl text-sm font-semibold text-white/80 hover:text-white '
                'hover:bg-white/5 transition-all" style="text-decoration:none;">Baza Wiedzy</a>'
            )
            block = re.sub(
                r"(mobile-menu-content['\"].innerHTML\s*=\s*`\s*\n?\s*)",
                r'\1' + baza_link + r'\n        ',
                block
            )
        return block
    
    html = re.sub(
        r"document\.getElementById\('mobile-menu-content'\)\.innerHTML\s*=\s*`[^`]*`\s*;",
        fix_auth_mobile_links,
        html, flags=re.DOTALL
    )
    
    return html

def replace_footer(html: str) -> str:
    """Replace footer element with canonical footer."""
    html = re.sub(
        r'<footer[^>]*>.*?</footer>',
        CANONICAL_FOOTER,
        html, flags=re.DOTALL
    )
    return html

def fix_index_html_nav_links(html: str) -> str:
    """Fix index.html specific nav: replace old links with canonical set."""
    # index.html has class first, id second on nav-links
    html = re.sub(
        r'(<div id="nav-links" class="hidden md:flex items-center gap-8">)\s*'
        r'.*?'
        r'(</div>)',
        r'\1\n'
        r'                    <a href="/" class="iiy-nav-link active">Strona główna</a>\n'
        r'                    <a href="/baza-wiedzy/" class="iiy-nav-link">Baza Wiedzy</a>\n'
        r'                    <a href="/methodology" class="iiy-nav-link">Metodologia</a>\n'
        r'                    <a href="/pricing" class="iiy-nav-link">Cennik</a>\n'
        r'                \2',
        html, flags=re.DOTALL, count=1
    )
    return html

def fix_index_html_nav_actions(html: str) -> str:
    """Fix index.html nav-actions: replace two-button layout."""
    # index.html has id first on nav-actions
    html = re.sub(
        r'<div id="nav-actions" class="hidden md:flex items-center gap-4">.*?</div>',
        '<div id="nav-actions" class="hidden md:flex items-center gap-4">\n'
        '                    <a href="/auth" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all" style="background:linear-gradient(120deg,rgba(112,0,255,.75) 0%,rgba(0,200,220,.8) 100%);box-shadow:0 0 18px -4px rgba(0,240,255,.35);text-decoration:none;">Zaloguj się <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg></a>\n'
        '                </div>',
        html, flags=re.DOTALL, count=1
    )
    return html

def fix_index_html_mobile_menu(html: str) -> str:
    """Fix index.html mobile menu to include Baza Wiedzy."""
    # Replace mobile-menu-content for index.html  
    html = re.sub(
        r'(<div id="mobile-menu-content"[^>]*>)\s*.*?(</div>\s*</div>\s*</nav>)',
        r'\1\n'
        r'            <a href="/" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white hover:bg-white/5 transition-all" style="text-decoration:none;">Strona główna</a>\n'
        r'            <a href="/baza-wiedzy/" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-all" style="text-decoration:none;">Baza Wiedzy</a>\n'
        r'            <a href="/methodology" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-all" style="text-decoration:none;">Metodologia</a>\n'
        r'            <a href="/pricing" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-all" style="text-decoration:none;">Cennik</a>\n'
        r'            <div style="height:1px;background:rgba(255,255,255,0.06);margin:4px 0;"></div>\n'
        r'            <a href="/auth" class="flex items-center justify-center gap-2 mb-2 py-3 rounded-xl text-sm font-semibold text-white transition-all" style="text-decoration:none;background:linear-gradient(120deg,rgba(112,0,255,.75),rgba(0,200,220,.8));">Zaloguj się</a>\n'
        r'          \2',
        html, flags=re.DOTALL, count=1
    )
    return html

# ─── Process index.html ───────────────────────────────────────────────────────

def process_index_html(path: str):
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    original = html
    html = remove_theme_toggle_css(html)
    html = remove_theme_toggle_button(html)
    html = remove_theme_toggle_js(html)
    html = fix_logo_href(html)
    html = remove_korzysc_from_nav(html)
    
    # Fix desktop nav-links for index.html
    # Replace the three-link block (Metodologia, Korzyści removed above, Cennik) → add Baza Wiedzy
    # After removing Korzyści we have Metodologia + Cennik, need to add Baza Wiedzy
    html = re.sub(
        r'(<div id="nav-links" class="hidden md:flex items-center gap-8">)\s*'
        r'<a href="/methodology" class="iiy-nav-link">Metodologia</a>\s*'
        r'<a href="/pricing" class="iiy-nav-link">Cennik</a>\s*'
        r'(</div>)',
        r'\1\n'
        r'                    <a href="/baza-wiedzy/" class="iiy-nav-link">Baza Wiedzy</a>\n'
        r'                    <a href="/methodology" class="iiy-nav-link">Metodologia</a>\n'
        r'                    <a href="/pricing" class="iiy-nav-link">Cennik</a>\n'
        r'                \2',
        html, flags=re.DOTALL
    )
    # Fix nav-actions
    html = fix_nav_actions_two_buttons(html)
    # Also handle the specific index.html format with different whitespace
    html = re.sub(
        r'<div id="nav-actions" class="hidden md:flex items-center gap-4">\s*'
        r'<a href="/auth"[^>]*>Zaloguj</a>\s*'
        r'<a href="/auth"[^>]*>\s*\n\s*Wykonaj test\s*\n\s*</a>\s*'
        r'</div>',
        '<div id="nav-actions" class="hidden md:flex items-center gap-4">\n'
        '                    <a href="/auth" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all" style="background:linear-gradient(120deg,rgba(112,0,255,.75) 0%,rgba(0,200,220,.8) 100%);box-shadow:0 0 18px -4px rgba(0,240,255,.35);text-decoration:none;">Zaloguj się <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg></a>\n'
        '                </div>',
        html, flags=re.DOTALL
    )
    # Fix mobile menu: add Baza Wiedzy if missing
    if '/baza-wiedzy/' not in html[html.find('mobile-menu-content'):html.find('mobile-menu-content')+1000]:
        html = re.sub(
            r'(<div id="mobile-menu-content"[^>]*>)\s*'
            r'(<a href="/methodology"[^>]*>Metodologia</a>)',
            r'\1\n'
            r'            <a href="/baza-wiedzy/" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-all" style="text-decoration:none;">Baza Wiedzy</a>\n'
            r'            \2',
            html, flags=re.DOTALL
        )
    # Fix JS auth section
    html = fix_auth_js_links(html)
    # Replace footer
    html = replace_footer(html)
    
    if html != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"  ✓ Fixed: {os.path.relpath(path, BASE)}")
    else:
        print(f"  - No changes: {os.path.relpath(path, BASE)}")


# ─── Process public pages (methodology, pricing, baza-wiedzy, enneagram) ─────

def process_public_page(path: str, active_key: str = ''):
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    original = html
    html = remove_theme_toggle_css(html)
    html = remove_theme_toggle_button(html)
    html = remove_theme_toggle_js(html)
    html = fix_logo_href(html)
    html = remove_korzysc_from_nav(html)
    html = fix_nav_actions_two_buttons(html)
    html = fix_mobile_menu_remove_wykonaj(html)
    
    # Add Baza Wiedzy to desktop nav if missing
    nav_links_region = re.search(r'<div[^>]*id="nav-links"[^>]*>(.*?)</div>', html, re.DOTALL)
    if nav_links_region and '/baza-wiedzy/' not in nav_links_region.group(1):
        baza_active = ' active' if active_key == 'baza-wiedzy' else ''
        # Insert Baza Wiedzy as first link
        html = re.sub(
            r'(<div[^>]*id="nav-links"[^>]*>\s*\n?\s*)',
            r'\1<a href="/baza-wiedzy/" class="iiy-nav-link' + baza_active + '">Baza Wiedzy</a>\n          ',
            html, count=1
        )
    
    # Add Baza Wiedzy to mobile menu if missing
    mobile_region_match = re.search(r'id="mobile-menu-content"[^>]*>(.*?)</div>', html, re.DOTALL)
    if mobile_region_match and '/baza-wiedzy/' not in mobile_region_match.group(1):
        # Insert Baza Wiedzy as first item in mobile menu
        html = re.sub(
            r'(<div[^>]*id="mobile-menu-content"[^>]*>)\s*\n?\s*(<a href="/)',
            lambda m: (
                m.group(1) + '\n'
                '      <a href="/baza-wiedzy/" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-all" style="text-decoration:none;">Baza Wiedzy</a>\n'
                '      ' + m.group(2)
            ),
            html, count=1
        )
    
    # Fix auth JS section
    html = fix_auth_js_links(html, active_key)
    
    # Replace footer (only if footer exists)
    if '<footer' in html:
        html = replace_footer(html)
    
    if html != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"  ✓ Fixed: {os.path.relpath(path, BASE)}")
    else:
        print(f"  - No changes: {os.path.relpath(path, BASE)}")


# ─── Process authenticated pages (user-profile, user-profile-tests) ──────────

def process_auth_page(path: str):
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    original = html
    html = remove_theme_toggle_css(html)
    html = remove_theme_toggle_button(html)
    html = remove_theme_toggle_js(html)
    html = fix_logo_href(html)
    
    # Remove theme toggle related code in JS
    # For user-profile.html: remove the toggles variable and related code
    html = re.sub(
        r"const toggles\s*=\s*document\.querySelectorAll\(['\"]\.theme-toggle['\"]\);\s*\n"
        r"[^\n]*toggles\.[^\n]*\n",
        '', html
    )
    html = re.sub(
        r"document\.querySelectorAll\(['\"]\.theme-toggle['\"]\)\.forEach\([^)]+\)[^;]*;",
        '', html
    )
    
    # Also remove in user-profile-tests.html JS
    html = re.sub(
        r"const toggle\s*=\s*document\.getElementById\(['\"]theme-toggle['\"]\);[^\n]*\n",
        '', html
    )
    html = re.sub(
        r"const toggleMobile\s*=\s*document\.getElementById\(['\"]theme-toggle-mobile['\"]\);[^\n]*\n",
        '', html
    )
    
    # Replace footer
    if '<footer' in html:
        html = replace_footer(html)
    
    if html != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"  ✓ Fixed: {os.path.relpath(path, BASE)}")
    else:
        print(f"  - No changes: {os.path.relpath(path, BASE)}")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("\n=== Alcheme Nav/Footer Unification ===\n")
    
    # index.html
    process_index_html(f"{BASE}/index.html")
    
    # methodology.html
    process_public_page(f"{BASE}/methodology.html", active_key='methodology')
    
    # pricing.html
    process_public_page(f"{BASE}/pricing.html", active_key='pricing')
    
    # Authenticated pages
    process_auth_page(f"{BASE}/user-profile-tests.html")
    process_auth_page(f"{BASE}/user-profile.html")
    
    # baza-wiedzy/index.html
    process_public_page(f"{BASE}/baza-wiedzy/index.html", active_key='baza-wiedzy')
    
    # baza-wiedzy/hexaco/index.html
    process_public_page(f"{BASE}/baza-wiedzy/hexaco/index.html", active_key='baza-wiedzy')
    
    # baza-wiedzy/enneagram/index.html
    process_public_page(f"{BASE}/baza-wiedzy/enneagram/index.html", active_key='baza-wiedzy')
    
    # baza-wiedzy/enneagram/typ-*.html
    for path in sorted(glob.glob(f"{BASE}/baza-wiedzy/enneagram/typ-*.html")):
        process_public_page(path, active_key='baza-wiedzy')
    
    print("\n=== Done ===\n")

if __name__ == '__main__':
    main()

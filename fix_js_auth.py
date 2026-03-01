#!/usr/bin/env python3
"""Fix Baza Wiedzy in JS auth injection blocks."""
import re

BASE = "/Users/maciejrynarzewski/projects/it-is-you/public"

AUTH_PAGES = [
    f"{BASE}/index.html",
    f"{BASE}/methodology.html",
    f"{BASE}/pricing.html",
    f"{BASE}/baza-wiedzy/index.html",
    f"{BASE}/baza-wiedzy/hexaco/index.html",
    f"{BASE}/baza-wiedzy/enneagram/index.html",
]

BAZA_NAV_LINK = '<a href="/baza-wiedzy/" class="iiy-nav-link">Baza Wiedzy</a>'
BAZA_MOBILE_LINK = (
    '<a href="/baza-wiedzy/" class="flex items-center gap-3 px-4 py-3 '
    'rounded-xl text-sm font-semibold text-white/80 hover:text-white '
    'hover:bg-white/5 transition-all" style="text-decoration:none;">Baza Wiedzy</a>'
)


def fix_nav_links_injection(m):
    block = m.group(0)
    if '/baza-wiedzy/' not in block:
        block = re.sub(
            r'(innerHTML\s*=\s*`\s*\n)',
            r'\1        ' + BAZA_NAV_LINK + '\n',
            block
        )
    return block


def fix_mobile_injection(m):
    block = m.group(0)
    if '/baza-wiedzy/' not in block:
        block = re.sub(
            r'(innerHTML\s*=\s*`\s*\n)',
            r'\1        ' + BAZA_MOBILE_LINK + '\n',
            block
        )
    return block


for path in AUTH_PAGES:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            html = f.read()
    except Exception as e:
        print(f"  ! Cannot open {path}: {e}")
        continue

    original = html

    html = re.sub(
        r"getElementById\(['\"]nav-links['\"]\)\.innerHTML\s*=\s*`[\s\S]*?`;",
        fix_nav_links_injection,
        html
    )

    html = re.sub(
        r"getElementById\(['\"]mobile-menu-content['\"]\)\.innerHTML\s*=\s*`[\s\S]*?`;",
        fix_mobile_injection,
        html
    )

    if html != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"  Fixed JS auth: {path.replace(BASE + '/', '')}")
    else:
        print(f"  No JS change:  {path.replace(BASE + '/', '')}")

print("Done")

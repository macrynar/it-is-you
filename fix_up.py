#!/usr/bin/env python3
import re

BASE = "/Users/maciejrynarzewski/projects/it-is-you/public"

# Fix user-profile.html: add Baza Wiedzy to mobile menu, remove Motyw div
path = f"{BASE}/user-profile.html"
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()
original = html

# Check if mobile menu already has Baza Wiedzy
mobile_region = re.search(r'id="mobile-menu"[\s\S]*?</nav>', html)
if mobile_region and '/baza-wiedzy/' not in mobile_region.group(0):
    # Insert Baza Wiedzy after Settings link in mobile menu (only in mobile-menu region)
    baza_link = (
        '<a href="/baza-wiedzy/" class="flex items-center gap-3 px-4 py-3 '
        'rounded-xl text-sm font-semibold text-white/80 hover:text-white '
        'hover:bg-white/5 transition-all" style="text-decoration:none;">Baza Wiedzy</a>'
    )
    def add_baza_mobile(m):
        text = m.group(0)
        if '/baza-wiedzy/' not in text:
            text = re.sub(
                r'(href="/settings"[^>]*>Ustawienia</a>)\s*(<a href="/methodology")',
                r'\1' + baza_link + r'\2',
                text
            )
        return text
    html = re.sub(r'id="mobile-menu"[\s\S]*?</nav>', add_baza_mobile, html, count=1)
    print("Added Baza Wiedzy to mobile menu")
else:
    print("Baza Wiedzy already in mobile menu")

# Remove 'Motyw' theme remnant div from mobile menu
html = re.sub(
    r'\s*<div[^>]*>\s*<span[^>]*>Motyw</span>\s*</div>',
    '',
    html
)

if html != original:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Saved user-profile.html")
else:
    print("No changes")

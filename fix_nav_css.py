import re

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

# Files that didn't get CSS replaced
files = [
    '/Users/maciejrynarzewski/projects/it-is-you/public/baza-wiedzy/enneagram/typ-1-reformator.html',
    '/Users/maciejrynarzewski/projects/it-is-you/public/baza-wiedzy/enneagram/typ-4-indywidualista.html',
    '/Users/maciejrynarzewski/projects/it-is-you/public/baza-wiedzy/hexaco/index.html',
]

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Replace old nav CSS block: from `nav { position: sticky` through end of `.nav-cta { ... }`
    # These files have it all on one-liners, capturing from nav { to last .nav-cta block
    new_html = re.sub(
        r'\s{2,}nav \{ position: sticky.*?\.nav-cta \{[^}]+\}',
        '\n' + NAV_CSS,
        html,
        count=1,
        flags=re.DOTALL
    )

    if new_html == html:
        print(f'WARNING: CSS pattern not matched in {path}')
    else:
        print(f'CSS block replaced in {path}')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_html)

print('Done.')

with open('src/App.jsx', 'r') as f:
    content = f.read()

# Replace import
content = content.replace(
    "import Footer from './components/Footer'",
    "import Layout from './components/shared/Layout'"
)

# Results pages
replacements = [
    (
        "return <><HexacoResults /><Footer /></>",
        "return <Layout isAuthenticated={!!user} activeLink=\"tests\"><HexacoResults /></Layout>"
    ),
    (
        "return <><EnneagramResults /><Footer /></>",
        "return <Layout isAuthenticated={!!user} activeLink=\"tests\"><EnneagramResults /></Layout>"
    ),
    (
        "return <><DarkTriadResults /><Footer /></>",
        "return <Layout isAuthenticated={!!user} activeLink=\"tests\"><DarkTriadResults /></Layout>"
    ),
    (
        "return <><StrengthsResults /><Footer /></>",
        "return <Layout isAuthenticated={!!user} activeLink=\"tests\"><StrengthsResults /></Layout>"
    ),
    (
        "return <><CareerResults /><Footer /></>",
        "return <Layout isAuthenticated={!!user} activeLink=\"tests\"><CareerResults /></Layout>"
    ),
    (
        "return <><ValuesResults /><Footer /></>",
        "return <Layout isAuthenticated={!!user} activeLink=\"tests\"><ValuesResults /></Layout>"
    ),
    (
        "return <><CharacterSheet publicToken={token} /><Footer /></>",
        "return <Layout isAuthenticated={false}><CharacterSheet publicToken={token} /></Layout>"
    ),
    (
        "return <><Settings /><Footer /></>",
        "return <Layout isAuthenticated={!!user}><Settings /></Layout>"
    ),
    (
        "return <><CharacterSheet /><Footer /></>",
        "return <Layout isAuthenticated={!!user} noNav={true}><CharacterSheet /></Layout>"
    ),
]

for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        print(f"replaced: {old[:55]}")
    else:
        print(f"NOT FOUND: {old[:55]}")

with open('src/App.jsx', 'w') as f:
    f.write(content)

print("Done.")

import json
import csv

with open("frontier.json", "r", encoding="utf-8") as f:
    tracks = json.load(f)

# Sort by rewardAmount descending
tracks_sorted = sorted(tracks, key=lambda x: x.get("rewardAmount", 0), reverse=True)

# Generate Markdown
md = [
    "# Solana Colosseum Frontier — Side Tracks (Superteam)",
    "",
    f"**Total de Side Tracks:** {len(tracks_sorted)}  ",
    f"**Premiação Total:** US$ {sum(t.get('rewardAmount', 0) for t in tracks_sorted):,.2f}  ",
    "",
    "| # | Side Track / Desafio | Patrocinador | Recompensa | Token | Link Superteam |",
    "|---|---|---|---|---|---|"
]

for i, t in enumerate(tracks_sorted, 1):
    title = t.get("title", "").replace("|", "\\|").strip()
    sponsor = t.get("sponsor", {}).get("name", "N/A").replace("|", "\\|").strip()
    reward = f"{t.get('rewardAmount', 0):,}"
    token = t.get("token", "")
    slug = t.get("slug", "")
    url = f"https://superteam.fun/earn/{slug}" if slug else ""
    link = f"[Acessar]({url})" if slug else "-"
    md.append(f"| {i} | {title} | {sponsor} | US$ {reward} | {token} | {link} |")

with open("frontier_tracks.md", "w", encoding="utf-8") as f:
    f.write("\n".join(md) + "\n")

# Generate CSV
with open("frontier_tracks.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Rank", "Título", "Patrocinador", "Valor (USD)", "Token", "Slug", "URL"])
    for i, t in enumerate(tracks_sorted, 1):
        slug = t.get("slug", "")
        url = f"https://superteam.fun/earn/{slug}" if slug else ""
        writer.writerow([
            i,
            t.get("title", ""),
            t.get("sponsor", {}).get("name", ""),
            t.get("rewardAmount", 0),
            t.get("token", ""),
            slug,
            url
        ])

print("Arquivos gerados com sucesso!")

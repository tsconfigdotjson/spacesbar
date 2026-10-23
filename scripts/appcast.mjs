// Prints the Sparkle appcast, built from this repo's releases. Each carries
// the app's disk image and sparkle.json (build number, EdDSA signature, length) from
// the app's scripts/release.sh; the release notes become the update's notes.
//
//   GH_TOKEN=… GITHUB_REPOSITORY=owner/repo node scripts/appcast.mjs > dist/appcast.xml

const repo = process.env.GITHUB_REPOSITORY ?? "tsconfigdotjson/spacesbar";
const headers = { accept: "application/vnd.github.html+json" };
if (process.env.GH_TOKEN) headers.authorization = `Bearer ${process.env.GH_TOKEN}`;

async function json(url, h = headers) {
  const res = await fetch(url, { headers: h });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const releases = await json(`https://api.github.com/repos/${repo}/releases?per_page=20`);
const items = [];
for (const r of releases) {
  if (r.draft || r.prerelease) continue;
  const dmg = r.assets.find((a) => /^SpacesBar-.*\.dmg$/.test(a.name));
  const metaAsset = r.assets.find((a) => a.name === "sparkle.json");
  if (!dmg || !metaAsset) continue;
  const meta = await json(metaAsset.browser_download_url, {});
  const notes = (r.body_html ?? "").replaceAll("]]>", "]]&gt;");
  items.push(`    <item>
      <title>${esc(r.name || meta.shortVersion)}</title>
      <pubDate>${new Date(r.published_at).toUTCString()}</pubDate>
      <sparkle:version>${esc(meta.version)}</sparkle:version>
      <sparkle:shortVersionString>${esc(meta.shortVersion)}</sparkle:shortVersionString>
      <sparkle:minimumSystemVersion>${esc(meta.minimumSystemVersion)}</sparkle:minimumSystemVersion>${notes ? `
      <description><![CDATA[${notes}]]></description>` : ""}
      <enclosure url="${esc(dmg.browser_download_url)}" length="${meta.length}" type="application/octet-stream" sparkle:edSignature="${esc(meta.edSignature)}"/>
    </item>`);
}

console.log(`<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle">
  <channel>
    <title>SpacesBar</title>
    <link>https://${repo.split("/")[0]}.github.io/${repo.split("/")[1]}/appcast.xml</link>
${items.join("\n")}
  </channel>
</rss>`);

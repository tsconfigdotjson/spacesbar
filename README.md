# SpacesBar site

The site for SpacesBar, at https://tsconfigdotjson.github.io/spacesbar/.
The app's source is private; this repo holds the site and the release
downloads.

The icon (`public/icon.svg`, and `favicon.svg` cropped from it) comes from the
app repo's `design/icon.svg`.

```sh
npm install
npm run dev   # local server
npm run og    # re-render public/og.jpg from og.html
```

Pushing to `main` or publishing a release deploys to Pages. The latest
release's `SpacesBar-*.dmg` is served as `SpacesBar.dmg`, which the
Download buttons link to, and `scripts/appcast.mjs` turns the releases into
`appcast.xml`, the Sparkle feed the app checks for updates.

Releases come from the app repo's `scripts/release.sh`, which uploads the
notarized disk image and a `sparkle.json` with its EdDSA signature. Don't publish
releases here by hand: without `sparkle.json` they're left out of the appcast.
The `github-pages` environment allows deploys from `main` and from `v*` tags,
which release-triggered runs check out.

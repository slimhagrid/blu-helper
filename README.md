# blu-helper

A no-frills directory of boutique blu-ray vendors, film labels, studio catalog distributors, and premium packaging manufacturers. Search or browse by category, jump straight to a site, and buy stuff.

Live at [blu-helper.vercel.app](https://blu-helper.vercel.app) (hosted on Vercel).

## Stack

Plain HTML/CSS/JS, no build step, no dependencies.

- [`index.html`](index.html) — page shell
- [`js/data.js`](js/data.js) — the company directory data
- [`js/main.js`](js/main.js) — rendering, search, and section toggling
- [`js/attractor.js`](js/attractor.js) — hero canvas animation
- [`styles/styles.css`](styles/styles.css) — styling
- [`vercel.json`](vercel.json) — security headers for the Vercel deployment

## Running locally

Serve the directory with any static file server, e.g.:

```
npx serve .
```

Then open the printed local URL.

## Contributing

Missing a vendor or label? Add an entry to the `COMPANIES` array in [`js/data.js`](js/data.js) and open a PR.

## License

[Unlicense](LICENSE) — public domain.

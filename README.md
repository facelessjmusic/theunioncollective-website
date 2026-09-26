# The Union Collective Website

A lightweight static website for a Northern Michigan music collective and label. The project uses a YAML-driven content model to generate a single-page site for:

- bio
- upcoming events
- music embeds
- our artists
- merch
- gallery

## Setup

```bash
npm install
```

## Build

```bash
npm run build
```

This generates `index.html` from the template and content files.

## Preview locally

```bash
npm start
```

Then open:

```text
http://localhost:8080
```

## Content files

- `content/config.yaml` — site metadata
- `content/bio.md` — bio text
- `content/config.yaml` → `events_api` — where upcoming events are loaded from (see below)
- `content/music.yaml` — music embeds
- `content/artists.yaml` — artist roster
- `content/merch.yaml` — merch catalog
- `content/gallery/` — gallery images

## Events

Events are no longer in YAML. Members add them in the portal
(`portal.theunioncollective.io`), and the page fetches upcoming ones in the browser from
`<events_api>/public/events`, so new events appear without a rebuild.

When the site is opened on `localhost`, it loads events from a local backend at
`http://localhost:8787` instead (run `npm run dev` in `theunioncollective-backend`).

## Notes

Everything except events is static and easy to customize without a framework or CMS.

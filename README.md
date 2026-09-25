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
- `content/events.yaml` — upcoming events
- `content/music.yaml` — music embeds
- `content/artists.yaml` — artist roster
- `content/merch.yaml` — merch catalog
- `content/gallery/` — gallery images

## Notes

The site is fully static and easy to customize without a framework or CMS.

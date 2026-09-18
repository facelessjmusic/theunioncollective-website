import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import jsBeautify from 'js-beautify';
import yaml from 'js-yaml';

// Destructure beautifier
const { html: beautifyHtml } = jsBeautify;

// ---------- PATHS ----------

const templatePath = path.join('templates', 'index.template.html');
const bioPath = path.join('content', 'bio.md');
const eventsPath = path.join('content', 'events.yaml');
const musicPath = path.join('content', 'music.yaml');
const galleryPath = path.join('content', 'gallery');
const outputPath = 'index.html';

// ---------- LOAD TEMPLATE ----------

let template = fs.readFileSync(templatePath, 'utf-8');

// ---------- BIO MARKDOWN ----------

const bioMarkdown = fs.readFileSync(bioPath, 'utf-8');
const bioHtml = marked.parse(bioMarkdown);

let finalHtml = template.replace(
  '<!-- {{BIO_MARKDOWN}} -->',
  bioHtml
);

// ---------- EVENTS YAML ----------

const today = new Date();
today.setHours(0, 0, 0, 0); // midnight compare

let eventsHtml = '';

if (fs.existsSync(eventsPath)) {

  const raw = fs.readFileSync(eventsPath, 'utf-8');
  const data = yaml.load(raw);

  let events = data?.events || [];

  // Filter past events (date only)
  events = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today;
  });

  // Sort by date only
  events.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  if (events.length === 0) {

    eventsHtml = `
      <div class="no-events fade-in-appear">
        No upcoming events — check back soon.
      </div>
    `;

  } else {

    eventsHtml = events.map((event, index) => {

      const dateObj = new Date(event.date);

      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const timeText = event.time
        ? ` · ${event.time}`
        : '';

      const ticketButton = event.tickets
        ? `
          <a href="${event.tickets}"
             target="_blank"
             rel="noopener"
             class="btn btn-secondary event-btn">
            Info
          </a>
        `
        : `<button class="btn btn-secondary event-btn deactivated" disabled>No Info</button>`;

      const featuredClass = index === 0 ? 'featured-event' : '';
      const delay = (index * 0.15).toFixed(2);

      return `
        <div class="event-card fade-in-appear ${featuredClass}"
             style="animation-delay: ${delay}s">

          <div class="event-info">
            <div class="event-date">
              ${formattedDate}${timeText}
            </div>

            <div class="event-location">
              ${event.location}
            </div>
          </div>

          ${ticketButton}

        </div>
      `;

    }).join('\n');

  }

}

// ---------- INJECT EVENTS ----------

finalHtml = finalHtml.replace(
  '<!-- {{EVENTS_SECTION}} -->',
  eventsHtml
);

// ---------- MUSIC YAML ----------

let musicHtml = '';

if (fs.existsSync(musicPath)) {
  const rawMusic = fs.readFileSync(musicPath, 'utf-8');
  const musicData = yaml.load(rawMusic);
  const items = musicData?.items || [];

  if (items.length === 0) {
    musicHtml = `
      <div class="no-music fade-in-appear">
        No music available — check back soon.
      </div>
    `;
  } else {
    musicHtml = items.map((item, index) => {

      function extractYouTubeId(u) {
        if (!u) return null;
        const vMatch = u.match(/[?&]v=([\w-]{11})/);
        if (vMatch) return vMatch[1];
        const shortMatch = u.match(/youtu\.be\/([\w-]{11})/);
        if (shortMatch) return shortMatch[1];
        const embedMatch = u.match(/embed\/([\w-]{11})/);
        if (embedMatch) return embedMatch[1];
        return null;
      }

      function extractSpotifyEmbed(u) {
        if (!u) return null;
        // If it's already an embed URL, return it
        if (u.includes('open.spotify.com/embed')) return u;
        // Try to capture type and id (track/album/playlist)
        const m = u.match(/open\.spotify\.com\/(track|album|playlist)\/([A-Za-z0-9]+)/);
        if (m) return `https://open.spotify.com/embed/${m[1]}/${m[2]}`;
        // As a fallback, return null
        return null;
      }

      const title = item.title || '';
      const desc = item.description ? `<div class="music-desc">${item.description}</div>` : '';
      let embed = '';

      if ((item.type || '').toLowerCase() === 'youtube') {
        const id = extractYouTubeId(item.url);
        if (id) {
          // Use privacy-enhanced domain and enable JS API so we can detect player errors
          embed = `<iframe id="yt-${index}" class="yt-embed" width="560" height="315" src="https://www.youtube-nocookie.com/embed/${id}?rel=0&enablejsapi=1" data-watchurl="${item.url}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }
      } else if ((item.type || '').toLowerCase() === 'spotify') {
        const src = extractSpotifyEmbed(item.url);
        if (src) {
          embed = `<iframe src="${src}" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
        }
      }

      const externalLink = item.url
        ? `
          <a href="${item.url}" target="_blank" rel="noopener" class="btn btn-secondary event-btn">Open</a>
        `
        : '';

      const delay = (index * 0.12).toFixed(2);

      return `
        <div class="music-card fade-in-appear" style="animation-delay: ${delay}s">
          <div class="music-embed">${embed}</div>
          <div class="music-meta">
            <div class="music-title">${title}</div>
            ${desc}
            ${externalLink}
          </div>
        </div>
      `;

    }).join('\n');
  }

}

// ---------- INJECT MUSIC ----------

finalHtml = finalHtml.replace(
  '<!-- {{MUSIC_SECTION}} -->',
  musicHtml
);

// ---------- GALLERY ----------

let galleryHtml = '';

if (fs.existsSync(galleryPath)) {
  try {
    const files = fs.readdirSync(galleryPath);
    const images = files.filter(f => /\.(jpe?g|png|webp|gif|svg)$/i.test(f));

    if (images.length === 0) {
      galleryHtml = `
        <div class="no-gallery fade-in-appear">No images found.</div>
      `;
    } else {
      galleryHtml = images.map(fn => {
        const src = path.posix.join('content', 'gallery', fn);
        // simple download button (SVG icon)
        const downloadBtn = `
          <a class="gallery-download" href="${src}" download target="_blank" rel="noopener" title="Download">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </a>
        `;

        return `
          <div class="gallery-item">
            <img src="${src}" alt="${fn}">
            ${downloadBtn}
          </div>
        `;
      }).join('\n');
    }
  } catch (e) {
    galleryHtml = `<div class="no-gallery">Unable to read gallery.</div>`;
  }

} else {
  galleryHtml = `<div class="no-gallery">Gallery folder not found.</div>`;
}

// ---------- INJECT GALLERY ----------

finalHtml = finalHtml.replace('<!-- {{GALLERY_SECTION}} -->', galleryHtml);

// ---------- LOAD CONFIG_DATA ----------

const configRaw = fs.readFileSync(path.join('content', 'config.yaml'), 'utf-8');
const configData = yaml.load(configRaw);


// ---------- INJECT COPYRIGHT ----------
const copyrightText = configData?.copyright || '';
finalHtml = finalHtml.replace(/<!-- {{COPYRIGHT}} -->/g, copyrightText);

// ---------- INJECT ARTIST NAME ----------
const artistName = configData?.artist_name || '';
finalHtml = finalHtml.replace(/<!-- {{ARTIST_NAME}} -->/g, artistName);
finalHtml = finalHtml.replace(/{{ARTIST_NAME}}/g, artistName);

// ---------- INJECT DESCRIPTION ----------
const description = configData?.description || '';
finalHtml = finalHtml.replace(/{{DESCRIPTION}}/g, description);

// ---------- INJECT CANONICAL URL ----------
const canonicalUrl = configData?.canonical_url || '';
finalHtml = finalHtml.replace(/{{CANONICAL_URL}}/g, canonicalUrl);

// ---------- INJECT OPENGRAPH IMAGE ----------
const ogImage = configData?.['opengraph-image'] || '';
finalHtml = finalHtml.replace(/{{OPENGRAPH_IMAGE}}/g, ogImage); 

// ---------- INJECT FONTS ----------
const fonts = configData?.fonts || [];
const fontLinks = fonts.map(f => `<link href="${f}" rel="stylesheet">`).join('\n');
finalHtml = finalHtml.replace('<!-- {{FONTS}} -->', fontLinks);

// ---------- INJECT ARTIST EMAIL ----------
const artistEmail = configData?.artist_email || '';
finalHtml = finalHtml.replace(/{{ARTIST_EMAIL}}/g, artistEmail);

// ---------- INJECT CONTACT STR ----------
const contactStr = configData?.contact_str || '';
finalHtml = finalHtml.replace(/<!-- {{CONTACT_STR}} -->/g, contactStr);

// ---------- BEAUTIFY OUTPUT ----------

finalHtml = beautifyHtml(finalHtml, {
  indent_size: 2,
  preserve_newlines: true,
  max_preserve_newlines: 2
});

// ---------- WRITE FILE ----------

fs.writeFileSync(outputPath, finalHtml);

console.log('✅ index.html generated successfully!');

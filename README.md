# Your website — how it works and how to look after it

This is your site. It is plain HTML, CSS and JavaScript: no framework, no database,
no build step, no monthly subscription, nothing that can expire or be discontinued.
If you open these files in twenty years they will still work.

---

## The three things you will actually do

### 1. Add a publication
Open `data/publications.json`. Copy an existing entry in the `papers` list, change
the details, give it a new `id`, and put the DOI in the `doi` field (just the bare
DOI, like `10.1029/2023JB026710` — the site makes the link). Then add that `id` to
whichever theme it belongs to. Save. Done — it appears on the Publications page and
in the archive automatically.

### 2. Add photographs
1. Put the originals anywhere under `images/` — subfolders are fine, keep your own
   filing system.
2. Run `python tools/add-photos.py`. It makes two web-sized copies of each photo in
   `images/web/` (a 2000px one and a 900px one for phones and thumbnails), rotated the
   right way up, with camera data and GPS location stripped out. It also records each
   photo's shape so the gallery can lay portrait and landscape pictures out properly.
   **Your originals are never touched.**
3. Open `data/photos.json` and add the new filenames to a session — or make a new
   session. A session is a story, not a place. Mark the best one `"pick": true` and
   it gets the large place at the top.

Only `images/web/` is used by the site, so the page stays fast no matter how many
originals you keep.

### 3. Add a beamtime
Open `data/beamtimes.json`, copy a block, put it at the top. That one edit updates the
timeline on the Research page *and* the "In numbers" row at the top of it. The paper
count and the co-author count there update themselves from `publications.json` the
same way, and the co-author network is drawn from the author lists of your papers.

### 4. Add a research highlight
Open `data/research-notes.json`, copy a block, put it at the **top** of the list and
fill it in. That is the scientific feed near the bottom of the Research page — papers,
methods, beamtimes, instruments, grants. Written for colleagues; the rest of the page
does the plain-language job. A figure is optional.

### 5. Change a job
Open `data/career.json`, copy a block, put it at the top and set `"now": true` on it
(and remove it from the old one). That feeds the career timeline on the Research page.
The world map comes from `data/worldmap.json`; to add a place, copy a pin in `places`
(x/y are map coordinates — ask me and I will add it, or compare with a nearby pin).

### 6. Write a post
Copy `posts/_template.html`, rename it, write in it. Then add an entry to
`data/posts.json`. There are deliberately no dates — the site never looks
neglected because you did not post for six months.

---

## Where everything is

```
index.html            Home — the main narrative
research.html         "Cook and look" — the science, for anyone
publications.html     Themed summaries + full archive (reads data/publications.json)
photography.html      Gallery by session (reads data/photos.json)
life.html             Everything that isn't work
writing.html          Posts (reads data/posts.json)

css/style.css         The entire design. All colours and sizes are at the top.
js/main.js            Menu, gallery, lightbox, data loading. No tracking.

data/publications.json  <- you edit this
data/photos.json        <- you edit this
data/posts.json         <- you edit this
data/beamtimes.json     <- you edit this
data/research-notes.json<- you edit this
data/career.json        <- you edit this
data/worldmap.json      Map outline + pins (rarely edited)

images/               Your originals, by folder; images/web/ holds the web copies
                      (images/web/_old/ is leftovers from the first build — safe to delete)
files/                Your CV PDF lives here
posts/                Individual written pieces
```

---

## Things to add when you have them

These are placeholders at the moment — swap them in whenever you like.

- **`images/hero.jpg`** — the big first photograph. In `index.html`, replace
  `<div class="hero__media hero__media--placeholder"></div>` with
  `<div class="hero__media"><img src="images/hero.jpg" alt=""></div>`
- **`images/portrait.jpg`** — a candid outdoor photo of you
- **`files/CV_Sumith_Abeykoon.pdf`** — export your CV to PDF with exactly this filename
  and the download link works everywhere
- Every grey dashed box on the site tells you the filename it is waiting for.
  Replace the `<div class="ph">…</div>` with `<img src="images/thatname.jpg" alt="...">`

---

## Viewing it on your own computer

**Double-click `start-site.bat`.** A black window opens and your browser shows the
site. Leave the black window open while you look; close it when you are finished.

That is all you need to know. The rest of this section is only if you are curious.

**Why not just double-click `index.html`?** Because the browser then treats the page
as a *file*, and browsers refuse to let a file-opened page read other files from your
disk. It is a security rule, not a fault in the site. Your home page photos are
written straight into the HTML so they still appear — but the gallery, the
publications list and the research highlights are loaded from the files in `data/`,
and that reading is what gets blocked. They come up empty.

Running `start-site.bat` serves the folder as a real (local) website, which is exactly
how it behaves once it is online. Everything appears.

On a Mac, or from a terminal: `python tools/preview.py`

## Putting it online, free

1. Create a free account at github.com if you do not have one.
2. Make a new **public** repository named exactly:
   `YOUR-USERNAME.github.io`
3. Upload everything in this folder into it (the web interface has a drag-and-drop
   upload — you do not need to learn git for this).
4. Go to Settings → Pages, and set the source to your `main` branch.
5. A few minutes later your site is live at `https://YOUR-USERNAME.github.io`

Cost: nothing, permanently.

**Later, if you want your own address** (like `sumithabeykoon.com`): buy the domain
from any registrar for roughly €10–15 a year, add a file called `CNAME` containing
the domain, and point the domain's DNS at GitHub. Nothing on the site needs
rebuilding. You can do this at any point.

---

## Changing the look

Everything is controlled from the tokens at the top of `css/style.css`.
Change a colour there and it updates across every page.

**To try the light version:** change `<html lang="en">` to
`<html lang="en" data-theme="light">` on each page. The light palette is already
written and waiting. Change it back if you prefer the dark.

---

## Two notes on principle

**Nothing on this site tracks anyone.** No analytics, no cookies, no fonts that
phone home beyond Google Fonts, no embedded widgets. Nobody who visits is counted.
That was deliberate, and it is worth keeping.

**Nothing here expires.** No plugin to update, no platform that can change its
pricing, no service that can shut down and take your site with it. The only
recurring cost is a domain name, and only if you choose to have one.

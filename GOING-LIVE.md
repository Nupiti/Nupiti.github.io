# Going live — sumithabeykoon.com on GitHub Pages

Everything in this folder (`site/`) is the website. These are the one-time steps.

## 1. GitHub (free)
1. Create an account at github.com (any username, e.g. `sumithabeykoon`).
2. Install GitHub Desktop (desktop.github.com) and sign in.
3. In GitHub Desktop: File → New repository.
   - Name: `sumithabeykoon.github.io`  (exactly: your username + `.github.io`)
   - Local path: choose a folder OUTSIDE Dropbox, e.g. `C:\Users\Sumith\GitHub\`
   - Leave everything else default, click Create repository.
4. Copy the CONTENTS of `Dropbox\My_website\site\` into that new folder
   (index.html, css, js, data, images, files, posts, CNAME, .nojekyll, …).
5. In GitHub Desktop you will see all the files listed as changes.
   Write "First version" in the Summary box → Commit to main → Publish repository
   (untick "Keep this code private" — Pages needs a public repo on the free plan).

Within a minute the site is live at https://sumithabeykoon.github.io

## 2. Point the domain at it (Aruba → DNS)
In the Aruba control panel for sumithabeykoon.com, open the DNS settings and add:

| Type  | Host / Name | Value                       |
|-------|-------------|-----------------------------|
| A     | @           | 185.199.108.153             |
| A     | @           | 185.199.109.153             |
| A     | @           | 185.199.110.153             |
| A     | @           | 185.199.111.153             |
| CNAME | www         | sumithabeykoon.github.io    |

Delete any other A or CNAME records Aruba put there by default (parking page).
DNS can take from a few minutes to a day to spread.

## 3. Tell GitHub about the domain
GitHub.com → your repository → Settings → Pages:
- Custom domain: `sumithabeykoon.com` → Save (the CNAME file in this folder already says this).
- Wait for the green tick "DNS check successful", then tick **Enforce HTTPS**.

Done: https://sumithabeykoon.com

## Updating the site afterwards
Edit the files in Dropbox as usual (data/*.json for papers, photos, career…).
Then copy the changed files into the GitHub folder, open GitHub Desktop,
type one line in Summary → Commit → Push origin. Live in about a minute.

## Files that exist only for hosting
- `CNAME`      — the custom domain (don't delete)
- `.nojekyll`  — tells GitHub to serve files that start with `_` (the gallery needs `_dims.json`)
- `404.html`, `robots.txt`, `sitemap.xml` — polite extras for browsers and search engines

# Marlon I. Tayag — Personal Website

A modern, static rebuild of the original [marlontayag.com](https://www.marlontayag.com)
(2017 archive). Dark "developer terminal" theme. **No build step, no dependencies** —
just HTML, CSS and a little vanilla JavaScript. Edit the files, then drop the folder
on any static host.

```
.
├── index.html          ← all page content lives here (edit this)
├── css/style.css       ← design: colors, fonts, layout (edit this)
├── js/main.js          ← animations, filters, contact form (rarely edit)
├── vcard.vcf           ← your digital business card (edit this)
├── assets/
│   ├── qr-vcard.png    ← QR code = your vCard (print / share this)
│   └── qr-vcard.svg    ← same QR, vector version (crisp at any size)
├── images/             ← research photos (psite.jpg, iamure.jpg) + originals from 2017
├── cv/
│   └── CV Marlon Tayag.pdf
└── lms/                ← placeholder for a class LMS page (optional)
```

---

## ✏️ How to edit (5 minutes)

| I want to change… | Where |
|---|---|
| Name / hero title / rotating roles | `index.html` → Hero section; rotating lines in the `ROLES` array in `js/main.js` |
| About text | `index.html` → `<!-- ===== ABOUT ===== -->` section |
| Phone / email / birthday | `index.html` → About "Quick facts" **and** `vcard.vcf` |
| Skill percentages | `index.html` → Skills section, the `data-value="80"` attributes |
| Certifications | `index.html` → Skills section chips |
| Experience / education entries | `index.html` → Resume section — copy a `<li class="timeline-item">` block |
| Research cards | `index.html` → Research section — copy a `<figure>` block |
| Contact email | `index.html` footer + Contact section + `js/main.js` form handler |
| CV file | Replace `cv/CV Marlon Tayag.pdf` (keep the same filename) |
| Colors / fonts | `css/style.css` → `:root` variables at the top |
| vCard details | `vcard.vcf` (then regenerate the QR, see below) |

### Updating the vCard QR code
The QR currently encodes the **content of `vcard.vcf`**, so it works even before you
deploy. If you change the vCard, regenerate the QR:

```bash
python3 -m venv /tmp/qrenv && /tmp/qrenv/bin/pip install qrcode pillow
/tmp/qrenv/bin/python - <<'EOF'
import qrcode
from qrcode.image.pil import PilImage
data = open('vcard.vcf', encoding='utf-8').read()
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M)
qr.add_data(data); qr.make(fit=True)
qr.make_image(image_factory=PilImage, fill_color='#0b0f1a', back_color='#ffffff').resize((1024,1024)).save('assets/qr-vcard.png')
print('QR regenerated')
EOF
```

> Prefer a **link-based QR** (scans open the hosted `vcard.vcf` URL instead of embedding
> the card)? After deploying, change `data` above to
> `"https://YOUR-DOMAIN/vcard.vcf"` and regenerate. Then update the alt-text/description
> in `index.html` if you like.

---

## 🚀 Deploy on GitHub Pages + marlontayag.io

This repo is **already prepared** for GitHub Pages: a `CNAME` file
(containing `marlontayag.io`) and a `.nojekyll` file are included, and the site
is fully static (no build step).

### 1. Create the repository & push
```bash
# from this folder
git init
git add .
git commit -m "Initial site"
git branch -M main

# create an EMPTY repo on github.com first, then:
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```
> Name the repo `<username>.github.io` to get the user-site URL
> (`https://<username>.github.io/`), or use any name for a project site.

### 2. Turn on GitHub Pages
Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch →
`main` → `/ (root)` → Save**. Your site is live at
`https://<username>.github.io/` (or `.../<repo>/`).

### 3. Connect marlontayag.io
The `CNAME` file in the repo already tells GitHub to use `marlontayag.io`
(also confirm it under **Settings → Pages → Custom domain**).

### 4. Point DNS at GitHub (at your domain registrar — Namecheap/GoDaddy/etc.)
| Record | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `<username>.github.io` |

> Add **all four** A records for the apex domain. If your registrar doesn't
> support `@`, use your registrar's "ALIAS / ANAME" feature.

### 5. HTTPS
Once DNS propagates (minutes to a few hours), GitHub automatically issues a TLS
certificate for `marlontayag.io`. Enable **Settings → Pages → Enforce HTTPS**.

Optional: add a redirect from `www.marlontayag.io` to `marlontayag.io` (or vice
versa) — pick one canonical domain and make the other an A/CNAME that points to
GitHub too.

### Alternatives (still free)
- **Netlify Drop**: drag this folder onto <https://app.netlify.com/drop>.
- **Vercel / Cloudflare Pages**: connect the repo; no build command needed.

---

## 📱 The vCard + QR business card

- **`vcard.vcf`** — downloadable contact card (name, phone, email, website, birthday).
  Linked from the hero, the About section, and the "Save my contact" section.
- **`assets/qr-vcard.png`** — QR code shown on the site; scanning it adds your contact
  straight to the phone's address book. Print it on a physical business card too.

---

## 📨 Contact form

By default the form opens the visitor's email app with a pre-filled message addressed
to `mtayag@hau.edu.ph` — zero backend, works everywhere. (Change the address in
`js/main.js` if you prefer a different inbox.)

To receive messages as real form submissions instead (e.g. via [Formspree](https://formspree.io)):
1. Create a free form at Formspree and copy your endpoint ID.
2. In `js/main.js`, replace the form handler body with:
   ```js
   fetch("https://formspree.io/f/YOUR_ID", {
     method: "POST",
     body: new FormData(form),
     headers: { Accept: "application/json" },
   }).then(r => {
     status.textContent = r.ok ? "Message sent! I'll reply soon." : "Error — try again.";
     status.className = "form-status " + (r.ok ? "ok" : "err");
   });
   ```

---

## 🏆 CTF Leaderboard (Supabase — free)

The CTF section has an optional **global leaderboard** (fastest to solve all 5 flags).
It needs a free Supabase project (the site itself stays static on GitHub Pages).

### One-time setup (~5 minutes)
1. Create a free account + project at <https://supabase.com>.
2. Open **SQL Editor → New query**, paste the block below, and **Run**:
   ```sql
   create table if not exists leaderboard (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     time_seconds integer not null,
     flags_solved integer not null,
     created_at timestamptz default now()
   );

   alter table leaderboard enable row level security;

   create policy "anon_select" on leaderboard
     for select to anon using (true);

   create policy "anon_insert" on leaderboard
     for insert to anon with check (true);
   ```
3. **Project Settings → API** → copy:
   - **Project URL** (e.g. `https://xxxx.supabase.co`)
   - **anon public** key
4. Paste them at the top of `js/main.js` in the `SUPABASE LEADERBOARD CONFIG` block.

The leaderboard shows the top 10 by fastest time, lets players save their score with a
handle, and loads automatically. Until the keys are added, the CTF works normally and
the leaderboard just shows a "not connected" note.

---

## 🧱 Tech notes

- **Zero dependencies** — nothing to install, no `node_modules`, no build step.
- **Fonts**: Google Fonts (Space Grotesk / Inter / JetBrains Mono) with system fallbacks;
  the site still looks fine offline.
- **Accessibility**: semantic landmarks, `prefers-reduced-motion` support, focus styles,
  keyboard-friendly menu.
- **Original assets**: `images/header3.jpg` and `images/about3.png` are preserved from
  the 2017 W3layouts template but aren't used in the new design.

## 🧾 Credits

Rebuilt from the Wayback Machine capture of marlontayag.com (March 14, 2017).
Original template: W3layouts "Opulent" (CC BY 3.0). All personal content © Marlon I. Tayag.

# LiveVote | تصويت مباشر

A live classroom and workshop polling app, similar to Kahoot or Mentimeter. You show a QR code and a 6-character code on the screen. Participants join on their phones, answer, and you reveal the results to the whole room before moving to the next question.

**Question types:** multiple choice · ranking (prioritize, combined with a Borda count) · weighting (split 100 points) · open text
**Languages:** English / Arabic with full RTL support (switch in the top bar)
**Export:** CSV (opens in Excel; Arabic text is preserved)

| Page | Who uses it |
|---|---|
| `host.html` | You, on the projector. Build the questions, run the session, export the results |
| `index.html` (the site root) | Participants. The QR code opens this page with the code already filled in |

---

## Try it right now (demo mode, no setup)

While `firebase-config.js` is still empty, the app runs in **demo mode**. Demo mode only syncs between tabs of the **same browser**, so you can test the whole flow on your Mac:

1. In the folder, run `python3 -m http.server 8000`
2. Open `http://localhost:8000/host.html`, click **Load sample questions**, then **Start session**
3. Open `http://localhost:8000/?code=XXXXXX` in 2–3 more tabs, using the code shown on the host screen
4. Answer in those tabs and use **Next / Show results** in the host tab

## Go live (about 10 minutes, free)

### 1. Create the Firebase database
1. Go to https://console.firebase.google.com → **Add project** (Google Analytics is not needed).
2. In the left menu: **Build → Realtime Database → Create database**. Pick a location (e.g. *europe-west1*) and choose **Start in locked mode**.
3. Open the **Rules** tab, paste the contents of `database.rules.json`, and click **Publish**.
4. Go to **Project settings** (gear icon) → **Your apps** → the **Web** icon (`</>`) → register an app (Hosting is not needed).
5. Copy the `firebaseConfig` values it shows into `firebase-config.js`. Make sure `databaseURL` is included. If it's missing, copy it from the top of the Realtime Database page.

The badge in the top bar changes from **Demo mode** to **Live**.

### 2. Put it on Vercel
- **Option A, drag and drop:** run `npx vercel` inside the folder and accept the defaults.
- **Option B, GitHub:** push the folder to a repo → https://vercel.com/new → import the repo → Framework preset **Other** → Deploy. No build step is needed.

You get a URL like `https://livevote-xyz.vercel.app`. Participants go to that URL, and you open `/host.html`. You can add a custom domain later in the Vercel project settings.

---

## Running a session
- **Keyboard:** `→` / Space = next, `←` = previous, `R` = show or hide results. A presentation clicker works too, because it sends PageDown/PageUp.
- Participants can change their answer until you click **Show results**. **Reopen answers** lets them answer again.
- Late joiners scan the small QR code in the corner.
- If you refresh the host page, a **Resume** button brings the session back.
- **Save to file / Open file** stores a question set as JSON, so you can reuse it in another class or workshop.
- **Export results (CSV)** gives you a summary per question plus every raw response (with names, if participants entered them).

## How results are calculated
- **Ranking:** Borda count. With 6 options, rank 1 = 6 pts, rank 2 = 5 pts … rank 6 = 1 pt, summed across participants. The results also show the average rank and how many people put each option first.
- **Weighting:** each participant must allocate exactly 100 points. The results show each option's average share (%) and its total.

## Notes on security
The rules let anyone who knows a session code read and write that session, but nobody can list all sessions. That is fine for classes and workshops. Old sessions stay in the database: you can delete them from the Firebase console under `sessions`. If you later need host-only control (e.g. for high-stakes votes), add Firebase Authentication. That is a straightforward next step.

## Files
```
index.html      participant page (site root)
host.html       presenter page
host.js         presenter logic, editor, CSV export
join.js         participant logic (answer screens)
results.js      result calculations and charts (shared)
store.js        Firebase / demo storage layer
i18n.js         English and Arabic text
firebase-config.js   ← your keys go here
database.rules.json  ← paste into Firebase Rules
styles.css
vendor/qrcode.js     QR generator (MIT, Kazuhiko Arase)
```

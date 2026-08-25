# cfwebdev

Service-focused portfolio and lead-generation site for cfwebdev, the Orlando web studio run by Caleb Pierce.

Live site: https://cfwebdev.net

Plain HTML, CSS, and JavaScript. No framework or build step. The homepage presents
fixed-scope website repair and landing-page offers, curated project proof, a
SALTWRATH case study, agency overflow services, process, FAQ, and direct intake.
It also includes Cypressline Outdoor Co., an explicitly fictional landscaping
landing-page concept that demonstrates local-service positioning and conversion
design without presenting invented client results.

## Structure

- `docs/index.html` page structure
- `docs/styles.css` all styling, colors live in `:root`
- `docs/script.js` mobile navigation and small progressive enhancements
- `docs/concepts/cypressline.html` fictional landscaping landing-page concept
- `docs/concepts/cypressline.css` and `cypressline.js` isolated concept styling and interaction
- `docs/assets/concepts/cypressline/SOURCES.md` stock-image provenance and license notes
- `server.py` tiny stdlib static server, Railway ready (binds `0.0.0.0:$PORT`)

## Run locally

    python server.py

Then open http://localhost:8641

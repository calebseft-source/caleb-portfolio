# Caleb Pierce Portfolio

Personal portfolio site for Caleb Pierce, a frontend developer based in Florida.

Live site: https://calebpierce.higgsfield.app

Plain HTML, CSS, and JavaScript. No frameworks, no build step. Features live
site previews on project cards, a screenshot slideshow for desktop apps, an
underwater depth background with drifting light rays, and a small ecosystem of
sea life silhouettes that swim past as you scroll (watch for the submarine).

## Structure

- `site/index.html` page structure
- `site/styles.css` all styling, colors live in `:root`
- `site/script.js` project lists (`PROJECTS`, `APPS`), card rendering, and the ocean
- `server.py` tiny stdlib static server, Railway ready (binds `0.0.0.0:$PORT`)

## Run locally

    python server.py

Then open http://localhost:8641

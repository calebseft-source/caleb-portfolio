#!/usr/bin/env python3
"""
Build every speculative mockup from one shared layout.

The design standard lives HERE, once. Each business supplies only its own facts
and copy in mockups.json, so a new mockup is a config entry rather than another
hand-written page, and a change to the standard reaches every page at once.

    python build.py            build all
    python build.py <slug>     build one

Writes ../<slug>/index.html. Stdlib only.

Rules the layout enforces, because they are the honesty rules for spec work:
  - a disclosure banner at the top and a full disclaimer in the footer
  - noindex on every page
  - photography is declared as placeholder, since it is not their premises
  - nothing invented: any field a business has not given us is left visibly
    blank with a line saying why, never filled with a plausible guess
"""

import json
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
CFG = BASE / "mockups.json"
OUT = BASE.parent


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def rich(s):
    """Copy that is allowed inline markup we authored ourselves (<em>, <br>)."""
    return str(s)


VEILS = {"normal": ("d1", "8c", "8c", "26"), "strong": ("e6", "c4", "b3", "59")}


def css(c):
    p = c["palette"]
    f = c["font"]
    v = VEILS[c.get("veil", "normal")]
    return f"""  :root{{
    --bg:{p['bg']}; --bg2:{p['bg2']}; --ink:{p.get('ink','#F2F0ED')}; --mut:{p.get('mut','#96938E')};
    --dim:{p.get('dim','#5B5854')}; --acc:{p['accent']}; --acc2:{p['accent2']};
    --line:rgba(242,240,237,.11);
  }}
  *{{box-sizing:border-box}}
  html{{-webkit-font-smoothing:antialiased}}
  body{{margin:0;background:var(--bg);color:var(--ink);font-family:Inter,system-ui,sans-serif;font-size:16px;line-height:1.6;overflow-x:hidden}}
  h1,h2,h3,.disp{{font-family:"{f['css']}",{f['fallback']},sans-serif;font-weight:{f.get("weight",400)};text-transform:uppercase;letter-spacing:{f.get('track','-.015em')};line-height:.95;margin:0}}
  .serif{{font-family:"Instrument Serif",Georgia,serif;font-style:italic;text-transform:none;letter-spacing:0}}
  a{{color:inherit}}
  .wrap{{width:min(1240px,90vw);margin:0 auto}}
  img{{display:block;max-width:100%}}

  .grain{{position:fixed;inset:-50%;z-index:60;pointer-events:none;opacity:.15;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E");
    animation:g 1.2s steps(3) infinite}}
  @keyframes g{{0%{{transform:translate(0,0)}}33%{{transform:translate(-3%,2%)}}66%{{transform:translate(2%,-3%)}}}}
  .prog{{position:fixed;top:0;left:0;height:2px;width:0;background:linear-gradient(90deg,var(--acc),var(--acc2));z-index:70;box-shadow:0 0 12px {p['accent']}b3}}

  .demo{{position:relative;z-index:50;background:#000;color:#B5B1AA;font-size:12.5px;padding:9px 0;text-align:center}}
  .demo b{{color:var(--acc2)}}

  nav{{position:fixed;top:38px;left:0;right:0;z-index:45;transition:background .35s,backdrop-filter .35s,border-color .35s;border-bottom:1px solid transparent}}
  nav.stuck{{background:{p['bg']}d6;backdrop-filter:blur(14px);border-bottom-color:var(--line)}}
  .nb{{display:flex;align-items:center;gap:26px;padding:16px 0}}
  .brand{{display:flex;align-items:center;gap:12px;margin-right:auto;text-decoration:none}}
  .bmark{{width:40px;height:40px;flex:none;{c.get('mark_style','background:var(--acc);color:'+p['bg']+';')}display:grid;place-items:center;font-family:"{f['css']}",sans-serif;font-size:15px}}
  .bname{{font-family:"{f['css']}",sans-serif;font-size:17px;letter-spacing:-.01em}}
  .nlinks{{display:flex;gap:26px;font-size:12.5px;letter-spacing:.13em;text-transform:uppercase}}
  .nlinks a{{text-decoration:none;color:var(--mut);transition:color .2s}}
  .nlinks a:hover{{color:var(--ink)}}
  .btn{{display:inline-block;background:var(--acc);color:#fff;text-decoration:none;font-weight:700;font-size:13px;
    letter-spacing:.08em;text-transform:uppercase;padding:14px 24px;border:0;cursor:pointer;font-family:inherit;transition:transform .25s,background .25s}}
  .btn:hover{{transform:translateY(-2px);background:var(--acc2)}}
  .btn.ghost{{background:transparent;color:var(--ink);border:1px solid var(--line)}}
  .btn.ghost:hover{{border-color:var(--acc);color:var(--acc2);background:transparent}}
  @media(max-width:900px){{.nlinks{{display:none}}}}

  .hero{{position:relative;height:100svh;min-height:620px;overflow:hidden;display:flex;align-items:flex-end}}
  .heroimg{{position:absolute;inset:-10% 0;width:100%;height:120%;object-fit:cover;will-change:transform}}
  .heroveil{{position:absolute;inset:0;background:
    linear-gradient(180deg,{p['bg']}{v[0]} 0%,{p['bg']}{v[1]} 38%,{p['bg']}ed 78%,var(--bg) 100%),
    linear-gradient(90deg,{p['bg']}{v[2]} 0%,{p['bg']}{v[3]} 55%,transparent 100%),
    radial-gradient(65% 50% at 18% 72%,{p['accent']}26,transparent 72%)}}
  .herobody{{position:relative;z-index:2;padding-bottom:7vh;width:100%}}
  .kick{{display:flex;align-items:center;gap:12px;color:var(--acc2);font-size:11.5px;letter-spacing:.28em;text-transform:uppercase;margin-bottom:20px}}
  .kick::before{{content:"";width:44px;height:1px;background:var(--acc)}}
  h1{{font-size:clamp(46px,{f.get('h1vw','10.6')}vw,{f.get('h1max','158')}px)}}
  h1 .ln{{display:block;overflow:hidden}}
  h1 .ln>span{{display:block;transform:translateY(110%)}}
  h1 em{{font-family:"Instrument Serif",serif;font-style:italic;text-transform:none;color:var(--acc2);letter-spacing:-.02em}}
  .herofoot{{display:flex;align-items:flex-end;gap:36px;flex-wrap:wrap;margin-top:28px}}
  .herofoot p{{max-width:44ch;color:#C6C2BB;margin:0;font-size:17px}}
  .heroacts{{display:flex;gap:11px;margin-left:auto}}
  @media(max-width:760px){{.heroacts{{margin-left:0}}}}

  .mq{{border-top:1px solid var(--line);border-bottom:1px solid var(--line);overflow:hidden;background:var(--bg2)}}
  .mqin{{display:flex;gap:42px;padding:15px 0;white-space:nowrap;width:max-content;animation:mv 30s linear infinite}}
  .mqin span{{font-family:"{f['css']}",sans-serif;font-size:23px;color:var(--dim);text-transform:uppercase;letter-spacing:-.01em}}
  .mqin span:nth-child(even){{color:var(--acc);opacity:.9}}
  @keyframes mv{{to{{transform:translateX(-50%)}}}}

  .stats{{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--line)}}
  .stat{{padding:42px 24px;border-right:1px solid var(--line)}}
  .stat:last-child{{border-right:0}}
  .stat .n{{font-family:"{f['css']}",sans-serif;font-size:clamp(30px,4.2vw,58px);line-height:1}}
  .stat .n i{{font-style:normal;color:var(--acc)}}
  .stat .l{{color:var(--mut);font-size:11px;letter-spacing:.18em;text-transform:uppercase;margin-top:8px}}
  @media(max-width:820px){{.stats{{grid-template-columns:1fr 1fr}}.stat:nth-child(2){{border-right:0}}.stat:nth-child(-n+2){{border-bottom:1px solid var(--line)}}}}

  section{{padding:118px 0;position:relative}}
  .eye{{color:var(--acc2);font-size:11px;letter-spacing:.26em;text-transform:uppercase;margin-bottom:18px}}
  h2{{font-size:clamp(36px,5.8vw,80px)}}
  .lede{{color:var(--mut);font-size:17.5px;max-width:52ch;margin:22px 0 0}}

  .pinwrap{{height:340vh;position:relative}}
  .pin{{position:sticky;top:0;height:100svh;overflow:hidden;display:grid;place-items:center}}
  .pinimg{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;will-change:transform;opacity:.32}}
  /* the veil resolves to exactly --bg so the photo dissolves into the page */
  .pinveil{{position:absolute;inset:0;background:radial-gradient(58% 58% at 50% 50%,transparent 0%,{p['bg']}b8 58%,var(--bg) 100%)}}
  .beats{{position:relative;z-index:2;text-align:center;width:min(880px,88vw)}}
  .beat{{position:absolute;inset:0;display:grid;place-content:center;gap:16px;opacity:0;pointer-events:none;
    transition:opacity .28s ease,transform .28s ease;transform:translateY(12px)}}
  .beat.on{{opacity:1;transform:none;pointer-events:auto}}
  .beat h3{{font-size:clamp(28px,5vw,66px)}}
  .beat p{{color:var(--mut);font-size:17px;max-width:46ch;margin:0 auto}}
  .beat .bn{{color:var(--acc);font-size:11px;letter-spacing:.3em;text-transform:uppercase}}
  .pinhint{{position:absolute;bottom:34px;left:50%;transform:translateX(-50%);color:var(--dim);font-size:10.5px;letter-spacing:.24em;text-transform:uppercase}}

  .svcs{{margin-top:52px;border-top:1px solid var(--line)}}
  .svc{{display:grid;grid-template-columns:66px 1fr auto;gap:24px;align-items:center;padding:25px 8px;border-bottom:1px solid var(--line);
    text-decoration:none;position:relative;transition:padding .35s}}
  .svc::before{{content:"";position:absolute;inset:0;background:linear-gradient(90deg,{p['accent']}1a,transparent 62%);opacity:0;transition:opacity .35s}}
  .svc:hover::before{{opacity:1}}
  .svc:hover{{padding-left:24px}}
  .svc .num{{font-family:"{f['css']}",sans-serif;color:var(--dim);font-size:13px}}
  .svc h3{{font-size:clamp(21px,2.8vw,36px);transition:color .3s}}
  .svc:hover h3{{color:var(--acc2)}}
  .svc .go{{color:var(--dim);font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;transition:color .3s,transform .3s;white-space:nowrap}}
  .svc:hover .go{{color:var(--acc);transform:translateX(6px)}}
  .note{{margin-top:26px;color:var(--dim);font-size:13px}}

  .split{{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}}
  @media(max-width:940px){{.split{{grid-template-columns:1fr;gap:36px}}}}
  .shot{{position:relative;overflow:hidden}}
  .shot img{{width:100%;height:100%;object-fit:cover;will-change:transform}}
  .quotebig{{font-family:"Instrument Serif",serif;font-style:italic;font-size:clamp(24px,3.3vw,42px);line-height:1.24}}
  .qattr{{color:var(--dim);font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;margin-top:18px}}

  .callout{{border:1px solid var(--line);padding:44px;display:grid;grid-template-columns:1fr auto;gap:26px;align-items:center;background:var(--bg2)}}
  .callout h3{{font-size:clamp(24px,3.4vw,42px)}}
  .callout p{{color:var(--mut);margin:10px 0 0;max-width:52ch}}
  @media(max-width:820px){{.callout{{grid-template-columns:1fr}}}}

  .cards{{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:48px}}
  @media(max-width:860px){{.cards{{grid-template-columns:1fr}}}}
  .card{{border:1px solid var(--line);padding:30px 26px;transition:border-color .3s,transform .3s}}
  .card:hover{{border-color:{p['accent']}80;transform:translateY(-4px)}}
  .card .cn{{font-family:"{f['css']}",sans-serif;font-size:13px;color:var(--acc);letter-spacing:.16em}}
  .card h3{{font-size:26px;margin:14px 0 6px}}
  .card p{{color:var(--mut);font-size:14px;margin:0}}
  .card .slot{{margin-top:20px;color:var(--dim);font-size:12px;letter-spacing:.14em;text-transform:uppercase}}

  .visit{{background:var(--bg2);border-top:1px solid var(--line)}}
  .vgrid{{display:grid;grid-template-columns:1.1fr .9fr;gap:64px}}
  @media(max-width:940px){{.vgrid{{grid-template-columns:1fr;gap:38px}}}}
  .phone{{font-family:"{f['css']}",sans-serif;font-size:clamp(30px,5.2vw,66px);text-decoration:none;display:inline-block;line-height:1;transition:color .3s}}
  .phone:hover{{color:var(--acc2)}}
  .meta{{list-style:none;padding:0;margin:32px 0 0}}
  .meta li{{display:flex;gap:20px;padding:15px 0;border-top:1px solid var(--line);font-size:15px}}
  .meta b{{color:var(--mut);font-weight:500;min-width:92px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;padding-top:3px}}
  form{{border:1px solid var(--line);padding:32px;background:rgba(255,255,255,.014)}}
  label{{display:block;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--mut);margin:0 0 8px}}
  input,select,textarea{{width:100%;background:transparent;border:0;border-bottom:1px solid var(--line);color:var(--ink);
    font-family:inherit;font-size:16px;padding:10px 0 12px;margin-bottom:22px;outline:none;transition:border-color .25s;resize:vertical}}
  input:focus,select:focus,textarea:focus{{border-bottom-color:var(--acc)}}
  select option{{background:{p['bg2']};color:var(--ink)}}
  form .btn{{width:100%;text-align:center;padding:16px}}
  .fnote{{color:var(--dim);font-size:12px;text-align:center;margin:14px 0 0}}

  footer{{border-top:1px solid var(--line);padding:52px 0 34px;color:var(--dim);font-size:14px}}
  .fgrid{{display:flex;justify-content:space-between;gap:26px;flex-wrap:wrap}}
  footer b{{color:var(--ink);font-family:"{f['css']}",sans-serif;font-weight:400;font-size:16px;letter-spacing:-.01em}}
  .disc{{margin-top:34px;padding-top:20px;border-top:1px solid var(--line);font-size:12px;line-height:1.7;color:#4B4844}}

  .rev{{opacity:0;transform:translateY(30px)}}
  @media (prefers-reduced-motion:reduce){{
    .rev{{opacity:1;transform:none}}
    .grain,.mqin{{animation:none}}
    h1 .ln>span{{transform:none}}
    .pinwrap{{height:auto}}.pin{{position:relative;height:auto;padding:80px 0}}
    .beat{{position:relative;opacity:1;transform:none;margin-bottom:44px}}
  }}"""


def render(c):
    a = f"../_assets/{c['trade']}"
    im = c["images"]
    nav = "".join(f'<a href="{h}">{esc(t)}</a>' for h, t in c["nav"])
    h1 = "".join(f'\n        <span class="ln"><span>{rich(l)}</span></span>' for l in c["h1"])
    stats = "".join(
        f'\n    <div class="stat rev"><div class="n">'
        f'{f"""<span data-count="{s["count"]}">0</span>""" if s.get("count") else rich(s["v"])}'
        f'{f"""<i>{rich(s["suffix"])}</i>""" if s.get("suffix") else ""}</div>'
        f'<div class="l">{esc(s["l"])}</div></div>' for s in c["stats"])
    beats = "".join(
        f'\n      <div class="beat"><div class="bn">{esc(b["n"])}</div>'
        f'<h3>{rich(b["h"])}</h3><p>{esc(b["p"])}</p></div>' for b in c["beats"])
    sv = c["services"]
    svcs = "".join(
        f'\n      <a class="svc rev" href="#visit"><span class="num">{i:02d}</span>'
        f'<h3>{esc(t)}</h3><span class="go">{esc(sv.get("cta", "Book"))} &#8594;</span></a>'
        for i, t in enumerate(sv["items"], 1))
    cards = ""
    if c.get("cards"):
        cd = c["cards"]
        cards = f"""
<section style="padding-top:0">
  <div class="wrap">
    <div class="eye rev">{esc(cd['eyebrow'])}</div>
    <h2 class="rev">{rich(cd['h2'])}</h2>
    <div class="cards">{"".join(f'''
      <div class="card rev"><div class="cn">{esc(x["n"])}</div><h3>{esc(x["h"])}</h3><p>{esc(x["p"])}</p><div class="slot">{esc(x["slot"])}</div></div>''' for x in cd["items"])}
    </div>
    <p class="note rev">{esc(cd['note'])}</p>
  </div>
</section>"""
    callout = ""
    if c.get("callout"):
        co = c["callout"]
        callout = f"""
<section style="padding-top:0">
  <div class="wrap">
    <div class="callout rev">
      <div><h3>{rich(co['h3'])}</h3><p>{esc(co['p'])}</p></div>
      <a class="btn" href="#visit">{esc(co['cta'])}</a>
    </div>
  </div>
</section>"""
    fields = ""
    for fl in c["form"]["fields"]:
        fid = fl["id"]
        if fl["type"] == "select":
            opts = "".join(f"<option>{esc(o)}</option>" for o in fl["options"])
            fields += f'\n      <label for="{fid}">{esc(fl["label"])}</label><select id="{fid}">{opts}</select>'
        elif fl["type"] == "textarea":
            fields += f'\n      <label for="{fid}">{esc(fl["label"])}</label><textarea id="{fid}" rows="2" placeholder="{esc(fl.get("ph",""))}"></textarea>'
        else:
            fields += f'\n      <label for="{fid}">{esc(fl["label"])}</label><input id="{fid}" type="{fl["type"]}" placeholder="{esc(fl.get("ph",""))}">'
    meta = "".join(f'\n        <li class="rev"><b>{esc(k)}</b><span>{rich(v)}</span></li>' for k, v in c["visit"]["meta"])
    fcols = "".join(f'\n      <div><b>{rich(x[0])}</b><br>{rich(x[1])}</div>' for x in c["footer"])
    mq = "".join(f'"{w}",' for w in c["marquee"])

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{esc(c['business'])} &#8212; {esc(c['tagline'])}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family={c['font']['google']}&family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap">
<style>
{css(c)}
</style>
</head>
<body>
<div class="grain"></div>
<div class="prog" id="prog"></div>

<div class="demo">
  <b>{"Fictional concept" if c.get("fictional") else "Concept mockup"}</b> &#183; built by Caleb Pierce at cfwebdev.net &#183; {"this business does not exist" if c.get("fictional") else "not affiliated with the business"} &#183; nothing here is live
</div>

<nav id="nav">
  <div class="wrap nb">
    <a class="brand" href="#top"><span class="bmark">{esc(c['initials'])}</span><span class="bname">{esc(c['nav_name'])}</span></a>
    <div class="nlinks">{nav}</div>
    <a class="btn" href="#visit">{esc(c['nav_cta'])}</a>
  </div>
</nav>

<header class="hero" id="top">
  <img class="heroimg" id="heroimg" src="{a}/{im['hero']}" alt="{esc(c['hero_alt'])}">
  <div class="heroveil"></div>
  <div class="herobody">
    <div class="wrap">
      <div class="kick" id="kick">{esc(c['kicker'])}</div>
      <h1>{h1}
      </h1>
      <div class="herofoot">
        <p class="rev">{esc(c['hero_p'])}</p>
        <div class="heroacts rev">
          <a class="btn" href="#visit">{esc(c['cta'][0])}</a>
          <a class="btn ghost" href="#work">{esc(c['cta'][1])}</a>
        </div>
      </div>
    </div>
  </div>
</header>

<div class="mq"><div class="mqin" id="mq"></div></div>

<div class="wrap">
  <div class="stats">{stats}
  </div>
</div>

<div class="pinwrap" id="pinwrap">
  <div class="pin">
    <img class="pinimg" id="pinimg" src="{a}/{im['pin']}" alt="{esc(c['pin_alt'])}">
    <div class="pinveil"></div>
    <div class="beats">{beats}
    </div>
    <div class="pinhint">Keep scrolling</div>
  </div>
</div>

<section id="work" style="padding-top:0">
  <div class="wrap">
    <div class="eye rev">{esc(sv['eyebrow'])}</div>
    <h2 class="rev">{rich(sv['h2'])}</h2>
    {f'<p class="lede rev">{esc(sv["lede"])}</p>' if sv.get("lede") else ""}
    <div class="svcs">{svcs}
    </div>
    {f'<p class="note rev">{esc(sv["note"])}</p>' if sv.get("note") else ""}
  </div>
</section>

<section id="trust" style="padding-top:0">
  <div class="wrap split">
    <div class="shot rev" style="aspect-ratio:3/2"><img id="detailimg" src="{a}/{im['detail']}" alt="{esc(c['detail_alt'])}"></div>
    <div>
      <div class="eye rev">{esc(c['trust']['eyebrow'])}</div>
      <p class="quotebig rev">{esc(c['trust']['quote'])}</p>
      <div class="qattr rev">{esc(c['trust']['attr'])}</div>
      <p class="lede rev">{esc(c['trust']['lede'])}</p>
    </div>
  </div>
</section>
{cards}{callout}

<section id="visit" class="visit">
  <div class="wrap vgrid">
    <div>
      <div class="eye rev">Visit</div>
      <h2 class="rev" style="margin-bottom:24px">{rich(c['visit']['h2'])}</h2>
      <a class="phone rev" href="#visit">{esc(c['visit']['phone'])}</a>
      <ul class="meta">{meta}
      </ul>
    </div>
    <form class="rev" onsubmit="event.preventDefault();this.querySelector('.btn').textContent='Concept only, nothing sent';">{fields}
      <button class="btn" type="submit">{esc(c['form']['button'])}</button>
      <p class="fnote">Demo form. Nothing is sent or stored.</p>
    </form>
  </div>
</section>

<footer>
  <div class="wrap">
    <div class="fgrid">{fcols}
    </div>
    <div class="disc">
      {"Fictional design concept" if c.get('fictional') else "Concept mockup"} designed and built by Caleb Pierce, cfwebdev.net. {"This is a portfolio piece for a business that does not exist, and is not a live website." if c.get('fictional') else f"This is an unsolicited design concept, not affiliated with or endorsed by {esc(c['business'])}, and not a live business website."} {esc(c['disclaimer'])} Photography is placeholder stock imagery for the concept. No reviews or testimonials have been invented.
    </div>
  </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js"></script>
<script>
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const words = [{mq}];
document.getElementById("mq").innerHTML = [...words, ...words].map(w => `<span>${{w}}</span>`).join("");

if (!reduced && window.gsap) {{
  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis) {{
    const lenis = new Lenis({{ duration: 1.1, smoothWheel: true }});
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }}

  gsap.to("h1 .ln > span", {{ y: 0, duration: 1.15, ease: "power4.out", stagger: 0.09, delay: 0.15 }});
  gsap.from("#kick", {{ opacity: 0, x: -20, duration: 0.9, delay: 0.1 }});
  gsap.to("#heroimg", {{ yPercent: 14, ease: "none",
    scrollTrigger: {{ trigger: ".hero", start: "top top", end: "bottom top", scrub: true }} }});
  gsap.to("#detailimg", {{ yPercent: -9, ease: "none",
    scrollTrigger: {{ trigger: "#trust", start: "top bottom", end: "bottom top", scrub: true }} }});

  /* pinned section: scroll picks the beat, the frame pushes in behind it. One
     class swap per change, so CSS runs a single clean crossfade rather than
     stacked tweens fighting each other while the scrub catches up. */
  const beats = gsap.utils.toArray(".beat");
  if (beats.length) {{
    beats[0].classList.add("on");
    ScrollTrigger.create({{
      trigger: "#pinwrap", start: "top top", end: "bottom bottom", scrub: 0.6,
      onUpdate(self) {{
        const i = Math.min(beats.length - 1, Math.floor(self.progress * beats.length));
        beats.forEach((b, n) => b.classList.toggle("on", n === i));
      }}
    }});
    gsap.to("#pinimg", {{ scale: 1.16, ease: "none",
      scrollTrigger: {{ trigger: "#pinwrap", start: "top top", end: "bottom bottom", scrub: true }} }});
  }}

  gsap.utils.toArray(".rev").forEach((el) => {{
    gsap.to(el, {{ opacity: 1, y: 0, duration: 0.85, ease: "power3.out",
      scrollTrigger: {{ trigger: el, start: "top 88%", once: true }} }});
  }});

  gsap.utils.toArray("[data-count]").forEach((el) => {{
    const target = parseFloat(el.dataset.count), dec = target % 1 !== 0;
    ScrollTrigger.create({{ trigger: el, start: "top 92%", once: true,
      onEnter: () => gsap.to({{ v: 0 }}, {{ v: target, duration: 1.5, ease: "power2.out",
        onUpdate() {{ el.textContent = dec ? this.targets()[0].v.toFixed(1) : Math.round(this.targets()[0].v); }} }}) }});
  }});

  ScrollTrigger.create({{ start: 0, end: "max",
    onUpdate: (self) => {{ document.getElementById("prog").style.width = (self.progress * 100) + "%"; }} }});
}} else {{
  document.querySelectorAll("[data-count]").forEach(el => {{ el.textContent = el.dataset.count; }});
}}

const nav = document.getElementById("nav");
addEventListener("scroll", () => nav.classList.toggle("stuck", scrollY > innerHeight * 0.75), {{ passive: true }});
</script>
</body>
</html>
"""


def main(argv):
    cfgs = json.loads(CFG.read_text(encoding="utf-8"))["mockups"]
    only = argv[0] if argv else None
    n = 0
    for c in cfgs:
        if only and c["slug"] != only:
            continue
        d = OUT / c["slug"]
        d.mkdir(parents=True, exist_ok=True)
        (d / "index.html").write_text(render(c), encoding="utf-8")
        print(f"  built {c['slug']:<32} trade={c['trade']}")
        n += 1
    print(f"\n{n} mockup(s) written from one shared layout.")


if __name__ == "__main__":
    main(sys.argv[1:])

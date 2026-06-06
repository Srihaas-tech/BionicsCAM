# BionicsCAM 🦝

**Onshape-to-CNC CAM for FRC teams who would rather build robots than wrestle CAM software.**

BionicsCAM is a browser-based CNC workflow for flat FRC parts. It can import DXFs manually, pull selected faces from Onshape, generate toolpaths, preview G-code, and export ready-to-run NC files.

It started as a fork/rebrand of **PenguinCAM by FRC Team 6238**, then wandered into the trash can and came back with Onshape integration, auto-nesting, Vercel deployment, and a suspicious number of raccoon jokes.

Live app: <https://bionicscam.vercel.app>

---

## What is BionicsCAM?

BionicsCAM turns flat CAD geometry into CNC-ready G-code with a workflow that feels closer to a slicer or laser cutter than traditional CAM.

Typical workflow:

1. Design a flat part in Onshape.
2. Select one large flat face per part.
3. Send it to BionicsCAM.
4. Check the setup preview.
5. Preview the generated G-code.
6. Download the NC file and make chips.

Manual DXF upload is also supported, including multi-part upload and auto-nesting.

---

## Why does this exist?

Because sometimes your team needs a bracket **now**, the normal CAM workflow is doing tax paperwork in a trench coat, and the router is just sitting there asking for G-code.

BionicsCAM is meant for students and mentors who need a practical path from CAD to CNC without making every new student become a feeds-and-speeds wizard overnight.

The raccoon philosophy:

> Make the safe path easy, make the dangerous path obvious, and never let the overlay raccoon back into the G-code preview.

---

## Features

### Onshape integration

- Runs inside the Onshape right panel.
- Uses OAuth by default so each user imports with their own Onshape permissions.
- Select one flat face per part and import directly.
- Supports selected multi-part import.
- Avoids accidentally exporting the whole Part Studio unless explicitly intended.

### Manual DXF upload

- Single DXF upload.
- Multi-DXF upload.
- Quantity support for multi-upload.
- Works even when Onshape API raccoon is having a day.

### Auto-nesting

- Places multiple parts onto stock.#BionicsCAM

**Onshape-to-CNC for FRC Teams**

First thing's first, I want to thank Team 6238 and give a lil backstory. It was really late, and we need a part made immediately. The bad news was that Railway, the site that hosted PenguinCAM was down. We immediately asked Claude (the best Coding AI out there how to host our own version of PenguinCAM. We ended up making a local host. So I, Srihaas Mynampati got obsessed with making BionicsCAM. It took 3 days, multiple energy bars, and hundreds of AI prompts to make it. BionicsCAM was on Vercel! I wasn't done yet. I wanted to add implementation to Onshape. This took 2 days, more energy bars (I had to take a break to go to Costco to get more), and hundreds of MORE AI prompts. (ChatGPT started to get pissed off). And now I'm done. But not in the way you think. I still have to make this for my entire team. I also want to add a few features to BionicsCAM to make it BETTER than it's SisterCAM.

🔗 **Demo video:**  
[![Demo video](https://img.youtube.com/vi/gFReFDz-_LI/0.jpg)](https://youtu.be/zPZCTVh2n2Q)

**Live app:** https://bionicscam.vercel.app
---

## What is BionicsCAM?

BionicsCAM streamlines the workflow from CAD design to CNC machining for FRC teams:
1. **Design in Onshape** → Create flat plates or tubes, with holes and pockets
2. **Open app → "Send to BionicsCAM"** → One-click export from Onshape
3. **Orient & Generate** → Rotate part, auto-generate toolpaths
4. **Download or Save to Drive** → Ready to run on your CNC router

**No difficult CAM software, no manual exports!** BionicsCAM knows what FRC teams need.

Designed to feel like 3D printer slicers or laser cutter software. Get the design, orient it on the machine, and go. Launching directly from Onshape means no export/import steps, lost files or inconsistent naming. Every part designed by your team members automatically get the same CNC behavior. Students don't have to know feeds & speeds, understand ramp angles, risk machine collisions. Just select the part and go.

**Multi-team support:** Other teams can use the hosted service at https://bionicscam.vercel.app! Just upload a `PenguinCAM-config.yaml` file to your Onshape documents to customize settings for your CNC machine. See "For Other FRC Teams" below.

---

## Features

### 🤖 **Built for FRC**

✅ **Automatic hole detection:**
- All circular holes (preserves exact CAD dimensions)
- #10 screw holes, bearing holes, or custom sizes
- Helical entry + spiral clearing strategy

✅ **Smart perimeter cutting of plates:**

- Uses simple, reliable rectangular packing.
- Supports quantity expansion.
- Adds clearance between parts.
- Generates one combined NC file.

Auto-nesting V1 is intentionally simple. It does **not** do full polygon nesting, genetic algorithms, simulated annealing, AI magic, or raccoon divination.

### G-code generation

- Hole detection.
- Perimeter cuts.
- Tabs.
- Tool diameter compensation.
- 2D workflow for flat plates.
- 2.5D support where applicable.
- One combined file for nested jobs.

### Preview tools

- DXF setup preview.
- G-code preview.
- Stock outline.
- Multi-part preview.
- Overlay raccoon suppression when switching to G-code preview.

---

## Quick Start

### Option 1: Onshape import

1. Open a Part Studio in Onshape.
2. Open the BionicsCAM panel.
3. Select one large flat face per part.
4. Click import.
5. Review the setup preview.
6. Click **Preview G-code**.
7. If it looks sane, click **Generate Program**.

If Onshape import fails because of permissions, make sure the logged-in user can access the document. In OAuth mode, BionicsCAM uses that user's Onshape access.

### Option 2: Manual DXF upload

1. Export DXFs from Onshape or another CAD program.
2. Open BionicsCAM.
3. Upload one or more DXF files.
4. Set quantity, stock size, gap, and other parameters.
5. Preview the setup.
6. Preview G-code.
7. Generate the NC file.

Manual upload is the emergency exit when the Onshape raccoon eats the API tokens.

---

## Recommended Student Workflow

1. Make the part in CAD.
2. Keep it flat and machinable.
3. Select the biggest flat face.
4. Send it to BionicsCAM.
5. Look at the preview before generating.
6. Do not run mystery G-code because “it probably works.”
7. Ask a mentor before sacrificing aluminum to the router gods.

---

## Configuration

BionicsCAM can use team configuration files for machine defaults, feeds, speeds, tool sizes, and other settings.

Common local config files:

```text
machine_config.json
auth_config.json
drive_config.json
```

For hosted/team usage, BionicsCAM can also look for a PenguinCAM-style config file in Onshape when enabled.

---

## Environment Variables

Common deployment variables:

```text
BASE_URL
FLASK_SECURITY_KEY
ONSHAPE_CLIENT_ID
ONSHAPE_CLIENT_SECRET
```

Optional API-key variables, only if API-key backend mode is intentionally enabled:

```text
ONSHAPE_ACCESS_KEY
ONSHAPE_SECRET_KEY
ONSHAPE_BACKEND_AUTH_MODE=api_key
```

Default recommended mode for multi-user classroom/team use:

```text
ONSHAPE_BACKEND_AUTH_MODE=oauth
```

OAuth mode means each user spends their own Onshape API requests and uses their own document permissions. Fewer permission raccoons, more personal responsibility.

---

## Local Development

Install dependencies:

```bash
python3 -m pip install -r requirements.txt
```

Run the app:

```bash
python3 frc_cam_gui_app.py
```

Or, depending on your setup:

```bash
python3 app.py
```

Then open the local URL printed in the terminal.

### Basic checks

Run these before committing changes:

```bash
python3 -m py_compile app.py frc_cam_gui_app.py frc_cam_postprocessor.py onshape_integration.py
node --check static/app.js
node --check static/onshape_panel.js
```

If the repo has been reorganized into folders, adjust paths accordingly. The raccoon cannot read your mind, but `ls` can help.

---

## Testing Checklist

Before calling a build “good,” test these:

- Single manual DXF upload.
- Multi-DXF upload.
- Multi-DXF quantity.
- Setup DXF preview shows all parts.
- G-code preview shows all parts.
- DXF overlay disappears in G-code preview.
- Generate Program produces one combined NC file.
- Onshape selected single-part import.
- Onshape selected multi-part import.
- 2D runtime is reasonable.
- 2.5D does not try to cut every line like a spaghetti machine.

If a change touches nesting, preview, Onshape, or post-processing, test twice. That is where the raccoons live.

---

## Repository Map

Core files in the current flat layout:

```text
app.py                         Vercel/Flask entrypoint
frc_cam_gui_app.py             Main Flask web app
frc_cam_postprocessor.py       CAM and G-code generation
onshape_integration.py         Onshape API/OAuth/export logic
penguincam_auth.py             Auth helpers
google_drive_integration.py    Optional Drive integration
metrics.py                     Metrics/logging helpers
static/                        Frontend JS/CSS/assets
templates/                     HTML templates
docs/                          Documentation
requirements.txt               Python dependencies
vercel.json                    Vercel deployment config
```

If this repo gets reorganized later, please leave a `REORG_MAP.md`, because future-us deserves mercy.

---

## Deployment

BionicsCAM is currently deployed on Vercel.

Typical deploy flow:

```bash
git add -A
git commit -m "Describe the change"
git push origin main
```

Vercel redeploys from `main`.

Useful production debug endpoints:

```text
/api/onshape-auth-mode
/api/onshape-auth-test
```

These should not expose secrets. They are for confirming whether the app is using OAuth, API keys, and whether the backend can talk to Onshape.

---

## Troubleshooting

### Onshape import says permission denied

The selected user or backend auth mode cannot access the document.

In OAuth mode, make sure the logged-in Onshape user can open the document.

In API-key mode, make sure the API-key account can access the document.

### Onshape says API limit exceeded

Stop clicking import like it owes you money.

Check whether BionicsCAM is using OAuth or API-key mode. Each mode may burn a different account's quota.

### Only one part appears in DXF preview

The preview path is probably only rendering the first DXF. Check multi-DXF setup preview logic.

### G-code shows all parts but DXF preview does not

Backend is probably fine. Frontend preview parser/rendering is the suspicious raccoon.

### Parts overlap after nesting

Check bounding boxes, rotation, clearance, and whether preview and G-code placement use the same math.

### Vercel says 500

Read the function logs. The useful part is usually the line before the traceback or the last Onshape API response.

---

## Credits

BionicsCAM is based on **PenguinCAM by FRC Team 6238, Popcorn Penguins**.

Huge thank-you to Team 6238 for releasing PenguinCAM under the MIT License. BionicsCAM/RaccoonCAM would not exist without that foundation.

Additional BionicsCAM work by Srihaas Mynampati, Chris Johnson, and the Big Man Himeself, Blake Borque, with extensive assistance from **Ahem** AI tools and at least one metaphorical raccoon.

---

## License

This project includes code derived from PenguinCAM, which is licensed under the MIT License.

BionicsCAM is also distributed under the MIT License unless stated otherwise.

Keep the original copyright and MIT license notices when redistributing or publishing modified versions.

The license file should be boring. The README may contain raccoons.

---

## Name Notes

This project may be referred to as:

```text
BionicsCAM   current project/app name
RaccoonCAM   chaotic spiritual successor / possible app-store name
PenguinCAM   original upstream inspiration by Team 6238
```

If publishing publicly, be clear that RaccoonCAM/BionicsCAM is a modified fork and is not officially endorsed by Team 6238 unless they say so.

---

## Final Warning

CNC routers are real machines. They do not care that the preview looked cute.

Always verify toolpaths, clamp material, set zeros correctly, and keep hands away from the danger zone.

If something looks wrong, stop. The raccoon can wait.

## What's With All The Raccoons?
Raccoons **ARE NOT**  my favorite animal. A lil backstory: when I actually finished making BionicsCAM, I gave it to one of my teammates, Declan Murphy (O'Harris(Idk which one it is)) he came back with a very generic error, someting along the lines of "I see the parts, but I don't want to export". I, ofc was raging at that. Manual DXF export was working. It was only the Onshape thingamabobber. Anyways, I spent about 3 hours of my own time tryna debug it, to no avail. I asked Claude, it did nothing to help. I asked ChangGPT (Deepseek), still nada. I asked ChatGPT, nope. I gave up, accepted damnation, and looked at the Vercel logs. I immediately understood what happened and I pasted the logs to GPT-man. It was like "OH. We finally caught the raccoon on camera." That immediately became a metaphor for us, and we've been using raccoon as a metaphor whenever something goes wrong, or right...

Here is the exact error that was pissing me off:

{
"error":
"No parts could be exported from this document","message":"BionicsCAM could not resolve/export the selected Onshape faces. Try selecting one large flat face per part."
}

*You see? Very vague. That's what I was wrestling with for 4 hours of my life*

The error that finally made sense:
         {
            "content_type":"application/json",
            "face_id":"JPK",
            "response_preview":"{\n \"message\" : \"API limit exceeded\",\n \"moreInfoUrl\" : \"\",\n \"status\" : 402,\n \"code\" : 402\n}",
            "route":"workspace",
            "selector_key":"faceIds",
            "status_code":402
   },
*Much clearer.* 

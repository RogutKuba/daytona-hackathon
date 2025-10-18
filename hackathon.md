⚙️ Concept: Self-Improving App via A/B Testing Agents

An AI system that continuously runs experiments on a live app — generating new features or variations, deploying them in isolated Daytona sandboxes, spawning browser agents to simulate user sessions, collecting results (conversion / dwell time / error rates), and then automatically merging the winning variant.

🎯 Demo Scenario

App: simple landing page with a “Sign Up” CTA.
Goal: “Maximize user conversion.”

The system’s job:

Generate multiple variations of the landing page (copy, color, layout).

Run real browser simulations of “users” (agents) interacting.

Measure engagement metrics (clicks, scroll depth, time on page).

Auto-select the winner and merge it to main.

🧩 Architecture Overview
Repo → Daytona Sandbox Manager
│
└──► Variant Generator (Claude Code)
     │  creates N branches = feature variants
     ▼
 Browser Use Agents swarm
     │  simulate user sessions, record metrics
     ▼
 Evaluator
     │  aggregates metrics + feedback
     ▼
 Auto-Merge → best performing branch

🧠 Step-by-Step Demo Flow
Step 1. Start Experiment

Command:

self_improving_app \
  --repo github.com/kubarogut/landing-page \
  --goal "Increase signup conversion"


System output:

🧪 Starting experiment: increase signup conversion
📦 Forked repo into 3 Daytona sandboxes
🤖 Generating variant ideas...


Claude Code (variant generator) produces:

Variant A: Change button color + copy

Variant B: Add testimonial section

Variant C: Simplify hero layout

Each variant = new branch, deployed sandbox.

Step 2. Spawn Browser Agents

10+ Browser Use agents run session replays for each variant.

They simulate user behavior (scroll, hover, click).

They collect telemetry:

Click rate on CTA

Time before bounce

Number of interactions

Step 3. Evaluation + Iteration

The Evaluator summarizes:

Variant A: 62% clicked CTA
Variant B: 78% clicked CTA
Variant C: 40% clicked CTA


Claude Reasoner reads results:

“Variant B improved conversion by 25%.
Let’s refine testimonials text for next iteration.”

It edits Variant B’s branch to create B2, runs the next loop.

Step 4. Auto-Merge Winning Variant

After N iterations:

🏆 Winner: Variant B2 (conversion +37%)
🔀 Merging to main branch...


Daytona rebuilds final sandbox → live link.

💻 What You Actually Demo Live

Repo: minimal landing page app (index.html or Next.js page).

Goal input: “Optimize user conversion.”

Visible console UI:

“Generating 3 variants…”

“Running browser agents…”

“Evaluating metrics…”

Progress bars or live metric display.

Split-screen visualization (optional):

Left: three sandbox previews (A/B/C)

Right: logs of simulated users + metrics updating

Final moment:

Graph showing “conversion up 37%”

Git commit diff of winning variant auto-merged.

⚡ Stretch Add-Ons (if you have time)

Feature Exploration Mode: agent invents new experiments (e.g. “try onboarding flow” or “add free trial banner”).

Reward Function Editing: instead of conversions, optimize any metric (load time, engagement, readability).

Human-in-the-loop: you can upvote / downvote experiments manually to steer evolution.

Dashboard for ongoing self-improvement: list of experiments, metrics, and live preview links.

🧠 Key Narrative for the Hackathon Pitch

“Instead of a coding agent that writes features once, we built a self-improving system that continuously experiments, measures, and learns — turning your product into its own growth engineer.”
# 🧭 User Flow: Self-Improving A/B Testing System

## Overview
This document outlines the user experience for an AI-powered system that continuously runs experiments on live applications, automatically generating variants, testing them with browser agents, and merging winning changes.

---

## 1. 🚀 Starting an Experiment

### Dashboard → "New Experiment" Button
- User clicks "New Experiment" from the main dashboard
- System presents a simple 3-field configuration form

### Experiment Configuration Form
**Git Repository URL**
- Input: `https://github.com/user/app`
- Purpose: Source code for the application to be optimized

**Goal / Task** 
- Input: Free text description
- Examples: "Increase signup conversion", "Fix layout bugs", "Improve user engagement"
- Purpose: Defines what the AI should optimize for

**Primary Metric**
- Input: Dropdown selection
- Options: conversion rate, dwell time, bounce rate, click-through rate, etc.
- Purpose: Defines how success will be measured

### Experiment Initialization
- User clicks "Start Experiment"
- UI transitions to experiment screen with "Preparing" status
- System message: "Cloning repo, creating sandboxes, generating variants..."

---

## 2. 🧪 Live Experiment Screen

### Header Bar Components
- **Experiment Name**: Auto-generated from repository name
- **Goal Summary**: Displays the optimization goal
- **Repository Link**: Clickable GitHub icon for easy access
- **Status Pill**: Shows current phase (Preparing → Running → Completed)
- **Run Timer**: Displays elapsed time and available actions ("Stop", "Merge Winner")

### Three-Column Layout

#### Left Column: Variants Board
**Purpose**: Displays all generated variants and their performance

**Variant Cards** (appear as generation starts):
- **Branch Name**: `auto/variant-a`, `auto/variant-b`, `auto/variant-c`
- **Commit Summary**: Brief description of changes ("Changed CTA color", "Added testimonial section")
- **Mini Metric**: Real-time performance indicator (e.g., "CTR: 54%")
- **Preview Toggle**: Button to view this variant
- **Winner Badge**: Appears on the best-performing variant

#### Center Column: Preview & Metrics
**Preview Tab**:
- Live Daytona sandbox iframe showing the selected variant
- Real-time preview of the application with changes applied

**Metrics Tab**:
- **KPI Summary Card**: Current performance metrics
- **Trend Chart**: Performance over time
- **Leaderboard**: Ranking of all variants by performance

#### Right Column: Activity Feed
**Real-time Event Log**:
- "Variant B deployed to sandbox"
- "Agent click-through rate: 78%"
- "Generating iteration B2 based on feedback"
- "Evaluating metrics for round 3"

**Iteration Timeline**:
- Shows number of optimization loops completed
- Key changes made in each iteration
- Performance improvements over time

---

## 3. 🔄 Automated Optimization Process

### Phase 1: Variant Generation
- AI analyzes the codebase and goal
- Generates 3+ unique variants with different approaches
- Each variant gets its own branch and Daytona sandbox
- Variants are deployed and made available for testing

### Phase 2: Browser Agent Testing
- 10+ Browser Use agents simulate real user sessions
- Agents interact with each variant (scroll, hover, click)
- Telemetry collected: click rates, time on page, interaction patterns
- Real-time metrics displayed in the UI

### Phase 3: Evaluation & Iteration
- System evaluates performance of each variant
- AI analyzes results and generates refined versions
- Best-performing variant gets iterated upon
- Process repeats until optimal performance is achieved

### Phase 4: Auto-Merge Winner
- System identifies the winning variant
- Automatically merges changes to main branch
- Final sandbox is rebuilt and deployed
- Success metrics are displayed (e.g., "Conversion up 37%")

---

## 4. 🎯 Key User Experience Features

### Real-time Feedback
- Live metrics updating as agents test variants
- Visual progress indicators for each phase
- Split-screen view showing sandbox previews and agent activity

### Transparency
- Full visibility into what changes were made
- Git commit diffs showing exact modifications
- Performance comparison charts and graphs

### Automation
- Minimal user intervention required
- System handles deployment, testing, and merging
- Continuous optimization without manual oversight

---

## 5. 🏆 Demo Scenario Example

**Application**: Simple landing page with "Sign Up" CTA
**Goal**: "Maximize user conversion"
**Process**:
1. System generates variants (button color, testimonials, layout)
2. Browser agents simulate user interactions
3. Metrics show: Variant A (62% CTR), Variant B (78% CTR), Variant C (40% CTR)
4. System refines Variant B and re-tests
5. Final result: 37% improvement in conversion rate
6. Winning variant automatically merged to main branch

---

*This flow enables a "self-improving system that continuously experiments, measures, and learns — turning your product into its own growth engineer."*



# Experiment Flow

This document outlines the step-by-step process for running automated experiments on web applications using Daytona sandboxes and AI agents.

## Overview

The experiment flow consists of 5 main steps that transform a user's goal into actionable variant suggestions for A/B testing.

## Flow Steps

| Step | Name | Short Description | What Actually Happens |
|------|------|-------------------|----------------------|
| 1 | **Goal Definition** | User provides repo, flow, and desired improvement goal | Collect inputs: `repo_url`, `goal`, `flow_description` (e.g. "Signup journey"). Create initial experiment record. |
| 2 | **Baseline Sandbox Launch** | Spin up live Daytona sandbox of the current repo | Clone + build app in isolated environment. This becomes the "control" version. |
| 3 | **Behavior Trace Generation** | Use Browser Use agents to simulate the specified flow and record interactions | Agents navigate the app (e.g. click signup, scroll, submit form). Capture screen recordings, DOM actions, timing, and reasoning traces. |
| 4 | **Insight Extraction** | Feed traces and repo snapshot to Claude Code to analyze current flow and spot issues / opportunities | Claude reads session data + code structure, summarizes "what's happening," identifies pain points or optimization targets. |
| 5 | **Variant Ideation** | Claude Code proposes concrete variant ideas and lightweight change plans | Generate N variant ideas with rationale and affected files (without applying patches yet). Store and show these in dashboard. |

## Key Components

- **Daytona Sandboxes**: Isolated environments for testing
- **Browser Use Agents**: AI agents that simulate user interactions
- **Claude Code**: AI analysis of code and behavior patterns
- **Trace Capture**: Comprehensive recording of user interactions
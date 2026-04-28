# A.R.K.A.N.T.A. BUILDER

**A.R.K.A.N.T.A. BUILDER** stands for **Automatic Rig Konfigurator & Analytic Node for Tailored Architecture**.

A.R.K.A.N.T.A. BUILDER is a modern SPA web application built with Next.js that works as an **AI-powered PC Build Advisor**. The application helps users create personalized PC build recommendations based not only on budget, but also on real-world usage needs, electricity conditions, thermal risks, PSU quality, UPS requirements, component trade-offs, and future upgrade planning.

Unlike a traditional PC builder that only lists compatible components, A.R.K.A.N.T.A. analyzes the user’s actual situation first, then generates smarter, safer, and more realistic PC build recommendations.

---

## Project Description

A.R.K.A.N.T.A. BUILDER is designed for users who want to build a PC but do not fully understand which components are suitable for their needs.

The system guides users through a step-by-step intake process, collects information about their budget, workload, software, gaming target, electricity stability, room temperature, daily usage, upgrade plans, and component priorities.

After collecting the data, the AI generates a diagnosis and recommends multiple PC build paths. Each build includes component details, estimated price, performance score, safety score, value score, upgrade potential, pros, cons, warnings, and AI-powered explanations.

The main goal of this project is to make PC building easier, smarter, safer, and more understandable for Indonesian users.

---

## Main Purpose

The purpose of A.R.K.A.N.T.A. BUILDER is to help users answer questions such as:

- What PC build is suitable for my budget?
- Should I choose Intel or AMD?
- Should I use NVIDIA or Radeon?
- Is this PSU safe enough for my build?
- Do I need a UPS?
- Is my electricity condition risky for this PC?
- Is this build good for gaming, editing, coding, streaming, or AI workloads?
- What happens if I upgrade my RAM, GPU, SSD, or PSU?
- Which build is the safest and most future-proof?
- What are the pros and cons of each recommendation?

A.R.K.A.N.T.A. is not only a PC component recommender. It is an AI assistant that helps users understand the reasoning behind every recommendation.

---

## Key Features

### 1. AI-Powered PC Build Recommendation

The application generates personalized PC build recommendations based on user input.

The AI considers:

- Budget
- Main usage
- Target resolution
- Software requirements
- Gaming needs
- Editing workload
- Coding workload
- AI or machine learning needs
- Brand preference
- Daily usage duration
- Electricity condition
- Room temperature
- PSU quality
- UPS requirement
- Upgrade path
- Component trade-offs

---

### 2. User Intake Wizard

The builder starts with a guided wizard that collects user requirements step by step.

The wizard includes:

- Budget input
- Target resolution
- Main needs
- Software usage
- Game usage
- Electricity condition
- MCB trip frequency
- Home power capacity
- UPS ownership
- Room temperature condition
- Silent PC preference
- Upgrade planning
- Priority selection

This allows the system to understand the user before generating any PC build.

---

### 3. AI Diagnosis System

Before recommending components, A.R.K.A.N.T.A. creates an AI diagnosis.

The diagnosis includes:

- User need summary
- Main use case
- Detected problems
- Electricity risk
- Thermal risk
- Workload risk
- Upgrade need
- Recommended build strategy
- Safety warnings
- Component priority suggestions

Example diagnosis:

> The user needs a gaming and editing PC with a medium budget, but the electricity condition is unstable. Therefore, the build should prioritize PSU quality, power efficiency, and UPS support instead of only maximizing GPU performance.

---

### 4. Multiple Build Recommendations

A.R.K.A.N.T.A. can generate multiple PC build paths, such as:

- Intel + NVIDIA balanced build
- AMD value build
- Safety-focused build
- Creator build
- Low-power build
- Performance-focused build

Each build includes:

- CPU
- GPU
- Motherboard
- RAM
- Storage
- PSU
- Case
- Cooler
- Optional UPS
- Estimated price
- Estimated wattage
- Performance score
- Value score
- Safety score
- Upgrade score
- Power efficiency score
- Pros
- Cons
- Warnings
- Upgrade path
- AI summary

---

### 5. Component Editor

Users can edit recommended components manually.

Editable components include:

- CPU
- GPU
- RAM
- Storage
- PSU
- Case
- Cooler
- UPS

After a component is changed, the system can analyze the impact of the change.

For example:

- Upgrading RAM from 8GB to 16GB
- Replacing an RTX GPU with a Radeon GPU
- Changing SSD capacity
- Downgrading PSU quality
- Adding UPS support
- Choosing a better airflow case

---

### 6. AI Impact Analysis

When users modify a build, A.R.K.A.N.T.A. explains the impact of the change.

The analysis includes:

- Positive impact
- Negative impact
- Price impact
- Performance impact
- Power impact
- Safety impact
- Compatibility warning
- Final recommendation

Example:

> Upgrading RAM from 16GB to 32GB is recommended for editing, multitasking, and long-term usage. The cost will increase, but the upgrade improves workflow stability and future readiness.

Another example:

> Downgrading the PSU is not recommended because the user has unstable electricity. Even if the wattage is still enough, lower PSU quality may reduce protection and long-term safety.

---

### 7. PSU and Electricity Advisor

One of the main strengths of A.R.K.A.N.T.A. is its power safety awareness.

The AI does not recommend a PSU only based on wattage. It also considers:

- PSU efficiency certification
- PSU protection features
- Power headroom
- GPU power requirement
- Electricity risk
- Daily usage
- Upgrade plan
- UPS recommendation

Supported PSU protection terms:

- OVP: Over Voltage Protection
- UVP: Under Voltage Protection
- OCP: Over Current Protection
- OPP: Over Power Protection
- SCP: Short Circuit Protection
- OTP: Over Temperature Protection

Important note:

> 80+ Bronze, Silver, Gold, or Platinum certification mainly indicates power efficiency. It does not automatically guarantee full PSU quality. A good PSU should also have reliable protection features, good internal quality, enough wattage headroom, and a trusted model reputation.

---

### 8. Build Comparison

Users can compare recommended builds side by side.

Comparison data includes:

- Total price
- CPU
- GPU
- RAM
- Storage
- PSU
- Estimated wattage
- Gaming score
- Editing score
- Value score
- Safety score
- Upgrade score
- Power efficiency
- Best use case
- Main weakness
- AI final recommendation

This helps users choose the best build based on their actual priority.

---

### 9. Admin Mode

The application also includes a simple admin mode.

Current admin features:

- View mock component database
- Add or edit components locally
- Manage build templates
- Generate sample recommendations
- Store changes in Zustand browser state

Note:

> The current admin mode does not use a database yet. Changes are stored only in the browser state through Zustand.

---

## Application Workflow

The general workflow of A.R.K.A.N.T.A. BUILDER is:


User opens the application
↓
User starts the builder wizard
↓
User enters budget, usage, software, electricity, thermal, and upgrade data
↓
AI analyzes user profile
↓
AI creates diagnosis and risk profile
↓
AI determines build strategy
↓
AI generates multiple PC build recommendations
↓
User reviews build cards
↓
User compares builds
↓
User edits components if needed
↓
AI explains the impact of each change
↓
User chooses the most suitable build

## User Goals

A.R.K.A.N.T.A. BUILDER is created to help users achieve the following goals:

- Build a PC that matches their real needs.
- Understand why each component is recommended.
- Avoid unbalanced PC builds.
- Avoid unsafe PSU choices.
- Consider electricity stability and UPS risks.
- Compare multiple build strategies.
- Understand future upgrade paths.
- Learn the trade-offs between components.
- Make more confident buying decisions.
- Build a PC that is powerful, safe, balanced, and future-ready.

---

## Target Users

A.R.K.A.N.T.A. BUILDER is suitable for a wide range of users, including:

- Gamers
- Video editors
- Graphic designers
- Programmers
- Streamers
- Students
- Office users
- Content creators
- AI and machine learning users
- Beginner PC builders
- Users with unstable electricity conditions
- Users who want long-term upgrade planning

---

## Technology Stack

A.R.K.A.N.T.A. BUILDER uses the following technologies:

- **Next.js App Router** — for building the main web application and routing structure.
- **TypeScript** — for safer and more maintainable code.
- **TailwindCSS** — for modern, responsive, and utility-first UI styling.
- **Zustand** — for lightweight global state management.
- **OpenRouter API** — for AI-powered diagnosis, recommendation, and explanation features.
- **Next.js API Routes** — for secure server-side communication with OpenRouter.
- **Local Mock Component Database** — for development, testing, and initial recommendation data.

---

## Why Next.js?

Next.js is used as the main framework because it provides a modern and scalable foundation for the application.

It supports:

- Modern React application structure
- App Router architecture
- Server-side API routes
- Better environment variable handling
- SPA-like user experience
- Scalable folder organization
- Secure OpenRouter API integration
- Better separation between frontend logic and server-side AI requests

In this project, Next.js allows A.R.K.A.N.T.A. BUILDER to deliver a smooth single-page application experience while still keeping sensitive AI API communication secure on the server side.

---

## Why Zustand?

Zustand is used for managing global application state in a simple and lightweight way.

The Zustand store handles:

- User intake answers
- AI diagnosis result
- Recommended builds
- Selected build
- Edited build
- Component database
- Comparison data
- Loading state
- Error state

Zustand keeps the application lightweight and easier to maintain without requiring a more complex state management system. It is especially suitable for this project because the builder workflow needs shared state across multiple pages and components, such as the intake wizard, recommendation results, comparison view, and component editor.

---

## Why OpenRouter?

OpenRouter is used as the AI provider gateway for powering the intelligent features inside A.R.K.A.N.T.A. BUILDER.

The application sends AI requests through Next.js API routes instead of calling the AI provider directly from the browser. This approach keeps the API key secure and prevents it from being exposed on the frontend.

AI features powered by OpenRouter include:

- User needs diagnosis
- PC build recommendation
- Component change analysis
- Trade-off explanation
- PSU and electricity safety recommendation
- Build comparison summary
- Upgrade path explanation
- Pros and cons generation
- Risk-based recommendation strategy

OpenRouter also makes the project more flexible because the AI model can be changed through environment variables without rewriting the core application logic.
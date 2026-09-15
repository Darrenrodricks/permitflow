# PermitFlow

A prototype Highway Work Permit workflow for the New York State Department of Transportation.

## Problem

Incomplete applications create repeated applicant/reviewer cycles. Missing documents and unclear technical details slow reviews and make the next step difficult to understand. PermitFlow focuses on reducing avoidable back-and-forth within one residential driveway workflow.

## Product hypothesis

Guided intake, pre-submission validation, and structured reviewer workflows can help increase first-review completeness and reduce review cycles. Readiness indicates administrative completeness, not technical approval: an application can be 100% ready to submit and still need an engineering clarification.

## Product decisions

- **Adaptive requirements:** Applicants should not need to interpret agency policy before starting. Project answers reveal the information and documents requested by this scoped workflow.
- **AI assists; staff decide:** Prepared extraction and summary findings illustrate how AI could reduce administrative work. NYSDOT retains technical review and approval authority.
- **Focused scope:** One residential driveway case tests intake, early issue detection, and structured review rather than recreating a statewide permitting system.

## Demo

A public deployment URL is not yet available. See the walkthrough below. Uploads and AI outputs use prepared fixtures; no real files are processed.

## What I built

- Guided residential driveway application with editable, seeded details
- Contextual contractor insurance requirements
- Document readiness, moving from 86% to 100% after the site plan is uploaded and its missing culvert diameter corrected
- AI-assisted administrative review and application summary
- Applicant status tracking
- Reviewer queue, search, and status filters
- Structured administrative, engineering, and drainage review
- Revision request and resubmission workflow
- Human-controlled permit approval and printable confirmation
- Operational dashboard with clearly labeled illustrative metrics
- Visible Applicant / NYSDOT Staff switcher
- Automatic browser-local draft and permit persistence, plus Reset Demo

## Deliberately out of scope

- Production authentication
- NY.gov / ADFS integration
- Payments
- Full PDF collaboration
- GIS integrations
- Full permit catalog
- Production AI infrastructure
- Production database/security architecture
- Real uploads, notifications, or legal permit issuance

## AI implementation

AI outputs in the prototype are deterministic fixtures for demo reliability. No model calls or external integrations are used. The simulated insurance review identifies administrative information; the application summary highlights review considerations. Neither approves an application.

A production implementation could combine model-based document extraction and summarization with deterministic rules and required human verification. It would need extraction evidence, confidence handling, auditability, and validation against agency requirements.

## Run locally

Use Node.js 22 LTS (`nvm use` reads the included `.nvmrc`).

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

```bash
npm test # Requires Node.js 22.6+ for TypeScript stripping
npm run typecheck
npm run build
npm start
```

The project uses Next.js App Router, TypeScript, Tailwind CSS 4, shadcn/ui source components backed by Radix Dialog/Slot, and Lucide icons. System fonts avoid a build-time font service dependency.

## Demo flow

1. Start in **Applicant → My Permits**. Select **Start a new permit**.
2. Choose **Residential driveway**, leave **Modify existing driveway** selected, and continue.
3. Walk through **Project → Applicant → Contractor**. Selecting a contractor reveals the insurance requirement.
4. In **Documents**, inspect the deterministic insurance analysis. The site plan starts missing.
5. Continue to **Review**: **86% ready**, six of seven requirements complete.
6. Select **Upload site plan** to simulate `Site-Plan-v1.pdf`. The prepared check flags a missing culvert diameter. Select **Upload corrected plan** to simulate correcting the plan with an 18-inch diameter. Readiness becomes **100%**.
7. Select **Submit to NYSDOT**. The permit is routed to Region 1.
8. Switch to **NYSDOT Staff**, then open **HWP-26-1842** in **Review Queue**.
9. Read the application summary, checklist, and document details. Select **Request revision → Send request** using the prepared culvert-material request (the diameter was already corrected before submission).
10. Switch to **Applicant**, select **View request**, and **Upload revised plan**. This simulates `Site-Plan-v2.pdf` confirming **reinforced concrete** as the material and retaining the **18-inch culvert diameter**.
11. Switch back to **NYSDOT Staff**, open the permit, inspect Revision 2, and select **Mark resolved**. In this scoped demo, this records technical verification and completes both engineering and drainage reviews.
12. Select **Approve permit**, inspect the confirmation, and open the operational dashboard.
13. Use **Reset Demo** in the footer and confirm to restore the initial draft before presenting again.

The primary record begins as a draft and only enters the staff queue after submission. Other permit records open read-only case details with project scope, next actions, document summaries, and activity. Only one live demo permit is supported; starting another application after submission leads to the existing record. Upload controls load prepared document summaries; they do not read real files. Dates and operational metrics are fixed for a consistent presentation.

## State and implementation

- `app/page.tsx`: persona navigation, dialogs, and local persistence
- `components/guided-application.tsx`: guided intake, validation cues, and step focus/scroll navigation
- `components/reviewer-workspace.tsx`: review checks, documents, and grouped expandable submitted record
- `components/presentation.tsx`: shared card, status, and heading components
- `app/globals.css`: navy/light public-sector visual theme, responsive layouts, print styles
- `app/layout.tsx`, `app/icon.svg`: metadata and application identity
- `components/ui/`: reusable shadcn/ui button and accessible Radix dialog primitives
- `lib/permit.ts`: typed Permit, Document, Review, RevisionRequest, readiness requirements, and guarded state transitions
- `data/fixtures.ts`: supporting queue rows and the revision message
- `tests/workflow.test.ts`: state-machine and readiness regression coverage

Permit state is stored under `permitflow-demo-v1` in localStorage. It is scoped to the browser and origin. Persona and page selection reset on refresh; the saved permit remains. Reset Demo resets the record and returns to the applicant dashboard. If browser storage is unavailable, the demo continues with in-memory state. Do not use real personal information in this prototype.

## Deploy to Vercel

1. Push this directory to a Git repository.
2. Import the repository into Vercel and select **Next.js**.
3. Select Node.js 22.x or newer supported LTS. Keep the standard `npm run build` command and default Next.js output settings.
4. Deploy. No environment variables, databases, or API keys are required.
5. Open the deployment, reset the demo, and rehearse the complete journey in the same browser.

Deployment does not synchronize records across users or browsers. Before a production pilot, validate requirements with NYSDOT, add secure persistence and authorization, and test real document workflows with agency reviewers.

## Review hardening

Final readiness and submission use shared validation, including applicant/contractor email, required fields, signature, and date order. Review links identify corrections without restricting step navigation. Submitted project values are locked, while the explicit revision workflow remains available. Staff can inspect exact submitted scope, contacts, and dates next to the deterministic summary.

Validation in this workspace: the default Turbopack build may fail with a local-worker port permission error even after elevation. `npm run build -- --webpack` is the supported fallback; verify the unchanged default command in an unrestricted terminal or Vercel before deployment.

## Adaptive requirements

Contractor and drainage answers drive the displayed requirements and submission guard. Site plans remain required for driveway work. A Yes drainage answer adds culvert dimensions and drainage review; Not sure flags the uncertainty for NYSDOT, while No does not trigger drainage-specific dimensions. Click the information icons for plain-language explanations.

For the primary scenario, uploading the initial plan leaves readiness at 86% until its missing diameter is corrected using the prepared sample action. The reviewer sees the recorded pre-submission correction. A later revision request addresses culvert material, avoiding a duplicate diameter request. Existing saved permits that did not use the correction retain the original diameter revision fixture. No real document parsing or AI calls occur.

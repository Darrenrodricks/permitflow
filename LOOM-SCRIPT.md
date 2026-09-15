# PermitFlow Loom script

Target: about 4 minutes. Reset Demo before recording. Keep the main story on HWP-26-1842.

## 0:00–0:25 · The problem

**Show:** Applicant dashboard, then Start a new permit → Residential driveway.

“Highway work permits can stall because applicants don’t know which requirements apply, and reviewers receive incomplete packages. PermitFlow turns those requirements into a guided workflow, helping applicants fix avoidable gaps before staff review.”

## 0:25–1:05 · Requirements adapt to the project

**Show:** Project step. Select drainage Not sure, then Yes. Continue through Applicant and Contractor.

“The applicant doesn’t need to make a technical determination. If they’re unsure about drainage, we flag that for staff. When they identify drainage work, the requirements update: a site plan, culvert dimensions, and drainage review. Contractor work also adds contractor information and insurance.”

## 1:05–2:00 · Catch an avoidable issue

**Show:** Documents → insurance findings, then Review at 86%. Upload site plan.

“The insurance check surfaces administrative findings for staff verification. These are prepared AI-assisted results in this prototype, not live document analysis.”

“Uploading a file alone isn’t enough. The prepared site-plan check identifies a missing culvert diameter and explains what the applicant needs to correct.”

**Click:** Upload corrected plan.

“For this prototype, I’m simulating the applicant correcting and re-uploading their plan. The app is not editing an engineering drawing. The required diameter is now present, so the application is 100% ready to submit. That means administrative readiness; NYSDOT still makes the technical and approval decisions.”

## 2:00–2:45 · A structured staff handoff

**Show:** Submit to NYSDOT → NYSDOT Staff → HWP-26-1842. Show summary and Pre-submission checks.

“Staff receive a structured package. They can see the applicant already resolved the missing diameter before submission. That is one potential return cycle caught upstream.”

**Click:** Request revision → Send request, using the prepared material clarification.

“Human review still matters. Here the reviewer asks for the culvert material, a different clarification from the diameter already supplied.”

## 2:45–3:30 · Close the loop

**Show:** Applicant → View request → Upload revised plan. Return to staff → HWP-26-1842 → review Revision 2 → Mark resolved → Approve permit.

“The applicant receives a specific request and submits a revised plan. Staff inspect the change, resolve the issue, and approve the permit. The decision remains with NYSDOT.”

## 3:30–3:50 · Operational value

**Show:** Operational dashboard, briefly.

“The workflow also creates data that could help teams measure turnaround and recurring issues. These dashboard metrics are illustrative, not measured outcomes. The product hypothesis is fewer avoidable returns and more reviewer time available for substantive review.”

## Recording notes

- Only HWP-26-1842 supports the complete interactive workflow. Other queue cases are read-only samples.
- Uploads and AI-assisted checks use deterministic fixtures; there is no live PDF parsing, backend, or authentication.
- Say “ready to submit,” never “AI approved.”
- Keep the dashboard to 15–20 seconds.
- If asked about production: validate requirements with NYSDOT, integrate document storage and agency systems, and evaluate extraction accuracy before relying on automated checks.

# PermitFlow

PermitFlow is a prototype Highway Work Permit workflow for the New York State Department of Transportation.

It was built around a simple product hypothesis:

> Applicants should not need to understand every NYSDOT requirement before starting an application. The system should translate project details into clear requirements, catch avoidable gaps before submission, and give NYSDOT staff a structured package for human review.

This prototype focuses specifically on the residential driveway permit journey.

---

## The problem

Highway Work Permit applicants may be homeowners, contractors, utilities, or other organizations performing work within the state highway right-of-way.

For infrequent applicants, it can be difficult to determine:

- which requirements apply to a specific project
- which supporting documents are required
- whether technical concepts such as drainage or culverts apply
- what information must appear in submitted plans
- what needs to happen after NYSDOT requests a revision

When required information is missing or unclear, the application may need to move back and forth between the applicant and NYSDOT before technical review can be completed.

NYSDOT’s own permit guidance identifies this kind of incomplete or insufficient submission as a source of delay. For commercial Highway Work Permits, NYSDOT says its guidance is intended to produce **better plan submissions, fewer requests for resubmission, and an overall faster review**. It also notes that plans lacking required information, or revisions that do not adequately address reviewer comments, may be returned for further revision.

The process can therefore create a repeated cycle:

**submission → NYSDOT review → comments or missing information → applicant revision → resubmission → NYSDOT re-review**

NYSDOT also identifies issues such as insufficient drawing detail, missing or outdated insurance, incomplete route information, and insufficient work descriptions as factors that can increase processing time.

PermitFlow focuses on reducing the avoidable portion of that cycle.

Instead of waiting for NYSDOT staff to discover basic completeness issues after submission, PermitFlow uses **guided requirements, pre-submission checks, and a structured review workflow** to help applicants understand what applies to their project and resolve obvious gaps before the application enters the review queue.

The goal is not to replace technical review. It is to help more applications arrive ready for a meaningful first review, while keeping documents, revisions, and reviewer requests organized when additional coordination is still necessary.

---

## Product hypothesis

The prototype focuses on one question:

> Can we improve first-review completeness by helping applicants understand what applies to their project and resolving avoidable issues before the application reaches NYSDOT staff?

Rather than attempting to reproduce the entire Highway Work Permit system, PermitFlow focuses on a single residential driveway workflow.

The goal is to provide:

- clearer requirements for applicants
- earlier identification of missing information
- clearer revision requests
- a structured package for NYSDOT reviewers
- visibility into what was resolved before submission
- continued human ownership of technical review and approval

---

## How the prototype evolved

The product changed as the underlying problem became clearer.

| Stage                            | Focus                                                  | What changed                                                                                                                                                                                                                  | Why it mattered                                                                                                 |
| -------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **1. Core journey**              | Connect applicant intake to staff review               | Built the applicant dashboard, guided application, document flow, submission readiness, reviewer queue, revision workflow, approval state, and operations dashboard                                                           | Established one complete permit journey from application through approval                                       |
| **2. Workflow reliability**      | Make the journey coherent and repeatable               | Added shared validation, guarded state transitions, locked submitted fields, browser persistence, accurate next actions, and a demo reset                                                                                     | Prevented impossible workflow states and made the prototype reliable to demonstrate                             |
| **3. Adaptive requirements**     | Help applicants understand what their project requires | Added contractor-dependent requirements, drainage Yes / No / Not sure states, contextual help, document requirements, missing culvert-diameter detection, and correction before submission                                    | Moved the product beyond checking whether a document exists to checking whether required information is present |
| **4. Structured review handoff** | Make the applicant-side improvement visible to staff   | Added staff visibility into pre-submission checks, a separate technical revision for culvert material, clearer staff and applicant language, disciplined AI-assisted review labels, and explicit submission-readiness wording | Connected applicant guidance to reviewer efficiency while preserving human technical judgment                   |

The key shift was from building a **better digital form** to building an **adaptive requirements workflow**.

PermitFlow does not expect the applicant to know NYSDOT policy in advance. Their answers progressively determine what information, documents, and reviews apply to the project.

---

## End-to-end workflow

The primary demo follows permit **HWP-26-1842**, a residential driveway modification.

1. The applicant starts a residential driveway application.
2. They describe the work and project location.
3. Their answers dynamically affect the application requirements.
   - Contractor work adds contractor information and insurance requirements.
   - A site plan is always required for driveway work. Drainage impact adds culvert-dimension and drainage-review requirements.
   - Applicants who are unsure whether drainage is affected can flag the question for NYSDOT rather than making a technical determination themselves.
4. The applicant enters their information and contractor details.
5. Supporting documents are added to the application.
6. A prepared document check flags that a proposed culvert diameter was not detected in the uploaded site plan.
7. The applicant uploads a corrected plan with the proposed **18-inch culvert diameter** before submitting. The prototype loads a prepared corrected document to demonstrate this step.
8. The application reaches **100% ready to submit**.
   - This represents administrative submission readiness, not technical approval.
9. The permit enters the NYSDOT review queue.
10. Staff review the application summary, submitted information, documents, and pre-submission checks.
11. The reviewer can see that the missing culvert diameter was resolved before the application reached NYSDOT.
12. During technical review, staff request a separate clarification: the proposed culvert material.
13. The applicant submits a revised plan confirming reinforced concrete while retaining the 18-inch diameter.
14. Staff review the revision, resolve the request, and approve the permit.
15. The workflow ends with an approval confirmation and an illustrative operations dashboard.

This distinction is intentional:

**PermitFlow aims to remove avoidable administrative back-and-forth, not replace technical review.**

---

## Adaptive requirements

One of the central product decisions was to avoid requiring applicants to understand government terminology and policy before they can begin.

For example:

### Contractor selected

If a contractor will perform the work, PermitFlow automatically adds:

- contractor information
- proof of insurance

### Drainage impact selected

A site plan is required for all driveway applications in this prototype. If the project affects drainage or a culvert, PermitFlow also requires:

- proposed culvert dimensions on the site plan
- drainage review

### Applicant is unsure

If the applicant does not know whether their project affects drainage, they can select **Not sure**.

PermitFlow carries that uncertainty forward for NYSDOT staff instead of forcing the applicant to make a technical determination.

Contextual explanations are also provided for unfamiliar concepts such as drainage, culverts, and insurance terminology.

---

## AI-assisted review

The proposed role of AI is to reduce administrative effort, not to make government decisions. This prototype demonstrates that role using prepared outputs rather than live model calls.

The prototype demonstrates AI-assisted workflows such as:

- extracting administrative information from an insurance document
- summarizing an application for a reviewer
- identifying potential review considerations
- flagging missing information in submitted materials

AI outputs are deterministic fixtures in the prototype so the demo remains reliable.

A production implementation could combine:

- model-based extraction
- deterministic agency rules
- source evidence
- confidence thresholds
- required human verification

NYSDOT staff would retain responsibility for technical review and final approval.

---

## What exists today

The prototype currently includes:

- one complete interactive permit journey: **HWP-26-1842**
- four read-only sample permit cases
- applicant and NYSDOT staff experiences
- adaptive permit requirements
- contextual guidance for unfamiliar terminology
- contractor insurance review
- pre-submission document checks
- applicant readiness tracking
- reviewer queue and application workspace
- revision requests and resubmission
- permit approval
- illustrative operations metrics
- deterministic demo data
- browser-local state persistence
- a resettable demo state

The prototype does **not** include:

- production authentication
- NY.gov or ADFS integration
- a production backend or database
- secure production document storage
- real PDF or image extraction
- live AI model calls
- payments or refunds
- GIS integrations
- collaborative PDF markup
- external NYSDOT integrations
- production permit issuance

The workflow has been tested locally through the complete applicant-to-approval journey. Workflow tests and TypeScript validation cover readiness, state transitions, and the revision workflow. Uploads and AI outputs use prepared fixtures; no real documents are processed.

---

## Product decisions and scope

A major goal of the project was deciding what **not** to build.

The full Highway Work Permit system involves significantly more functionality than this prototype attempts to reproduce.

Instead, the prototype focuses on the portion of the workflow most useful for testing the product hypothesis:

> Can better applicant guidance and pre-submission validation produce a more review-ready application?

Several major capabilities were intentionally left out, including production authentication, payments, agency integrations, GIS, full document collaboration, and production infrastructure.

Those capabilities are important to a complete implementation, but they are not necessary to evaluate the core workflow demonstrated here.

---

## How I would evaluate the product

Before claiming that PermitFlow improves the process, I would establish a baseline with NYSDOT and measure outcomes such as:

- percentage of applications complete on first review
- average number of applicant-reviewer cycles per permit
- median time from submission to approval
- time applications spend awaiting applicant action
- reviewer administrative handling time
- frequency and type of missing-information requests

The most important initial metric would likely be:

> **First-review completeness**

If more applications arrive with the information reviewers need, downstream cycle time should become easier to improve.


## Central product idea

PermitFlow is built around one principle:

> **Applicants describe their project. The system explains what applies, catches avoidable gaps early, and gives NYSDOT staff a structured submission while preserving human judgment for technical review and approval.**


## Links

**Source:**  
https://github.com/Darrenrodricks/permitflow


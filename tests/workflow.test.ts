import { strict as assert } from "node:assert";
import {
  initialPermit,
  type Permit,
  applicableRequirements,
  resolvePreSubmissionIssue,
  recommendedRevisionMessage,
  APPLICATION_STEPS,
  stepIsComplete,
  nextApplicantAction,
  formatPermitDate,
  requirements,
  transition,
  validateApplication,
  updateDraftField,
  timelineState,
} from "../lib/permit.ts";
let p = structuredClone(initialPermit);
assert.equal(requirements(p).filter((r) => r.done).length, 6);
assert.equal(
  transition(p, "submit").status,
  "draft",
  "Missing plan blocks submission",
);
assert.equal(transition(p, "approve").status, "draft", "Cannot skip review");
p = { ...p, sitePlan: true, preSubmissionIssueResolved: true };
assert.equal(requirements(p).filter((r) => r.done).length, 7);
p = transition(p, "submit");
assert.equal(p.status, "submitted");
assert.equal(transition(p, "approve").status, "submitted");
p = transition(p, "request");
assert.equal(p.status, "awaiting");
assert.ok(p.revision?.message.includes("culvert material"));
assert.equal(transition(p, "resolve").status, "awaiting");
p = transition(p, "revise");
assert.equal(p.status, "resubmitted");
p = transition(p, "resolve");
assert.equal(p.status, "resolved");
assert.equal(p.revision?.resolved, true);
p = transition(p, "approve");
assert.equal(p.status, "approved");
assert.equal(p.activity.length, 5);
assert.equal(
  transition(p, "approve").activity.length,
  5,
  "Duplicate approval is ignored",
);
const invalid = {
  ...initialPermit,
  sitePlan: true,
  preSubmissionIssueResolved: true,
  form: { ...initialPermit.form, end: "2026-01-01", signature: false },
};
assert.equal(requirements(invalid).filter((r) => r.done).length, 5);
const missingContractor = {
  ...initialPermit,
  form: { ...initialPermit.form, company: "" },
};
assert.equal(requirements(missingContractor)[1].done, false);
assert.equal(
  requirements({
    ...missingContractor,
    form: { ...missingContractor.form, performer: "self" },
  })[1].done,
  true,
);
assert.equal(initialPermit.status, "draft");
assert.equal(initialPermit.sitePlan, false);
console.log(
  "PASS: readiness, invalid dates, contractor requirements, full workflow, transition guards, reset fixture",
);

// Final validation cannot be bypassed by a step jump or persisted draft.
for (const key of ["email", "contractorEmail"] as const) {
  for (const value of ["not-an-email", "a@", "a b@example.com", ""]) {
    const invalidEmail = JSON.parse(
      JSON.stringify({
        ...initialPermit,
        sitePlan: true,
        preSubmissionIssueResolved: true,
        form: { ...initialPermit.form, [key]: value },
      }),
    );
    assert.ok(
      validateApplication(invalidEmail).some((issue) => issue.field === key),
    );
    assert.ok(requirements(invalidEmail).some((item) => !item.done));
    assert.equal(transition(invalidEmail, "submit").status, "draft");
  }
}
for (const status of [
  "submitted",
  "awaiting",
  "resubmitted",
  "resolved",
  "approved",
] as const) {
  const locked = { ...initialPermit, status };
  assert.equal(
    updateDraftField(locked, "driveway", "Create a new driveway"),
    locked,
  );
  assert.equal(updateDraftField(locked, "description", "Changed"), locked);
}
assert.equal(
  updateDraftField(
    structuredClone(initialPermit),
    "description",
    "Widen by 4 feet",
  ).form.description,
  "Widen by 4 feet",
);
let edited: Permit = {
  ...initialPermit,
  sitePlan: true,
  preSubmissionIssueResolved: true,
  form: {
    ...initialPermit.form,
    description:
      "Widen the driveway by 4 feet and replace the existing culvert",
    email: "updated@example.com",
    start: "2026-10-06",
  },
};
for (const action of [
  "submit",
  "request",
  "revise",
  "resolve",
  "approve",
] as const)
  edited = transition(edited, action);
assert.equal(
  edited.form.description,
  "Widen the driveway by 4 feet and replace the existing culvert",
);
assert.equal(edited.form.email, "updated@example.com");
assert.equal(edited.form.start, "2026-10-06");
assert.equal(timelineState("resubmitted", 3).done, true);
assert.equal(timelineState("resubmitted", 2).current, true);
assert.equal(timelineState("awaiting", 2).done, false);
console.log(
  "PASS: email validation after serialization, locked submitted fields, exact scope through approval, revision timeline",
);

const invalidReadiness = {
  ...initialPermit,
  sitePlan: true,
  preSubmissionIssueResolved: true,
  form: { ...initialPermit.form, email: "not-an-email" },
};
assert.equal(
  stepIsComplete(invalidReadiness, APPLICATION_STEPS.Applicant),
  false,
);
assert.equal(
  stepIsComplete(invalidReadiness, APPLICATION_STEPS.Documents),
  true,
);
assert.equal(stepIsComplete(invalidReadiness, APPLICATION_STEPS.Review), false);
assert.equal(
  nextApplicantAction(invalidReadiness),
  "Update your applicant email to continue.",
);
assert.equal(stepIsComplete(initialPermit, APPLICATION_STEPS.Documents), false);
assert.equal(
  nextApplicantAction(initialPermit),
  "One more step: upload your site plan to submit.",
);
assert.equal(
  nextApplicantAction({
    ...initialPermit,
    sitePlan: true,
    preSubmissionIssueResolved: true,
  }),
  "All requirements complete. Review and submit.",
);
assert.equal(formatPermitDate("2026-10-06"), "Oct 6, 2026");
assert.equal(initialPermit.form.start, "2026-10-05");
console.log(
  "PASS: consistent step validity and next-action copy, display-only date formatting",
);

let adaptive = {
  ...initialPermit,
  sitePlan: true,
  preSubmissionIssueResolved: false,
};
assert.equal(
  validateApplication(adaptive).some((i) => i.field === "culvertDimensions"),
  true,
);
assert.equal(requirements(adaptive).filter((i) => i.done).length, 6);
assert.equal(transition(adaptive, "submit").status, "draft");
const corrected = resolvePreSubmissionIssue(adaptive);
assert.equal(corrected.preSubmissionIssueResolved, true);
assert.equal(requirements(corrected).filter((i) => i.done).length, 7);
assert.equal(transition(corrected, "submit").status, "submitted");
assert.ok(recommendedRevisionMessage(corrected).includes("material"));
assert.ok(recommendedRevisionMessage(initialPermit).includes("diameter"));
assert.equal(resolvePreSubmissionIssue(initialPermit), initialPermit);
const noDrainage = {
  ...adaptive,
  form: { ...adaptive.form, drainage: "No", performer: "self" },
};
assert.deepEqual(applicableRequirements(noDrainage), {
  culvertDimensions: false,
  contractorInsurance: false,
  drainageReview: false,
});
assert.equal(validateApplication(noDrainage).length, 0);
const unsure = {
  ...noDrainage,
  form: { ...noDrainage.form, drainage: "Not sure" },
};
assert.equal(applicableRequirements(unsure).drainageReview, true);
assert.equal(applicableRequirements(unsure).culvertDimensions, false);
assert.equal(validateApplication(unsure).length, 0);
const lockedCorrection = { ...adaptive, status: "submitted" as const };
assert.equal(resolvePreSubmissionIssue(lockedCorrection), lockedCorrection);
assert.equal(
  resolvePreSubmissionIssue(JSON.parse(JSON.stringify(adaptive)))
    .preSubmissionIssueResolved,
  true,
);
console.log(
  "PASS: adaptive contractor/drainage/uncertainty rules, pre-submission correction, guarded persistence, distinct later revision",
);

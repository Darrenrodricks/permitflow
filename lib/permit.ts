export type PermitStatus =
  "draft" | "submitted" | "awaiting" | "resubmitted" | "resolved" | "approved";
export interface Document {
  name: string;
  version: number;
  uploadedBy: string;
  date: string;
  analysis: string;
}
export interface RevisionRequest {
  category: string;
  message: string;
  requestedBy: string;
  resolved: boolean;
}
export interface Review {
  administrative: boolean;
  engineering: "Required" | "In progress" | "Complete";
  drainage: "Required" | "Complete" | "Not triggered";
}
export interface Permit {
  id: string;
  status: PermitStatus;
  sitePlan: boolean;
  preSubmissionIssueResolved?: boolean;
  revision?: RevisionRequest;
  activity: string[];
  form: ApplicationForm;
}
export interface ApplicationForm {
  address: string;
  description: string;
  driveway: string;
  drainage: string;
  start: string;
  end: string;
  name: string;
  email: string;
  phone: string;
  owner: string;
  communication: string;
  performer: string;
  company: string;
  contact: string;
  contractorEmail: string;
  contractorPhone: string;
  signature: boolean;
}
export const initialPermit: Permit = {
  id: "HWP-26-1842",
  status: "draft",
  sitePlan: false,
  preSubmissionIssueResolved: false,
  activity: [],
  form: {
    address: "123 State Route 9, Albany, NY 12204",
    description:
      "Widen an existing residential driveway and replace the existing culvert beneath the driveway entrance.",
    driveway: "Modify existing driveway",
    drainage: "Yes",
    start: "2026-10-05",
    end: "2026-10-16",
    name: "Darren Rodricks",
    email: "darren.rodricks@example.com",
    phone: "(518) 555-0142",
    owner: "Yes",
    communication: "Email",
    performer: "contractor",
    company: "Hudson Valley Construction LLC",
    contact: "Michael Sullivan",
    contractorEmail: "michael@hudsonvalleyconstruction.example",
    contractorPhone: "(518) 555-0186",
    signature: true,
  },
};
export const statusLabels: Record<PermitStatus, string> = {
  draft: "Draft",
  submitted: "New",
  awaiting: "Awaiting Applicant",
  resubmitted: "Revision submitted",
  resolved: "Ready for Approval",
  approved: "Approved",
};
export const APPLICATION_STEPS = {
  Project: 0,
  Applicant: 1,
  Contractor: 2,
  Documents: 3,
  Review: 4,
} as const;
export type ApplicationStep =
  (typeof APPLICATION_STEPS)[keyof typeof APPLICATION_STEPS];
export const SUBMISSION_REQUIREMENTS = {
  Information: 0,
  Contractor: 1,
  Insurance: 2,
  InsuranceChecks: 3,
  SitePlan: 4,
  Dates: 5,
  Signature: 6,
} as const;
export type SubmissionRequirement =
  (typeof SUBMISSION_REQUIREMENTS)[keyof typeof SUBMISSION_REQUIREMENTS];
export interface ValidationIssue {
  field: keyof ApplicationForm | "sitePlan" | "culvertDimensions";
  step: ApplicationStep;
  requirement: SubmissionRequirement;
  message: string;
}
export function validateApplication(p: Permit): ValidationIssue[] {
  const f = p.form;
  const issues: ValidationIssue[] = [];
  const required = (
    field: keyof ApplicationForm,
    label: string,
    step: ApplicationStep,
    requirement: SubmissionRequirement,
  ) => {
    if (typeof f[field] !== "string" || !String(f[field]).trim())
      issues.push({
        field,
        step,
        requirement,
        message: `${label} is required.`,
      });
  };
  const email = (
    field: "email" | "contractorEmail",
    label: string,
    step: ApplicationStep,
    requirement: SubmissionRequirement,
  ) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f[field].trim()))
      issues.push({
        field,
        step,
        requirement,
        message: `Enter a valid ${label} email address.`,
      });
  };
  required(
    "address",
    "Property address",
    APPLICATION_STEPS.Project,
    SUBMISSION_REQUIREMENTS.Information,
  );
  required(
    "description",
    "Project description",
    APPLICATION_STEPS.Project,
    SUBMISSION_REQUIREMENTS.Information,
  );
  required(
    "driveway",
    "Driveway work",
    APPLICATION_STEPS.Project,
    SUBMISSION_REQUIREMENTS.Information,
  );
  required(
    "drainage",
    "Drainage impact",
    APPLICATION_STEPS.Project,
    SUBMISSION_REQUIREMENTS.Information,
  );
  required(
    "name",
    "Applicant name",
    APPLICATION_STEPS.Applicant,
    SUBMISSION_REQUIREMENTS.Information,
  );
  required(
    "phone",
    "Applicant phone",
    APPLICATION_STEPS.Applicant,
    SUBMISSION_REQUIREMENTS.Information,
  );
  required(
    "owner",
    "Property ownership",
    APPLICATION_STEPS.Applicant,
    SUBMISSION_REQUIREMENTS.Information,
  );
  required(
    "communication",
    "Preferred communication method",
    APPLICATION_STEPS.Applicant,
    SUBMISSION_REQUIREMENTS.Information,
  );
  email(
    "email",
    "applicant",
    APPLICATION_STEPS.Applicant,
    SUBMISSION_REQUIREMENTS.Information,
  );
  if (!["self", "contractor"].includes(f.performer))
    issues.push({
      field: "performer",
      step: APPLICATION_STEPS.Contractor,
      requirement: SUBMISSION_REQUIREMENTS.Contractor,
      message: "Select who will perform the work.",
    });
  if (f.performer === "contractor") {
    required(
      "company",
      "Contractor company",
      APPLICATION_STEPS.Contractor,
      SUBMISSION_REQUIREMENTS.Contractor,
    );
    required(
      "contact",
      "Contractor contact name",
      APPLICATION_STEPS.Contractor,
      SUBMISSION_REQUIREMENTS.Contractor,
    );
    required(
      "contractorPhone",
      "Contractor phone",
      APPLICATION_STEPS.Contractor,
      SUBMISSION_REQUIREMENTS.Contractor,
    );
    email(
      "contractorEmail",
      "contractor",
      APPLICATION_STEPS.Contractor,
      SUBMISSION_REQUIREMENTS.Contractor,
    );
  }
  const validDate = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
  if (!validDate(f.start))
    issues.push({
      field: "start",
      step: APPLICATION_STEPS.Project,
      requirement: SUBMISSION_REQUIREMENTS.Dates,
      message: "Provide a valid anticipated start date.",
    });
  if (!validDate(f.end))
    issues.push({
      field: "end",
      step: APPLICATION_STEPS.Project,
      requirement: SUBMISSION_REQUIREMENTS.Dates,
      message: "Provide a valid anticipated completion date.",
    });
  else if (validDate(f.start) && f.end < f.start)
    issues.push({
      field: "end",
      step: APPLICATION_STEPS.Project,
      requirement: SUBMISSION_REQUIREMENTS.Dates,
      message: "Completion date must be on or after the start date.",
    });
  if (!p.sitePlan)
    issues.push({
      field: "sitePlan",
      step: APPLICATION_STEPS.Documents,
      requirement: SUBMISSION_REQUIREMENTS.SitePlan,
      message: "Upload the required site plan.",
    });
  if (
    p.sitePlan &&
    applicableRequirements(p).culvertDimensions &&
    !p.preSubmissionIssueResolved
  )
    issues.push({
      field: "culvertDimensions",
      step: APPLICATION_STEPS.Documents,
      requirement: SUBMISSION_REQUIREMENTS.SitePlan,
      message:
        "Add the proposed culvert diameter to the site plan before submitting.",
    });
  if (!f.signature)
    issues.push({
      field: "signature",
      step: APPLICATION_STEPS.Review,
      requirement: SUBMISSION_REQUIREMENTS.Signature,
      message: "Confirm your electronic signature.",
    });
  return issues;
}
export function requirements(p: Permit) {
  const issues = validateApplication(p);
  return [
    "Required applicant information complete",
    "Contractor information complete",
    p.form.performer === "self"
      ? "Insurance not required for selected work arrangement"
      : "Insurance received",
    p.form.performer === "self"
      ? "Work arrangement confirmed"
      : "Insurance check: no issues detected",
    applicableRequirements(p).culvertDimensions
      ? "Site plan and required culvert dimensions complete"
      : "Site plan received",
    "Project dates provided",
    "Signature complete",
  ].map((label, index) => ({
    label,
    done: !issues.some((issue) => issue.requirement === index),
  }));
}
export function updateDraftField<K extends keyof ApplicationForm>(
  p: Permit,
  key: K,
  value: ApplicationForm[K],
): Permit {
  return p.status === "draft" ? { ...p, form: { ...p.form, [key]: value } } : p;
}
export function timelineState(status: PermitStatus, index: number) {
  const current =
    status === "approved"
      ? -1
      : status === "resolved"
        ? 4
        : status === "awaiting"
          ? 3
          : status === "resubmitted"
            ? 2
            : 1;
  const done =
    index === 0
      ? status !== "draft"
      : index === 1
        ? ["awaiting", "resubmitted", "resolved", "approved"].includes(status)
        : index === 2
          ? ["resolved", "approved"].includes(status)
          : index === 3
            ? ["resubmitted", "resolved", "approved"].includes(status)
            : status === "approved";
  return { done, current: index === current };
}
export type PermitAction =
  "submit" | "request" | "revise" | "resolve" | "approve";
export function transition(
  p: Permit,
  action: PermitAction,
  message?: string,
): Permit {
  const allowed: Record<PermitAction, boolean> = {
    submit: p.status === "draft" && validateApplication(p).length === 0,
    request: p.status === "submitted",
    revise: p.status === "awaiting",
    resolve: p.status === "resubmitted",
    approve: p.status === "resolved",
  };
  if (!allowed[action]) return p;
  const statuses: Record<PermitAction, PermitStatus> = {
    submit: "submitted",
    request: "awaiting",
    revise: "resubmitted",
    resolve: "resolved",
    approve: "approved",
  };
  const events = {
    submit: "Application submitted and routed to NYSDOT Region 1",
    request: "Revision requested by NYSDOT Permit Engineering",
    revise: p.preSubmissionIssueResolved
      ? "Revision 2 submitted by applicant — proposed culvert material confirmed"
      : "Revision 2 submitted by applicant — 18-inch proposed culvert identified",
    resolve: applicableRequirements(p).drainageReview
      ? "Revision resolved; engineering and drainage reviews completed"
      : "Revision resolved; engineering review completed",
    approve: "Permit approved by NYSDOT Region 1",
  };
  return {
    ...p,
    status: statuses[action],
    revision:
      action === "request"
        ? {
            category: "Site Plan",
            message: message || recommendedRevisionMessage(p),
            requestedBy: "Permit Engineering",
            resolved: false,
          }
        : action === "resolve" && p.revision
          ? { ...p.revision, resolved: true }
          : p.revision,
    activity: [events[action], ...p.activity],
  };
}

export function stepIsComplete(permit: Permit, step: number): boolean {
  const issues = validateApplication(permit);
  return step === APPLICATION_STEPS.Review
    ? issues.length === 0
    : !issues.some((issue) => issue.step === step);
}
export function nextApplicantAction(permit: Permit): string {
  const issue = validateApplication(permit)[0];
  if (!issue) return "All requirements complete. Review and submit.";
  if (issue.field === "email")
    return "Update your applicant email to continue.";
  if (issue.field === "contractorEmail")
    return "Update your contractor email to continue.";
  if (issue.field === "sitePlan")
    return "One more step: upload your site plan to submit.";
  return issue.message;
}
export function formatPermitDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)))
    return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function applicableRequirements(p: Permit) {
  return {
    contractorInsurance: p.form.performer === "contractor",
    culvertDimensions: p.form.drainage === "Yes",
    drainageReview: p.form.drainage !== "No",
  };
}
export function resolvePreSubmissionIssue(p: Permit): Permit {
  if (
    p.status !== "draft" ||
    !p.sitePlan ||
    !applicableRequirements(p).culvertDimensions ||
    p.preSubmissionIssueResolved
  )
    return p;
  return { ...p, preSubmissionIssueResolved: true };
}
export function recommendedRevisionMessage(p: Permit): string {
  return p.preSubmissionIssueResolved
    ? "Please confirm the proposed culvert material on the revised site plan."
    : "Please identify the proposed culvert diameter on the site plan.";
}
export function revisionChangeSummary(p: Permit): string {
  return p.preSubmissionIssueResolved
    ? "Updated site plan confirms reinforced concrete as the proposed culvert material. The 18-inch diameter is unchanged."
    : "Updated site plan includes proposed 18-inch culvert diameter.";
}

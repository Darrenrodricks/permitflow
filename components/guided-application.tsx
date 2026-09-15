"use client";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Upload,
  FileText,
  ShieldCheck,
  Info,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdaptiveRequirements,
  SitePlanCheck,
} from "@/components/adaptive-requirements";
import { TerminologyHelp } from "@/components/terminology-help";
import { Badge, Panel, CheckRow, title } from "@/components/presentation";
import {
  requirements,
  validateApplication,
  stepIsComplete,
  type Permit,
  type ApplicationForm,
  type PermitAction,
} from "@/lib/permit";
interface Props {
  permit: Permit;
  step: number;
  setStep: (step: number) => void;
  update: <K extends keyof ApplicationForm>(
    key: K,
    value: ApplicationForm[K],
  ) => void;
  field: (
    label: string,
    key: keyof ApplicationForm,
    type?: string,
    options?: string[],
  ) => ReactNode;
  upload: () => void;
  onResolvePlan: () => void;
  document: (name: string) => void;
  go: (view: "start" | "status") => void;
  act: (action: PermitAction) => void;
  setToast: (message: string) => void;
}
export function GuidedApplication({
  permit,
  step,
  setStep,
  update,
  field,
  upload,
  onResolvePlan,
  document,
  go,
  act,
  setToast,
}: Props) {
  const [error, setError] = useState("");
  const [navigation, setNavigation] = useState(0);
  const focusField = useRef<string | undefined>(undefined);
  const issues = validateApplication(permit);
  const ready = requirements(permit);
  const complete = ready.filter((item) => item.done).length;
  const isDraft = permit.status === "draft";
  function navigateStep(next: number, field?: string, message = "") {
    focusField.current = field;
    setError(message);
    setStep(next);
    setNavigation((value) => value + 1);
  }
  useLayoutEffect(() => {
    const heading = window.document.getElementById("application-step-heading");
    const target = focusField.current
      ? window.document.getElementById(`field-${focusField.current}`)
      : heading;
    target?.focus({ preventScroll: true });
    (focusField.current ? target : heading)?.scrollIntoView({
      block: "start",
      behavior: "instant",
    });
    focusField.current = undefined;
  }, [step, navigation]);
  function insurance() {
    return (
      <div className="analysis-card">
        <div className="section-label">
          <ShieldCheck size={19} />
          AI-assisted document review
        </div>
        <h3>Insurance findings</h3>
        <p>{permit.form.company}</p>
        <div className="insurance-checks">
          {[
            ["Named insured", "Identified"],
            ["Policy status", "Active"],
            ["Liability coverage", "Coverage identified"],
            ["NYSDOT additional insured", "NYSDOT listed"],
          ].map(([x, finding]) => (
            <div key={x}>
              <span className="inline-help">
                {x}
                {x === "NYSDOT additional insured" && (
                  <TerminologyHelp term="additionalInsured" />
                )}
              </span>
              <span className="passed">
                <Check size={15} />
                {finding}
              </span>
            </div>
          ))}
        </div>
        <div className="split small">
          <span>Expiration date</span>
          <strong>May 18, 2027</strong>
        </div>
        <div className="analysis-result">
          <CheckCircle2 size={17} />
          No administrative issues detected
        </div>
        <p className="fine-print">
          AI-assisted review extracts administrative information and flags
          potential issues for NYSDOT staff verification.
        </p>
      </div>
    );
  }
  return (
    <>
      {title(
        "HWP-26-1842 · DRAFT",
        "Residential Driveway Modification",
        "Complete your application before sending it to NYSDOT.",
        <Badge tone="blue">Draft saved on this device</Badge>,
      )}
      <div className="stepper">
        {["Project", "Applicant", "Contractor", "Documents", "Review"].map(
          (s, i) => (
            <button
              key={s}
              aria-current={i === step ? "step" : undefined}
              aria-label={s}
              onClick={() => navigateStep(i)}
              className={
                i === step
                  ? "current"
                  : stepIsComplete(permit, i)
                    ? "finished"
                    : ""
              }
            >
              <span>
                {i !== step && stepIsComplete(permit, i) ? (
                  <Check size={16} />
                ) : (
                  i + 1
                )}
              </span>
              {s}
            </button>
          ),
        )}
      </div>
      <div className="application-grid">
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step === 4) return;
              if (step === 0 && permit.form.end < permit.form.start) {
                navigateStep(
                  step,
                  "end",
                  "Completion date must be on or after the start date.",
                );
                return;
              }
              navigateStep(step + 1);
            }}
          >
            <Panel
              headingId="application-step-heading"
              title={
                [
                  "Tell us about your project",
                  "Applicant information",
                  "Who will perform the work?",
                  "Required documents",
                  "Application readiness",
                ][step]
              }
              subtitle={
                [
                  "Help the reviewer understand the location and scope of your work.",
                  "Your contact details will be included with your application.",
                  "Your work arrangement determines the documents you’ll need.",
                  "Review the required materials for your project.",
                  "Resolve any missing items, then submit your application.",
                ][step]
              }
            >
              <div className="panel-body">
                {step === 0 && (
                  <>
                    {field("Property address", "address")}
                    {field("Project description", "description")}
                    <div className="form-grid">
                      {field("Existing or new driveway", "driveway", "text", [
                        "Modify existing driveway",
                        "Create a new driveway",
                      ])}
                      {field(
                        "Does the work affect drainage or a culvert?",
                        "drainage",
                        "text",
                        ["Yes", "No", "Not sure"],
                      )}
                      {field("Anticipated start date", "start", "date")}
                      {field("Anticipated completion date", "end", "date")}
                    </div>
                    <AdaptiveRequirements permit={permit} source="drainage" />
                  </>
                )}
                {step === 1 && (
                  <>
                    {field("Name", "name")}
                    <div className="form-grid">
                      {field("Email", "email", "email")}
                      {field("Phone", "phone", "tel")}
                      {field("Are you the property owner?", "owner", "text", [
                        "Yes",
                        "No",
                      ])}
                      {field(
                        "Preferred communication method",
                        "communication",
                        "text",
                        ["Email", "Phone"],
                      )}
                    </div>
                  </>
                )}
                {step === 2 && (
                  <>
                    <div className="radio-options">
                      {[
                        ["self", "I will perform the work myself"],
                        ["contractor", "A contractor will perform the work"],
                      ].map(([value, label]) => (
                        <label key={value}>
                          <input
                            type="radio"
                            name="performer"
                            value={value}
                            checked={permit.form.performer === value}
                            onChange={() => update("performer", value)}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                    {permit.form.performer === "contractor" && (
                      <>
                        {field("Company", "company")}
                        <div className="form-grid">
                          {field("Contact name", "contact")}
                          {field("Email", "contractorEmail", "email")}
                          {field("Phone", "contractorPhone", "tel")}
                        </div>
                      </>
                    )}
                    <AdaptiveRequirements permit={permit} source="contractor" />
                  </>
                )}
                {step === 3 && (
                  <>
                    <div className="document-upload">
                      <div className="doc-icon">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h3>
                          Site Plan <span className="required">Required</span>
                        </h3>
                        <p>
                          {permit.sitePlan
                            ? "Site-Plan-v1.pdf"
                            : "Driveway dimensions and affected drainage infrastructure."}
                        </p>
                        <Badge tone={permit.sitePlan ? "green" : "amber"}>
                          {permit.sitePlan ? "Received" : "Missing"}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          permit.sitePlan
                            ? document("Site-Plan-v1.pdf")
                            : upload()
                        }
                      >
                        {permit.sitePlan ? (
                          "View details"
                        ) : (
                          <>
                            <Upload size={16} />
                            Upload site plan
                          </>
                        )}
                      </Button>
                    </div>
                    <SitePlanCheck permit={permit} onResolve={onResolvePlan} />
                    {permit.form.performer === "contractor" && (
                      <>
                        <div className="document-upload">
                          <div className="doc-icon">
                            <FileText size={24} />
                          </div>
                          <div>
                            <h3>Contractor Insurance</h3>
                            <p>
                              Required because a contractor is performing the
                              work.
                            </p>
                            <p>Hudson-Valley-Construction-COI.pdf</p>
                            <Badge tone="green">Received</Badge>
                          </div>
                        </div>
                        {insurance()}
                      </>
                    )}
                  </>
                )}
                {step === 4 && (
                  <>
                    <div className="readiness-hero">
                      <div
                        className={`readiness-ring ${complete === 7 ? "ready" : ""}`}
                        style={
                          {
                            "--progress": `${(complete / 7) * 100}%`,
                          } as React.CSSProperties
                        }
                      >
                        <strong>
                          {Math.round((complete / 7) * 100)}
                          <span>%</span>
                        </strong>
                      </div>
                      <div>
                        <h2>
                          {Math.round((complete / 7) * 100)}% ready to submit
                        </h2>
                        <p>{complete} of 7 submission requirements complete</p>
                        <p className="fine-print">
                          {complete === 7
                            ? "Required application information and documents are present. "
                            : "This score measures application completeness. "}
                          NYSDOT technical review is still required.
                        </p>
                        <Badge tone={complete === 7 ? "green" : "amber"}>
                          {complete === 7
                            ? "Ready to submit"
                            : "Action required"}
                        </Badge>
                      </div>
                    </div>
                    {!permit.sitePlan && (
                      <div className="alert amber">
                        <AlertCircle size={21} />
                        <div>
                          <strong>Site plan missing</strong>
                          <p>
                            Upload a site plan showing the proposed driveway
                            dimensions and affected drainage infrastructure.
                          </p>
                          <Button type="button" onClick={() => upload()}>
                            <Upload size={16} />
                            Upload site plan
                          </Button>
                        </div>
                      </div>
                    )}
                    {permit.sitePlan && (
                      <SitePlanCheck
                        permit={permit}
                        onResolve={onResolvePlan}
                      />
                    )}
                    {issues.filter(
                      (issue) =>
                        issue.field !== "sitePlan" &&
                        issue.field !== "culvertDimensions",
                    ).length > 0 && (
                      <div className="validation-errors" role="alert">
                        <h3>Complete these items before submitting</h3>
                        {issues
                          .filter(
                            (issue) =>
                              issue.field !== "sitePlan" &&
                              issue.field !== "culvertDimensions",
                          )
                          .map((issue) => (
                            <div key={issue.field}>
                              <span>{issue.message}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  navigateStep(
                                    issue.step,
                                    issue.field,
                                    issue.message,
                                  );
                                }}
                              >
                                Fix{" "}
                                {issue.field === "contractorEmail"
                                  ? "contractor email"
                                  : issue.field === "email"
                                    ? "applicant email"
                                    : "item"}
                                <ArrowRight size={14} />
                              </Button>
                            </div>
                          ))}
                      </div>
                    )}
                    <div className="readiness-list">
                      {ready.map((r) => (
                        <CheckRow key={r.label} done={r.done}>
                          {r.label}
                        </CheckRow>
                      ))}
                    </div>
                    <label className="signature">
                      <input
                        id="field-signature"
                        type="checkbox"
                        checked={permit.form.signature}
                        onChange={(e) => update("signature", e.target.checked)}
                      />
                      <span>
                        I certify that the information in this application is
                        accurate.
                        <small>Electronic signature: {permit.form.name}</small>
                      </span>
                    </label>
                  </>
                )}
                {error && (
                  <p role="alert" className="error">
                    {error}
                  </p>
                )}
              </div>
              <div className="form-footer">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    step === 0 ? go("start") : navigateStep(step - 1)
                  }
                >
                  <ArrowLeft size={16} />
                  Back
                </Button>
                <span className="small muted">Step {step + 1} of 5</span>
                {step < 4 ? (
                  <Button type="submit">
                    Continue
                    <ArrowRight size={16} />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={complete !== 7 || !isDraft}
                    onClick={() => {
                      if (validateApplication(permit).length) {
                        setError("Resolve the listed items before submitting.");
                        return;
                      }
                      act("submit");
                      go("status");
                      setToast("Application submitted");
                    }}
                  >
                    Submit to NYSDOT
                    <ArrowRight size={16} />
                  </Button>
                )}
              </div>
            </Panel>
          </form>
        </div>
        <aside className="right-column">
          <div className="help-card">
            <h3>Your application</h3>
            <dl className="detail-list">
              <dt>Permit number</dt>
              <dd>HWP-26-1842</dd>
              <dt>Permit type</dt>
              <dd>Residential Driveway Modification</dd>
              <dt>Assigned region</dt>
              <dd>Region 1 · Capital District</dd>
            </dl>
            <div className="mini-rule" />
            <div className="split small">
              <span>Submission readiness</span>
              <strong>{Math.round((complete / 7) * 100)}%</strong>
            </div>
            <div className="progress">
              <span style={{ width: `${(complete / 7) * 100}%` }} />
            </div>
            <p className="fine-print">
              Your progress is saved automatically on this device.
            </p>
          </div>
          <div className="support-card">
            <ShieldCheck size={22} />
            <div>
              <h4>Reviewed by people</h4>
              <p>
                Administrative checks help prepare your application. NYSDOT
                staff make all review and approval decisions.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

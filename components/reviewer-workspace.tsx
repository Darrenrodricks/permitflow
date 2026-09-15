"use client";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  CircleDot,
  UserRound,
  Route,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Panel, CheckRow, title } from "@/components/presentation";
import {
  statusLabels,
  applicableRequirements,
  revisionChangeSummary,
  formatPermitDate,
  type Permit,
  type Document,
  type Review,
  type PermitAction,
} from "@/lib/permit";
interface Props {
  permit: Permit;
  documents: Document[];
  review: Review;
  revised: boolean;
  go: (view: "queue" | "approval") => void;
  act: (action: PermitAction) => void;
  document: (name: string) => void;
  onRequestRevision: () => void;
  setToast: (message: string) => void;
}
export function ReviewerWorkspace({
  permit,
  documents,
  review,
  revised,
  go,
  act,
  document,
  onRequestRevision,
  setToast,
}: Props) {
  return (
    <>
      <button className="back-link" onClick={() => go("queue")}>
        <ArrowLeft size={15} />
        Back to review queue
      </button>
      <div className="reviewer-action-header">
        {title(
          "RESIDENTIAL DRIVEWAY MODIFICATION",
          "HWP-26-1842",
          permit.status === "submitted"
            ? "Ready for administrative review"
            : statusLabels[permit.status],
          <div className="heading-actions">
            {permit.status === "submitted" && (
              <Button
                variant="outline"
                onClick={() => {
                  onRequestRevision();
                }}
              >
                Request revision
              </Button>
            )}
            {permit.status === "approved" ? (
              <Button onClick={() => go("approval")}>
                View permit
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                disabled={permit.status !== "resolved"}
                onClick={() => {
                  act("approve");
                  go("approval");
                }}
              >
                <Check size={16} />
                Approve permit
              </Button>
            )}
          </div>,
        )}
      </div>
      <div className="info-cards">
        {[
          ["Applicant", permit.form.name],
          ["Location", permit.form.address],
          ["Work type", permit.form.driveway],
          ["Assigned region", "Region 1 · Capital District"],
        ].map(([k, v]) => (
          <div key={k}>
            <span>{k}</span>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
      {permit.status === "awaiting" && (
        <div className="alert amber">
          <Clock3 size={21} />
          <div>
            <strong>Awaiting Applicant</strong>
            <p>{permit.revision?.message}</p>
          </div>
          <Badge tone="amber">Revision 1 requested</Badge>
        </div>
      )}
      {permit.status === "resubmitted" && (
        <div className="revision-panel">
          <div className="split">
            <div>
              <div className="section-label">
                <CheckCircle2 size={17} />1 requested item addressed
              </div>
              <h2>Applicant submitted Revision 2</h2>
            </div>
            <Button
              onClick={() => {
                act("resolve");
                setToast("Revision resolved. Permit ready for approval.");
              }}
            >
              <Check size={16} />
              Mark resolved
            </Button>
          </div>
          <button
            className="text-link"
            onClick={() => document("Site-Plan-v2.pdf")}
          >
            <FileText size={17} />
            Site-Plan-v2.pdf
          </button>
          <p>
            <strong>Change summary:</strong> {revisionChangeSummary(permit)}
          </p>
          <p className="fine-print">
            Marking resolved records your verification and completes the
            required technical reviews.
          </p>
        </div>
      )}
      {permit.status === "resolved" && (
        <div className="alert success">
          <CheckCircle2 size={21} />
          <div>
            <strong>All review items resolved</strong>
            <p>
              Required technical reviews are complete. This permit is ready for
              your approval.
            </p>
          </div>
        </div>
      )}
      <div className="review-grid">
        <div>
          <Panel
            title="Application summary"
            extra={<span className="ai-label">AI-assisted review</span>}
          >
            <div className="panel-body">
              <p className="summary-text">
                {permit.form.description} Work will be completed by{" "}
                {permit.form.performer === "contractor"
                  ? permit.form.company
                  : "the applicant"}
                . Required applicant{" "}
                {permit.form.performer === "contractor"
                  ? "and contractor information is present. Insurance documentation was received and no administrative issues were detected."
                  : "information is present."}{" "}
                {permit.form.drainage === "Not sure"
                  ? "The applicant flagged uncertain drainage impact for NYSDOT verification."
                  : permit.form.drainage === "Yes"
                    ? "Because the project affects drainage infrastructure, engineering review is recommended."
                    : "Engineering review is recommended to verify the proposed access modifications."}
              </p>
              <h4>Potential review considerations</h4>
              <div className="considerations">
                {(permit.form.drainage === "Yes"
                  ? [
                      "Drainage impact identified",
                      "Culvert replacement proposed",
                      "Engineering review recommended",
                    ]
                  : [
                      "Driveway modification proposed",
                      "Engineering review recommended",
                    ]
                ).map((x) => (
                  <span key={x}>
                    <CircleDot size={14} />
                    {x}
                  </span>
                ))}
              </div>
              <p className="fine-print disclaimer">
                <Info size={15} />
                AI-generated summary. Verify against submitted materials before
                making a decision.
              </p>
            </div>
          </Panel>
          <Panel
            title="Review checklist"
            subtitle="Administrative completeness and required technical review."
          >
            <div className="panel-body">
              <div className="split">
                <h4>Administrative review</h4>
                <Badge tone="green">Complete</Badge>
              </div>
              <div className="checklist-grid">
                {[
                  "Applicant identity",
                  "Property location",
                  "Project description",
                  permit.form.performer === "contractor"
                    ? "Contractor details"
                    : "Work arrangement",
                  permit.form.performer === "contractor"
                    ? "Insurance documentation"
                    : "Insurance not required",
                  "Site plan",
                  "Proposed dates",
                  "Signature",
                ].map((x) => (
                  <CheckRow key={x}>{x}</CheckRow>
                ))}
              </div>
              <div className="mini-rule" />
              <h4>Required technical review</h4>
              <div className="technical-row">
                <span>
                  <UserRound size={17} />
                  Permit Engineering
                </span>
                <Badge
                  tone={review.engineering === "Complete" ? "green" : "blue"}
                >
                  {review.engineering}
                </Badge>
              </div>
              <div className="technical-row">
                <span>
                  <Route size={17} />
                  Drainage Review
                </span>
                <Badge
                  tone={
                    review.drainage === "Complete"
                      ? "green"
                      : review.drainage === "Not triggered"
                        ? "neutral"
                        : "amber"
                  }
                >
                  {review.drainage}
                </Badge>
              </div>
            </div>
          </Panel>
          <details className="submitted-record panel">
            <summary>
              <span>
                <strong>Submitted application details</strong>
                <small>Exact project, applicant, and contractor values</small>
              </span>
              <ChevronDown size={18} />
            </summary>
            <div className="panel-body">
              {[
                {
                  name: "Project",
                  values: [
                    ["Property address", permit.form.address],
                    ["Project description", permit.form.description],
                    ["Driveway work", permit.form.driveway],
                    ["Drainage or culvert impact", permit.form.drainage],
                    [
                      "Anticipated start date",
                      formatPermitDate(permit.form.start),
                    ],
                    [
                      "Anticipated completion date",
                      formatPermitDate(permit.form.end),
                    ],
                  ],
                },
                {
                  name: "Applicant",
                  values: [
                    ["Applicant name", permit.form.name],
                    ["Applicant email", permit.form.email],
                    ["Applicant phone", permit.form.phone],
                    ["Property owner", permit.form.owner],
                    ["Preferred communication", permit.form.communication],
                    [
                      "Electronic signature",
                      permit.form.signature ? permit.form.name : "Not provided",
                    ],
                  ],
                },
                {
                  name: "Contractor",
                  values: [
                    [
                      "Work performed by",
                      permit.form.performer === "self"
                        ? "Applicant"
                        : permit.form.company,
                    ],
                    ...(permit.form.performer === "contractor"
                      ? [
                          ["Contractor contact", permit.form.contact],
                          ["Contractor email", permit.form.contractorEmail],
                          ["Contractor phone", permit.form.contractorPhone],
                        ]
                      : []),
                  ],
                },
              ].map((group) => (
                <section className="record-group" key={group.name}>
                  <h3>{group.name}</h3>
                  <dl className="submitted-details">
                    {group.values.map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </details>
        </div>
        <aside className="right-column">
          <Panel title="Pre-submission checks">
            <div className="panel-body pre-submission-checks">
              <CheckRow>Required applicant information complete</CheckRow>
              <CheckRow>
                {applicableRequirements(permit).contractorInsurance
                  ? "Contractor insurance received"
                  : "Applicant performing the work"}
              </CheckRow>
              <CheckRow>
                {permit.form.drainage === "Yes"
                  ? "Drainage impact identified"
                  : permit.form.drainage === "Not sure"
                    ? "Drainage uncertainty flagged for staff"
                    : "No drainage impact reported"}
              </CheckRow>
              <CheckRow>Site plan received</CheckRow>
              {permit.preSubmissionIssueResolved && (
                <>
                  <CheckRow>Applicant resolved 1 pre-submission issue</CheckRow>
                  <p className="resolved-before-submission">
                    <strong>Resolved before submission:</strong> Proposed
                    culvert diameter added to site plan — 18 inches.
                  </p>
                </>
              )}
              <p className="fine-print">
                AI-assisted review. Verify against submitted materials before
                making a decision.
              </p>
            </div>
          </Panel>
          <Panel
            title="Documents"
            extra={<span className="count">{documents.length}</span>}
          >
            <div className="panel-body">
              {documents.map((d) => (
                <div className="review-document" key={d.name}>
                  <button
                    className="document-link"
                    onClick={() => document(d.name)}
                  >
                    <span className="doc-icon">
                      <FileText size={22} />
                    </span>
                    <span>
                      {d.name}
                      <small>
                        Version {d.version} · {d.date}
                      </small>
                    </span>
                  </button>
                  <p>Uploaded by {d.uploadedBy}</p>
                  <span className="passed small">
                    <CheckCircle2 size={14} />
                    {d.analysis}
                  </span>
                </div>
              ))}
              {revised && (
                <button
                  className="text-link small"
                  onClick={() => document("Site-Plan-v1.pdf")}
                >
                  View previous version
                </button>
              )}
            </div>
          </Panel>
          <Panel title="Activity log">
            <div className="activity-list">
              {permit.activity.map((a, i) => (
                <div key={a}>
                  <span className="activity-dot" />
                  <div>
                    <p>{a}</p>
                    <small>
                      Sep 15, 2026 · {i === 0 ? "Latest update" : "Earlier"}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </>
  );
}

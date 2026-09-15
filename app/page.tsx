"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  LayoutDashboard,
  Files,
  CircleHelp,
  RotateCcw,
  MapPin,
  ChevronRight,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Upload,
  ShieldCheck,
  Info,
  AlertCircle,
  Building2,
  Route,
  ClipboardList,
  Search,
  Download,
  UserRound,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  initialPermit,
  applicableRequirements,
  resolvePreSubmissionIssue,
  recommendedRevisionMessage,
  revisionChangeSummary,
  nextApplicantAction,
  updateDraftField,
  timelineState,
  requirements,
  transition,
  statusLabels,
  type Permit,
  type ApplicationForm,
  type PermitAction,
  type Document,
  type Review,
} from "@/lib/permit";
import { TerminologyHelp } from "@/components/terminology-help";
import { QueueCase } from "@/components/queue-case";
import { GuidedApplication } from "@/components/guided-application";
import { ReviewerWorkspace } from "@/components/reviewer-workspace";
import { Badge, Panel, CheckRow, title } from "@/components/presentation";
import { queue, revisionMessage } from "@/data/fixtures";
const STORAGE = "permitflow-demo-v1";
type View =
  | "home"
  | "start"
  | "application"
  | "status"
  | "queue"
  | "case"
  | "reviewer"
  | "dashboard"
  | "help"
  | "approval";
export default function PermitFlow() {
  const [permit, setPermit] = useState<Permit>(initialPermit);
  const [loaded, setLoaded] = useState(false);
  const [persona, setPersona] = useState<"applicant" | "staff">("applicant");
  const [view, setView] = useState<View>("home");
  const [selectedCase, setSelectedCase] = useState("");
  const [step, setStep] = useState(0);
  const [startChoice, setStartChoice] = useState(false);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<"revision" | "reset" | "document" | null>(
    null,
  );
  const [message, setMessage] = useState(revisionMessage);
  const [doc, setDoc] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const saved = JSON.parse(raw);
        if (
          saved.id === initialPermit.id &&
          saved.status in statusLabels &&
          Array.isArray(saved.activity) &&
          saved.form
        )
          setPermit({
            ...initialPermit,
            ...saved,
            form: { ...initialPermit.form, ...saved.form },
          });
      }
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE, JSON.stringify(permit));
      } catch {}
    }
  }, [permit, loaded]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  function go(v: View) {
    setView(v === "start" && permit.status !== "draft" ? "status" : v);
    setToast("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function update<K extends keyof ApplicationForm>(
    key: K,
    value: ApplicationForm[K],
  ) {
    setPermit((p) => updateDraftField(p, key, value));
  }
  function act(action: PermitAction) {
    setPermit((p) => transition(p, action, message));
  }
  function openCase(id: string) {
    if (id === permit.id) go("reviewer");
    else {
      setSelectedCase(id);
      go("case");
    }
  }
  function switchPersona(p: "applicant" | "staff") {
    setPersona(p);
    go(p === "applicant" ? "home" : "queue");
  }
  const ready = requirements(permit);
  const complete = ready.filter((r) => r.done).length;
  const isDraft = permit.status === "draft";
  const revised = ["resubmitted", "resolved", "approved"].includes(
    permit.status,
  );
  const staff = persona === "staff";
  function field(
    label: string,
    key: keyof ApplicationForm,
    type = "text",
    options?: string[],
  ) {
    return (
      <div key={key} className="field">
        <div className="field-label">
          <label htmlFor={`field-${key}`}>{label}</label>
          {key === "drainage" && <TerminologyHelp term="drainage" />}
        </div>
        {options ? (
          <select
            id={`field-${key}`}
            value={String(permit.form[key])}
            onChange={(e) => update(key, e.target.value)}
          >
            {options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ) : key === "description" ? (
          <textarea
            required
            id={`field-${key}`}
            value={String(permit.form[key])}
            onChange={(e) => update(key, e.target.value)}
            rows={4}
          />
        ) : (
          <input
            required
            type={type}
            onInput={
              type === "date"
                ? (e) => update(key, e.currentTarget.value)
                : undefined
            }
            id={`field-${key}`}
            value={String(permit.form[key])}
            onChange={(e) => update(key, e.target.value)}
          />
        )}
      </div>
    );
  }
  function upload(revision = false) {
    if (revision) {
      act("revise");
      setToast("Revision submitted to NYSDOT");
    } else {
      setPermit((p) => ({ ...p, sitePlan: true }));
      setToast("Site-Plan-v1.pdf uploaded. Readiness updated.");
    }
  }
  function document(name: string) {
    setDoc(name);
    setModal("document");
  }
  function statusTone() {
    return permit.status === "approved"
      ? "green"
      : permit.status === "awaiting"
        ? "amber"
        : isDraft
          ? "neutral"
          : "blue";
  }
  const nav = staff
    ? [
        { v: "queue" as View, label: "Review Queue", icon: ClipboardList },
        { v: "dashboard" as View, label: "Dashboard", icon: LayoutDashboard },
      ]
    : [
        { v: "home" as View, label: "My Permits", icon: Files },
        { v: "start" as View, label: "Start Permit", icon: Plus },
        { v: "help" as View, label: "Help", icon: CircleHelp },
      ];
  const documents: Document[] = [
    {
      name: revised ? "Site-Plan-v2.pdf" : "Site-Plan-v1.pdf",
      version: revised ? 2 : 1,
      uploadedBy: permit.form.name,
      date: "Sep 15, 2026",
      analysis: revised ? "Revision received" : "Received",
    },
    ...(permit.form.performer === "contractor"
      ? [
          {
            name: "Hudson-Valley-Construction-COI.pdf",
            version: 1,
            uploadedBy: permit.form.name,
            date: "Sep 14, 2026",
            analysis: "No administrative issues detected",
          },
        ]
      : []),
  ];
  const review: Review = {
    administrative: !isDraft,
    engineering:
      permit.status === "resolved" || permit.status === "approved"
        ? "Complete"
        : "In progress",
    drainage: !applicableRequirements(permit).drainageReview
      ? "Not triggered"
      : permit.status === "resolved" || permit.status === "approved"
        ? "Complete"
        : "Required",
  };
  if (!loaded)
    return (
      <main className="loading-state" role="status" aria-live="polite">
        <Route size={28} />
        <h1>PermitFlow</h1>
        <p>Loading your saved permit…</p>
      </main>
    );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go(staff ? "queue" : "home");
          }}
        >
          <span className="brand-icon">
            <Route size={25} />
          </span>
          <span>
            PermitFlow<span className="brand-sub">HIGHWAY WORK PERMITS</span>
          </span>
        </a>
        <div className="workspace-label">
          {staff ? "NYSDOT WORKSPACE" : "APPLICANT WORKSPACE"}
        </div>
        <nav>
          {nav.map((n) => (
            <button
              key={n.v}
              className={`nav-item ${view === n.v || (n.v === "home" && ["status", "approval"].includes(view)) || (n.v === "start" && view === "application") || (n.v === "queue" && ["reviewer", "case"].includes(view)) ? "active" : ""}`}
              onClick={() => {
                if (n.v === "start") setStartChoice(false);
                go(n.v);
              }}
            >
              <n.icon size={19} />
              {n.label}
              {n.v === "queue" && (
                <span className="nav-count">{isDraft ? 4 : 5}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="agency">
            <Building2 size={20} />
            <div>
              New York State<span>Department of Transportation</span>
            </div>
          </div>
          <div className="sidebar-rule" />
          <div className="profile">
            <span className="avatar">{staff ? "PE" : "DR"}</span>
            <div>
              {staff ? "Permit Engineering" : "Darren Rodricks"}
              <span>{staff ? "Region 1 · NYSDOT" : "Applicant"}</span>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            NYSDOT
            <ChevronRight size={14} />
            <span>Highway Work Permits</span>
          </div>
          <div className="top-actions">
            <span className="prototype">PROTOTYPE</span>
            <div className="persona" aria-label="Switch persona">
              <button
                aria-pressed={!staff}
                className={!staff ? "selected" : ""}
                onClick={() => switchPersona("applicant")}
              >
                <UserRound size={14} />
                Applicant
              </button>
              <button
                aria-pressed={staff}
                className={staff ? "selected" : ""}
                onClick={() => switchPersona("staff")}
              >
                <Building2 size={14} />
                NYSDOT Staff
              </button>
            </div>
          </div>
        </header>
        <main id="main-content">
          {view === "home" && (
            <>
              {title(
                "APPLICANT PORTAL",
                "Highway Work Permits",
                "Manage your applications and keep your projects moving.",
                <Button
                  onClick={() => {
                    setStartChoice(false);
                    go("start");
                  }}
                >
                  <Plus size={17} />
                  Start a new permit
                </Button>,
              )}
              <div className="summary-strip">
                <div>
                  <span className="stat-icon">
                    <Files size={21} />
                  </span>
                  <div>
                    <strong>3</strong>
                    <span>Total permits</span>
                  </div>
                </div>
                <div>
                  <span className="stat-icon blue-icon">
                    <Clock3 size={21} />
                  </span>
                  <div>
                    <strong>{permit.status === "approved" ? 0 : 1}</strong>
                    <span>In progress</span>
                  </div>
                </div>
                <div>
                  <span className="stat-icon amber-icon">
                    <AlertCircle size={21} />
                  </span>
                  <div>
                    <strong>
                      {isDraft || permit.status === "awaiting" ? 1 : 0}
                    </strong>
                    <span>Needs your attention</span>
                  </div>
                </div>
                <div>
                  <span className="stat-icon green-icon">
                    <CheckCircle2 size={21} />
                  </span>
                  <div>
                    <strong>{permit.status === "approved" ? 3 : 2}</strong>
                    <span>Approved</span>
                  </div>
                </div>
              </div>
              {permit.status === "awaiting" && (
                <div className="alert amber">
                  <AlertCircle size={20} />
                  <div>
                    <strong>NYSDOT requested a revision</strong>
                    <p>{permit.revision?.message}</p>
                  </div>
                  <Button variant="outline" onClick={() => go("status")}>
                    View request
                    <ArrowRight size={15} />
                  </Button>
                </div>
              )}
              <div className="content-grid">
                <div>
                  <div className="section-header">
                    <h2>
                      My permits <span className="count">3</span>
                    </h2>
                    <span className="muted small">Most recent first</span>
                  </div>
                  <article className="permit-card featured">
                    <div className="split">
                      <span className="permit-id">HWP-26-1842</span>
                      <Badge tone={statusTone()}>
                        {statusLabels[permit.status]}
                      </Badge>
                    </div>
                    <h2>Residential Driveway Modification</h2>
                    <p className="location">
                      <MapPin size={16} />
                      {permit.form.address}
                    </p>
                    <div className="permit-meta">
                      <span>
                        {isDraft ? "Applicant" : "Submitted by"}{" "}
                        <strong>{permit.form.name}</strong>
                      </span>
                      <span>Region 1</span>
                    </div>
                    {isDraft ? (
                      <div className="readiness-preview">
                        <div className="split">
                          <span>Application readiness</span>
                          <strong>{Math.round((complete / 7) * 100)}%</strong>
                        </div>
                        <div className="progress">
                          <span style={{ width: `${(complete / 7) * 100}%` }} />
                        </div>
                        <p>
                          <AlertCircle size={14} />
                          {nextApplicantAction(permit)}
                        </p>
                      </div>
                    ) : (
                      <div className="status-preview">
                        <Clock3 size={17} />
                        {permit.status === "awaiting"
                          ? "Action needed: revise your site plan"
                          : permit.status === "approved"
                            ? "Approved September 15, 2026"
                            : permit.status === "resubmitted"
                              ? "Revision received. NYSDOT will review your updated plan."
                              : "Your application is with NYSDOT Region 1."}
                      </div>
                    )}
                    <div className="card-footer">
                      <span>Last updated Sep 15, 2026</span>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (isDraft) {
                            setStep(4);
                            go("application");
                          } else go("status");
                        }}
                      >
                        {isDraft ? "Continue application" : "View permit"}
                        <ArrowRight size={16} />
                      </Button>
                    </div>
                  </article>
                  {[
                    {
                      id: "HWP-25-0918",
                      name: "Residential Driveway Repair",
                      address: "123 State Route 9, Albany, NY",
                      date: "Oct 02, 2025",
                    },
                    {
                      id: "HWP-24-0631",
                      name: "Temporary Right-of-Way Access",
                      address: "123 State Route 9, Albany, NY",
                      date: "Jun 18, 2024",
                    },
                  ].map((p) => (
                    <article key={p.id} className="permit-card compact">
                      <div className="split">
                        <span className="permit-id">{p.id}</span>
                        <Badge tone="green">Approved</Badge>
                      </div>
                      <h3>{p.name}</h3>
                      <p className="location">
                        <MapPin size={15} />
                        {p.address}
                      </p>
                      <div className="small muted">
                        Approved {p.date} · Archived permit
                      </div>
                    </article>
                  ))}
                </div>
                <aside className="right-column">
                  <div className="help-card">
                    <span className="large-icon">
                      <ClipboardList size={24} />
                    </span>
                    <h3>
                      A complete application.
                      <br />A clearer path forward.
                    </h3>
                    <p>
                      Confirm your project details and required documents before
                      submitting to NYSDOT.
                    </p>
                    <div className="mini-rule" />
                    <h4>Before you submit</h4>
                    <CheckRow>Describe your proposed work</CheckRow>
                    <CheckRow>Confirm contractor information</CheckRow>
                    <CheckRow done={permit.sitePlan}>
                      Attach a detailed site plan
                    </CheckRow>
                    <Button variant="ghost" onClick={() => go("help")}>
                      View application guidance
                      <ArrowRight size={15} />
                    </Button>
                  </div>
                  <div className="support-card">
                    <CircleHelp size={20} />
                    <div>
                      <h4>Need a hand?</h4>
                      <p>
                        Find answers about documents, review, and next steps.
                      </p>
                      <button className="text-link" onClick={() => go("help")}>
                        Visit Help <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
          {view === "start" && (
            <>
              {title(
                "NEW APPLICATION",
                "Let’s start with your project",
                "We’ll guide you through the information needed for your work.",
              )}
              <div className="narrow">
                <Panel
                  title="What are you planning to do?"
                  subtitle="Select the type of work within the state right-of-way."
                  extra={<TerminologyHelp term="rightOfWay" />}
                >
                  <div className="project-options">
                    {[
                      "Residential driveway",
                      "Utility work",
                      "Commercial access",
                      "Signs",
                      "Other work within state right-of-way",
                    ].map((x, i) => (
                      <button
                        key={x}
                        disabled={i > 0}
                        className={`project-option ${startChoice && i === 0 ? "chosen" : ""}`}
                        onClick={() => setStartChoice(true)}
                      >
                        <span className="option-icon">
                          {i === 0 ? (
                            <Route size={23} />
                          ) : (
                            <Building2 size={23} />
                          )}
                        </span>
                        <span>
                          <strong>{x}</strong>
                          <small>
                            {i === 0
                              ? "Create or modify access to a residential property"
                              : "Not available for online application"}
                          </small>
                        </span>
                        {i === 0 && <ChevronRight size={20} />}
                      </button>
                    ))}
                  </div>
                </Panel>
                {startChoice && (
                  <Panel title="Are you creating a new driveway or modifying an existing driveway?">
                    <div className="panel-body">
                      {isDraft &&
                        field("Driveway work", "driveway", "text", [
                          "Modify existing driveway",
                          "Create a new driveway",
                        ])}
                      <Button
                        onClick={() => {
                          if (!isDraft) {
                            go("status");
                            return;
                          }
                          setStep(0);
                          go("application");
                        }}
                      >
                        {isDraft
                          ? "Continue to application"
                          : "View submitted application"}
                        <ArrowRight size={16} />
                      </Button>
                      {!isDraft && (
                        <p className="fine-print">
                          Your application has been submitted. View its status
                          and any requests from NYSDOT.
                        </p>
                      )}
                    </div>
                  </Panel>
                )}
              </div>
            </>
          )}
          {view === "application" && (
            <GuidedApplication
              permit={permit}
              step={step}
              setStep={setStep}
              update={update}
              field={field}
              onResolvePlan={() => {
                setPermit((p) => resolvePreSubmissionIssue(p));
                setToast("Site plan updated. Proposed culvert diameter added.");
              }}
              upload={upload}
              document={document}
              go={go}
              act={act}
              setToast={setToast}
            />
          )}
          {view === "status" && (
            <>
              {title(
                "MY PERMITS / HWP-26-1842",
                "Residential Driveway Modification",
                permit.form.address,
                <Badge tone={statusTone()}>
                  {statusLabels[permit.status]}
                </Badge>,
              )}
              {permit.status === "submitted" && (
                <div className="alert success">
                  <CheckCircle2 size={23} />
                  <div>
                    <strong>Application submitted</strong>
                    <p>
                      HWP-26-1842 has been routed to NYSDOT Region 1 for review.
                    </p>
                  </div>
                </div>
              )}
              {permit.status === "awaiting" && (
                <div className="alert amber">
                  <AlertCircle size={23} />
                  <div>
                    <strong>NYSDOT requested a revision</strong>
                    <p className="small">
                      Requested by: {permit.revision?.requestedBy}
                    </p>
                    <p>{permit.revision?.message}</p>
                    <Button onClick={() => upload(true)}>
                      <Upload size={16} />
                      Upload revised plan
                    </Button>
                    <p className="fine-print">
                      {revisionChangeSummary(permit)}
                    </p>
                  </div>
                </div>
              )}
              {permit.status === "resubmitted" && (
                <div className="alert success">
                  <CheckCircle2 size={23} />
                  <div>
                    <strong>Revision submitted</strong>
                    <p>
                      Site-Plan-v2.pdf has been sent to NYSDOT. Your requested
                      item is awaiting verification.
                    </p>
                  </div>
                </div>
              )}
              {permit.status === "approved" && (
                <div className="alert success">
                  <CheckCircle2 size={23} />
                  <div>
                    <strong>Permit approved</strong>
                    <p>Approved September 15, 2026</p>
                  </div>
                  <Button onClick={() => go("approval")}>
                    View permit
                    <ArrowRight size={16} />
                  </Button>
                </div>
              )}
              <div className="content-grid">
                <Panel
                  title="Application progress"
                  subtitle="Track your application from submission to approval."
                >
                  <div className="timeline">
                    {[
                      "Application submitted",
                      "Administrative review",
                      "Engineering review",
                      "Applicant action",
                      "Approval",
                    ].map((s, i) => {
                      const stage = timelineState(permit.status, i);
                      return (
                        <div
                          key={s}
                          className={`timeline-item ${stage.done ? "done" : stage.current ? "active" : ""}`}
                        >
                          <span className="timeline-marker">
                            {stage.done ? <Check size={16} /> : i + 1}
                          </span>
                          <div>
                            <h3>{s}</h3>
                            <p>
                              {i === 0
                                ? "September 15, 2026 · Region 1"
                                : i === 1
                                  ? "Applicant information and supporting documents"
                                  : i === 2
                                    ? "Permit Engineering and Drainage Review"
                                    : i === 3
                                      ? revised
                                        ? "Revision 2 received — requested item addressed"
                                        : permit.revision?.message ||
                                          "We’ll let you know if more information is needed."
                                      : permit.status === "approved"
                                        ? "Approved September 15, 2026"
                                        : "NYSDOT’s final review and decision"}
                            </p>
                          </div>
                          {stage.current && (
                            <Badge tone="blue">
                              {permit.status === "awaiting"
                                ? "Action required"
                                : "Current stage"}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Panel>
                <div className="right-column">
                  <Panel title="Submitted documents">
                    <div className="panel-body">
                      {documents.map((d) => (
                        <button
                          className="document-link"
                          key={d.name}
                          onClick={() => document(d.name)}
                        >
                          <FileText size={19} />
                          <span>
                            {d.name}
                            <small>
                              Version {d.version} · {d.date}
                            </small>
                          </span>
                          <ExternalLink size={14} />
                        </button>
                      ))}
                    </div>
                  </Panel>
                  <Panel title="Activity">
                    <div className="activity-list">
                      {permit.activity.map((a, i) => (
                        <div key={a}>
                          <span className="activity-dot" />
                          <div>
                            <p>{a}</p>
                            <small>
                              Sep 15, 2026 ·{" "}
                              {i === 0 ? "Latest update" : "Earlier"}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
              </div>
            </>
          )}
          {view === "queue" && (
            <>
              {title(
                "ASSIGNED REGIONS · PERMIT OPERATIONS",
                "Highway Work Permit Review",
                "A shared workspace for complete, coordinated permit reviews.",
              )}
              <div className="queue-summary">
                <div>
                  <span>Permits in queue</span>
                  <strong>{isDraft ? 4 : 5}</strong>
                </div>
                <div>
                  <span>Awaiting applicant</span>
                  <strong>{permit.status === "awaiting" ? 2 : 1}</strong>
                </div>
                <div>
                  <span>Ready for approval</span>
                  <strong>{permit.status === "resolved" ? 2 : 1}</strong>
                </div>
              </div>
              <Panel
                title="Review queue"
                extra={
                  <span className="small muted">All assigned regions</span>
                }
              >
                <div className="table-controls">
                  <div className="filters">
                    {[
                      "All",
                      "New",
                      "In Review",
                      "Applicant Action",
                      "Ready for Approval",
                    ].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={filter === f ? "selected" : ""}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <label className="search">
                    <Search size={16} />
                    <input
                      aria-label="Search permits"
                      placeholder="Search permits"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Permit / Applicant</th>
                        <th>Permit type</th>
                        <th>Region</th>
                        <th>Status</th>
                        <th>Readiness</th>
                        <th>
                          <span className="sr-only">Open</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ...(!isDraft
                          ? [
                              {
                                id: permit.id,
                                name: permit.form.name,
                                type: "Residential Driveway",
                                region: "Region 1",
                                status: statusLabels[permit.status],
                                readiness: "Complete",
                              },
                            ]
                          : []),
                        ...queue,
                      ]
                        .filter(
                          (r) =>
                            (!query ||
                              `${r.id} ${r.name}`
                                .toLowerCase()
                                .includes(query.toLowerCase())) &&
                            (filter === "All" ||
                              filter === r.status ||
                              (filter === "In Review" &&
                                [
                                  "Engineering Review",
                                  "Revision submitted",
                                ].includes(r.status)) ||
                              (filter === "Applicant Action" &&
                                r.status === "Awaiting Applicant")),
                        )
                        .map((r) => (
                          <tr
                            key={r.id}
                            className={`clickable-case ${r.id === permit.id ? "primary-row" : ""}`}
                            onClick={() => openCase(r.id)}
                          >
                            <td>
                              <button
                                className="table-link"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openCase(r.id);
                                }}
                              >
                                {r.id}
                              </button>
                              <span className="table-sub">{r.name}</span>
                            </td>
                            <td>{r.type}</td>
                            <td>{r.region}</td>
                            <td>
                              <Badge
                                tone={
                                  r.status.includes("Applicant")
                                    ? "amber"
                                    : r.status === "Approved"
                                      ? "green"
                                      : "blue"
                                }
                              >
                                {r.status}
                              </Badge>
                            </td>
                            <td>
                              <span
                                className={
                                  r.readiness === "Complete"
                                    ? "complete-label"
                                    : "issue-label"
                                }
                              >
                                {r.readiness === "Complete" ? (
                                  <CheckCircle2 size={15} />
                                ) : (
                                  <AlertCircle size={15} />
                                )}{" "}
                                {r.readiness}
                              </span>
                            </td>
                            <td>
                              <button
                                className="icon-button"
                                aria-label={`Open ${r.id}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openCase(r.id);
                                }}
                              >
                                <ChevronRight size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="table-footer">
                  Open a case to inspect its project, documents, and next
                  action.
                  {query && <span> Clear the search to see all permits.</span>}
                </div>
              </Panel>
            </>
          )}
          {view === "case" && (
            <QueueCase id={selectedCase} onBack={() => go("queue")} />
          )}
          {view === "reviewer" && (
            <ReviewerWorkspace
              permit={permit}
              documents={documents}
              review={review}
              revised={revised}
              go={go}
              act={act}
              document={document}
              setToast={setToast}
              onRequestRevision={() => {
                setMessage(recommendedRevisionMessage(permit));
                setModal("revision");
              }}
            />
          )}
          {view === "approval" && (
            <>
              {title(
                "HWP-26-1842",
                "Permit approved",
                "Residential Driveway Modification",
                <Button variant="outline" onClick={() => window.print()}>
                  <Download size={16} />
                  Print confirmation
                </Button>,
              )}
              <div className="approval-sheet">
                <div className="approval-top">
                  <span className="approval-seal">
                    <ShieldCheck size={34} />
                  </span>
                  <div>
                    <div className="eyebrow">
                      NEW YORK STATE DEPARTMENT OF TRANSPORTATION
                    </div>
                    <h2>Highway Work Permit</h2>
                    <p>Approval confirmation</p>
                  </div>
                  <Badge tone="green">Approved</Badge>
                </div>
                <div className="approval-number">
                  <span>PERMIT NUMBER</span>
                  <h2>HWP-26-1842</h2>
                  <p>Approved September 15, 2026 · NYSDOT Region 1</p>
                </div>
                <div className="approval-details">
                  <div>
                    <span>Permit holder</span>
                    <strong>{permit.form.name}</strong>
                  </div>
                  <div>
                    <span>Permit type</span>
                    <strong>Residential Driveway Modification</strong>
                  </div>
                  <div>
                    <span>Property</span>
                    <strong>{permit.form.address}</strong>
                  </div>
                  <div>
                    <span>Contractor</span>
                    <strong>
                      {permit.form.performer === "contractor"
                        ? permit.form.company
                        : "Applicant performing work"}
                    </strong>
                  </div>
                  <div className="full">
                    <span>Approved scope</span>
                    <strong>{permit.form.description}</strong>
                    <p>
                      Revised site plan identifies an 18-inch proposed culvert
                      diameter.
                    </p>
                  </div>
                </div>
                <div className="approval-bottom">
                  <CheckCircle2 size={20} />
                  <div>
                    Administrative and required technical reviews complete.
                    <small>
                      Prototype confirmation only. This is not a legal permit or
                      authorization to begin work.
                    </small>
                  </div>
                </div>
              </div>
              <div className="approval-actions">
                <Button onClick={() => go(staff ? "dashboard" : "home")}>
                  {staff ? "View operational dashboard" : "Back to my permits"}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </>
          )}
          {view === "dashboard" && (
            <>
              {title(
                "NYSDOT · OPERATIONS",
                "Permit Operations",
                "A statewide view of workload and review performance.",
                <span className="prototype light">
                  Illustrative prototype data
                </span>,
              )}
              <div className="metrics">
                {[
                  ["384", "Active permits"],
                  ["42", "Awaiting NYSDOT review"],
                  ["18", "Awaiting applicant action"],
                  ["3.1", "Average review cycles"],
                  ["12.4 days", "Average approval time"],
                ].map(([n, l]) => (
                  <div className="metric" key={l}>
                    <span>{l}</span>
                    <strong>{n}</strong>
                    <small>Statewide · September 2026</small>
                  </div>
                ))}
              </div>
              <div className="content-grid">
                <Panel
                  title="Regional workload"
                  subtitle="Permits awaiting NYSDOT review"
                >
                  <div className="workload">
                    {[
                      ["Region 1", "Capital District", 42],
                      ["Region 2", "Mohawk Valley", 28],
                      ["Region 3", "Central New York", 37],
                    ].map(([r, l, n]) => (
                      <div key={r}>
                        <div className="split">
                          <div>
                            <strong>{r}</strong>
                            <span>{l}</span>
                          </div>
                          <strong>
                            {n}
                            <small> permits</small>
                          </strong>
                        </div>
                        <div className="workload-bar">
                          <span
                            style={{ width: `${(Number(n) / 50) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
                <div className="help-card">
                  <ClipboardList size={27} />
                  <h3>Fewer avoidable review cycles</h3>
                  <p>
                    Guided intake and submission readiness help applicants send
                    complete materials. Structured requests make the next action
                    clear.
                  </p>
                  <div className="mini-rule" />
                  <h4>Measurement priorities</h4>
                  <CheckRow>First-review completeness</CheckRow>
                  <CheckRow>Revision requests per permit</CheckRow>
                  <CheckRow>Time awaiting applicant action</CheckRow>
                  <p className="fine-print">
                    Metrics are illustrative and do not change as applications
                    progress.
                  </p>
                </div>
              </div>
            </>
          )}
          {view === "help" && (
            <>
              {title(
                "APPLICANT SUPPORT",
                "A clearer path to submission",
                "Prepare your materials and understand what happens next.",
              )}
              <div className="narrow">
                {[
                  [
                    "What should my site plan include?",
                    "Show the property, existing and proposed driveway dimensions, and affected drainage infrastructure. For drainage work, include the proposed culvert diameter before submitting. Staff may request other technical details during review.",
                  ],
                  [
                    "When is contractor insurance required?",
                    "When you select a contractor, the application adds proof of insurance to your document requirements. Administrative checks flag information for NYSDOT staff verification.",
                  ],
                  [
                    "What happens after submission?",
                    "Your application is routed to Region 1. Staff review administrative completeness and coordinate engineering and drainage review. You can track progress in My Permits.",
                  ],
                  [
                    "How do I respond to a revision request?",
                    "Open your permit from My Permits, read the requested change, and select Upload revised plan. NYSDOT staff then verify and resolve the request.",
                  ],
                  [
                    "About this prototype",
                    "PermitFlow demonstrates one residential driveway application. Uploads and AI-assisted outputs are prepared fixtures. The prototype is not an official NYSDOT service.",
                  ],
                ].map(([q, a]) => (
                  <details className="faq" key={q}>
                    <summary>
                      {q}
                      <Plus size={18} />
                    </summary>
                    <p>{a}</p>
                  </details>
                ))}
                <Button variant="outline" onClick={() => go("home")}>
                  <ArrowLeft size={16} />
                  Back to my permits
                </Button>
              </div>
            </>
          )}
        </main>
        <footer className="app-footer">
          <span>
            PermitFlow <span className="footer-dot">·</span> NYSDOT Highway Work
            Permits <span className="footer-dot">·</span> Demonstration
            environment
          </span>
          <button onClick={() => setModal("reset")}>
            <RotateCcw size={14} />
            Reset Demo
          </button>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          {toast}
        </div>
      )}
      <Dialog
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
      >
        <DialogContent>
          {modal === "revision" ? (
            <>
              <DialogTitle>Request applicant revision</DialogTitle>
              <DialogDescription>
                Send a specific request so the applicant knows what to update.
              </DialogDescription>
              <label className="field">
                <span>Category</span>
                <select defaultValue="Site Plan">
                  <option>Site Plan</option>
                </select>
              </label>
              <label className="field">
                <span>Message</span>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>
              <div className="note">
                <Info size={17} />
                The application will move to Awaiting Applicant.
              </div>
              <div className="modal-actions">
                <Button variant="outline" onClick={() => setModal(null)}>
                  Cancel
                </Button>
                <Button
                  disabled={!message.trim()}
                  onClick={() => {
                    act("request");
                    setModal(null);
                    setToast("Revision request sent to applicant");
                  }}
                >
                  Send request
                  <ArrowRight size={16} />
                </Button>
              </div>
            </>
          ) : modal === "reset" ? (
            <>
              <DialogTitle>Reset the demo?</DialogTitle>
              <DialogDescription>
                This restores the original draft and removes saved submissions,
                revisions, and approval from this browser.
              </DialogDescription>
              <div className="modal-actions">
                <Button variant="outline" onClick={() => setModal(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setPermit(structuredClone(initialPermit));
                    setPersona("applicant");
                    setStep(0);
                    setStartChoice(false);
                    setFilter("All");
                    setQuery("");
                    setModal(null);
                    go("home");
                    setToast("Demo reset. Ready to start again.");
                  }}
                >
                  Reset Demo
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogTitle>{doc}</DialogTitle>
              <DialogDescription>Document details</DialogDescription>
              <div className="document-preview">
                <FileText size={35} />
                <h3>
                  {doc.includes("COI")
                    ? "Certificate of insurance"
                    : "Residential driveway site plan"}
                </h3>
                {doc.includes("COI") ? (
                  <>
                    <p>{permit.form.company}</p>
                    <CheckRow>Policy active through May 18, 2027</CheckRow>
                    <CheckRow>NYSDOT additional insured identified</CheckRow>
                  </>
                ) : (
                  <>
                    <p>{permit.form.address}</p>
                    <dl className="detail-list">
                      <dt>Proposed work</dt>
                      <dd>Driveway widening and culvert replacement</dd>
                      <dt>Proposed culvert diameter</dt>
                      <dd
                        className={
                          doc.includes("v2") ||
                          permit.preSubmissionIssueResolved
                            ? "passed"
                            : "issue-label"
                        }
                      >
                        {permit.preSubmissionIssueResolved
                          ? "18 inches — added before submission"
                          : doc.includes("v2")
                            ? "18 inches — identified in Revision 2"
                            : "Not identified — engineering clarification needed"}
                      </dd>
                      {doc.includes("v2") &&
                        permit.preSubmissionIssueResolved && (
                          <>
                            <dt>Proposed culvert material</dt>
                            <dd>
                              Reinforced concrete — confirmed in Revision 2
                            </dd>
                          </>
                        )}
                    </dl>
                  </>
                )}
                <p className="fine-print">
                  This is a deterministic document summary. A PDF viewer is
                  outside the prototype scope.
                </p>
              </div>
              <div className="modal-actions">
                <Button onClick={() => setModal(null)}>Done</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

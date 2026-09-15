"use client";
import { ArrowLeft, FileText, ChevronDown } from "lucide-react";
import { Badge, Panel, title } from "@/components/presentation";
import { queue, caseDetails } from "@/data/fixtures";
export function QueueCase({ id, onBack }: { id: string; onBack: () => void }) {
  const row = queue.find((item) => item.id === id);
  const detail = caseDetails[id];
  if (!row || !detail)
    return (
      <button className="back-link" onClick={onBack}>
        Back to review queue
      </button>
    );
  return (
    <>
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={15} />
        Back to review queue
      </button>
      {title(
        `${row.region.toUpperCase()} · ${row.type.toUpperCase()}`,
        row.id,
        row.name,
        <Badge tone={row.status === "Applicant Action" ? "amber" : "blue"}>
          {row.status}
        </Badge>,
      )}
      <div className="info-cards">
        {[
          ["Applicant", row.name],
          ["Location", detail.location],
          ["Assigned team", detail.assignedTo],
          ["Readiness", row.readiness],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="review-grid">
        <div>
          <Panel title="Project overview">
            <div className="panel-body">
              <p className="summary-text">{detail.scope}</p>
              <h3>Next action</h3>
              <p>{detail.nextAction}</p>
            </div>
          </Panel>
          {detail.issues.length > 0 && (
            <Panel
              title="Outstanding requests"
              subtitle="Applicant responses are needed before review can continue."
            >
              <div className="panel-body">
                {detail.issues.map((issue, i) => (
                  <div key={issue} className="alert amber">
                    <div>
                      <strong>Request {i + 1}</strong>
                      <p>{issue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}
          <Panel
            title="Documents"
            subtitle="Open a document to inspect its sample contents."
          >
            <div className="panel-body">
              {detail.documents.map((doc) => (
                <details className="queue-document" key={doc.name}>
                  <summary>
                    <FileText size={18} />
                    <span>{doc.name}</span>
                    <ChevronDown size={16} />
                  </summary>
                  <p>{doc.detail}</p>
                </details>
              ))}
            </div>
          </Panel>
        </div>
        <aside className="right-column">
          <Panel title="Case activity">
            <div className="activity-list">
              {detail.activity.map((event) => (
                <div key={event}>
                  <span className="activity-dot" />
                  <p>{event}</p>
                </div>
              ))}
            </div>
          </Panel>
          <div className="help-card">
            <h3>Sample case</h3>
            <p>
              This record demonstrates the queue’s review context. Submission,
              revision, and approval actions are available on HWP-26-1842.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

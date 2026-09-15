import { CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckRow } from "@/components/presentation";
import { applicableRequirements, type Permit } from "@/lib/permit";
export function AdaptiveRequirements({
  permit,
  source,
}: {
  permit: Permit;
  source: "drainage" | "contractor";
}) {
  const rules = applicableRequirements(permit);
  const reason =
    source === "contractor"
      ? rules.contractorInsurance
        ? "Because a contractor is performing the work:"
        : "Because you will perform the work yourself:"
      : permit.form.drainage === "Yes"
        ? "Because this project affects roadside drainage:"
        : permit.form.drainage === "Not sure"
          ? "Because drainage impact is uncertain:"
          : "Based on your answer that drainage is not affected:";
  const items =
    source === "contractor"
      ? rules.contractorInsurance
        ? [
            "Contractor information is required",
            "Proof of insurance is required",
          ]
        : [
            "Contractor contact details are not required",
            "Contractor insurance is not requested for self-performed work",
          ]
      : permit.form.drainage === "Yes"
        ? [
            "Site plan required",
            "Culvert dimensions required, including proposed diameter",
            "Drainage review will be included",
          ]
        : permit.form.drainage === "Not sure"
          ? [
              "Site plan required",
              "Drainage impact flagged for NYSDOT review",
              "Staff will determine whether culvert dimensions are needed",
            ]
          : [
              "Site plan still required for driveway work",
              "No culvert dimensions requested based on this answer",
              "Staff will verify the reported drainage impact",
            ];
  return (
    <div className="requirements-update" role="status" aria-live="polite">
      <div className="section-label">
        <Info size={17} />
        Requirements updated
      </div>
      <p>{reason}</p>
      {items.map((item) => (
        <CheckRow key={item}>{item}</CheckRow>
      ))}
    </div>
  );
}
export function SitePlanCheck({
  permit,
  onResolve,
}: {
  permit: Permit;
  onResolve: () => void;
}) {
  const rules = applicableRequirements(permit);
  if (!rules.culvertDimensions)
    return (
      <div className="note">
        <Info size={17} />
        {permit.form.drainage === "Not sure"
          ? "Drainage impact is flagged for NYSDOT review. Staff may request dimensions after reviewing the site plan."
          : "A site plan is required for driveway work. No drainage-specific dimensions are requested based on your answer."}
      </div>
    );
  if (!permit.sitePlan)
    return (
      <div className="note">
        <Info size={17} />
        Because your project affects drainage, include culvert dimensions and
        the proposed diameter in your site plan.
      </div>
    );
  return permit.preSubmissionIssueResolved ? (
    <div className="site-plan-check resolved" role="status">
      <div className="section-label">
        <CheckCircle2 size={17} />
        AI-assisted review
      </div>
      <h3>1 pre-submission issue resolved</h3>
      <p>
        Proposed culvert diameter added to site plan: <strong>18 inches</strong>
        .
      </p>
      <p className="fine-print">
        Updated Site-Plan-v1.pdf · NYSDOT staff verify the submitted dimensions.
      </p>
    </div>
  ) : (
    <div className="site-plan-check">
      <div className="section-label">
        <Info size={17} />
        AI-assisted review
      </div>
      <h3>1 item may need attention</h3>
      <h4>Proposed culvert diameter not detected</h4>
      <p>
        The uploaded plan appears to show the culvert location, but a proposed
        culvert diameter was not detected.
      </p>
      <p>
        <strong>Recommendation:</strong> Add the proposed culvert diameter
        before submitting.
      </p>
      <p>
        Resolving this before submission may prevent an additional review cycle.
      </p>
      <Button type="button" onClick={onResolve}>
        Upload corrected plan
      </Button>
      <p className="fine-print">
        Upload a corrected site plan showing the proposed diameter. NYSDOT staff
        will verify the submitted dimensions.
      </p>
    </div>
  );
}

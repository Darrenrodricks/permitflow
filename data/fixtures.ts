export const queue = [
  {
    id: "HWP-26-1839",
    name: "Empire Fiber LLC",
    type: "Utility",
    region: "Region 1",
    status: "Applicant Action",
    readiness: "2 issues",
  },
  {
    id: "HWP-26-1836",
    name: "Northstar Development",
    type: "Commercial Access",
    region: "Region 1",
    status: "Engineering Review",
    readiness: "Complete",
  },
  {
    id: "HWP-26-1831",
    name: "Albany Water Board",
    type: "Utility",
    region: "Region 1",
    status: "New",
    readiness: "Complete",
  },
  {
    id: "HWP-26-1824",
    name: "Pine Street Properties",
    type: "Commercial Access",
    region: "Region 2",
    status: "Ready for Approval",
    readiness: "Complete",
  },
];
export const revisionMessage =
  "Please identify the proposed culvert diameter on the site plan.";

export const caseDetails: Record<
  string,
  {
    location: string;
    scope: string;
    assignedTo: string;
    nextAction: string;
    issues: string[];
    documents: { name: string; detail: string }[];
    activity: string[];
  }
> = {
  "HWP-26-1839": {
    location: "State Route 5, Colonie, NY",
    scope:
      "Install underground fiber conduit along the state right-of-way, including two utility crossings.",
    assignedTo: "Utility Permit Review",
    nextAction:
      "Waiting for Empire Fiber to provide the revised traffic-control plan and insurance endorsement.",
    issues: [
      "Traffic-control plan must identify the temporary pedestrian route.",
      "Insurance endorsement must identify NYSDOT as an additional insured.",
    ],
    documents: [
      {
        name: "Fiber-Route-Plan.pdf",
        detail: "Proposed conduit alignment and two road crossings are shown.",
      },
      {
        name: "Traffic-Control-v1.pdf",
        detail:
          "Vehicle detours are shown; a temporary pedestrian route is missing.",
      },
      {
        name: "Empire-Fiber-COI.pdf",
        detail:
          "Insurance certificate received. Additional-insured endorsement requested.",
      },
    ],
    activity: [
      "Sep 14 · Two revisions requested from applicant",
      "Sep 12 · Administrative review completed",
      "Sep 10 · Application received",
    ],
  },
  "HWP-26-1836": {
    location: "State Route 7, Latham, NY",
    scope:
      "Modify commercial driveway access for a proposed retail development, including turning movements and drainage improvements.",
    assignedTo: "Permit Engineering",
    nextAction:
      "Engineering is reviewing sight distance and turning movements before a final recommendation.",
    issues: [],
    documents: [
      {
        name: "Commercial-Access-Plan.pdf",
        detail:
          "Proposed entrance geometry, driveway widths, and property boundaries.",
      },
      {
        name: "Traffic-Study.pdf",
        detail:
          "Peak-hour turning movements and sight-distance analysis submitted for engineering review.",
      },
      {
        name: "Drainage-Report.pdf",
        detail: "Proposed runoff controls and drainage calculations.",
      },
    ],
    activity: [
      "Sep 14 · Engineering review in progress",
      "Sep 11 · Routed to Permit Engineering",
      "Sep 9 · Administrative checks completed",
    ],
  },
  "HWP-26-1831": {
    location: "State Route 32, Albany, NY",
    scope:
      "Replace a water service connection beneath the roadway using a temporary work zone and pavement restoration.",
    assignedTo: "Administrative Review",
    nextAction:
      "Confirm administrative documents, then route the utility crossing and work-zone plan to engineering.",
    issues: [],
    documents: [
      {
        name: "Water-Service-Plan.pdf",
        detail: "Proposed service connection and utility crossing alignment.",
      },
      {
        name: "Work-Zone-Plan.pdf",
        detail: "Temporary lane restrictions and proposed work hours.",
      },
      {
        name: "Contractor-Insurance.pdf",
        detail:
          "Contractor insurance received; administrative verification pending.",
      },
    ],
    activity: [
      "Sep 15 · Assigned to Administrative Review",
      "Sep 15 · Application received; required materials present",
    ],
  },
  "HWP-26-1824": {
    location: "State Route 5S, Utica, NY",
    scope:
      "Reconstruct a commercial entrance, including curb work and driveway surface restoration.",
    assignedTo: "Region 2 Permit Supervisor",
    nextAction:
      "Administrative and technical reviews are complete. Awaiting the permit supervisor’s final decision.",
    issues: [],
    documents: [
      {
        name: "Approved-Access-Plan.pdf",
        detail:
          "Final entrance geometry and restoration limits reviewed by engineering.",
      },
      {
        name: "Contractor-Insurance.pdf",
        detail: "Administrative insurance verification complete.",
      },
      {
        name: "Engineering-Review.pdf",
        detail:
          "Engineering and drainage review findings resolved; recommendation recorded.",
      },
    ],
    activity: [
      "Sep 14 · Ready for supervisor decision",
      "Sep 13 · Technical review completed",
      "Sep 11 · Applicant revision resolved",
    ],
  },
};

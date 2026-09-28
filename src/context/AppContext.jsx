import { createContext, useContext, useState } from "react";
import { ROLES, PHASE_ACCESS, PHASES, testingByReqId, WORKFLOW_STAGES } from "@/data/repository";
import { projects as seedProjects, requirements as seedReqs } from "@/data/repository";

const AppContext = createContext(null);

// Where opening a project lands, per workflow phase.
export const PHASE_HOME = {
  "gov-sme": "/phase/gov-sme",
  "vendor-draft": "/phase/vendor-draft",
  "stig-draft": "/phase/stig-draft",
  "stig-testing": "/phase/stig-testing",
  "tech-edits": "/phase/tech-edits",
  delivery: "/phase/delivery",
};

export function AppProvider({ children }) {
  const [roleId, setRoleId] = useState("stig-writer");
  const [openProjectId, setOpenProjectId] = useState(null);
  const [currentPhaseId, setCurrentPhaseId] = useState((PHASE_ACCESS["stig-writer"] || [])[0]);

  // Editable requirement data (mock, lives in memory) so bulk actions reflect live.
  const [reqs, setReqs] = useState(() => seedReqs.map((r) => ({ ...r, satisfies: "", satisfiedBy: "" })));
  const [testStatusById, setTestStatusById] = useState(() =>
    Object.fromEntries(seedReqs.map((r) => [r.id, (testingByReqId[r.id] || {}).status || "Applicable - Inherently Meets"]))
  );
  const updateReqs = (ids, patch) => setReqs((rs) => rs.map((r) => (ids.includes(r.id) ? { ...r, ...patch } : r)));
  const flagDuplicates = (ids, parentId) =>
    setReqs((rs) => {
      const parent = rs.find((r) => r.id === parentId);
      if (!parent) return rs;
      return rs.map((r) => {
        if (r.id === parentId) return { ...r, satisfiedBy: "" };
        if (ids.includes(r.id)) return { ...r, satisfiedBy: parent.stigId };
        return r;
      });
    });
  const updateTestStatus = (ids, value) =>
    setTestStatusById((m) => {
      const n = { ...m };
      ids.forEach((id) => (n[id] = value));
      return n;
    });

  // Requirements carrying a Senior Review comment (flagged across grids/forms).
  const [seniorFlags, setSeniorFlags] = useState(() => new Set(["r-260108", "r-260117", "r-260130"]));
  const flagSenior = (reqId) => setSeniorFlags((s) => new Set(s).add(reqId));
  const hasSenior = (reqId) => seniorFlags.has(reqId);

  // Internal-only STIG-level notes, keyed by project id (not customer-facing).
  const [stigComments, setStigComments] = useState(() => ({
    horizon: [
      { author: "Teena Brinkley", initials: "TB", role: "STIG Writer", time: "2026-06-24 09:12", text: "Good with the banner rules. Verify the tech spelling on 'Omnissa' throughout before we send to PMRC." },
      { author: "Aaron Kegrreis", initials: "AK", role: "Senior Review", time: "2026-06-24 09:40", text: "Agreed. Also confirm the TLS rule references locked.properties consistently." },
    ],
    rke2: [
      { author: "Marcus Reilly", initials: "MR", role: "STIG Writer", time: "2026-06-23 16:05", text: "Container platform mappings look solid — need a second pass on the FIPS wording." },
    ],
  }));
  const getStigComments = (projectId) => stigComments[projectId] || [];
  const [stigReadCounts, setStigReadCounts] = useState({});
  const unreadStig = (projectId) => Math.max(0, (stigComments[projectId]?.length || 0) - (stigReadCounts[projectId] || 0));
  const markStigRead = (projectId) => setStigReadCounts((m) => ({ ...m, [projectId]: stigComments[projectId]?.length || 0 }));

  // Editable projects (mock, in-memory) so lead assignment & workflow reflect live.
  // Demo seed spreads projects across the workflow so each role sees its stages.
  const STAGE_SEED = { horizon: "ready-techedit", rke2: "ready-testing", coldfusion: "ready-pmrc", "rancher-mcm": "pmrc", "rancher-harvester": "vendor-progress" };
  const [projectList, setProjectList] = useState(() => seedProjects.map((p) => ({ ...p, stage: STAGE_SEED[p.id] || "vendor-progress" })));
  const assignLead = (projectId, lead) =>
    setProjectList((ps) => ps.map((p) => (p.id === projectId ? { ...p, lead } : p)));
  const updateProjectStatus = (projectId, status) =>
    setProjectList((ps) => ps.map((p) => (p.id === projectId ? { ...p, status } : p)));
  const setStage = (projectId, stageId) =>
    setProjectList((ps) => ps.map((p) => (p.id === projectId ? { ...p, stage: stageId } : p)));
  const advanceStage = (projectId) =>
    setProjectList((ps) =>
      ps.map((p) => {
        if (p.id !== projectId) return p;
        const cur = WORKFLOW_STAGES.find((s) => s.id === p.stage);
        return cur && cur.next ? { ...p, stage: cur.next } : p;
      })
    );

  const role = ROLES.find((r) => r.id === roleId) || ROLES[1];
  const addStigComment = (projectId, text, mentions = []) =>
    setStigComments((m) => ({ ...m, [projectId]: [...(m[projectId] || []), { author: role.user, initials: role.initials, role: role.label, time: "just now", text, mentions }] }));
  const resolveStigComment = (projectId, index) =>
    setStigComments((m) => ({ ...m, [projectId]: (m[projectId] || []).map((c, i) => (i === index ? { ...c, resolved: !c.resolved } : c)) }));
  const openProject = projectList.find((p) => p.id === openProjectId) || null;
  const ownerOf = (p) => (WORKFLOW_STAGES.find((s) => s.id === p.stage) || {}).owner;
  const baseProjects = role.org ? projectList.filter((p) => p.vendorOrg === role.org) : projectList;
  const visibleProjects =
    roleId === "stig-writer" ? baseProjects.filter((p) => ownerOf(p) === "writer")
    : roleId === "pmrc" ? baseProjects.filter((p) => ownerOf(p) === "pmrc")
    : baseProjects;
  const allowedPhases = PHASE_ACCESS[roleId] || [];

  const switchRole = (id) => {
    setRoleId(id);
    setOpenProjectId(null);
    setCurrentPhaseId((PHASE_ACCESS[id] || [])[0]);
  };

  return (
    <AppContext.Provider
      value={{
        roleId, role, setRoleId: switchRole,
        openProjectId, setOpenProjectId, openProject,
        visibleProjects, allowedPhases,
        currentPhaseId, setCurrentPhaseId,
        reqs, updateReqs, flagDuplicates,
        testStatusById, updateTestStatus,
        assignLead, updateProjectStatus, advanceStage, setStage,
        seniorFlags, flagSenior, hasSenior,
        getStigComments, addStigComment, resolveStigComment, unreadStig, markStigRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

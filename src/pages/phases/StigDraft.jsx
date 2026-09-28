import { PageHeader } from "@/components/Primitives";
import DraftTable from "@/components/DraftTable";

export default function StigDraft() {
  return (
    <div>
      <PageHeader
        title="STIG Draft"
        subtitle="Assigned to the STIG Writer — collaborate and prepare for testing. Advance the workflow from the Projects page."
        testid="stigdraft-header"
      />
      <DraftTable prefix="stigdraft" />
    </div>
  );
}

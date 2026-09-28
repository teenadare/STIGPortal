import { PageHeader } from "@/components/Primitives";
import DraftTable from "@/components/DraftTable";

export default function VendorDraft() {
  return (
    <div>
      <PageHeader
        title="Vendor Draft"
        subtitle="Complete the draft with the Gov SME, then mark it Ready for STIG Writer from the Projects page"
        testid="vendordraft-header"
      />
      <DraftTable prefix="vendordraft" blankStigId />
    </div>
  );
}

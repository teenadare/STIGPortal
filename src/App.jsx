'use client';

import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "@/lib/theme";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Requirements from "@/pages/Requirements";
import RequirementEditor from "@/pages/RequirementEditor";
import StigTestingRecord from "@/pages/StigTestingRecord";
import InSpecValidation from "@/pages/InSpecValidation";
import DuplicateScan from "@/pages/DuplicateScan";
import SrgLibrary from "@/pages/SrgLibrary";
import SRGMapping from "@/pages/SRGMapping";
import CCILibrary from "@/pages/CCILibrary";
import CCIMappingCheck from "@/pages/CCIMappingCheck";
import ReviewQueue from "@/pages/ReviewQueue";
import AuditLog from "@/pages/AuditLog";
import CreateStigId from "@/pages/CreateStigId";
import ExportPage from "@/pages/ExportPage";
import GovSME from "@/pages/phases/GovSME";
import VendorDraft from "@/pages/phases/VendorDraft";
import StigDraft from "@/pages/phases/StigDraft";
import StigTesting from "@/pages/phases/StigTesting";
import TechEdits from "@/pages/phases/TechEdits";
import Delivery from "@/pages/phases/Delivery";
import ArchivedProjects from "@/pages/ArchivedProjects";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/requirements" element={<Requirements />} />
                <Route path="/requirements/:stigId" element={<RequirementEditor />} />
                <Route path="/srg" element={<SRGMapping />} />
                <Route path="/cci" element={<CCILibrary />} />
                <Route path="/cci-check" element={<CCIMappingCheck />} />
                <Route path="/review" element={<ReviewQueue />} />
                <Route path="/audit" element={<AuditLog />} />
                <Route path="/create-stig-id" element={<CreateStigId />} />
                <Route path="/export" element={<ExportPage />} />
                <Route path="/phase/gov-sme" element={<GovSME />} />
                <Route path="/phase/vendor-draft" element={<VendorDraft />} />
                <Route path="/phase/stig-draft" element={<StigDraft />} />
                <Route path="/phase/stig-testing" element={<StigTesting />} />
                <Route path="/srg-library" element={<SrgLibrary />} />
                <Route path="/testing/inspec" element={<InSpecValidation />} />
                <Route path="/testing/duplicate-scan" element={<DuplicateScan />} />
                <Route path="/testing/:stigId" element={<StigTestingRecord />} />
                <Route path="/phase/tech-edits" element={<TechEdits />} />
                <Route path="/phase/delivery" element={<Delivery />} />
                <Route path="/archived" element={<ArchivedProjects />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

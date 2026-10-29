/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Suspense, lazy } from "react";
import { Navbar, NavTabType } from "./components/Navbar";
import { ProfileOverview } from "./components/ProfileOverview";
import { ExportModal } from "./components/ExportModal";
import { FooterCreed } from "./components/FooterCreed";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { X, Sparkles, Heart, Loader2 } from "lucide-react";

// Lazy Loaded Heavy Components (Code Splitting Optimization)
const ProjectShowcase = lazy(() => import("./components/Projects/ProjectShowcase").then(m => ({ default: m.ProjectShowcase })));
const CalculatorsHub = lazy(() => import("./components/Calculators/CalculatorsHub").then(m => ({ default: m.CalculatorsHub })));
const ServoWorkbench = lazy(() => import("./components/ServoWorkbench/ServoWorkbench").then(m => ({ default: m.ServoWorkbench })));
const OpenArmTaskDirectory = lazy(() => import("./components/OpenArm/OpenArmTaskDirectory").then(m => ({ default: m.OpenArmTaskDirectory })));
const StructureLibraryHub = lazy(() => import("./components/StructureLibrary/StructureLibraryHub").then(m => ({ default: m.StructureLibraryHub })));
const Slicing3MFHub = lazy(() => import("./components/StructureLibrary/Slicing3MFHub").then(m => ({ default: m.Slicing3MFHub })));
const MicrocontrollerHub = lazy(() => import("./components/Microcontroller/MicrocontrollerHub").then(m => ({ default: m.MicrocontrollerHub })));
const CodeTranslatorHub = lazy(() => import("./components/CodeTranslator/CodeTranslatorHub").then(m => ({ default: m.CodeTranslatorHub })));
const UrdfGeneratorHub = lazy(() => import("./components/UrdfGenerator/UrdfGeneratorHub").then(m => ({ default: m.UrdfGeneratorHub })));
const HeatsinkGeneratorHub = lazy(() => import("./components/HeatsinkGenerator/HeatsinkGeneratorHub").then(m => ({ default: m.HeatsinkGeneratorHub })));
const GearGeneratorHub = lazy(() => import("./components/GearGenerator/GearGeneratorHub").then(m => ({ default: m.GearGeneratorHub })));
const ManufacturingDFMHub = lazy(() => import("./components/ManufacturingDFM/ManufacturingDFMHub").then(m => ({ default: m.ManufacturingDFMHub })));
const FEASimulationHub = lazy(() => import("./components/FEASimulation/FEASimulationHub").then(m => ({ default: m.FEASimulationHub })));
const InterviewSimulator = lazy(() => import("./components/Interview/InterviewSimulator").then(m => ({ default: m.InterviewSimulator })));
const ResumeBuilder = lazy(() => import("./components/Resume/ResumeBuilder").then(m => ({ default: m.ResumeBuilder })));
const AIProjectArchitect = lazy(() => import("./components/Projects/AIProjectArchitect").then(m => ({ default: m.AIProjectArchitect })));

// Fallback Loader for Suspense
const ComponentLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-cyan-500 space-y-4 animate-in fade-in duration-500">
    <Loader2 className="w-10 h-10 animate-spin" />
    <span className="text-sm font-mono text-slate-400">正在动态加载工程模块核心库...</span>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabType>("gear_generator");
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [aiPresetIdea, setAiPresetIdea] = useState<string>("");
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  const handleOpenAIArchitect = (presetIdea?: string) => {
    if (presetIdea) {
      setAiPresetIdea(presetIdea);
    } else {
      setAiPresetIdea("");
    }
    setIsAIModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAIArchitect={() => handleOpenAIArchitect()}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary key={activeTab}>
          <Suspense fallback={<ComponentLoader />}>
            {activeTab === "fea_simulation" && <FEASimulationHub />}

            {activeTab === "profile" && (
              <ProfileOverview
                onSelectProjectTab={() => setActiveTab("projects")}
                onSelectCalculatorTab={() => setActiveTab("calculators")}
              />
            )}

            {activeTab === "openarm" && <OpenArmTaskDirectory />}

            {activeTab === "manufacturing_dfm" && <ManufacturingDFMHub />}

            {activeTab === "heatsink_generator" && <HeatsinkGeneratorHub />}

            {activeTab === "gear_generator" && <GearGeneratorHub />}

            {activeTab === "urdf_generator" && <UrdfGeneratorHub />}

            {activeTab === "code_translator" && <CodeTranslatorHub />}

            {activeTab === "structures" && (
              <StructureLibraryHub onOpenSlicingHub={() => setActiveTab("slicing_3mf")} />
            )}

            {activeTab === "slicing_3mf" && (
              <Slicing3MFHub onBackToStructures={() => setActiveTab("structures")} />
            )}

            {activeTab === "controllers" && <MicrocontrollerHub />}

            {activeTab === "projects" && (
              <ProjectShowcase onOpenAIArchitect={handleOpenAIArchitect} />
            )}

            {activeTab === "calculators" && <CalculatorsHub />}

            {activeTab === "openarm_motors" && (
              <ServoWorkbench
                initialSystem="openarm"
                onSwitchSystem={(sys) =>
                  setActiveTab(sys === "openarm" ? "openarm_motors" : "amazing_hand_servo")
                }
              />
            )}

            {(activeTab === "amazing_hand_servo" || activeTab === "servo") && (
              <ServoWorkbench
                initialSystem="amazing_hand"
                onSwitchSystem={(sys) =>
                  setActiveTab(sys === "openarm" ? "openarm_motors" : "amazing_hand_servo")
                }
              />
            )}

            {activeTab === "interview" && <InterviewSimulator />}

            {activeTab === "resume" && <ResumeBuilder />}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Inspiring High-Tech Engineering Creed Footer */}
      <FooterCreed />

      {/* AI Project Architect Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Suspense fallback={<ComponentLoader />}>
            <div className="max-w-3xl w-full max-h-[90vh] flex flex-col relative">
              <button
                onClick={() => setIsAIModalOpen(false)}
                className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <AIProjectArchitect
                initialPrompt={aiPresetIdea}
                onClose={() => setIsAIModalOpen(false)}
              />
            </div>
          </Suspense>
        </div>
      )}

      {/* Export Portfolio Modal */}
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}


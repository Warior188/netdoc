import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useProject } from "@/api/hooks";
import { useEditorStore } from "@/store/editorStore";
import Stepper from "@/components/ui/Stepper";
import TopologyPanel from "@/components/topology/TopologyPanel";
import AddressingPanel from "@/components/addressing/AddressingPanel";
import ConfigPanel from "@/components/config/ConfigPanel";
import styles from "./EditorPage.module.css";

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id ?? "0");
  const { data: project, isLoading, error } = useProject(projectId);
  const { step, setStep } = useEditorStore();

  if (isLoading) return <div className={styles.loading}>Ładowanie projektu...</div>;
  if (error || !project) return <div className={styles.error}>Nie znaleziono projektu.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.back}>
          <ArrowLeft size={14} /> Projekty
        </Link>
        <div className={styles.projectName}>
          <span className={styles.projectNameLabel}>Projekt:</span>
          {project.name}
        </div>
      </div>

      <Stepper
        step={step}
        steps={["Topologia", "Adresacja", "Konfiguracja"]}
        onStepClick={setStep}
      />

      <div className={styles.panels}>
        {step === 0 && <TopologyPanel project={project} />}
        {step === 1 && <AddressingPanel project={project} />}
        {step === 2 && <ConfigPanel project={project} />}
      </div>
    </div>
  );
}
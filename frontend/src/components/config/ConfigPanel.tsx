import { useState } from "react";
import { ArrowLeft, Copy, FileText, FileType2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import type { ProjectDetail } from "@/types";
import { useProjectConfigs, downloadExport } from "@/api/hooks";
import { useEditorStore } from "@/store/editorStore";
import styles from "./ConfigPanel.module.css";

export default function ConfigPanel({ project }: { project: ProjectDetail }) {
  const { setStep } = useEditorStore();
  const { data: configData, isLoading } = useProjectConfigs(project.id);
  const [activeIdx, setActiveIdx] = useState(0);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);

  const configs = configData?.configs ?? [];
  const active = configs[activeIdx];

  const routers = project.devices.filter((d) => d.device_type === "router").length;
  const switches = project.devices.filter((d) => d.device_type === "switch").length;
  const hosts = project.devices.filter((d) => ["pc", "server"].includes(d.device_type)).length;
  const ifWithIp = project.address_entries.filter((a) => a.ip_address).length;

  const handleCopy = () => {
    if (!active) return;
    navigator.clipboard.writeText(active.config_text);
    toast.success("Skopiowano do schowka");
  };

  const handleExport = async (format: "pdf" | "docx") => {
    setExporting(format);
    try {
      await downloadExport(project.id, format);
      toast.success(`Plik ${format.toUpperCase()} wygenerowany`);
    } catch {
      toast.error(`Błąd eksportu ${format.toUpperCase()}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryNum}>{routers}</div>
          <div className={styles.summaryLbl}>Routery</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryNum}>{switches}</div>
          <div className={styles.summaryLbl}>Switche</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryNum}>{hosts}</div>
          <div className={styles.summaryLbl}>Hosty</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryNum}>{ifWithIp}</div>
          <div className={styles.summaryLbl}>IF z IP</div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Konfiguracja urządzeń</h3>

        {isLoading && <div className={styles.loading}><Loader2 size={16} className={styles.spin} /> Generowanie konfiguracji...</div>}

        {!isLoading && configs.length === 0 && (
          <p className={styles.muted}>Brak urządzeń w projekcie.</p>
        )}

        {!isLoading && configs.length > 0 && (
          <>
            <div className={styles.tabs}>
              {configs.map((cfg, i) => (
                <button
                  key={cfg.device_name}
                  className={`${styles.tab} ${i === activeIdx ? styles.tabActive : ""}`}
                  onClick={() => setActiveIdx(i)}
                >
                  {cfg.device_name}
                </button>
              ))}
            </div>

            <pre className={styles.configBlock}>{active?.config_text}</pre>

            <div className={styles.actionsRow}>
              <button onClick={handleCopy}>
                <Copy size={13} /> Kopiuj config
              </button>
              <button onClick={() => handleExport("pdf")} disabled={exporting !== null}>
                {exporting === "pdf" ? <Loader2 size={13} className={styles.spin} /> : <FileText size={13} />}
                Eksportuj PDF
              </button>
              <button onClick={() => handleExport("docx")} disabled={exporting !== null}>
                {exporting === "docx" ? <Loader2 size={13} className={styles.spin} /> : <FileType2 size={13} />}
                Eksportuj DOCX
              </button>
            </div>
          </>
        )}
      </div>

      <div className={styles.navRow}>
        <button onClick={() => setStep(1)}>
          <ArrowLeft size={14} /> Wstecz
        </button>
      </div>
    </div>
  );
}
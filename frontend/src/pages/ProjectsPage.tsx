import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, FolderOpen, Network, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { useProjects, useCreateProject, useDeleteProject } from "@/api/hooks";
import styles from "./ProjectsPage.module.css";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const project = await createProject.mutateAsync({ name: name.trim(), description: desc.trim() || undefined });
      toast.success(`Projekt "${project.name}" utworzony`);
      navigate(`/projects/${project.id}`);
    } catch {
      toast.error("Błąd tworzenia projektu");
    }
  };

  const handleDelete = async (id: number, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Usunąć projekt "${projectName}"? Tej operacji nie można cofnąć.`)) return;
    try {
      await deleteProject.mutateAsync(id);
      toast.success("Projekt usunięty");
    } catch {
      toast.error("Błąd usuwania projektu");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}><Network size={32} /></div>
        <h1 className={styles.heroTitle}>NetDoc Maker</h1>
        <p className={styles.heroSub}>Profesjonalna dokumentacja sieciowa · Cisco IOS · Topologia · Adresacja · Config</p>
      </div>

      <div className={styles.content}>
        <div className={styles.newCard}>
          <h2 className={styles.sectionTitle}>
            <Plus size={14} /> Nowy projekt
          </h2>
          <form onSubmit={handleCreate} className={styles.form}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nazwa projektu (np. Sieć firmowa ACME)"
              required
            />
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Opis (opcjonalnie)"
            />
            <button type="submit" className="primary" disabled={createProject.isPending}>
              <Plus size={14} />
              {createProject.isPending ? "Tworzenie..." : "Utwórz projekt"}
            </button>
          </form>
        </div>

        <div className={styles.projectsSection}>
          <h2 className={styles.sectionTitle}>
            <FolderOpen size={14} /> Projekty ({projects?.length ?? 0})
          </h2>
          {isLoading && <div className={styles.loading}>Ładowanie...</div>}
          {!isLoading && projects?.length === 0 && (
            <div className={styles.empty}>
              Brak projektów. Utwórz pierwszy powyżej.
            </div>
          )}
          <div className={styles.grid}>
            {projects?.map((p) => (
              <div key={p.id} className={styles.projectCard} onClick={() => navigate(`/projects/${p.id}`)}>
                <div className={styles.cardTop}>
                  <span className={styles.cardId}>#{p.id}</span>
                  <button
                    className={`danger ghost ${styles.deleteBtn}`}
                    onClick={(e) => handleDelete(p.id, p.name, e)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <h3 className={styles.cardName}>{p.name}</h3>
                {p.description && <p className={styles.cardDesc}>{p.description}</p>}
                <div className={styles.cardMeta}>
                  <Clock size={11} />
                  {new Date(p.created_at).toLocaleDateString("pl-PL")}
                </div>
                <div className={styles.cardAction}>Otwórz projekt →</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useRef, useState } from "react";
import { Plus, Trash2, Router, Server, Monitor, Shield, Network as SwitchIcon, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import type { ProjectDetail, Device, DeviceType } from "@/types";
import {
  useCreateDevice,
  useUpdateDevice,
  useDeleteDevice,
  useCreateLink,
  useDeleteLink,
} from "@/api/hooks";
import { useEditorStore } from "@/store/editorStore";
import styles from "./TopologyPanel.module.css";

const DEVICE_ICONS: Record<DeviceType, React.ElementType> = {
  router: Router,
  switch: SwitchIcon,
  pc: Monitor,
  server: Server,
  firewall: Shield,
};

const DEVICE_LABELS: Record<DeviceType, string> = {
  router: "Router",
  switch: "Switch",
  pc: "PC / Host",
  server: "Server",
  firewall: "Firewall",
};

export default function TopologyPanel({ project }: { project: ProjectDetail }) {
  const createDevice = useCreateDevice(project.id);
  const updateDevice = useUpdateDevice(project.id);
  const deleteDevice = useDeleteDevice(project.id);
  const createLink = useCreateLink(project.id);
  const deleteLink = useDeleteLink(project.id);

  const { selectedDeviceId, linkingFromId, setSelectedDevice, setLinkingFrom, setStep } = useEditorStore();

  const [newType, setNewType] = useState<DeviceType>("router");
  const [newName, setNewName] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);

  const handleAddDevice = async () => {
    const name = newName.trim() || `${newType.toUpperCase()[0]}${project.devices.filter((d) => d.device_type === newType).length + 1}`;
    const idx = project.devices.length;
    const x = 40 + (idx % 5) * 130;
    const y = 30 + Math.floor(idx / 5) * 100;
    try {
      await createDevice.mutateAsync({ name, device_type: newType, pos_x: x, pos_y: y });
      setNewName("");
      toast.success(`Dodano ${name}`);
    } catch {
      toast.error("Błąd dodawania urządzenia");
    }
  };

  const handleDeleteDevice = async (id: number) => {
    try {
      await deleteDevice.mutateAsync(id);
      if (selectedDeviceId === id) setSelectedDevice(null);
      toast.success("Urządzenie usunięte");
    } catch {
      toast.error("Błąd usuwania");
    }
  };

  const handleNodeClick = async (device: Device) => {
    if (linkingFromId === null) {
      setLinkingFrom(device.id);
      return;
    }
    if (linkingFromId === device.id) {
      setLinkingFrom(null);
      return;
    }
    const exists = project.links.some(
      (l) =>
        (l.device_a_id === linkingFromId && l.device_b_id === device.id) ||
        (l.device_a_id === device.id && l.device_b_id === linkingFromId)
    );
    if (exists) {
      toast.error("Połączenie już istnieje");
    } else {
      try {
        await createLink.mutateAsync({ device_a_id: linkingFromId, device_b_id: device.id });
        toast.success("Połączenie utworzone");
      } catch {
        toast.error("Błąd tworzenia połączenia");
      }
    }
    setLinkingFrom(null);
  };

  const handleDeleteLink = async (id: number) => {
    try {
      await deleteLink.mutateAsync(id);
    } catch {
      toast.error("Błąd usuwania połączenia");
    }
  };

  // Drag handling
  const onMouseDown = (e: React.MouseEvent, device: Device) => {
    if (!canvasRef.current) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragRef.current = {
      id: device.id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    e.stopPropagation();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const device = project.devices.find((d) => d.id === dragRef.current!.id);
    if (!device) return;
    const newX = Math.max(0, Math.min(canvasRect.width - 60, e.clientX - canvasRect.left - dragRef.current.offsetX));
    const newY = Math.max(0, Math.min(canvasRect.height - 60, e.clientY - canvasRect.top - dragRef.current.offsetY));
    device.pos_x = newX;
    device.pos_y = newY;
    const el = canvasRef.current.querySelector(`[data-device-id="${device.id}"]`) as HTMLElement | null;
    if (el) {
      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
    }
  };

  const onMouseUp = async () => {
    if (dragRef.current) {
      const device = project.devices.find((d) => d.id === dragRef.current!.id);
      if (device) {
        try {
          await updateDevice.mutateAsync({ id: device.id, pos_x: device.pos_x, pos_y: device.pos_y });
        } catch {
          // silent fail on position save
        }
      }
    }
    dragRef.current = null;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Dodaj urządzenie</h3>
        <div className={styles.addRow}>
          <select value={newType} onChange={(e) => setNewType(e.target.value as DeviceType)}>
            {Object.entries(DEVICE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <input
            placeholder="Nazwa (np. R1, SW1)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddDevice()}
          />
          <button className="primary" onClick={handleAddDevice} disabled={createDevice.isPending}>
            <Plus size={14} /> Dodaj
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.canvasHeader}>
          <h3 className={styles.cardTitle}>Topologia wizualna</h3>
          <div className={styles.linkHint}>
            <span className={`${styles.dot} ${linkingFromId !== null ? styles.dotActive : ""}`} />
            {linkingFromId === null
              ? "Kliknij urządzenie, potem drugie — aby je połączyć"
              : "Wybierz drugie urządzenie do połączenia"}
          </div>
        </div>

        <div
          className={styles.canvas}
          ref={canvasRef}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {project.devices.length === 0 && (
            <div className={styles.canvasEmpty}>Dodaj urządzenia aby zobaczyć topologię</div>
          )}

          <svg className={styles.linksSvg}>
            {project.links.map((link) => {
              const a = project.devices.find((d) => d.id === link.device_a_id);
              const b = project.devices.find((d) => d.id === link.device_b_id);
              if (!a || !b) return null;
              return (
                <g key={link.id} className={styles.linkGroup}>
                  <line
                    x1={a.pos_x + 24}
                    y1={a.pos_y + 24}
                    x2={b.pos_x + 24}
                    y2={b.pos_y + 24}
                    className={styles.linkLine}
                  />
                  <circle
                    cx={(a.pos_x + b.pos_x) / 2 + 24}
                    cy={(a.pos_y + b.pos_y) / 2 + 24}
                    r="7"
                    className={styles.linkDelete}
                    onClick={() => handleDeleteLink(link.id)}
                  />
                </g>
              );
            })}
          </svg>

          {project.devices.map((device) => {
            const Icon = DEVICE_ICONS[device.device_type];
            const isSelected = linkingFromId === device.id;
            return (
              <div
                key={device.id}
                data-device-id={device.id}
                className={`${styles.node} ${styles[device.device_type]} ${isSelected ? styles.selected : ""}`}
                style={{ left: device.pos_x, top: device.pos_y }}
                onMouseDown={(e) => onMouseDown(e, device)}
                onClick={() => handleNodeClick(device)}
              >
                <div className={styles.nodeIcon}><Icon size={20} /></div>
                <div className={styles.nodeLabel}>{device.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Lista urządzeń ({project.devices.length})</h3>
        {project.devices.length === 0 ? (
          <p className={styles.muted}>Brak urządzeń.</p>
        ) : (
          <div className={styles.deviceList}>
            {project.devices.map((device) => {
              const Icon = DEVICE_ICONS[device.device_type];
              return (
                <div key={device.id} className={styles.deviceItem}>
                  <Icon size={16} />
                  <span className={styles.deviceName}>{device.name}</span>
                  <span className={`${styles.badge} ${styles[device.device_type]}`}>
                    {device.device_type}
                  </span>
                  <button className="danger ghost" onClick={() => handleDeleteDevice(device.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.navRow}>
        <span className={styles.muted}>
          {project.devices.length === 0 ? "Dodaj przynajmniej jedno urządzenie" : `${project.links.length} połączeń skonfigurowanych`}
        </span>
        <button className="primary" onClick={() => setStep(1)} disabled={project.devices.length === 0}>
          Dalej: Adresacja <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import type { ProjectDetail, AddressEntry, DeviceType } from "@/types";
import { useBulkCreateAddresses, useUpdateAddress, useDeleteAddress, useCreateAddress } from "@/api/hooks";
import { useEditorStore } from "@/store/editorStore";
import styles from "./AddressingPanel.module.css";

const DEFAULT_IFACE: Record<DeviceType, string> = {
  router: "GigabitEthernet0/0",
  switch: "Vlan1",
  pc: "Ethernet0",
  server: "eth0",
  firewall: "GigabitEthernet0/0",
};

export default function AddressingPanel({ project }: { project: ProjectDetail }) {
  const { setStep } = useEditorStore();
  const bulkCreate = useBulkCreateAddresses(project.id);
  const updateAddress = useUpdateAddress(project.id);
  const deleteAddress = useDeleteAddress(project.id);
  const createAddress = useCreateAddress(project.id);

  const [localEntries, setLocalEntries] = useState<AddressEntry[]>(project.address_entries);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    setLocalEntries(project.address_entries);
  }, [project.address_entries]);

  // Auto-seed address rows for devices without an entry yet
  useEffect(() => {
    if (seeded) return;
    const existingNames = new Set(project.address_entries.map((e) => e.device_name));
    const missing = project.devices.filter((d) => !existingNames.has(d.name));
    if (missing.length > 0) {
      setSeeded(true);
      bulkCreate.mutate(
        missing.map((d) => ({
          device_name: d.name,
          device_type: d.device_type,
          interface: DEFAULT_IFACE[d.device_type],
          subnet_mask: "255.255.255.0",
        }))
      );
    } else {
      setSeeded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.devices]);

  const handleFieldChange = (id: number, field: keyof AddressEntry, value: string) => {
    setLocalEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const handleBlur = async (entry: AddressEntry) => {
    try {
      await updateAddress.mutateAsync({
        id: entry.id,
        device_name: entry.device_name,
        interface: entry.interface,
        ip_address: entry.ip_address,
        subnet_mask: entry.subnet_mask,
        gateway: entry.gateway,
      });
    } catch {
      toast.error("Błąd zapisu wiersza");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAddress.mutateAsync(id);
      toast.success("Wiersz usunięty");
    } catch {
      toast.error("Błąd usuwania");
    }
  };

  const handleAddRow = async () => {
    const firstDevice = project.devices[0];
    try {
      await createAddress.mutateAsync({
        device_name: firstDevice?.name ?? "",
        device_type: firstDevice?.device_type ?? "pc",
        interface: firstDevice ? DEFAULT_IFACE[firstDevice.device_type] : "eth0",
        subnet_mask: "255.255.255.0",
      });
    } catch {
      toast.error("Błąd dodawania wiersza");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Tablica adresacji IP</h3>
        <p className={styles.hint}>Uzupełnij adresy IP, maski i bramy dla każdego interfejsu.</p>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Urządzenie</th>
                <th>Interfejs</th>
                <th>Adres IP</th>
                <th>Maska</th>
                <th>Brama</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {localEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <span className={`${styles.devBadge} ${styles[entry.device_type]}`}>{entry.device_name}</span>
                  </td>
                  <td>
                    <input
                      value={entry.interface}
                      onChange={(e) => handleFieldChange(entry.id, "interface", e.target.value)}
                      onBlur={() => handleBlur(localEntries.find((x) => x.id === entry.id)!)}
                    />
                  </td>
                  <td>
                    <input
                      placeholder="192.168.1.1"
                      value={entry.ip_address ?? ""}
                      onChange={(e) => handleFieldChange(entry.id, "ip_address", e.target.value)}
                      onBlur={() => handleBlur(localEntries.find((x) => x.id === entry.id)!)}
                    />
                  </td>
                  <td>
                    <input
                      placeholder="255.255.255.0"
                      value={entry.subnet_mask}
                      onChange={(e) => handleFieldChange(entry.id, "subnet_mask", e.target.value)}
                      onBlur={() => handleBlur(localEntries.find((x) => x.id === entry.id)!)}
                    />
                  </td>
                  <td>
                    <input
                      placeholder="—"
                      value={entry.gateway ?? ""}
                      onChange={(e) => handleFieldChange(entry.id, "gateway", e.target.value)}
                      onBlur={() => handleBlur(localEntries.find((x) => x.id === entry.id)!)}
                    />
                  </td>
                  <td>
                    <button className="danger ghost" onClick={() => handleDelete(entry.id)}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {localEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyRow}>
                    Brak wpisów. Dodaj urządzenia w kroku Topologia lub dodaj wiersz ręcznie.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button className={styles.addRowBtn} onClick={handleAddRow}>
          <Plus size={13} /> Dodaj wiersz
        </button>
      </div>

      <div className={styles.navRow}>
        <button onClick={() => setStep(0)}>
          <ArrowLeft size={14} /> Wstecz
        </button>
        <button className="primary" onClick={() => setStep(2)}>
          Dalej: Konfiguracja <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
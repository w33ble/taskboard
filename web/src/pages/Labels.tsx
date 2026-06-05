import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Tag } from "lucide-react";
import { api, type Label } from "../api/client";

const PRESET_COLORS = [
  "#B60205",
  "#D93F0B",
  "#E99695",
  "#F9D0C4",
  "#FEF2C0",
  "#0E8A16",
  "#006B75",
  "#1D76DB",
  "#0052CC",
  "#5319E7",
  "#BFDADC",
  "#C5DEF5",
  "#D4C5F9",
  "#D1D5DB",
  "#475569",
  "#6B7280",
];

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-transform hover:scale-110 ${
            value === c ? "border-white" : "border-transparent"
          }`}
          style={{ backgroundColor: c }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded-full cursor-pointer border-0 p-0 bg-transparent"
      />
    </div>
  );
}

export default function Labels() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createName, setCreateName] = useState("");
  const [createColor, setCreateColor] = useState(PRESET_COLORS[0]);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const load = async () => {
    try {
      const data = await api.labels.list();
      setLabels(data || []);
    } catch {
      setLabels([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!createName.trim() || !createColor) return;
    await api.labels.create({ name: createName.trim(), color: createColor });
    setCreateName("");
    setCreateColor(PRESET_COLORS[0]);
    setCreating(false);
    load();
  };

  const handleEditStart = (label: Label) => {
    setEditingId(label.id);
    setEditName(label.name);
    setEditColor(label.color);
  };

  const handleEditSave = async () => {
    if (!editingId || !editName.trim()) return;
    await api.labels.update(editingId, {
      name: editName.trim(),
      color: editColor,
    });
    setEditingId(null);
    load();
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this label? It will be removed from all tickets.")) return;
    await api.labels.delete(id);
    setLabels((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="h-full flex flex-col">
      <header className="shrink-0 flex items-center justify-between px-6 h-14 border-b border-slate-800">
        <h1 className="text-lg font-semibold text-white">Labels</h1>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Label
        </button>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-600">
            Loading labels&hellip;
          </div>
        ) : labels.length === 0 && !creating ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-600 space-y-3">
            <Tag className="w-10 h-10 text-slate-700" />
            <p className="text-sm">No labels yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {creating && (
              <div className="bg-slate-900 border border-blue-500/50 rounded-lg p-4 space-y-3">
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Label name"
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white w-full placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                    if (e.key === "Escape") setCreating(false);
                  }}
                />
                <ColorPicker value={createColor} onChange={setCreateColor} />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setCreating(false)}
                    className="px-3 py-1 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!createName.trim()}
                    className="px-3 py-1 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}

            {labels.map((label) =>
              editingId === label.id ? (
                <div
                  key={label.id}
                  className="bg-slate-900 border border-blue-500/50 rounded-lg p-4 space-y-3"
                >
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSave();
                      if (e.key === "Escape") handleEditCancel();
                    }}
                  />
                  <ColorPicker value={editColor} onChange={setEditColor} />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleEditCancel}
                      className="px-3 py-1 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditSave}
                      disabled={!editName.trim()}
                      className="px-3 py-1 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={label.id}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="text-sm text-white">{label.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditStart(label)}
                      className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(label.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

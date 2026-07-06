"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PrimaryButton, GhostButton, Modal, Field, inputClass } from "./ui";
import { ImageUpload } from "./ImageUpload";

type Collection = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  coverImagePublicId: string | null;
  featuredOnHomepage: boolean;
};

type EditingState = {
  id?: number;
  name: string;
  description: string;
  coverImageUrl: string;
  coverImagePublicId: string;
  featuredOnHomepage: boolean;
};

export function CollectionsClient({ initialCollections }: { initialCollections: Collection[] }) {
  const [collections, setCollections] = useState(initialCollections);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [saving, setSaving] = useState(false);

  async function toggleFeatured(c: Collection) {
    const res = await fetch(`/api/admin/collections/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featuredOnHomepage: !c.featuredOnHomepage }),
    });
    if (res.ok) {
      setCollections((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, featuredOnHomepage: !c.featuredOnHomepage } : x))
      );
    }
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    const isNew = !editing.id;
    const body = {
      name: editing.name,
      description: editing.description,
      coverImageUrl: editing.coverImageUrl,
      coverImagePublicId: editing.coverImagePublicId,
      featuredOnHomepage: editing.featuredOnHomepage,
    };
    const res = await fetch(
      isNew ? "/api/admin/collections" : `/api/admin/collections/${editing.id}`,
      {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    if (res.ok) {
      setCollections((prev) =>
        isNew ? [...prev, data] : prev.map((c) => (c.id === data.id ? data : c))
      );
      setEditing(null);
    }
    setSaving(false);
  }

  async function remove(id: number) {
    await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }

  function openNew() {
    setEditing({
      name: "",
      description: "",
      coverImageUrl: "",
      coverImagePublicId: "",
      featuredOnHomepage: false,
    });
  }

  function openEdit(c: Collection) {
    setEditing({
      id: c.id,
      name: c.name,
      description: c.description || "",
      coverImageUrl: c.coverImageUrl || "",
      coverImagePublicId: c.coverImagePublicId || "",
      featuredOnHomepage: c.featuredOnHomepage,
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="font-heading text-2xl font-bold">Collections</div>
        <PrimaryButton onClick={openNew}>
          <Plus className="w-4 h-4" /> Add Collection
        </PrimaryButton>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {collections.map((c) => (
          <div key={c.id} className="bg-white border border-neutral-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.coverImageUrl || "https://picsum.photos/seed/cpt-placeholder/600/400"}
              alt={c.name}
              className="w-full h-36 object-cover bg-neutral-100"
            />
            <div className="p-4">
              <div className="font-heading font-bold">{c.name}</div>
              <div className="text-xs text-neutral-500 mt-1">{c.description}</div>
              <label className="flex items-center gap-2 text-xs mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={c.featuredOnHomepage}
                  onChange={() => toggleFeatured(c)}
                />
                Featured on homepage
              </label>
              <div className="flex gap-2 mt-3">
                <GhostButton onClick={() => openEdit(c)}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </GhostButton>
                <GhostButton onClick={() => remove(c.id)}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </GhostButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal
          title={editing.id ? "Edit Collection" : "Add Collection"}
          onClose={() => setEditing(null)}
        >
          <Field label="Cover image">
            <ImageUpload
              value={editing.coverImageUrl}
              publicId={editing.coverImagePublicId}
              onChange={(url, publicId) =>
                setEditing({ ...editing, coverImageUrl: url, coverImagePublicId: publicId })
              }
              aspectClass="aspect-[16/9]"
            />
          </Field>
          <Field label="Name">
            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className={`${inputClass} h-20`}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={editing.featuredOnHomepage}
              onChange={(e) =>
                setEditing({ ...editing, featuredOnHomepage: e.target.checked })
              }
            />
            Featured on homepage
          </label>
          <div className="flex justify-end gap-3 mt-2">
            <GhostButton onClick={() => setEditing(null)}>Cancel</GhostButton>
            <PrimaryButton onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  createSection,
  deleteSection,
  fetchAllPlatforms,
  fetchAllSections,
  updateSection,
} from '@/lib/content-api';
import type { Platform, Section } from '@/lib/database.types';
import { PageHeader } from '../components/PageHeader';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

const emptyForm = {
  platform_id: '',
  slug: '',
  name: '',
  description: '',
  color: '#000000',
  bg_color: '#F4FFD6',
  icon: 'Folder',
  sort_order: 0,
  is_published: false,
};

export function SectionsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [rows, setRows] = useState<Section[]>([]);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Section | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, s] = await Promise.all([
        fetchAllPlatforms(),
        fetchAllSections(filterPlatform === 'all' ? undefined : filterPlatform),
      ]);
      setPlatforms(p);
      setRows(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sections');
    } finally {
      setLoading(false);
    }
  }, [filterPlatform]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      platform_id: platforms[0]?.id ?? '',
    });
    setDialogOpen(true);
  };

  const openEdit = (row: Section) => {
    setEditing(row);
    setForm({
      platform_id: row.platform_id,
      slug: row.slug,
      name: row.name,
      description: row.description ?? '',
      color: row.color,
      bg_color: row.bg_color,
      icon: row.icon,
      sort_order: row.sort_order,
      is_published: row.is_published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        platform_id: form.platform_id,
        slug: form.slug.trim().toLowerCase(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        color: form.color,
        bg_color: form.bg_color,
        icon: form.icon.trim() || 'Folder',
        sort_order: Number(form.sort_order),
        is_published: form.is_published,
      };
      if (editing) await updateSection(editing.id, payload);
      else await createSection(payload);
      setDialogOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: Section) => {
    if (!confirm(`Delete section "${row.name}" and all its tutorials?`)) return;
    try {
      await deleteSection(row.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Sections"
        description="Profiles, categories, or groupings under each platform."
        actionLabel="Add section"
        onAction={openCreate}
      />

      <div className="mb-6 flex items-center gap-3">
        <Label className="shrink-0">Platform</Label>
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {platforms.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No sections yet. Create a platform first, then add sections.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Platform</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Icon</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.platforms?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.slug}</td>
                  <td className="px-4 py-3">{row.icon}</td>
                  <td className="px-4 py-3">{row.is_published ? 'Yes' : 'Draft'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(row)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleDelete(row)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit section' : 'New section'}</DialogTitle>
            <DialogDescription className="sr-only">
              {editing ? 'Update section details' : 'Create a section under a platform'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-2">
            <div className="grid gap-2">
              <Label>Platform</Label>
              <Select
                value={form.platform_id}
                onValueChange={(v) => setForm({ ...form, platform_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                disabled={!!editing}
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Icon (Lucide name)</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              />
              Published
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving || !form.name || !form.slug || !form.platform_id}
              className="bg-nav-active text-nav-active-foreground"
              onClick={handleSave}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

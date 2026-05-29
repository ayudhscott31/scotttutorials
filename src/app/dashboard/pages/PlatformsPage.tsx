import { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  createPlatform,
  deletePlatform,
  fetchAllPlatforms,
  updatePlatform,
} from '@/lib/content-api';
import type { Platform } from '@/lib/database.types';
import { isValidSlug, slugify } from '@/lib/slugify';
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

const emptyForm = {
  slug: '',
  name: '',
  subtitle: '',
  emoji: '',
  sort_order: 0,
  is_published: false,
};

export function PlatformsPage() {
  const [rows, setRows] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Platform | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchAllPlatforms());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load platforms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row: Platform) => {
    setEditing(row);
    setForm({
      slug: row.slug,
      name: row.name,
      subtitle: row.subtitle ?? '',
      emoji: row.emoji ?? '',
      sort_order: row.sort_order,
      is_published: row.is_published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const name = form.name.trim();
      const slug = slugify(form.slug || name);
      if (!name) {
        setError('Name is required.');
        return;
      }
      if (!slug || !isValidSlug(slug)) {
        setError('Slug must use lowercase letters, numbers, and hyphens only (e.g. scott-app).');
        return;
      }
      const payload = {
        slug,
        name,
        subtitle: form.subtitle.trim() || null,
        emoji: form.emoji.trim() || null,
        sort_order: Number(form.sort_order),
        is_published: form.is_published,
      };
      if (editing) await updatePlatform(editing.id, payload);
      else await createPlatform(payload);
      setDialogOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: Platform) => {
    if (!confirm(`Delete platform "${row.name}" and all its sections & tutorials?`)) return;
    try {
      await deletePlatform(row.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Platforms"
        description="Create platforms shown in the mobile app navigation."
        actionLabel="Add platform"
        onAction={openCreate}
      />

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No platforms yet. Add your first platform to get started.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3 font-medium w-24" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {row.emoji} {row.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.slug}</td>
                  <td className="px-4 py-3">{row.sort_order}</td>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit platform' : 'New platform'}</DialogTitle>
            <DialogDescription className="sr-only">
              {editing ? 'Update platform details' : 'Create a new platform for the mobile app'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name,
                    slug: editing ? prev.slug : slugify(name),
                  }));
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label>Slug (auto from name, e.g. scott-app)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                disabled={!!editing}
                placeholder="scott-app"
              />
            </div>
            <div className="grid gap-2">
              <Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Emoji</Label>
              <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="📱" />
            </div>
            <div className="grid gap-2">
              <Label>Sort order</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              />
              Published (visible in mobile app)
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving || !form.name || !form.slug}
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

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  createTutorial,
  deleteTutorial,
  fetchAllPlatforms,
  fetchAllSections,
  fetchAllTutorials,
  updateTutorial,
} from '@/lib/content-api';
import type { Platform, Section, Tutorial, TutorialType } from '@/lib/database.types';
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
  section_id: '',
  type: 'video' as TutorialType,
  title: '',
  description: '',
  video_url: '',
  poster_url: '',
  duration: '',
  document_url: '',
  file_type: 'PDF',
  file_size: '',
  published_at: '',
  sort_order: 0,
  is_published: true,
};

export function TutorialsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [rows, setRows] = useState<Tutorial[]>([]);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Tutorial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadMeta = useCallback(async () => {
    const [p, allS, filteredS] = await Promise.all([
      fetchAllPlatforms(),
      fetchAllSections(),
      fetchAllSections(filterPlatform === 'all' ? undefined : filterPlatform),
    ]);
    setPlatforms(p);
    setAllSections(allS);
    setSections(filteredS);
  }, [filterPlatform]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadMeta();
      const t = await fetchAllTutorials(
        filterSection === 'all' ? undefined : filterSection,
      );
      setRows(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tutorials');
    } finally {
      setLoading(false);
    }
  }, [filterSection, loadMeta]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setFilterSection('all');
  }, [filterPlatform]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      section_id: allSections[0]?.id ?? '',
    });
    setDialogOpen(true);
  };

  const openEdit = (row: Tutorial) => {
    setEditing(row);
    setForm({
      section_id: row.section_id,
      type: row.type,
      title: row.title,
      description: row.description ?? '',
      video_url: row.video_url ?? '',
      poster_url: row.poster_url ?? '',
      duration: row.duration ?? '',
      document_url: row.document_url ?? '',
      file_type: row.file_type ?? 'PDF',
      file_size: row.file_size ?? '',
      published_at: row.published_at ?? '',
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
        section_id: form.section_id,
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim() || null,
        video_url: form.type === 'video' ? form.video_url.trim() || null : null,
        poster_url: form.poster_url.trim() || null,
        duration: form.duration.trim() || null,
        document_url: form.type === 'document' ? form.document_url.trim() || null : null,
        file_type: form.type === 'document' ? form.file_type : null,
        file_size: form.type === 'document' ? form.file_size.trim() || null : null,
        published_at: form.published_at || null,
        sort_order: Number(form.sort_order),
        is_published: form.is_published,
      };
      if (editing) await updateTutorial(editing.id, payload);
      else await createTutorial(payload);
      setDialogOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: Tutorial) => {
    if (!confirm(`Delete tutorial "${row.title}"?`)) return;
    try {
      await deleteTutorial(row.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Tutorials"
        description="Videos (Google Drive link) and documents for each section."
        actionLabel="Add tutorial"
        onAction={openCreate}
      />

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>Platform</Label>
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {platforms.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label>Section</Label>
          <Select value={filterSection} onValueChange={setFilterSection}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {sections.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No tutorials yet. Add a section first, then create tutorials here.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Section</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{row.title}</td>
                  <td className="px-4 py-3 capitalize">{row.type}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.sections?.name ?? '—'}
                  </td>
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
            <DialogTitle>{editing ? 'Edit tutorial' : 'New tutorial'}</DialogTitle>
            <DialogDescription className="sr-only">
              {editing ? 'Update tutorial content' : 'Add a video or document tutorial'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[65vh] gap-4 overflow-y-auto py-2">
            <div className="grid gap-2">
              <Label>Section</Label>
              <Select
                value={form.section_id}
                onValueChange={(v) => setForm({ ...form, section_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {allSections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.platforms?.name ? `${s.platforms.name} → ` : ''}
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as TutorialType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            {form.type === 'video' ? (
              <>
                <div className="grid gap-2">
                  <Label>Video URL (YouTube, Google Drive, or direct .mp4)</Label>
                  <Input
                    value={form.video_url}
                    onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                    placeholder="https://youtu.be/… or https://drive.google.com/… or .mp4 link"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Poster image URL (optional)</Label>
                  <Input
                    value={form.poster_url}
                    onChange={(e) => setForm({ ...form, poster_url: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Duration (e.g. 12:34)</Label>
                  <Input
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label>Document URL (Google Drive)</Label>
                  <Input
                    value={form.document_url}
                    onChange={(e) => setForm({ ...form, document_url: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>File type</Label>
                    <Input
                      value={form.file_type}
                      onChange={(e) => setForm({ ...form, file_type: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>File size</Label>
                    <Input
                      value={form.file_size}
                      onChange={(e) => setForm({ ...form, file_size: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Published date</Label>
                <Input
                  type="date"
                  value={form.published_at}
                  onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                />
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
              Published — must be checked for mobile app to show this tutorial
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving || !form.title || !form.section_id}
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

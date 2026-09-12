'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { createClient } from '@/lib/supabase/client';
import { FileText, Plus, Search, Edit2, Trash2, Loader2, X, Save, RefreshCw, EyeOff, Archive, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  cover_image_url: string;
  published_at: string | null;
  created_at: string;
}

const CATEGORIES = [
  'Herbal Remedies', 'Men\'s Health', 'Women\'s Wellness', 'Nutrition',
  'Weight Management', 'Mental Wellness', 'Detox & Digestion', 'General Wellness'
];

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-amber-100 text-amber-700',
  archived: 'bg-gray-100 text-gray-600',
};

const emptyForm = (): Omit<BlogPost, 'id' | 'created_at'> => ({
  title: '', slug: '', excerpt: '', content: '', author: 'PJHerbal Team',
  category: 'General Wellness', status: 'draft', cover_image_url: '', published_at: null,
});

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminBlogPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      toast.error('Failed to load posts', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const filtered = useMemo(() => {
    let data = [...posts];
    if (statusFilter !== 'all') data = data.filter(p => p.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p => p.title.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    return data;
  }, [posts, search, statusFilter]);

  const counts = useMemo(() => ({
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
    archived: posts.filter(p => p.status === 'archived').length,
  }), [posts]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (p: BlogPost) => {
    setEditingId(p.id);
    setForm({
      title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content,
      author: p.author, category: p.category, status: p.status,
      cover_image_url: p.cover_image_url, published_at: p.published_at,
    });
    setShowForm(true);
  };

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: editingId ? f.slug : slugify(title) }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Title and Slug are required');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        title: form.title, slug: form.slug, excerpt: form.excerpt,
        content: form.content, author: form.author, category: form.category,
        status: form.status, cover_image_url: form.cover_image_url,
      };
      if (form.status === 'published' && !form.published_at) {
        payload.published_at = new Date().toISOString();
      } else {
        payload.published_at = form.published_at;
      }

      if (editingId) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Post updated');
      } else {
        const { error } = await supabase.from('blog_posts').insert(payload);
        if (error) throw error;
        toast.success('Post created');
      }
      setShowForm(false);
      fetchPosts();
    } catch (err: any) {
      toast.error('Save failed', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      toast.success('Post deleted');
      fetchPosts();
    } catch (err: any) {
      toast.error('Delete failed', { description: err.message });
    }
  };

  const handleStatusChange = async (id: string, status: 'published' | 'draft' | 'archived') => {
    try {
      const update: any = { status };
      if (status === 'published') update.published_at = new Date().toISOString();
      const { error } = await supabase.from('blog_posts').update(update).eq('id', id);
      if (error) throw error;
      toast.success(`Post ${status}`);
      fetchPosts();
    } catch (err: any) {
      toast.error('Update failed', { description: err.message });
    }
  };

  return (
    <AdminLayout currentPath="/admin/blog">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center flex-shrink-0">
              <FileText size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Blog Manager</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {counts.published} published · {counts.draft} drafts · {counts.archived} archived
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchPosts} className="btn-ghost text-sm" title="Refresh"><RefreshCw size={15} /></button>
            <button onClick={openAdd} className="btn-primary text-sm"><Plus size={15} /> New Post</button>
          </div>
        </div>

        {/* Filters */}
        <div className="card-base p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text" placeholder="Search posts…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-8 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'published', 'draft', 'archived'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card-base overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 size={20} className="animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading posts…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <FileText size={32} className="text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No posts found</p>
              <button onClick={openAdd} className="btn-primary text-xs mt-2"><Plus size={12} /> Create First Post</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Author</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Date</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(post => (
                    <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground text-sm line-clamp-1">{post.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{post.excerpt}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">{post.category}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">{post.author}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[post.status]}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString('en-TZ', { day: 'numeric', month: 'short', year: 'numeric' })
                            : new Date(post.created_at).toLocaleDateString('en-TZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {post.status !== 'published' && (
                            <button
                              onClick={() => handleStatusChange(post.id, 'published')}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-colors"
                              title="Publish"
                            >
                              <Globe size={14} />
                            </button>
                          )}
                          {post.status === 'published' && (
                            <button
                              onClick={() => handleStatusChange(post.id, 'draft')}
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition-colors"
                              title="Unpublish"
                            >
                              <EyeOff size={14} />
                            </button>
                          )}
                          {post.status !== 'archived' && (
                            <button
                              onClick={() => handleStatusChange(post.id, 'archived')}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground hover:text-gray-600 transition-colors"
                              title="Archive"
                            >
                              <Archive size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(post)}
                            className="p-1.5 rounded-lg hover:bg-primary-light text-muted-foreground hover:text-primary transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Post Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-card rounded-2xl border border-border shadow-modal w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">
                {editingId ? 'Edit Post' : 'New Blog Post'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Title *</label>
                  <input
                    type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)}
                    placeholder="Post title…"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Slug *</label>
                  <input
                    type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    placeholder="post-url-slug"
                    className="input-field text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field text-sm">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Author</label>
                  <input
                    type="text" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} className="input-field text-sm">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Cover Image URL</label>
                  <input
                    type="url" value={form.cover_image_url} onChange={e => setForm(f => ({ ...f, cover_image_url: e.target.value }))}
                    placeholder="https://…"
                    className="input-field text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Excerpt</label>
                  <textarea
                    value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                    rows={2} placeholder="Short summary shown in blog listing…"
                    className="input-field text-sm resize-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Content</label>
                  <textarea
                    value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    rows={10} placeholder="Full article content (Markdown supported)…"
                    className="input-field text-sm resize-y font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> {editingId ? 'Update Post' : 'Create Post'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

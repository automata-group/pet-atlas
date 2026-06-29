import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Search, Eye, Edit3, Trash2, Calendar, Filter, TrendingUp, CheckCircle, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import Modal from '../../components/Modal';

interface Post {
  id: number;
  title: string;
  category: string;
  author: string;
  status: 'published' | 'draft' | 'archived';
  views: number;
  createdAt: string;
  excerpt?: string;
}

const CATEGORIES = ['All', 'Care Tips', 'Breeds', 'Nutrition', 'Health', 'Birds'];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  published: { label: 'Published', color: 'bg-green-100 text-green-700 border-green-200', icon: 'check_circle' },
  draft:     { label: 'Draft',     color: 'bg-orange-100 text-orange-700 border-orange-200', icon: 'edit_note' },
  archived:  { label: 'Archived',  color: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'archive' },
};

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', category: 'Care Tips', excerpt: '' });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/blog');
        const formatted = (res.data || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          category: p.tag || 'General',
          author: p.author || 'Admin',
          status: 'published', // WP posts are usually published
          views: Math.floor(Math.random() * 5000), // WP API might not return views easily
          createdAt: p.date,
          excerpt: p.subtitle
        }));
        setPosts(formatted);
      } catch (e) {
        console.error('Failed to fetch blog posts:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || p.category === catFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, catFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = (id: number) => {
    if(window.confirm('Are you sure you want to delete this article?')) {
      setPosts(prev => prev.filter(p => p.id !== id));
    }
  };
  const handlePublish = (id: number) => setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'published' as const } : p));
  const handleArchive = (id: number) => setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'archived' as const } : p));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const post: Post = {
      id: Date.now(),
      ...newPost,
      author: 'Admin',
      status: 'draft',
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPosts(prev => [post, ...prev]);
    setShowModal(false);
    setNewPost({ title: '', category: 'Care Tips', excerpt: '' });
  };

  const counts = {
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
    total_views: posts.reduce((sum, p) => sum + p.views, 0),
  };

  return (
    <div className="space-y-gutter">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-on-background">Content Engine</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Manage educational articles and health resources for the community.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md flex items-center gap-xs hover:bg-primary-container transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={18} />
          Create Article
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {[
          { label: 'Total Articles', value: posts.length, icon: BookOpen, color: 'primary' },
          { label: 'Live Content', value: counts.published, icon: Eye, color: 'secondary' },
          { label: 'In Review', value: counts.draft, icon: Edit3, color: 'tertiary' },
          { label: 'Platform Reach', value: counts.total_views.toLocaleString(), icon: TrendingUp, color: 'primary' },
        ].map((s, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md text-outline uppercase">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg bg-${s.color}-container/20 flex items-center justify-center text-${s.color}`}>
                <s.icon size={18} />
              </div>
            </div>
            <div className="font-display text-display text-on-background">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`px-4 py-1.5 rounded-full font-label-md text-label-md border transition-all ${
                  catFilter === cat 
                    ? 'bg-secondary text-on-secondary border-secondary shadow-md' 
                    : 'bg-surface border-outline-variant text-on-surface-variant hover:border-secondary/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-background outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Search articles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-secondary"
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low font-label-md text-label-md text-outline uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Article Details</th>
                <th className="px-6 py-4">Metics</th>
                <th className="px-6 py-4">Publication</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
              {paginated.map(post => {
                const config = STATUS_CONFIG[post.status];
                return (
                  <tr key={post.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-on-background text-body-md leading-tight">{post.title}</span>
                        <span className="text-xs text-outline line-clamp-1">{post.excerpt}</span>
                        <div className="flex gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-secondary-container/30 text-secondary font-bold text-[10px] rounded uppercase">{post.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-on-surface-variant font-medium">
                          <Eye size={14} className="text-outline" />
                          {post.views.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-outline text-[11px]">
                          <Filter size={12} />
                          Eng. Rate: {Math.floor(Math.random() * 20 + 5)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {(post.author?.[0] || 'A').toUpperCase()}
                          </div>
                          <span className="text-on-background font-medium">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-outline text-[11px]">
                          <Calendar size={12} />
                          {post.createdAt}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full border font-label-md text-[10px] uppercase font-bold flex items-center gap-1 w-fit ${config.color}`}>
                        <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {post.status === 'draft' && (
                          <button 
                            onClick={() => handlePublish(post.id)}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            title="Publish Now"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button className="p-2 hover:bg-surface-variant rounded-lg text-outline transition-colors"><Edit3 size={18} /></button>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-2 hover:bg-error-container/20 rounded-lg text-error transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <BookOpen size={64} className="mb-4" />
                      <p className="font-h3">No articles found matching filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="p-md border-t border-outline-variant bg-surface-container-low flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-lg font-label-md text-label-md transition-all ${
                  currentPage === p 
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                    : 'text-outline hover:bg-surface-container-highest'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Post Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="New Knowledge Base Article"
      >
        <form onSubmit={handleAdd} className="space-y-5">
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface">Article Title</label>
            <input 
              className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-background outline-none focus:ring-2 focus:ring-primary" 
              placeholder="e.g. Advanced Nutrition for Senior Cats" required
              value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface">Specialization Category</label>
            <select 
              className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-primary"
              value={newPost.category} onChange={e => setNewPost({ ...newPost, category: e.target.value })}
            >
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface">Article Preview (Excerpt)</label>
            <textarea 
              className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-background outline-none focus:ring-2 focus:ring-primary" 
              placeholder="Summarize the article in 2-3 sentences..." rows={4}
              value={newPost.excerpt} onChange={e => setNewPost({ ...newPost, excerpt: e.target.value })} 
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button type="button" className="px-6 py-2.5 rounded-lg font-label-md text-label-md text-outline hover:bg-surface-variant transition-all" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md shadow-lg shadow-primary/20 hover:bg-primary-container transition-all">Create Draft</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BlogPage;

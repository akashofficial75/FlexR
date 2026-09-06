import React from 'react';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../types';
import { Edit2, Plus, Trash2, X, Loader2 } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';
import { cn } from '../../lib/utils';

export default function AdminCategories() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);

  // Form State
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [images, setImages] = React.useState<string[]>([]);
  const [active, setActive] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
    
    if (fetchError) {
      if (fetchError.message.includes('Could not find the table') || fetchError.code === 'PGRST116' || fetchError.code === '42P01') {
        setError(`Database Error: The 'categories' table does not exist or the schema cache is stale. Please run the SQL migration in your Supabase SQL Editor to create the necessary tables, buckets, and policies, then click 'Reload Schema Cache' below or run "NOTIFY pgrst, 'reload schema';"`);
      } else {
        setError(fetchError.message);
      }
    }
    
    if (data) setCategories(data);
    setLoading(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!editingCategory) { // Only auto-generate slug for new categories
      setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const openModal = (category?: Category) => {
    setError('');
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || '');
      setImages(category.image ? [category.image] : []);
      setActive(category.active);
    } else {
      setEditingCategory(null);
      setName('');
      setSlug('');
      setDescription('');
      setImages([]);
      setActive(true);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    if (!name || !slug) {
      setError('Name and slug are required');
      setSaving(false);
      return;
    }

    const payload = {
      name,
      slug,
      description,
      image: images[0] || null,
      active
    };

    try {
      if (editingCategory) {
        const { error: updateError } = await supabase.from('categories').update(payload).eq('id', editingCategory.id);
        if (updateError) {
           if (updateError.code === '23505') throw new Error('A category with this slug already exists.');
           throw updateError;
        }
      } else {
        const { error: insertError } = await supabase.from('categories').insert(payload);
        if (insertError) {
           if (insertError.code === '23505') throw new Error('A category with this slug already exists.');
           throw insertError;
        }
      }
      await fetchCategories();
      closeModal();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (category: Category) => {
    if (!window.confirm('Are you sure you want to delete this category? Products associated with this category will have their category removed. Check products first if you want to avoid breaking storefront views.')) {
      return;
    }
    
    try {
      if (!window.confirm('WARNING: Deleting this category will permanently delete all products inside it. Do you still want to proceed?')) {
        return;
      }

      // Cleanup image from storage if exists
      if (category.image) {
        const pathToRemove = category.image.split('/category-images/').pop();
        if (pathToRemove) {
          await supabase.storage.from('category-images').remove([pathToRemove]);
        }
      }

      const { error } = await supabase.from('categories').delete().eq('id', category.id);
      if (error) throw error;
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Categories</h1>
          <p className="text-neutral-400">Manage product categories.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-lime-500 hover:bg-lime-400 text-neutral-950 font-bold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl flex flex-col gap-4">
          <div className="text-red-400 font-medium">{error}</div>
          <div className="bg-neutral-950 p-4 rounded-lg text-sm text-neutral-300">
            <p>Please open the <strong className="text-white">supabase-schema.sql</strong> file from the code editor on the left.</p>
            <p className="mt-2">Copy its entire contents and run it in your <strong className="text-white">Supabase SQL Editor</strong> to fix this issue.</p>
          </div>
          <button onClick={fetchCategories} className="self-start px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700">
            I have run the SQL, Reload Data
          </button>
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
              <tr>
                <th className="px-6 py-4 font-medium min-w-[100px]">Image</th>
                <th className="px-6 py-4 font-medium min-w-[150px]">Name</th>
                <th className="px-6 py-4 font-medium min-w-[150px]">Slug</th>
                <th className="px-6 py-4 font-medium min-w-[100px]">Status</th>
                <th className="px-6 py-4 font-medium text-right min-w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">Loading...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">No categories found.</td></tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-10 h-10 rounded object-cover border border-neutral-700" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500 text-xs">No img</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{category.name}</td>
                    <td className="px-6 py-4 text-neutral-400">{category.slug}</td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap", category.active ? "bg-lime-500/10 text-lime-400 border-lime-500/20" : "bg-neutral-500/10 text-neutral-400 border-neutral-500/20")}>
                        {category.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(category)} className="p-2 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteCategory(category)} className="p-2 text-neutral-400 hover:text-red-400 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-xl font-display font-bold text-white">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={closeModal} className="text-neutral-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={saveCategory} className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-300">Category Image</label>
                <ImageUploader 
                  bucket="category-images" 
                  maxImages={1} 
                  images={images} 
                  onChange={setImages} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-300">Name</label>
                <input
                  required
                  value={name}
                  onChange={handleNameChange}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none"
                  placeholder="e.g. Sweatpants"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-300">Slug</label>
                <input
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none"
                  placeholder="e.g. sweatpants"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-300">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-white">
                <input 
                  type="checkbox" 
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-lime-500 bg-neutral-950 border-neutral-800 rounded focus:ring-lime-500" 
                />
                Active Category
              </label>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 rounded-lg font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-lime-500 hover:bg-lime-400 text-neutral-950 font-bold px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

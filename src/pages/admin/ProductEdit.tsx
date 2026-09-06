import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../types';
import { Loader2, ArrowLeft } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price: number | null;
  category_id: string;
  stock: number;
  featured: boolean;
  available: boolean;
  sizes: string; // Comma separated list
  colors: string; // Comma separated list
};

export default function AdminProductEdit() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(!!id);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  
  // Local state for images since it's easier to manage with the Uploader component
  const [images, setImages] = React.useState<string[]>([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProductForm>({
    defaultValues: {
      available: true,
      featured: false,
      stock: 0,
    }
  });

  React.useEffect(() => {
    async function loadData() {
      // Load categories
      const { data: cats } = await supabase.from('categories').select('*').eq('active', true);
      if (cats) setCategories(cats);

      // Load product if editing
      if (id) {
        const { data: prod, error: prodErr } = await supabase.from('products').select('*').eq('id', id).single();
        if (prod) {
          setValue('name', prod.name);
          setValue('slug', prod.slug);
          setValue('description', prod.description || '');
          setValue('price', prod.price);
          setValue('discount_price', prod.discount_price);
          setValue('category_id', prod.category_id);
          setValue('stock', prod.stock);
          setValue('featured', prod.featured);
          setValue('available', prod.available);
          setValue('sizes', prod.sizes?.join(', ') || '');
          setValue('colors', prod.colors?.join(', ') || '');
          if (prod.images) {
            setImages(prod.images);
          }
        } else {
          setError('Product not found');
        }
        setLoading(false);
      }
    }
    loadData();
  }, [id, setValue]);

  const onSubmit = async (data: ProductForm) => {
    setSaving(true);
    setError('');

    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price,
      discount_price: data.discount_price || null,
      category_id: data.category_id,
      stock: data.stock,
      featured: data.featured,
      available: data.available,
      images: images,
      sizes: data.sizes ? data.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
      colors: data.colors ? data.colors.split(',').map(s => s.trim()).filter(Boolean) : [],
    };

    try {
      if (id) {
        const { error: updateErr } = await supabase.from('products').update(payload).eq('id', id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase.from('products').insert(payload);
        if (insertErr) throw insertErr;
      }
      navigate('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/products')} className="p-2 text-neutral-400 hover:text-white bg-neutral-900 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-white">{id ? 'Edit Product' : 'Add Product'}</h1>
          <p className="text-neutral-400">Fill in the details below.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-medium text-white border-b border-neutral-800 pb-2">Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">Slug</label>
              <input
                {...register('slug', { required: 'Slug is required' })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">Category</label>
              <select
                {...register('category_id', { required: 'Category is required' })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none"
            />
          </div>

          <h2 className="text-lg font-medium text-white border-b border-neutral-800 pb-2 mt-8">Images</h2>
          <div className="space-y-1">
            <ImageUploader 
              bucket="product-images" 
              maxImages={5} 
              images={images} 
              onChange={setImages} 
            />
          </div>

          <h2 className="text-lg font-medium text-white border-b border-neutral-800 pb-2 mt-8">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">Price (৳)</label>
              <input
                type="number"
                {...register('price', { required: true, min: 0 })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">Discount Price (৳)</label>
              <input
                type="number"
                {...register('discount_price')}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">Stock</label>
              <input
                type="number"
                {...register('stock', { required: true, min: 0 })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none"
              />
            </div>
          </div>

          <h2 className="text-lg font-medium text-white border-b border-neutral-800 pb-2 mt-8">Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">Sizes (Comma separated)</label>
              <input
                {...register('sizes')}
                placeholder="S, M, L, XL"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">Colors (Comma separated)</label>
              <input
                {...register('colors')}
                placeholder="Black, Olive, Grey"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none"
              />
            </div>
          </div>

          <h2 className="text-lg font-medium text-white border-b border-neutral-800 pb-2 mt-8">Visibility</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-white">
              <input type="checkbox" {...register('available')} className="w-4 h-4 text-lime-500 bg-neutral-950 border-neutral-800 rounded focus:ring-lime-500" />
              Available on Store
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-white">
              <input type="checkbox" {...register('featured')} className="w-4 h-4 text-lime-500 bg-neutral-950 border-neutral-800 rounded focus:ring-lime-500" />
              Featured Product
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-lime-500 hover:bg-lime-400 text-neutral-950 font-bold px-8 py-3 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

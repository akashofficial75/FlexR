import React from 'react';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminProducts() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [error, setError] = React.useState('');

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
    
    if (fetchError) {
      if (fetchError.message.includes('Could not find the table') || fetchError.code === 'PGRST116' || fetchError.code === '42P01') {
        setError(`Database Error: The 'products' table does not exist or the schema cache is stale. Please run the SQL migration in your Supabase SQL Editor to create the necessary tables, buckets, and policies, then click 'Reload Schema Cache' below or run "NOTIFY pgrst, 'reload schema';"`);
      } else {
        setError(fetchError.message);
      }
    }

    if (data) setProducts(data);
    setLoading(false);
  };

  const handleDelete = async (product: any) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        // Delete images from storage if they exist
        if (product.images && product.images.length > 0) {
          const pathsToRemove = product.images.map((url: string) => {
            return url.split('/product-images/').pop();
          }).filter(Boolean);
          
          if (pathsToRemove.length > 0) {
            await supabase.storage.from('product-images').remove(pathsToRemove);
          }
        }

        const { error } = await supabase.from('products').delete().eq('id', product.id);
        if (error) throw error;
        
        fetchProducts();
      } catch (err: any) {
        alert(err.message || 'Failed to delete product');
      }
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from('products').update({ available: !current }).eq('id', id);
    fetchProducts();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Products</h1>
          <p className="text-neutral-400">Manage your store inventory.</p>
        </div>
        <Link 
          to="/admin/products/new"
          className="flex items-center gap-2 bg-lime-500 hover:bg-lime-400 text-neutral-950 font-bold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Product
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl flex flex-col gap-4">
          <div className="text-red-400 font-medium">{error}</div>
          <div className="bg-neutral-950 p-4 rounded-lg text-sm text-neutral-300">
            <p>Please open the <strong className="text-white">supabase-schema.sql</strong> file from the code editor on the left.</p>
            <p className="mt-2">Copy its entire contents and run it in your <strong className="text-white">Supabase SQL Editor</strong> to fix this issue.</p>
          </div>
          <button onClick={fetchProducts} className="self-start px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700">
            I have run the SQL, Reload Data
          </button>
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">Loading...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">No products found. Add one to get started.</td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={product.images[0] || 'https://placehold.co/100x100/1a1a1a/e5e5e5?text=NA'} 
                          alt="" 
                          className="w-12 h-12 rounded bg-neutral-800 object-cover"
                        />
                        <span className="font-medium text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-300">{product.categories?.name}</td>
                    <td className="px-6 py-4 text-neutral-300">
                      <div>{formatPrice(product.discount_price || product.price)}</div>
                      {product.discount_price && <div className="text-xs text-neutral-500 line-through">{formatPrice(product.price)}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "font-medium",
                        product.stock > 10 ? "text-lime-400" : product.stock > 0 ? "text-amber-400" : "text-red-400"
                      )}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleAvailability(product.id, product.available)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
                          product.available 
                            ? "bg-lime-500/10 text-lime-400 border-lime-500/20" 
                            : "bg-neutral-800 text-neutral-400 border-neutral-700"
                        )}
                      >
                        {product.available ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/admin/products/${product.id}/edit`}
                          className="p-2 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product)}
                          className="p-2 text-neutral-400 hover:text-red-400 bg-neutral-800 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
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
    </div>
  );
}

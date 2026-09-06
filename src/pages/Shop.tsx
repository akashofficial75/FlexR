import React from 'react';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';
import { formatPrice } from '../lib/utils';
import { Link, useParams } from 'react-router-dom';
import { Filter, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Shop() {
  const { slug: categorySlug } = useParams<{ slug?: string }>();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState('newest'); // newest, price_asc, price_desc
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch categories
        const { data: catsData } = await supabase
          .from('categories')
          .select('*')
          .eq('active', true);
        
        if (catsData) setCategories(catsData);

        // Fetch products
        let query = supabase.from('products').select('*, categories(slug)');
        
        // Filter by category if in URL
        if (categorySlug && catsData) {
          const category = catsData.find(c => c.slug === categorySlug);
          if (category) {
            query = query.eq('category_id', category.id);
          }
        }

        // Active only
        query = query.eq('available', true);

        const { data: prodsData } = await query;
        
        if (prodsData) {
          setProducts(prodsData);
        }
      } catch (error) {
        console.error('Error fetching shop data', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [categorySlug]);

  // Derived state for filtering and sorting
  const filteredProducts = React.useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      const priceA = a.discount_price || a.price;
      const priceB = b.discount_price || b.price;
      
      switch (sortBy) {
        case 'price_asc': return priceA - priceB;
        case 'price_desc': return priceB - priceA;
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [products, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">
              {categorySlug ? categories.find(c => c.slug === categorySlug)?.name || 'Shop' : 'All Gear'}
            </h1>
            <p className="text-neutral-400">Discover our collection of premium fitness wear.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 text-white text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-lime-500 w-full md:w-64"
              />
            </div>
            <button 
              className="md:hidden shrink-0 flex items-center justify-center p-2 bg-neutral-900 border border-neutral-800 rounded-full text-white"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={cn(
            "w-full md:w-64 shrink-0 space-y-8",
            isMobileFiltersOpen ? "block" : "hidden md:block"
          )}>
            <div>
              <h3 className="text-white font-medium mb-4">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/shop"
                    className={cn("text-sm transition-colors", !categorySlug ? "text-lime-400 font-medium" : "text-neutral-400 hover:text-white")}
                  >
                    All Products
                  </Link>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <Link 
                      to={`/category/${cat.slug}`}
                      className={cn("text-sm transition-colors", categorySlug === cat.slug ? "text-lime-400 font-medium" : "text-neutral-400 hover:text-white")}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">Sort By</h3>
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-lime-500"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="aspect-[3/4] bg-neutral-900 rounded-2xl" />
                    <div className="h-4 bg-neutral-900 rounded w-2/3" />
                    <div className="h-4 bg-neutral-900 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map(product => {
                  const isOutOfStock = product.stock <= 0;
                  return (
                    <Link key={product.id} to={`/product/${product.slug}`} className="group relative block">
                      <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 mb-4 relative">
                        <img 
                          src={product.images[0] || 'https://placehold.co/600x800/1a1a1a/e5e5e5?text=No+Image'} 
                          alt={product.name}
                          className={cn("object-cover w-full h-full transition-transform duration-500", isOutOfStock ? "opacity-50 grayscale" : "group-hover:scale-105")}
                        />
                        {product.discount_price && !isOutOfStock && (
                          <div className="absolute top-3 left-3 bg-lime-500 text-neutral-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            Sale
                          </div>
                        )}
                        {isOutOfStock && (
                          <div className="absolute top-3 right-3 bg-neutral-950/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-neutral-800">
                            Out of Stock
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className={cn("font-medium mb-1 truncate", isOutOfStock ? "text-neutral-500" : "text-white")}>{product.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-medium", isOutOfStock ? "text-neutral-600" : "text-lime-400")}>
                            {formatPrice(product.discount_price || product.price)}
                          </span>
                          {product.discount_price && (
                            <span className="text-neutral-600 line-through text-sm">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-24 text-neutral-500 border border-neutral-900 rounded-2xl">
                No products match your criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

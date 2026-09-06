import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const addItem = useCartStore(state => state.addItem);

  React.useEffect(() => {
    async function fetchFeatured() {
      try {
        // Try featured first, fallback to any available
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('available', true)
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(4);

        if (!error && data) {
          setFeaturedProducts(data);
        }
      } catch (err) {
        console.error('Failed to fetch featured products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-20">
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tighter text-white mb-6 uppercase">
            Built to <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">Move</span>.<br/>
            Made to <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">Flex</span>.
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 mb-10 max-w-2xl mx-auto font-medium">
            Premium gym essentials designed for movement, comfort and everyday performance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/category/sweatpants" className="w-full sm:w-auto px-8 py-4 bg-lime-500 hover:bg-lime-400 text-neutral-950 font-bold rounded-full transition-colors text-lg">
              Shop Sweatpants
            </Link>
            <Link to="/shop" className="w-full sm:w-auto px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-full transition-colors text-lg flex items-center justify-center gap-2">
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-white mb-2">Featured Drops</h2>
              <p className="text-neutral-400">The latest essential gear.</p>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-2 text-lime-400 hover:text-lime-300 font-medium transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-[3/4] bg-neutral-900 rounded-2xl" />
                  <div className="h-4 bg-neutral-900 rounded w-2/3" />
                  <div className="h-4 bg-neutral-900 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map(product => (
                <Link key={product.id} to={`/product/${product.slug}`} className="group relative block">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 mb-4 relative">
                    <img 
                      src={product.images[0] || 'https://placehold.co/600x800/1a1a1a/e5e5e5?text=No+Image'} 
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.discount_price && (
                      <div className="absolute top-3 left-3 bg-lime-500 text-neutral-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Sale
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute top-3 right-3 bg-neutral-950/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-neutral-800">
                        Sold Out
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1 truncate">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lime-400 font-medium">
                        {formatPrice(product.discount_price || product.price)}
                      </span>
                      {product.discount_price && (
                        <span className="text-neutral-500 line-through text-sm">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500 border border-neutral-900 rounded-2xl">
              No products available yet.
            </div>
          )}
          
          <div className="mt-8 text-center sm:hidden">
            <Link to="/shop" className="inline-flex items-center gap-2 text-lime-400 font-medium">
              View all products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why FlexR */}
      <section className="py-24 bg-neutral-900 border-y border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-center text-white mb-16">The FlexR Standard</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Premium Comfort", desc: "Engineered fabrics that feel incredible during heavy lifts or rest days.", icon: "🧶" },
              { title: "Built for Movement", desc: "Four-way stretch designs that never restrict your range of motion.", icon: "⚡" },
              { title: "Easy Exchange", desc: "Simple return and exchange policy to ensure you get the perfect fit.", icon: "🔄" },
              { title: "Fast Delivery", desc: "Quick nationwide delivery so you can start wearing your gear sooner.", icon: "📦" }
            ].map((feature, i) => (
              <div key={i} className="bg-neutral-950 p-8 rounded-2xl border border-neutral-800 text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-lime-500/5" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-8 uppercase tracking-tight">
            Ready to level up your fit?
          </h2>
          <Link to="/shop" className="inline-block px-10 py-4 bg-lime-500 hover:bg-lime-400 text-neutral-950 font-bold rounded-full transition-colors text-lg">
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}

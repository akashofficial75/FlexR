import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { ShoppingBag, MessageCircle, AlertCircle, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  const [selectedSize, setSelectedSize] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState('');
  const [quantity, setQuantity] = React.useState(1);
  const [activeImage, setActiveImage] = React.useState(0);
  
  const addItem = useCartStore(state => state.addItem);
  const settings = useSettingsStore(state => state.settings);

  React.useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();
          
        if (data) {
          setProduct(data);
          if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
          if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
        }
      } catch (err) {
        console.error('Error fetching product', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white gap-4">
        <AlertCircle className="w-12 h-12 text-neutral-600" />
        <h1 className="text-2xl font-display">Product Not Found</h1>
        <button onClick={() => navigate('/shop')} className="text-lime-400 hover:underline">Return to Shop</button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const currentPrice = product.discount_price || product.price;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (!selectedSize || !selectedColor) {
      alert("Please select a size and color");
      return;
    }
    
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      product_id: product.id,
      name: product.name,
      price: currentPrice,
      image: product.images[0] || '',
      size: selectedSize,
      color: selectedColor,
      quantity,
      max_stock: product.stock
    });
  };

  const handleWhatsAppOrder = () => {
    const number = settings?.whatsapp_number?.replace(/[^0-9]/g, '') || '';
    const message = `Hi, I'd like to order:\n\n*${product.name}*\nPrice: ${formatPrice(currentPrice)}\nSize: ${selectedSize}\nColor: ${selectedColor}\nQuantity: ${quantity}\nLink: ${window.location.href}`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-neutral-950 pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8 text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800">
              <img 
                src={product.images[activeImage] || 'https://placehold.co/600x800/1a1a1a/e5e5e5?text=No+Image'} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "w-24 h-32 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                      activeImage === idx ? "border-lime-500 opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                    )}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-medium text-lime-400">{formatPrice(currentPrice)}</span>
              {product.discount_price && (
                <span className="text-lg text-neutral-500 line-through">{formatPrice(product.price)}</span>
              )}
              {isOutOfStock && (
                <span className="ml-auto bg-neutral-900 text-neutral-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-neutral-800">
                  Out of Stock
                </span>
              )}
            </div>

            <p className="text-neutral-400 leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="space-y-6 mb-8">
              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-white text-sm font-medium mb-3">Color: <span className="text-neutral-400 font-normal">{selectedColor}</span></h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                          selectedColor === c 
                            ? "border-lime-500 bg-lime-500/10 text-lime-400" 
                            : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white text-sm font-medium">Size: <span className="text-neutral-400 font-normal">{selectedSize}</span></h3>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {product.sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={cn(
                          "py-3 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center",
                          selectedSize === s 
                            ? "border-lime-500 bg-lime-500/10 text-lime-400" 
                            : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto border-t border-neutral-800 pt-8">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 bg-lime-500 hover:bg-lime-400 text-neutral-950 font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              </button>
              
              <button
                onClick={handleWhatsAppOrder}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-colors border border-neutral-700"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                Order via WhatsApp
              </button>
            </div>

            {/* Delivery Info */}
            <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <h3 className="text-white text-sm font-medium mb-3">Delivery Information</h3>
              <div className="space-y-2 text-sm text-neutral-400">
                <div className="flex justify-between">
                  <span>Inside Dhaka</span>
                  <span className="text-white font-medium">৳{settings?.delivery_charge_inside || 100}</span>
                </div>
                <div className="flex justify-between">
                  <span>Outside Dhaka</span>
                  <span className="text-white font-medium">৳{settings?.delivery_charge_outside || 130}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../lib/utils';
import { cn } from '../lib/utils';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 transition-opacity duration-300",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 w-full max-w-md bg-neutral-950 border-l border-neutral-800 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 className="text-xl font-display font-bold text-white">Your Cart</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-4">
              <ShoppingBagIcon className="w-16 h-16 opacity-20" />
              <p>Your cart is empty</p>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  navigate('/shop');
                }}
                className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full transition-colors text-sm font-medium"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800/50">
                <div className="w-20 h-24 bg-neutral-900 rounded-lg overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-medium text-sm leading-tight pr-4">{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-neutral-400 text-xs mt-1">
                      {item.size} • {item.color}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-full px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-neutral-400 hover:text-white disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-white text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-neutral-400 hover:text-white disabled:opacity-50"
                        disabled={item.quantity >= item.max_stock}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-lime-400 font-medium text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-neutral-800 p-6 bg-neutral-900/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-neutral-400">Subtotal</span>
              <span className="text-white font-bold">{formatPrice(getSubtotal())}</span>
            </div>
            <p className="text-neutral-500 text-xs mb-6 text-center">
              Delivery charges calculated at checkout.
            </p>
            <button 
              onClick={handleCheckout}
              className="w-full bg-lime-500 hover:bg-lime-400 text-neutral-950 font-bold rounded-xl py-4 transition-colors"
            >
              Checkout Now
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function ShoppingBagIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

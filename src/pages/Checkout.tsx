import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { supabase } from '../lib/supabase';
import { formatPrice, generateOrderNumber } from '../lib/utils';
import { Loader2 } from 'lucide-react';

type CheckoutForm = {
  fullName: string;
  phone: string;
  district: 'Inside Dhaka' | 'Outside Dhaka';
  address: string;
  paymentMethod: 'cod' | 'bkash';
  bkashTrxId?: string;
};

export default function Checkout() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const settings = useSettingsStore(state => state.settings);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
    defaultValues: {
      district: 'Inside Dhaka',
      paymentMethod: 'cod'
    }
  });

  const selectedDistrict = watch('district');
  const selectedPayment = watch('paymentMethod');
  
  const subtotal = getSubtotal();
  const deliveryCharge = selectedDistrict === 'Inside Dhaka' 
    ? (settings?.delivery_charge_inside || 100) 
    : (settings?.delivery_charge_outside || 130);
  const total = subtotal + deliveryCharge;

  React.useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const onSubmit = async (data: CheckoutForm) => {
    setIsSubmitting(true);
    setError('');

    try {
      const orderNumber = generateOrderNumber();
      
      const finalPaymentMethod = data.paymentMethod === 'bkash' && data.bkashTrxId
        ? `bKash (TrxID: ${data.bkashTrxId})`
        : 'Cash on Delivery';

      // 0. Validate stock
      for (const item of items) {
        const { data: product } = await supabase.from('products').select('stock, name').eq('id', item.product_id).single();
        if (!product) {
          throw new Error(`Product "${item.name}" not found.`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} available.`);
        }
      }

      // 1. Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: data.fullName,
          phone: data.phone,
          district: data.district,
          address: data.address,
          payment_method: finalPaymentMethod,
          subtotal,
          delivery_charge: deliveryCharge,
          total,
          status: 'Pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItemsData = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        product_name: item.name,
        selected_size: item.size,
        selected_color: item.color,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      // 3. Deduct stock (simplified approach for client side)
      // In a real prod environment this would be an RPC function to avoid race conditions.
      for (const item of items) {
        const { data: product } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
        if (product) {
          await supabase.from('products').update({ stock: product.stock - item.quantity }).eq('id', item.product_id);
        }
      }

      // Success
      clearCart();
      navigate(`/order-success/${orderNumber}`, { state: { orderDetails: orderData } });

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong while placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-neutral-950 min-h-screen pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-display font-bold text-white mb-8">Checkout</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Form */}
          <div className="flex-1 space-y-8">
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Customer Info */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
                <h2 className="text-xl font-medium text-white mb-4">Customer Information</h2>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-300">Full Name</label>
                  <input
                    {...register('fullName', { required: 'Name is required' })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-500"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-300">Phone Number</label>
                  <input
                    {...register('phone', { required: 'Phone is required' })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-500"
                    placeholder="01XXXXXXXXX"
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              {/* Delivery */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
                <h2 className="text-xl font-medium text-white mb-4">Delivery Details</h2>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-300">District</label>
                  <select
                    {...register('district', { required: true })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-500"
                  >
                    <option value="Inside Dhaka">Inside Dhaka (৳{settings?.delivery_charge_inside || 100})</option>
                    <option value="Outside Dhaka">Outside Dhaka (৳{settings?.delivery_charge_outside || 130})</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-300">Full Address</label>
                  <textarea
                    {...register('address', { required: 'Address is required' })}
                    rows={3}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-500"
                    placeholder="House, Street, Area..."
                  />
                  {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
                <h2 className="text-xl font-medium text-white mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-800/50 transition-colors has-[:checked]:border-lime-500 has-[:checked]:bg-lime-500/5">
                    <input type="radio" value="cod" {...register('paymentMethod')} className="w-4 h-4 text-lime-500 bg-neutral-900 border-neutral-700 focus:ring-lime-500 focus:ring-offset-neutral-950" />
                    <span className="text-white font-medium">Cash on Delivery</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 border border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-800/50 transition-colors has-[:checked]:border-lime-500 has-[:checked]:bg-lime-500/5">
                    <input type="radio" value="bkash" {...register('paymentMethod')} className="w-4 h-4 text-lime-500 bg-neutral-900 border-neutral-700 focus:ring-lime-500 focus:ring-offset-neutral-950" />
                    <span className="text-white font-medium">bKash (Personal)</span>
                  </label>
                </div>

                {selectedPayment === 'bkash' && (
                  <div className="mt-4 p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl space-y-4 text-sm">
                    <div>
                      <p className="text-pink-100 font-medium mb-1">1. Send money to the following personal bKash number:</p>
                      <p className="text-2xl font-bold text-pink-400 mb-1">{settings?.bkash_number || 'Setup in Admin'}</p>
                      <p className="text-pink-200/70">Please use the "Send Money" option in your bKash app.</p>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-pink-100">2. Enter the Transaction ID</label>
                      <input
                        {...register('bkashTrxId', { required: selectedPayment === 'bkash' ? 'Transaction ID is required for bKash payment' : false })}
                        className="w-full bg-neutral-950/50 border border-pink-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 placeholder-neutral-500"
                        placeholder="e.g. 8N4KD9X..."
                      />
                      {errors.bkashTrxId && <p className="text-pink-400 text-xs mt-1">{errors.bkashTrxId.message}</p>}
                    </div>
                  </div>
                )}
              </div>

            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96 shrink-0">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl sticky top-24">
              <h2 className="text-xl font-medium text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-neutral-950 rounded-lg overflow-hidden shrink-0 border border-neutral-800">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white line-clamp-2">{item.name}</h4>
                      <p className="text-xs text-neutral-500 mt-1">{item.size} • {item.color} • Qty: {item.quantity}</p>
                      <p className="text-sm font-medium text-lime-400 mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-800 pt-4 space-y-3">
                <div className="flex justify-between text-neutral-400 text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-400 text-sm">
                  <span>Delivery ({selectedDistrict})</span>
                  <span>{formatPrice(deliveryCharge)}</span>
                </div>
                <div className="border-t border-neutral-800 pt-3 flex justify-between items-center">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-2xl font-bold text-lime-400">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full bg-lime-500 hover:bg-lime-400 text-neutral-950 font-bold rounded-xl py-4 mt-6 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

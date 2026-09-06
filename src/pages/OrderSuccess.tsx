import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import type { Order } from '../types';

export default function OrderSuccess() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const orderDetails = location.state?.orderDetails as Order;

  return (
    <div className="min-h-screen bg-neutral-950 pt-32 pb-24 flex items-center justify-center">
      <div className="max-w-2xl w-full px-4 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-lime-500/10 text-lime-400 rounded-full mb-8">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Order Confirmed!</h1>
        <p className="text-neutral-400 text-lg mb-2">
          Thank you for choosing FlexR. Your order <span className="text-white font-medium">{orderNumber}</span> has been received.
        </p>
        <p className="text-lime-400/80 mb-12">
          We’ll contact you shortly to confirm your order details.
        </p>

        {orderDetails && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-left mb-10 max-w-md mx-auto">
            <h3 className="text-white font-medium mb-4 pb-4 border-b border-neutral-800">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Amount</span>
                <span className="text-white font-medium">{formatPrice(orderDetails.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Payment Method</span>
                <span className="text-white font-medium uppercase">{orderDetails.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Delivery To</span>
                <span className="text-white font-medium text-right ml-4 line-clamp-1">{orderDetails.address}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/shop" className="w-full sm:w-auto px-8 py-4 bg-lime-500 hover:bg-lime-400 text-neutral-950 font-bold rounded-xl transition-colors">
            Continue Shopping
          </Link>
          <Link to="/" className="w-full sm:w-auto px-8 py-4 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-bold rounded-xl transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

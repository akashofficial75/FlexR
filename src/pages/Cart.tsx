import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

// We route Cart directly into CartDrawer via App structure usually,
// but if accessed via URL /cart, we can just redirect to checkout or show a page.
// Since we have a drawer, let's redirect to shop if empty, or open drawer on home.
// Let's implement a standalone page just in case.

export default function Cart() {
  const { items } = useCartStore();

  if (items.length > 0) {
    return <Navigate to="/checkout" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center pt-24 text-white">
      <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
      <a href="/shop" className="text-lime-400 hover:underline">Go to Shop</a>
    </div>
  );
}

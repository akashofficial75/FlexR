import React from 'react';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../types';
import { formatPrice } from '../../lib/utils';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

export default function AdminOrders() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [orderItems, setOrderItems] = React.useState<Record<string, any[]>>({});

  React.useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders();
  };

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!orderItems[id]) {
      const { data } = await supabase.from('order_items').select('*').eq('order_id', id);
      if (data) {
        setOrderItems(prev => ({ ...prev, [id]: data }));
      }
    }
  };

  const statusColors: Record<string, string> = {
    'Pending': 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    'Confirmed': 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    'Processing': 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20',
    'Shipped': 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    'Delivered': 'bg-lime-500/10 text-lime-400 border-lime-500/20',
    'Cancelled': 'bg-red-400/10 text-red-400 border-red-400/20',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Orders</h1>
        <p className="text-neutral-400">View and manage customer orders.</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">No orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-neutral-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{order.order_number}</td>
                      <td className="px-6 py-4 text-neutral-400">{format(new Date(order.created_at), 'MMM d, yyyy HH:mm')}</td>
                      <td className="px-6 py-4 text-neutral-300">
                        <div>{order.customer_name}</div>
                        <div className="text-xs text-neutral-500">{order.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-neutral-300">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4">
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold border appearance-none cursor-pointer outline-none",
                            statusColors[order.status]
                          )}
                        >
                          {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => toggleExpand(order.id)}
                          className="p-2 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                        >
                          <ChevronDown className={cn("w-4 h-4 transition-transform", expandedId === order.id && "rotate-180")} />
                        </button>
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr className="bg-neutral-950/50">
                        <td colSpan={6} className="px-6 py-6 border-l-2 border-lime-500">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <h4 className="text-white font-medium mb-4">Order Items</h4>
                              <div className="space-y-3">
                                {orderItems[order.id]?.map((item, i) => (
                                  <div key={i} className="flex justify-between text-sm">
                                    <div className="text-neutral-300">
                                      <span className="text-white font-medium">{item.quantity}x</span> {item.product_name}
                                      <div className="text-xs text-neutral-500 ml-5">{item.selected_size} • {item.selected_color}</div>
                                    </div>
                                    <div className="text-neutral-400">{formatPrice(item.subtotal)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                              <h4 className="text-white font-medium mb-3">Delivery Information</h4>
                              <p className="text-sm text-neutral-300 mb-1">{order.address}</p>
                              <p className="text-sm text-neutral-400 mb-4">{order.district}</p>
                              <h4 className="text-white font-medium mb-2">Payment</h4>
                              <p className="text-sm text-neutral-300 uppercase">{order.payment_method}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

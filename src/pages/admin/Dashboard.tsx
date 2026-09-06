import React from 'react';
import { supabase } from '../../lib/supabase';
import { Package, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = React.useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    totalSales: 0
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        // Products stats
        const { data: products } = await supabase.from('products').select('available, stock');
        
        let totalP = 0, activeP = 0, outP = 0;
        if (products) {
          totalP = products.length;
          activeP = products.filter(p => p.available).length;
          outP = products.filter(p => p.stock <= 0).length;
        }

        // Orders stats
        const { data: orders } = await supabase.from('orders').select('status, total');
        
        let totalO = 0, pendingO = 0, confirmedO = 0, deliveredO = 0, sales = 0;
        if (orders) {
          totalO = orders.length;
          pendingO = orders.filter(o => o.status === 'Pending').length;
          confirmedO = orders.filter(o => o.status === 'Confirmed').length;
          deliveredO = orders.filter(o => o.status === 'Delivered').length;
          
          sales = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + Number(o.total), 0);
        }

        setStats({
          totalProducts: totalP,
          activeProducts: activeP,
          outOfStock: outP,
          totalOrders: totalO,
          pendingOrders: pendingO,
          confirmedOrders: confirmedO,
          deliveredOrders: deliveredO,
          totalSales: sales
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Sales', value: formatPrice(stats.totalSales), icon: TrendingUp, color: 'text-lime-400', bg: 'bg-lime-400/10' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Pending', value: stats.pendingOrders, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { title: 'Confirmed', value: stats.confirmedOrders, icon: Package, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { title: 'Delivered', value: stats.deliveredOrders, icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10' },
    { title: 'Active Products', value: stats.activeProducts, icon: Package, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Out of Stock', value: stats.outOfStock, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  // Dummy chart data
  const data = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Overview</h1>
        <p className="text-neutral-400">Welcome to FlexR Admin Dashboard.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-neutral-400 font-medium">{stat.title}</h3>
            </div>
            <p className="text-3xl font-bold text-white">{loading ? '-' : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-white font-medium mb-6">Weekly Sales</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" stroke="#737373" axisLine={false} tickLine={false} />
                <YAxis stroke="#737373" axisLine={false} tickLine={false} tickFormatter={(val) => `৳${val}`} />
                <Tooltip 
                  cursor={{fill: '#262626'}}
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} 
                />
                <Bar dataKey="sales" fill="#a3e635" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

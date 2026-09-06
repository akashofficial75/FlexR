import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import type { StoreSettings } from '../../types';
import { Loader2 } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export default function AdminSettings() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const fetchSettings = useSettingsStore(state => state.fetchSettings);

  const { register, handleSubmit, reset } = useForm<StoreSettings>();

  React.useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('store_settings').select('*').eq('id', 1).single();
      if (data) {
        reset(data);
      }
      setLoading(false);
    }
    loadSettings();
  }, [reset]);

  const onSubmit = async (data: StoreSettings) => {
    setSaving(true);
    setMessage('');
    try {
      const { error } = await supabase.from('store_settings').update(data).eq('id', 1);
      if (error) throw error;
      setMessage('Settings saved successfully');
      fetchSettings(); // Update global store
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Settings</h1>
        <p className="text-neutral-400">Manage store configuration.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${message.includes('Error') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-lime-500/10 border-lime-500/20 text-lime-400'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-medium text-white mb-4">General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">Store Name</label>
              <input {...register('store_name')} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Footer Description</label>
            <textarea {...register('footer_description')} rows={3} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none" />
          </div>

          <h2 className="text-xl font-medium text-white mb-4 pt-6 border-t border-neutral-800">Contact & Socials</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">WhatsApp Number</label>
              <input {...register('whatsapp_number')} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none" placeholder="+8801..." />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">bKash Personal Number</label>
              <input {...register('bkash_number')} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none" placeholder="01..." />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">Instagram URL</label>
              <input {...register('instagram_url')} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">Facebook URL</label>
              <input {...register('facebook_url')} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none" />
            </div>
          </div>

          <h2 className="text-xl font-medium text-white mb-4 pt-6 border-t border-neutral-800">Delivery Rates</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">Inside Dhaka (৳)</label>
              <input type="number" {...register('delivery_charge_inside', { valueAsNumber: true })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">Outside Dhaka (৳)</label>
              <input type="number" {...register('delivery_charge_outside', { valueAsNumber: true })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:border-lime-500 outline-none" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-lime-500 hover:bg-lime-400 text-neutral-950 font-bold px-8 py-3 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

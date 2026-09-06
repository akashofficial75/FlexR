import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { StoreSettings } from '../types';

interface SettingsState {
  settings: StoreSettings | null;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  
  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (!error && data) {
        set({ settings: data });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      set({ isLoading: false });
    }
  }
}));

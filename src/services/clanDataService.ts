
import { supabase } from '@/integrations/supabase/client';

export interface Player {
  name: string;
  tag: string;
}

export interface Clan {
  id: string;
  name: string;
  tag: string;
  players: Player[];
}

export interface ClanData {
  id?: number;
  title: string;
  clans: Clan[];
}

export const clanDataService = {
  async getClanData(): Promise<ClanData> {
    console.log('Fetching clan data from Supabase...');
    const { data, error } = await supabase
      .from('clan_data')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching clan data:', error);
      // Return default data if no data exists
      return {
        title: 'MERCILESS CWL TRACKER',
        clans: []
      };
    }

    console.log('Fetched clan data:', data);
    
    // Parse the JSON data properly
    let clans: Clan[] = [];
    if (data.clans && typeof data.clans === 'object') {
      clans = Array.isArray(data.clans) ? data.clans as Clan[] : [];
    }

    return {
      id: data.id,
      title: data.title,
      clans: clans
    };
  },

  async saveClanData(clanData: ClanData): Promise<void> {
    console.log('Saving clan data to Supabase:', clanData);
    
    if (clanData.id) {
      // Update existing record
      const { error } = await supabase
        .from('clan_data')
        .update({
          title: clanData.title,
          clans: clanData.clans as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', clanData.id);

      if (error) {
        console.error('Error updating clan data:', error);
        throw error;
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('clan_data')
        .insert({
          title: clanData.title,
          clans: clanData.clans as any
        });

      if (error) {
        console.error('Error inserting clan data:', error);
        throw error;
      }
    }
    
    console.log('Clan data saved successfully');
  },

  async saveTitle(title: string): Promise<void> {
    console.log('Saving title to Supabase:', title);
    const currentData = await this.getClanData();
    await this.saveClanData({
      ...currentData,
      title
    });
  },

  async saveClans(clans: Clan[]): Promise<void> {
    console.log('Saving clans to Supabase:', clans);
    const currentData = await this.getClanData();
    await this.saveClanData({
      ...currentData,
      clans
    });
  }
};

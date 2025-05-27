
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

export interface AppData {
  title: string;
  clans: Clan[];
}

class ClanDataService {
  async getClanData(): Promise<AppData> {
    try {
      const { data, error } = await supabase
        .from('clan_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching clan data:', error);
        return this.getDefaultData();
      }

      if (!data || data.length === 0) {
        console.log('No data found, returning default data');
        return this.getDefaultData();
      }

      const appData = data[0];
      console.log('Fetched data from Supabase:', appData);

      // Type assertion with proper validation
      const clansData = Array.isArray(appData.clans) ? appData.clans as Clan[] : [];
      
      return {
        title: appData.title || 'MERCILESS CWL TRACKER',
        clans: clansData
      };
    } catch (error) {
      console.error('Error in getClanData:', error);
      return this.getDefaultData();
    }
  }

  async saveClanData(appData: AppData): Promise<boolean> {
    try {
      console.log('Saving data to Supabase:', appData);
      
      // First, try to get existing data
      const { data: existingData, error: fetchError } = await supabase
        .from('clan_data')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('Error fetching existing data:', fetchError);
      }

      let result;
      
      if (existingData && existingData.length > 0) {
        // Update existing record
        const { data, error } = await supabase
          .from('clan_data')
          .update({
            title: appData.title,
            clans: appData.clans,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData[0].id)
          .select();
        
        result = { data, error };
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('clan_data')
          .insert({
            title: appData.title,
            clans: appData.clans
          })
          .select();
        
        result = { data, error };
      }

      if (result.error) {
        console.error('Error saving clan data:', result.error);
        return false;
      }

      console.log('Data saved successfully:', result.data);
      return true;
    } catch (error) {
      console.error('Error in saveClanData:', error);
      return false;
    }
  }

  private getDefaultData(): AppData {
    return {
      title: 'MERCILESS CWL TRACKER',
      clans: []
    };
  }
}

export const clanDataService = new ClanDataService();

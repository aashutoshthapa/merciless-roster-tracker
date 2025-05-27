import { supabase } from '@/integrations/supabase/client';

export interface Player {
  name: string;
  tag: string;
  discordUsername: string;
}

export interface Clan {
  id: string;
  name: string;
  tag: string;
  players: Player[];
}

interface AppData {
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
        console.log('No data found, creating default entry');
        return await this.createDefaultData();
      }

      const result = data[0];
      return {
        title: result.title || 'MERCILESS CWL TRACKER',
        clans: Array.isArray(result.clans) ? (result.clans as unknown as Clan[]) : [],
      };
    } catch (error) {
      console.error('Error in getClanData:', error);
      return this.getDefaultData();
    }
  }

  async saveTitle(title: string): Promise<void> {
    try {
      const currentData = await this.getClanData();
      
      const { error } = await supabase
        .from('clan_data')
        .upsert({
          id: 1,
          title,
          clans: currentData.clans as unknown as any,
        });

      if (error) {
        console.error('Error saving title:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in saveTitle:', error);
      throw error;
    }
  }

  async saveClans(clans: Clan[]): Promise<void> {
    try {
      const currentData = await this.getClanData();
      
      const { error } = await supabase
        .from('clan_data')
        .upsert({
          id: 1,
          title: currentData.title,
          clans: clans as unknown as any,
        });

      if (error) {
        console.error('Error saving clans:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in saveClans:', error);
      throw error;
    }
  }

  private getDefaultData(): AppData {
    return {
      title: 'MERCILESS CWL TRACKER',
      clans: [],
    };
  }

  private async createDefaultData(): Promise<AppData> {
    const defaultData = this.getDefaultData();
    
    try {
      const { error } = await supabase
        .from('clan_data')
        .insert({
          id: 1,
          title: defaultData.title,
          clans: defaultData.clans as unknown as any,
        });

      if (error) {
        console.error('Error creating default data:', error);
      }
    } catch (error) {
      console.error('Error in createDefaultData:', error);
    }

    return defaultData;
  }
}

export const clanDataService = new ClanDataService();

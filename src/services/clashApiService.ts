import { Player } from './clanDataService';

// Point to the Netlify Function endpoint
const API_BASE_URL = '/.netlify/functions';
// Remove the API_TOKEN as it will be handled by the Netlify Function environment variable
// const API_TOKEN = process.env.COC_API_TOKEN || 'YOUR_TOKEN_HERE'; 

interface ClashApiPlayer {
  tag: string;
  name: string;
  role: string;
  townHallLevel: number;
  expLevel: number;
  league: {
    id: number;
    name: string;
    iconUrls: {
      small: string;
      tiny: string;
      medium: string;
    };
  };
  trophies: number;
  builderBaseTrophies: number;
  clanRank: number;
  previousClanRank: number;
  donations: number;
  donationsReceived: number;
  playerHouse: {
    elements: Array<{
      type: string;
      id: number;
    }>;
  };
  builderBaseLeague: {
    id: number;
    name: string;
  };
}

interface ClashApiResponse {
  items: ClashApiPlayer[];
  paging: {
    cursors: Record<string, unknown>;
  };
}

class ClashApiService {
  // We no longer need fetchWithAuth as the function handles auth
  // private async fetchWithAuth(url: string): Promise<Response> {
  //   return fetch(url, {
  //     headers: {
  //       'Authorization': `Bearer ${API_TOKEN}`,
  //       'Accept': 'application/json',
  //     },
  //   });
  // }

  async getClanMembers(clanTag: string): Promise<Player[]> {
    try {
      // Remove the # from the clan tag if it exists (the function expects it this way)
      const formattedTag = clanTag.startsWith('#') ? clanTag.substring(1) : clanTag;
      // Call the Netlify Function endpoint with the clan tag as a query parameter
      const url = `${API_BASE_URL}/getClanMembers?tag=${formattedTag}`;
      
      // Use a regular fetch as the function handles the authorization header
      const response = await fetch(url);
      
      if (!response.ok) {
        // The function will return the API error status and body
        const errorData = await response.json();
        throw new Error(`API request failed with status ${response.status}: ${errorData.message || JSON.stringify(errorData)}`);
      }

      const data: ClashApiResponse = await response.json();
      
      // Transform the API response to match our Player interface
      return data.items.map(player => ({
        name: player.name,
        tag: player.tag,
        discordUsername: '', // This will need to be filled in separately
        townHallLevel: player.townHallLevel,
        expLevel: player.expLevel,
        role: player.role,
        trophies: player.trophies,
        donations: player.donations,
        donationsReceived: player.donationsReceived,
        league: { // Ensure league and iconUrls exist before accessing
          name: player.league?.name || '',
          iconUrls: player.league?.iconUrls || { small: '', tiny: '', medium: '' }
        }
      }));
    } catch (error) {
      console.error('Error fetching clan members:', error);
      throw error;
    }
  }
}

export const clashApiService = new ClashApiService(); 
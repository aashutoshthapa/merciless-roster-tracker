import { Player } from './clanDataService';

const API_BASE_URL = 'https://cocproxy.royaleapi.dev/v1';
const API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6ImExMjZkOGY5LWVkMmQtNDI3MC1hYzdlLTExOTJmNzFhZmIzYSIsImlhdCI6MTc0ODYwMTM3Nywic3ViIjoiZGV2ZWxvcGVyL2QyMzllMDZkLTk0MWMtOTg1Yi0wZjQ0LWY5NWRlYzFlNmU3MSIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjQ1Ljc5LjIxOC43OSJdLCJ0eXBlIjoiY2xpZW50In1dfQ.0QdpeO2FxzYHiS9dunJuIAXr7ulhu00r4H6gOPlg1vl4nH2T2CxyEV604e7Uc0035bmH1_-dbg-cAqfCO8sj8A';

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
  private async fetchWithAuth(url: string): Promise<Response> {
    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json',
      },
    });
  }

  async getClanMembers(clanTag: string): Promise<Player[]> {
    try {
      // Remove the # from the clan tag if it exists
      const formattedTag = clanTag.startsWith('#') ? clanTag.substring(1) : clanTag;
      const url = `${API_BASE_URL}/clans/%23${formattedTag}/members`;
      
      const response = await this.fetchWithAuth(url);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
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
        league: {
          name: player.league.name,
          iconUrls: player.league.iconUrls
        }
      }));
    } catch (error) {
      console.error('Error fetching clan members:', error);
      throw error;
    }
  }
}

export const clashApiService = new ClashApiService(); 
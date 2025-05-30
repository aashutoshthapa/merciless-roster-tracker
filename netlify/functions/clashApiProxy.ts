import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import fetch from 'node-fetch';

const API_TOKEN = process.env.COC_API_TOKEN;
const API_BASE_URL = 'https://cocproxy.royaleapi.dev/v1';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  const tag = event.queryStringParameters?.tag;
  const endpoint = event.queryStringParameters?.endpoint; // 'members' or 'player'

  if (!tag || !endpoint) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing tag or endpoint parameter' }),
    };
  }

  try {
    const formattedTag = tag.startsWith('#') ? tag.substring(1) : tag;
    let url = '';

    if (endpoint === 'members') {
      url = `${API_BASE_URL}/clans/%23${formattedTag}/members`;
    } else if (endpoint === 'player') {
      url = `${API_BASE_URL}/players/%23${formattedTag}`;
    } else {
       return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid endpoint specified' }),
      };
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error Response for ${endpoint} tag ${tag}:`, data);
      return {
        statusCode: response.status,
        body: JSON.stringify(data),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error: any) {
    console.error(`Function Error for ${endpoint} tag ${tag}:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'Internal Server Error' }),
    };
  }
};

export { handler }; 
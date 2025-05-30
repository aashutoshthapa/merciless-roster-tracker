import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import fetch from 'node-fetch';

// It's highly recommended to store this token securely as an environment variable in Netlify
const API_TOKEN = process.env.COC_API_TOKEN;
const API_BASE_URL = 'https://cocproxy.royaleapi.dev/v1';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  const clanTag = event.queryStringParameters?.tag;

  if (!clanTag) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing clan tag parameter' }),
    };
  }

  try {
    const formattedTag = clanTag.startsWith('#') ? clanTag.substring(1) : clanTag;
    const url = `${API_BASE_URL}/clans/%23${formattedTag}/members`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error Response:', data);
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
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'Internal Server Error' }),
    };
  }
};

export { handler }; 
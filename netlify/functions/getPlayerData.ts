import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import fetch from 'node-fetch';

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

  const playerTag = event.queryStringParameters?.tag;

  if (!playerTag) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing player tag parameter' }),
    };
  }

  try {
    const formattedTag = playerTag.startsWith('#') ? playerTag.substring(1) : playerTag;
    const url = `${API_BASE_URL}/players/%23${formattedTag}`;

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
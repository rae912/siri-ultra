import { IFunction } from './type';
import { IRequest } from '../chat';
// Google Custom Search Engine API endpoint and parameters
const BASE_URL = 'https://www.googleapis.com/customsearch/v1';
export const searchWeb = async (
  query: string,
  apiKey: string,
  cx: string // Add cx parameter for your custom search engine ID
): Promise<string[]> => {
  const url = `${BASE_URL}?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
  const options = {
    method: 'GET', // Google Custom Search uses GET
    headers: {
      'Content-Type': 'application/json', // Although not strictly required for GET
    },
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Extract snippets and handle cases where there are no search results.
    const snippets = data.items?.map((item: any) => item.snippet) || [];
    return snippets;
  } catch (error) {
    console.error('Failed to fetch search results:', error);
    return []; // Return an empty array in case of an error
  }
};
export const search: IFunction = {
  type: 'function',
  function: {
    name: 'web_search',
    description: 'Search the web for a given query using Google Custom Search',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query',
        },
      },
    },
  },
  async execute(args: any, req: IRequest) {
    const googleApiKey = req.request.config?.google_api_key || req.env.GOOGLE_API_KEY; // Rename environment variable
    const cx = req.request.config?.google_cx || req.env.GOOGLE_CX; // Get your Custom Search Engine ID [cx]
    if (!cx) {
      throw new Error('Missing Google Custom Search Engine ID [cx]. Please provide it in your environment variables or request config.');
    }
    const snippets = await searchWeb(args.query, googleApiKey, cx);
    return JSON.stringify(snippets); // Return snippets as a JSON string
  },
};
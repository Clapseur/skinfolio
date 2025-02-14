import axios from 'axios'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { vanityurl } = req.query
  const apiKey = process.env.STEAM_API_KEY

  if (!vanityurl) {
    return res.status(400).json({ error: 'vanityurl is required' })
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Steam API key not configured' })
  }

  try {
    const response = await axios.get(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/`,
      {
        params: {
          key: apiKey,
          vanityurl: vanityurl
        }
      }
    )
    return res.status(200).json(response.data)
  } catch (error) {
    console.error('Steam API Error:', error)
    return res.status(500).json({
      error: 'Failed to fetch from Steam API',
      details: error.message
    })
  }
}

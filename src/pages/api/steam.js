import axios from 'axios'



export default async function handler(req, res) {

  // Enable CORS

  res.setHeader('Access-Control-Allow-Origin', '*')

  res.setHeader('Access-Control-Allow-Methods', 'GET')



  const { vanityurl } = req.query

  const apiKey = '74D34665E9EB2F20DB4219D8604FBEBE'



  try {

    const response = await axios.get('https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/', {

      params: {

        key: apiKey,

        vanityurl: vanityurl

      }

    })

    res.json(response.data)

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

}

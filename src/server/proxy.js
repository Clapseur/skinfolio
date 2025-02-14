const express = require('express')
const cors = require('cors')
const axios = require('axios')
const app = express()

app.use(cors())

app.get('/api/steam/resolve', async (req, res) => {
  try {
    const vanityUrl = req.query.vanityurl
    const apiKey = process.env.STEAM_API_KEY
    const response = await axios.get(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${vanityUrl}`,
    )
    res.json(response.data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`)
})

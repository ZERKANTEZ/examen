require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/top-games', async (req, res) => {
  try {
    const authResponse = await axios.post(
      'https://id.twitch.tv/oauth2/token',
      null,
      {
        params: {
          client_id: process.env.TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
          grant_type: 'client_credentials'
        }
      }
    );

    const gamesResponse = await axios.get(
      'https://api.twitch.tv/helix/games/top',
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${authResponse.data.access_token}`
        },
        params: { first: req.query.first || 10 }
      }
    );

    res.json({
      data: gamesResponse.data.data.map(game => ({
        ...game,
        box_art_url: game.box_art_url.replace('{width}x{height}', '285x380')
      }))
    });

  } catch (error) {
    console.error('Error detallado:', {
      message: error.message,
      response: error.response?.data
    });
    res.status(500).json({ 
      error: 'Error en el servidor',
      details: error.response?.data || error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor listo en http://localhost:${port}`);
});
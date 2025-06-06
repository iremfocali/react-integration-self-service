const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());

app.get('/serverside-request', async (req, res) => {
  const targetUrl = req.query.url;

  try {
    const response = await axios.get(targetUrl);
    res.json({
      status: response.status,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5004, () => {
  console.log("Server listening on port 5004");
});
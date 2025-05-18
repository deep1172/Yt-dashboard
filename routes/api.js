const express = require('express');
const axios = require('axios');
const Note = require('../models/Note');
const Log = require('../models/Log');
const router = express.Router();

const baseURL = 'https://www.googleapis.com/youtube/v3';
const headers = {
  Authorization: `Bearer ${process.env.YOUTUBE_ACCESS_TOKEN}`
};

// Log Helper
async function logAction(action, meta = {}) {
  await Log.create({ action, meta });
}

router.get('/video', async (req, res) => {
  const { VIDEO_ID, YOUTUBE_API_KEY } = process.env;
  try {
    const response = await axios.get(`${baseURL}/videos`, {
      params: {
        part: 'snippet,statistics',
        id: VIDEO_ID,
        key: YOUTUBE_API_KEY
      }
    });
    await logAction('FETCH_VIDEO_DETAILS');
    res.json(response.data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/comment', async (req, res) => {
  const { text, parentId } = req.body;
  const { VIDEO_ID } = process.env;

  try {
    const response = await axios.post(`${baseURL}/commentThreads?part=snippet`, {
      snippet: {
        videoId: VIDEO_ID,
        topLevelComment: {
          snippet: { textOriginal: text }
        },
        ...(parentId && { parentId })
      }
    }, { headers });

    await logAction('POST_COMMENT', { text, parentId });
    res.json(response.data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/comment/:id', async (req, res) => {
  try {
    await axios.delete(`${baseURL}/comments`, {
      params: { id: req.params.id },
      headers
    });
    await logAction('DELETE_COMMENT', { id: req.params.id });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put('/video', async (req, res) => {
  const { title, description } = req.body;
  const { VIDEO_ID } = process.env;

  try {
    const response = await axios.put(`${baseURL}/videos?part=snippet`, {
      id: VIDEO_ID,
      snippet: { title, description }
    }, { headers });

    await logAction('UPDATE_VIDEO_DETAILS', { title, description });
    res.json(response.data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/note', async (req, res) => {
  const { content, tags } = req.body;
  const { VIDEO_ID } = process.env;

  const note = await Note.create({ videoId: VIDEO_ID, content, tags });
  await logAction('ADD_NOTE', { content, tags });
  res.json(note);
});

router.get('/note/search', async (req, res) => {
  const { q } = req.query;
  const notes = await Note.find({ content: new RegExp(q, 'i') });
  res.json(notes);
});

module.exports = router;

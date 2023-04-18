require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const RateLimiter = require('express-rate-limit');
let apiKey = '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';
const configuration = new Configuration({
  apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);

const app = express(); // Make sure this line is before app.use(cors());
app.use(cors());
app.use(express.json());

const rateLimiter = RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 100 requests per interval
  handler: (req, res) => {
    const timeLeft = Math.ceil((req.rateLimit.resetTime - Date.now()) / 60000);
    res.status(429).json({ error: `Too many requests. Please wait ${timeLeft} minutes.` });
  },
});



const MODEL_NAME = 'gpt-3.5-turbo';
app.post('/summarize', rateLimiter, async (req, res) => {
  const { text } = req.body;

  try {
    const summary = await callOpenAIAPI(text);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Error summarizing text' });
  }
});

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

async function callOpenAIAPI(text) {
  const prompt = `Please summarize the following text:\n\n${text}\n\nSummary: `;
  console.log(prompt);

  const completions = await openai.createChatCompletion({
    model: MODEL_NAME,
    messages: [{ role: 'user', content: prompt }],
    n: 1,
  });

  const generatedText = completions.data.choices[0].message.content;
  console.log(generatedText);
  return generatedText;
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));

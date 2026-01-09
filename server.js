import express from 'express';
import 'dotenv/config';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/query', async (req, res) => {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                messages: [
                    { role: "system", content: "Respond ONLY with JSON: {density: 'hd'/'md'/'ld', mode: 'standard'/'volatility'/'overlap'/'retailer'/etc}" },
                    { role: "user", content: req.body.userQuery }
                ],
                max_tokens: 150,
                temperature: 0.1
            })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
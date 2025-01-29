const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Endpoint สำหรับ Chatbot
app.post('/api/chat', async (req, res) => {
    const { userMessage } = req.body;

    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.2:latest',
                prompt: userMessage,
            }),
        });

        const reader = response.body
            .pipeThrough(new TextDecoderStream())
            .getReader();

        let result = [];
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += value;
            const lines = buffer.split('\n');
            buffer = lines.pop(); // เก็บบรรทัดสุดท้ายที่ยังไม่สมบูรณ์

            for (const line of lines) {
                if (line.trim()) {
                    const data = JSON.parse(line);
                    result.push(data.response);
                }
            }
        }

        const finalResponse = result.join('').replace(/\n/g, '<br>');

        res.json({ response: finalResponse });
    } catch (error) {
        console.error('Error fetching AI response:', error);
        res.status(500).json({ error: 'Failed to fetch response from AI API' });
    }
});

// Run the server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

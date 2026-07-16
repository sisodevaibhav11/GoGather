const OpenAI = require('openai');

let client = null;

if (process.env.OPENAI_API_KEY) {
    client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

module.exports = client;

require("dotenv").config();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/plan", async (req, res) => {
    try {
        const { city, days, budget, interest, travellers } = req.body;

        if (!city || !days || !budget || !interest || !travellers) {
            return res.status(400).json({
                error: "Please fill in all travel details."
            });
        }

        const prompt = `
You are an AI travel planner for Karnataka, India.

Create a personalized ${days}-day travel plan.
Starting city: ${city}
Total budget: ₹${budget}
Interest: ${interest}
Travellers: ${travellers}

Suggest suitable Karnataka destinations and activities for each day.
Include estimated accommodation, food and transport expenses.
Try to stay within the user's budget.
Clearly state that prices are estimates, not live prices.
Give the itinerary in a clear, readable format.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt
        });

        res.json({
            plan: response.text
        });

    } catch (error) {
        console.error("AI Error:", error.message);

        res.status(500).json({
            error: "AI plan generate nahi hua. API key aur quota check karein."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Karnataka Explorer running at http://localhost:${PORT}`);
});
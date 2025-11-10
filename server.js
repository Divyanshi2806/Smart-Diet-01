import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serves your HTML, CSS, JS, images

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are "Diet Assistant" — a friendly AI nutritionist designed for a hackathon website.
You give evidence-based, easy-to-understand advice on:
- Balanced diet plans
- Weight management (gain/loss)
- Calorie and macronutrient information
- Food recommendations for different goals
- Hydration and healthy habits

Keep your answers clear, concise, and friendly.
If a question is medical, remind the user that you are not a doctor.
Always use an encouraging tone.
          `,
        },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ reply: "Sorry, something went wrong on the server." });
  }
});

app.listen(3000, () => console.log("🚀 Diet Assistant running on http://localhost:3000"));

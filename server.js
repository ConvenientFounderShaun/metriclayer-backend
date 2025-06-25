// server.js
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { createClient } = require('@supabase/supabase-js')
const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config()

// 🟢 Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// 🟢 Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// 🟢 Create Express app
const app = express()
app.use(cors())
app.use(bodyParser.json())

// 🟢 POST route
app.post('/analyzeEmail', async (req, res) => {
  const { email_content } = req.body

  try {
    // 🟢 Craft prompt to force a clean JSON-only output
    const prompt = `
Analyze this email: "${email_content}"
Reply ONLY with a JSON object in this format (no other text):

{
  "sentiment": "positive|neutral|negative",
  "summary": "one-sentence summary of the issue",
  "is_repeated_issue": true|false
}
`

    const result = await genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      .generateContent(prompt)

    let rawText = result.response.text().trim()

    // 🟢 Strip extra text before/after JSON
    const jsonStart = rawText.indexOf('{')
    const jsonEnd = rawText.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error(`AI response not valid JSON: ${rawText}`)
    }

    rawText = rawText.substring(jsonStart, jsonEnd + 1)
    const parsedData = JSON.parse(rawText)

    // 🟢 Prepare data for insert
    const dataToInsert = {
      email_content,
      sentiment: parsedData.sentiment,
      summary: parsedData.summary,
      is_repeated_issue: parsedData.is_repeated_issue
    }

    // 🟢 Insert into Supabase
    const { data, error } = await supabase.from('emails').insert([dataToInsert]).select()
    if (error) throw error

    res.status(200).json({ data })
  } catch (error) {
    console.error('Error processing request:', error)
    res.status(500).json({ error: error.message })
  }
})

// 🟢 NEW home page route
app.get('/', (req, res) => {
  res.status(200).send('Welcome to MetricLayer Backend!')
})

// 🟢 PORT setup
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🎯`)
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, mediaType, instruction } = req.body;
    
    if (!image || !mediaType) {
      return res.status(400).json({ error: 'Data gambar tidak lengkap.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Environment variable GEMINI_API_KEY belum diset di Vercel.' });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mediaType,
                  data: image
                }
              },
              {
                text: "Kamu adalah penulis prompt profesional untuk image generation model GPT Image 2. " + (instruction || "Buatkan prompt detail dari foto ini.") + " Berikan hasil dalam Bahasa Indonesia yang detail dan siap pakai tanpa basa-basi."
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Gagal terhubung ke Gemini API' });
    }

    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return res.status(200).json({ content: [{ text: textContent }] });
  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}

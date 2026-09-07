export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, mediaType, instruction } = req.body;
    
    if (!image || !mediaType) {
      return res.status(400).json({ error: 'Data gambar tidak lengkap.' });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: "Kamu adalah penulis prompt profesional untuk image generation. Tugasmu menganalisis foto dan instruksi user, lalu menghasilkan prompt siap pakai dalam Bahasa Indonesia yang sangat detail, jelas, dan tanpa basa-basi.",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "image", 
                source: { 
                  type: "base64", 
                  media_type: mediaType, 
                  data: image 
                } 
              },
              { 
                type: "text", 
                text: instruction 
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Gagal terhubung ke Anthropic API' });
    }

    // Ekstrak teks dengan aman dari struktur content array Claude
    const textContent = data.content && data.content[0] ? data.content[0].text : '';

    return res.status(200).json({ content: [{ text: textContent }] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

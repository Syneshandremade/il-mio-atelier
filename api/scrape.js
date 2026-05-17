export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const { url } = req.query
  if (!url) return res.status(400).json({ error: 'URL mancante' })

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
      },
    })

    if (!response.ok) {
      return res.status(502).json({ error: `Il sito ha risposto con errore ${response.status}` })
    }

    const html = await response.text()

    function getMeta(prop) {
      const patterns = [
        new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"'<>]+)["']`, 'i'),
        new RegExp(`<meta[^>]+content=["']([^"'<>]+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i'),
      ]
      for (const p of patterns) {
        const m = html.match(p)
        if (m) return decodeHTML(m[1].trim())
      }
      return null
    }

    function decodeHTML(str) {
      return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&euro;/g, '€')
    }

    const nome =
      getMeta('og:title') ||
      getMeta('twitter:title') ||
      (() => { const m = html.match(/<title[^>]*>([^<]+)<\/title>/i); return m ? decodeHTML(m[1].trim()) : null })()

    const immagine =
      getMeta('og:image') ||
      getMeta('og:image:url') ||
      getMeta('twitter:image')

    const prezzoRaw =
      getMeta('og:price:amount') ||
      getMeta('product:price:amount') ||
      getMeta('twitter:data1') ||
      (() => {
        const m = html.match(/["']price["'][^>]*>\s*[€$]?\s*(\d+[.,]\d{1,2})/)
          || html.match(/(\d+[.,]\d{2})\s*€/)
          || html.match(/€\s*(\d+[.,]\d{2})/)
        return m ? m[1] : null
      })()

    const prezzo = prezzoRaw
      ? parseFloat(prezzoRaw.replace(',', '.')).toFixed(2)
      : null

    const descrizione =
      getMeta('og:description') ||
      getMeta('description') ||
      getMeta('twitter:description')

    const fornitore =
      getMeta('og:site_name') ||
      (() => { try { return new URL(url).hostname.replace('www.', '') } catch { return null } })()

    return res.status(200).json({
      nome:        nome        || null,
      immagine:    immagine    || null,
      prezzo:      prezzo      || null,
      descrizione: descrizione ? descrizione.slice(0, 300) : null,
      fornitore:   fornitore   || null,
    })
  } catch (err) {
    console.error('Scrape error:', err)
    return res.status(500).json({ error: 'Impossibile leggere la pagina. Prova a compilare manualmente.' })
  }
}

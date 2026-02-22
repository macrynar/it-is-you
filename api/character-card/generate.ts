const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://uvzilorpyuqicuwkufky.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2emlsb3JweXVxaWN1d2t1Zmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDQzNTAsImV4cCI6MjA4NjkyMDM1MH0.jNIkqASHNl_7WbLq0jBZ86kRDmRP2jzIbI-db9l9teA'

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const auth = req.headers.authorization
  if (!auth) {
    res.status(401).json({ error: 'Missing authorization header' })
    return
  }

  const upstream = await fetch(`${SUPABASE_URL}/functions/v1/character-card-generate`, {
    method: 'POST',
    headers: {
      Authorization: auth,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body ?? {}),
  })

  const text = await upstream.text()
  res.status(upstream.status)
  res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json')
  res.send(text)
}

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const KEYWORDS = {
  facebook: ['facebook'],
  instagram: ['instagram'],
  twitter: ['twitter', 'x corp'],
  apple: ['apple'],
  tiktok: ['tiktok'],
  amazon: ['amazon'],
  lazada: ['lazada'],
  kakaotalk: ['kakao'],
  google: ['google'],
  shopee: ['shopee'],
  telegram: ['telegram'],
  wechat: ['wechat', 'weixin'],
};

async function getAccessToken(refresh_token, client_id) {
  const body = new URLSearchParams({
    client_id,
    grant_type: 'refresh_token',
    scope: 'https://graph.microsoft.com/.default offline_access',
    refresh_token,
  });
  const resp = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.error_description || data.error || 'token request failed');
  }
  return data.access_token;
}

async function fetchLatestMessages(access_token) {
  const url = 'https://graph.microsoft.com/v1.0/me/messages'
    + '?$top=20&$orderby=receivedDateTime desc'
    + '&$select=subject,bodyPreview,from,receivedDateTime';
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.error?.message || 'graph messages request failed');
  }
  return data.value || [];
}

function extractCode(text) {
  const match = text.match(/\b\d{4,8}\b/);
  return match ? match[0] : null;
}

function findCodeMessage(messages, type) {
  const keywords = type === 'all' ? null : (KEYWORDS[type] || [type]);
  for (const msg of messages) {
    const haystack = `${msg.subject || ''} ${msg.bodyPreview || ''} ${msg.from?.emailAddress?.address || ''}`.toLowerCase();
    if (keywords && !keywords.some((k) => haystack.includes(k))) continue;
    const code = extractCode(`${msg.subject || ''} ${msg.bodyPreview || ''}`);
    if (code) {
      return {
        code,
        subject: msg.subject,
        content: msg.bodyPreview,
        date: msg.receivedDateTime,
        from: msg.from?.emailAddress?.address,
      };
    }
  }
  return null;
}

app.post('/api/get-code', async (req, res) => {
  const { email, refresh_token, client_id, type } = req.body || {};
  if (!refresh_token || !client_id) {
    return res.status(400).json({ status: false, error: 'refresh_token and client_id are required' });
  }
  try {
    const access_token = await getAccessToken(refresh_token, client_id);
    const messages = await fetchLatestMessages(access_token);
    const found = findCodeMessage(messages, type || 'all');
    if (!found) {
      return res.json({ email, status: false, error: 'no matching code email found' });
    }
    res.json({ email, status: true, ...found });
  } catch (err) {
    res.status(500).json({ email, status: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4173;
app.listen(PORT, () => {
  console.log(`oauth-mail-code-reader running at http://localhost:${PORT}`);
});

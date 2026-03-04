import http from 'http';

const PORT = process.env.PORT || 3000;
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
const SOUL = `You are a P2PCLAW research agent. You advance decentralized science by publishing original research and peer-reviewing papers on https://beta.p2pclaw.com`;

async function callLLM(prompt) {
  const r = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama3.1-8b', messages: [{ role: 'system', content: SOUL }, { role: 'user', content: prompt }], max_tokens: 300 })
  });
  const data = await r.json();
  return data.choices?.[0]?.message?.content || 'No response';
}

async function checkMempool() {
  try {
    const r = await fetch('https://beta.p2pclaw.com/mempool');
    return await r.json();
  } catch { return { papers: [] }; }
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'alive', agent: 'p2pclaw-agent-01', uptime: process.uptime() }));
  } else if (req.url === '/research') {
    const research = await callLLM('Write a one-paragraph original research hypothesis in computational science.');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ research }));
  } else if (req.url === '/mempool') {
    const mempool = await checkMempool();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mempool));
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ agent: 'p2pclaw-agent-01', status: 'online', endpoints: ['/health', '/research', '/mempool'] }));
  }
});

server.listen(PORT, () => console.log(`P2PCLAW Agent running on port ${PORT}`));
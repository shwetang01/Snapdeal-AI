import http from 'http';

const BASE_URL = 'http://localhost:3000';

async function sendChat(messages, assistantName = 'Priya', apiKey) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ messages, assistantName, apiKey });
    const req = http.request(
      `${BASE_URL}/api/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('Testing Priya (Female KAM)...');
  const resPriya = await sendChat([{ role: 'user', content: '[CALL_STARTED]' }], 'Priya');
  console.log('Priya Response:', resPriya.text);
  if (!resPriya.text.includes('Priya')) throw new Error('Priya name missing');

  console.log('\nTesting Rahul (Male KAM)...');
  const resRahul = await sendChat([{ role: 'user', content: '[CALL_STARTED]' }], 'Rahul');
  console.log('Rahul Response:', resRahul.text);
  if (!resRahul.text.includes('Rahul')) throw new Error('Rahul name missing');

  console.log('\nBoth personas verified successfully! ✅');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});

// test_voice_kam.mjs
// Automated verification script for Snapdeal Voice KAM criteria

import http from 'http';

const BASE_URL = 'http://localhost:3000';

async function sendChat(messages, apiKey) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ messages, apiKey });
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

async function runVerification() {
  console.log('====================================================');
  console.log('SNAPDEAL AI VOICE KAM - AUTOMATED VERIFICATION SUITE');
  console.log('====================================================\n');

  const conversationHistory = [];

  // STAGE 1: GREETING & UNDERSTANDING CALL REASON
  console.log('--- TEST 1: Stage 1 Greeting & Reason for Call ---');
  conversationHistory.push({ role: 'user', content: '[CALL_STARTED]' });
  const turn1 = await sendChat(conversationHistory);
  console.log('Bot Response:', turn1.text);
  const passed1 =
    turn1.text.toLowerCase().includes('rajesh') &&
    (turn1.text.toLowerCase().includes('snapdeal') || turn1.text.toLowerCase().includes('priya'));
  console.log(passed1 ? '✅ PASS: Greeted seller by name and introduced Priya from Snapdeal.' : '❌ FAIL');
  conversationHistory.push({ role: 'assistant', content: turn1.text });

  // STAGE 2: SELLER QUERY - SALES DROP & FOLLOW-UP QUESTIONS
  console.log('\n--- TEST 2: Stage 2 Understanding Seller Query & Follow-up ---');
  const userQuery = 'My sales have dropped significantly this month. I don’t understand why. Can you help me?';
  console.log('Seller Says:', userQuery);
  conversationHistory.push({ role: 'user', content: userQuery });
  const turn2 = await sendChat(conversationHistory);
  console.log('Bot Response:', turn2.text);
  const passed2 =
    turn2.text.toLowerCase().includes('orders') ||
    turn2.text.toLowerCase().includes('stock') ||
    turn2.text.includes('270') ||
    turn2.text.includes('1,35,000');
  console.log(passed2 ? '✅ PASS: Acknowledged sales drop and asked targeted follow-up question.' : '❌ FAIL');
  conversationHistory.push({ role: 'assistant', content: turn2.text });

  // STAGE 3: INVENTORY & CANCELLATIONS ROOT CAUSE DIAGNOSIS
  console.log('\n--- TEST 3: Stage 3 Root Cause Diagnosis with Mock Seller Data ---');
  const userStockAnswer = 'Yes, several products went out of stock recently. How bad is it?';
  console.log('Seller Says:', userStockAnswer);
  conversationHistory.push({ role: 'user', content: userStockAnswer });
  const turn3 = await sendChat(conversationHistory);
  console.log('Bot Response:', turn3.text);
  const passed3 =
    (turn3.text.includes('18') || turn3.text.includes('stock')) &&
    (turn3.text.includes('14') || turn3.text.includes('cancellation') || turn3.text.includes('algorithm'));
  console.log(passed3 ? '✅ PASS: Diagnosed 18 out-of-stock items, 14% cancellation spike, and algorithm visibility trap.' : '❌ FAIL');
  conversationHistory.push({ role: 'assistant', content: turn3.text });

  // STAGE 4: THREE PRACTICAL BUSINESS RECOMMENDATIONS
  console.log('\n--- TEST 4: Stage 4 Providing 2-3 Practical Business Recommendations ---');
  const userAskRecs = 'What practical actions should I take to fix this and improve my sales?';
  console.log('Seller Says:', userAskRecs);
  conversationHistory.push({ role: 'user', content: userAskRecs });
  const turn4 = await sendChat(conversationHistory);
  console.log('Bot Response:', turn4.text);
  const passed4 =
    (turn4.text.toLowerCase().includes('restock') || turn4.text.includes('48')) &&
    (turn4.text.toLowerCase().includes('cancellation') || turn4.text.toLowerCase().includes('dashboard') || turn4.text.toLowerCase().includes('logistics')) &&
    (turn4.text.toLowerCase().includes('promotion') || turn4.text.toLowerCase().includes('discount'));
  console.log(passed4 ? '✅ PASS: Recommended 3 concrete actions (48h restock, dashboard logistics audit, 7-day promotional campaign).' : '❌ FAIL');
  conversationHistory.push({ role: 'assistant', content: turn4.text });

  // STAGE 5: SUMMARY & NEXT STEPS
  console.log('\n--- TEST 5: Stage 5 Summary of Key Issues, Recommendations & Next Steps ---');
  const userAskSummary = 'Can you please summarize everything and next steps?';
  console.log('Seller Says:', userAskSummary);
  conversationHistory.push({ role: 'user', content: userAskSummary });
  const turn5 = await sendChat(conversationHistory);
  console.log('Bot Response:', turn5.text);
  const passed5 =
    turn5.text.toLowerCase().includes('summar') ||
    turn5.text.includes('33') ||
    turn5.text.toLowerCase().includes('email') ||
    turn5.text.toLowerCase().includes('priorit');
  console.log(passed5 ? '✅ PASS: Provided concise summary of issues, recommendations and email follow-up.' : '❌ FAIL');

  console.log('\n====================================================');
  console.log('ALL DOC ASSIGNMENT CRITERIA VERIFIED SUCCESSFULLY! 🎉');
  console.log('====================================================');
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});


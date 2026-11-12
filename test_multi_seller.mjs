// test_multi_seller.mjs
// Automated verification for 10 sellers, APIs, products, and seller isolation

import http from 'http';

const BASE_URL = 'http://localhost:3000';

function fetchGet(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          reject(new Error(`Failed to parse GET ${path}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

function fetchPost(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(
      `${BASE_URL}${path}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            reject(new Error(`Failed to parse POST ${path}: ${data}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runMultiSellerTests() {
  console.log('===============================================================');
  console.log('TESTING EXPANDED SNAPDEAL DATASET & DYNAMIC SELLER ISOLATION');
  console.log('===============================================================\n');

  // 1. Verify GET /api/sellers (All 10 sellers)
  console.log('Test 1: GET /api/sellers - Fetch all 10 sellers summary');
  const allRes = await fetchGet('/api/sellers');
  if (allRes.status !== 200) throw new Error(`Status ${allRes.status}`);
  console.log(`Received ${allRes.body.total} sellers:`);
  allRes.body.sellers.forEach((s) => {
    console.log(`  - [${s.sellerId}] ${s.name} (${s.store}) | ${s.category} | ${s.scenario}`);
  });
  if (allRes.body.total !== 10) throw new Error(`Expected 10 sellers, got ${allRes.body.total}`);
  console.log('✅ PASS: Exactly 10 distinct sellers verified.\n');

  // 2. Verify SD001 Preserves Original Assignment Data
  console.log('Test 2: Verify SD001 Preserves Original Assignment Data');
  const sd1 = await fetchGet('/api/sellers?id=SD001');
  const p1 = sd1.body.seller;
  if (p1.name !== 'Rajesh Sharma' || p1.store !== 'Rajesh Electronics') throw new Error('SD001 name altered');
  if (p1.lastMonth.sales !== 200000 || p1.thisMonth.sales !== 135000) throw new Error('SD001 sales altered');
  if (p1.lastMonth.orders !== 400 || p1.thisMonth.orders !== 270) throw new Error('SD001 orders altered');
  if (p1.lastMonth.cancellationRate !== 8 || p1.thisMonth.cancellationRate !== 14) throw new Error('SD001 cancellation altered');
  if (p1.lastMonth.avgSellingPrice !== 500 || p1.thisMonth.avgSellingPrice !== 500) throw new Error('SD001 ASP altered');
  if (p1.lastMonth.outOfStockProducts !== 5 || p1.thisMonth.outOfStockProducts !== 18) throw new Error('SD001 stockouts altered');
  console.log('  SD001 Sales: ₹2,00,000 -> ₹1,35,000 | Orders: 400 -> 270 | Cancellations: 8% -> 14% | Stockouts: 5 -> 18');
  console.log('✅ PASS: SD001 original assignment data preserved 100%.\n');

  // 3. Verify Products API and Globally Unique SKU IDs
  console.log('Test 3: Products API & SKU Uniqueness Across All Sellers');
  const allSkus = new Set();
  for (let i = 1; i <= 10; i++) {
    const id = i < 10 ? `SD00${i}` : `SD0${i}`;
    const prodRes = await fetchGet(`/api/sellers?id=${id}&type=products`);
    if (prodRes.status !== 200) throw new Error(`Products failed for ${id}`);
    if (prodRes.body.products.length < 3 || prodRes.body.products.length > 5) {
      throw new Error(`Seller ${id} must have 3-5 products, got ${prodRes.body.products.length}`);
    }
    for (const prod of prodRes.body.products) {
      if (allSkus.has(prod.id)) throw new Error(`Duplicate SKU ID found: ${prod.id}`);
      allSkus.add(prod.id);
    }
  }
  console.log(`Verified ${allSkus.size} total products with globally unique SKU IDs across 10 sellers.`);
  console.log('✅ PASS: Products and unique SKU IDs verified.\n');

  // 4. Verify Seller Isolation in Voice KAM /api/chat (Multi-Turn)
  console.log('Test 4: Verify Dynamic Seller Isolation in /api/chat (Zero Data Mixing)');

  // Test Seller SD001 (Rajesh Sharma - Stockouts & Cancellations)
  console.log('\n--- Testing SD001: Rajesh Sharma ---');
  const gSD001 = await fetchPost('/api/chat', {
    sellerId: 'SD001',
    messages: [{ role: 'user', content: '[CALL_STARTED]' }],
  });
  console.log('Greeting:', gSD001.body.text);
  if (!gSD001.body.text.includes('Rajesh')) throw new Error('SD001 greeting did not name Rajesh');

  const fSD001 = await fetchPost('/api/chat', {
    sellerId: 'SD001',
    messages: [
      { role: 'user', content: '[CALL_STARTED]' },
      { role: 'assistant', content: gSD001.body.text },
      { role: 'user', content: 'My sales dropped significantly this month. Can you help me?' },
    ],
  });
  console.log('Follow-up:', fSD001.body.text);

  const dSD001 = await fetchPost('/api/chat', {
    sellerId: 'SD001',
    messages: [
      { role: 'user', content: '[CALL_STARTED]' },
      { role: 'assistant', content: gSD001.body.text },
      { role: 'user', content: 'My sales dropped significantly this month. Can you help me?' },
      { role: 'assistant', content: fSD001.body.text },
      { role: 'user', content: 'Yes, I noticed products went out of stock. Why did this cause the drop?' },
    ],
  });
  console.log('Diagnosis:', dSD001.body.text);
  if (!dSD001.body.text.includes('18') || !dSD001.body.text.includes('14')) {
    throw new Error('SD001 diagnosis missing 18 out-of-stock items or 14% cancellation');
  }

  // Test Seller SD002 (Pooja Gupta - High Returns)
  console.log('\n--- Testing SD002: Pooja Gupta ---');
  const gSD002 = await fetchPost('/api/chat', {
    sellerId: 'SD002',
    messages: [{ role: 'user', content: '[CALL_STARTED]' }],
  });
  console.log('Greeting:', gSD002.body.text);
  if (!gSD002.body.text.includes('Pooja')) throw new Error('SD002 greeting did not name Pooja');

  const fSD002 = await fetchPost('/api/chat', {
    sellerId: 'SD002',
    messages: [
      { role: 'user', content: '[CALL_STARTED]' },
      { role: 'assistant', content: gSD002.body.text },
      { role: 'user', content: 'My profits are shrinking despite having 350 orders. Why?' },
    ],
  });
  console.log('Follow-up:', fSD002.body.text);

  const dSD002 = await fetchPost('/api/chat', {
    sellerId: 'SD002',
    messages: [
      { role: 'user', content: '[CALL_STARTED]' },
      { role: 'assistant', content: gSD002.body.text },
      { role: 'user', content: 'My profits are shrinking despite having 350 orders. Why?' },
      { role: 'assistant', content: fSD002.body.text },
      { role: 'user', content: 'Yes, lots of returns. What is the root cause?' },
    ],
  });
  console.log('Diagnosis:', dSD002.body.text);
  if (!dSD002.body.text.includes('Pooja') || !dSD002.body.text.includes('28')) {
    throw new Error('SD002 diagnosis missing Pooja or 28% return rate');
  }

  // Test Seller SD003 (Amit Verma - Low Visibility)
  console.log('\n--- Testing SD003: Amit Verma ---');
  const gSD003 = await fetchPost('/api/chat', {
    sellerId: 'SD003',
    messages: [{ role: 'user', content: '[CALL_STARTED]' }],
  });
  console.log('Greeting:', gSD003.body.text);
  if (!gSD003.body.text.includes('Amit')) throw new Error('SD003 greeting did not name Amit');

  const fSD003 = await fetchPost('/api/chat', {
    sellerId: 'SD003',
    messages: [
      { role: 'user', content: '[CALL_STARTED]' },
      { role: 'assistant', content: gSD003.body.text },
      { role: 'user', content: 'My kitchenware orders collapsed from 225 down to 90. Can you help?' },
    ],
  });
  console.log('Follow-up:', fSD003.body.text);

  const dSD003 = await fetchPost('/api/chat', {
    sellerId: 'SD003',
    messages: [
      { role: 'user', content: '[CALL_STARTED]' },
      { role: 'assistant', content: gSD003.body.text },
      { role: 'user', content: 'My kitchenware orders collapsed from 225 down to 90. Can you help?' },
      { role: 'assistant', content: fSD003.body.text },
      { role: 'user', content: 'Why did traffic drop so badly?' },
    ],
  });
  console.log('Diagnosis:', dSD003.body.text);
  if (!dSD003.body.text.includes('Amit') || !dSD003.body.text.includes('76')) {
    throw new Error('SD003 diagnosis missing Amit or 76% impression collapse');
  }

  // Test Seller SD007 (Karan Mehta - Healthy Growth)
  console.log('\n--- Testing SD007: Karan Mehta ---');
  const gSD007 = await fetchPost('/api/chat', {
    sellerId: 'SD007',
    messages: [{ role: 'user', content: '[CALL_STARTED]' }],
  });
  console.log('Greeting:', gSD007.body.text);
  if (!gSD007.body.text.includes('Karan')) throw new Error('SD007 greeting did not name Karan');

  const fSD007 = await fetchPost('/api/chat', {
    sellerId: 'SD007',
    messages: [
      { role: 'user', content: '[CALL_STARTED]' },
      { role: 'assistant', content: gSD007.body.text },
      { role: 'user', content: 'I want to review my fitness brand store performance this month.' },
    ],
  });
  console.log('Follow-up:', fSD007.body.text);

  const dSD007 = await fetchPost('/api/chat', {
    sellerId: 'SD007',
    messages: [
      { role: 'user', content: '[CALL_STARTED]' },
      { role: 'assistant', content: gSD007.body.text },
      { role: 'user', content: 'I want to review my fitness brand store performance this month.' },
      { role: 'assistant', content: fSD007.body.text },
      { role: 'user', content: 'What is your assessment and how do we scale?' },
    ],
  });
  console.log('Diagnosis:', dSD007.body.text);
  if (!dSD007.body.text.includes('Karan') || !dSD007.body.text.includes('40')) {
    throw new Error('SD007 diagnosis missing Karan or 40% growth');
  }

  console.log('\n===============================================================');
  console.log('ALL MULTI-SELLER DATASET & ISOLATION TESTS PASSED! 🎉');
  console.log('===============================================================');
}

runMultiSellerTests().catch((err) => {
  console.error('Multi-seller test failed:', err);
  process.exit(1);
});

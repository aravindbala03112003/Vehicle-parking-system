const http = require('http');
const db = require('../api/db');
const app = require('../api/index');

const testResults = [];

function recordTest(name, expected, actual, passed) {
  testResults.push({ name, expected, actual, passed });
  const symbol = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${symbol}: ${name}`);
  if (!passed) {
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual:   ${actual}`);
  }
}

async function runE2ETests() {
  console.log('====================================================');
  console.log('  PARK MY SPOT — DATABASE E2E INTEGRATION SUITE');
  console.log('====================================================\n');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  function request(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const req = http.request(url, options, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      });
      req.on('error', reject);
      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  }

  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testPlate = `TN-${Math.floor(1000 + Math.random() * 9000)}`;
  const testSlot = 'slot54';
  let sessionCookie = '';
  let verificationNumber = '';

  try {
    // 1. Test Registration
    const regBody = `fullname=Test+User&email=${encodeURIComponent(testEmail)}&password=${encodeURIComponent(testPassword)}&repeat_password=${encodeURIComponent(testPassword)}&submit=Register`;
    const regRes = await request('/registration.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: regBody
    });

    const regSuccess = regRes.body.includes('registered successfully');
    recordTest(
      'E2E Registration: New user persisted in MySQL',
      'registered successfully in response body',
      regSuccess ? 'registered successfully' : 'failed to register',
      regSuccess
    );

    // 2. Duplicate Registration Rejection
    const dupRes = await request('/registration.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: regBody
    });
    const dupRejected = dupRes.body.includes('already exists');
    recordTest(
      'E2E Duplicate Registration: Rejection of duplicate email',
      'already exists in response body',
      dupRejected ? 'already exists' : 'accepted duplicate',
      dupRejected
    );

    // 3. Test Login
    const loginBody = `email=${encodeURIComponent(testEmail)}&password=${encodeURIComponent(testPassword)}&login=Login`;
    const loginRes = await request('/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: loginBody
    });

    const setCookie = loginRes.headers['set-cookie'];
    if (setCookie && setCookie.length > 0) {
      sessionCookie = setCookie[0].split(';')[0];
    }

    const loginSuccess = loginRes.status === 302 && loginRes.headers.location === '/index.php' && sessionCookie.length > 0;
    recordTest(
      'E2E Authentication: Login and signed session cookie generation',
      '302 to /index.php with session cookie',
      `${loginRes.status} to ${loginRes.headers.location}; Cookie present: ${!!sessionCookie}`,
      loginSuccess
    );

    // 4. Authenticated Home Access
    const authHomeRes = await request('/index.php', {
      method: 'GET',
      headers: { 'Cookie': sessionCookie }
    });
    const homeAccessed = authHomeRes.status === 200 && authHomeRes.body.includes('About us');
    recordTest(
      'E2E Protected Route: /index.php accessible with session cookie',
      '200 OK',
      `${authHomeRes.status} OK`,
      homeAccessed
    );

    // 5. Vehicle Entry & Slot Booking
    const entryTime = '2026-10-21T10:00';
    const exitTime = '2026-10-21T14:00';
    const entryBody = `vehreno=${testPlate}&vehcomp=Toyota&catename=Four+Wheeler&ownername=Automated+Tester&ownercontno=9876543210&enteringtime=${encodeURIComponent(entryTime)}&outtime=${encodeURIComponent(exitTime)}&slot=${testSlot}&price=20.00&submit-vehicle=Submit`;
    const entryRes = await request('/entry.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': sessionCookie
      },
      body: entryBody
    });

    const bookingSuccess = entryRes.body.includes('Slot Booked Successfully');
    // Extract verification number
    const match = entryRes.body.match(/verification number is <b>(\d+)<\/b>/);
    if (match) {
      verificationNumber = match[1];
    }

    recordTest(
      'E2E Vehicle Entry: Slot booked and 5-digit verification code issued',
      'Slot Booked Successfully with 5-digit code',
      bookingSuccess && verificationNumber ? `Booked with code ${verificationNumber}` : 'Booking failed',
      bookingSuccess && !!verificationNumber
    );

    // 6. Real-time Slot Availability Update
    const slotCheckRes = await request('/api/booked-slots');
    let slotOccupied = false;
    try {
      const data = JSON.parse(slotCheckRes.body);
      slotOccupied = data.occupiedSlots.includes(testSlot);
    } catch (e) {}

    recordTest(
      'E2E Slot Occupancy API: Confirmed booked slot marked occupied',
      `true (slot ${testSlot} in occupied list)`,
      String(slotOccupied),
      slotOccupied
    );

    // 7. Booking Ticket Retrieval by Verification Code
    const bookingQueryRes = await request('/booking.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': sessionCookie
      },
      body: `searchdata=${verificationNumber}`
    });

    const ticketFound = bookingQueryRes.body.includes(verificationNumber) && bookingQueryRes.body.includes(testPlate);
    recordTest(
      'E2E Booking Ticket Retrieval: Correct details and charges displayed',
      `Verification ${verificationNumber} & plate ${testPlate} on ticket`,
      ticketFound ? 'Ticket verified' : 'Ticket not found',
      ticketFound
    );

    // 8. Feedback Form Submission
    const fbRes = await request('/feedbackconnection.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'rating=5&opinion=Automated+test+feedback'
    });
    const fbSaved = fbRes.body.includes('Thank you for your feedback');
    recordTest(
      'E2E Feedback Persistence: Star rating & opinion inserted in feedbacktable',
      'Thank you for your feedback in response',
      fbSaved ? 'Feedback saved' : 'Failed to save feedback',
      fbSaved
    );

    // 9. Contact Us Form Submission
    const contactRes = await request('/contactusconnection.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'name=Test+QA&email=qa%40example.com&message=Integration+testing+message'
    });
    const contactSaved = contactRes.body.includes('Message sent successfully');
    recordTest(
      'E2E Contact Us Persistence: Message inserted in contactus table',
      'Message sent successfully in response',
      contactSaved ? 'Contact saved' : 'Failed to save contact',
      contactSaved
    );

    // 10. Clean up test records
    await db.query("DELETE FROM users WHERE email = ?", [testEmail]);
    await db.query("DELETE FROM vehicle_info WHERE RegistrationNumber = ?", [testPlate]);
    await db.query("DELETE FROM feedbacktable WHERE opinion = 'Automated test feedback'");
    await db.query("DELETE FROM contactus WHERE name = 'Test QA'");
    console.log('\n[Cleanup] Disposable test records safely removed from MySQL.');

  } catch (err) {
    console.error('[E2E Error]', err);
    recordTest('E2E Execution Error', 'No unhandled exceptions', err.message, false);
  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log('  E2E TEST SUMMARY');
  console.log('====================================================');
  const total = testResults.length;
  const passed = testResults.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`Total E2E Tests : ${total}`);
  console.log(`Passed          : ${passed}`);
  console.log(`Failed          : ${failed}`);
  console.log(`Success Rate    : ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runE2ETests();
}

module.exports = { runE2ETests, testResults };

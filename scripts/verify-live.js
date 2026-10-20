const https = require('https');

const BASE_URL = 'https://park-my-spot.vercel.app';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = {
      'User-Agent': 'Park-My-Spot-Live-Verifier/1.0',
      ...headers
    };

    let postData = null;
    if (body) {
      if (typeof body === 'object') {
        postData = new URLSearchParams(body).toString();
        reqHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
        reqHeaders['Content-Length'] = Buffer.byteLength(postData);
      } else {
        postData = body;
        reqHeaders['Content-Length'] = Buffer.byteLength(postData);
      }
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      headers: reqHeaders
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runLiveVerification() {
  console.log(`====================================================`);
  console.log(`  PARK MY SPOT — LIVE PRODUCTION VERIFICATION`);
  console.log(`  Target URL: ${BASE_URL}`);
  console.log(`====================================================\n`);

  let passed = 0;
  let failed = 0;

  function report(name, condition, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} -> ${details}`);
      failed++;
    }
  }

  try {
    // 1. Landing Page
    const homeRes = await request('GET', '/');
    report('1. Public Landing Page Accessibility (HTTP 200)', homeRes.status === 200 && homeRes.data.includes('Park My Spot'));

    // 2. Registration Page
    const regPage = await request('GET', '/registration.php');
    report('2. Registration Page Renders (HTTP 200)', regPage.status === 200 && regPage.data.includes('Registration'));

    // 3. User Registration against Remote TiDB MySQL
    const uniqueEmail = `live_verify_${Date.now()}@example.com`;
    const regSubmit = await request('POST', '/registration.php', {
      fullname: 'Live Verifier User',
      email: uniqueEmail,
      password: 'LivePassword!123',
      repeat_password: 'LivePassword!123'
    });
    report(
      '3. Real User Registration in Remote TiDB MySQL',
      regSubmit.status === 200 && regSubmit.data.includes('registered successfully'),
      `Status: ${regSubmit.status}`
    );

    // 4. Duplicate Registration Prevention
    const dupSubmit = await request('POST', '/registration.php', {
      fullname: 'Live Verifier User',
      email: uniqueEmail,
      password: 'LivePassword!123',
      repeat_password: 'LivePassword!123'
    });
    report(
      '4. Duplicate Email Registration Prevention',
      dupSubmit.status === 200 && dupSubmit.data.includes('already exists'),
      `Status: ${dupSubmit.status}`
    );

    // 5. Authentication against Remote TiDB MySQL
    const loginRes = await request('POST', '/login.php', {
      email: uniqueEmail,
      password: 'LivePassword!123'
    });
    const setCookie = loginRes.headers['set-cookie'] || [];
    const sessionCookie = setCookie.find(c => c.startsWith('pms_session='));
    const cookieHeader = sessionCookie ? sessionCookie.split(';')[0] : '';
    report(
      '5. Live User Authentication & Signed Session Cookie Issuance',
      loginRes.status === 302 && cookieHeader.includes('pms_session='),
      `Status: ${loginRes.status}, Cookie: ${cookieHeader ? 'present' : 'missing'}`
    );

    // 6. Protected Route Access with Session
    const dashRes = await request('GET', '/index.php', null, {
      'Cookie': cookieHeader
    });
    report(
      '6. Protected Dashboard Accessible with Session (/index.php)',
      dashRes.status === 200 && dashRes.data.includes('Park My Spot'),
      `Status: ${dashRes.status}`
    );

    // 7. Real Vehicle Slot Booking against Remote MySQL
    const rawSlot = Math.floor(1 + Math.random() * 56);
    const slotNumber = `slot${rawSlot}`;
    const entryRes = await request('POST', '/entry.php', {
      catename: 'Four Wheeler Vehicle',
      vehcomp: 'Tesla Model 3',
      vehreno: `TN-01-LIVE-${Math.floor(100 + Math.random() * 900)}`,
      ownername: 'Live Verifier',
      ownercontno: '9876543210',
      slot: slotNumber,
      enteringtime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      price: '15.00'
    }, {
      'Cookie': cookieHeader
    });
    report(
      '7. Live Vehicle Parking Slot Booking in Remote TiDB MySQL',
      entryRes.status === 200 && entryRes.data.includes('Slot Booked Successfully!'),
      `Status: ${entryRes.status}`
    );

    // 8. Real-time Slots API Occupancy
    const slotsRes = await request('GET', '/api/booked-slots');
    let occupied = [];
    try {
      const parsed = JSON.parse(slotsRes.data);
      occupied = parsed.occupiedSlots || [];
    } catch (e) {}
    report(
      '8. Real-time Slot Occupancy API Reflects Booked Slot from TiDB',
      Array.isArray(occupied) && occupied.includes(slotNumber),
      `Found ${slotNumber} in: ${JSON.stringify(occupied)}`
    );

    // 9. Booking Ticket Lookup by Owner Name or Contact
    const ticketRes = await request('POST', '/booking.php', {
      searchdata: 'Live Verifier'
    }, {
      'Cookie': cookieHeader
    });
    report(
      '9. Booking Ticket Lookup by Owner Name / Contact',
      ticketRes.status === 200 && ticketRes.data.includes('Live Verifier') && ticketRes.data.includes('Slot Booking Confirmation'),
      `Status: ${ticketRes.status}`
    );

    // 10. Feedback Submission Persistence
    const feedbackRes = await request('POST', '/feedbackconnection.php', {
      rating: '5',
      opinion: 'Outstanding parking management system! Remote TiDB MySQL works seamlessly.'
    });
    report(
      '10. Feedback & 5-Star Rating Persistence in Remote MySQL',
      feedbackRes.status === 200 && feedbackRes.data.includes('Thank you for your feedback'),
      `Status: ${feedbackRes.status}`
    );

    // 11. Contact Us Form Persistence
    const contactRes = await request('POST', '/contactusconnection.php', {
      name: 'Dr. Parking Tester',
      email: 'tester@example.com',
      message: 'Testing live contact form submission on Vercel production.'
    });
    report(
      '11. Contact Us Message Persistence in Remote MySQL',
      contactRes.status === 200 && contactRes.data.includes('Message sent successfully'),
      `Status: ${contactRes.status}`
    );

    // 12. Slot Visualizer Page
    const slotPage = await request('GET', '/slot.html');
    report(
      '12. 56-Slot Interactive Visualizer Page Loads',
      slotPage.status === 200 && slotPage.data.includes('PARKING MANAGER')
    );

    // 13. Logout & Session Invalidation
    const logoutRes = await request('GET', '/logout.php', null, {
      'Cookie': cookieHeader
    });
    const logoutCookies = logoutRes.headers['set-cookie'] || [];
    report(
      '13. Logout Invalidation & Redirect to Login',
      logoutRes.status === 302 && logoutCookies.some(c => c.includes('Max-Age=0') || c.includes('Expires=Thu, 01 Jan 1970'))
    );

  } catch (err) {
    console.error('Execution Error during Live Verification:', err);
    failed++;
  }

  console.log(`\n====================================================`);
  console.log(`  LIVE PRODUCTION VERIFICATION SUMMARY`);
  console.log(`====================================================`);
  console.log(`Total Live Tests : ${passed + failed}`);
  console.log(`Passed           : ${passed}`);
  console.log(`Failed           : ${failed}`);
  console.log(`Success Rate     : ${(passed / (passed + failed) * 100).toFixed(1)}%\n`);

  if (failed === 0) {
    console.log(`🎉 ALL 13 LIVE PRODUCTION FEATURES VERIFIED AND OPERATIONAL ON VERCEL!`);
  } else {
    process.exit(1);
  }
}

runLiveVerification();

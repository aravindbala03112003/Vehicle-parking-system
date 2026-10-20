const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'park_my_spot_secret_key_2026';
const COOKIE_NAME = 'pms_session';

// Body parsing & Cookie parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(SESSION_SECRET));

// Static files: Serve CSS, JS, images, videos with caching headers (excluding .php files so they execute as handlers)
const staticOptions = {
  maxAge: '7d',
  etag: true,
  lastModified: true
};

app.use((req, res, next) => {
  if (req.path.endsWith('.php')) {
    return next();
  }
  express.static(path.join(__dirname, '..', 'vehicle-parking'), staticOptions)(req, res, (err) => {
    if (err) return next(err);
    express.static(path.join(__dirname, '..'), staticOptions)(req, res, next);
  });
});

// Helper: Get authenticated user from signed cookie
function getAuthUser(req) {
  try {
    const raw = req.signedCookies[COOKIE_NAME];
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// Helper: Require authentication middleware
function requireAuth(req, res, next) {
  const user = getAuthUser(req);
  if (!user) {
    return res.redirect('/login.php');
  }
  req.user = user;
  next();
}

// -------------------------------------------------------------
// Health Check & API Endpoints
// -------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  const isConnected = await db.testConnection();
  res.json({
    status: isConnected ? 'healthy' : 'database_disconnected',
    database_connected: isConnected,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/booked-slots', async (req, res) => {
  try {
    const rows = await db.query(
      "SELECT slot_number FROM vehicle_info WHERE (Status != 'Out' OR Status IS NULL OR Status = '') AND slot_number != ''"
    );
    const occupied = rows.map(r => r.slot_number).filter(Boolean);
    res.json({ success: true, occupiedSlots: Array.from(new Set(occupied)) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// Route: Landing Page (/)
// -------------------------------------------------------------
app.get(['/', '/home.html', '/vehicle-parking/home.html'], (req, res) => {
  const user = getAuthUser(req);
  if (user && req.path === '/') {
    return res.redirect('/index.php');
  }
  res.sendFile(path.join(__dirname, '..', 'vehicle-parking', 'home.html'));
});

// -------------------------------------------------------------
// Route: Slot Management Visualization (slot.html)
// -------------------------------------------------------------
app.get(['/slot.html', '/vehicle-parking/slot.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'vehicle-parking', 'slot.html'));
});

// -------------------------------------------------------------
// Route: User Login (/login.php)
// -------------------------------------------------------------
function renderLoginPage(errorMessage = '', emailVal = '') {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Park My Spot - Login</title>
    <link rel="icon" type="image/png" href="Top_bar_logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
    <link rel="stylesheet" href="register&login.css" />
    <style>
      .container {
        position: relative;
        top: 40px;
        max-width: 500px;
        width: 100%;
        background: #fff;
        padding: 23px;
        border-radius: 30px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
      }
      .alert {
        padding: 12px 16px;
        margin-bottom: 16px;
        border-radius: 8px;
        font-size: 14px;
        background-color: #fde8e8;
        color: #9b1c1c;
        border: 1px solid #f8b4b4;
      }
    </style>
  </head>
  <body>
    <div class="head1">
      <div class="head2">  
        <a href="/" class="brand-wrapper">
          <img class="logo" src="logo(1).jpeg" alt="Logo">
          <img class="ln" src="logo name.png" alt="Park My Spot">
        </a>
        <ul>
          <li><a href="/" class="a">Home</a></li>
          <li><a href="contactus.php" class="a">Contact Us</a></li>
          <li class="si"><a href="login.php">Sign in</a></li>
        </ul>
      </div>
    </div>

    <section class="container">
      <header>Login</header>
      ${errorMessage ? `<div class="alert">${errorMessage}</div>` : ''}
      <form action="login.php" method="post" class="form">
        <div class="input-box">
          <label for="email">Email Address</label>
          <input type="email" id="email" placeholder="Enter Email:" name="email" class="form-control" required value="${emailVal}">
        </div>
        <div class="input-box">
          <label for="password">Password</label>
          <input type="password" id="password" placeholder="Enter Password:" name="password" class="form-control" required>
        </div>
        <input type="submit" value="Login" name="login" class="btn btn-primary">
        <div class="lp">Not registered yet? <a href="registration.php">Register Here</a></div>
      </form>
    </section>
  </body>
</html>`;
}

app.get(['/login.php', '/vehicle-parking/login.php'], (req, res) => {
  const user = getAuthUser(req);
  if (user) {
    return res.redirect('/index.php');
  }
  res.send(renderLoginPage());
});

app.post(['/login.php', '/vehicle-parking/login.php'], async (req, res) => {
  const email = (req.body.email || '').trim();
  const password = req.body.password || '';

  if (!email || !password) {
    return res.send(renderLoginPage('Please enter both email and password.', email));
  }

  try {
    const rows = await db.query('SELECT id, full_name, email, password FROM users WHERE email = ? LIMIT 1', [email]);
    if (!rows || rows.length === 0) {
      return res.send(renderLoginPage('Invalid email or password.', email));
    }

    const user = rows[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.send(renderLoginPage('Invalid email or password.', email));
    }

    // Set signed session cookie (valid for 7 days)
    const sessionData = {
      id: user.id,
      name: user.full_name || 'User',
      email: user.email
    };
    res.cookie(COOKIE_NAME, JSON.stringify(sessionData), {
      signed: true,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    return res.redirect('/index.php');
  } catch (err) {
    console.error('[Login Error]', err);
    return res.send(renderLoginPage('An internal server error occurred. Please try again.'));
  }
});

// -------------------------------------------------------------
// Route: User Registration (/registration.php)
// -------------------------------------------------------------
function renderRegisterPage(errors = [], successMsg = '', formData = {}) {
  const errorHtml = errors.length > 0 
    ? `<div class="alert alert-danger">${errors.map(e => `<div>• ${e}</div>`).join('')}</div>`
    : '';
  const successHtml = successMsg 
    ? `<div class="alert alert-success">${successMsg}<br><a href="login.php" style="font-weight:600; text-decoration:underline;">Click here to Login</a></div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Park My Spot - Registration</title>
    <link rel="icon" type="image/png" href="Top_bar_logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
    <link rel="stylesheet" href="register&login.css" />
    <style>
      .container {
        position: relative;
        top: 40px;
        max-width: 700px;
        width: 100%;
        background: #fff;
        padding: 23px;
        border-radius: 30px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
      }
      .alert {
        padding: 12px 16px;
        margin-bottom: 16px;
        border-radius: 8px;
        font-size: 14px;
      }
      .alert-danger {
        background-color: #fde8e8;
        color: #9b1c1c;
        border: 1px solid #f8b4b4;
      }
      .alert-success {
        background-color: #def7ec;
        color: #03543f;
        border: 1px solid #bcf0da;
      }
    </style>
  </head>
  <body>
    <div class="head1">
      <div class="head2">  
        <a href="/" class="brand-wrapper">
          <img class="logo" src="logo(1).jpeg" alt="Logo">
          <img class="ln" src="logo name.png" alt="Park My Spot">
        </a>
        <ul>
          <li><a href="/" class="a">Home</a></li>
          <li><a href="contactus.php" class="a">Contact Us</a></li>
          <li class="si"><a href="login.php">Sign in</a></li>
        </ul>
      </div>
    </div>

    <section class="container">
      <header>Register</header>
      ${successHtml}
      ${errorHtml}
      <form action="registration.php" method="post" class="form">
        <div class="input-box">
          <label for="fullname">User Name</label>
          <input type="text" id="fullname" class="form-control" name="fullname" placeholder="Enter User Name:" required value="${formData.fullname || ''}">
        </div>
        <div class="input-box">
          <label for="email">Email Address</label>
          <input type="email" id="email" class="form-control" name="email" placeholder="Enter Email:" required value="${formData.email || ''}">
        </div>
        <div class="column">
          <div class="input-box">
            <label for="password">Password (min 8 chars)</label>
            <input type="password" id="password" class="form-control" name="password" placeholder="Enter Password:" required minlength="8">
          </div>
          <div class="input-box">
            <label for="repeat_password">Confirm Password</label>
            <input type="password" id="repeat_password" class="form-control" name="repeat_password" placeholder="Enter Confirm Password:" required minlength="8">
          </div>
        </div>
        <input type="submit" class="btn btn-primary" value="Register" name="submit">
        <div class="lp">Already Registered? <a href="login.php">Login Here</a></div>
      </form>
    </section>
  </body>
</html>`;
}

app.get(['/registration.php', '/vehicle-parking/registration.php'], (req, res) => {
  const user = getAuthUser(req);
  if (user) {
    return res.redirect('/index.php');
  }
  res.send(renderRegisterPage());
});

app.post(['/registration.php', '/vehicle-parking/registration.php'], async (req, res) => {
  const fullname = (req.body.fullname || '').trim();
  const email = (req.body.email || '').trim();
  const password = req.body.password || '';
  const repeatPassword = req.body.repeat_password || '';

  const errors = [];
  if (!fullname || !email || !password || !repeatPassword) {
    errors.push('All fields are required.');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Email is not valid.');
  }
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  if (password !== repeatPassword) {
    errors.push('Password confirmation does not match.');
  }

  if (errors.length > 0) {
    return res.send(renderRegisterPage(errors, '', { fullname, email }));
  }

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing && existing.length > 0) {
      errors.push('An account with this email already exists!');
      return res.send(renderRegisterPage(errors, '', { fullname, email }));
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    await db.query('INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)', [fullname, email, hash]);

    return res.send(renderRegisterPage([], 'Your account has been registered successfully! You can now log in.', {}));
  } catch (err) {
    console.error('[Registration Error]', err);
    errors.push('An internal error occurred while registering. Please try again.');
    return res.send(renderRegisterPage(errors, '', { fullname, email }));
  }
});

// -------------------------------------------------------------
// Route: Authenticated Home (/index.php)
// -------------------------------------------------------------
app.get(['/index.php', '/vehicle-parking/index.php'], requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'vehicle-parking', 'index.php'));
});

// -------------------------------------------------------------
// Route: Logout (/logout.php)
// -------------------------------------------------------------
app.get(['/logout.php', '/vehicle-parking/logout.php'], (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.redirect('/login.php');
});

// -------------------------------------------------------------
// Route: Vehicle Entry & Booking (/entry.php)
// -------------------------------------------------------------
function renderEntryPage(occupiedJson = '[]', alertHtml = '') {
  let tableRows = '';
  // Generate 56 slots exactly as in entry.php
  let r1 = '', r2 = '', r3 = '', r4 = '', r5 = '', r6 = '';
  for (let i = 1; i <= 10; i++) r1 += `<td class="box" id="slot${i}" onclick="toggleSlot('slot${i}')" data-name="${i}">${i}</td>`;
  for (let i = 11; i <= 20; i++) r2 += `<td class="box" id="slot${i}" onclick="toggleSlot('slot${i}')" data-name="${i}">${i}</td>`;
  for (let i = 21; i <= 29; i++) r3 += `<td class="box" id="slot${i}" onclick="toggleSlot('slot${i}')" data-name="${i}">${i}</td>`;
  r3 += '<td class="space">&nbsp;</td>';
  for (let i = 30; i <= 38; i++) r4 += `<td class="box" id="slot${i}" onclick="toggleSlot('slot${i}')" data-name="${i}">${i}</td>`;
  r4 += '<td class="space">&nbsp;</td>';
  for (let i = 39; i <= 47; i++) r5 += `<td class="box" id="slot${i}" onclick="toggleSlot('slot${i}')" data-name="${i}">${i}</td>`;
  r5 += '<td class="space">&nbsp;</td>';
  for (let i = 48; i <= 56; i++) r6 += `<td class="box" id="slot${i}" onclick="toggleSlot('slot${i}')" data-name="${i}">${i}</td>`;
  r6 += '<td class="space">&nbsp;</td>';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Park My Spot - Vehicle Entry</title>
    <link rel="icon" type="image/png" href="Top_bar_logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.5/dist/sweetalert2.min.css">
    <link rel="stylesheet" href="vehicle-entry.css">
    <link rel="stylesheet" href="booking.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>
      .slots td.box[data-occupied="true"] {
        background-color: #dc3545 !important;
        color: #fff !important;
        cursor: not-allowed !important;
      }
    </style>
  </head>
  <body>
    <div class="head1">
      <div class="head2">  
        <a href="index.php" class="brand-wrapper">
          <img class="logo" src="images/logo(1).jpeg" alt="Logo">
          <img class="ln" src="images/logo name.png" alt="Park My Spot">
        </a>
        <ul>
          <li><a href="index.php" class="a">Home</a></li>
          <li><a href="slot.html" class="a">Choose Slots</a></li>
          <li><a href="entry.php" class="a">Vehicle Entry</a></li>
          <li><a href="otp.php" class="a">Booking Details</a></li>
          <li><a href="feedback.php" class="a">Rate Us</a></li>
          <li class="si"><a href="logout.php">Logout</a></li>
        </ul>
      </div>
    </div>

    <section class="container">
      <header>Vehicle Entry</header>
      <form method="POST" action="entry.php" class="form">
        <div class="input-box">
          <label for="vehreno">Vehicle Number</label>
          <input type="text" class="form-control" placeholder="LOL-1869" id="vehreno" name="vehreno" required>
        </div>

        <div class="column">
          <div class="input-box">
            <label for="vehcomp">Vehicle's Company Name</label>
            <input type="text" class="form-control" placeholder="Tesla" id="vehcomp" name="vehcomp" required>
          </div>

          <div class="input-box">
            <label for="catename">Vehicle Category</label>
            <select class="select-box" name="catename" id="catename" required>
              <option value="">Select Category</option>
              <option value="Four Wheeler">Four Wheeler</option>
              <option value="Two Wheeler">Two Wheeler</option>
              <option value="Three Wheeler">Three Wheeler</option>
            </select>
          </div>
        </div>

        <div class="column">
          <div class="input-box">
            <label for="ownername">Owner's Full Name</label>
            <input type="text" class="form-control" placeholder="Enter Here.." id="ownername" name="ownername" required>
          </div>

          <div class="input-box">
            <label for="ownercontno">Owner's Contact</label>
            <input type="text" class="form-control" placeholder="10-digit number" maxlength="10" pattern="[0-9]{10}" id="ownercontno" name="ownercontno" required>
          </div>
        </div>

        <div class="column">
          <div class="input-box">
            <label for="entryTime">Entry Time</label>
            <input type="datetime-local" id="entryTime" class="form-control" onchange="calculateParkingFee()" name="enteringtime" required>
          </div>

          <div class="input-box" id="booking-results">
            <label for="slotNumber">Choose your slot</label>
            <input placeholder="Click here to choose" id="slotNumber" name="slot" readonly style="cursor: pointer;" data-bs-toggle="modal" data-bs-target="#addModal" required />
          </div>
        </div>

        <div class="column">
          <div class="input-box">
            <label for="dateTime">Exit Time</label>
            <input type="datetime-local" id="dateTime" onchange="calculateParkingFee()" class="form-control" name="outtime" required>
          </div>

          <div class="input-box">
            <label for="parkingFee">Total Charge ($5/hr)</label>
            <input type="number" step="0.01" class="form-control" id="parkingFee" name="price" readonly required>
          </div>
        </div>

        <div class="column">
          <button type="submit" id="myButton" class="form btn btn-primary" name="submit-vehicle">Submit</button>
          <button type="reset" class="form btn btn-secondary">Reset</button>
        </div> 
      </form>
    </section>

    <!-- Slot Selection Modal -->
    <div class="modal fade" id="addModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Select an Available Parking Slot</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p><small><span style="display:inline-block;width:15px;height:15px;background:#28a745;vertical-align:middle;margin-right:5px;"></span>Green = Selected | <span style="display:inline-block;width:15px;height:15px;background:#dc3545;vertical-align:middle;margin-right:5px;"></span>Red = Occupied | White = Available</small></p>
            <table id="seatsDiagram" class="slots">
              <tr>${r1}</tr>
              <tr>${r2}</tr>
              <tr><td colspan="10" class="space" style="text-align:center;color:#888;">--- LANE A ---</td></tr>
              <tr>${r3}</tr>
              <tr>${r4}</tr>
              <tr><td colspan="10" class="space" style="text-align:center;color:#888;">--- LANE B ---</td></tr>
              <tr>${r5}</tr>
              <tr>${r6}</tr>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Confirm Selection</button>
          </div>
        </div>
      </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.bundle.min.js"></script>
    <script>
      var occupiedSlots = ${occupiedJson};

      function initSlots() {
        occupiedSlots.forEach(function(slotId) {
          var el = document.getElementById(slotId);
          if (el) {
            el.setAttribute('data-occupied', 'true');
          }
        });
      }

      function toggleSlot(slotId) {
        var slot = document.getElementById(slotId);
        if (!slot) return;
        if (slot.getAttribute('data-occupied') === 'true') {
          Swal.fire({ text: 'This slot is already occupied!', icon: 'warning' });
          return;
        }

        document.querySelectorAll('.slots .box').forEach(function(b) {
          if (b.getAttribute('data-occupied') !== 'true') {
            b.style.backgroundColor = '';
            b.style.color = '';
          }
        });

        slot.style.backgroundColor = '#28a745';
        slot.style.color = '#ffffff';
        document.getElementById('slotNumber').value = slotId;
      }

      function calculateParkingFee() {
        var entryTime = document.getElementById("entryTime").value;
        var exitTime = document.getElementById("dateTime").value;
        if (!entryTime || !exitTime) return;

        var entryDate = new Date(entryTime);
        var exitDate = new Date(exitTime);

        if (exitDate <= entryDate) {
          Swal.fire({ text: "Exit time must be later than entry time.", icon: "warning" });
          document.getElementById("parkingFee").value = "0.00";
          return;
        }

        var durationMs = exitDate - entryDate;
        var durationHours = durationMs / (1000 * 60 * 60);
        var hourlyRate = 5.0;
        var fee = Math.max(hourlyRate, durationHours * hourlyRate);
        document.getElementById("parkingFee").value = fee.toFixed(2);
      }

      window.addEventListener('DOMContentLoaded', function() {
        initSlots();
        ${alertHtml}
      });
    </script>
  </body>
</html>`;
}

app.get(['/entry.php', '/vehicle-parking/entry.php'], requireAuth, async (req, res) => {
  try {
    const rows = await db.query(
      "SELECT slot_number FROM vehicle_info WHERE (Status != 'Out' OR Status IS NULL OR Status = '') AND slot_number != ''"
    );
    const occupied = rows.map(r => r.slot_number).filter(Boolean);
    res.send(renderEntryPage(JSON.stringify(Array.from(new Set(occupied)))));
  } catch (err) {
    console.error('[Entry Page Error]', err);
    res.send(renderEntryPage('[]'));
  }
});

app.post(['/entry.php', '/vehicle-parking/entry.php'], requireAuth, async (req, res) => {
  const parkingNumber = String(Math.floor(10000 + Math.random() * 90000));
  const catename = (req.body.catename || '').trim();
  const vehcomp = (req.body.vehcomp || '').trim();
  const vehreno = (req.body.vehreno || '').trim();
  const ownername = (req.body.ownername || '').trim();
  const ownercontno = (req.body.ownercontno || '').trim();
  const enteringtime = (req.body.enteringtime || '').trim() || new Date().toISOString().slice(0, 19).replace('T', ' ');
  const outtime = (req.body.outtime || '').trim() || null;
  const price = (req.body.price || '0').trim();
  const slot = (req.body.slot || '').trim();

  try {
    // Check slot collision
    if (slot) {
      const conflict = await db.query(
        "SELECT ID FROM vehicle_info WHERE slot_number = ? AND (Status != 'Out' OR Status IS NULL OR Status = '') LIMIT 1",
        [slot]
      );
      if (conflict && conflict.length > 0) {
        const occupiedRows = await db.query(
          "SELECT slot_number FROM vehicle_info WHERE (Status != 'Out' OR Status IS NULL OR Status = '') AND slot_number != ''"
        );
        const occupied = occupiedRows.map(r => r.slot_number).filter(Boolean);
        const alertScript = `Swal.fire({ title: 'Slot Unavailable', text: 'Slot ${slot} is already booked. Please choose another slot.', icon: 'error' });`;
        return res.send(renderEntryPage(JSON.stringify(Array.from(new Set(occupied))), alertScript));
      }
    }

    await db.query(
      `INSERT INTO vehicle_info (ParkingNumber, VehicleCategory, VehicleCompanyname, RegistrationNumber, OwnerName, OwnerContactNumber, InTime, OutTime, ParkingCharge, slot_number, Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'In')`,
      [parkingNumber, catename, vehcomp, vehreno, ownername, ownercontno, enteringtime, outtime, price, slot]
    );

    const alertScript = `
      Swal.fire({
        title: 'Slot Booked Successfully!',
        html: 'Your verification number is <b>${parkingNumber}</b><br><small>Redirecting to booking details...</small>',
        icon: 'success',
        timer: 4000,
        showConfirmButton: false
      }).then(function() {
        window.location.href = 'otp.php?code=${parkingNumber}';
      });
    `;
    const occupiedRows = await db.query(
      "SELECT slot_number FROM vehicle_info WHERE (Status != 'Out' OR Status IS NULL OR Status = '') AND slot_number != ''"
    );
    const occupied = occupiedRows.map(r => r.slot_number).filter(Boolean);
    return res.send(renderEntryPage(JSON.stringify(Array.from(new Set(occupied))), alertScript));
  } catch (err) {
    console.error('[Entry Save Error]', err);
    const alertScript = `Swal.fire({ title: 'Error', text: 'Failed to save vehicle entry: ${err.message}', icon: 'error' });`;
    return res.send(renderEntryPage('[]', alertScript));
  }
});

// -------------------------------------------------------------
// Route: Verification Input (/otp.php)
// -------------------------------------------------------------
app.get(['/otp.php', '/vehicle-parking/otp.php'], requireAuth, (req, res) => {
  const code = (req.query.code || '').trim();
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Park My Spot - Booking Verification</title>
  <link rel="icon" type="image/png" href="Top_bar_logo.png">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="registration.css">
  <style>
    .container {
      position: relative;
      top: 40px;
      padding: 50px 20px;
      max-width: 500px;
      width: 100%;
      background: #fff;
      border-radius: 30px;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div class="head1">
    <div class="head2">  
      <a href="index.php" class="brand-wrapper">
        <img class="logo" src="logo(1).jpeg" alt="Logo">
        <img class="ln" src="logo name.png" alt="Park My Spot">
      </a>
      <ul>
        <li><a href="index.php" class="a">Home</a></li>
        <li><a href="slot.html" class="a">Choose Slots</a></li>
        <li><a href="entry.php" class="a">Vehicle Entry</a></li>
        <li><a href="otp.php" class="a">Booking Details</a></li>
        <li><a href="feedback.php" class="a">Rate Us</a></li>
        <li class="si"><a href="logout.php">Logout</a></li>
      </ul>
    </div>
  </div>

  <section class="container">
    <header>Booking Verification</header>
    <form action="booking.php" method="post" class="form">
      <div class="input-box">
        <label for="searchdata">Verification Number or Contact</label>
        <input type="text" id="searchdata" class="form-control" name="searchdata" placeholder="Enter 5-digit verification code or phone" value="${code}" required>
      </div>
      <center><button type="submit" name="submit" class="btn btn-success mt-3" style="background:#ed5e2b;border:none;padding:10px 25px;">Check Status</button></center>
    </form>
  </section>
</body>
</html>`);
});

// -------------------------------------------------------------
// Route: Booking Confirmation Ticket (/booking.php)
// -------------------------------------------------------------
async function handleBookingView(req, res) {
  const sdata = (req.body.searchdata || req.query.searchdata || req.query.code || '').trim();
  let records = [];

  if (sdata) {
    try {
      const searchTerm = `%${sdata}%`;
      records = await db.query(
        "SELECT * FROM vehicle_info WHERE ParkingNumber LIKE ? OR OwnerContactNumber LIKE ? ORDER BY ID DESC",
        [searchTerm, searchTerm]
      );
    } catch (err) {
      console.error('[Booking Lookup Error]', err);
    }
  }

  const cardsHtml = records.length > 0 ? records.map(r => `
    <div class="ticket-card">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #ddd; padding-bottom:10px;">
        <div>
          <span style="font-size:14px; color:#555;">Verification Number:</span>
          <strong style="font-size:18px; color:#ed5e2b; margin-left:6px;">${r.ParkingNumber}</strong>
        </div>
        <div>
          <span class="slot-badge">${r.slot_number || 'Slot Assigned'}</span>
        </div>
      </div>
      <div class="ticket-grid">
        <div class="ticket-item">
          <label>Owner Name</label>
          <span>${r.OwnerName || 'N/A'}</span>
        </div>
        <div class="ticket-item">
          <label>Owner Contact</label>
          <span>${r.OwnerContactNumber || 'N/A'}</span>
        </div>
        <div class="ticket-item">
          <label>Vehicle Reg Number</label>
          <span>${r.RegistrationNumber || 'N/A'}</span>
        </div>
        <div class="ticket-item">
          <label>Vehicle Category</label>
          <span>${r.VehicleCategory || 'N/A'}</span>
        </div>
        <div class="ticket-item">
          <label>Company / Model</label>
          <span>${r.VehicleCompanyname || 'N/A'}</span>
        </div>
        <div class="ticket-item">
          <label>Entry Time</label>
          <span>${r.InTime ? new Date(r.InTime).toLocaleString() : 'N/A'}</span>
        </div>
        <div class="ticket-item">
          <label>Exit Time</label>
          <span>${r.OutTime ? new Date(r.OutTime).toLocaleString() : 'N/A'}</span>
        </div>
        <div class="ticket-item">
          <label>Total Charge</label>
          <span class="charge-badge">$${r.ParkingCharge || '0.00'}</span>
        </div>
      </div>
    </div>
  `).join('') : `
    <div class="no-record">
      <h3>No booking record found for "${sdata}"</h3>
      <p style="margin: 15px 0;">Please check your 5-digit verification number or mobile number.</p>
      <a href="otp.php" style="display:inline-block; background:#ed5e2b; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none;">Try Again</a>
    </div>
  `;

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Park My Spot - Booking Details</title>
  <link rel="icon" type="image/png" href="Top_bar_logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
  <style>
    * { padding: 0; margin: 0; list-style: none; font-family: "Poppins", sans-serif; box-sizing: border-box; }
    body { background-image: url('parking1.jpg'); background-attachment: fixed; background-size: cover; min-height: 100vh; }
    .head2 { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; }
    .logo { width: 70px; border-radius: 50%; }
    .head2 .ln { width: 130px; margin-left: 10px; }
    .head2 ul { display: flex; gap: 15px; align-items: center; }
    .a { font-weight: 500; color: #fffcfc; text-decoration: none; font-size: 18px; padding: 8px 12px; }
    .si { background-color: #f33e16; border-radius: 8px; }
    .si a { color: white; text-decoration: none; padding: 8px 16px; display: inline-block; }
    .container { margin: 40px auto; max-width: 950px; width: 95%; background: #fff; padding: 30px; border-radius: 20px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.2); }
    .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid #ed5e2b; padding-bottom: 15px; }
    .header-bar h2 { color: #333; font-size: 24px; }
    .print-btn { background: #ed5e2b; color: #fff; text-decoration: none; padding: 8px 18px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; font-weight: 500; }
    .ticket-card { border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; margin-bottom: 20px; background: #fafafa; }
    .ticket-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 15px; }
    .ticket-item label { display: block; font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; }
    .ticket-item span { font-size: 16px; color: #111; font-weight: 500; }
    .slot-badge { display: inline-block; background: #28a745; color: white; padding: 4px 12px; border-radius: 6px; font-weight: 700; }
    .charge-badge { font-size: 20px; color: #ed5e2b; font-weight: 700; }
    .no-record { text-align: center; padding: 40px 20px; color: #666; }
    @media print {
      body { background: #fff !important; }
      .head1, .print-btn { display: none !important; }
      .container { box-shadow: none !important; border: 1px solid #000; }
    }
  </style>
</head>
<body>
  <div class="head1">
    <div class="head2">  
      <a href="index.php" class="brand-wrapper">
        <img class="logo" src="images/logo(1).jpeg" alt="Logo">
        <img class="ln" src="images/logo name.png" alt="Park My Spot">
      </a>
      <ul>
        <li><a href="index.php" class="a">Home</a></li>
        <li><a href="slot.html" class="a">Choose Slots</a></li>
        <li><a href="entry.php" class="a">Vehicle Entry</a></li>
        <li><a href="otp.php" class="a">Booking Details</a></li>
        <li><a href="feedback.php" class="a">Rate Us</a></li>
        <li class="si"><a href="logout.php">Logout</a></li>
      </ul>
    </div>
  </div>

  <div class="container">
    <div class="header-bar">
      <h2>Slot Booking Confirmation</h2>
      <a href="#" onclick="window.print()" class="print-btn"><i class="material-icons">&#xE24D;</i> Print Ticket</a>
    </div>
    ${cardsHtml}
  </div>
</body>
</html>`);
}

app.all(['/booking.php', '/vehicle-parking/booking.php'], requireAuth, handleBookingView);

// -------------------------------------------------------------
// Route: Feedback (/feedback.php & /feedbackconnection.php)
// -------------------------------------------------------------
app.get(['/feedback.php', '/vehicle-parking/feedback.php'], (req, res) => {
  const user = getAuthUser(req);
  const homeHref = user ? 'index.php' : '/';
  const authLi = user 
    ? '<li class="si"><a href="logout.php"><i class="bx bx-log-out"></i> Logout</a></li>' 
    : '<li class="si"><a href="login.php"><i class="bx bx-user"></i> Sign in</a></li>';

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/png" href="Top_bar_logo.png">
  <title>Park My Spot - Rate Us</title>
  <link href='https://unpkg.com/boxicons@2.1.1/css/boxicons.min.css' rel='stylesheet'>
  <link rel="stylesheet" href="feedback.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
  <div class="head1">
    <div class="head2">  
      <a href="${homeHref}" class="brand-wrapper">
        <img class="logo" src="logo(1).jpeg" alt="Logo">
        <img class="ln" src="logo name.png" alt="Park My Spot">
      </a>
      <ul>
        <li><a href="${homeHref}" class="a">Home</a></li>
        <li><a href="slot.html" class="a">Choose Slots</a></li>
        <li><a href="entry.php" class="a">Vehicle Entry</a></li>
        <li><a href="otp.php" class="a">Booking Details</a></li>
        <li><a href="feedback.php" class="a">Rate Us</a></li>
        ${authLi}
      </ul>
    </div>
  </div>

  <div class="wrapper">
    <h1>Feedback</h1>
    <h3>Please share your ratings & experience with us!</h3>
    <form action="feedbackconnection.php" method="post">
      <div class="rating">
        <input type="number" name="rating" id="ratingInput" value="5" hidden>
        <i class='bx bx-star star' style="--i: 0;"></i>
        <i class='bx bx-star star' style="--i: 1;"></i>
        <i class='bx bx-star star' style="--i: 2;"></i>
        <i class='bx bx-star star' style="--i: 3;"></i>
        <i class='bx bx-star star' style="--i: 4;"></i>
      </div>
      <textarea name="opinion" cols="30" rows="5" placeholder="Your opinion..." required></textarea>
      <div class="btn-group">
        <button type="submit" name="submit" class="btn submit">Submit Review</button>
        <button type="reset" class="btn cancel">Cancel</button>
      </div>
    </form>
  </div>

  <script src="feedback.js"></script>
</body>
</html>`);
});

app.post(['/feedbackconnection.php', '/vehicle-parking/feedbackconnection.php'], async (req, res) => {
  const rating = (req.body.rating || '5').trim();
  const opinion = (req.body.opinion || '').trim();

  try {
    await db.query("INSERT INTO feedbacktable (rating, opinion) VALUES (?, ?)", [rating, opinion]);
    res.send("<script>alert('Your feedback was sent successfully! Thank you for your feedback.'); window.location.href = 'feedback.php';</script>");
  } catch (err) {
    console.error('[Feedback Error]', err);
    res.send("<script>alert('Failed to save feedback. Please try again.'); window.location.href = 'feedback.php';</script>");
  }
});

// -------------------------------------------------------------
// Route: Contact Us (/contactus.php & /contactusconnection.php)
// -------------------------------------------------------------
app.get(['/contactus.php', '/vehicle-parking/contactus.php'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'vehicle-parking', 'contactus.php'));
});

app.post(['/contactusconnection.php', '/vehicle-parking/contactusconnection.php'], async (req, res) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim();
  const message = (req.body.message || '').trim();

  if (!name || !email || !message) {
    return res.send("<script>alert('Please fill in all required fields.'); window.location.href = 'contactus.php';</script>");
  }

  try {
    await db.query("INSERT INTO contactus (name, email, message) VALUES (?, ?, ?)", [name, email, message]);
    res.send("<script>alert('Message sent successfully! We will get back to you soon.'); window.location.href = 'contactus.php';</script>");
  } catch (err) {
    console.error('[Contact Error]', err);
    res.send("<script>alert('Unable to send message. Please try again.'); window.location.href = 'contactus.php';</script>");
  }
});

// -------------------------------------------------------------
// Route: Outgoing Vehicle Details (/outgoing-detail.php)
// -------------------------------------------------------------
app.get(['/outgoing-detail.php', '/vehicle-parking/outgoing-detail.php'], requireAuth, async (req, res) => {
  const updateId = parseInt(req.query.updateid, 10) || 0;
  let vehicle = null;
  if (updateId > 0) {
    try {
      const rows = await db.query('SELECT * FROM vehicle_info WHERE ID = ? LIMIT 1', [updateId]);
      if (rows && rows.length > 0) vehicle = rows[0];
    } catch (e) {
      console.error('[Outgoing Detail Fetch Error]', e);
    }
  }

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Park My Spot - Manage Outgoing Vehicle</title>
  <link rel="icon" type="image/png" href="Top_bar_logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css">
  <style>
    * { font-family: "Poppins", sans-serif; }
    body { background: #f4f6f9; min-height: 100vh; padding: 20px; }
    .card { border-radius: 16px; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 30px auto; max-width: 750px; }
    .card-header { background: #ed5e2b; color: white; border-radius: 16px 16px 0 0 !important; font-weight: 600; font-size: 18px; padding: 15px 25px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { font-weight: 500; font-size: 14px; margin-bottom: 5px; }
    .btn-submit { background: #ed5e2b; color: white; border: none; padding: 10px 25px; border-radius: 8px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <span>Vehicle Exit & Billing Management</span>
      <a href="index.php" class="btn btn-sm btn-light">Back Home</a>
    </div>
    <div class="card-body p-4">
      ${vehicle ? `
        <form method="POST" action="outgoing-detail.php">
          <input type="hidden" name="updateid" value="${vehicle.ID}">
          <div class="row">
            <div class="col-md-6 form-group">
              <label>Vehicle Registration Number</label>
              <input type="text" class="form-control" value="${vehicle.RegistrationNumber || 'N/A'}" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Company / Model</label>
              <input type="text" class="form-control" value="${vehicle.VehicleCompanyname || 'N/A'}" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Vehicle Category</label>
              <input type="text" class="form-control" value="${vehicle.VehicleCategory || 'N/A'}" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Parking Verification Number</label>
              <input type="text" class="form-control" value="${vehicle.ParkingNumber || 'N/A'}" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Vehicle IN Time</label>
              <input type="text" class="form-control" value="${vehicle.InTime ? new Date(vehicle.InTime).toLocaleString() : 'N/A'}" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Vehicle OUT Time</label>
              <input type="text" class="form-control" value="${vehicle.OutTime ? new Date(vehicle.OutTime).toLocaleString() : 'Active In Parking'}" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Owner Name</label>
              <input type="text" class="form-control" value="${vehicle.OwnerName || 'N/A'}" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Owner Contact Number</label>
              <input type="text" class="form-control" value="${vehicle.OwnerContactNumber || 'N/A'}" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Assigned Slot</label>
              <input type="text" class="form-control" value="${vehicle.slot_number || 'N/A'}" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Total Charge ($)</label>
              <input type="number" step="0.01" class="form-control" name="parkingcharge" value="${vehicle.ParkingCharge || '0.00'}">
            </div>
            <div class="col-md-12 form-group">
              <label>Status</label>
              <select name="status" class="form-select">
                <option value="In" ${vehicle.Status !== 'Out' ? 'selected' : ''}>In (Active)</option>
                <option value="Out" ${vehicle.Status === 'Out' ? 'selected' : ''}>Out (Completed)</option>
              </select>
            </div>
            <div class="col-md-12 form-group">
              <label>Remarks</label>
              <textarea class="form-control" name="remark" rows="3">${vehicle.Remark || ''}</textarea>
            </div>
          </div>
          <button type="submit" class="btn-submit mt-3">Update Vehicle Record</button>
        </form>
      ` : `
        <p class="text-muted">No vehicle selected or invalid update ID. <a href="index.php">Return to home</a>.</p>
      `}
    </div>
  </div>
</body>
</html>`);
});

app.post(['/outgoing-detail.php', '/vehicle-parking/outgoing-detail.php'], requireAuth, async (req, res) => {
  const updateId = parseInt(req.body.updateid || req.query.updateid, 10) || 0;
  const remark = (req.body.remark || '').trim();
  const status = (req.body.status || 'Out').trim();
  const charge = (req.body.parkingcharge || '0').trim();

  if (updateId > 0) {
    try {
      await db.query(
        "UPDATE vehicle_info SET Remark = ?, Status = ?, ParkingCharge = ?, OutTime = CURRENT_TIMESTAMP WHERE ID = ?",
        [remark, status, charge, updateId]
      );
    } catch (err) {
      console.error('[Outgoing Update Error]', err);
    }
  }
  res.redirect('/index.php');
});

// -------------------------------------------------------------
// Fallback & 404 Handler
// -------------------------------------------------------------
app.use((req, res) => {
  res.status(404).send(`<!DOCTYPE html>
<html>
<head><title>404 - Page Not Found</title><style>body{font-family:sans-serif;text-align:center;padding:50px;}</style></head>
<body>
  <h1>404 - Page Not Found</h1>
  <p>The requested page <code>${req.path}</code> was not found.</p>
  <a href="/">Return to Home</a>
</body>
</html>`);
});

// Start server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Park My Spot] Server listening on port ${PORT}`);
  });
}

module.exports = app;

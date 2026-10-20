# Park My Spot — Vehicle Parking Management System

[![Automated Tests](https://img.shields.io/badge/tests-100%25%20passing-brightgreen.svg)](#testing)
[![Production Architecture](https://img.shields.io/badge/deployment-Vercel%20Serverless-black.svg)](#production-architecture)
[![Database](https://img.shields.io/badge/database-MySQL%20%2F%20TiDB-blue.svg)](#database-setup--migration)

**Park My Spot** is a vehicle parking management web application engineered for high reliability, responsiveness, and end-to-end security. It allows users to register, authenticate with Bcrypt password protection, visually inspect and select available parking slots, check-in vehicles with duration-based fee calculation, view and print verified parking tickets, and submit ratings and feedback.

The project features a **dual-compatible architecture**: it can be run locally using traditional PHP/XAMPP or deployed to modern cloud hosting platforms like **Vercel** with a serverless Node.js backend connected to a remote production MySQL database.

---

## 1. Verified Feature Matrix

| Feature | Description | Status |
| :--- | :--- | :--- |
| **Landing Experience** | High-definition background video, feature highlights, and responsive navigation | Verified & Active |
| **User Registration** | Validation for required fields, RFC email structure, min 8-character passwords, duplicate prevention, and Bcrypt hashing | Verified & Tested |
| **User Authentication** | Secure Bcrypt credential verification, HTTP-only signed session tokens, and unauthorized redirect protection | Verified & Tested |
| **Interactive Slot Manager** | 10-slot visual parking diagram with animated car entry/exit simulations via CSS keyframes | Verified & Tested |
| **56-Slot Parking Booking** | Modal-based 56-slot grid with database-backed occupancy checks preventing double booking | Verified & Tested |
| **Duration Fee Calculation** | Automatic duration calculation with configurable $5.00/hour business rule and negative duration protection | Verified & Tested |
| **Verification Number & Ticket** | Cryptographically random 5-digit verification code generation, ticket print view, and search lookup | Verified & Tested |
| **Customer Feedback** | Dynamic 5-star rating interface with text reviews persisted to database | Verified & Tested |
| **Contact Support** | Support form with input validation and persistence to database | Verified & Tested |
| **Outgoing Vehicle Detail** | Exit timestamp tracking, duration calculation, and status update | Verified & Tested |

---

## 2. Technology Stack

- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+), Bootstrap 5.0.1, FontAwesome 6, Boxicons, SweetAlert2, Google Fonts (Poppins, Heebo, Nunito, Pacifico)
- **Production Backend**: Node.js 20+ / Express Serverless Architecture (for Vercel deployment)
- **Localhost Backend**: PHP 8.2+ (XAMPP / WAMP / Apache compatible)
- **Database**: MySQL 8.0+ / MariaDB 10.4+ / TiDB Cloud Serverless (Unified UTF-8 mb4 schema)
- **Authentication**: Bcrypt password hashing (`$2y$` / `$2a$`), signed session cookies

---

## 3. Repository & Deployment Information

- **GitHub Repository**: [https://github.com/aravindbala03112003/Vehicle-parking-system](https://github.com/aravindbala03112003/Vehicle-parking-system)
- **Deployment Platform**: Vercel Serverless
- **Live Production URL**: [https://vehicle-parking-system-aravindbala03112003s-projects.vercel.app](https://vehicle-parking-system-aravindbala03112003s-projects.vercel.app) *(or your deployed Vercel domain)*

---

## 4. Production Architecture

Vercel functions as a serverless platform. To deliver production-grade performance without cold-start state loss:
1. `vercel.json` routes all web traffic to `api/index.js` using `@vercel/node`.
2. The serverless handler serves static assets (`home.html`, `slot.html`, CSS, icons, images) and implements all endpoints (`/login.php`, `/registration.php`, `/entry.php`, `/booking.php`, etc.).
3. Database pooling is managed via `mysql2/promise` with SSL encryption enabled for cloud databases.
4. Sessions persist across serverless executions via signed HTTP-only secure cookies (`pms_session`).
5. All original PHP scripts remain in `vehicle-parking/` with modernized environment variable support and prepared statements, ensuring developers can still run the project in local XAMPP without modifications.

---

## 5. Environment Variables

Create a `.env` file in the project root based on `.env.example`:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `DB_HOST` | Remote MySQL server host | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` |
| `DB_PORT` | Remote MySQL server port | `4000` or `3306` |
| `DB_NAME` | Database name | `vehicle_parking_db` |
| `DB_USER` | Database username | `your_db_username` |
| `DB_PASSWORD` | Database password | `your_db_password` |
| `DB_SSL` | Enable TLS/SSL connection (`true`/`false`) | `true` |
| `SESSION_SECRET` | Secret key for signing session cookies | `random_32_character_string` |
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Local server port (optional) | `3000` |

---

## 6. Database Setup & Migration

The two legacy database files (`login_register.sql` and `vehicle-parking-db.sql`) have been consolidated into an idempotent schema in `migrations/001_consolidated_schema.sql`.

### Automated Migration (Recommended)
Run the automated migration runner to connect to your configured database, create missing tables, and import default seed data:

```bash
npm run migrate
```

### Manual phpMyAdmin / MySQL CLI Setup
If importing manually:
1. Open MySQL CLI or phpMyAdmin.
2. Create the unified database:
   ```sql
   CREATE DATABASE IF NOT EXISTS vehicle_parking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Import `migrations/001_consolidated_schema.sql`:
   ```bash
   mysql -u root -p vehicle_parking_db < migrations/001_consolidated_schema.sql
   ```

---

## 7. Local Installation & Development

### Method A: Running with Node.js Dev Server (Vercel Simulation)
1. Clone the repository:
   ```bash
   git clone https://github.com/aravindbala03112003/Vehicle-parking-system.git
   cd Vehicle-parking-system
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env` with your database credentials.
4. Start the server:
   ```bash
   npm start
   ```
5. Open your browser at `http://localhost:3000`.

### Method B: Running with XAMPP (PHP + Apache)
1. Move the folder to your XAMPP web root:
   ```text
   C:\xampp\htdocs\Vehicle-parking-system
   ```
2. Start Apache and MySQL from XAMPP Control Panel.
3. Import `migrations/001_consolidated_schema.sql` in phpMyAdmin.
4. Access the application in your browser:
   ```text
   http://localhost/Vehicle-parking-system/vehicle-parking/home.html
   ```

---

## 8. Testing

The repository contains automated unit, integration, and database E2E test suites:

```bash
npm test
```

### Tests Executed:
- **PHP Syntax Linting**: Verifies 100% syntax validity across all 13 PHP scripts using PHP 8.2 CLI.
- **Business Logic Units**: Verifies duration calculations, $5/hr hourly rates, minimum fees, and negative duration guards.
- **Cryptographic Compatibility**: Verifies Bcrypt interoperability between PHP's `password_hash` (`$2y$`) and Node's `bcryptjs` (`$2a$`).
- **Route & Auth Guards**: Verifies that unauthenticated requests to protected pages (`index.php`, `entry.php`) return HTTP 302 redirects to `login.php`.
- **E2E Database Operations**: Verifies real user registration, duplicate rejection, session creation, vehicle check-in, real-time slot occupancy API, booking search by verification number, feedback persistence, and clean teardown.

---

## 9. Troubleshooting

- **Database Connection Failure**: Check that `DB_HOST`, `DB_USER`, and `DB_PASSWORD` in `.env` or Vercel environment settings match your MySQL provider. If using a remote SSL provider (such as TiDB Serverless), set `DB_SSL=true`.
- **Slot Already Occupied Warning**: The system checks active bookings in `vehicle_info`. Choose another slot or select a non-overlapping time window.
- **Session Expired**: If redirected to `login.php`, re-authenticate. Session cookies are valid for 7 days.

---

## 10. License

This project is licensed under the ISC License.

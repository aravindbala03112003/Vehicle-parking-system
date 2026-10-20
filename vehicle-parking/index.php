<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Park My Spot - User Dashboard</title>
    <link rel="stylesheet" href="home.css">
    <link rel="icon" type="image/png" href="Top_bar_logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/boxicons@latest/css/boxicons.min.css">
    <style>
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 24px;
            max-width: 1200px;
            margin: 40px auto 0;
            padding: 0 24px;
        }
        .dash-card {
            background: #ffffff;
            border-radius: var(--radius-md);
            padding: 28px 24px;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-color);
            text-align: center;
            transition: var(--transition);
            display: flex;
            flex-direction: column;
            align-items: center;
            text-decoration: none;
            color: var(--text-main);
        }
        .dash-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-md);
            border-color: var(--primary);
        }
        .dash-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: rgba(243, 62, 22, 0.1);
            color: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            margin-bottom: 16px;
        }
        .dash-card h3 {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #0f172a;
        }
        .dash-card p {
            font-size: 14px;
            color: var(--text-muted);
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <header class="head1" style="min-height: 480px;">
        <video class="vd" loop muted playsinline poster="project images/home4.jpg" preload="none" id="heroVideo">
            <source src="project images/home.mp4" type="video/mp4">
        </video>
   
        <div class="main">
            <nav class="head2" id="mainNavbar">  
                <a href="index.php" class="brand-wrapper">
                    <img class="logo" src="project images/logo(1).jpeg" alt="Park My Spot Logo">
                    <img class="ln" src="project images/logo name.png" alt="Park My Spot">
                </a>
                <ul id="navMenu">
                    <li><a href="index.php" class="a">Dashboard</a></li>
                    <li><a href="slot.html" class="a">Choose Slots</a></li>
                    <li><a href="entry.php" class="a">Vehicle Entry</a></li>
                    <li><a href="otp.php" class="a">Booking Details</a></li>
                    <li><a href="feedback.php" class="a">Rate Us</a></li>
                    <li class="si"><a href="logout.php"><i class='bx bx-log-out'></i> Logout</a></li>
                </ul>
            </nav>
        </div>

        <div class="hero-content" style="padding-top: 50px;">
            <div class="hero-badge">
                <i class='bx bx-check-shield'></i> Authenticated Session
            </div>
            <h1 class="hero-title">Welcome to Your <span>Parking Portal</span></h1>
            <p class="hero-subtitle">
                Quickly book a spot, check live bay occupancy, or look up your booking confirmation.
            </p>
            <div class="hero-actions">
                <a href="entry.php" class="btn-hero-primary">
                    <i class='bx bxs-plus-circle'></i> Book New Vehicle Entry
                </a>
                <a href="slot.html" class="btn-hero-secondary">
                    <i class='bx bx-grid-alt'></i> Live 56-Slot Diagram
                </a>
            </div>
        </div>
    </header>

    <main>
        <section class="dashboard-grid">
            <a href="entry.php" class="dash-card">
                <div class="dash-icon"><i class='bx bxs-car'></i></div>
                <h3>Vehicle Entry</h3>
                <p>Register an incoming vehicle and assign an available parking spot.</p>
            </a>
            <a href="slot.html" class="dash-card">
                <div class="dash-icon"><i class='bx bx-grid-alt'></i></div>
                <h3>Slot Visualizer</h3>
                <p>Interactive 56-slot parking map with real-time occupancy indicators.</p>
            </a>
            <a href="otp.php" class="dash-card">
                <div class="dash-icon"><i class='bx bx-receipt'></i></div>
                <h3>Booking Verification</h3>
                <p>Look up confirmation receipts and print official parking tickets.</p>
            </a>
            <a href="feedback.php" class="dash-card">
                <div class="dash-icon"><i class='bx bxs-star'></i></div>
                <h3>Rate Experience</h3>
                <p>Submit your reviews and help us improve parking management.</p>
            </a>
        </section>

        <section id="about" class="about" style="margin-top: 40px;">
            <h2 class="heading">System Overview</h2>
            
            <article class="feature-card">
                <div class="card-image">
                    <img src="parking3.jpg" alt="Parking Services" loading="lazy">
                </div>
                <div class="card-content">
                    <h2><i class='bx bx-check-shield'></i> Real-Time Slot Protection</h2>
                    <p>
                        Every slot is linked to our cloud database. Once reserved, slots are locked in real-time to avoid double-booking.
                    </p>
                    <ul class="feature-list">
                        <li>Instant slot occupancy status</li>
                        <li>Automated hourly parking fee calculation ($5/hour)</li>
                        <li>Official printable confirmation tickets</li>
                        <li>Safe and encrypted cloud storage</li>
                    </ul>
                </div>
            </article>
        </section>
    </main>

    <footer class="footer">
        <div class="footer-content">
            <img class="logo2" src="project images/logo(1).jpeg" alt="Park My Spot Logo">
            <img class="logoname1" src="project images/logo name1.png" alt="Park My Spot">
            <div class="cu">
                <h2>Contact Us</h2>
                <p>WhatsApp: +91 93634 53411</p>
                <p>Call Us: 2300 390 1772</p>
                <p>Email: <a href="mailto:parkmyspot@gmail.com">parkmyspot@gmail.com</a></p>
            </div>
            <div class="icon-1">
                <a href="#" aria-label="Facebook"><i class='bx bxl-facebook-circle'></i></a>
                <a href="#" aria-label="Twitter"><i class='bx bxl-twitter'></i></a>
                <a href="#" aria-label="Instagram"><i class='bx bxl-instagram-alt'></i></a>
                <a href="#" aria-label="YouTube"><i class='bx bxl-youtube'></i></a>
            </div>
            <p style="margin-top: 15px; font-size: 13px; color: #64748b;">
                &copy; 2026 Park My Spot. All rights reserved.
            </p>
        </div>
        
        <div class="footer-content">
            <h4>Quick Actions</h4>
            <ul>
                <li><a href="entry.php">Book Vehicle Entry</a></li>
                <li><a href="slot.html">56-Slot Visualizer</a></li>
                <li><a href="otp.php">Ticket Verification</a></li>
                <li><a href="feedback.php">Rate Us</a></li>
            </ul>
        </div>
        
        <div class="footer-content">
            <h4>Support</h4>
            <ul>
                <li><a href="contactus.php">Customer Helpdesk</a></li>
                <li><a href="contactus.php">Report Incident</a></li>
            </ul>
        </div>
        
        <div class="footer-content">
            <h4>Session</h4>
            <ul>
                <li><a href="logout.php">Logout</a></li>
            </ul>
        </div>
    </footer>
</body>
</html>
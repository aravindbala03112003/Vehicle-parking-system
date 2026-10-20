<?php
session_start();
if (!isset($_SESSION["user"])) {
    header("Location: login.php");
    exit();
}

require_once "database.php";

$sdata = "";
if (isset($_POST['searchdata'])) {
    $sdata = trim($_POST['searchdata']);
} elseif (isset($_GET['searchdata'])) {
    $sdata = trim($_GET['searchdata']);
}

$records = [];
if (!empty($sdata)) {
    $searchTerm = "%" . $sdata . "%";
    $stmt = mysqli_prepare($conn, "SELECT * FROM vehicle_info WHERE ParkingNumber LIKE ? OR OwnerContactNumber LIKE ? ORDER BY ID DESC");
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "ss", $searchTerm, $searchTerm);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        while ($row = mysqli_fetch_array($res, MYSQLI_ASSOC)) {
            $records[] = $row;
        }
        mysqli_stmt_close($stmt);
    }
}
?>
<!DOCTYPE html>
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
    * {
      padding: 0;
      margin: 0;
      list-style: none;
      font-family: "Poppins", sans-serif;
      box-sizing: border-box;
    }
    body {
      background-image: url('parking1.jpg');
      background-attachment: fixed;
      background-size: cover;
      min-height: 100vh;
    }
    .head2 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
    }
    .logo {
      width: 70px;
      border-radius: 50%;
    }
    .head2 .ln {
      width: 130px;
      margin-left: 10px;
    }
    .head2 ul {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    .a {
      font-weight: 500;
      color: #fffcfc;
      text-decoration: none;
      font-size: 18px;
      padding: 8px 12px;
    }
    .si {
      background-color: #f33e16;
      border-radius: 8px;
    }
    .si a {
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      display: inline-block;
    }
    .container {
      margin: 40px auto;
      max-width: 950px;
      width: 95%;
      background: #fff;
      padding: 30px;
      border-radius: 20px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      border-bottom: 2px solid #ed5e2b;
      padding-bottom: 15px;
    }
    .header-bar h2 {
      color: #333;
      font-size: 24px;
    }
    .print-btn {
      background: #ed5e2b;
      color: #fff;
      text-decoration: none;
      padding: 8px 18px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }
    .ticket-card {
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      background: #fafafa;
    }
    .ticket-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 15px;
    }
    .ticket-item label {
      display: block;
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
    }
    .ticket-item span {
      font-size: 16px;
      color: #111;
      font-weight: 500;
    }
    .slot-badge {
      display: inline-block;
      background: #28a745;
      color: white;
      padding: 4px 12px;
      border-radius: 6px;
      font-weight: 700;
    }
    .charge-badge {
      font-size: 20px;
      color: #ed5e2b;
      font-weight: 700;
    }
    .no-record {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }
    .nav-toggle {
      display: none;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 10px;
      z-index: 1001;
    }
    .nav-toggle span {
      display: block;
      width: 26px;
      height: 3px;
      margin: 5px auto;
      background: #ffffff;
      border-radius: 2px;
      transition: all 0.3s ease;
    }
    .nav-toggle.active span:nth-child(1) {
      transform: translateY(8px) rotate(45deg);
    }
    .nav-toggle.active span:nth-child(2) {
      opacity: 0;
    }
    .nav-toggle.active span:nth-child(3) {
      transform: translateY(-8px) rotate(-45deg);
    }
    @media (max-width: 860px) {
      .nav-toggle { display: block; }
      .head2 { position: relative; }
      .head2 ul {
        display: none;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        width: 100%;
        background: rgba(15, 23, 42, 0.98);
        padding: 20px 0;
        gap: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        z-index: 1000;
      }
      .head2 ul.active {
        display: flex;
      }
    }
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
      <div>
        <a href="index.php"><img class="logo" src="images/logo(1).jpeg" alt="Logo"></a>
        <a href="index.php"><img class="ln" src="images/logo name.png" alt="Park My Spot"></a>
      </div>
      <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul>
        <li><a href="index.php" class="a">Home</a></li>
        <li><a href="entry.php" class="a">Vehicle entry</a></li>
        <li><a href="otp.php" class="a">Booking details</a></li>
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

    <?php if (count($records) > 0): ?>
      <?php foreach ($records as $r): ?>
        <div class="ticket-card">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #ddd; padding-bottom:10px;">
            <div>
              <span style="font-size:14px; color:#555;">Verification Number:</span>
              <strong style="font-size:18px; color:#ed5e2b; margin-left:6px;"><?php echo htmlspecialchars($r['ParkingNumber']); ?></strong>
            </div>
            <div>
              <span class="slot-badge"><?php echo htmlspecialchars($r['slot_number'] ?: 'Slot Assigned'); ?></span>
            </div>
          </div>
          <div class="ticket-grid">
            <div class="ticket-item">
              <label>Owner Name</label>
              <span><?php echo htmlspecialchars($r['OwnerName']); ?></span>
            </div>
            <div class="ticket-item">
              <label>Owner Contact</label>
              <span><?php echo htmlspecialchars($r['OwnerContactNumber']); ?></span>
            </div>
            <div class="ticket-item">
              <label>Vehicle Reg Number</label>
              <span><?php echo htmlspecialchars($r['RegistrationNumber']); ?></span>
            </div>
            <div class="ticket-item">
              <label>Vehicle Category</label>
              <span><?php echo htmlspecialchars($r['VehicleCategory']); ?></span>
            </div>
            <div class="ticket-item">
              <label>Company / Model</label>
              <span><?php echo htmlspecialchars($r['VehicleCompanyname']); ?></span>
            </div>
            <div class="ticket-item">
              <label>Entry Time</label>
              <span><?php echo htmlspecialchars($r['InTime']); ?></span>
            </div>
            <div class="ticket-item">
              <label>Exit Time</label>
              <span><?php echo htmlspecialchars($r['OutTime']); ?></span>
            </div>
            <div class="ticket-item">
              <label>Total Charge</label>
              <span class="charge-badge">$<?php echo htmlspecialchars($r['ParkingCharge']); ?></span>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    <?php else: ?>
      <div class="no-record">
        <h3>No booking record found for "<?php echo htmlspecialchars($sdata); ?>"</h3>
        <p style="margin: 15px 0;">Please check your 5-digit verification number or mobile number.</p>
        <a href="otp.php" style="display:inline-block; background:#ed5e2b; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none;">Try Again</a>
      </div>
    <?php endif; ?>
  </div>
  <script src="navbar.js"></script>
</body>
</html>

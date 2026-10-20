<?php
session_start();
if (!isset($_SESSION["user"])) {
    header("Location: login.php");
    exit();
}
$prefilledCode = isset($_GET['code']) ? trim($_GET['code']) : '';
?>
<!DOCTYPE html>
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
      <a href="index.php"><img class="logo" src="logo(1).jpeg" alt="Logo"></a>
      <a href="index.php"><img class="ln" src="logo name.png" alt="Park My Spot"></a>
      <ul>
        <li><a href="index.php" class="a">Home<span></span></a></li>
        <li><a href="slot.html" class="a">Choose your slots<span></span></a></li>
        <li><a href="entry.php" class="a">Vehicle entry<span></span></a></li>
        <li><a href="otp.php" class="a">Booking details<span></span></a></li>
        <li><a href="feedback.php" class="a">Rate us<span></span></a></li>
        <li class="si"><a href="logout.php">Logout</a></li>
      </ul>
    </div>
  </div>

  <section class="container">
    <header>Booking Verification</header>
    <form action="booking.php" method="post" class="form">
      <div class="input-box">
        <label for="searchdata">Verification Number or Contact</label>
        <input type="text" id="searchdata" class="form-control" name="searchdata" placeholder="Enter 5-digit verification code or phone" value="<?php echo htmlspecialchars($prefilledCode); ?>" required>
      </div>
      <center><button type="submit" name="submit" class="btn btn-success mt-3" style="background:#ed5e2b;border:none;padding:10px 25px;">Check Status</button></center>
    </form>
  </section>
</body>
</html>
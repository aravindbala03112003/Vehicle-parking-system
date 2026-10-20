<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="icon" type="image/png" href="Top_bar_logo.png">
	<title>Park My Spot - Rate Us</title>
	<link href='https://unpkg.com/boxicons@2.1.1/css/boxicons.min.css' rel='stylesheet'>
	<link rel="stylesheet" href="feedback.css">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap" rel="stylesheet">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
</head>
<body>
    <div class="head1">
		<div class="head2">  
			<a href="index.php"><img class="logo" src="logo(1).jpeg" alt="Logo"></a>
			<a href="index.php"><img class="ln" src="logo name.png" alt="Park My Spot"></a>
			<button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
				<span></span>
				<span></span>
				<span></span>
			</button>
			<ul>
				<li><a href="index.php" class="a">Home<span></span></a></li>
				<li><a href="entry.php" class="a">Vehicle entry<span></span></a></li>
				<li><a href="otp.php" class="a">Booking details<span></span></a></li>
				<li><a href="feedback.php" class="a">Rate us<span></span></a></li>
				<?php if (isset($_SESSION["user"])): ?>
				<li class="si"><a href="logout.php">Logout</a></li>
				<?php else: ?>
				<li class="si"><a href="login.php">Sign in</a></li>
				<?php endif; ?>
			</ul>
		</div>
	</div>

	<div class="wrapper">
		<h1>Feedback</h1>
		<h3>Please provide your feedback in the form below.</h3>
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
				<button type="submit" name="submit" class="btn submit">Submit</button>
				<button type="reset" class="btn cancel">Cancel</button>
			</div>
		</form>
	</div>

	<script src="feedback.js"></script>
	<script src="navbar.js"></script>
</body>
</html>
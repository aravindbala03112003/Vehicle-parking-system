<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Park My Spot - Contact Us</title>
	<link rel="icon" type="image/png" href="Top_bar_logo.png">
	<link href="contactus.css" rel="stylesheet" type="text/css">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;900&display=swap" rel="stylesheet">
	<link rel="stylesheet" href="https://unpkg.com/boxicons@latest/css/boxicons.min.css">
</head>
<body>
	<nav class="head2" id="mainNavbar">  
		<a href="/" class="brand-wrapper">
			<img class="logo" src="project images/logo(1).jpeg" alt="Park My Spot Logo">
			<img class="ln" src="project images/logo name.png" alt="Park My Spot">
		</a>
		<button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
			<span></span>
			<span></span>
			<span></span>
		</button>
		<ul id="navMenu">
			<li><a href="/" class="a">Home</a></li>
			<li><a href="contactus.php" class="a">Contact Us</a></li>
			<li class="si"><a href="login.php"><i class='bx bx-user'></i> Sign in</a></li>
		</ul>
	</nav>

	<div class="inner-container">
		<div class="tile1">
			<div class="tile1-heading">Get in touch</div>
			<div class="form-row">We are here for you! How can we help?</div>
			<form action="contactusconnection.php" method="post">
				<div class="form-row">
					<input type="text" class="form-field" name="name" placeholder="Enter your name" required>
				</div>
				<div class="form-row">
					<input type="email" name="email" class="form-field" placeholder="Enter your email address" required>
				</div>
				<div class="form-row">
					<textarea class="form-field" name="message" placeholder="Go ahead we are listening..." required></textarea>
				</div>
				<div class="form-row">
					<button type="submit" name="submit" class="form-field btn" value="Submit">Submit Message</button>
				</div>
			</form>
		</div>
		<div class="tile2">
			<div class="tile2-image">
				<img src="contact.jpg" width="70" alt="Contact Icon">
			</div>
			<div>
				<div class="form-row">
					<img src="phone.png" class="contact-image" alt="Phone"><span>+91 98754 56780</span>
				</div>
				<div class="form-row">
					<img src="mail.png" class="contact-image" alt="Email"><span>parkmyspot@gmail.com</span>
				</div>
			</div>
		</div>
	</div>
	<script src="navbar.js"></script>
</body>
</html>

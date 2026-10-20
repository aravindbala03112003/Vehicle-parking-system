<?php
session_start();
if (!isset($_SESSION["user"])) {
   header("Location: login.php");
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Park My Spot</title>
    <link rel="stylesheet" href="home.css">
    <link rel="icon" type="image/png" href="Top_bar_logo.png" >
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet"href="https://unpkg.com/boxicons@latest/css/boxicons.min.css">

</head>
<body>
    

<div class="head1">
        <video class="vd" loop  muted autoplay="autoplay">
            <source src="project images/home.mp4" type="video/mp4">
         </video>
   
     <div class="main">
      <div class="head2">  

       <a href=""><img class="logo" src="project images/logo(1).jpeg"></a>
       <a href=""><img class="ln"src="project images/logo name.png" alt=""></a>
        <ul>
            <li> <a href="home.html" class="a">Home<span></span></a></li>
            <li> <a href="slot.html" class="a">Choose your slots<span></span></a></li>
            
            <li><a href="entry.php" class="a">Vehicle entry<span></span></a></li>
            <li><a href="otp.php" class="a">Booking details<span></span></a></li>
            <li><a href="feedback.php" class="a">Rate Us<span></span></a></li>

            <li class="si"><a href="logout.php">Logout</a></li>
        </ul>
        </div>
    </div>
    </div>


    <section id="about" class="about container">

<h1 class="heading">About us</h1>

<div class="row align-items-center">

  <div class="col-md-6 image">
    <img src="parking3.jpg"width="700px"   alt="">
  </div>

  <div class="col-md-6 info">
    <h2>Features:</h2>
    <p> 1.	24/7 video surveillance<br>
        2.	Reserve and secure your parking spot ahead of tie to avoid <br>last-minute stress<br>
        3.	Pay for parking effortlessly with contact less payment options<br>
        4.	24/7 customer support<br>
        5.	Instantly check for available parking spaces in your desired location<br>
        </p>
    
  </div>

</div>

<div class="row align-items-center">

  

  <div class="col-md-6 info1">
    <h2>Why choose us?</h2>
    <p> Comfortable parking experience.Brokerage free.Genuine owners.<br>
      Ensured security of your vechicle.Available for residents and visitors.<br>
      Survellience parking.Available on app and website.<br>
      
        </p>
        <div class="col-md-6 image1">
          <img src="parking2.jpg"   alt="">
        </div>
  </div>

</div>


<div class="row align-items-center">

  <div class="col-md-6 image2">
    <img src="parking4.jpg"width="700px"   alt="">
  </div>

  <div class="col-md-6 info2">
    <h2>About:</h2>
    <p> This website is created to help customers to book a parking space online.<br>It also allows the customers to view the parking slots for the vehicle.
        
      <br>
        </p>
    
  </div>

</div>

</section>

<!----------------------------Footer------------------------------------->
<footer class="footer">
    <div class="footer-content">
     <img  class="logo2" src="project images/logo(1).jpeg">
     <img class="logoname1" src="project images/logo name1.png" alt="">
     <div class="cu"><h2>Contact Us</h2>
      WhatsApp us: 9363453411<br>
      Call us: 2300 390 1772<br>
      <p>Email ID: <a href="#"> parkmyspot@gmail.com</a></p>
      </div>
     <div class="icon-1">
     <a href="#"><i class='bx bxl-facebook-circle' ></i></a>
     <a href="#"><i class='bx bxl-twitter' ></i></a>
     <a href="#"><i class='bx bxl-instagram-alt' ></i></a>
     <a href="#"><i class='bx bxl-youtube' ></i></a>  <br>

     <p> © Copyright  2024 Park my spot - All rights reserved. </p>
    
   
     
    
     </div>
     </div>
    
    
    <div class="footer-content">
      <h4 >All Categories</h4>
      <a href="#" > <li>Parking Near Me</li></a>
     <a href="#"> <li>Browse All Cities</li></a>
      <a href="#"> <li>Parking Solutions</li></a>
     <a href="#"> <li>News</li></a>
     <a href="#"> <li>Policies</li></a>
     <a href="#"> <li>Terms</li></a>
      
     
    
    
    </div>
    
    <div class="footer-content">
      <a href="#"><h4 >Help</h4></a>
      <a href="#"><li>Payments</li></a>
      <a href="#"><li>Cancellation</li></a>
       <a href="#"><li>FAQ</li></a>
       <a href="#"><li>Report</li></a>
    </div>
    
    <div class="footer-content">
      <a href="#"> <h4 >Resources</h4></a>
      <a href="#">  <li>Sitemap</li></a>
     <a href="#"> <li>Privacy Policy</li></a>
     <a href="#"> <li>Terms Of Service</li></a>
      <a href="#"> <li>Consumer Privacy</li></a>
    <a href="#"> <li>Update</li></a>
    
    </div>
    
  </footer>
  <script src="js/jquery-1.11.1.min.js"></script>
<script src="js/bootstrap.min.js"></script>
    
</body>
</html>

    
</body>
</html>
<?php
session_start();
if (isset($_SESSION["user"])) {
   header("Location: index.php");
   exit();
}

$errors = array();
$successMessage = "";

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["submit"])) {
   $fullName = isset($_POST["fullname"]) ? trim($_POST["fullname"]) : "";
   $email = isset($_POST["email"]) ? trim($_POST["email"]) : "";
   $password = isset($_POST["password"]) ? $_POST["password"] : "";
   $passwordRepeat = isset($_POST["repeat_password"]) ? $_POST["repeat_password"] : "";
   
   if (empty($fullName) || empty($email) || empty($password) || empty($passwordRepeat)) {
       array_push($errors, "All fields are required.");
   }
   if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
       array_push($errors, "Email is not valid.");
   }
   if (strlen($password) < 8) {
       array_push($errors, "Password must be at least 8 characters long.");
   }
   if ($password !== $passwordRepeat) {
       array_push($errors, "Password confirmation does not match.");
   }

   if (count($errors) === 0) {
       require_once "database.php";

       // Prepared statement to check duplicate email
       $checkStmt = mysqli_prepare($conn, "SELECT id FROM users WHERE email = ?");
       if ($checkStmt) {
           mysqli_stmt_bind_param($checkStmt, "s", $email);
           mysqli_stmt_execute($checkStmt);
           mysqli_stmt_store_result($checkStmt);
           if (mysqli_stmt_num_rows($checkStmt) > 0) {
               array_push($errors, "An account with this email already exists!");
           }
           mysqli_stmt_close($checkStmt);
       }

       if (count($errors) === 0) {
           $passwordHash = password_hash($password, PASSWORD_DEFAULT);
           $insertStmt = mysqli_prepare($conn, "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)");
           if ($insertStmt) {
               mysqli_stmt_bind_param($insertStmt, "sss", $fullName, $email, $passwordHash);
               if (mysqli_stmt_execute($insertStmt)) {
                   $successMessage = "Your account has been registered successfully! You can now log in.";
               } else {
                   array_push($errors, "Registration failed. Please try again.");
               }
               mysqli_stmt_close($insertStmt);
           } else {
               array_push($errors, "Database error preparing registration statement.");
           }
       }
   }
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Park My Spot - Registration</title>
    <link rel="icon" type="image/png" href="Top_bar_logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
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
        <a href="home.html"><img class="logo" src="logo(1).jpeg" alt="Logo"></a>
        <a href="home.html"><img class="ln" src="logo name.png" alt="Park My Spot"></a>
        <ul>
          <li><a href="home.html" class="a">Home<span></span></a></li>
          <li><a href="contactus.php" class="a">Contact Us<span></span></a></li>
          <li class="si"><a href="login.php">Sign in</a></li>
        </ul>
      </div>
    </div>

    <section class="container">
      <header>Register</header>
      <?php if (!empty($successMessage)): ?>
        <div class="alert alert-success">
          <?php echo htmlspecialchars($successMessage); ?>
          <br><a href="login.php" style="font-weight: 600; text-decoration: underline;">Click here to Login</a>
        </div>
      <?php endif; ?>

      <?php if (count($errors) > 0): ?>
        <div class="alert alert-danger">
          <?php foreach ($errors as $error): ?>
            <div>• <?php echo htmlspecialchars($error); ?></div>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>

      <form action="registration.php" method="post" class="form">
        <div class="input-box">
          <label for="fullname">User Name</label>
          <input type="text" id="fullname" class="form-control" name="fullname" placeholder="Enter User Name:" required value="<?php echo isset($_POST['fullname']) ? htmlspecialchars($_POST['fullname']) : ''; ?>">
        </div>
        <div class="input-box">
          <label for="email">Email Address</label>
          <input type="email" id="email" class="form-control" name="email" placeholder="Enter Email:" required value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>">
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
</html>
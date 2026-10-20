<?php
session_start();
if (isset($_SESSION["user"])) {
   header("Location: index.php");
   exit();
}

$errorMessage = "";
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["login"])) {
    $email = isset($_POST["email"]) ? trim($_POST["email"]) : "";
    $password = isset($_POST["password"]) ? $_POST["password"] : "";

    if (empty($email) || empty($password)) {
        $errorMessage = "Please enter both email and password.";
    } else {
        require_once "database.php";
        $stmt = mysqli_prepare($conn, "SELECT id, full_name, email, password FROM users WHERE email = ?");
        if ($stmt) {
            mysqli_stmt_bind_param($stmt, "s", $email);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $user = mysqli_fetch_array($result, MYSQLI_ASSOC);
            mysqli_stmt_close($stmt);

            if ($user && password_verify($password, $user["password"])) {
                $_SESSION["user"] = !empty($user["full_name"]) ? $user["full_name"] : "yes";
                $_SESSION["email"] = $user["email"];
                $_SESSION["user_id"] = $user["id"];
                header("Location: index.php");
                exit();
            } else {
                $errorMessage = "Invalid email or password.";
            }
        } else {
            $errorMessage = "A database error occurred. Please try again later.";
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
    <title>Park My Spot - Login</title>
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
      }
      .alert-danger {
        background-color: #fde8e8;
        color: #9b1c1c;
        border: 1px solid #f8b4b4;
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
      <header>Login</header>
      <?php if (!empty($errorMessage)): ?>
        <div class="alert alert-danger"><?php echo htmlspecialchars($errorMessage); ?></div>
      <?php endif; ?>
      <form action="login.php" method="post" class="form">
        <div class="input-box">
          <label for="email">Email Address</label>
          <input type="email" id="email" placeholder="Enter Email:" name="email" class="form-control" required value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>">
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
</html>
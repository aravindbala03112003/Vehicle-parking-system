<?php
require_once "database.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name    = isset($_POST['name']) ? trim($_POST['name']) : '';
    $email   = isset($_POST['email']) ? trim($_POST['email']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';

    if (empty($name) || empty($email) || empty($message)) {
        echo "<script type='text/javascript'>alert('Please fill in all required fields.');</script>";
        echo "<script type='text/javascript'> window.location.href = 'contactus.php'; </script>";
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "<script type='text/javascript'>alert('Please enter a valid email address.');</script>";
        echo "<script type='text/javascript'> window.location.href = 'contactus.php'; </script>";
        exit();
    }

    $stmt = mysqli_prepare($conn, "INSERT INTO contactus (name, email, message) VALUES (?, ?, ?)");
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "sss", $name, $email, $message);
        $result = mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);

        if ($result) {
            echo "<script type='text/javascript'>alert('Message sent successfully! We will get back to you soon.');</script>";
            echo "<script type='text/javascript'> window.location.href = 'contactus.php'; </script>";
            exit();
        }
    }

    echo "<script type='text/javascript'>alert('Unable to send message. Please try again.');</script>";
    echo "<script type='text/javascript'> window.location.href = 'contactus.php'; </script>";
    exit();
} else {
    header("Location: contactus.php");
    exit();
}
?>
<?php
require_once "database.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rating  = isset($_POST['rating']) ? trim($_POST['rating']) : '';
    $opinion = isset($_POST['opinion']) ? trim($_POST['opinion']) : '';

    if (empty($rating)) {
        $rating = '5'; // default if omitted
    }

    $stmt = mysqli_prepare($conn, "INSERT INTO feedbacktable (rating, opinion) VALUES (?, ?)");
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "ss", $rating, $opinion);
        $result = mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);

        if ($result) {
            echo "<script type='text/javascript'>alert('Your feedback was sent successfully! Thank you for your feedback.');</script>";
            echo "<script type='text/javascript'> window.location.href = 'feedback.php'; </script>";
            exit();
        }
    }

    echo "<script type='text/javascript'>alert('Unable to save feedback. Please try again.');</script>";
    echo "<script type='text/javascript'> window.location.href = 'feedback.php'; </script>";
    exit();
} else {
    header("Location: feedback.php");
    exit();
}
?>

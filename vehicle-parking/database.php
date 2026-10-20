<?php
// Centralized, Secure Database Connection for Park My Spot
// Supports both Environment Variables (Production) and Localhost XAMPP Fallbacks

$hostName   = getenv('DB_HOST')     ?: 'localhost';
$dbPort     = (int)(getenv('DB_PORT') ?: 3306);
$dbUser     = getenv('DB_USER')     ?: 'root';
$dbPassword = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : '';
$dbName     = getenv('DB_NAME')     ?: 'vehicle_parking_db';
$dbSSL      = getenv('DB_SSL') === 'true';

// Initialize connection
$conn = mysqli_init();
if (!$conn) {
    error_log("mysqli_init failed");
    die("Database initialization failed. Please contact the administrator.");
}

// Configure SSL if required by cloud MySQL (e.g. TiDB, Aiven, Azure, AWS)
if ($dbSSL) {
    mysqli_ssl_set($conn, NULL, NULL, NULL, NULL, NULL);
}

// Establish connection safely with timeout
mysqli_options($conn, MYSQLI_OPT_CONNECT_TIMEOUT, 5);
$connected = @mysqli_real_connect($conn, $hostName, $dbUser, $dbPassword, $dbName, $dbPort, NULL, $dbSSL ? MYSQLI_CLIENT_SSL : 0);

if (!$connected) {
    // If unified database does not exist locally yet, fallback check for legacy local names
    if ($hostName === 'localhost' && $dbUser === 'root') {
        $connected = @mysqli_real_connect($conn, $hostName, $dbUser, $dbPassword, 'vehicle-parking-db', $dbPort);
    }
    
    if (!$connected) {
        error_log("Database connection error: " . mysqli_connect_error());
        die("Unable to connect to database. Please check configuration.");
    }
}

// Set modern charset
mysqli_set_charset($conn, "utf8mb4");

// Alias for legacy scripts expecting $con
$con = $conn;

/**
 * Helper function for executing prepared statements safely
 */
function executePreparedStatement($connection, $sql, $types = "", $params = []) {
    $stmt = mysqli_prepare($connection, $sql);
    if (!$stmt) {
        error_log("Prepare error: " . mysqli_error($connection));
        return false;
    }
    if (!empty($params) && !empty($types)) {
        mysqli_stmt_bind_param($stmt, $types, ...$params);
    }
    if (!mysqli_stmt_execute($stmt)) {
        error_log("Execute error: " . mysqli_stmt_error($stmt));
        mysqli_stmt_close($stmt);
        return false;
    }
    $result = mysqli_stmt_get_result($stmt);
    mysqli_stmt_close($stmt);
    return $result;
}
?>
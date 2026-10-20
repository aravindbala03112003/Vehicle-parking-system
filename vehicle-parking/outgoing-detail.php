<?php
session_start();
if (!isset($_SESSION["user"])) {
    header("Location: login.php");
    exit();
}

require_once "database.php";

$msg = "";
$cid = isset($_GET['updateid']) ? (int)$_GET['updateid'] : 0;

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['submit-in'])) {
    $remark = isset($_POST['remark']) ? trim($_POST['remark']) : '';
    $status = isset($_POST['status']) ? trim($_POST['status']) : 'Out';
    $parkingcharge = isset($_POST['parkingcharge']) ? trim($_POST['parkingcharge']) : '0';

    $stmt = mysqli_prepare($conn, "UPDATE vehicle_info SET Remark = ?, Status = ?, ParkingCharge = ?, OutTime = CURRENT_TIMESTAMP WHERE ID = ?");
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "sssi", $remark, $status, $parkingcharge, $cid);
        if (mysqli_stmt_execute($stmt)) {
            $msg = "Vehicle status and remarks updated successfully.";
        } else {
            $msg = "Failed to update record.";
        }
        mysqli_stmt_close($stmt);
    }
}

// Fetch record
$vehicle = null;
if ($cid > 0) {
    $stmt = mysqli_prepare($conn, "SELECT * FROM vehicle_info WHERE ID = ?");
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "i", $cid);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        $vehicle = mysqli_fetch_assoc($res);
        mysqli_stmt_close($stmt);
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Park My Spot - Manage Outgoing Vehicle</title>
  <link rel="icon" type="image/png" href="Top_bar_logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css">
  <style>
    * { font-family: "Poppins", sans-serif; }
    body { background: #f4f6f9; min-height: 100vh; padding: 20px; }
    .card { border-radius: 16px; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 30px auto; max-width: 750px; }
    .card-header { background: #ed5e2b; color: white; border-radius: 16px 16px 0 0 !important; font-weight: 600; font-size: 18px; padding: 15px 25px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { font-weight: 500; font-size: 14px; margin-bottom: 5px; }
    .btn-submit { background: #ed5e2b; color: white; border: none; padding: 10px 25px; border-radius: 8px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <span>Vehicle Exit & Billing Management</span>
      <a href="index.php" class="btn btn-sm btn-light">Back Home</a>
    </div>
    <div class="card-body p-4">
      <?php if (!empty($msg)): ?>
        <div class="alert alert-info"><?php echo htmlspecialchars($msg); ?></div>
      <?php endif; ?>

      <?php if ($vehicle): ?>
        <form method="POST">
          <div class="row">
            <div class="col-md-6 form-group">
              <label>Vehicle Registration Number</label>
              <input type="text" class="form-control" value="<?php echo htmlspecialchars($vehicle['RegistrationNumber']); ?>" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Company / Model</label>
              <input type="text" class="form-control" value="<?php echo htmlspecialchars($vehicle['VehicleCompanyname']); ?>" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Vehicle Category</label>
              <input type="text" class="form-control" value="<?php echo htmlspecialchars($vehicle['VehicleCategory']); ?>" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Parking Verification Number</label>
              <input type="text" class="form-control" value="<?php echo htmlspecialchars($vehicle['ParkingNumber']); ?>" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Vehicle IN Time</label>
              <input type="text" class="form-control" value="<?php echo htmlspecialchars($vehicle['InTime']); ?>" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Vehicle OUT Time</label>
              <input type="text" class="form-control" value="<?php echo htmlspecialchars($vehicle['OutTime'] ?: 'In Progress'); ?>" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Owner Name</label>
              <input type="text" class="form-control" value="<?php echo htmlspecialchars($vehicle['OwnerName']); ?>" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Owner Contact Number</label>
              <input type="text" class="form-control" value="<?php echo htmlspecialchars($vehicle['OwnerContactNumber']); ?>" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Assigned Slot</label>
              <input type="text" class="form-control" value="<?php echo htmlspecialchars($vehicle['slot_number']); ?>" readonly>
            </div>
            <div class="col-md-6 form-group">
              <label>Total Charge ($)</label>
              <input type="number" step="0.01" class="form-control" name="parkingcharge" value="<?php echo htmlspecialchars($vehicle['ParkingCharge']); ?>">
            </div>
            <div class="col-md-12 form-group">
              <label>Status</label>
              <select name="status" class="form-select">
                <option value="In" <?php if ($vehicle['Status'] !== 'Out') echo 'selected'; ?>>In (Active)</option>
                <option value="Out" <?php if ($vehicle['Status'] === 'Out') echo 'selected'; ?>>Out (Completed)</option>
              </select>
            </div>
            <div class="col-md-12 form-group">
              <label>Remarks</label>
              <textarea class="form-control" name="remark" rows="3"><?php echo htmlspecialchars($vehicle['Remark']); ?></textarea>
            </div>
          </div>
          <button type="submit" name="submit-in" class="btn-submit mt-3">Update Vehicle Record</button>
        </form>
      <?php else: ?>
        <p class="text-muted">No vehicle selected or invalid update ID. <a href="index.php">Return to home</a>.</p>
      <?php endif; ?>
    </div>
  </div>
</body>
</html>
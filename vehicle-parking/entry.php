<?php
session_start();
if (!isset($_SESSION["user"])) {
    header("Location: login.php");
    exit();
}

require_once "database.php";

$alertScript = "";
$parkingnumber = "";

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['submit-vehicle'])) {
    $parkingnumber = (string)mt_rand(10000, 99999);
    $catename      = isset($_POST['catename']) ? trim($_POST['catename']) : '';
    $vehcomp       = isset($_POST['vehcomp']) ? trim($_POST['vehcomp']) : '';
    $vehreno       = isset($_POST['vehreno']) ? trim($_POST['vehreno']) : '';
    $ownername     = isset($_POST['ownername']) ? trim($_POST['ownername']) : '';
    $ownercontno   = isset($_POST['ownercontno']) ? trim($_POST['ownercontno']) : '';
    $enteringtime  = isset($_POST['enteringtime']) ? trim($_POST['enteringtime']) : '';
    $outtime       = isset($_POST['outtime']) ? trim($_POST['outtime']) : '';
    $price         = isset($_POST['price']) ? trim($_POST['price']) : '0';
    $slot          = isset($_POST['slot']) ? trim($_POST['slot']) : '';

    // Check if slot is already occupied
    $slotConflict = false;
    if (!empty($slot)) {
        $checkSlotStmt = mysqli_prepare($conn, "SELECT ID FROM vehicle_info WHERE slot_number = ? AND (Status != 'Out' OR Status IS NULL OR Status = '') AND InTime <= ? AND OutTime >= ?");
        if ($checkSlotStmt) {
            mysqli_stmt_bind_param($checkSlotStmt, "sss", $slot, $outtime, $enteringtime);
            mysqli_stmt_execute($checkSlotStmt);
            mysqli_stmt_store_result($checkSlotStmt);
            if (mysqli_stmt_num_rows($checkSlotStmt) > 0) {
                $slotConflict = true;
            }
            mysqli_stmt_close($checkSlotStmt);
        }
    }

    if ($slotConflict) {
        $alertScript = "Swal.fire({ title: 'Slot Unavailable', text: 'Slot $slot is already booked for this timeframe. Please choose another slot.', icon: 'error' });";
    } else {
        $stmt = mysqli_prepare($conn, "INSERT INTO vehicle_info (ParkingNumber, VehicleCategory, VehicleCompanyname, RegistrationNumber, OwnerName, OwnerContactNumber, InTime, OutTime, ParkingCharge, slot_number, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'In')");
        if ($stmt) {
            mysqli_stmt_bind_param($stmt, "ssssssssss", $parkingnumber, $catename, $vehcomp, $vehreno, $ownername, $ownercontno, $enteringtime, $outtime, $price, $slot);
            if (mysqli_stmt_execute($stmt)) {
                $alertScript = "
                    Swal.fire({
                        title: 'Slot Booked Successfully!',
                        html: 'Your verification number is <b>" . htmlspecialchars($parkingnumber) . "</b><br><small>Redirecting to booking details...</small>',
                        icon: 'success',
                        timer: 4000,
                        showConfirmButton: false
                    }).then(function() {
                        window.location.href = 'otp.php?code=" . urlencode($parkingnumber) . "';
                    });
                ";
            } else {
                $alertScript = "Swal.fire({ title: 'Error', text: 'Database error while saving vehicle entry.', icon: 'error' });";
            }
            mysqli_stmt_close($stmt);
        }
    }
}

// Fetch currently occupied slots for real-time display
$occupiedSlots = [];
$slotRes = mysqli_query($conn, "SELECT slot_number FROM vehicle_info WHERE (Status != 'Out' OR Status IS NULL OR Status = '') AND slot_number != ''");
if ($slotRes) {
    while ($row = mysqli_fetch_assoc($slotRes)) {
        $occupiedSlots[] = $row['slot_number'];
    }
}
$occupiedJson = json_encode(array_values(array_unique($occupiedSlots)));
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Park My Spot - Vehicle Entry</title>
    <link rel="icon" type="image/png" href="Top_bar_logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.5/dist/sweetalert2.min.css">
    <link rel="stylesheet" href="vehicle-entry.css">
    <link rel="stylesheet" href="booking.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>
      .slots td.box[data-occupied="true"] {
        background-color: #dc3545 !important;
        color: #fff !important;
        cursor: not-allowed !important;
      }
    </style>
  </head>
  <body>
    <div class="head1">
      <div class="head2">  
        <a href="index.php"><img class="logo" src="images/logo(1).jpeg" alt="Logo"></a>
        <a href="index.php"><img class="ln" src="images/logo name.png" alt="Park My Spot"></a>
        <ul>
          <li><a href="index.php" class="a">Home<span></span></a></li>
          <li><a href="slot.html" class="a">Choose your slots<span></span></a></li>
          <li><a href="entry.php" class="a">Vehicle entry<span></span></a></li>
          <li><a href="otp.php" class="a">Booking details<span></span></a></li>
          <li><a href="feedback.php" class="a">Rate Us<span></span></a></li>
          <li class="si"><a href="logout.php">Logout</a></li>
        </ul>
      </div>
    </div>

    <section class="container">
      <header>Vehicle Entry</header>
      <form method="POST" action="entry.php" class="form">
        <div class="input-box">
          <label for="vehreno">Vehicle Number</label>
          <input type="text" class="form-control" placeholder="LOL-1869" id="vehreno" name="vehreno" required>
        </div>

        <div class="column">
          <div class="input-box">
            <label for="vehcomp">Vehicle's Company Name</label>
            <input type="text" class="form-control" placeholder="Tesla" id="vehcomp" name="vehcomp" required>
          </div>

          <div class="input-box">
            <label for="catename">Vehicle Category</label>
            <select class="select-box" name="catename" id="catename" required>
              <option value="">Select Category</option>
              <option value="Four Wheeler">Four Wheeler</option>
              <option value="Two Wheeler">Two Wheeler</option>
              <option value="Three Wheeler">Three Wheeler</option>
            </select>
          </div>
        </div>

        <div class="column">
          <div class="input-box">
            <label for="ownername">Owner's Full Name</label>
            <input type="text" class="form-control" placeholder="Enter Here.." id="ownername" name="ownername" required>
          </div>

          <div class="input-box">
            <label for="ownercontno">Owner's Contact</label>
            <input type="text" class="form-control" placeholder="10-digit number" maxlength="10" pattern="[0-9]{10}" id="ownercontno" name="ownercontno" required>
          </div>
        </div>

        <div class="column">
          <div class="input-box">
            <label for="entryTime">Entry Time</label>
            <input type="datetime-local" id="entryTime" class="form-control" onchange="calculateParkingFee()" name="enteringtime" required>
          </div>

          <div class="input-box" id="booking-results">
            <label for="slotNumber">Choose your slot</label>
            <input placeholder="Click here to choose" id="slotNumber" name="slot" readonly style="cursor: pointer;" data-bs-toggle="modal" data-bs-target="#addModal" required />
          </div>
        </div>

        <div class="column">
          <div class="input-box">
            <label for="dateTime">Exit Time</label>
            <input type="datetime-local" id="dateTime" onchange="calculateParkingFee()" class="form-control" name="outtime" required>
          </div>

          <div class="input-box">
            <label for="parkingFee">Total Charge ($5/hr)</label>
            <input type="number" step="0.01" class="form-control" id="parkingFee" name="price" readonly required>
          </div>
        </div>

        <div class="column">
          <button type="submit" id="myButton" class="form btn btn-primary" name="submit-vehicle">Submit</button>
          <button type="reset" class="form btn btn-secondary">Reset</button>
        </div> 
      </form>
    </section>

    <!-- Slot Selection Modal -->
    <div class="modal fade" id="addModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Select an Available Parking Slot</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p><small><span style="display:inline-block;width:15px;height:15px;background:#28a745;vertical-align:middle;margin-right:5px;"></span>Green = Selected | <span style="display:inline-block;width:15px;height:15px;background:#dc3545;vertical-align:middle;margin-right:5px;"></span>Red = Occupied | White = Available</small></p>
            <table id="seatsDiagram" class="slots">
              <tr>
                <?php for ($i = 1; $i <= 10; $i++): ?>
                  <td class="box" id="slot<?php echo $i; ?>" onclick="toggleSlot('slot<?php echo $i; ?>')" data-name="<?php echo $i; ?>"><?php echo $i; ?></td>
                <?php endfor; ?>
              </tr>
              <tr>
                <?php for ($i = 11; $i <= 20; $i++): ?>
                  <td class="box" id="slot<?php echo $i; ?>" onclick="toggleSlot('slot<?php echo $i; ?>')" data-name="<?php echo $i; ?>"><?php echo $i; ?></td>
                <?php endfor; ?>
              </tr>
              <tr>
                <td colspan="10" class="space" style="text-align:center;color:#888;">--- LANE A ---</td>
              </tr>
              <tr>
                <?php for ($i = 21; $i <= 29; $i++): ?>
                  <td class="box" id="slot<?php echo $i; ?>" onclick="toggleSlot('slot<?php echo $i; ?>')" data-name="<?php echo $i; ?>"><?php echo $i; ?></td>
                <?php endfor; ?>
                <td class="space">&nbsp;</td>
              </tr>
              <tr>
                <?php for ($i = 30; $i <= 38; $i++): ?>
                  <td class="box" id="slot<?php echo $i; ?>" onclick="toggleSlot('slot<?php echo $i; ?>')" data-name="<?php echo $i; ?>"><?php echo $i; ?></td>
                <?php endfor; ?>
                <td class="space">&nbsp;</td>
              </tr>
              <tr>
                <td colspan="10" class="space" style="text-align:center;color:#888;">--- LANE B ---</td>
              </tr>
              <tr>
                <?php for ($i = 39; $i <= 47; $i++): ?>
                  <td class="box" id="slot<?php echo $i; ?>" onclick="toggleSlot('slot<?php echo $i; ?>')" data-name="<?php echo $i; ?>"><?php echo $i; ?></td>
                <?php endfor; ?>
                <td class="space">&nbsp;</td>
              </tr>
              <tr>
                <?php for ($i = 48; $i <= 56; $i++): ?>
                  <td class="box" id="slot<?php echo $i; ?>" onclick="toggleSlot('slot<?php echo $i; ?>')" data-name="<?php echo $i; ?>"><?php echo $i; ?></td>
                <?php endfor; ?>
                <td class="space">&nbsp;</td>
              </tr>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Confirm Selection</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bootstrap Bundle JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.bundle.min.js"></script>
    <script>
      var occupiedSlots = <?php echo $occupiedJson; ?>;

      function initSlots() {
        occupiedSlots.forEach(function(slotId) {
          var el = document.getElementById(slotId);
          if (el) {
            el.setAttribute('data-occupied', 'true');
          }
        });
      }

      function toggleSlot(slotId) {
        var slot = document.getElementById(slotId);
        if (!slot) return;
        if (slot.getAttribute('data-occupied') === 'true') {
          Swal.fire({ text: 'This slot is already occupied!', icon: 'warning' });
          return;
        }

        // Clear previously selected slot
        document.querySelectorAll('.slots .box').forEach(function(b) {
          if (b.getAttribute('data-occupied') !== 'true') {
            b.style.backgroundColor = '';
            b.style.color = '';
          }
        });

        slot.style.backgroundColor = '#28a745';
        slot.style.color = '#ffffff';
        document.getElementById('slotNumber').value = slotId;
      }

      function calculateParkingFee() {
        var entryTime = document.getElementById("entryTime").value;
        var exitTime = document.getElementById("dateTime").value;
        if (!entryTime || !exitTime) return;

        var entryDate = new Date(entryTime);
        var exitDate = new Date(exitTime);

        if (exitDate <= entryDate) {
          Swal.fire({ text: "Exit time must be later than entry time.", icon: "warning" });
          document.getElementById("parkingFee").value = "0.00";
          return;
        }

        var durationMs = exitDate - entryDate;
        var durationHours = durationMs / (1000 * 60 * 60);
        var hourlyRate = 5.0; // $5 per hour business rule
        var fee = Math.max(hourlyRate, durationHours * hourlyRate);
        document.getElementById("parkingFee").value = fee.toFixed(2);
      }

      window.addEventListener('DOMContentLoaded', function() {
        initSlots();
        <?php if (!empty($alertScript)) echo $alertScript; ?>
      });
    </script>
  </body>
</html>

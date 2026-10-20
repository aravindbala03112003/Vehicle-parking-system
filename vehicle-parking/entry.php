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
    $enteringtime  = !empty($_POST['enteringtime']) ? trim($_POST['enteringtime']) : date('Y-m-d H:i:s');
    $outtime       = !empty($_POST['outtime']) ? trim($_POST['outtime']) : null;
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
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.5/dist/sweetalert2.min.css">
    <link rel="stylesheet" href="vehicle-entry.css">
    <link rel="stylesheet" href="booking.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  </head>
  <body>
    <div class="head1">
      <nav class="head2" id="mainNavbar">  
        <a href="index.php" class="brand-wrapper">
          <img class="logo" src="project images/logo(1).jpeg" alt="Park My Spot Logo">
          <img class="ln" src="project images/logo name.png" alt="Park My Spot">
        </a>
        <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation" aria-expanded="false" onclick="toggleNavMenu()">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        <ul id="navMenu">
          <li><a href="index.php" class="a">Home</a></li>
          <li><a href="entry.php" class="a">Vehicle Entry</a></li>
          <li><a href="otp.php" class="a">Booking Details</a></li>
          <li><a href="feedback.php" class="a">Rate Us</a></li>
          <li class="si"><a href="logout.php">Logout</a></li>
        </ul>
      </nav>
    </div>

    <section class="container">
      <header>Vehicle Entry</header>
      <form method="POST" action="entry.php" class="form" id="vehicleEntryForm">
        <div class="input-box">
          <label for="vehreno">Vehicle Registration Number</label>
          <input type="text" class="form-control" placeholder="e.g. LOL-1869" id="vehreno" name="vehreno" required>
        </div>

        <div class="column">
          <div class="input-box">
            <label for="vehcomp">Vehicle Make / Model</label>
            <input type="text" class="form-control" placeholder="e.g. Tesla Model 3" id="vehcomp" name="vehcomp" required>
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
            <input type="text" class="form-control" placeholder="Full name of driver/owner" id="ownername" name="ownername" required>
          </div>

          <div class="input-box">
            <label for="ownercontno">Owner's Contact (10 Digits)</label>
            <input type="tel" class="form-control" placeholder="10-digit number" maxlength="10" pattern="[0-9]{10}" id="ownercontno" name="ownercontno" required>
          </div>
        </div>

        <div class="column">
          <div class="input-box">
            <label for="entryTime">Entry Time</label>
            <input type="datetime-local" id="entryTime" class="form-control" onchange="calculateParkingFee()" name="enteringtime" required>
          </div>

          <div class="input-box" id="booking-results">
            <label for="slotNumber">Choose Parking Slot</label>
            <input placeholder="Click to select parking bay" id="slotNumber" name="slot" readonly style="cursor: pointer;" onclick="openSlotModal()" required />
          </div>
        </div>

        <div class="column">
          <div class="input-box">
            <label for="dateTime">Expected Exit Time</label>
            <input type="datetime-local" id="dateTime" onchange="calculateParkingFee()" class="form-control" name="outtime" required>
          </div>

          <div class="input-box">
            <label for="parkingFee">Total Charge ($5/hr)</label>
            <input type="number" step="0.01" class="form-control" id="parkingFee" name="price" readonly required>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" id="myButton" class="btn-primary" name="submit-vehicle">Submit Vehicle Entry</button>
          <button type="reset" class="btn-secondary">Reset</button>
        </div> 
      </form>
    </section>

    <!-- Slot Selection Modal (Screenshot 2 Reference) -->
    <div class="modal fade" id="addModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Select an Available Parking Slot</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" onclick="closeSlotModal()"></button>
          </div>
          <div class="modal-body">
            <div class="modal-legend">
              <span class="legend-item"><span class="legend-box selected"></span>Green = Selected</span>
              <span class="legend-item"><span class="legend-box occupied"></span>Red = Occupied</span>
              <span class="legend-item"><span class="legend-box available"></span>White = Available</span>
            </div>
            <div class="slots-container">
              <table id="seatsDiagram" class="slots">
                <tr>
                  <?php for ($i = 1; $i <= 10; $i++): ?>
                    <td class="box" id="slot<?php echo $i; ?>" onclick="toggleSlot('slot<?php echo $i; ?>')" data-name="<?php echo $i; ?>" title="Slot <?php echo $i; ?>"><?php echo $i; ?></td>
                  <?php endfor; ?>
                </tr>
                <tr>
                  <?php for ($i = 11; $i <= 20; $i++): ?>
                    <td class="box" id="slot<?php echo $i; ?>" onclick="toggleSlot('slot<?php echo $i; ?>')" data-name="<?php echo $i; ?>" title="Slot <?php echo $i; ?>"><?php echo $i; ?></td>
                  <?php endfor; ?>
                </tr>
                <tr>
                  <td colspan="10" class="space lane-divider">--- LANE A ---</td>
                </tr>
                <tr>
                  <?php for ($i = 21; $i <= 29; $i++): ?>
                    <td class="box" id="slot<?php echo $i; ?>" onclick="toggleSlot('slot<?php echo $i; ?>')" data-name="<?php echo $i; ?>" title="Slot <?php echo $i; ?>"><?php echo $i; ?></td>
                  <?php endfor; ?>
                  <td class="space">&nbsp;</td>
                </tr>
                <tr>
                  <?php for ($i = 30; $i <= 38; $i++): ?>
                    <td class="box" id="slot<?php echo $i; ?>" onclick="toggleSlot('slot<?php echo $i; ?>')" data-name="<?php echo $i; ?>" title="Slot <?php echo $i; ?>"><?php echo $i; ?></td>
                  <?php endfor; ?>
                  <td class="space">&nbsp;</td>
                </tr>
                <tr>
                  <td colspan="10" class="space lane-divider">--- LANE B ---</td>
                </tr>
                <tr>
                  <?php for ($i = 39; $i <= 47; $i++): ?>
                    <td class="box" id="slot<?php echo $i; ?>" onclick="toggleSlot('slot<?php echo $i; ?>')" data-name="<?php echo $i; ?>" title="Slot <?php echo $i; ?>"><?php echo $i; ?></td>
                  <?php endfor; ?>
                  <td class="space">&nbsp;</td>
                </tr>
                <tr>
                  <?php for ($i = 48; $i <= 56; $i++): ?>
                    <td class="box" id="slot<?php echo $i; ?>" onclick="toggleSlot('slot<?php echo $i; ?>')" data-name="<?php echo $i; ?>" title="Slot <?php echo $i; ?>"><?php echo $i; ?></td>
                  <?php endfor; ?>
                  <td class="space">&nbsp;</td>
                </tr>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" id="confirmSlotBtn" onclick="confirmSlotSelection()">Confirm Selection</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bootstrap Bundle JS & Navbar Handler -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.bundle.min.js"></script>
    <script src="navbar.js" defer></script>
    <script>
      var occupiedSlots = <?php echo $occupiedJson; ?>;
      var tempSelectedSlot = null;
      var isSubmitting = false;

      function initSlots(slotsArray) {
        var list = slotsArray || occupiedSlots || [];
        document.querySelectorAll('.slots .box').forEach(function(el) {
          el.removeAttribute('data-occupied');
          el.style.backgroundColor = '';
          el.style.color = '';
          el.classList.remove('selected');
        });

        list.forEach(function(slotId) {
          var el = document.getElementById(slotId);
          if (el) {
            el.setAttribute('data-occupied', 'true');
          }
        });

        var confirmed = document.getElementById('slotNumber').value;
        if (confirmed) {
          var selEl = document.getElementById(confirmed);
          if (selEl && selEl.getAttribute('data-occupied') !== 'true') {
            selEl.style.backgroundColor = '#28a745';
            selEl.style.color = '#ffffff';
            selEl.classList.add('selected');
          }
        }
      }

      function refreshOccupiedSlots(callback) {
        fetch('/api/booked-slots')
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data && data.success && Array.isArray(data.occupiedSlots)) {
              occupiedSlots = data.occupiedSlots;
              initSlots(data.occupiedSlots);
            }
            if (typeof callback === 'function') callback();
          })
          .catch(function(err) {
            console.warn('[Slot Refresh Error]', err);
            if (typeof callback === 'function') callback();
          });
      }

      function openSlotModal() {
        var current = document.getElementById('slotNumber').value;
        tempSelectedSlot = current || null;
        
        refreshOccupiedSlots(function() {
          var modalEl = document.getElementById('addModal');
          var modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          document.body.style.overflow = 'hidden';
          modalInstance.show();
        });
      }

      function closeSlotModal() {
        var modalEl = document.getElementById('addModal');
        var modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
          modalInstance.hide();
        }
        document.body.style.overflow = '';
      }

      function toggleSlot(slotId) {
        var slot = document.getElementById(slotId);
        if (!slot) return;
        if (slot.getAttribute('data-occupied') === 'true') {
          Swal.fire({ text: 'This slot is already occupied!', icon: 'warning' });
          return;
        }

        document.querySelectorAll('.slots .box').forEach(function(b) {
          if (b.getAttribute('data-occupied') !== 'true') {
            b.style.backgroundColor = '';
            b.style.color = '';
            b.classList.remove('selected');
          }
        });

        slot.style.backgroundColor = '#28a745';
        slot.style.color = '#ffffff';
        slot.classList.add('selected');
        tempSelectedSlot = slotId;
      }

      function confirmSlotSelection() {
        if (!tempSelectedSlot) {
          Swal.fire({ text: 'Please select an available parking slot.', icon: 'warning' });
          return;
        }

        var slotEl = document.getElementById(tempSelectedSlot);
        if (slotEl && slotEl.getAttribute('data-occupied') === 'true') {
          Swal.fire({ text: 'This slot was just occupied. Please choose another slot.', icon: 'warning' });
          refreshOccupiedSlots();
          return;
        }

        document.getElementById('slotNumber').value = tempSelectedSlot;
        closeSlotModal();

        var form = document.getElementById('vehicleEntryForm');
        if (form && validateFormFields(false)) {
          submitBookingForm();
        }
      }

      function validateFormFields(showAlerts) {
        var vehreno = document.getElementById('vehreno').value.trim();
        var vehcomp = document.getElementById('vehcomp').value.trim();
        var catename = document.getElementById('catename').value.trim();
        var ownername = document.getElementById('ownername').value.trim();
        var ownercontno = document.getElementById('ownercontno').value.trim();
        var entryTime = document.getElementById('entryTime').value;
        var exitTime = document.getElementById('dateTime').value;

        if (!vehreno) {
          if (showAlerts) Swal.fire({ text: 'Please enter the vehicle registration number.', icon: 'warning' });
          return false;
        }
        if (!vehcomp) {
          if (showAlerts) Swal.fire({ text: "Please enter the vehicle's company name.", icon: 'warning' });
          return false;
        }
        if (!catename) {
          if (showAlerts) Swal.fire({ text: 'Please select a vehicle category.', icon: 'warning' });
          return false;
        }
        if (!ownername) {
          if (showAlerts) Swal.fire({ text: "Please enter the owner's full name.", icon: 'warning' });
          return false;
        }
        if (!ownercontno || !/^[0-9]{10}$/.test(ownercontno)) {
          if (showAlerts) Swal.fire({ text: 'Please enter a valid 10-digit mobile number.', icon: 'warning' });
          return false;
        }
        if (!entryTime) {
          if (showAlerts) Swal.fire({ text: 'Please select the vehicle entry time.', icon: 'warning' });
          return false;
        }
        if (!exitTime) {
          if (showAlerts) Swal.fire({ text: 'Please select the expected exit time.', icon: 'warning' });
          return false;
        }

        var entryDate = new Date(entryTime);
        var exitDate = new Date(exitTime);
        if (exitDate <= entryDate) {
          if (showAlerts) Swal.fire({ text: 'Exit time must be later than entry time.', icon: 'warning' });
          return false;
        }

        return true;
      }

      function submitBookingForm() {
        if (isSubmitting) return;
        isSubmitting = true;
        var submitBtn = document.getElementById('myButton');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Submitting...';
        }
        document.getElementById('vehicleEntryForm').submit();
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

        var form = document.getElementById('vehicleEntryForm');
        if (form) {
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!validateFormFields(true)) {
              return;
            }

            var chosenSlot = document.getElementById('slotNumber').value;
            if (!chosenSlot) {
              openSlotModal();
              return;
            }

            submitBookingForm();
          });
        }

        var modalEl = document.getElementById('addModal');
        if (modalEl) {
          modalEl.addEventListener('hidden.bs.modal', function() {
            document.body.style.overflow = '';
            var confirmed = document.getElementById('slotNumber').value;
            tempSelectedSlot = confirmed || null;
            initSlots();
          });
        }

        <?php if (!empty($alertScript)) echo $alertScript; ?>
      });
    </script>
  </body>
</html>

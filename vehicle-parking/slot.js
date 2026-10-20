var w, h;
var parklock = false;
var parklist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var dbOccupiedList = [];
var queueitems = 0; // initially 0

function updateDimensions() {
    var space = document.getElementById('parkingspace');
    if (!space) return;
    w = space.offsetWidth;
    h = space.offsetHeight;

    var existingAnim = document.getElementById('dynamic-car-anim');
    if (existingAnim) existingAnim.remove();

    var anim = document.createElement('style');
    anim.id = 'dynamic-car-anim';
    var rule1 = document.createTextNode('@-webkit-keyframes car-park {'+
        'from { transform: rotate(270deg) }'+
        '80% { transform: rotate(270deg) translate(0px,-'+w+'px) }'+
        '90% { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) }'+
        'to { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,-'+(h*0.25)+'px)}'+
        '}');
    anim.appendChild(rule1);
    var rule2 = document.createTextNode('@-webkit-keyframes car-bottom {'+
        'from { transform: rotate(270deg) }'+
        '80% { transform: rotate(270deg) translate(0px,-'+w+'px) }'+
        '90% { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) }'+
        'to { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,'+(h*0.25)+'px)}'+
        '}');
    anim.appendChild(rule2);
    var rule3 = document.createTextNode('@-webkit-keyframes car-exit-top {'+
        'from { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,-'+(h*0.25)+'px) }'+
        '80% { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,-'+(h*0.25)+'px) translate(0px,'+(h*0.25)+'px)}'+
        '90% { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,-'+(h*0.25)+'px) translate(0px,'+(h*0.25)+'px) rotate(90deg)}'+
        'to { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,-'+(h*0.25)+'px) translate(0px,'+(h*0.25)+'px) rotate(90deg) translate(0px,-'+w+'px)}'+
        '}');
    anim.appendChild(rule3);
    var rule4 = document.createTextNode('@-webkit-keyframes car-exit-bottom {'+
        'from { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,'+(h*0.25)+'px) }'+
        '80% { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,'+(h*0.25)+'px) translate(0px,-'+(h*0.25)+'px)}'+
        '90% { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,'+(h*0.25)+'px) translate(0px,-'+(h*0.25)+'px) rotate(90deg)}'+
        'to { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,'+(h*0.25)+'px) translate(0px,-'+(h*0.25)+'px) rotate(90deg) translate(0px,-'+w+'px)}'+
        '}');
    anim.appendChild(rule4);
    space.appendChild(anim);
}

function syncOccupiedSlots() {
    fetch('/api/booked-slots')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data && data.success && Array.isArray(data.occupiedSlots)) {
                dbOccupiedList = data.occupiedSlots;
                applyDatabaseAvailability(data.occupiedSlots);
            }
        })
        .catch(function(err) {
            console.warn('[Park My Spot] Slot sync error:', err);
        });
}

function applyDatabaseAvailability(occupiedSlots) {
    for (var i = 0; i < 10; i++) {
        var slotNum = i + 1;
        var isDbOccupied = occupiedSlots.some(function(s) {
            return s === 'slot' + slotNum || s === String(slotNum);
        });

        var btn = document.getElementById('slot' + slotNum);
        var slotCard = document.getElementById('slot-' + slotNum);

        if (isDbOccupied) {
            if (btn) {
                btn.style.background = '#dc3545';
                btn.setAttribute('data-occupied', 'true');
                btn.title = 'Slot ' + slotNum + ' (Occupied by active vehicle)';
            }
            if (slotCard) {
                slotCard.classList.add('occupied');
                slotCard.innerHTML = 'Slot ' + slotNum + '<span class="slot-status">OCCUPIED</span>';
            }
            parklist[i] = 1;
        } else {
            // Only reset if car is not simulated entered in local session
            if (!document.getElementById('car' + i)) {
                if (btn) {
                    btn.style.background = '#16a34a';
                    btn.removeAttribute('data-occupied');
                    btn.title = 'Slot ' + slotNum + ' (Available)';
                }
                if (slotCard) {
                    slotCard.classList.remove('occupied');
                    slotCard.innerHTML = 'Slot ' + slotNum;
                }
                parklist[i] = 0;
            }
        }
    }
}

function setupparkingmanager() {
    updateDimensions();
    syncOccupiedSlots();

    window.addEventListener('resize', function() {
        updateDimensions();
    });

    window.addEventListener('focus', function() {
        syncOccupiedSlots();
    });

    setInterval(syncOccupiedSlots, 10000);
}

function queuecheck(slot) {
    if (queueitems > 0) {
        queueitems--;
        carenter(slot);
    }
}

function carexit(slot) {
    if (!parklock) {
        parklist[slot] = 0;
        parklock = true;
        var btn = document.getElementById('slot' + (slot + 1).toString());
        var isDbOccupied = dbOccupiedList.some(function(s) {
            return s === 'slot' + (slot + 1) || s === String(slot + 1);
        });

        if (btn) {
            btn.style.background = isDbOccupied ? '#dc3545' : 'rgb(27,118,19)';
        }
        var car = document.getElementById('car' + (slot).toString());
        if (car) {
            if (slot <= 4) {
                car.style.animation = 'car-exit-top 2s both';
            } else {
                car.style.animation = 'car-exit-bottom 2s both';
            }
        }
        setTimeout(function() {
            var el = document.getElementById('car' + (slot).toString());
            if (el) el.remove();
            parklock = false;
            queuecheck(slot);
        }, 2000);
    }
}

function generatenewcar(slot) {
    var space = document.getElementById('parkingspace');
    if (!space) return;
    let img = document.createElement('img');
    img.src = 'car.png';
    img.className = 'new-car-origin';
    img.style.width = Math.max(30, (w * 0.8) * 0.1) + 'px';
    img.id = 'car' + slot.toString();
    space.appendChild(img);
}

function carenter(slot) {
    var slotNum = slot + 1;
    var btn = document.getElementById('slot' + slotNum);
    var isDbOccupied = dbOccupiedList.some(function(s) {
        return s === 'slot' + slotNum || s === String(slotNum);
    });

    if (isDbOccupied && !document.getElementById('car' + slot)) {
        alert('Slot ' + slotNum + ' is currently occupied by an active registered booking in the database.');
        return;
    }

    if (!document.getElementById('car' + (slot).toString()) && !parklock) {
        parklist[slot] = 1;
        parklock = true;
        generatenewcar(slot);
        if (btn) btn.style.background = 'rgb(146,18,18)';
        var car = document.getElementById('car' + (slot).toString());
        if (car) {
            if (slot != 4 && slot != 9) {
                car.style.right = (-w + (w * 0.1) + (((5 - (slot + 1) % 5)) * ((w * 0.8) * 0.2)) + ((w * 0.8) * 0.05)) + 'px';
            } else {
                car.style.right = (-w + (w * 0.1) + ((w * 0.8) * 0.05)) + 'px';
            }
            if (slot <= 4) {
                car.style.animation = 'car-park 2s both';
            } else {
                car.style.animation = 'car-bottom 2s both';
            }
        }
        setTimeout(function() {
            parklock = false;
        }, 2000);
    } else {
        carexit(slot);
    }
}
var w, h;
var parklock = false;
var parklist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var queueitems = 0; // initially 0

function setupparkingmanager() {
    var space = document.getElementById('parkingspace');
    if (!space) return;
    w = space.offsetWidth;
    h = space.offsetHeight;

    // creating Animations -- important part
    var anim = document.createElement('style');
    var rule1 = document.createTextNode('@-webkit-keyframes car-park {'+
        'from { transform: rotate(270deg) }'+
        '80% { transform: rotate(270deg) translate(0px,-'+w+'px) }'+
        '90% { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) }'+
        'to { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,-'+h*.25+'px)}'+
        '}');
    anim.appendChild(rule1);
    var rule2 = document.createTextNode('@-webkit-keyframes car-bottom {'+
        'from { transform: rotate(270deg) }'+
        '80% { transform: rotate(270deg) translate(0px,-'+w+'px) }'+
        '90% { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) }'+
        'to { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,'+h*.25+'px)}'+
        '}');
    anim.appendChild(rule2);
    var rule3 = document.createTextNode('@-webkit-keyframes car-exit-top {'+
        'from { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,-'+h*.25+'px) }'+
        '80% { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,-'+h*.25+'px) translate(0px,'+h*.25+'px)}'+
        '90% { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,-'+h*.25+'px) translate(0px,'+h*.25+'px) rotate(90deg)}'+
        'to { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,-'+h*.25+'px) translate(0px,'+h*.25+'px) rotate(90deg) translate(0px,-'+w+'px)}'+
        '}');
    anim.appendChild(rule3);
    var rule4 = document.createTextNode('@-webkit-keyframes car-exit-bottom {'+
        'from { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,'+h*.25+'px) }'+
        '80% { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,'+h*.25+'px) translate(0px,-'+h*.25+'px)}'+
        '90% { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,'+h*.25+'px) translate(0px,-'+h*.25+'px) rotate(90deg)}'+
        'to { transform: rotate(270deg) translate(0px,-'+w+'px) rotate(90deg) translate(0px,'+h*.25+'px) translate(0px,-'+h*.25+'px) rotate(90deg) translate(0px,-'+w+'px)}'+
        '}');
    anim.appendChild(rule4);
    space.appendChild(anim);
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
        if (btn) btn.style.background = 'rgb(27,118,19)';
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
    img.style.width = (w * 0.8) * 0.1 + 'px';
    img.id = 'car' + slot.toString();
    space.appendChild(img);
}

function carenter(slot) {
    if (!document.getElementById('car' + (slot).toString()) && !parklock) {
        parklist[slot] = 1;
        parklock = true;
        generatenewcar(slot);
        var btn = document.getElementById('slot' + (slot + 1).toString());
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
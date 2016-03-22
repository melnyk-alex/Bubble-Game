var flow = document.getElementById('gameFlow');
flow.width = document.body.clientWidth;
flow.height = document.body.clientHeight;

var ctx = flow.getContext("2d");

var snow = [];
var mouse = {x: 0, y: 0};
var points = 0;
var countdown = 0;
var message = "CLICK", submessage = "for start game";

var settings = {
    background: {
        horizont: {
            position: flow.height * 0.66,
            color: 'rgba(0,0,55, 0.25)'
        }
    },
    pointer: {
        fill: 'rgba(235,235,255, 0.85)',
        stoke: 'rgba(0,0,0, 0.85)',
        min: 1,
        max: 15
    },
    snow: {
        colors: [
            'rgba(155,255,0,0.75)',
            'rgba(0,155,255,0.75)',
            'rgba(255,0,155,0.75)'
        ],
        speed: {
            min: 0.50,
            max: 1.50
        },
        size: {
            min: 1,
            max: 10
        },
        max: 25,
        wind: 1.5
    },
    levels: [
        {
            snow: {
                speed: {
                    min: 0.50,
                    max: 1.50
                },
                max: 50
            }
        },
        {
            snow: {
                speed: {
                    min: 0.75,
                    max: 2.00
                },
                max: 100
            }
        },
        {
            snow: {
                speed: {
                    min: 1.00,
                    max: 2.50
                },
                max: 200
            }
        },
        {
            snow: {
                speed: {
                    min: 2.50,
                    max: 5.00
                },
                max: 300
            }
        }
    ],
    game: false
};

// Mouse Handler
document.onmousemove = function (e) {
    var depth = mouse.y * settings.pointer.max / settings.background.horizont.position;
    var delta = mouse.y * settings.snow.colors.length / flow.height;

    mouse = {
        x: e.pageX,
        y: e.pageY,
        r: depth,
        color: settings.snow.colors[parseInt(delta)]
    };
};

document.onclick = function (e) {
    if (!settings.game) {
        countdown = 4;

        var id = setInterval(function () {
            if (countdown > 0) {
                countdown--;
            }

            showMessage(countdown, "ready?", 0);

            if (countdown == 0) {
                showMessage("LEVEL " + (current + 1), 1000);

                settings.game = true;
                clearInterval(id);
            }
        }, 500);
    }
};

// Generate show
function generateSnow() {
    if (settings.snow.max - snow.length) {
        var item = {
            x: Math.random() * flow.width,
            y: Math.random() * (flow.height * -1),
            z: settings.snow.size.min + (Math.random() * settings.snow.size.max),
            speed: settings.snow.speed.min + (Math.random() * settings.snow.speed.max)
        };

        var colorIndex = parseInt(item.z * (settings.snow.colors.length - 1) / settings.snow.size.max);
        item.color = settings.snow.colors[colorIndex];

        snow.push(item);
    }
}

var current = 0;

var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

function draw() {

    clear();

    drawBackground();

    drawSnow();

    drawCountdown();

    drawControl();

    drawPoints();

    drawMessage();

    if (points < 0 && settings.game) {
        settings.game = false;
        showMessage("GAME OVER", "Click for START", 0);

        current = 0;
        points = 0;
    }

    if (settings.game) {
        if (points >= settings.levels[current].snow.max) {
            if (settings.levels.length > current + 1) {
                $.extend(true, settings.snow, settings.levels[++current].snow);
                showMessage("LEVEL " + (current + 1), 1000);
            } else {
                settings.game = false;
                showMessage("WINNER", "good job", 0);
            }
        }
    }

    raf(draw);
}

var messageID;

/**
 *
 * @param msg
 * @param submsg
 * @param millis
 */
function showMessage(msg) {
    message = msg;
    var millis = 1000;

    if (arguments.length > 1) {
        if (typeof arguments[1] === 'string') {
            submessage = arguments[1];
        } else {
            millis = arguments[1];
        }

        if (typeof arguments[2] == 'number') {
            millis = arguments[2];
        }

        console.log(arguments, millis);
    }

    if (millis > 0) {
        clearTimeout(messageID);
        messageID = setTimeout(function () {
            message = undefined;
            submessage = undefined;
        }, millis);
    }
}

function clearMessage() {
    console.log("clear");

    message = undefined;
    submessage = undefined;
}

function clear() {
    ctx.clearRect(0, 0, flow.width, flow.height);
}

function drawBackground() {
    ctx.strokeStyle = settings.background.horizont.color;
    ctx.beginPath();
    ctx.moveTo(0, settings.background.horizont.position);
    ctx.lineTo(flow.width, settings.background.horizont.position);
    ctx.stroke();
}

function drawSnow() {
    for (var idx in snow) {
        var item = snow[idx];

        //if (settings.game) {
        item.y += item.speed;
        //item.x += (Math.random() - 0.5) * 2;
        item.x += (Math.random() * settings.snow.wind) * (Math.random() >= 0.5 ? -1 : 1);

        //}

        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.z, 0, 2 * Math.PI);
        ctx.fill();

        if (check(item) && settings.game) {
            if (item.color === mouse.color) {
                points += parseInt(settings.snow.size.max - item.z) + 1;
            } else {
                points -= parseInt(settings.snow.size.max - item.z) + 1;
            }

            snow.splice(idx, 1);
        } else if (item.y - item.z > flow.height) {
            snow.splice(idx, 1);
        }
    }

    generateSnow();
}

function drawControl() {
    ctx.beginPath();
    ctx.arc(mouse.x, settings.background.horizont.position, mouse.r, 0, 2 * Math.PI);

    ctx.fillStyle = mouse.color;

    ctx.stroke();
    ctx.fill();
}

function drawPoints() {
    ctx.textAlign = "left";
    ctx.font = "30px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillText("Total: " + points, 30, 50);
}

function drawCountdown() {
    //if (countdown > 0) {
    //    ctx.textAlign = "center";
    //    ctx.font = "100pt Monospace";
    //    ctx.fillStyle = "rgba(255,255,255,0.75)";
    //    ctx.fillText("" + countdown, flow.width / 2, flow.height / 2);
    //}

    //if (countdown === 0 && !settings.game) {
    //    ctx.textAlign = "center";
    //    ctx.font = "50pt Monospace";
    //    ctx.fillStyle = "rgba(255,255,255,0.75)";
    //    ctx.fillText("Click to start", flow.width / 2, flow.height / 2);
    //}
}

function drawMessage() {
    if (message) {
        ctx.textAlign = "center";
        ctx.font = "50pt Monospace";
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.fillText(message, flow.width / 2, flow.height / 2);
    }

    if (submessage) {
        ctx.textAlign = "center";
        ctx.font = "30pt Monospace";
        ctx.fillStyle = "rgba(255,255,255,0.50)";
        ctx.fillText(submessage, flow.width / 2, flow.height / 2 + 50);
    }
}

// UTILITIES
function halflize(s1, s2) {
    return s1 > s2 ? s1 : s2;
}

function check(item) {
    var diffa = halflize(item.z, mouse.r);
    var diffb = diffa * -1;
    var a = item.x - mouse.x;
    var b = settings.background.horizont.position - item.y;

    return (a >= diffb && a <= diffa && b >= diffb && b <= diffa);
}

draw();
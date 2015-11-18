var flow = document.getElementById('gameFlow');
flow.width = document.body.clientWidth;
flow.height = document.body.clientHeight;

var ctx = flow.getContext("2d");
var ctxString = flow.getContext("2d");

var snow = [];
var mouse = {x: 0, y: 0};
var points = 0;

var settings = {
    background: {
        horizont: {
            position: flow.height * 0.6,
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
            min: 0.90,
            max: 5.0
        },
        size: {
            min: 1,
            max: 10
        },
        max: 150
    }
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

var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

function draw() {
    clear();

    drawBackground();

    drawSnow();

    drawControl();
    
    drawPoints();

    raf(draw);
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

        item.y += item.speed;
        item.x += (Math.random() - 0.5) * 2;

        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.z, 0, 2 * Math.PI);
        ctx.fill();

        if (check(item)) {
            points += parseInt(settings.snow.size.max - item.z) + 1;
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
    ctx.font = "30px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("Total: " + points, 30, 30);
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

    return (a >= diffb && a <= diffa && b >= diffb && b <= diffa && item.color === mouse.color);
}

draw();
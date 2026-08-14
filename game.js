// ============================================================
// EURO TRUCK - GAME.JS
// FASES ANTERIORES + CAMIÓN + TRABAJOS + MAPA + CONCESIONARIOS
// ============================================================

"use strict";

// ------------------------------------------------------------
// CANVAS
// ------------------------------------------------------------

let canvas = document.getElementById("gameCanvas");

if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "gameCanvas";

    canvas.style.position = "fixed";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.background = "#87CEEB";

    document.body.appendChild(canvas);
}

const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();


// ============================================================
// ESTADO DEL JUEGO
// ============================================================

const game = {

    money: 50000,

    speed: 0,

    gear: 1,

    maxGear: 6,

    fuel: 100,

    damage: 0,

    distance: 0,

    roadName: "A-6",

    location: "Madrid",

    destination: "Barcelona",

    jobActive: false,

    jobProgress: 0,

    jobDistance: 620,

    jobReward: 8500,

    selectedTruck: 0,

    selectedTrailer: 0,

    paused: false,

    mapZoom: 1,

    cameraX: 0,

    cameraY: 0
};


// ============================================================
// CAMIONES
// ============================================================

const trucks = [

    {
        name: "Volvo FH",
        price: 120000,
        power: "500 CV",
        color: "#d71920",
        maxSpeed: 140
    },

    {
        name: "Scania S",
        price: 145000,
        power: "560 CV",
        color: "#ffffff",
        maxSpeed: 145
    },

    {
        name: "Mercedes Actros",
        price: 135000,
        power: "530 CV",
        color: "#777777",
        maxSpeed: 140
    },

    {
        name: "MAN TGX",
        price: 115000,
        power: "510 CV",
        color: "#ffd400",
        maxSpeed: 138
    },

    {
        name: "DAF XG",
        price: 125000,
        power: "530 CV",
        color: "#174f9e",
        maxSpeed: 140
    },

    {
        name: "Iveco S-Way",
        price: 105000,
        power: "500 CV",
        color: "#00843d",
        maxSpeed: 135
    }

];


// ============================================================
// REMOLQUES
// ============================================================

const trailers = [

    {
        name: "Lonely Trailer",
        price: 25000,
        cargo: "Carga general",
        color: "#eeeeee"
    },

    {
        name: "Frigorífico",
        price: 38000,
        cargo: "Alimentos",
        color: "#d9d9d9"
    },

    {
        name: "Cisterna",
        price: 45000,
        cargo: "Líquidos",
        color: "#aaaaaa"
    },

    {
        name: "Plataforma",
        price: 30000,
        cargo: "Maquinaria",
        color: "#555555"
    },

    {
        name: "Contenedor",
        price: 28000,
        cargo: "Contenedores",
        color: "#1e73be"
    }

];


// ============================================================
// MAPA
// ============================================================

const cities = [

    { name: "Madrid", x: 450, y: 450 },
    { name: "Barcelona", x: 790, y: 360 },
    { name: "Valencia", x: 690, y: 500 },
    { name: "Sevilla", x: 300, y: 720 },
    { name: "Málaga", x: 330, y: 790 },
    { name: "Bilbao", x: 440, y: 230 },
    { name: "Zaragoza", x: 610, y: 330 },
    { name: "Valladolid", x: 390, y: 350 },
    { name: "A Coruña", x: 150, y: 220 },
    { name: "Vigo", x: 180, y: 300 },
    { name: "Salamanca", x: 300, y: 380 },
    { name: "Toledo", x: 410, y: 510 },
    { name: "Córdoba", x: 350, y: 620 },
    { name: "Granada", x: 440, y: 700 },
    { name: "Murcia", x: 620, y: 650 },
    { name: "Alicante", x: 650, y: 610 },
    { name: "Pamplona", x: 500, y: 270 },
    { name: "San Sebastián", x: 500, y: 210 },
    { name: "Oviedo", x: 310, y: 190 },
    { name: "Gijón", x: 300, y: 160 },

    // Francia

    { name: "París", x: 570, y: -100 },
    { name: "Burdeos", x: 300, y: -10 },
    { name: "Toulouse", x: 430, y: 80 },
    { name: "Marsella", x: 760, y: 130 },
    { name: "Lyon", x: 650, y: 40 },
    { name: "Montpellier", x: 600, y: 130 },
    { name: "Nantes", x: 330, y: -100 },
    { name: "Lille", x: 650, y: -170 }
];


// ============================================================
// CONCESIONARIOS
// ============================================================

const dealerships = [

    {
        name: "Concesionario Madrid",
        city: "Madrid",
        x: 450,
        y: 450
    },

    {
        name: "Concesionario Barcelona",
        city: "Barcelona",
        x: 790,
        y: 360
    },

    {
        name: "Concesionario Valencia",
        city: "Valencia",
        x: 690,
        y: 500
    },

    {
        name: "Concesionario Bilbao",
        city: "Bilbao",
        x: 440,
        y: 230
    },

    {
        name: "Concesionario Sevilla",
        city: "Sevilla",
        x: 300,
        y: 720
    },

    {
        name: "Concesionario París",
        city: "París",
        x: 570,
        y: -100
    }

];


// ============================================================
// POSICIÓN DEL CAMIÓN
// ============================================================

const player = {

    x: 450,

    y: 450,

    angle: 0,

    width: 42,

    height: 75,

    trailerAttached: true

};


// ============================================================
// TECLAS
// ============================================================

const keys = {};

window.addEventListener("keydown", function (event) {

    keys[event.key.toLowerCase()] = true;

    // Evitar que el navegador haga cosas raras
    if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === " "
    ) {
        event.preventDefault();
    }

    // + = subir marcha
    if (
        event.key === "+" ||
        event.key === "="
    ) {
        subirMarcha();
    }

    // - = bajar marcha
    if (event.key === "-") {
        bajarMarcha();
    }

    // M = mapa
    if (event.key.toLowerCase() === "m") {
        toggleMap();
    }

    // P = concesionario
    if (event.key.toLowerCase() === "p") {
        openDealership();
    }

    // ESC = cerrar ventanas
    if (event.key === "Escape") {
        closePanels();
    }

});

window.addEventListener("keyup", function (event) {

    keys[event.key.toLowerCase()] = false;

});


// ============================================================
// MARCHAS
// ============================================================

function subirMarcha() {

    if (game.gear < game.maxGear) {

        game.gear++;

    }

}

function bajarMarcha() {

    if (game.gear > -1) {

        game.gear--;

    }

}


// ============================================================
// HUD
// ============================================================

let hud = document.getElementById("gameHUD");

if (!hud) {

    hud = document.createElement("div");

    hud.id = "gameHUD";

    hud.style.position = "fixed";
    hud.style.left = "20px";
    hud.style.top = "20px";
    hud.style.zIndex = "100";
    hud.style.color = "white";
    hud.style.fontFamily = "Arial";
    hud.style.fontSize = "18px";
    hud.style.background = "rgba(0,0,0,0.65)";
    hud.style.padding = "15px";
    hud.style.borderRadius = "12px";
    hud.style.minWidth = "230px";

    document.body.appendChild(hud);

}


// ============================================================
// AYUDA DE TECLAS
// ============================================================

let controls = document.getElementById("controls");

if (!controls) {

    controls = document.createElement("div");

    controls.id = "controls";

    controls.style.position = "fixed";
    controls.style.bottom = "15px";
    controls.style.left = "50%";
    controls.style.transform = "translateX(-50%)";
    controls.style.zIndex = "100";
    controls.style.color = "white";
    controls.style.background = "rgba(0,0,0,0.65)";
    controls.style.padding = "12px 20px";
    controls.style.borderRadius = "12px";
    controls.style.fontFamily = "Arial";
    controls.style.textAlign = "center";

    controls.innerHTML = `
        <b>CONTROLES</b><br>
        W / ↑ Acelerar &nbsp;&nbsp;
        S / ↓ Frenar &nbsp;&nbsp;
        A / ← Girar izquierda &nbsp;&nbsp;
        D / → Girar derecha<br>
        + Subir marcha &nbsp;&nbsp;
        - Bajar marcha &nbsp;&nbsp;
        M Mapa &nbsp;&nbsp;
        P Concesionario
    `;

    document.body.appendChild(controls);

}


// ============================================================
// ACTUALIZAR HUD
// ============================================================

function updateHUD() {

    const truck = trucks[game.selectedTruck];
    const trailer = trailers[game.selectedTrailer];

    hud.innerHTML = `
        <div style="font-size:22px;font-weight:bold">
            🚛 ${truck.name}
        </div>

        <hr>

        <div>🚀 Velocidad: <b>${Math.round(game.speed)} km/h</b></div>

        <div>⚙️ Marcha: <b>${game.gear}</b></div>

        <div>⛽ Combustible: <b>${Math.round(game.fuel)}%</b></div>

        <div>💰 Dinero: <b>${game.money.toLocaleString()} €</b></div>

        <div>🛣️ Carretera: <b>${game.roadName}</b></div>

        <div>📍 Ciudad: <b>${game.location}</b></div>

        <div>📦 Remolque: <b>${trailer.name}</b></div>

        ${
            game.jobActive
            ? `
            <hr>
            <div>📦 TRABAJO ACTIVO</div>
            <div>${game.location} → ${game.destination}</div>
            <div>💶 Premio: ${game.jobReward.toLocaleString()} €</div>
            <div>📏 Distancia: ${Math.round(game.jobProgress)} / ${game.jobDistance} km</div>
            `
            : ""
        }
    `;

}


// ============================================================
// FÍSICA DEL CAMIÓN
// ============================================================

function updateTruck() {

    const truck = trucks[game.selectedTruck];

    let acceleration = 0;

    // Acelerar
    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        if (game.gear > 0) {

            acceleration = 0.12 * game.gear;

        } else {

            acceleration = -0.08;

        }

    }

    // Frenar
    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        acceleration = -0.18;

    }

    game.speed += acceleration;

    // Rozamiento
    if (
        !keys["w"] &&
        !keys["arrowup"] &&
        !keys["s"] &&
        !keys["arrowdown"]
    ) {

        game.speed *= 0.985;

    }

    // Marcha atrás
    if (game.gear === 0) {

        if (game.speed < -30) {
            game.speed = -30;
        }

    }

    // Límites
    if (game.speed > truck.maxSpeed) {

        game.speed = truck.maxSpeed;

    }

    if (game.speed < -30) {

        game.speed = -30;

    }

    // Dirección
    let steering = 0;

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        steering = -1;

    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        steering = 1;

    }

    player.angle += steering * 0.035 * (Math.abs(game.speed) / 40 + 0.2);

    // Movimiento
    const radians = player.angle;

    player.x += Math.sin(radians) * game.speed * 0.12;

    player.y -= Math.cos(radians) * game.speed * 0.12;

    // Combustible
    if (Math.abs(game.speed) > 1) {

        game.fuel -= 0.002;

    }

    if (game.fuel < 0) {

        game.fuel = 0;

        game.speed = 0;

    }

    // Distancia
    game.distance += Math.abs(game.speed) * 0.0005;

}


// ============================================================
// ACTUALIZAR CIUDAD
// ============================================================

function updateLocation() {

    let closest = null;

    let closestDistance = Infinity;

    for (const city of cities) {

        const dx = player.x - city.x;

        const dy = player.y - city.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < closestDistance) {

            closestDistance = distance;

            closest = city;

        }

    }

    if (closest) {

        game.location = closest.name;

    }

}


// ============================================================
// TRABAJOS
// ============================================================

function startRandomJob() {

    const possibleDestinations = cities.filter(
        city => city.name !== game.location
    );

    const destination =
        possibleDestinations[
            Math.floor(
                Math.random() * possibleDestinations.length
            )
        ];

    game.destination = destination.name;

    game.jobActive = true;

    game.jobProgress = 0;

    game.jobDistance =
        300 +
        Math.floor(Math.random() * 900);

    game.jobReward =
        5000 +
        Math.floor(Math.random() * 15000);

}

function updateJob() {

    if (!game.jobActive) return;

    game.jobProgress += Math.abs(game.speed) * 0.0005;

    if (game.jobProgress >= game.jobDistance) {

        completeJob();

    }

}

function completeJob() {

    game.money += game.jobReward;

    game.jobActive = false;

    game.jobProgress = 0;

    setTimeout(function () {

        startRandomJob();

    }, 2000);

}


// ============================================================
// MAPA
// ============================================================

let mapVisible = false;

function toggleMap() {

    mapVisible = !mapVisible;

}

function drawMap() {

    if (!mapVisible) return;

    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.75)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.translate(
        canvas.width / 2 - player.x,
        canvas.height / 2 - player.y
    );

    // Carreteras principales

    ctx.strokeStyle = "#eeeeee";

    ctx.lineWidth = 7;

    for (let i = 0; i < cities.length - 1; i++) {

        ctx.beginPath();

        ctx.moveTo(
            cities[i].x,
            cities[i].y
        );

        ctx.lineTo(
            cities[i + 1].x,
            cities[i + 1].y
        );

        ctx.stroke();

    }

    // Ciudades

    for (const city of cities) {

        ctx.beginPath();

        ctx.fillStyle = "#ffcc00";

        ctx.arc(
            city.x,
            city.y,
            8,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "white";

        ctx.font = "16px Arial";

        ctx.fillText(
            city.name,
            city.x + 12,
            city.y + 5
        );

    }

    // Concesionarios

    for (const dealer of dealerships) {

        ctx.fillStyle = "#00ff66";

        ctx.fillRect(
            dealer.x - 8,
            dealer.y - 8,
            16,
            16
        );

        ctx.fillStyle = "white";

        ctx.font = "13px Arial";

        ctx.fillText(
            "🏢 " + dealer.city,
            dealer.x + 12,
            dealer.y
        );

    }

    // Camión

    drawTruck(
        player.x,
        player.y,
        player.angle
    );

    ctx.restore();

}


// ============================================================
// DIBUJAR CAMIÓN
// ============================================================

function drawTruck(x, y, angle) {

    const truck = trucks[game.selectedTruck];

    ctx.save();

    ctx.translate(x, y);

    ctx.rotate(angle);

    // Remolque

    if (player.trailerAttached) {

        ctx.fillStyle =
            trailers[game.selectedTrailer].color;

        ctx.fillRect(
            -16,
            20,
            32,
            55
        );

        ctx.strokeStyle = "#222";

        ctx.strokeRect(
            -16,
            20,
            32,
            55
        );

    }

    // Cabina

    ctx.fillStyle = truck.color;

    ctx.fillRect(
        -20,
        -35,
        40,
        50
    );

    // Parabrisas

    ctx.fillStyle = "#4ca3dd";

    ctx.fillRect(
        -14,
        -28,
        28,
        15
    );

    // Parte frontal

    ctx.fillStyle = "#222";

    ctx.fillRect(
        -15,
        -38,
        30,
        7
    );

    // Faros

    ctx.fillStyle = "#fff";

    ctx.fillRect(
        -16,
        -40,
        7,
        4
    );

    ctx.fillRect(
        9,
        -40,
        7,
        4
    );

    // Ruedas

    ctx.fillStyle = "#111";

    ctx.fillRect(
        -24,
        -20,
        7,
        17
    );

    ctx.fillRect(
        17,
        -20,
        7,
        17
    );

    ctx.fillRect(
        -24,
        30,
        7,
        17
    );

    ctx.fillRect(
        17,
        30,
        7,
        17
    );

    ctx.restore();

}


// ============================================================
// CONCESIONARIOS
// ============================================================

let dealershipPanel = null;

function createDealershipPanel() {

    if (dealershipPanel) return;

    dealershipPanel = document.createElement("div");

    dealershipPanel.id = "dealershipPanel";

    dealershipPanel.style.position = "fixed";
    dealershipPanel.style.left = "50%";
    dealershipPanel.style.top = "50%";
    dealershipPanel.style.transform = "translate(-50%, -50%)";
    dealershipPanel.style.width = "700px";
    dealershipPanel.style.maxWidth = "90vw";
    dealershipPanel.style.maxHeight = "80vh";
    dealershipPanel.style.overflowY = "auto";
    dealershipPanel.style.background = "#151515";
    dealershipPanel.style.color = "white";
    dealershipPanel.style.padding = "25px";
    dealershipPanel.style.borderRadius = "18px";
    dealershipPanel.style.zIndex = "500";
    dealershipPanel.style.fontFamily = "Arial";

    document.body.appendChild(dealershipPanel);

}

function openDealership() {

    createDealershipPanel();

    dealershipPanel.style.display = "block";

    renderDealership();

}

function renderDealership() {

    dealershipPanel.innerHTML = `
        <h1>🏢 CONCESIONARIOS</h1>

        <p>
            Dinero disponible:
            <b>${game.money.toLocaleString()} €</b>
        </p>

        <hr>

        <h2>🚛 Camiones</h2>

        <div id="truckShop"></div>

        <hr>

        <h2>📦 Remolques</h2>

        <div id="trailerShop"></div>

        <br>

        <button
            onclick="closeDealership()"
            style="
                padding:12px 25px;
                font-size:18px;
                cursor:pointer;
            "
        >
            Cerrar
        </button>
    `;

    const truckShop =
        document.getElementById("truckShop");

    trucks.forEach(function (truck, index) {

        const owned =
            index === game.selectedTruck;

        const button = document.createElement("button");

        button.style.display = "block";
        button.style.width = "100%";
        button.style.margin = "8px 0";
        button.style.padding = "12px";
        button.style.textAlign = "left";
        button.style.cursor = "pointer";

        if (owned) {

            button.innerHTML =
                `✅ ${truck.name} — ${truck.power} — ACTUAL`;

        } else {

            button.innerHTML =
                `🚛 ${truck.name} — ${truck.power} — ${truck.price.toLocaleString()} €`;

        }

        button.onclick = function () {

            buyTruck(index);

        };

        truckShop.appendChild(button);

    });


    const trailerShop =
        document.getElementById("trailerShop");

    trailers.forEach(function (trailer, index) {

        const owned =
            index === game.selectedTrailer;

        const button = document.createElement("button");

        button.style.display = "block";
        button.style.width = "100%";
        button.style.margin = "8px 0";
        button.style.padding = "12px";
        button.style.textAlign = "left";
        button.style.cursor = "pointer";

        if (owned) {

            button.innerHTML =
                `✅ ${trailer.name} — ACTUAL`;

        } else {

            button.innerHTML =
                `📦 ${trailer.name} — ${trailer.cargo} — ${trailer.price.toLocaleString()} €`;

        }

        button.onclick = function () {

            buyTrailer(index);

        };

        trailerShop.appendChild(button);

    });

}


// ============================================================
// COMPRAR CAMIÓN
// ============================================================

function buyTruck(index) {

    const truck = trucks[index];

    if (index === game.selectedTruck) {

        alert("Ya estás utilizando este camión.");

        return;

    }

    if (game.money < truck.price) {

        alert(
            "No tienes suficiente dinero para comprar este camión."
        );

        return;

    }

    game.money -= truck.price;

    game.selectedTruck = index;

    game.speed = 0;

    alert(
        "¡Has comprado el " +
        truck.name +
        "!"
    );

    renderDealership();

}


// ============================================================
// COMPRAR REMOLQUE
// ============================================================

function buyTrailer(index) {

    const trailer = trailers[index];

    if (index === game.selectedTrailer) {

        alert("Ya estás utilizando este remolque.");

        return;

    }

    if (game.money < trailer.price) {

        alert(
            "No tienes suficiente dinero para comprar este remolque."
        );

        return;

    }

    game.money -= trailer.price;

    game.selectedTrailer = index;

    alert(
        "¡Has comprado el remolque " +
        trailer.name +
        "!"
    );

    renderDealership();

}


// ============================================================
// CERRAR CONCESIONARIO
// ============================================================

function closeDealership() {

    if (dealershipPanel) {

        dealershipPanel.style.display = "none";

    }

}


// ============================================================
// CERRAR PANELES
// ============================================================

function closePanels() {

    closeDealership();

    mapVisible = false;

}


// ============================================================
// CARRETERAS
// ============================================================

function drawRoads() {

    ctx.strokeStyle = "#777";

    ctx.lineWidth = 80;

    const roadPairs = [

        [0, 450, 1000, 450],
        [450, 0, 450, 1000],
        [300, 720, 790, 360],
        [450, 450, 690, 500],
        [450, 450, 440, 230],
        [440, 230, 500, 210],
        [440, 230, 610, 330]

    ];

    for (const road of roadPairs) {

        ctx.beginPath();

        ctx.moveTo(
            road[0],
            road[1]
        );

        ctx.lineTo(
            road[2],
            road[3]
        );

        ctx.stroke();

    }

    // Líneas centrales

    ctx.strokeStyle = "#e8d45a";

    ctx.lineWidth = 3;

    for (const road of roadPairs) {

        ctx.beginPath();

        ctx.moveTo(
            road[0],
            road[1]
        );

        ctx.lineTo(
            road[2],
            road[3]
        );

        ctx.stroke();

    }

}


// ============================================================
// DIBUJAR MUNDO
// ============================================================

function drawWorld() {

    ctx.fillStyle = "#78a85a";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.save();

    ctx.translate(
        canvas.width / 2 - player.x,
        canvas.height / 2 - player.y
    );

    // Terreno

    ctx.fillStyle = "#7da85d";

    ctx.fillRect(
        -1500,
        -1000,
        3000,
        2500
    );

    // Carreteras

    drawRoads();

    // Ciudades

    for (const city of cities) {

        ctx.fillStyle = "#d33";

        ctx.beginPath();

        ctx.arc(
            city.x,
            city.y,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "white";

        ctx.font = "14px Arial";

        ctx.fillText(
            city.name,
            city.x + 10,
            city.y
        );

    }

    // Concesionarios

    for (const dealer of dealerships) {

        ctx.fillStyle = "#00e676";

        ctx.fillRect(
            dealer.x - 10,
            dealer.y - 10,
            20,
            20
        );

        ctx.fillStyle = "white";

        ctx.font = "13px Arial";

        ctx.fillText(
            "🏢",
            dealer.x - 7,
            dealer.y + 5
        );

    }

    // CAMIÓN DEL JUGADOR
    // Esto hace que siempre se dibuje

    drawTruck(
        player.x,
        player.y,
        player.angle
    );

    ctx.restore();

}


// ============================================================
// BUCLE PRINCIPAL
// ============================================================

function gameLoop() {

    if (!game.paused) {

        updateTruck();

        updateLocation();

        updateJob();

    }

    drawWorld();

    drawMap();

    updateHUD();

    requestAnimationFrame(gameLoop);

}


// ============================================================
// INICIO
// ============================================================

function startGame() {

    // Colocar el camión en Madrid
    player.x = 450;
    player.y = 450;
    player.angle = 0;

    // Velocidad inicial
    game.speed = 0;

    // Marcha inicial
    game.gear = 1;

    // Combustible
    game.fuel = 100;

    // Carretera inicial
    game.roadName = "A-6";

    // Ciudad inicial
    game.location = "Madrid";

    // Primer trabajo
    startRandomJob();

    // Iniciar juego
    gameLoop();

}


// ============================================================
// ARRANCAR CUANDO EL HTML ESTÉ CARGADO
// ============================================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        startGame
    );

} else {

    startGame();

}

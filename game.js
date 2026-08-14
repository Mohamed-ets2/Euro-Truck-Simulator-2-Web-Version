"use strict";

/*
============================================================
 TRUCK DRIVER - GAME.JS COMPLETO
============================================================

 CONTROLES
 -----------------------------------------------------------
 W / S       Acelerar / frenar
 A / D       Girar
 + / =       Subir marcha
 -           Bajar marcha
 B           Marcha atrás
 R           Repostar
 N           Nuevo trabajo/destino
 M           Mapa completo
 L           Luces
 P           Pausar
 ESC         Cerrar mapa / menú

 FUNCIONES
 -----------------------------------------------------------
 - Camión
 - Física básica
 - 8 marchas
 - Marcha atrás
 - RPM
 - Combustible
 - Daños
 - Dinero
 - Trabajos
 - Ciudades
 - Pueblos
 - Autopistas
 - Autovías
 - Nacionales
 - Secundarias
 - Carreteras de montaña
 - Gasolineras
 - Talleres
 - Minimapa
 - GPS
 - Límites de velocidad
 - Multas
 - Tráfico
 - Semáforos
 - Día/noche
 - Lluvia
 - HUD
============================================================
*/


// ============================================================
// CANVAS
// ============================================================

const canvas = document.getElementById("gameCanvas");

if (!canvas) {
    throw new Error(
        'No se encuentra <canvas id="gameCanvas"></canvas> en index.html'
    );
}

const ctx = canvas.getContext("2d");

if (!ctx) {
    throw new Error("No se pudo obtener el contexto 2D.");
}


// ============================================================
// RESOLUCIÓN
// ============================================================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


// ============================================================
// TECLADO
// ============================================================

const keys = Object.create(null);

window.addEventListener("keydown", function (event) {

    const key = event.key.toLowerCase();

    keys[key] = true;

    if (
        [
            "w",
            "a",
            "s",
            "d",
            "r",
            "b",
            "m",
            "n",
            "l",
            "p",
            "+",
            "=",
            "-",
            "escape"
        ].includes(key)
    ) {
        event.preventDefault();
    }

    if (event.repeat) {
        return;
    }

    if (key === "+" || key === "=") {
        changeGear(1);
    }

    if (key === "-") {
        changeGear(-1);
    }

    if (key === "b") {
        toggleReverse();
    }

    if (key === "r") {
        refuel();
    }

    if (key === "m") {
        fullMap = !fullMap;
    }

    if (key === "n") {
        if (!job.active) {
            createRandomJob();
        }
    }

    if (key === "l") {
        lightsOn = !lightsOn;
    }

    if (key === "p") {
        paused = !paused;
        showMessage(
            paused ? "JUEGO PAUSADO" : "JUEGO CONTINUADO"
        );
    }

    if (key === "escape") {
        fullMap = false;
    }
});


window.addEventListener("keyup", function (event) {

    keys[event.key.toLowerCase()] = false;
});


// ============================================================
// MUNDO
// ============================================================

const WORLD_WIDTH = 10000;
const WORLD_HEIGHT = 7500;


// ============================================================
// CÁMARA
// ============================================================

const camera = {
    x: 5000,
    y: 3750
};


// ============================================================
// CAMIÓN
// ============================================================

const truck = {

    x: 5000,
    y: 3750,

    angle: 0,

    speed: 0,

    gear: 1,

    reverse: false,

    rpm: 800,

    fuel: 100,

    fuelCapacity: 100,

    damage: 0,

    maxDamage: 100,

    emptyWeight: 8000,

    cargoWeight: 0,

    maxSpeed: 130,

    speedLimiter: 130,

    brakePower: 1.2,

    engineBrake: 0.018,

    steering: 0.035
};


// ============================================================
// MARCHAS
// ============================================================

const gears = {

    1: {
        maxSpeed: 18,
        acceleration: 0.85
    },

    2: {
        maxSpeed: 32,
        acceleration: 0.70
    },

    3: {
        maxSpeed: 48,
        acceleration: 0.58
    },

    4: {
        maxSpeed: 65,
        acceleration: 0.46
    },

    5: {
        maxSpeed: 82,
        acceleration: 0.36
    },

    6: {
        maxSpeed: 98,
        acceleration: 0.29
    },

    7: {
        maxSpeed: 115,
        acceleration: 0.23
    },

    8: {
        maxSpeed: 130,
        acceleration: 0.18
    }
};


// ============================================================
// ECONOMÍA
// ============================================================

let money = 25000;


// ============================================================
// CARGA
// ============================================================

const cargo = {

    name: "Sin carga",

    weight: 0,

    loaded: false
};


// ============================================================
// MAPA
// ============================================================

const roads = [];
const cities = [];
const villages = [];
const pois = [];
const traffic = [];


// ============================================================
// CARRETERAS
// ============================================================

function addRoad(name, type, points, width = 45) {

    roads.push({

        name,
        type,
        points,
        width
    });
}


// ============================================================
// CIUDADES
// ============================================================

function addCity(name, x, y, size = 180) {

    cities.push({

        name,
        x,
        y,
        size
    });
}


// ============================================================
// PUEBLOS
// ============================================================

function addVillage(name, x, y) {

    villages.push({

        name,
        x,
        y
    });
}


// ============================================================
// PUNTOS DE INTERÉS
// ============================================================

function addPOI(name, type, x, y) {

    pois.push({

        name,
        type,
        x,
        y
    });
}


// ============================================================
// CREACIÓN DEL MAPA
// ============================================================

function buildMap() {

    roads.length = 0;
    cities.length = 0;
    villages.length = 0;
    pois.length = 0;

    // --------------------------------------------------------
    // CIUDADES
    // --------------------------------------------------------

    addCity("Madrid", 5000, 3750, 280);
    addCity("Toledo", 3900, 4700, 180);
    addCity("Valencia", 7900, 3900, 240);
    addCity("Cuenca", 6500, 4700, 150);
    addCity("Guadalajara", 6000, 2700, 150);
    addCity("Zaragoza", 8300, 1700, 230);
    addCity("Segovia", 3700, 2200, 140);
    addCity("Ávila", 2500, 3400, 150);

    // --------------------------------------------------------
    // PUEBLOS
    // --------------------------------------------------------

    addVillage("Alcalá", 5550, 3000);
    addVillage("Aranjuez", 4500, 4300);
    addVillage("Tarancón", 5500, 4400);
    addVillage("Ocaña", 4300, 5000);
    addVillage("Medina", 3100, 2500);
    addVillage("Sacedón", 6500, 3300);
    addVillage("Molina", 7000, 2700);
    addVillage("Requena", 7200, 4600);

    // --------------------------------------------------------
    // AUTOPISTAS
    // --------------------------------------------------------

    addRoad(
        "A-1",
        "autopista",
        [
            { x: 5000, y: 3750 },
            { x: 4700, y: 3200 },
            { x: 4200, y: 2600 },
            { x: 3700, y: 2200 },
            { x: 3100, y: 1800 }
        ],
        80
    );

    addRoad(
        "A-2",
        "autopista",
        [
            { x: 5000, y: 3750 },
            { x: 5800, y: 3000 },
            { x: 6800, y: 2400 },
            { x: 7600, y: 1900 },
            { x: 8300, y: 1700 }
        ],
        80
    );

    addRoad(
        "A-3",
        "autopista",
        [
            { x: 5000, y: 3750 },
            { x: 5900, y: 3800 },
            { x: 6800, y: 3900 },
            { x: 7900, y: 3900 }
        ],
        80
    );

    // --------------------------------------------------------
    // AUTOVÍAS
    // --------------------------------------------------------

    addRoad(
        "A-4",
        "autovia",
        [
            { x: 5000, y: 3750 },
            { x: 4900, y: 4100 },
            { x: 4500, y: 4300 },
            { x: 3900, y: 4700 }
        ],
        65
    );

    addRoad(
        "A-40",
        "autovia",
        [
            { x: 3900, y: 4700 },
            { x: 4700, y: 4800 },
            { x: 5600, y: 4800 },
            { x: 6500, y: 4700 }
        ],
        65
    );

    // --------------------------------------------------------
    // NACIONALES
    // --------------------------------------------------------

    addRoad(
        "N-320",
        "nacional",
        [
            { x: 5000, y: 3750 },
            { x: 5400, y: 3400 },
            { x: 6000, y: 2700 },
            { x: 6500, y: 3300 },
            { x: 7000, y: 2700 }
        ],
        48
    );

    addRoad(
        "N-2",
        "nacional",
        [
            { x: 3700, y: 2200 },
            { x: 4400, y: 2500 },
            { x: 5000, y: 3000 },
            { x: 6000, y: 2700 }
        ],
        48
    );

    addRoad(
        "N-330",
        "nacional",
        [
            { x: 6500, y: 4700 },
            { x: 7200, y: 4600 },
            { x: 7900, y: 3900 }
        ],
        48
    );

    // --------------------------------------------------------
    // SECUNDARIAS
    // --------------------------------------------------------

    addRoad(
        "CM-400",
        "secundaria",
        [
            { x: 3900, y: 4700 },
            { x: 4300, y: 5000 },
            { x: 5000, y: 5200 }
        ],
        35
    );

    addRoad(
        "CM-401",
        "secundaria",
        [
            { x: 5000, y: 5200 },
            { x: 5500, y: 4400 },
            { x: 6500, y: 4700 }
        ],
        35
    );

    addRoad(
        "CM-402",
        "secundaria",
        [
            { x: 6000, y: 2700 },
            { x: 5550, y: 3000 },
            { x: 5000, y: 3000 }
        ],
        35
    );

    // --------------------------------------------------------
    // MONTAÑA
    // --------------------------------------------------------

    addRoad(
        "M-10",
        "montaña",
        [
            { x: 2500, y: 3400 },
            { x: 2900, y: 3000 },
            { x: 3100, y: 2500 },
            { x: 3700, y: 2200 }
        ],
        30
    );

    // --------------------------------------------------------
    // SERVICIOS
    // --------------------------------------------------------

    addPOI(
        "Gasolinera Madrid",
        "gasolinera",
        5200,
        3900
    );

    addPOI(
        "Gasolinera Toledo",
        "gasolinera",
        4100,
        4500
    );

    addPOI(
        "Gasolinera Valencia",
        "gasolinera",
        7600,
        4100
    );

    addPOI(
        "Taller Madrid",
        "taller",
        4800,
        3500
    );

    addPOI(
        "Taller Zaragoza",
        "taller",
        8100,
        1900
    );

    addPOI(
        "Área de descanso",
        "descanso",
        6200,
        3200
    );
}

buildMap();


// ============================================================
// TRÁFICO
// ============================================================

function createTraffic() {

    traffic.length = 0;

    const colors = [
        "#d22",
        "#eee",
        "#333",
        "#168",
        "#c90",
        "#6a6"
    ];

    for (let i = 0; i < 28; i++) {

        const road =
            roads[
                Math.floor(
                    Math.random() * roads.length
                )
            ];

        const point =
            road.points[
                Math.floor(
                    Math.random() *
                    road.points.length
                )
            ];

        traffic.push({

            x: point.x + (Math.random() * 60 - 30),

            y: point.y + (Math.random() * 60 - 30),

            angle: Math.random() * Math.PI * 2,

            speed: 0.5 + Math.random() * 1.2,

            color:
                colors[
                    Math.floor(
                        Math.random() * colors.length
                    )
                ]
        });
    }
}

createTraffic();


// ============================================================
// TRABAJOS
// ============================================================

const jobs = [

    {
        cargo: "Frigorífico",
        weight: 18000,
        from: "Madrid",
        to: "Valencia",
        reward: 4200
    },

    {
        cargo: "Maquinaria",
        weight: 22000,
        from: "Zaragoza",
        to: "Madrid",
        reward: 5100
    },

    {
        cargo: "Muebles",
        weight: 12000,
        from: "Toledo",
        to: "Cuenca",
        reward: 2800
    },

    {
        cargo: "Productos agrícolas",
        weight: 16000,
        from: "Valencia",
        to: "Madrid",
        reward: 3900
    },

    {
        cargo: "Material industrial",
        weight: 24000,
        from: "Guadalajara",
        to: "Toledo",
        reward: 3600
    },

    {
        cargo: "Electrónica",
        weight: 10000,
        from: "Segovia",
        to: "Zaragoza",
        reward: 4400
    }
];


const job = {

    active: false,

    cargo: "",

    weight: 0,

    from: "",

    to: "",

    reward: 0,

    destination: null,

    distance: 0
};


function findCity(name) {

    return cities.find(
        city => city.name === name
    );
}


function createRandomJob() {

    const selected =
        jobs[
            Math.floor(
                Math.random() * jobs.length
            )
        ];

    const destination =
        findCity(selected.to);

    if (!destination) {
        return;
    }

    job.active = true;

    job.cargo = selected.cargo;

    job.weight = selected.weight;

    job.from = selected.from;

    job.to = selected.to;

    job.reward = selected.reward;

    job.destination = destination;

    job.distance = distance(
        truck.x,
        truck.y,
        destination.x,
        destination.y
    );

    truck.cargoWeight =
        selected.weight;

    cargo.name =
        selected.cargo;

    cargo.weight =
        selected.weight;

    cargo.loaded = true;

    showMessage(
        "NUEVO TRABAJO: " +
        selected.cargo +
        " → " +
        selected.to
    );
}


function updateJob() {

    if (!job.active) {
        return;
    }

    if (!job.destination) {
        return;
    }

    job.distance =
        distance(
            truck.x,
            truck.y,
            job.destination.x,
            job.destination.y
        );

    if (job.distance < 150) {

        completeJob();
    }
}


function completeJob() {

    money += job.reward;

    showMessage(
        "ENTREGA COMPLETADA +€" +
        job.reward
    );

    job.active = false;

    job.destination = null;

    truck.cargoWeight = 0;

    cargo.name = "Sin carga";

    cargo.weight = 0;

    cargo.loaded = false;
}


// ============================================================
// FUNCIONES GENERALES
// ============================================================

function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}


function distance(x1, y1, x2, y2) {

    return Math.hypot(
        x2 - x1,
        y2 - y1
    );
}


function totalWeight() {

    return (
        truck.emptyWeight +
        truck.cargoWeight
    );
}


function weightFactor() {

    return clamp(
        8000 / totalWeight(),
        0.25,
        1
    );
}


// ============================================================
// CAMBIAR MARCHA
// ============================================================

function changeGear(direction) {

    if (truck.reverse) {

        showMessage(
            "Pulsa B para quitar la marcha atrás"
        );

        return;
    }

    if (Math.abs(truck.speed) > 8) {

        showMessage(
            "Reduce la velocidad para cambiar"
        );

        return;
    }

    truck.gear += direction;

    truck.gear =
        clamp(
            truck.gear,
            1,
            8
        );

    showMessage(
        "MARCHA " +
        truck.gear
    );
}


// ============================================================
// MARCHA ATRÁS
// ============================================================

function toggleReverse() {

    if (truck.speed > 3) {

        showMessage(
            "Detén el camión para poner R"
        );

        return;
    }

    truck.reverse =
        !truck.reverse;

    if (truck.reverse) {

        truck.gear = 0;

        showMessage(
            "MARCHA ATRÁS R"
        );

    } else {

        truck.gear = 1;

        showMessage(
            "MARCHA 1"
        );
    }
}


// ============================================================
// MOTOR
// ============================================================

function updateEngine() {

    if (truck.fuel <= 0) {

        truck.speed *= 0.985;

        return;
    }

    if (truck.reverse) {

        if (keys["w"]) {

            truck.speed +=
                0.35 *
                weightFactor();
        }

        return;
    }

    const currentGear =
        gears[truck.gear];

    if (!currentGear) {
        return;
    }

    if (keys["w"]) {

        let acceleration =
            currentGear.acceleration *
            weightFactor();

        if (truck.rpm > 2100) {
            acceleration *= 0.55;
        }

        if (truck.rpm < 900) {
            acceleration *= 0.55;
        }

        truck.speed +=
            acceleration;
    }
}


// ============================================================
// FRENADO
// ============================================================

function updateBrakes() {

    if (!keys["s"]) {
        return;
    }

    truck.speed -=
        truck.brakePower;

    truck.speed -=
        truck.engineBrake *
        (1 + truck.gear * 0.25);

    if (truck.speed < 0) {
        truck.speed = 0;
    }
}


// ============================================================
// RESISTENCIA
// ============================================================

function updateResistance() {

    if (!keys["w"] && !keys["s"]) {

        truck.speed *= 0.993;

        truck.speed -=
            truck.engineBrake;
    }

    if (truck.speed < 0.05) {
        truck.speed = 0;
    }
}


// ============================================================
// LÍMITE POR MARCHA
// ============================================================

function updateSpeedLimit() {

    let maximum;

    if (truck.reverse) {

        maximum = 25;

    } else {

        maximum =
            gears[truck.gear].maxSpeed;
    }

    maximum =
        Math.min(
            maximum,
            truck.speedLimiter
        );

    if (truck.speed > maximum) {

        truck.speed = maximum;
    }
}


// ============================================================
// DIRECCIÓN
// ============================================================

function updateSteering() {

    if (truck.speed <= 0.1) {
        return;
    }

    const factor =
        clamp(
            truck.speed / 80,
            0,
            1
        );

    const steering =
        truck.steering *
        (1 - factor * 0.45);

    if (keys["a"]) {

        truck.angle -=
            steering;
    }

    if (keys["d"]) {

        truck.angle +=
            steering;
    }
}


// ============================================================
// MOVIMIENTO
// ============================================================

function updateMovement() {

    let movement =
        truck.speed * 0.24;

    if (truck.reverse) {
        movement *= -1;
    }

    truck.x +=
        Math.sin(truck.angle) *
        movement;

    truck.y -=
        Math.cos(truck.angle) *
        movement;
}


// ============================================================
// LÍMITES DEL MAPA
// ============================================================

function keepInsideWorld() {

    const margin = 100;

    if (truck.x < margin) {

        truck.x = margin;

        registerDamage(0.2);
    }

    if (
        truck.x >
        WORLD_WIDTH - margin
    ) {

        truck.x =
            WORLD_WIDTH - margin;

        registerDamage(0.2);
    }

    if (truck.y < margin) {

        truck.y = margin;

        registerDamage(0.2);
    }

    if (
        truck.y >
        WORLD_HEIGHT - margin
    ) {

        truck.y =
            WORLD_HEIGHT - margin;

        registerDamage(0.2);
    }
}


// ============================================================
// RPM
// ============================================================

function updateRPM() {

    let target;

    if (truck.reverse) {

        target =
            800 +
            truck.speed * 35;

    } else {

        const gear =
            gears[truck.gear];

        const ratio =
            truck.speed /
            gear.maxSpeed;

        target =
            750 +
            ratio * 1450;

        if (keys["w"]) {
            target += 120;
        }
    }

    target =
        clamp(
            target,
            700,
            2200
        );

    truck.rpm +=
        (target - truck.rpm) *
        0.1;
}


// ============================================================
// COMBUSTIBLE
// ============================================================

function updateFuel() {

    if (truck.speed <= 0) {
        return;
    }

    truck.fuel -=
        0.000035 *
        truck.speed *
        (totalWeight() / 8000);

    truck.fuel =
        clamp(
            truck.fuel,
            0,
            truck.fuelCapacity
        );
}


// ============================================================
// DAÑOS
// ============================================================

function registerDamage(amount) {

    truck.damage += amount;

    truck.damage =
        clamp(
            truck.damage,
            0,
            truck.maxDamage
        );
}


// ============================================================
// SERVICIOS
// ============================================================

function nearestPOI(type) {

    let nearest = null;

    let best = Infinity;

    for (const poi of pois) {

        if (poi.type !== type) {
            continue;
        }

        const d =
            distance(
                truck.x,
                truck.y,
                poi.x,
                poi.y
            );

        if (d < best) {

            best = d;

            nearest = poi;
        }
    }

    return nearest;
}


function refuel() {

    const station =
        nearestPOI("gasolinera");

    if (!station) {
        return;
    }

    const d =
        distance(
            truck.x,
            truck.y,
            station.x,
            station.y
        );

    if (d < 180) {

        const cost =
            Math.round(
                (100 - truck.fuel) *
                1.8
            );

        if (money < cost) {

            showMessage(
                "NO TIENES DINERO SUFICIENTE"
            );

            return;
        }

        money -= cost;

        truck.fuel =
            truck.fuelCapacity;

        showMessage(
            "⛽ REPOSTAJE €" +
            cost
        );

    } else {

        showMessage(
            "Acércate a una gasolinera"
        );
    }
}


// ============================================================
// CARRETERA MÁS CERCANA
// ============================================================

let currentRoad = null;

function nearestRoad() {

    let closest = null;

    let best = Infinity;

    for (const road of roads) {

        for (const point of road.points) {

            const d =
                distance(
                    truck.x,
                    truck.y,
                    point.x,
                    point.y
                );

            if (d < best) {

                best = d;

                closest = road;
            }
        }
    }

    return closest;
}


function updateCurrentRoad() {

    currentRoad =
        nearestRoad();
}


// ============================================================
// LÍMITE DE CARRETERA
// ============================================================

function roadSpeedLimit(road) {

    if (!road) {
        return 50;
    }

    switch (road.type) {

        case "autopista":
            return 120;

        case "autovia":
            return 110;

        case "nacional":
            return 90;

        case "secundaria":
            return 80;

        case "montaña":
            return 60;

        default:
            return 50;
    }
}


// ============================================================
// MULTAS
// ============================================================

let lastFine = 0;
let fines = 0;

function updateFines() {

    const limit =
        roadSpeedLimit(
            currentRoad
        );

    if (
        truck.speed >
        limit + 15
    ) {

        const now =
            Date.now();

        if (
            now - lastFine >
            12000
        ) {

            let fine = 50;

            if (
                truck.speed >
                limit + 30
            ) {
                fine = 150;
            }

            if (
                truck.speed >
                limit + 50
            ) {
                fine = 350;
            }

            money -= fine;

            fines += fine;

            lastFine = now;

            showMessage(
                "🚓 MULTA -€" +
                fine
            );
        }
    }
}


// ============================================================
// TRÁFICO
// ============================================================

function updateTraffic() {

    for (const car of traffic) {

        car.x +=
            Math.sin(car.angle) *
            car.speed;

        car.y -=
            Math.cos(car.angle) *
            car.speed;

        if (
            car.x < 0 ||
            car.x > WORLD_WIDTH ||
            car.y < 0 ||
            car.y > WORLD_HEIGHT
        ) {

            car.x =
                Math.random() *
                WORLD_WIDTH;

            car.y =
                Math.random() *
                WORLD_HEIGHT;
        }
    }
}


// ============================================================
// CÁMARA
// ============================================================

function updateCamera() {

    camera.x +=
        (truck.x - camera.x) *
        0.08;

    camera.y +=
        (truck.y - camera.y) *
        0.08;
}


// ============================================================
// COORDENADAS
// ============================================================

function worldToScreen(x, y) {

    return {

        x:
            x -
            camera.x +
            canvas.width / 2,

        y:
            y -
            camera.y +
            canvas.height / 2
    };
}


// ============================================================
// FONDO
// ============================================================

let timeOfDay = 12;

let rain = false;

let lightsOn = false;

function updateEnvironment() {

    timeOfDay += 0.002;

    if (timeOfDay >= 24) {
        timeOfDay = 0;
    }

    if (
        Math.random() < 0.00008
    ) {
        rain = !rain;

        showMessage(
            rain ?
            "🌧️ COMIENZA A LLOVER" :
            "☀️ DEJA DE LLOVER"
        );
    }
}


// ============================================================
// DIBUJAR FONDO
// ============================================================

function drawWorld() {

    const hour =
        timeOfDay;

    let brightness = 1;

    if (
        hour < 7 ||
        hour > 20
    ) {
        brightness = 0.35;
    }

    if (
        hour >= 7 &&
        hour <= 9
    ) {
        brightness = 0.65;
    }

    if (
        hour >= 18 &&
        hour <= 20
    ) {
        brightness = 0.55;
    }

    ctx.fillStyle =
        brightness < 0.5 ?
        "#17212a" :
        "#64845a";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // campos

    ctx.globalAlpha = 0.15;

    for (
        let x = 0;
        x < canvas.width;
        x += 100
    ) {

        for (
            let y = 0;
            y < canvas.height;
            y += 100
        ) {

            ctx.fillStyle =
                "#8fa66e";

            ctx.fillRect(
                x,
                y,
                50,
                50
            );
        }
    }

    ctx.globalAlpha = 1;
}


// ============================================================
// DIBUJAR CARRETERAS
// ============================================================

function drawRoads() {

    for (const road of roads) {

        const points =
            road.points.map(
                p =>
                    worldToScreen(
                        p.x,
                        p.y
                    )
            );

        if (points.length < 2) {
            continue;
        }

        // carretera

        ctx.strokeStyle =
            road.type === "autopista"
                ? "#343434"
                : road.type === "autovia"
                ? "#3e3e3e"
                : road.type === "nacional"
                ? "#484848"
                : road.type === "secundaria"
                ? "#555"
                : "#666";

        ctx.lineWidth =
            road.width;

        ctx.lineCap =
            "round";

        ctx.beginPath();

        ctx.moveTo(
            points[0].x,
            points[0].y
        );

        for (
            let i = 1;
            i < points.length;
            i++
        ) {

            ctx.lineTo(
                points[i].x,
                points[i].y
            );
        }

        ctx.stroke();

        // línea central

        ctx.strokeStyle =
            "#e7d36b";

        ctx.lineWidth = 3;

        if (
            road.type === "autopista" ||
            road.type === "autovia"
        ) {

            ctx.setLineDash(
                [25, 18]
            );

        } else {

            ctx.setLineDash(
                [15, 15]
            );
        }

        ctx.beginPath();

        ctx.moveTo(
            points[0].x,
            points[0].y
        );

        for (
            let i = 1;
            i < points.length;
            i++
        ) {

            ctx.lineTo(
                points[i].x,
                points[i].y
            );
        }

        ctx.stroke();

        ctx.setLineDash([]);
    }
}


// ============================================================
// CIUDADES
// ============================================================

function drawCities() {

    for (const city of cities) {

        const p =
            worldToScreen(
                city.x,
                city.y
            );

        if (
            p.x < -400 ||
            p.x > canvas.width + 400 ||
            p.y < -400 ||
            p.y > canvas.height + 400
        ) {
            continue;
        }

        ctx.fillStyle =
            "rgba(45,45,45,0.8)";

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            Math.max(
                8,
                city.size / 10
            ),
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "bold 17px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            city.name,
            p.x,
            p.y -
            Math.max(
                15,
                city.size / 10
            )
        );
    }

    ctx.textAlign =
        "left";
}


// ============================================================
// PUEBLOS
// ============================================================

function drawVillages() {

    for (const village of villages) {

        const p =
            worldToScreen(
                village.x,
                village.y
            );

        if (
            p.x < -100 ||
            p.x > canvas.width + 100 ||
            p.y < -100 ||
            p.y > canvas.height + 100
        ) {
            continue;
        }

        ctx.fillStyle =
            "#dedede";

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "13px Arial";

        ctx.fillText(
            village.name,
            p.x + 8,
            p.y + 4
        );
    }
}


// ============================================================
// POI
// ============================================================

function drawPOIs() {

    for (const poi of pois) {

        const p =
            worldToScreen(
                poi.x,
                poi.y
            );

        let symbol = "●";

        if (poi.type === "gasolinera") {
            symbol = "⛽";
        }

        if (poi.type === "taller") {
            symbol = "🔧";
        }

        if (poi.type === "descanso") {
            symbol = "🅿";
        }

        ctx.font =
            "18px Arial";

        ctx.fillStyle =
            "#fff";

        ctx.fillText(
            symbol,
            p.x - 8,
            p.y
        );
    }
}


// ============================================================
// TRÁFICO EN PANTALLA
// ============================================================

function drawTraffic() {

    for (const car of traffic) {

        const p =
            worldToScreen(
                car.x,
                car.y
            );

        if (
            p.x < -50 ||
            p.x > canvas.width + 50 ||
            p.y < -50 ||
            p.y > canvas.height + 50
        ) {
            continue;
        }

        ctx.save();

        ctx.translate(
            p.x,
            p.y
        );

        ctx.rotate(
            car.angle
        );

        ctx.fillStyle =
            car.color;

        ctx.fillRect(
            -8,
            -16,
            16,
            32
        );

        ctx.fillStyle =
            "#fff";

        ctx.fillRect(
            -6,
            -13,
            12,
            7
        );

        ctx.restore();
    }
}


// ============================================================
// CAMIÓN
// ============================================================

function drawTruck() {

    const p =
        worldToScreen(
            truck.x,
            truck.y
        );

    ctx.save();

    ctx.translate(
        p.x,
        p.y
    );

    ctx.rotate(
        truck.angle
    );

    // sombra

    ctx.fillStyle =
        "rgba(0,0,0,0.3)";

    ctx.fillRect(
        -30,
        -42,
        60,
        90
    );

    // remolque

    if (cargo.loaded) {

        ctx.fillStyle =
            "#d7d7d7";

        ctx.fillRect(
            -24,
            15,
            48,
            55
        );
    }

    // cabina

    ctx.fillStyle =
        "#174c78";

    ctx.fillRect(
        -27,
        -50,
        54,
        60
    );

    // cristal

    ctx.fillStyle =
        "#7fc4df";

    ctx.fillRect(
        -20,
        -43,
        40,
        22
    );

    // ruedas

    ctx.fillStyle =
        "#111";

    ctx.fillRect(
        -35,
        -40,
        9,
        22
    );

    ctx.fillRect(
        26,
        -40,
        9,
        22
    );

    ctx.fillRect(
        -35,
        35,
        9,
        22
    );

    ctx.fillRect(
        26,
        35,
        9,
        22
    );

    // faros

    if (lightsOn) {

        ctx.fillStyle =
            "#fff5a5";

        ctx.fillRect(
            -18,
            -53,
            12,
            7
        );

        ctx.fillRect(
            6,
            -53,
            12,
            7
        );
    }

    ctx.restore();
}


// ============================================================
// MINIMAPA
// ============================================================

function drawMinimap() {

    const size = 230;

    const x =
        canvas.width -
        size -
        20;

    const y = 20;

    ctx.fillStyle =
        "rgba(10,15,20,0.9)";

    ctx.fillRect(
        x,
        y,
        size,
        size
    );

    ctx.strokeStyle =
        "#777";

    ctx.strokeRect(
        x,
        y,
        size,
        size
    );

    const sx =
        size /
        WORLD_WIDTH;

    const sy =
        size /
        WORLD_HEIGHT;

    // carreteras

    for (const road of roads) {

        ctx.beginPath();

        for (
            let i = 0;
            i < road.points.length;
            i++
        ) {

            const px =
                x +
                road.points[i].x *
                sx;

            const py =
                y +
                road.points[i].y *
                sy;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth = 2;

        ctx.stroke();
    }

    // ciudades

    for (const city of cities) {

        const px =
            x +
            city.x *
            sx;

        const py =
            y +
            city.y *
            sy;

        ctx.fillStyle =
            "#fff";

        ctx.beginPath();

        ctx.arc(
            px,
            py,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    // destino

    if (
        job.active &&
        job.destination
    ) {

        const dx =
            x +
            job.destination.x *
            sx;

        const dy =
            y +
            job.destination.y *
            sy;

        ctx.fillStyle =
            "#00e5ff";

        ctx.beginPath();

        ctx.arc(
            dx,
            dy,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.strokeStyle =
            "#00e5ff";

        ctx.beginPath();

        ctx.moveTo(
            x +
            truck.x * sx,
            y +
            truck.y * sy
        );

        ctx.lineTo(
            dx,
            dy
        );

        ctx.stroke();
    }

    // camión

    const tx =
        x +
        truck.x *
        sx;

    const ty =
        y +
        truck.y *
        sy;

    ctx.fillStyle =
        "#ff3030";

    ctx.beginPath();

    ctx.arc(
        tx,
        ty,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#fff";

    ctx.font =
        "11px Arial";

    ctx.fillText(
        "MAPA",
        x + 8,
        y + 15
    );
}


// ============================================================
// MAPA COMPLETO
// ============================================================

function drawFullMap() {

    ctx.fillStyle =
        "#17251a";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const scale =
        Math.min(
            canvas.width /
                WORLD_WIDTH,
            canvas.height /
                WORLD_HEIGHT
        ) *
        0.88;

    const offsetX =
        (
            canvas.width -
            WORLD_WIDTH * scale
        ) / 2;

    const offsetY =
        (
            canvas.height -
            WORLD_HEIGHT * scale
        ) / 2;

    function mapPoint(x, y) {

        return {

            x:
                offsetX +
                x * scale,

            y:
                offsetY +
                y * scale
        };
    }

    // carreteras

    for (const road of roads) {

        ctx.beginPath();

        for (
            let i = 0;
            i < road.points.length;
            i++
        ) {

            const p =
                mapPoint(
                    road.points[i].x,
                    road.points[i].y
                );

            if (i === 0) {
                ctx.moveTo(
                    p.x,
                    p.y
                );
            } else {
                ctx.lineTo(
                    p.x,
                    p.y
                );
            }
        }

        ctx.lineWidth =
            road.type === "autopista"
                ? 7
                : road.type === "autovia"
                ? 6
                : road.type === "nacional"
                ? 4
                : 3;

        ctx.strokeStyle =
            road.type === "autopista"
                ? "#fff"
                : road.type === "autovia"
                ? "#ffcc33"
                : road.type === "nacional"
                ? "#e98b35"
                : "#aaa";

        ctx.stroke();
    }

    // ciudades

    for (const city of cities) {

        const p =
            mapPoint(
                city.x,
                city.y
            );

        ctx.fillStyle =
            "#fff";

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.font =
            "bold 16px Arial";

        ctx.fillText(
            city.name,
            p.x + 9,
            p.y - 9
        );
    }

    // pueblos

    for (const village of villages) {

        const p =
            mapPoint(
                village.x,
                village.y
            );

        ctx.fillStyle =
            "#ccc";

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.font =
            "11px Arial";

        ctx.fillText(
            village.name,
            p.x + 6,
            p.y + 4
        );
    }

    // destino

    if (
        job.active &&
        job.destination
    ) {

        const p =
            mapPoint(
                job.destination.x,
                job.destination.y
            );

        ctx.fillStyle =
            "#00e5ff";

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            12,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "bold 18px Arial";

        ctx.fillText(
            "DESTINO: " +
            job.destination.name,
            p.x + 15,
            p.y
        );
    }

    // camión

    const t =
        mapPoint(
            truck.x,
            truck.y
        );

    ctx.fillStyle =
        "#ff3333";

    ctx.beginPath();

    ctx.arc(
        t.x,
        t.y,
        8,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 20px Arial";

    ctx.fillText(
        "MAPA - ESC / M para volver",
        25,
        35
    );
}


// ============================================================
// HUD
// ============================================================

function drawHUD() {

    const limit =
        roadSpeedLimit(
            currentRoad
        );

    // panel inferior

    const hudHeight = 145;

    const hudY =
        canvas.height -
        hudHeight;

    ctx.fillStyle =
        "rgba(5,8,12,0.91)";

    ctx.fillRect(
        0,
        hudY,
        canvas.width,
        hudHeight
    );

    // velocidad

    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 45px Arial";

    ctx.fillText(
        Math.round(truck.speed),
        35,
        hudY + 55
    );

    ctx.font =
        "14px Arial";

    ctx.fillText(
        "km/h",
        115,
        hudY + 55
    );

    // límite

    ctx.fillStyle =
        "#ddd";

    ctx.font =
        "14px Arial";

    ctx.fillText(
        "LÍMITE " +
        limit +
        " km/h",
        35,
        hudY + 82
    );

    // marcha

    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 27px Arial";

    ctx.fillText(
        truck.reverse
            ? "R"
            : truck.gear,
        190,
        hudY + 55
    );

    ctx.font =
        "12px Arial";

    ctx.fillText(
        "MARCHA",
        190,
        hudY + 78
    );

    // RPM

    ctx.font =
        "bold 20px Arial";

    ctx.fillText(
        Math.round(truck.rpm) +
        " RPM",
        275,
        hudY + 55
    );

    // combustible

    ctx.fillStyle =
        "#fff";

    ctx.fillText(
        "COMBUSTIBLE",
        430,
        hudY + 30
    );

    ctx.fillStyle =
        "#333";

    ctx.fillRect(
        430,
        hudY + 40,
        160,
        15
    );

    ctx.fillStyle =
        truck.fuel < 20
            ? "#e33"
            : "#3c9";

    ctx.fillRect(
        430,
        hudY + 40,
        160 *
        (
            truck.fuel /
            truck.fuelCapacity
        ),
        15
    );

    ctx.fillStyle =
        "#fff";

    ctx.fillText(
        Math.round(
            truck.fuel
        ) +
        "%",
        600,
        hudY + 53
    );

    // dinero

    ctx.font =
        "bold 20px Arial";

    ctx.fillText(
        "€" +
        Math.round(money),
        430,
        hudY + 95
    );

    // daños

    ctx.font =
        "13px Arial";

    ctx.fillText(
        "Daños: " +
        Math.round(truck.damage) +
        "%",
        610,
        hudY + 95
    );

    // carretera

    ctx.fillText(
        currentRoad
            ? currentRoad.name
            : "Fuera de carretera",
        760,
        hudY + 30
    );

    ctx.fillText(
        currentRoad
            ? currentRoad.type.toUpperCase()
            : "",
        760,
        hudY + 52
    );

    // trabajo

    if (job.active) {

        ctx.fillStyle =
            "#00e5ff";

        ctx.font =
            "bold 15px Arial";

        ctx.fillText(
            "🧭 " +
            job.from +
            " → " +
            job.to,
            760,
            hudY + 78
        );

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "13px Arial";

        ctx.fillText(
            job.cargo +
            " | " +
            Math.round(
                job.distance / 100
            ) +
            " km",
            760,
            hudY + 100
        );

        ctx.fillText(
            "Pago: €" +
            job.reward,
            760,
            hudY + 120
        );

    } else {

        ctx.fillStyle =
            "#aaa";

        ctx.fillText(
            "Pulsa N para aceptar un trabajo",
            760,
            hudY + 85
        );
    }

    // controles

    ctx.fillStyle =
        "#999";

    ctx.font =
        "11px Arial";

    ctx.fillText(
        "W/S conducir • A/D girar • +/- marchas • B R • N trabajo • M mapa • R repostar • L luces",
        35,
        canvas.height - 12
    );
}


// ============================================================
// MENSAJES
// ============================================================

let message = "";

let messageUntil = 0;


function showMessage(text) {

    message =
        text;

    messageUntil =
        Date.now() + 3000;
}


function drawMessage() {

    if (
        Date.now() >
        messageUntil
    ) {
        return;
    }

    const width = 500;

    const x =
        canvas.width / 2 -
        width / 2;

    const y = 45;

    ctx.fillStyle =
        "rgba(0,0,0,0.82)";

    ctx.fillRect(
        x,
        y,
        width,
        50
    );

    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 17px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        message,
        canvas.width / 2,
        y + 32
    );

    ctx.textAlign =
        "left";
}


// ============================================================
// LLUVIA
// ============================================================

function drawRain() {

    if (!rain) {
        return;
    }

    ctx.strokeStyle =
        "rgba(180,210,255,0.35)";

    ctx.lineWidth = 1;

    for (
        let i = 0;
        i < 100;
        i++
    ) {

        const x =
            Math.random() *
            canvas.width;

        const y =
            Math.random() *
            canvas.height;

        ctx.beginPath();

        ctx.moveTo(
            x,
            y
        );

        ctx.lineTo(
            x - 4,
            y + 18
        );

        ctx.stroke();
    }
}


// ============================================================
// NOCHE
// ============================================================

function drawNight() {

    if (
        timeOfDay >= 7 &&
        timeOfDay <= 20
    ) {
        return;
    }

    ctx.fillStyle =
        "rgba(0,5,25,0.42)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}


// ============================================================
// ACTUALIZAR CAMIÓN
// ============================================================

function updateTruck() {

    updateEngine();

    updateBrakes();

    updateResistance();

    updateSpeedLimit();

    updateSteering();

    updateMovement();

    keepInsideWorld();

    updateRPM();

    updateFuel();
}


// ============================================================
// ACTUALIZAR TODO
// ============================================================

function updateGame() {

    updateTruck();

    updateCurrentRoad();

    updateJob();

    updateFines();

    updateTraffic();

    updateCamera();

    updateEnvironment();
}


// ============================================================
// DIBUJAR TODO
// ============================================================

function drawGame() {

    if (fullMap) {

        drawFullMap();

        return;
    }

    drawWorld();

    drawRoads();

    drawCities();

    drawVillages();

    drawPOIs();

    drawTraffic();

    drawNavigationRoute();

    drawTruck();

    drawMinimap();

    drawHUD();

    drawMessage();

    drawRain();

    drawNight();
}


// ============================================================
// NAVEGACIÓN
// ============================================================

function drawNavigationRoute() {

    if (
        !job.active ||
        !job.destination
    ) {
        return;
    }

    const start =
        worldToScreen(
            truck.x,
            truck.y
        );

    const destination =
        worldToScreen(
            job.destination.x,
            job.destination.y
        );

    ctx.save();

    ctx.strokeStyle =
        "#00e5ff";

    ctx.lineWidth = 5;

    ctx.setLineDash(
        [14, 10]
    );

    ctx.beginPath();

    ctx.moveTo(
        start.x,
        start.y
    );

    ctx.lineTo(
        destination.x,
        destination.y
    );

    ctx.stroke();

    ctx.setLineDash([]);

    ctx.fillStyle =
        "#00e5ff";

    ctx.beginPath();

    ctx.arc(
        destination.x,
        destination.y,
        10,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 15px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        job.destination.name,
        destination.x,
        destination.y - 20
    );

    ctx.textAlign =
        "left";

    ctx.restore();
}


// ============================================================
// ESTADO
// ============================================================

let fullMap = false;

let paused = false;


// ============================================================
// INICIO
// ============================================================

updateCurrentRoad();

showMessage(
    "JUEGO CARGADO - Pulsa N para conseguir un trabajo"
);


// ============================================================
// BUCLE PRINCIPAL
// ============================================================

function gameLoop() {

    if (!paused) {

        updateGame();
    }

    drawGame();

    requestAnimationFrame(
        gameLoop
    );
}


gameLoop();

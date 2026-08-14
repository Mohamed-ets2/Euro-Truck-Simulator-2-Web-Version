"use strict";

/*
============================================================
 TRUCK DRIVER
 FASE 2 - MAPA COMPLETO
============================================================

 MANTIENE:

 - Física del camión
 - Marchas 1-8
 - Marcha atrás
 - RPM
 - Frenos
 - Freno motor
 - Combustible
 - Daños
 - Peso/carga
 - HUD
 - Controles

 AÑADE:

 - Mapa grande
 - Autopistas
 - Autovías
 - Nacionales
 - Secundarias
 - Carreteras de montaña
 - Ciudades
 - Pueblos
 - Polígonos industriales
 - Gasolineras
 - Talleres
 - Áreas de descanso
 - Cruces
 - Rotondas
 - Señales
 - Nombres de lugares
 - Minimapa
 - GPS básico
============================================================
*/


// ==========================================================
// CANVAS
// ==========================================================

const canvas = document.getElementById("gameCanvas");

if (!canvas) {
    throw new Error(
        'No existe <canvas id="gameCanvas"> en index.html'
    );
}

const ctx = canvas.getContext("2d");

if (!ctx) {
    throw new Error("No se pudo crear el contexto 2D.");
}


// ==========================================================
// TAMAÑO
// ==========================================================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


// ==========================================================
// TECLADO
// ==========================================================

const keys = {
    w: false,
    s: false,
    a: false,
    d: false
};


window.addEventListener("keydown", function(event) {

    const key = event.key.toLowerCase();

    if (key === "w") keys.w = true;
    if (key === "s") keys.s = true;
    if (key === "a") keys.a = true;
    if (key === "d") keys.d = true;

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
        toggleMap();
    }

    if (
        [
            "w",
            "a",
            "s",
            "d",
            "+",
            "=",
            "-",
            "b",
            "r",
            "m"
        ].includes(key)
    ) {
        event.preventDefault();
    }

});


window.addEventListener("keyup", function(event) {

    const key = event.key.toLowerCase();

    if (key === "w") keys.w = false;
    if (key === "s") keys.s = false;
    if (key === "a") keys.a = false;
    if (key === "d") keys.d = false;

});


// ==========================================================
// MUNDO
// ==========================================================

const WORLD_WIDTH = 10000;
const WORLD_HEIGHT = 7500;


// ==========================================================
// CÁMARA
// ==========================================================

const camera = {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2
};


// ==========================================================
// CAMIÓN
// ==========================================================

const truck = {

    x: 5000,
    y: 3750,

    angle: 0,

    speed: 0,

    maxSpeed: 130,

    brakePower: 1.35,

    engineBrake: 0.025,

    steering: 0.035,

    fuel: 100,

    fuelCapacity: 100,

    damage: 0,

    maxDamage: 100,

    emptyWeight: 8000,

    cargoWeight: 0,

    gear: 1,

    reverse: false,

    rpm: 800,

    minRPM: 700,

    maxRPM: 2200,

    idleRPM: 800,

    speedLimiter: 130

};


// ==========================================================
// CARGA
// ==========================================================

const cargo = {
    name: "Sin carga",
    weight: 0,
    loaded: false
};


// ==========================================================
// MARCHAS
// ==========================================================

const gears = {

    1: {
        maxSpeed: 18,
        acceleration: 0.95
    },

    2: {
        maxSpeed: 32,
        acceleration: 0.80
    },

    3: {
        maxSpeed: 48,
        acceleration: 0.65
    },

    4: {
        maxSpeed: 65,
        acceleration: 0.52
    },

    5: {
        maxSpeed: 82,
        acceleration: 0.42
    },

    6: {
        maxSpeed: 98,
        acceleration: 0.34
    },

    7: {
        maxSpeed: 115,
        acceleration: 0.28
    },

    8: {
        maxSpeed: 130,
        acceleration: 0.22
    }

};


// ==========================================================
// UTILIDADES
// ==========================================================

function distance(x1, y1, x2, y2) {

    return Math.hypot(
        x2 - x1,
        y2 - y1
    );
}


function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}


// ==========================================================
// PESO
// ==========================================================

function getTotalWeight() {

    return (
        truck.emptyWeight +
        truck.cargoWeight
    );
}


function getWeightFactor() {

    const weight = getTotalWeight();

    const factor =
        8000 / weight;

    return clamp(
        factor,
        0.25,
        1
    );
}


// ==========================================================
// MARCHAS
// ==========================================================

function changeGear(direction) {

    if (truck.reverse) {

        showMessage(
            "Pulsa B para salir de R."
        );

        return;
    }

    truck.gear += direction;

    truck.gear = clamp(
        truck.gear,
        1,
        8
    );

    showMessage(
        "MARCHA " +
        truck.gear
    );
}


function toggleReverse() {

    if (truck.speed > 3) {

        showMessage(
            "Detén el camión antes de poner R."
        );

        return;
    }

    truck.reverse =
        !truck.reverse;

    if (truck.reverse) {

        truck.gear = 0;

        showMessage(
            "MARCHA ATRÁS - R"
        );

    } else {

        truck.gear = 1;

        showMessage(
            "MARCHA 1"
        );
    }
}


// ==========================================================
// RPM
// ==========================================================

function updateRPM() {

    if (truck.reverse) {

        const targetRPM =
            truck.idleRPM +
            truck.speed * 35;

        truck.rpm +=
            (
                targetRPM -
                truck.rpm
            ) * 0.08;

        return;
    }

    const gear =
        gears[truck.gear];

    if (!gear) return;

    const ratio =
        truck.speed /
        gear.maxSpeed;

    let targetRPM =
        truck.minRPM +
        ratio *
        (
            truck.maxRPM -
            truck.minRPM
        );

    if (keys.w) {
        targetRPM += 150;
    }

    if (keys.s) {
        targetRPM -= 100;
    }

    targetRPM = clamp(
        targetRPM,
        truck.minRPM,
        truck.maxRPM
    );

    truck.rpm +=
        (
            targetRPM -
            truck.rpm
        ) * 0.12;
}


// ==========================================================
// ACELERACIÓN
// ==========================================================

function updateAcceleration() {

    if (truck.fuel <= 0) {
        return;
    }

    if (truck.reverse) {

        if (keys.w) {

            truck.speed +=
                0.38 *
                getWeightFactor();
        }

        return;
    }

    const gear =
        gears[truck.gear];

    if (!gear) return;

    if (keys.w) {

        let power =
            gear.acceleration *
            getWeightFactor();

        if (truck.rpm > 2000) {
            power *= 0.65;
        }

        if (truck.rpm < 900) {
            power *= 0.70;
        }

        truck.speed += power;
    }
}


// ==========================================================
// FRENOS
// ==========================================================

function updateBrakes() {

    if (!keys.s) return;

    truck.speed -=
        truck.brakePower;

    truck.speed -=
        truck.engineBrake *
        (
            1 +
            truck.gear * 0.3
        );
}


// ==========================================================
// RESISTENCIA
// ==========================================================

function applyNaturalResistance() {

    if (!keys.w && !keys.s) {

        truck.speed *= 0.992;

        if (truck.speed > 0) {

            truck.speed -=
                truck.engineBrake *
                (
                    1 +
                    truck.gear * 0.15
                );
        }
    }
}


// ==========================================================
// VELOCIDAD MÁXIMA
// ==========================================================

function applySpeedLimits() {

    let maximum;

    if (truck.reverse) {

        maximum = 25;

    } else {

        const gear =
            gears[truck.gear];

        maximum =
            gear.maxSpeed;
    }

    maximum =
        Math.min(
            maximum,
            truck.speedLimiter
        );

    if (truck.speed > maximum) {
        truck.speed = maximum;
    }

    if (truck.speed < 0) {
        truck.speed = 0;
    }
}


// ==========================================================
// DIRECCIÓN
// ==========================================================

function updateSteering() {

    const speedFactor =
        Math.min(
            1,
            truck.speed / 40
        );

    const steeringAmount =
        truck.steering *
        (
            1 -
            speedFactor * 0.55
        );

    if (keys.a && truck.speed > 0) {
        truck.angle -= steeringAmount;
    }

    if (keys.d && truck.speed > 0) {
        truck.angle += steeringAmount;
    }
}


// ==========================================================
// MOVIMIENTO
// ==========================================================

function updateMovement() {

    let movement =
        truck.speed * 0.23;

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


// ==========================================================
// LÍMITES DEL MUNDO
// ==========================================================

function keepTruckInsideWorld() {

    const margin = 100;

    if (truck.x < margin) {
        truck.x = margin;
        registerDamage(1);
    }

    if (truck.x > WORLD_WIDTH - margin) {
        truck.x =
            WORLD_WIDTH - margin;

        registerDamage(1);
    }

    if (truck.y < margin) {
        truck.y = margin;
        registerDamage(1);
    }

    if (truck.y > WORLD_HEIGHT - margin) {
        truck.y =
            WORLD_HEIGHT - margin;

        registerDamage(1);
    }
}


// ==========================================================
// COMBUSTIBLE
// ==========================================================

function updateFuel() {

    if (truck.speed <= 0) return;

    const weightFactor =
        getTotalWeight() / 8000;

    const consumption =
        0.000025 *
        truck.speed *
        weightFactor;

    truck.fuel -=
        consumption;

    truck.fuel =
        Math.max(
            0,
            truck.fuel
        );
}


function refuel() {

    const station =
        getNearestServicePoint(
            "gasolinera"
        );

    if (
        station &&
        distance(
            truck.x,
            truck.y,
            station.x,
            station.y
        ) < 180
    ) {

        truck.fuel =
            truck.fuelCapacity;

        showMessage(
            "⛽ DEPÓSITO LLENO"
        );

    } else {

        showMessage(
            "Acércate a una gasolinera."
        );
    }
}


// ==========================================================
// DAÑOS
// ==========================================================

function registerDamage(amount) {

    truck.damage += amount;

    truck.damage =
        clamp(
            truck.damage,
            0,
            100
        );
}


// ==========================================================
// MAPA
// ==========================================================

const roads = [];

const cities = [];

const villages = [];

const pointsOfInterest = [];


// ==========================================================
// CREAR CARRETERA
// ==========================================================

function createRoad(
    name,
    type,
    points,
    width
) {

    roads.push({

        name,
        type,
        points,
        width

    });
}


// ==========================================================
// CIUDADES
// ==========================================================

function createCity(
    name,
    x,
    y,
    size
) {

    cities.push({

        name,
        x,
        y,
        size

    });
}


// ==========================================================
// PUEBLOS
// ==========================================================

function createVillage(
    name,
    x,
    y
) {

    villages.push({

        name,
        x,
        y

    });
}


// ==========================================================
// PUNTOS DE INTERÉS
// ==========================================================

function createPOI(
    name,
    type,
    x,
    y
) {

    pointsOfInterest.push({

        name,
        type,
        x,
        y

    });
}


// ==========================================================
// MAPA PRINCIPAL
// ==========================================================

function buildMap() {

    roads.length = 0;
    cities.length = 0;
    villages.length = 0;
    pointsOfInterest.length = 0;


    // ------------------------------------------------------
    // CIUDADES
    // ------------------------------------------------------

    createCity(
        "Madrid",
        5000,
        3750,
        260
    );

    createCity(
        "Toledo",
        3900,
        4700,
        170
    );

    createCity(
        "Valencia",
        7900,
        3900,
        230
    );

    createCity(
        "Cuenca",
        6500,
        4700,
        150
    );

    createCity(
        "Guadalajara",
        6000,
        2700,
        150
    );

    createCity(
        "Zaragoza",
        8300,
        1700,
        230
    );

    createCity(
        "Segovia",
        3700,
        2200,
        140
    );

    createCity(
        "Ávila",
        2500,
        3400,
        150
    );


    // ------------------------------------------------------
    // PUEBLOS
    // ------------------------------------------------------

    createVillage(
        "Alcalá",
        5550,
        3000
    );

    createVillage(
        "Tarancón",
        5500,
        4400
    );

    createVillage(
        "Aranjuez",
        4500,
        4300
    );

    createVillage(
        "Ocaña",
        4300,
        5000
    );

    createVillage(
        "Medina",
        3100,
        2500
    );

    createVillage(
        "Sacedón",
        6500,
        3300
    );

    createVillage(
        "Molina",
        7000,
        2700
    );

    createVillage(
        "Requena",
        7200,
        4600
    );


    // ------------------------------------------------------
    // AUTOPISTA A1
    // ------------------------------------------------------

    createRoad(
        "A-1",
        "autopista",
        [
            {x: 5000, y: 3750},
            {x: 4700, y: 3200},
            {x: 4200, y: 2600},
            {x: 3700, y: 2200},
            {x: 3200, y: 1800}
        ],
        70
    );


    // ------------------------------------------------------
    // AUTOPISTA A2
    // ------------------------------------------------------

    createRoad(
        "A-2",
        "autopista",
        [
            {x: 5000, y: 3750},
            {x: 5800, y: 3000},
            {x: 6800, y: 2400},
            {x: 7600, y: 1900},
            {x: 8300, y: 1700}
        ],
        70
    );


    // ------------------------------------------------------
    // AUTOVÍA A3
    // ------------------------------------------------------

    createRoad(
        "A-3",
        "autovia",
        [
            {x: 5000, y: 3750},
            {x: 6000, y: 3900},
            {x: 7000, y: 3950},
            {x: 7900, y: 3900}
        ],
        65
    );


    // ------------------------------------------------------
    // A4
    // ------------------------------------------------------

    createRoad(
        "A-4",
        "autovia",
        [
            {x: 5000, y: 3750},
            {x: 4700, y: 4200},
            {x: 4500, y: 4500},
            {x: 3900, y: 4700}
        ],
        65
    );


    // ------------------------------------------------------
    // NACIONAL
    // ------------------------------------------------------

    createRoad(
        "N-320",
        "nacional",
        [
            {x: 5000, y: 3750},
            {x: 5500, y: 3300},
            {x: 6500, y: 3300},
            {x: 7000, y: 2700}
        ],
        38
    );


    createRoad(
        "N-400",
        "nacional",
        [
            {x: 3900, y: 4700},
            {x: 4700, y: 5000},
            {x: 5500, y: 4400},
            {x: 6500, y: 4700}
        ],
        38
    );


    // ------------------------------------------------------
    // SECUNDARIAS
    // ------------------------------------------------------

    createRoad(
        "CM-40",
        "secundaria",
        [
            {x: 3900, y: 4700},
            {x: 3500, y: 4400},
            {x: 3000, y: 4000},
            {x: 2500, y: 3400}
        ],
        25
    );


    createRoad(
        "CV-25",
        "secundaria",
        [
            {x: 7900, y: 3900},
            {x: 7400, y: 4300},
            {x: 7200, y: 4600},
            {x: 6500, y: 4700}
        ],
        25
    );


    createRoad(
        "GU-900",
        "secundaria",
        [
            {x: 6000, y: 2700},
            {x: 6500, y: 3300},
            {x: 7000, y: 2700}
        ],
        24
    );


    // ------------------------------------------------------
    // CARRETERA DE MONTAÑA
    // ------------------------------------------------------

    createRoad(
        "M-300",
        "montaña",
        [
            {x: 3200, y: 1800},
            {x: 2800, y: 1600},
            {x: 2300, y: 1800},
            {x: 1900, y: 2200},
            {x: 1700, y: 2800}
        ],
        22
    );


    // ------------------------------------------------------
    // PUNTOS DE SERVICIO
    // ------------------------------------------------------

    createPOI(
        "Gasolinera Madrid",
        "gasolinera",
        5200,
        3900
    );

    createPOI(
        "Gasolinera A-3",
        "gasolinera",
        6800,
        3950
    );

    createPOI(
        "Gasolinera A-1",
        "gasolinera",
        3900,
        2500
    );

    createPOI(
        "Taller Madrid",
        "taller",
        4800,
        3500
    );

    createPOI(
        "Taller Valencia",
        "taller",
        7750,
        4100
    );

    createPOI(
        "Área de descanso A-3",
        "descanso",
        6200,
        3900
    );

    createPOI(
        "Área de descanso A-1",
        "descanso",
        3500,
        2000
    );
}


buildMap();


// ==========================================================
// MAPA ABIERTO
// ==========================================================

let fullMap = false;


function toggleMap() {

    fullMap =
        !fullMap;

    if (fullMap) {

        showMessage(
            "MAPA ABIERTO - Pulsa M para cerrar"
        );

    } else {

        showMessage(
            "MAPA CERRADO"
        );
    }
}


// ==========================================================
// CONVERTIR COORDENADAS
// ==========================================================

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


// ==========================================================
// DIBUJAR TERRENO
// ==========================================================

function drawWorld() {

    ctx.fillStyle =
        "#536d4c";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Textura del terreno

    ctx.strokeStyle =
        "rgba(255,255,255,0.025)";

    ctx.lineWidth = 1;

    const grid = 120;

    for (
        let x = -grid;
        x < canvas.width + grid;
        x += grid
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();
    }

    for (
        let y = -grid;
        y < canvas.height + grid;
        y += grid
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();
    }
}


// ==========================================================
// COLOR CARRETERA
// ==========================================================

function roadColor(type) {

    if (type === "autopista") {
        return "#27292d";
    }

    if (type === "autovia") {
        return "#303237";
    }

    if (type === "nacional") {
        return "#46484b";
    }

    if (type === "montaña") {
        return "#514b45";
    }

    return "#585858";
}


// ==========================================================
// DIBUJAR UNA CARRETERA
// ==========================================================

function drawRoad(road) {

    const points =
        road.points
        .map(p =>
            worldToScreen(
                p.x,
                p.y
            )
        );


    if (points.length < 2) {
        return;
    }


    // ------------------------------------------------------
    // ASFALTO
    // ------------------------------------------------------

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


    ctx.strokeStyle =
        roadColor(
            road.type
        );

    ctx.lineWidth =
        road.width;

    ctx.lineCap =
        "round";

    ctx.lineJoin =
        "round";

    ctx.stroke();


    // ------------------------------------------------------
    // ARCENES
    // ------------------------------------------------------

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

    ctx.strokeStyle =
        "rgba(255,255,255,0.75)";

    ctx.lineWidth =
        2;

    ctx.stroke();


    // ------------------------------------------------------
    // LÍNEA CENTRAL
    // ------------------------------------------------------

    if (
        road.type !== "autopista"
    ) {

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

        ctx.strokeStyle =
            "#e5d16a";

        ctx.lineWidth = 2;

        ctx.setLineDash(
            [18, 15]
        );

        ctx.stroke();

        ctx.setLineDash([]);
    }
}


// ==========================================================
// DIBUJAR TODAS LAS CARRETERAS
// ==========================================================

function drawRoads() {

    for (
        const road of roads
    ) {

        drawRoad(road);
    }
}


// ==========================================================
// CIUDADES
// ==========================================================

function drawCities() {

    for (
        const city of cities
    ) {

        const p =
            worldToScreen(
                city.x,
                city.y
            );


        // Zona urbana

        ctx.fillStyle =
            "rgba(90,90,90,0.25)";


        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            city.size * 0.35,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // Punto

        ctx.fillStyle =
            "#e8e8e8";


        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // Nombre

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "bold 18px Arial";

        ctx.textAlign =
            "center";

        ctx.shadowColor =
            "#000";

        ctx.shadowBlur =
            5;

        ctx.fillText(
            city.name,
            p.x,
            p.y -
            city.size * 0.35
        );

        ctx.shadowBlur = 0;
    }

    ctx.textAlign =
        "left";
}


// ==========================================================
// PUEBLOS
// ==========================================================

function drawVillages() {

    for (
        const village of villages
    ) {

        const p =
            worldToScreen(
                village.x,
                village.y
            );


        ctx.fillStyle =
            "#d8c58a";


        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#fff";

        ctx.font =
            "13px Arial";

        ctx.textAlign =
            "left";

        ctx.shadowColor =
            "#000";

        ctx.shadowBlur =
            4;

        ctx.fillText(
            village.name,
            p.x + 8,
            p.y + 4
        );

        ctx.shadowBlur = 0;
    }
}


// ==========================================================
// PUNTOS DE INTERÉS
// ==========================================================

function drawPOIs() {

    for (
        const poi of pointsOfInterest
    ) {

        const p =
            worldToScreen(
                poi.x,
                poi.y
            );


        let color =
            "#fff";


        let symbol =
            "•";


        if (
            poi.type === "gasolinera"
        ) {

            color =
                "#4dd2ff";

            symbol =
                "⛽";
        }


        if (
            poi.type === "taller"
        ) {

            color =
                "#ffb347";

            symbol =
                "🔧";
        }


        if (
            poi.type === "descanso"
        ) {

            color =
                "#80d890";

            symbol =
                "P";
        }


        ctx.font =
            "20px Arial";

        ctx.textAlign =
            "center";

        ctx.fillStyle =
            color;

        ctx.fillText(
            symbol,
            p.x,
            p.y
        );


        ctx.font =
            "11px Arial";

        ctx.fillStyle =
            "#fff";

        ctx.shadowColor =
            "#000";

        ctx.shadowBlur =
            4;

        ctx.fillText(
            poi.name,
            p.x,
            p.y + 20
        );

        ctx.shadowBlur = 0;
    }


    ctx.textAlign =
        "left";
}


// ==========================================================
// SEÑALES
// ==========================================================

function drawSigns() {

    for (
        const road of roads
    ) {

        if (
            road.points.length < 2
        ) continue;


        const p =
            road.points[1];


        const screen =
            worldToScreen(
                p.x,
                p.y
            );


        if (
            screen.x < -100 ||
            screen.x > canvas.width + 100 ||
            screen.y < -100 ||
            screen.y > canvas.height + 100
        ) {

            continue;
        }


        ctx.fillStyle =
            "#888";

        ctx.fillRect(
            screen.x - 2,
            screen.y,
            4,
            30
        );


        ctx.fillStyle =
            "#1765b0";

        ctx.fillRect(
            screen.x - 20,
            screen.y - 25,
            40,
            25
        );


        ctx.fillStyle =
            "#fff";

        ctx.font =
            "bold 10px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            road.name,
            screen.x,
            screen.y - 9
        );
    }

    ctx.textAlign =
        "left";
}


// ==========================================================
// MINIMAPA
// ==========================================================

function drawMinimap() {

    const size = 230;

    const x =
        canvas.width -
        size -
        20;

    const y =
        20;


    ctx.fillStyle =
        "rgba(5,10,12,0.88)";

    ctx.fillRect(
        x,
        y,
        size,
        size
    );


    ctx.strokeStyle =
        "rgba(255,255,255,0.25)";

    ctx.strokeRect(
        x,
        y,
        size,
        size
    );


    const scaleX =
        size /
        WORLD_WIDTH;

    const scaleY =
        size /
        WORLD_HEIGHT;


    // ------------------------------------------------------
    // CARRETERAS
    // ------------------------------------------------------

    for (
        const road of roads
    ) {

        ctx.beginPath();

        road.points.forEach(
            (point, index) => {

                const px =
                    x +
                    point.x *
                    scaleX;

                const py =
                    y +
                    point.y *
                    scaleY;

                if (index === 0) {

                    ctx.moveTo(
                        px,
                        py
                    );

                } else {

                    ctx.lineTo(
                        px,
                        py
                    );
                }
            }
        );


        if (
            road.type === "autopista"
        ) {

            ctx.strokeStyle =
                "#ffffff";

        } else if (
            road.type === "autovia"
        ) {

            ctx.strokeStyle =
                "#f1c84b";

        } else if (
            road.type === "nacional"
        ) {

            ctx.strokeStyle =
                "#df8b40";

        } else {

            ctx.strokeStyle =
                "#aaa";
        }


        ctx.lineWidth =
            road.type === "autopista"
                ? 3
                : 2;


        ctx.stroke();
    }


    // ------------------------------------------------------
    // CIUDADES
    // ------------------------------------------------------

    ctx.font =
        "bold 8px Arial";

    ctx.textAlign =
        "left";


    for (
        const city of cities
    ) {

        const px =
            x +
            city.x *
            scaleX;

        const py =
            y +
            city.y *
            scaleY;


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


        ctx.fillText(
            city.name,
            px + 5,
            py - 4
        );
    }


    // ------------------------------------------------------
    // PUEBLOS
    // ------------------------------------------------------

    for (
        const village of villages
    ) {

        const px =
            x +
            village.x *
            scaleX;

        const py =
            y +
            village.y *
            scaleY;


        ctx.fillStyle =
            "#d8c58a";


        ctx.beginPath();

        ctx.arc(
            px,
            py,
            2,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    // ------------------------------------------------------
    // CAMIÓN
    // ------------------------------------------------------

    const tx =
        x +
        truck.x *
        scaleX;

    const ty =
        y +
        truck.y *
        scaleY;


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


    // ------------------------------------------------------
    // TEXTO
    // ------------------------------------------------------

    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 11px Arial";

    ctx.fillText(
        "MINIMAPA",
        x + 10,
        y + 18
    );
}


// ==========================================================
// MAPA COMPLETO
// ==========================================================

function drawFullMap() {

    if (!fullMap) {
        return;
    }


    ctx.fillStyle =
        "rgba(5,8,10,0.94)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    const margin = 50;


    const mapWidth =
        canvas.width -
        margin * 2;

    const mapHeight =
        canvas.height -
        margin * 2;


    const scaleX =
        mapWidth /
        WORLD_WIDTH;

    const scaleY =
        mapHeight /
        WORLD_HEIGHT;


    // ------------------------------------------------------
    // CARRETERAS
    // ------------------------------------------------------

    for (
        const road of roads
    ) {

        ctx.beginPath();

        road.points.forEach(
            (point, index) => {

                const px =
                    margin +
                    point.x *
                    scaleX;

                const py =
                    margin +
                    point.y *
                    scaleY;


                if (index === 0) {

                    ctx.moveTo(
                        px,
                        py
                    );

                } else {

                    ctx.lineTo(
                        px,
                        py
                    );
                }
            }
        );


        if (
            road.type === "autopista"
        ) {

            ctx.strokeStyle =
                "#ffffff";

        } else if (
            road.type === "autovia"
        ) {

            ctx.strokeStyle =
                "#e4c34c";

        } else if (
            road.type === "nacional"
        ) {

            ctx.strokeStyle =
                "#e48c45";

        } else {

            ctx.strokeStyle =
                "#888";
        }


        ctx.lineWidth =
            road.type === "autopista"
                ? 5
                : 3;


        ctx.stroke();
    }


    // ------------------------------------------------------
    // CIUDADES
    // ------------------------------------------------------

    for (
        const city of cities
    ) {

        const px =
            margin +
            city.x *
            scaleX;

        const py =
            margin +
            city.y *
            scaleY;


        ctx.fillStyle =
            "#fff";


        ctx.beginPath();

        ctx.arc(
            px,
            py,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.font =
            "bold 15px Arial";

        ctx.textAlign =
            "left";

        ctx.fillText(
            city.name,
            px + 10,
            py - 8
        );
    }


    // ------------------------------------------------------
    // PUEBLOS
    // ------------------------------------------------------

    for (
        const village of villages
    ) {

        const px =
            margin +
            village.x *
            scaleX;

        const py =
            margin +
            village.y *
            scaleY;


        ctx.fillStyle =
            "#d8c58a";


        ctx.beginPath();

        ctx.arc(
            px,
            py,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.font =
            "11px Arial";

        ctx.fillStyle =
            "#ddd";

        ctx.fillText(
            village.name,
            px + 7,
            py + 4
        );
    }


    // ------------------------------------------------------
    // CAMIÓN
    // ------------------------------------------------------

    const tx =
        margin +
        truck.x *
        scaleX;

    const ty =
        margin +
        truck.y *
        scaleY;


    ctx.fillStyle =
        "#ff3030";


    ctx.beginPath();

    ctx.arc(
        tx,
        ty,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // ------------------------------------------------------
    // TÍTULO
    // ------------------------------------------------------

    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 24px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "MAPA",
        canvas.width / 2,
        35
    );


    ctx.font =
        "14px Arial";

    ctx.fillText(
        "Pulsa M para volver al juego",
        canvas.width / 2,
        canvas.height - 20
    );


    ctx.textAlign =
        "left";
}


// ==========================================================
// BUSCAR GASOLINERA / TALLER
// ==========================================================

function getNearestServicePoint(type) {

    let nearest =
        null;

    let nearestDistance =
        Infinity;


    for (
        const poi of pointsOfInterest
    ) {

        if (
            poi.type !== type
        ) continue;


        const d =
            distance(
                truck.x,
                truck.y,
                poi.x,
                poi.y
            );


        if (
            d <
            nearestDistance
        ) {

            nearest =
                poi;

            nearestDistance =
                d;
        }
    }


    return nearest;
}


// ==========================================================
// CÁMARA
// ==========================================================

function updateCamera() {

    camera.x +=
        (
            truck.x -
            camera.x
        ) * 0.08;


    camera.y +=
        (
            truck.y -
            camera.y
        ) * 0.08;
}


// ==========================================================
// ACTUALIZAR CAMIÓN
// ==========================================================

function updateTruck() {

    updateAcceleration();

    updateBrakes();

    applyNaturalResistance();

    applySpeedLimits();

    updateSteering();

    updateMovement();

    keepTruckInsideWorld();

    updateRPM();

    updateFuel();

    updateCamera();
}


// ==========================================================
// HUD
// ==========================================================

function drawHUD() {

    const x = 20;
    const y = 20;

    const width = 300;
    const height = 250;


    ctx.fillStyle =
        "rgba(10,14,18,0.88)";

    ctx.fillRect(
        x,
        y,
        width,
        height
    );


    ctx.fillStyle =
        "#aaa";

    ctx.font =
        "12px Arial";

    ctx.fillText(
        "VELOCIDAD",
        x + 20,
        y + 25
    );


    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 42px Arial";

    ctx.fillText(
        Math.round(truck.speed),
        x + 20,
        y + 68
    );


    ctx.font =
        "16px Arial";

    ctx.fillText(
        "km/h",
        x + 105,
        y + 68
    );


    ctx.fillStyle =
        "#aaa";

    ctx.font =
        "12px Arial";

    ctx.fillText(
        "MARCHA",
        x + 205,
        y + 25
    );


    ctx.fillStyle =
        truck.reverse
            ? "#ff4d4d"
            : "#fff";

    ctx.font =
        "bold 36px Arial";

    ctx.fillText(
        truck.reverse
            ? "R"
            : truck.gear,
        x + 220,
        y + 68
    );


    ctx.fillStyle =
        "#aaa";

    ctx.font =
        "12px Arial";

    ctx.fillText(
        "RPM",
        x + 20,
        y + 98
    );


    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 20px Arial";

    ctx.fillText(
        Math.round(truck.rpm),
        x + 60,
        y + 98
    );


    // RPM

    ctx.fillStyle =
        "#252525";

    ctx.fillRect(
        x + 20,
        y + 110,
        250,
        14
    );


    const rpmPercent =
        (
            truck.rpm -
            truck.minRPM
        )
        /
        (
            truck.maxRPM -
            truck.minRPM
        );


    ctx.fillStyle =
        rpmPercent > 0.85
            ? "#e44b4b"
            : "#e5c44d";


    ctx.fillRect(
        x + 20,
        y + 110,
        250 *
        clamp(
            rpmPercent,
            0,
            1
        ),
        14
    );


    // COMBUSTIBLE

    ctx.fillStyle =
        "#aaa";

    ctx.font =
        "12px Arial";

    ctx.fillText(
        "COMBUSTIBLE",
        x + 20,
        y + 150
    );


    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        x + 20,
        y + 160,
        250,
        14
    );


    ctx.fillStyle =
        truck.fuel < 20
            ? "#e44b4b"
            : "#52c878";


    ctx.fillRect(
        x + 20,
        y + 160,
        250 *
        (
            truck.fuel /
            100
        ),
        14
    );


    ctx.fillStyle =
        "#fff";

    ctx.fillText(
        Math.round(truck.fuel) +
        "%",
        x + 115,
        y + 192
    );


    // DAÑOS

    ctx.fillStyle =
        "#aaa";

    ctx.fillText(
        "DAÑOS",
        x + 20,
        y + 215
    );


    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        x + 70,
        y + 204,
        200,
        14
    );


    ctx.fillStyle =
        truck.damage > 60
            ? "#e44b4b"
            : "#d2a941";


    ctx.fillRect(
        x + 70,
        y + 204,
        200 *
        (
            truck.damage /
            100
        ),
        14
    );


    ctx.fillStyle =
        "#aaa";

    ctx.fillText(
        "PESO: " +
        getTotalWeight() +
        " kg",
        x + 20,
        y + 238
    );
}


// ==========================================================
// ACTUALIZAR HUD INFERIOR
// ==========================================================

function updateExternalHUD() {

    const speed =
        document.getElementById(
            "bottomSpeed"
        );

    if (speed) {
        speed.textContent =
            Math.round(
                truck.speed
            );
    }


    const gear =
        document.getElementById(
            "bottomGear"
        );

    if (gear) {

        gear.textContent =
            truck.reverse
                ? "R"
                : truck.gear;
    }


    const cruise =
        document.getElementById(
            "cruiseStatus"
        );

    if (cruise) {
        cruise.textContent =
            "OFF";
    }


    const indicators =
        document.getElementById(
            "indicatorStatus"
        );

    if (indicators) {
        indicators.textContent =
            "—";
    }


    const lights =
        document.getElementById(
            "lightsStatus"
        );

    if (lights) {
        lights.textContent =
            "OFF";
    }


    const engineBrake =
        document.getElementById(
            "engineBrakeStatus"
        );

    if (engineBrake) {

        engineBrake.textContent =
            (
                !keys.w &&
                truck.speed > 5
            )
                ? "ON"
                : "OFF";
    }
}


// ==========================================================
// MENSAJES
// ==========================================================

let message = "";

let messageTimer = 0;


function showMessage(text) {

    message =
        text;

    messageTimer =
        150;
}


function drawMessage() {

    if (
        messageTimer <= 0
    ) {
        return;
    }


    const width = 440;
    const height = 52;

    const x =
        canvas.width / 2 -
        width / 2;

    const y = 20;


    ctx.fillStyle =
        "rgba(0,0,0,0.85)";

    ctx.fillRect(
        x,
        y,
        width,
        height
    );


    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 18px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        message,
        canvas.width / 2,
        y + 32
    );


    ctx.textAlign =
        "left";

    messageTimer--;
}


// ==========================================================
// CAMIÓN
// ==========================================================

function drawTruck() {

    if (fullMap) {
        return;
    }


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


    // SOMBRA

    ctx.fillStyle =
        "rgba(0,0,0,0.35)";

    ctx.fillRect(
        -32,
        -63,
        64,
        145
    );


    // REMOLQUE

    ctx.fillStyle =
        "#d7d7d7";

    ctx.fillRect(
        -25,
        0,
        50,
        85
    );


    ctx.strokeStyle =
        "#444";

    ctx.lineWidth = 3;

    ctx.strokeRect(
        -25,
        0,
        50,
        85
    );


    // CABINA

    ctx.fillStyle =
        "#c83232";

    ctx.fillRect(
        -29,
        -70,
        58,
        62
    );


    // PARABRISAS

    ctx.fillStyle =
        "#71a8c5";

    ctx.fillRect(
        -21,
        -61,
        42,
        25
    );


    // PARACHOQUES

    ctx.fillStyle =
        "#c9c9c9";

    ctx.fillRect(
        -31,
        -77,
        62,
        8
    );


    // RUEDAS

    ctx.fillStyle =
        "#111";

    ctx.fillRect(
        -35,
        -47,
        10,
        24
    );

    ctx.fillRect(
        25,
        -47,
        10,
        24
    );

    ctx.fillRect(
        -35,
        40,
        10,
        24
    );

    ctx.fillRect(
        25,
        40,
        10,
        24
    );


    // FAROS

    ctx.fillStyle =
        "#fff0a8";

    ctx.fillRect(
        -20,
        -85,
        12,
        8
    );

    ctx.fillRect(
        8,
        -85,
        12,
        8
    );


    ctx.restore();
}


// ==========================================================
// BUCLE PRINCIPAL
// ==========================================================

function gameLoop() {

    updateTruck();


    if (fullMap) {

        drawFullMap();

    } else {

        drawWorld();

        drawRoads();

        drawCities();

        drawVillages();

        drawPOIs();

        drawSigns();

        drawTruck();

        drawHUD();

        drawMinimap();

        drawMessage();
    }


    updateExternalHUD();


    requestAnimationFrame(
        gameLoop
    );
}


// ==========================================================
// INICIO
// ==========================================================

showMessage(
    "FASE 2: MAPA CARGADO"
);


gameLoop();

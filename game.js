"use strict";

/*
============================================================
 TRUCK DRIVER
 FASES 1 + 2 + 3
============================================================

 FASE 1:
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

 FASE 2:
 - Mapa grande
 - Autopistas
 - Autovías
 - Nacionales
 - Secundarias
 - Montaña
 - Ciudades
 - Pueblos
 - Gasolineras
 - Talleres
 - Áreas de descanso
 - Señales
 - Minimapa
 - GPS básico

 FASE 3:
 - Tráfico
 - Coches
 - Furgonetas
 - Camiones
 - Autobuses
 - Semáforos
 - Colisiones
 - Día/noche
 - Lluvia
 - Nubes
 - Luces
============================================================
*/


// ==========================================================
// CANVAS
// ==========================================================

const canvas =
    document.getElementById("gameCanvas");

if (!canvas) {
    throw new Error(
        'No existe <canvas id="gameCanvas"> en index.html'
    );
}

const ctx =
    canvas.getContext("2d");

if (!ctx) {
    throw new Error(
        "No se pudo crear el contexto 2D."
    );
}


// ==========================================================
// TAMAÑO
// ==========================================================

function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;
}

resizeCanvas();

window.addEventListener(
    "resize",
    resizeCanvas
);


// ==========================================================
// TECLADO
// ==========================================================

const keys = {

    w: false,
    s: false,
    a: false,
    d: false

};


window.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key.toLowerCase();


        if (key === "w") {
            keys.w = true;
        }

        if (key === "s") {
            keys.s = true;
        }

        if (key === "a") {
            keys.a = true;
        }

        if (key === "d") {
            keys.d = true;
        }


        if (
            key === "+" ||
            key === "="
        ) {

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


        // NUEVO FASE 3
        if (key === "l") {

            toggleLights();
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
                "m",
                "l"
            ].includes(key)
        ) {

            event.preventDefault();
        }

    }
);


window.addEventListener(
    "keyup",
    function(event) {

        const key =
            event.key.toLowerCase();


        if (key === "w") {
            keys.w = false;
        }

        if (key === "s") {
            keys.s = false;
        }

        if (key === "a") {
            keys.a = false;
        }

        if (key === "d") {
            keys.d = false;
        }

    }
);


// ==========================================================
// MUNDO
// ==========================================================

const WORLD_WIDTH =
    10000;

const WORLD_HEIGHT =
    7500;


// ==========================================================
// CÁMARA
// ==========================================================

const camera = {

    x:
        WORLD_WIDTH / 2,

    y:
        WORLD_HEIGHT / 2

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

    name:
        "Sin carga",

    weight:
        0,

    loaded:
        false

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

function distance(
    x1,
    y1,
    x2,
    y2
) {

    return Math.hypot(
        x2 - x1,
        y2 - y1
    );
}


function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
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

    const weight =
        getTotalWeight();

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

function changeGear(
    direction
) {

    if (truck.reverse) {

        showMessage(
            "Pulsa B para salir de R."
        );

        return;
    }


    truck.gear +=
        direction;


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

        truck.gear =
            0;

        showMessage(
            "MARCHA ATRÁS - R"
        );

    } else {

        truck.gear =
            1;

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


    if (!gear) {

        return;
    }


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

        targetRPM +=
            150;
    }


    if (keys.s) {

        targetRPM -=
            100;
    }


    targetRPM =
        clamp(
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

    if (
        truck.fuel <= 0
    ) {

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


    if (!gear) {

        return;
    }


    if (keys.w) {

        let power =
            gear.acceleration *
            getWeightFactor();


        if (
            truck.rpm > 2000
        ) {

            power *=
                0.65;
        }


        if (
            truck.rpm < 900
        ) {

            power *=
                0.70;
        }


        truck.speed +=
            power;
    }
}


// ==========================================================
// FRENOS
// ==========================================================

function updateBrakes() {

    if (!keys.s) {

        return;
    }


    truck.speed -=
        truck.brakePower;


    truck.speed -=
        truck.engineBrake *
        (
            1 +
            truck.gear *
            0.3
        );
}


// ==========================================================
// RESISTENCIA
// ==========================================================

function applyNaturalResistance() {

    if (
        !keys.w &&
        !keys.s
    ) {

        truck.speed *=
            0.992;


        if (
            truck.speed > 0
        ) {

            truck.speed -=
                truck.engineBrake *
                (
                    1 +
                    truck.gear *
                    0.15
                );
        }
    }
}


// ==========================================================
// VELOCIDAD
// ==========================================================

function applySpeedLimits() {

    let maximum;


    if (truck.reverse) {

        maximum =
            25;

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


    if (
        truck.speed >
        maximum
    ) {

        truck.speed =
            maximum;
    }


    if (
        truck.speed < 0
    ) {

        truck.speed =
            0;
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
            speedFactor *
            0.55
        );


    if (
        keys.a &&
        truck.speed > 0
    ) {

        truck.angle -=
            steeringAmount;
    }


    if (
        keys.d &&
        truck.speed > 0
    ) {

        truck.angle +=
            steeringAmount;
    }
}


// ==========================================================
// MOVIMIENTO
// ==========================================================

function updateMovement() {

    let movement =
        truck.speed *
        0.23;


    if (truck.reverse) {

        movement *=
            -1;
    }


    truck.x +=
        Math.sin(
            truck.angle
        ) *
        movement;


    truck.y -=
        Math.cos(
            truck.angle
        ) *
        movement;
}


// ==========================================================
// LÍMITES
// ==========================================================

function keepTruckInsideWorld() {

    const margin =
        100;


    if (
        truck.x < margin
    ) {

        truck.x =
            margin;

        registerDamage(1);
    }


    if (
        truck.x >
        WORLD_WIDTH -
        margin
    ) {

        truck.x =
            WORLD_WIDTH -
            margin;

        registerDamage(1);
    }


    if (
        truck.y < margin
    ) {

        truck.y =
            margin;

        registerDamage(1);
    }


    if (
        truck.y >
        WORLD_HEIGHT -
        margin
    ) {

        truck.y =
            WORLD_HEIGHT -
            margin;

        registerDamage(1);
    }
}


// ==========================================================
// COMBUSTIBLE
// ==========================================================

function updateFuel() {

    if (
        truck.speed <= 0
    ) {

        return;
    }


    const weightFactor =
        getTotalWeight() /
        8000;


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

function registerDamage(
    amount
) {

    truck.damage +=
        amount;


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
// CARRETERAS
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
// CONSTRUCCIÓN DEL MAPA
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
        "Avila",
        2500,
        3400,
        150
    );


    // ------------------------------------------------------
    // PUEBLOS
    // ------------------------------------------------------

    createVillage(
        "Alcala",
        5550,
        3000
    );

    createVillage(
        "Tarancon",
        5500,
        4400
    );

    createVillage(
        "Aranjuez",
        4500,
        4300
    );

    createVillage(
        "Ocana",
        4300,
        5000
    );

    createVillage(
        "Medina",
        3100,
        2500
    );

    createVillage(
        "Sacedon",
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
    // AUTOPISTA A-1
    // ------------------------------------------------------

    createRoad(
        "A-1",
        "autopista",
        [
            { x: 5000, y: 3750 },
            { x: 4700, y: 3200 },
            { x: 4200, y: 2600 },
            { x: 3700, y: 2200 },
            { x: 3200, y: 1800 }
        ],
        70
    );


    // ------------------------------------------------------
    // AUTOPISTA A-2
    // ------------------------------------------------------

    createRoad(
        "A-2",
        "autopista",
        [
            { x: 5000, y: 3750 },
            { x: 5800, y: 3000 },
            { x: 6800, y: 2400 },
            { x: 7600, y: 1900 },
            { x: 8300, y: 1700 }
        ],
        70
    );


    // ------------------------------------------------------
    // AUTOVIA A-3
    // ------------------------------------------------------

    createRoad(
        "A-3",
        "autovia",
        [
            { x: 5000, y: 3750 },
            { x: 6000, y: 3900 },
            { x: 7000, y: 3950 },
            { x: 7900, y: 3900 }
        ],
        65
    );


    // ------------------------------------------------------
    // AUTOVIA A-4
    // ------------------------------------------------------

    createRoad(
        "A-4",
        "autovia",
        [
            { x: 5000, y: 3750 },
            { x: 4700, y: 4200 },
            { x: 4500, y: 4500 },
            { x: 3900, y: 4700 }
        ],
        65
    );


    // ------------------------------------------------------
    // NACIONALES
    // ------------------------------------------------------

    createRoad(
        "N-320",
        "nacional",
        [
            { x: 5000, y: 3750 },
            { x: 5500, y: 3300 },
            { x: 6500, y: 3300 },
            { x: 7000, y: 2700 }
        ],
        38
    );


    createRoad(
        "N-400",
        "nacional",
        [
            { x: 3900, y: 4700 },
            { x: 4700, y: 5000 },
            { x: 5500, y: 4400 },
            { x: 6500, y: 4700 }
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
            { x: 3900, y: 4700 },
            { x: 3500, y: 4400 },
            { x: 3000, y: 4000 },
            { x: 2500, y: 3400 }
        ],
        25
    );


    createRoad(
        "CV-25",
        "secundaria",
        [
            { x: 7900, y: 3900 },
            { x: 7400, y: 4300 },
            { x: 7200, y: 4600 },
            { x: 6500, y: 4700 }
        ],
        25
    );


    createRoad(
        "GU-900",
        "secundaria",
        [
            { x: 6000, y: 2700 },
            { x: 6500, y: 3300 },
            { x: 7000, y: 2700 }
        ],
        24
    );


    // ------------------------------------------------------
    // CARRETERA DE MONTAÑA
    // ------------------------------------------------------

    createRoad(
        "M-300",
        "montana",
        [
            { x: 3200, y: 1800 },
            { x: 2800, y: 1600 },
            { x: 2300, y: 1800 },
            { x: 1900, y: 2200 },
            { x: 1700, y: 2800 }
        ],
        22
    );


    // ------------------------------------------------------
    // GASOLINERAS
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


    // ------------------------------------------------------
    // TALLERES
    // ------------------------------------------------------

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


    // ------------------------------------------------------
    // AREAS DE DESCANSO
    // ------------------------------------------------------

    createPOI(
        "Area de descanso A-3",
        "descanso",
        6200,
        3900
    );

    createPOI(
        "Area de descanso A-1",
        "descanso",
        3500,
        2000
    );
}


buildMap();


// ==========================================================
// MAPA COMPLETO
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
// CONVERSIÓN MUNDO -> PANTALLA
// ==========================================================

function worldToScreen(
    x,
    y
) {

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
// TERRENO
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


    const grid =
        120;


    ctx.strokeStyle =
        "rgba(255,255,255,0.025)";

    ctx.lineWidth =
        1;


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
// COLOR DE CARRETERA
// ==========================================================

function roadColor(
    type
) {

    if (
        type === "autopista"
    ) {

        return "#27292d";
    }


    if (
        type === "autovia"
    ) {

        return "#303237";
    }


    if (
        type === "nacional"
    ) {

        return "#46484b";
    }


    if (
        type === "montana"
    ) {

        return "#514b45";
    }


    return "#585858";
}


// ==========================================================
// DIBUJAR CARRETERA
// ==========================================================

function drawRoad(
    road
) {

    const points =
        road.points.map(
            function(point) {

                return worldToScreen(
                    point.x,
                    point.y
                );
            }
        );


    if (
        points.length < 2
    ) {

        return;
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


    // ARCENES

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


    // LINEA CENTRAL

    if (
        road.type !==
        "autopista"
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


        ctx.lineWidth =
            2;


        ctx.setLineDash(
            [18, 15]
        );


        ctx.stroke();


        ctx.setLineDash([]);
    }
}


// ==========================================================
// TODAS LAS CARRETERAS
// ==========================================================

function drawRoads() {

    for (
        const road of roads
    ) {

        drawRoad(
            road
        );
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


        ctx.shadowBlur =
            0;
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


        ctx.shadowBlur =
            0;
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


        let symbol =
            "•";


        if (
            poi.type ===
            "gasolinera"
        ) {

            symbol =
                "⛽";
        }


        if (
            poi.type ===
            "taller"
        ) {

            symbol =
                "🔧";
        }


        if (
            poi.type ===
            "descanso"
        ) {

            symbol =
                "P";
        }


        ctx.font =
            "20px Arial";


        ctx.textAlign =
            "center";


        ctx.fillStyle =
            "#ffffff";


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


        ctx.shadowBlur =
            0;
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
            road.points.length <
            2
        ) {

            continue;
        }


        const p =
            road.points[1];


        const screen =
            worldToScreen(
                p.x,
                p.y
            );


        if (
            screen.x < -100 ||
            screen.x >
                canvas.width + 100 ||
            screen.y < -100 ||
            screen.y >
                canvas.height + 100
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

    const size =
        230;


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


    for (
        const road of roads
    ) {

        ctx.beginPath();


        road.points.forEach(
            function(point, index) {

                const px =
                    x +
                    point.x *
                    scaleX;


                const py =
                    y +
                    point.y *
                    scaleY;


                if (
                    index === 0
                ) {

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
            road.type ===
            "autopista"
        ) {

            ctx.strokeStyle =
                "#ffffff";

        } else if (
            road.type ===
            "autovia"
        ) {

            ctx.strokeStyle =
                "#f1c84b";

        } else if (
            road.type ===
            "nacional"
        ) {

            ctx.strokeStyle =
                "#df8b40";

        } else {

            ctx.strokeStyle =
                "#aaa";
        }


        ctx.lineWidth =
            road.type ===
            "autopista"
                ? 3
                : 2;


        ctx.stroke();
    }


    // CIUDADES

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


    // CAMION

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
// FASE 3
// TRÁFICO
// ==========================================================

const traffic = [];

const trafficTypes = [
    "car",
    "van",
    "truck",
    "bus"
];


function randomTrafficType() {

    return trafficTypes[
        Math.floor(
            Math.random() *
            trafficTypes.length
        )
    ];
}


// ==========================================================
// CREAR VEHÍCULO
// ==========================================================

function createTrafficVehicle(
    road,
    roadIndex,
    pointIndex
) {

    const points =
        road.points;


    if (
        points.length < 2
    ) {

        return;
    }


    const safeIndex =
        Math.min(
            pointIndex,
            points.length - 2
        );


    const start =
        points[safeIndex];


    const end =
        points[safeIndex + 1];


    const angle =
        Math.atan2(
            end.x - start.x,
            -(end.y - start.y)
        );


    const type =
        randomTrafficType();


    let speed =
        35 +
        Math.random() * 55;


    if (
        road.type ===
        "autopista"
    ) {

        speed =
            70 +
            Math.random() * 45;
    }


    if (
        road.type ===
        "secundaria"
    ) {

        speed =
            25 +
            Math.random() * 35;
    }


    traffic.push({

        x:
            start.x,

        y:
            start.y,

        angle:
            angle,

        speed:
            speed,

        maxSpeed:
            speed,

        type:
            type,

        roadIndex:
            roadIndex,

        pointIndex:
            safeIndex,

        progress:
            0,

        length:
            type === "truck"
                ? 70
                : 45,

        width:
            type === "truck"
                ? 24
                : 20,

        stopped:
            false,

        color:
            randomVehicleColor()

    });
}


// ==========================================================
// COLORES DE TRÁFICO
// ==========================================================

function randomVehicleColor() {

    const colors = [
        "#e53935",
        "#eeeeee",
        "#1976d2",
        "#fbc02d",
        "#43a047",
        "#8e24aa",
        "#424242",
        "#fb8c00"
    ];


    return colors[
        Math.floor(
            Math.random() *
            colors.length
        )
    ];
}


// ==========================================================
// CREAR TRÁFICO INICIAL
// ==========================================================

function spawnInitialTraffic() {

    traffic.length =
        0;


    for (
        let i = 0;
        i < roads.length;
        i++
    ) {

        const road =
            roads[i];


        const amount =
            road.type ===
            "autopista"
                ? 5
                : 3;


        for (
            let j = 0;
            j < amount;
            j++
        ) {

            createTrafficVehicle(
                road,
                i,
                Math.floor(
                    Math.random() *
                    Math.max(
                        1,
                        road.points.length - 1
                    )
                )
            );
        }
    }
}


spawnInitialTraffic();


// ==========================================================
// SEMÁFOROS
// ==========================================================

const trafficLights = [];


function createTrafficLight(
    x,
    y
) {

    trafficLights.push({

        x:
            x,

        y:
            y,

        state:
            "green",

        timer:
            Math.random() * 8,

        duration:
            8

    });
}


function buildTrafficLights() {

    trafficLights.length =
        0;


    createTrafficLight(
        5000,
        3750
    );


    createTrafficLight(
        6000,
        3900
    );


    createTrafficLight(
        3900,
        4700
    );


    createTrafficLight(
        6500,
        3300
    );


    createTrafficLight(
        7900,
        3900
    );
}


buildTrafficLights();


// ==========================================================
// ACTUALIZAR SEMÁFOROS
// ==========================================================

function updateTrafficLights(
    delta
) {

    for (
        const light of trafficLights
    ) {

        light.timer +=
            delta;


        if (
            light.timer >=
            light.duration
        ) {

            light.timer =
                0;


            if (
                light.state ===
                "green"
            ) {

                light.state =
                    "yellow";

                light.duration =
                    2;

            } else if (
                light.state ===
                "yellow"
            ) {

                light.state =
                    "red";

                light.duration =
                    7;

            } else {

                light.state =
                    "green";

                light.duration =
                    8;
            }
        }
    }
}


// ==========================================================
// DIBUJAR SEMÁFOROS
// ==========================================================

function drawTrafficLights() {

    for (
        const light of trafficLights
    ) {

        const p =
            worldToScreen(
                light.x,
                light.y
            );


        ctx.fillStyle =
            "#222";


        ctx.fillRect(
            p.x - 9,
            p.y - 27,
            18,
            40
        );


        let red =
            "#441111";

        let yellow =
            "#443d11";

        let green =
            "#114411";


        if (
            light.state ===
            "red"
        ) {

            red =
                "#ff2222";
        }


        if (
            light.state ===
            "yellow"
        ) {

            yellow =
                "#ffd21f";
        }


        if (
            light.state ===
            "green"
        ) {

            green =
                "#20e85a";
        }


        ctx.fillStyle =
            red;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y - 18,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            yellow;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y - 4,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            green;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y + 10,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


// ==========================================================
// DISTANCIA A SEMÁFORO
// ==========================================================

function isNearRedLight(
    vehicle
) {

    for (
        const light of trafficLights
    ) {

        const d =
            distance(
                vehicle.x,
                vehicle.y,
                light.x,
                light.y
            );


        if (
            d < 75 &&
            light.state ===
            "red"
        ) {

            return true;
        }
    }


    return false;
}


// ==========================================================
// MOVIMIENTO DEL TRÁFICO
// ==========================================================

function updateTraffic(
    delta
) {

    for (
        const vehicle of traffic
    ) {

        if (
            isNearRedLight(
                vehicle
            )
        ) {

            vehicle.speed *=
                0.90;


            if (
                vehicle.speed < 2
            ) {

                vehicle.speed =
                    0;
            }


            vehicle.stopped =
                true;


            continue;
        }


        vehicle.stopped =
            false;


        const road =
            roads[
                vehicle.roadIndex
            ];


        if (!road) {

            continue;
        }


        const points =
            road.points;


        const index =
            vehicle.pointIndex;


        if (
            index >=
            points.length - 1
        ) {

            vehicle.pointIndex =
                0;

            vehicle.progress =
                0;

            continue;
        }


        const start =
            points[index];


        const end =
            points[index + 1];


        const dx =
            end.x -
            start.x;


        const dy =
            end.y -
            start.y;


        const segmentLength =
            Math.hypot(
                dx,
                dy
            );


        if (
            segmentLength <= 0
        ) {

            continue;
        }


        vehicle.progress +=
            (
                vehicle.speed *
                delta
            ) /
            segmentLength;


        while (
            vehicle.progress >= 1
        ) {

            vehicle.progress -=
                1;


            vehicle.pointIndex++;


            if (
                vehicle.pointIndex >=
                points.length - 1
            ) {

                vehicle.pointIndex =
                    0;

                vehicle.progress =
                    0;

                break;
            }
        }


        const current =
            points[
                vehicle.pointIndex
            ];


        const next =
            points[
                vehicle.pointIndex + 1
            ];


        vehicle.x =
            current.x +
            (
                next.x -
                current.x
            ) *
            vehicle.progress;


        vehicle.y =
            current.y +
            (
                next.y -
                current.y
            ) *
            vehicle.progress;


        vehicle.angle =
            Math.atan2(
                next.x -
                current.x,
                -(
                    next.y -
                    current.y
                )
            );
    }
}


// ==========================================================
// COLISIONES CON TRÁFICO
// ==========================================================

function checkTrafficCollisions() {

    for (
        const vehicle of traffic
    ) {

        const d =
            distance(
                truck.x,
                truck.y,
                vehicle.x,
                vehicle.y
            );


        if (
            d <
            55
        ) {

            registerDamage(
                0.35
            );


            truck.speed *=
                0.72;


            vehicle.speed *=
                0.55;


            showMessage(
                "⚠ COLISION CON TRAFICO"
            );
        }
    }
}


// ==========================================================
// DIBUJAR VEHÍCULO
// ==========================================================

function drawTrafficVehicle(
    vehicle
) {

    const p =
        worldToScreen(
            vehicle.x,
            vehicle.y
        );


    if (
        p.x < -100 ||
        p.x >
            canvas.width + 100 ||
        p.y < -150 ||
        p.y >
            canvas.height + 150
    ) {

        return;
    }


    ctx.save();


    ctx.translate(
        p.x,
        p.y
    );


    ctx.rotate(
        vehicle.angle
    );


    // SOMBRA

    ctx.fillStyle =
        "rgba(0,0,0,0.35)";


    ctx.fillRect(
        -vehicle.width / 2 - 3,
        -vehicle.length / 2 + 4,
        vehicle.width + 6,
        vehicle.length
    );


    // CUERPO

    ctx.fillStyle =
        vehicle.color;


    ctx.fillRect(
        -vehicle.width / 2,
        -vehicle.length / 2,
        vehicle.width,
        vehicle.length
    );


    // CRISTALES

    ctx.fillStyle =
        "#6d9db3";


    ctx.fillRect(
        -vehicle.width / 2 + 3,
        -vehicle.length / 2 + 6,
        vehicle.width - 6,
        vehicle.length * 0.28
    );


    // RUEDAS

    ctx.fillStyle =
        "#111";


    ctx.fillRect(
        -vehicle.width / 2 - 3,
        -vehicle.length / 2 + 8,
        4,
        16
    );


    ctx.fillRect(
        vehicle.width / 2 - 1,
        -vehicle.length / 2 + 8,
        4,
        16
    );


    ctx.fillRect(
        -vehicle.width / 2 - 3,
        vehicle.length / 2 - 24,
        4,
        16
    );


    ctx.fillRect(
        vehicle.width / 2 - 1,
        vehicle.length / 2 - 24,
        4,
        16
    );


    // FAROS

    ctx.fillStyle =
        "#fff3a6";


    ctx.fillRect(
        -vehicle.width / 2 + 3,
        -vehicle.length / 2 - 2,
        6,
        4
    );


    ctx.fillRect(
        vehicle.width / 2 - 9,
        -vehicle.length / 2 - 2,
        6,
        4
    );


    ctx.restore();
}


// ==========================================================
// DIBUJAR TODO EL TRÁFICO
// ==========================================================

function drawTraffic() {

    for (
        const vehicle of traffic
    ) {

        drawTrafficVehicle(
            vehicle
        );
    }
}


// ==========================================================
// LUCES
// ==========================================================

let lightsOn =
    false;


function toggleLights() {

    lightsOn =
        !lightsOn;


    showMessage(
        lightsOn
            ? "💡 LUCES ENCENDIDAS"
            : "💡 LUCES APAGADAS"
    );
}


// ==========================================================
// CICLO DÍA / NOCHE
// ==========================================================

let worldTime =
    12;


const DAY_SPEED =
    0.018;


function updateDayNight(
    delta
) {

    worldTime +=
        DAY_SPEED *
        delta *
        60;


    if (
        worldTime >= 24
    ) {

        worldTime -=
            24;
    }
}


function getNightAmount() {

    if (
        worldTime >= 7 &&
        worldTime <= 19
    ) {

        return 0;
    }


    if (
        worldTime > 19 &&
        worldTime < 21
    ) {

        return (
            worldTime -
            19
        ) /
        2;
    }


    if (
        worldTime >= 5 &&
        worldTime < 7
    ) {

        return (
            7 -
            worldTime
        ) /
        2;
    }


    return 0.78;
}


// ==========================================================
// CLIMA
// ==========================================================

let weather =
    "despejado";


let weatherTimer =
    0;


const weatherTypes = [
    "despejado",
    "nublado",
    "lluvia"
];


function updateWeather(
    delta
) {

    weatherTimer +=
        delta;


    if (
        weatherTimer >
        35
    ) {

        weatherTimer =
            0;


        const index =
            Math.floor(
                Math.random() *
                weatherTypes.length
            );


        weather =
            weatherTypes[
                index
            ];


        showMessage(
            "TIEMPO: " +
            weather.toUpperCase()
        );
    }
}


// ==========================================================
// LLUVIA
// ==========================================================

const rainDrops = [];


function createRain() {

    rainDrops.length =
        0;


    for (
        let i = 0;
        i < 180;
        i++
    ) {

        rainDrops.push({

            x:
                Math.random() *
                canvas.width,

            y:
                Math.random() *
                canvas.height,

            speed:
                450 +
                Math.random() *
                300

        });
    }
}


createRain();


function updateRain(
    delta
) {

    if (
        weather !==
        "lluvia"
    ) {

        return;
    }


    for (
        const drop of rainDrops
    ) {

        drop.y +=
            drop.speed *
            delta;


        if (
            drop.y >
            canvas.height
        ) {

            drop.y =
                -20;

            drop.x =
                Math.random() *
                canvas.width;
        }
    }
}


function drawRain() {

    if (
        weather !==
        "lluvia"
    ) {

        return;
    }


    ctx.strokeStyle =
        "rgba(180,210,255,0.35)";


    ctx.lineWidth =
        1;


    for (
        const drop of rainDrops
    ) {

        ctx.beginPath();


        ctx.moveTo(
            drop.x,
            drop.y
        );


        ctx.lineTo(
            drop.x - 5,
            drop.y + 18
        );


        ctx.stroke();
    }
}


// ==========================================================
// NUBES
// ==========================================================

function drawClouds() {

    if (
        weather !==
        "nublado"
        &&
        weather !==
        "lluvia"
    ) {

        return;
    }


    ctx.fillStyle =
        "rgba(180,190,195,0.18)";


    for (
        let i = 0;
        i < 8;
        i++
    ) {

        const x =
            (
                i * 230 +
                worldTime * 8
            )
            %
            (
                canvas.width +
                300
            ) -
            150;


        const y =
            50 +
            (
                i %
                4
            ) *
            90;


        ctx.beginPath();


        ctx.arc(
            x,
            y,
            45,
            0,
            Math.PI * 2
        );


        ctx.arc(
            x + 40,
            y - 12,
            55,
            0,
            Math.PI * 2
        );


        ctx.arc(
            x + 90,
            y,
            40,
            0,
            Math.PI * 2
        );


        ctx.fill();
    }
}


// ==========================================================
// EFECTO DÍA/NOCHE
// ==========================================================

function drawNightOverlay() {

    const amount =
        getNightAmount();


    if (
        amount <= 0
    ) {

        return;
    }


    ctx.fillStyle =
        "rgba(5,12,35," +
        (
            amount *
            0.68
        ) +
        ")";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}


// ==========================================================
// LUCES DEL CAMIÓN
// ==========================================================

function drawTruckLights() {

    if (
        !lightsOn
    ) {

        return;
    }


    if (
        getNightAmount() <= 0
    ) {

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


    const gradient =
        ctx.createRadialGradient(
            0,
            -80,
            5,
            0,
            -100,
            140
        );


    gradient.addColorStop(
        0,
        "rgba(255,250,190,0.38)"
    );


    gradient.addColorStop(
        1,
        "rgba(255,250,190,0)"
    );


    ctx.fillStyle =
        gradient;


    ctx.beginPath();


    ctx.moveTo(
        -18,
        -70
    );


    ctx.lineTo(
        -130,
        -230
    );


    ctx.lineTo(
        130,
        -230
    );


    ctx.lineTo(
        18,
        -70
    );


    ctx.closePath();


    ctx.fill();


    ctx.restore();
}


// ==========================================================
// TIEMPO EN HUD
// ==========================================================

function formatTime() {

    const hours =
        Math.floor(
            worldTime
        );


    const minutes =
        Math.floor(
            (
                worldTime -
                hours
            ) *
            60
        );


    return (
        String(hours)
            .padStart(2, "0")
        +
        ":" +
        String(minutes)
            .padStart(2, "0")
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


    const margin =
        50;


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


    // CARRETERAS

    for (
        const road of roads
    ) {

        ctx.beginPath();


        road.points.forEach(
            function(point, index) {

                const px =
                    margin +
                    point.x *
                    scaleX;


                const py =
                    margin +
                    point.y *
                    scaleY;


                if (
                    index === 0
                ) {

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
            road.type ===
            "autopista"
        ) {

            ctx.strokeStyle =
                "#ffffff";

        } else if (
            road.type ===
            "autovia"
        ) {

            ctx.strokeStyle =
                "#e4c34c";

        } else if (
            road.type ===
            "nacional"
        ) {

            ctx.strokeStyle =
                "#e48c45";

        } else {

            ctx.strokeStyle =
                "#888";
        }


        ctx.lineWidth =
            road.type ===
            "autopista"
                ? 5
                : 3;


        ctx.stroke();
    }


    // TRÁFICO

    for (
        const vehicle of traffic
    ) {

        const vx =
            margin +
            vehicle.x *
            scaleX;


        const vy =
            margin +
            vehicle.y *
            scaleY;


        ctx.fillStyle =
            "#ff8c42";


        ctx.beginPath();

        ctx.arc(
            vx,
            vy,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    // CIUDADES

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
            "#ffffff";


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


    // PUEBLOS

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


    // CAMIÓN

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


    // TÍTULO

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
// SERVICIOS
// ==========================================================

function getNearestServicePoint(
    type
) {

    let nearest =
        null;


    let nearestDistance =
        Infinity;


    for (
        const poi of pointsOfInterest
    ) {

        if (
            poi.type !==
            type
        ) {

            continue;
        }


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
        ) *
        0.08;


    camera.y +=
        (
            truck.y -
            camera.y
        ) *
        0.08;
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

    const x =
        20;


    const y =
        20;


    const width =
        310;


    const height =
        310;


    ctx.fillStyle =
        "rgba(10,14,18,0.90)";


    ctx.fillRect(
        x,
        y,
        width,
        height
    );


    // VELOCIDAD

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
        Math.round(
            truck.speed
        ),
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


    // MARCHA

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


    // RPM

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
        Math.round(
            truck.rpm
        ),
        x + 60,
        y + 98
    );


    // BARRA RPM

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
        ) /
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
        Math.round(
            truck.fuel
        ) +
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


    // PESO

    ctx.fillStyle =
        "#aaa";


    ctx.fillText(
        "PESO: " +
        getTotalWeight() +
        " kg",
        x + 20,
        y + 238
    );


    // HORA

    ctx.fillStyle =
        "#fff";


    ctx.font =
        "bold 16px Arial";


    ctx.fillText(
        "Hora: " +
        formatTime(),
        x + 20,
        y + 263
    );


    // TIEMPO

    ctx.fillStyle =
        "#aaa";


    ctx.font =
        "13px Arial";


    ctx.fillText(
        "Tiempo: " +
        weather,
        x + 20,
        y + 285
    );


    // LUCES

    ctx.fillText(
        "Luces: " +
        (
            lightsOn
                ? "ON"
                : "OFF"
        ),
        x + 165,
        y + 285
    );
}


// ==========================================================
// MENSAJES
// ==========================================================

let message =
    "";


let messageTimer =
    0;


function showMessage(
    text
) {

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


    const width =
        440;


    const height =
        52;


    const x =
        canvas.width / 2 -
        width / 2;


    const y =
        20;


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

    if (
        fullMap
    ) {

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


    ctx.lineWidth =
        3;


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
// HUD EXTERNO
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


    const lights =
        document.getElementById(
            "lightsStatus"
        );


    if (lights) {

        lights.textContent =
            lightsOn
                ? "ON"
                : "OFF";
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
// TIEMPO DEL BUCLE
// ==========================================================

let lastFrameTime =
    performance.now();


// ==========================================================
// BUCLE PRINCIPAL
// ==========================================================

function gameLoop(
    currentTime
) {

    const delta =
        Math.min(
            0.05,
            (
                currentTime -
                lastFrameTime
            ) /
            1000
        );


    lastFrameTime =
        currentTime;


    // ACTUALIZACIÓN

    updateTruck();


    updateTraffic(
        delta
    );


    checkTrafficCollisions();


    updateTrafficLights(
        delta
    );


    updateDayNight(
        delta
    );


    updateWeather(
        delta
    );


    updateRain(
        delta
    );


    // RENDER

    if (fullMap) {

        drawFullMap();

    } else {

        drawWorld();

        drawClouds();

        drawRoads();

        drawCities();

        drawVillages();

        drawPOIs();

        drawSigns();

        drawTrafficLights();

        drawTraffic();

        drawTruck();

        drawTruckLights();

        drawHUD();

        drawMinimap();

        drawRain();

        drawNightOverlay();

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
    "FASES 1 + 2 + 3 CARGADAS"
);


requestAnimationFrame(
    gameLoop
);

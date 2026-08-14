"use strict";

/*
============================================================
 TRUCK DRIVER
 FASE 1 - SISTEMA DE CONDUCCIÓN
============================================================

 INCLUYE:

 - Camión
 - Física
 - Peso
 - Carga
 - Marchas 1-8
 - Marcha atrás
 - RPM
 - Frenos
 - Freno motor
 - Combustible
 - Daños
 - Limitador
 - HUD
 - Controles
============================================================
*/


// ==========================================================
// CANVAS
// ==========================================================

const canvas = document.getElementById("gameCanvas");

if (!canvas) {
    throw new Error(
        "No existe <canvas id=\"gameCanvas\"> en index.html"
    );
}

const ctx = canvas.getContext("2d");

if (!ctx) {
    throw new Error(
        "No se pudo crear el contexto 2D."
    );
}


// ==========================================================
// TAMAÑO
// ==========================================================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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
    function (event) {

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


        // SUBIR MARCHA
        if (
            key === "+" ||
            key === "="
        ) {

            changeGear(1);
        }


        // BAJAR MARCHA
        if (key === "-") {

            changeGear(-1);
        }


        // MARCHA ATRÁS
        if (key === "b") {

            toggleReverse();
        }


        // REPOSTAR
        if (key === "r") {

            refuel();
        }


        // EVITAR SCROLL
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
                "r"
            ].includes(key)
        ) {

            event.preventDefault();
        }

    }
);


window.addEventListener(
    "keyup",
    function (event) {

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

const WORLD_WIDTH = 7000;
const WORLD_HEIGHT = 5000;


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

    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,

    angle: 0,

    // ----------------------------------------------
    // VELOCIDAD
    // ----------------------------------------------

    speed: 0,

    maxSpeed: 130,

    // ----------------------------------------------
    // ACELERACIÓN
    // ----------------------------------------------

    acceleration: 0,

    // ----------------------------------------------
    // FRENOS
    // ----------------------------------------------

    brakePower: 1.35,

    engineBrake: 0.025,

    // ----------------------------------------------
    // DIRECCIÓN
    // ----------------------------------------------

    steering: 0.035,

    // ----------------------------------------------
    // COMBUSTIBLE
    // ----------------------------------------------

    fuel: 100,

    fuelCapacity: 100,

    // ----------------------------------------------
    // DAÑOS
    // ----------------------------------------------

    damage: 0,

    maxDamage: 100,

    // ----------------------------------------------
    // PESO
    // ----------------------------------------------

    emptyWeight: 8000,

    cargoWeight: 0,

    // ----------------------------------------------
    // MARCHA
    // ----------------------------------------------

    gear: 1,

    reverse: false,

    // ----------------------------------------------
    // RPM
    // ----------------------------------------------

    rpm: 800,

    minRPM: 700,

    maxRPM: 2200,

    idleRPM: 800,

    // ----------------------------------------------
    // LIMITADOR
    // ----------------------------------------------

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
// MASA TOTAL
// ==========================================================

function getTotalWeight() {

    return (
        truck.emptyWeight +
        truck.cargoWeight
    );
}


// ==========================================================
// FACTOR DE PESO
// ==========================================================

function getWeightFactor() {

    const weight =
        getTotalWeight();


    /*
    8000 kg = factor 1
    20000 kg = aproximadamente 0.55
    40000 kg = aproximadamente 0.30
    */

    const factor =
        8000 /
        weight;


    return Math.max(
        0.25,
        Math.min(
            1,
            factor
        )
    );
}


// ==========================================================
// CAMBIAR MARCHA
// ==========================================================

function changeGear(direction) {

    // No se puede cambiar a marchas normales
    // estando en R
    if (truck.reverse) {

        showMessage(
            "Pulsa B para salir de la marcha atrás."
        );

        return;
    }


    // Velocidad demasiado alta para una marcha
    // inferior: impedimos cambios destructivos
    if (
        direction < 0 &&
        truck.gear === 1
    ) {

        return;
    }


    truck.gear += direction;


    // LIMITES
    if (
        truck.gear < 1
    ) {

        truck.gear = 1;
    }


    if (
        truck.gear > 8
    ) {

        truck.gear = 8;
    }


    showMessage(
        "MARCHA " +
        truck.gear
    );
}


// ==========================================================
// MARCHA ATRÁS
// ==========================================================

function toggleReverse() {

    /*
    No permitimos cambiar a R mientras
    el camión está moviéndose rápido.
    */

    if (
        truck.speed > 3
    ) {

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

    if (
        truck.reverse
    ) {

        /*
        RPM en marcha atrás
        */

        const targetRPM =
            truck.idleRPM +
            truck.speed *
            35;


        truck.rpm +=
            (
                targetRPM -
                truck.rpm
            ) *
            0.08;

        return;
    }


    const gear =
        gears[
            truck.gear
        ];


    if (!gear) {

        return;
    }


    /*
    RPM aproximadas según velocidad
    y marcha.
    */

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


    /*
    Acelerando sube algo más
    */

    if (keys.w) {

        targetRPM += 150;
    }


    /*
    Frenando baja
    */

    if (keys.s) {

        targetRPM -= 100;
    }


    targetRPM =
        Math.max(
            truck.minRPM,
            Math.min(
                truck.maxRPM,
                targetRPM
            )
        );


    truck.rpm +=
        (
            targetRPM -
            truck.rpm
        ) *
        0.12;
}


// ==========================================================
// ACELERACIÓN
// ==========================================================

function updateAcceleration() {

    if (
        truck.reverse
    ) {

        /*
        La marcha atrás tiene
        menos potencia.
        */

        if (keys.w) {

            const weightFactor =
                getWeightFactor();


            truck.speed +=
                0.38 *
                weightFactor;
        }


        return;
    }


    const gear =
        gears[
            truck.gear
        ];


    if (!gear) {

        return;
    }


    if (keys.w) {

        const weightFactor =
            getWeightFactor();


        /*
        Aceleración dependiente de:
        - marcha
        - peso
        - RPM
        */

        let power =
            gear.acceleration *
            weightFactor;


        /*
        El motor pierde fuerza
        cerca del límite de RPM.
        */

        if (
            truck.rpm >
            2000
        ) {

            power *= 0.65;
        }


        if (
            truck.rpm <
            900
        ) {

            power *= 0.70;
        }


        truck.speed +=
            power;
    }
}


// ==========================================================
// FRENADO
// ==========================================================

function updateBrakes() {

    if (
        keys.s
    ) {

        truck.speed -=
            truck.brakePower;


        /*
        Freno motor adicional.
        */

        truck.speed -=
            truck.engineBrake *
            (
                1 +
                truck.gear *
                0.3
            );
    }
}


// ==========================================================
// FÍSICA NATURAL
// ==========================================================

function applyNaturalResistance() {

    if (
        !keys.w &&
        !keys.s
    ) {

        /*
        Resistencia aerodinámica
        y rodadura.
        */

        truck.speed *=
            0.992;


        /*
        Freno motor.
        */

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
// LÍMITES DE VELOCIDAD
// ==========================================================

function applySpeedLimits() {

    let maximum;


    if (
        truck.reverse
    ) {

        maximum = 25;

    } else {

        const gear =
            gears[
                truck.gear
            ];


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

        truck.speed = 0;
    }
}


// ==========================================================
// DIRECCIÓN
// ==========================================================

function updateSteering() {

    /*
    Cuanto más rápido, menos
    giro brusco.
    */

    const speedFactor =
        Math.min(
            1,
            truck.speed /
            40
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


    /*
    Marcha atrás
    */

    if (
        truck.reverse
    ) {

        movement *= -1;
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
// LÍMITES DEL MAPA
// ==========================================================

function keepTruckInsideWorld() {

    const margin = 80;


    if (
        truck.x <
        margin
    ) {

        truck.x =
            margin;

        registerDamage(
            1
        );
    }


    if (
        truck.x >
        WORLD_WIDTH -
        margin
    ) {

        truck.x =
            WORLD_WIDTH -
            margin;

        registerDamage(
            1
        );
    }


    if (
        truck.y <
        margin
    ) {

        truck.y =
            margin;

        registerDamage(
            1
        );
    }


    if (
        truck.y >
        WORLD_HEIGHT -
        margin
    ) {

        truck.y =
            WORLD_HEIGHT -
            margin;

        registerDamage(
            1
        );
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


    /*
    Cuanto más pesa y más rápido
    va el camión, más combustible
    consume.
    */

    const weightFactor =
        getTotalWeight() /
        8000;


    const consumption =
        0.000025 *
        truck.speed *
        weightFactor;


    truck.fuel -=
        consumption;


    if (
        truck.fuel <
        0
    ) {

        truck.fuel = 0;
    }


    /*
    Sin combustible:
    no puede acelerar.
    */

    if (
        truck.fuel <= 0
    ) {

        truck.speed *=
            0.995;
    }
}


// ==========================================================
// REPOSTAR
// ==========================================================

function refuel() {

    if (
        truck.fuel >=
        truck.fuelCapacity
    ) {

        showMessage(
            "El depósito ya está lleno."
        );

        return;
    }


    truck.fuel =
        truck.fuelCapacity;


    showMessage(
        "Depósito lleno."
    );
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
        Math.min(
            truck.maxDamage,
            truck.damage
        );


    if (
        truck.damage >=
        100
    ) {

        truck.speed *=
            0.5;


        showMessage(
            "¡Camión muy dañado!"
        );
    }
}


// ==========================================================
// SIMULACIÓN DE DAÑOS POR VELOCIDAD
// ==========================================================

function updateDamageEffects() {

    /*
    El daño reduce la potencia.
    */

    if (
        truck.damage > 0
    ) {

        const damageFactor =
            1 -
            (
                truck.damage /
                100
            ) *
            0.35;


        truck.speed *=
            damageFactor +
            (
                1 -
                damageFactor
            ) *
            0.98;
    }
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
// ACTUALIZACIÓN COMPLETA
// ==========================================================

function updateTruck() {

    /*
    Orden de simulación
    */

    updateAcceleration();

    updateBrakes();

    applyNaturalResistance();

    applySpeedLimits();

    updateSteering();

    updateMovement();

    keepTruckInsideWorld();

    updateRPM();

    updateFuel();

    updateDamageEffects();

    updateCamera();
}


// ==========================================================
// WORLD TO SCREEN
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
        "#647b58";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
    Cuadrícula sencilla para
    visualizar el movimiento.
    */

    ctx.strokeStyle =
        "rgba(255,255,255,0.08)";


    ctx.lineWidth = 1;


    const gridSize =
        120;


    for (
        let x = -100;
        x <
        canvas.width + 100;
        x += gridSize
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
        let y = -100;
        y <
        canvas.height + 100;
        y += gridSize
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
// CAMINO DE PRUEBA
// ==========================================================

function drawTestRoad() {

    const center =
        worldToScreen(
            WORLD_WIDTH / 2,
            WORLD_HEIGHT / 2
        );


    /*
    Carretera horizontal
    */

    ctx.fillStyle =
        "#27292a";


    ctx.fillRect(
        0,
        center.y - 100,
        canvas.width,
        200
    );


    /*
    Línea central
    */

    ctx.strokeStyle =
        "#e5d16a";


    ctx.lineWidth = 4;


    ctx.setLineDash(
        [30, 25]
    );


    ctx.beginPath();

    ctx.moveTo(
        0,
        center.y
    );

    ctx.lineTo(
        canvas.width,
        center.y
    );

    ctx.stroke();


    ctx.setLineDash([]);


    /*
    Línea lateral
    */

    ctx.strokeStyle =
        "#ffffff";


    ctx.lineWidth = 4;


    ctx.beginPath();

    ctx.moveTo(
        0,
        center.y - 80
    );

    ctx.lineTo(
        canvas.width,
        center.y - 80
    );

    ctx.moveTo(
        0,
        center.y + 80
    );

    ctx.lineTo(
        canvas.width,
        center.y + 80
    );

    ctx.stroke();
}


// ==========================================================
// CAMIÓN
// ==========================================================

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


    /*
    SOMBRA
    */

    ctx.fillStyle =
        "rgba(0,0,0,0.35)";


    ctx.fillRect(
        -32,
        -63,
        64,
        145
    );


    /*
    REMOLQUE
    */

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


    /*
    CABINA
    */

    ctx.fillStyle =
        "#c83232";


    ctx.fillRect(
        -29,
        -70,
        58,
        62
    );


    /*
    PARABRISAS
    */

    ctx.fillStyle =
        "#71a8c5";


    ctx.fillRect(
        -21,
        -61,
        42,
        25
    );


    /*
    PARACHOQUES
    */

    ctx.fillStyle =
        "#c9c9c9";


    ctx.fillRect(
        -31,
        -77,
        62,
        8
    );


    /*
    RUEDAS
    */

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


    /*
    FAROS
    */

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
// HUD PRINCIPAL
// ==========================================================

function drawHUD() {

    /*
    PANEL
    */

    const x = 20;

    const y =
        20;


    const width =
        300;


    const height =
        250;


    ctx.fillStyle =
        "rgba(10,14,18,0.88)";


    ctx.fillRect(
        x,
        y,
        width,
        height
    );


    /*
    VELOCIDAD
    */

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


    /*
    MARCHA
    */

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


    /*
    RPM
    */

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


    /*
    BARRA RPM
    */

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
        rpmPercent >
        0.85
            ? "#e44b4b"
            : "#e5c44d";


    ctx.fillRect(
        x + 20,
        y + 110,
        250 *
        Math.max(
            0,
            Math.min(
                1,
                rpmPercent
            )
        ),
        14
    );


    /*
    COMBUSTIBLE
    */

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
        truck.fuel <
        20
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


    /*
    DAÑOS
    */

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
        truck.damage >
        60
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


    /*
    PESO
    */

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
// MENSAJE
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


// ==========================================================
// MENSAJE EN PANTALLA
// ==========================================================

function drawMessage() {

    if (
        messageTimer <= 0
    ) {

        return;
    }


    const width =
        420;


    const height =
        50;


    const x =
        canvas.width / 2 -
        width / 2;


    const y =
        25;


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
        y + 31
    );


    ctx.textAlign =
        "left";


    messageTimer--;
}


// ==========================================================
// ACTUALIZAR HUD DE INDEX.HTML
// ==========================================================

function updateExternalHUD() {

    /*
    VELOCIDAD
    */

    const speedElement =
        document.getElementById(
            "bottomSpeed"
        );


    if (
        speedElement
    ) {

        speedElement.textContent =
            Math.round(
                truck.speed
            );
    }


    /*
    MARCHA
    */

    const gearElement =
        document.getElementById(
            "bottomGear"
        );


    if (
        gearElement
    ) {

        gearElement.textContent =
            truck.reverse
                ? "R"
                : truck.gear;
    }


    /*
    CRUCERO
    */

    const cruiseElement =
        document.getElementById(
            "cruiseStatus"
        );


    if (
        cruiseElement
    ) {

        cruiseElement.textContent =
            "OFF";
    }


    /*
    INTERMITENTES
    */

    const indicatorElement =
        document.getElementById(
            "indicatorStatus"
        );


    if (
        indicatorElement
    ) {

        indicatorElement.textContent =
            "—";
    }


    /*
    LUCES
    */

    const lightsElement =
        document.getElementById(
            "lightsStatus"
        );


    if (
        lightsElement
    ) {

        lightsElement.textContent =
            "OFF";
    }


    /*
    FRENO MOTOR
    */

    const engineBrakeElement =
        document.getElementById(
            "engineBrakeStatus"
        );


    if (
        engineBrakeElement
    ) {

        const engineBraking =
            !keys.w &&
            truck.speed >
            5;


        engineBrakeElement.textContent =
            engineBraking
                ? "ON"
                : "OFF";
    }
}


// ==========================================================
// GAME LOOP
// ==========================================================

function gameLoop() {

    updateTruck();

    drawWorld();

    drawTestRoad();

    drawTruck();

    drawHUD();

    drawMessage();

    updateExternalHUD();


    requestAnimationFrame(
        gameLoop
    );
}


// ==========================================================
// INICIO
// ==========================================================

showMessage(
    "FASE 1: CAMIÓN LISTO"
);


gameLoop();

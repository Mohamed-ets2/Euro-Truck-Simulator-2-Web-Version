"use strict";


/* ============================================================
   CANVAS
   ============================================================ */

const canvas =
    document.getElementById(
        "gameCanvas"
    );

if (!canvas) {

    throw new Error(
        "No existe gameCanvas en index.html"
    );
}

const ctx =
    canvas.getContext("2d");


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


/* ============================================================
   VARIABLES
   ============================================================ */

const keys = {};

let paused = false;

let fullMap = false;

let lights = false;

let raining = false;

let money = 25000;

let fines = 0;

let hour = 12;

let currentRoad = null;

let message =
    "MUNDO CARGADO";

let messageTime =
    Date.now() + 4000;


/* ============================================================
   CAMIÓN
   ============================================================ */

const truck = {

    x: 7600,

    y: 5000,

    angle: 0,

    speed: 0,

    gear: 1,

    reverse: false,

    rpm: 800,

    fuel: 100,

    cargoWeight: 0,

    emptyWeight: 8000
};


const GEARS = {

    1: {
        max: 18,
        power: 0.82
    },

    2: {
        max: 32,
        power: 0.69
    },

    3: {
        max: 48,
        power: 0.57
    },

    4: {
        max: 65,
        power: 0.46
    },

    5: {
        max: 82,
        power: 0.37
    },

    6: {
        max: 99,
        power: 0.30
    },

    7: {
        max: 116,
        power: 0.24
    },

    8: {
        max: 130,
        power: 0.19
    }
};


/* ============================================================
   CÁMARA
   ============================================================ */

const camera = {

    x: truck.x,

    y: truck.y
};


/* ============================================================
   TECLADO
   ============================================================ */

window.addEventListener(
    "keydown",
    e => {

        const key =
            e.key.toLowerCase();

        keys[key] = true;

        if (
            [
                "w",
                "a",
                "s",
                "d",
                "b",
                "n",
                "r",
                "m",
                "l",
                "p",
                "+",
                "=",
                "-"
            ].includes(key)
        ) {
            e.preventDefault();
        }

        if (e.repeat)
            return;

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

        if (key === "n") {

            acceptJob(truck);
        }

        if (key === "r") {

            refuel();
        }

        if (key === "m") {

            fullMap =
                !fullMap;
        }

        if (key === "l") {

            lights =
                !lights;
        }

        if (key === "p") {

            paused =
                !paused;
        }

        if (key === "escape") {

            fullMap = false;
        }
    }
);


window.addEventListener(
    "keyup",
    e => {

        keys[
            e.key.toLowerCase()
        ] = false;
    }
);


/* ============================================================
   MENSAJES
   ============================================================ */

function showMessage(text) {

    message = text;

    messageTime =
        Date.now() + 3000;
}


function drawMessage() {

    if (
        Date.now() >
        messageTime
    ) {
        return;
    }

    const width = 620;

    const x =
        canvas.width / 2 -
        width / 2;

    ctx.fillStyle =
        "rgba(0,0,0,.8)";

    ctx.fillRect(
        x,
        30,
        width,
        50
    );

    ctx.fillStyle =
        "white";

    ctx.font =
        "bold 17px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        message,
        canvas.width / 2,
        62
    );

    ctx.textAlign =
        "left";
}


/* ============================================================
   MOVIMIENTO
   ============================================================ */

function updatePhysics() {

    if (truck.fuel <= 0) {

        truck.speed *= .98;

        return;
    }

    const weightFactor =
        clamp(
            8000 /
            (
                truck.emptyWeight +
                truck.cargoWeight
            ),
            .35,
            1
        );

    if (truck.reverse) {

        if (keys["w"]) {

            truck.speed +=
                .3 *
                weightFactor;
        }

    } else {

        const gear =
            GEARS[
                truck.gear
            ];

        if (keys["w"]) {

            truck.speed +=
                gear.power *
                weightFactor;
        }
    }

    if (keys["s"]) {

        truck.speed -= 1.15;

        if (truck.speed < 0)
            truck.speed = 0;
    }

    if (
        !keys["w"] &&
        !keys["s"]
    ) {

        truck.speed *= .994;

        truck.speed -= .015;

        if (truck.speed < 0)
            truck.speed = 0;
    }

    const maxSpeed =
        truck.reverse
            ? 22
            : GEARS[
                truck.gear
            ].max;

    if (
        truck.speed >
        maxSpeed
    ) {

        truck.speed =
            maxSpeed;
    }


    /* Dirección */

    const steering =
        .045 *
        Math.min(
            1,
            truck.speed / 20
        );

    if (keys["a"]) {

        truck.angle -=
            steering;
    }

    if (keys["d"]) {

        truck.angle +=
            steering;
    }


    /* Movimiento */

    let movement =
        truck.speed * .23;

    if (truck.reverse)
        movement *= -1;

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


    /* Límites del mundo */

    truck.x =
        clamp(
            truck.x,
            WORLD.minX,
            WORLD.maxX
        );

    truck.y =
        clamp(
            truck.y,
            WORLD.minY,
            WORLD.maxY
        );


    /* RPM */

    const activeGear =
        truck.reverse
            ? 1
            : truck.gear;

    const gearData =
        GEARS[
            activeGear
        ];

    truck.rpm =
        700 +
        (
            truck.speed /
            gearData.max
        ) * 1500;

    truck.rpm =
        clamp(
            truck.rpm,
            700,
            2300
        );


    /* Combustible */

    truck.fuel -=
        truck.speed *
        .000035 *
        (
            1 +
            truck.cargoWeight /
            20000
        );

    truck.fuel =
        clamp(
            truck.fuel,
            0,
            100
        );
}


/* ============================================================
   MARCHAS
   ============================================================ */

function changeGear(direction) {

    if (truck.reverse) {

        showMessage(
            "Quita la marcha atrás con B"
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
            "Detén el camión primero"
        );

        return;
    }

    truck.reverse =
        !truck.reverse;

    truck.gear =
        truck.reverse
            ? 1
            : 1;

    showMessage(
        truck.reverse
            ? "R — MARCHA ATRÁS"
            : "MARCHA 1"
    );
}


/* ============================================================
   GASOLINERA
   ============================================================ */

function refuel() {

    let nearest = null;

    let best = Infinity;

    for (const service of SERVICES) {

        if (
            service.type !==
            "fuel"
        )
            continue;

        const d =
            distance(
                truck.x,
                truck.y,
                service.x,
                service.y
            );

        if (d < best) {

            best = d;

            nearest =
                service;
        }
    }

    if (
        !nearest ||
        best > 250
    ) {

        showMessage(
            "Acércate a una gasolinera"
        );

        return;
    }

    const cost =
        Math.round(
            (
                100 -
                truck.fuel
            ) * 1.8
        );

    if (money < cost) {

        showMessage(
            "No tienes suficiente dinero"
        );

        return;
    }

    money -= cost;

    truck.fuel = 100;

    showMessage(
        "⛽ REPOSTAJE -€" +
        cost
    );
}


/* ============================================================
   TRÁFICO
   ============================================================ */

function updateTraffic() {

    /*
       MUY IMPORTANTE:

       El tráfico NO tiene colisiones.

       Por tanto:
       - no bloquea al camión
       - no provoca game over
       - no muestra "colisión con tráfico"
    */

    for (const car of TRAFFIC) {

        car.x +=
            Math.sin(
                car.angle
            ) *
            car.speed;

        car.y -=
            Math.cos(
                car.angle
            ) *
            car.speed;

        if (
            car.x <
            WORLD.minX - 500 ||
            car.x >
            WORLD.maxX + 500 ||
            car.y <
            WORLD.minY - 500 ||
            car.y >
            WORLD.maxY + 500
        ) {

            const road =
                ROADS[
                    Math.floor(
                        Math.random() *
                        ROADS.length
                    )
                ];

            if (
                road &&
                road.points.length
            ) {

                const point =
                    road.points[0];

                car.x =
                    point[0];

                car.y =
                    point[1];

                car.angle =
                    Math.random() *
                    Math.PI *
                    2;
            }
        }
    }
}


/* ============================================================
   CÁMARA
   ============================================================ */

function updateCamera() {

    camera.x +=
        (
            truck.x -
            camera.x
        ) * .08;

    camera.y +=
        (
            truck.y -
            camera.y
        ) * .08;
}


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


/* ============================================================
   HORA
   ============================================================ */

function updateEnvironment() {

    hour += .0025;

    if (hour >= 24)
        hour = 0;

    if (
        Math.random() <
        .00003
    ) {

        raining =
            !raining;
    }
}


/* ============================================================
   FONDO
   ============================================================ */

function drawBackground() {

    const night =
        hour < 7 ||
        hour > 20;

    ctx.fillStyle =
        night
            ? "#172331"
            : "#5c8054";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}


/* ============================================================
   CARRETERAS
   ============================================================ */

function drawRoads() {

    for (const road of ROADS) {

        if (
            road.points.length <
            2
        )
            continue;

        ctx.beginPath();

        road.points.forEach(
            (point, index) => {

                const p =
                    worldToScreen(
                        point[0],
                        point[1]
                    );

                if (index === 0)
                    ctx.moveTo(
                        p.x,
                        p.y
                    );
                else
                    ctx.lineTo(
                        p.x,
                        p.y
                    );
            }
        );

        let width;

        if (
            road.type ===
            "autopista"
        )
            width = 55;
        else if (
            road.type ===
            "autovia"
        )
            width = 48;
        else if (
            road.type ===
            "nacional"
        )
            width = 34;
        else
            width = 25;

        ctx.lineWidth =
            width;

        ctx.lineCap =
            "round";

        ctx.strokeStyle =
            "#353535";

        ctx.stroke();


        /* Línea */

        ctx.beginPath();

        road.points.forEach(
            (point, index) => {

                const p =
                    worldToScreen(
                        point[0],
                        point[1]
                    );

                if (index === 0)
                    ctx.moveTo(
                        p.x,
                        p.y
                    );
                else
                    ctx.lineTo(
                        p.x,
                        p.y
                    );
            }
        );

        ctx.lineWidth = 2;

        ctx.strokeStyle =
            "#e5d15d";

        ctx.setLineDash(
            road.type ===
            "autopista"
                ? [20, 15]
                : [12, 12]
        );

        ctx.stroke();

        ctx.setLineDash([]);
    }
}


/* ============================================================
   CIUDADES
   ============================================================ */

function drawCities() {

    for (const city of CITIES) {

        const p =
            worldToScreen(
                city.x,
                city.y
            );

        if (
            p.x < -250 ||
            p.x >
            canvas.width + 250 ||
            p.y < -250 ||
            p.y >
            canvas.height + 250
        )
            continue;

        const radius =
            city.size >= 4
                ? 13
                : city.size >= 3
                ? 10
                : city.size >= 2
                ? 7
                : 3;

        ctx.fillStyle =
            "#f1f1f1";

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.font =
            city.size >= 3
                ? "bold 16px Arial"
                : city.size >= 1
                ? "13px Arial"
                : "11px Arial";

        ctx.fillStyle =
            "#fff";

        ctx.textAlign =
            "center";

        ctx.fillText(
            city.name,
            p.x,
            p.y -
            radius -
            7
        );
    }

    ctx.textAlign =
        "left";
}


/* ============================================================
   SERVICIOS
   ============================================================ */

function drawServices() {

    for (
        const service of SERVICES
    ) {

        const p =
            worldToScreen(
                service.x,
                service.y
            );

        if (
            p.x < -50 ||
            p.x >
            canvas.width + 50 ||
            p.y < -50 ||
            p.y >
            canvas.height + 50
        )
            continue;

        ctx.font =
            "18px Arial";

        ctx.fillText(
            service.type ===
            "fuel"
                ? "⛽"
                : "🔧",
            p.x - 9,
            p.y
        );
    }
}


/* ============================================================
   TRÁFICO
   ============================================================ */

function drawTraffic() {

    for (
        const car of TRAFFIC
    ) {

        const p =
            worldToScreen(
                car.x,
                car.y
            );

        if (
            p.x < -40 ||
            p.x >
            canvas.width + 40 ||
            p.y < -40 ||
            p.y >
            canvas.height + 40
        )
            continue;

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
            -7,
            -13,
            14,
            26
        );

        ctx.fillStyle =
            "#aee4f5";

        ctx.fillRect(
            -5,
            -8,
            10,
            7
        );

        ctx.restore();
    }
}


/* ============================================================
   CAMIÓN
   ============================================================ */

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


    /* Sombra */

    ctx.fillStyle =
        "rgba(0,0,0,.35)";

    ctx.fillRect(
        -32,
        -40,
        64,
        105
    );


    /* Remolque */

    if (
        truck.cargoWeight > 0
    ) {

        ctx.fillStyle =
            "#d7d7d7";

        ctx.fillRect(
            -25,
            15,
            50,
            60
        );
    }


    /* Cabina */

    ctx.fillStyle =
        "#17649b";

    ctx.fillRect(
        -27,
        -52,
        54,
        66
    );


    /* Ventanas */

    ctx.fillStyle =
        "#8dd6ed";

    ctx.fillRect(
        -20,
        -44,
        40,
        23
    );


    /* Ruedas */

    ctx.fillStyle =
        "#111";

    ctx.fillRect(
        -34,
        -40,
        9,
        23
    );

    ctx.fillRect(
        25,
        -40,
        9,
        23
    );

    ctx.fillRect(
        -34,
        38,
        9,
        23
    );

    ctx.fillRect(
        25,
        38,
        9,
        23
    );


    /* Luces */

    if (lights) {

        ctx.fillStyle =
            "#fff4a0";

        ctx.fillRect(
            -18,
            -58,
            12,
            7
        );

        ctx.fillRect(
            6,
            -58,
            12,
            7
        );
    }

    ctx.restore();
}


/* ============================================================
   MINIMAPA
   ============================================================ */

function drawMinimap() {

    const size = 280;

    const x =
        canvas.width -
        size -
        20;

    const y = 20;

    ctx.fillStyle =
        "rgba(5,10,15,.92)";

    ctx.fillRect(
        x,
        y,
        size,
        size
    );

    ctx.strokeStyle =
        "#888";

    ctx.strokeRect(
        x,
        y,
        size,
        size
    );


    const sx =
        size /
        (
            WORLD.maxX -
            WORLD.minX
        );

    const sy =
        size /
        (
            WORLD.maxY -
            WORLD.minY
        );


    /* Carreteras */

    for (
        const road of ROADS
    ) {

        ctx.beginPath();

        road.points.forEach(
            (point, index) => {

                const px =
                    x +
                    (
                        point[0] -
                        WORLD.minX
                    ) *
                    sx;

                const py =
                    y +
                    (
                        point[1] -
                        WORLD.minY
                    ) *
                    sy;

                if (index === 0)
                    ctx.moveTo(
                        px,
                        py
                    );
                else
                    ctx.lineTo(
                        px,
                        py
                    );
            }
        );

        ctx.lineWidth =
            road.type ===
            "autopista"
                ? 2.5
                : 1;

        ctx.strokeStyle =
            road.type ===
            "autopista"
                ? "#fff"
                : road.type ===
                  "autovia"
                ? "#e5c53f"
                : "#888";

        ctx.stroke();
    }


    /* Ciudades */

    for (
        const city of CITIES
    ) {

        const px =
            x +
            (
                city.x -
                WORLD.minX
            ) * sx;

        const py =
            y +
            (
                city.y -
                WORLD.minY
            ) * sy;

        ctx.fillStyle =
            "#ddd";

        ctx.beginPath();

        ctx.arc(
            px,
            py,
            city.size >= 3
                ? 2.5
                : 1.5,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    /* Camión */

    const tx =
        x +
        (
            truck.x -
            WORLD.minX
        ) * sx;

    const ty =
        y +
        (
            truck.y -
            WORLD.minY
        ) * sy;

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


    /* Destino */

    if (
        JOB.active &&
        JOB.destination
    ) {

        const dx =
            x +
            (
                JOB.destination.x -
                WORLD.minX
            ) * sx;

        const dy =
            y +
            (
                JOB.destination.y -
                WORLD.minY
            ) * sy;

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
    }


    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 12px Arial";

    ctx.fillText(
        "MINIMAPA",
        x + 10,
        y + 18
    );
}


/* ============================================================
   MAPA COMPLETO
   ============================================================ */

function drawFullMap() {

    ctx.fillStyle =
        "#15231a";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    const worldWidth =
        WORLD.maxX -
        WORLD.minX;

    const worldHeight =
        WORLD.maxY -
        WORLD.minY;


    const scale =
        Math.min(
            canvas.width /
                worldWidth,
            canvas.height /
                worldHeight
        ) * .9;


    const offsetX =
        (
            canvas.width -
            worldWidth *
            scale
        ) / 2;

    const offsetY =
        (
            canvas.height -
            worldHeight *
            scale
        ) / 2;


    function mapPoint(
        x,
        y
    ) {

        return {

            x:
                offsetX +
                (
                    x -
                    WORLD.minX
                ) * scale,

            y:
                offsetY +
                (
                    y -
                    WORLD.minY
                ) * scale
        };
    }


    /* Carreteras */

    for (
        const road of ROADS
    ) {

        if (
            road.points.length < 2
        )
            continue;

        ctx.beginPath();

        road.points.forEach(
            (point, index) => {

                const p =
                    mapPoint(
                        point[0],
                        point[1]
                    );

                if (index === 0)
                    ctx.moveTo(
                        p.x,
                        p.y
                    );
                else
                    ctx.lineTo(
                        p.x,
                        p.y
                    );
            }
        );

        ctx.lineWidth =
            road.type ===
            "autopista"
                ? 5
                : road.type ===
                  "autovia"
                ? 4
                : 2;

        ctx.strokeStyle =
            road.type ===
            "autopista"
                ? "#fff"
                : road.type ===
                  "autovia"
                ? "#e5c53f"
                : "#b77a42";

        ctx.stroke();
    }


    /* Ciudades */

    for (
        const city of CITIES
    ) {

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
            city.size >= 3
                ? 4
                : 2,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.font =
            city.size >= 3
                ? "bold 14px Arial"
                : "10px Arial";

        ctx.fillText(
            city.name,
            p.x + 6,
            p.y - 5
        );
    }


    /* Camión */

    const truckPoint =
        mapPoint(
            truck.x,
            truck.y
        );

    ctx.fillStyle =
        "#ff3333";

    ctx.beginPath();

    ctx.arc(
        truckPoint.x,
        truckPoint.y,
        8,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* Destino */

    if (
        JOB.active &&
        JOB.destination
    ) {

        const destination =
            mapPoint(
                JOB.destination.x,
                JOB.destination.y
            );

        ctx.fillStyle =
            "#00e5ff";

        ctx.beginPath();

        ctx.arc(
            destination.x,
            destination.y,
            9,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "bold 17px Arial";

        ctx.fillText(
            "DESTINO: " +
            JOB.destination.name,
            destination.x + 12,
            destination.y
        );
    }


    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 23px Arial";

    ctx.fillText(
        "MAPA MUNDIAL",
        25,
        35
    );

    ctx.font =
        "14px Arial";

    ctx.fillText(
        "M / ESC — volver al juego",
        25,
        60
    );


    /* Leyenda */

    ctx.fillStyle =
        "#fff";

    ctx.fillText(
        "■ Autopista",
        25,
        canvas.height - 80
    );

    ctx.fillStyle =
        "#e5c53f";

    ctx.fillText(
        "■ Autovía",
        25,
        canvas.height - 60
    );

    ctx.fillStyle =
        "#b77a42";

    ctx.fillText(
        "■ Nacional",
        25,
        canvas.height - 40
    );
}


/* ============================================================
   HUD
   ============================================================ */

function drawHUD() {

    const height = 160;

    const y =
        canvas.height -
        height;


    ctx.fillStyle =
        "rgba(5,8,12,.94)";

    ctx.fillRect(
        0,
        y,
        canvas.width,
        height
    );


    /* Velocidad */

    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 48px Arial";

    ctx.fillText(
        Math.round(
            truck.speed
        ),
        30,
        y + 55
    );

    ctx.font =
        "14px Arial";

    ctx.fillText(
        "km/h",
        105,
        y + 55
    );


    /* Marcha */

    ctx.font =
        "bold 28px Arial";

    ctx.fillText(
        truck.reverse
            ? "R"
            : truck.gear,
        175,
        y + 53
    );

    ctx.font =
        "12px Arial";

    ctx.fillText(
        "MARCHA",
        170,
        y + 74
    );


    /* RPM */

    ctx.font =
        "bold 18px Arial";

    ctx.fillText(
        Math.round(
            truck.rpm
        ) +
        " RPM",
        270,
        y + 45
    );


    /* Combustible */

    ctx.font =
        "12px Arial";

    ctx.fillText(
        "COMBUSTIBLE",
        430,
        y + 25
    );

    ctx.fillStyle =
        "#333";

    ctx.fillRect(
        430,
        y + 38,
        180,
        15
    );

    ctx.fillStyle =
        truck.fuel < 20
            ? "#e33"
            : "#35ad72";

    ctx.fillRect(
        430,
        y + 38,
        180 *
        (
            truck.fuel /
            100
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
        620,
        y + 51
    );


    /* Dinero */

    ctx.font =
        "bold 20px Arial";

    ctx.fillText(
        "€" +
        Math.round(
            money
        ),
        430,
        y + 92
    );


    /* Carretera */

    ctx.font =
        "bold 16px Arial";

    ctx.fillText(
        currentRoad
            ? currentRoad.name
            : "Fuera de carretera",
        730,
        y + 28
    );

    ctx.font =
        "13px Arial";

    if (currentRoad) {

        ctx.fillText(
            currentRoad.type
                .toUpperCase(),
            730,
            y + 50
        );

        ctx.fillText(
            "Límite: " +
            roadSpeedLimit(
                currentRoad
            ) +
            " km/h",
            730,
            y + 72
        );
    }


    /* Trabajo */

    if (JOB.active) {

        ctx.fillStyle =
            "#00e5ff";

        ctx.font =
            "bold 15px Arial";

        ctx.fillText(
            JOB.from +
            " → " +
            JOB.to,
            980,
            y + 28
        );

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "13px Arial";

        ctx.fillText(
            JOB.cargo,
            980,
            y + 50
        );

        ctx.fillText(
            "Distancia: " +
            Math.round(
                JOB.distance /
                100
            ) +
            " km",
            980,
            y + 70
        );

        ctx.fillText(
            "Pago: €" +
            JOB.reward,
            980,
            y + 90
        );

    } else {

        ctx.fillStyle =
            "#aaa";

        ctx.font =
            "13px Arial";

        ctx.fillText(
            "N — aceptar trabajo",
            980,
            y + 45
        );
    }


    /* Controles */

    ctx.fillStyle =
        "#999";

    ctx.font =
        "11px Arial";

    ctx.fillText(
        "W/S conducir • A/D girar • +/- marchas • B R • N trabajo • R repostar • M mapa • L luces • P pausa",
        30,
        canvas.height - 13
    );
}


/* ============================================================
   LLUVIA
   ============================================================ */

function drawRain() {

    if (!raining)
        return;

    ctx.strokeStyle =
        "rgba(180,220,255,.35)";

    for (
        let i = 0;
        i < 150;
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
            x - 5,
            y + 20
        );

        ctx.stroke();
    }
}


/* ============================================================
   NOCHE
   ============================================================ */

function drawNight() {

    if (
        hour >= 7 &&
        hour <= 20
    )
        return;

    ctx.fillStyle =
        "rgba(0,5,25,.38)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}


/* ============================================================
   UPDATE
   ============================================================ */

function update() {

    updatePhysics();

    currentRoad =
        nearestRoad(
            truck.x,
            truck.y
        );

    updateTraffic();

    updateCamera();

    updateEnvironment();

    updateJob(truck);
}


/* ============================================================
   DRAW
   ============================================================ */

function draw() {

    if (fullMap) {

        drawFullMap();

        return;
    }

    drawBackground();

    drawRoads();

    drawCities();

    drawServices();

    drawTraffic();


    /* GPS */

    if (
        JOB.active &&
        JOB.destination
    ) {

        const a =
            worldToScreen(
                truck.x,
                truck.y
            );

        const b =
            worldToScreen(
                JOB.destination.x,
                JOB.destination.y
            );

        ctx.save();

        ctx.strokeStyle =
            "#00e5ff";

        ctx.lineWidth = 4;

        ctx.setLineDash(
            [12, 10]
        );

        ctx.beginPath();

        ctx.moveTo(
            a.x,
            a.y
        );

        ctx.lineTo(
            b.x,
            b.y
        );

        ctx.stroke();

        ctx.restore();
    }


    drawTruck();

    drawMinimap();

    drawHUD();

    drawMessage();

    drawRain();

    drawNight();
}


/* ============================================================
   LOOP
   ============================================================ */

function gameLoop() {

    if (!paused) {

        update();
    }

    draw();

    requestAnimationFrame(
        gameLoop
    );
}


/* ============================================================
   ARRANQUE
   ============================================================ */

document.getElementById(
    "loading"
).style.display =
    "none";


showMessage(
    "MUNDO CARGADO — Pulsa N para aceptar un trabajo"
);


gameLoop();

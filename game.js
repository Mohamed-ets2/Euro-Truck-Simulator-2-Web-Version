"use strict";

/*
============================================================
 TRUCK DRIVER
============================================================

 MAPA GRANDE
 CIUDADES
 PUEBLOS
 AUTOPISTAS
 AUTOVÍAS
 CARRETERAS SECUNDARIAS
 CARRETERAS DE MONTAÑA
 TRÁFICO
 CAMIÓN
 COMBUSTIBLE
 DINERO
 TRABAJOS
 MINIMAPA
 MARCHAS MANUALES
 MARCHA ATRÁS
============================================================
*/


// ==========================================================
// CANVAS
// ==========================================================

const canvas = document.getElementById("gameCanvas");

if (!canvas) {
    throw new Error(
        "No se encontró el canvas gameCanvas."
    );
}

const ctx = canvas.getContext("2d");

if (!ctx) {
    throw new Error(
        "No se pudo obtener el contexto 2D."
    );
}


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
    a: false,
    s: false,
    d: false
};


let mapMode = false;
let jobMenu = false;


// ==========================================================
// KEYDOWN
// ==========================================================

window.addEventListener(
    "keydown",
    function (event) {

        const key =
            event.key.toLowerCase();


        // ------------------------------
        // MOVIMIENTO
        // ------------------------------

        if (key === "w") {
            keys.w = true;
        }

        if (key === "a") {
            keys.a = true;
        }

        if (key === "s") {
            keys.s = true;
        }

        if (key === "d") {
            keys.d = true;
        }


        // ------------------------------
        // MAPA
        // ------------------------------

        if (key === "m") {

            mapMode =
                !mapMode;

            jobMenu = false;
        }


        // ------------------------------
        // TRABAJOS
        // ------------------------------

        if (key === "j") {

            jobMenu =
                !jobMenu;

            mapMode = false;
        }


        // ------------------------------
        // REPOSTAR
        // ------------------------------

        if (key === "r") {

            refuel();
        }


        // ------------------------------
        // MARCHA ATRÁS
        // ------------------------------

        if (key === "b") {

            toggleReverse();
        }


        // ------------------------------
        // SUBIR MARCHA
        // ------------------------------

        if (
            key === "+" ||
            key === "="
        ) {

            changeGear(1);
        }


        // ------------------------------
        // BAJAR MARCHA
        // ------------------------------

        if (key === "-") {

            changeGear(-1);
        }


        // ------------------------------
        // ACEPTAR TRABAJO
        // ------------------------------

        if (
            jobMenu &&
            key >= "1" &&
            key <= "8"
        ) {

            acceptJob(
                Number(key) - 1
            );

            jobMenu = false;
        }


        // ------------------------------
        // EVITAR SCROLL
        // ------------------------------

        if (
            [
                "w",
                "a",
                "s",
                "d",
                "m",
                "j",
                "r",
                "b",
                "+",
                "=",
                "-"
            ].includes(key)
        ) {

            event.preventDefault();
        }

    }
);


// ==========================================================
// KEYUP
// ==========================================================

window.addEventListener(
    "keyup",
    function (event) {

        const key =
            event.key.toLowerCase();


        if (key === "w") {
            keys.w = false;
        }

        if (key === "a") {
            keys.a = false;
        }

        if (key === "s") {
            keys.s = false;
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


const camera = {

    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2
};


// ==========================================================
// CAMIÓN
// ==========================================================

const truck = {

    x: 3500,
    y: 2500,

    angle: 0,

    speed: 0,

    maxSpeed: 130,

    acceleration: 0.45,

    braking: 0.9,

    steering: 0.035,

    fuel: 100,

    money: 5000,

    // --------------------------
    // CAMBIOS
    // --------------------------

    gear: 1,

    reverse: false
};


// ==========================================================
// VELOCIDADES DE LAS MARCHAS
// ==========================================================

const gearMaxSpeeds = [

    20,   // 1
    35,   // 2
    50,   // 3
    65,   // 4
    80,   // 5
    95,   // 6
    110,  // 7
    130   // 8

];


// ==========================================================
// CAMBIAR MARCHA
// ==========================================================

function changeGear(amount) {

    // No cambiar marchas normales en R
    if (truck.reverse) {

        showMessage(
            "Sal de la marcha atrás primero."
        );

        return;
    }


    // Necesitamos estar relativamente despacio
    if (truck.speed > 25) {

        // Permitimos cambiar, pero no saltos absurdos
        // entre marchas.
    }


    truck.gear += amount;


    if (truck.gear < 1) {

        truck.gear = 1;
    }


    if (
        truck.gear >
        gearMaxSpeeds.length
    ) {

        truck.gear =
            gearMaxSpeeds.length;
    }


    showMessage(
        "Marcha " +
        truck.gear
    );
}


// ==========================================================
// MARCHA ATRÁS
// ==========================================================

function toggleReverse() {

    // No permitir poner R circulando rápido
    if (
        Math.abs(truck.speed) >
        3
    ) {

        showMessage(
            "Reduce la velocidad para poner marcha atrás."
        );

        return;
    }


    truck.reverse =
        !truck.reverse;


    if (truck.reverse) {

        truck.gear = 0;

        showMessage(
            "MARCHA ATRÁS"
        );

    } else {

        truck.gear = 1;

        showMessage(
            "MARCHA 1"
        );
    }
}


// ==========================================================
// CIUDADES
// ==========================================================

const cities = [

    {
        name: "Valdoria",
        x: 3500,
        y: 2500,
        size: 1.6
    },

    {
        name: "Monteluz",
        x: 3500,
        y: 600,
        size: 1.15
    },

    {
        name: "Ribera",
        x: 850,
        y: 2200,
        size: 1.2
    },

    {
        name: "San Telmo",
        x: 5800,
        y: 1700,
        size: 1.25
    },

    {
        name: "Puerto Azul",
        x: 4500,
        y: 4300,
        size: 1.3
    },

    {
        name: "Ciudad Norte",
        x: 5000,
        y: 750,
        size: 1.0
    },

    {
        name: "Nueva Ribera",
        x: 1450,
        y: 3500,
        size: 1.0
    },

    {
        name: "Costa Dorada",
        x: 6200,
        y: 3900,
        size: 1.2
    }
];


// ==========================================================
// PUEBLOS
// ==========================================================

const towns = [

    {
        name: "Los Olivos",
        x: 1900,
        y: 850
    },

    {
        name: "Valle Verde",
        x: 4700,
        y: 900
    },

    {
        name: "Pinar",
        x: 900,
        y: 3200
    },

    {
        name: "Santa Clara",
        x: 2200,
        y: 3900
    },

    {
        name: "El Roble",
        x: 5300,
        y: 2800
    },

    {
        name: "La Vega",
        x: 5700,
        y: 3700
    },

    {
        name: "Cerro Alto",
        x: 1500,
        y: 500
    },

    {
        name: "San Pedro",
        x: 2800,
        y: 900
    },

    {
        name: "Las Encinas",
        x: 4100,
        y: 1300
    },

    {
        name: "El Molino",
        x: 3100,
        y: 3300
    },

    {
        name: "Villaverde",
        x: 1200,
        y: 1500
    },

    {
        name: "Los Pinos",
        x: 2600,
        y: 4500
    },

    {
        name: "La Estación",
        x: 6000,
        y: 2700
    },

    {
        name: "Monte Azul",
        x: 6500,
        y: 1500
    }
];


// ==========================================================
// CARRETERAS
// ==========================================================

const roads = [

    // AUTOPISTA PRINCIPAL
    {
        type: "motorway",

        points: [

            [850, 2200],
            [1500, 2050],
            [2200, 2150],
            [2850, 2350],
            [3500, 2500],
            [4200, 2300],
            [5000, 2050],
            [5800, 1700]

        ]
    },


    // AUTOPISTA NORTE
    {
        type: "motorway",

        points: [

            [3500, 2500],
            [3500, 2000],
            [3500, 1500],
            [3500, 1050],
            [3500, 600]

        ]
    },


    // AUTOVÍA ESTE
    {
        type: "dual",

        points: [

            [3500, 2500],
            [4200, 2200],
            [5000, 2050],
            [5800, 1700]

        ]
    },


    // AUTOVÍA SUR
    {
        type: "dual",

        points: [

            [3500, 2500],
            [3700, 3000],
            [4000, 3500],
            [4500, 4300]

        ]
    },


    // AUTOVÍA COSTA
    {
        type: "dual",

        points: [

            [4500, 4300],
            [5100, 4200],
            [5700, 4100],
            [6200, 3900]

        ]
    },


    // SECUNDARIA NOROESTE
    {
        type: "secondary",

        points: [

            [850, 2200],
            [1100, 1700],
            [1200, 1200],
            [1500, 500]

        ]
    },


    // SECUNDARIA NORTE
    {
        type: "secondary",

        points: [

            [1500, 500],
            [1900, 850],
            [2400, 900],
            [2800, 900],
            [3500, 600]

        ]
    },


    // SECUNDARIA NORESTE
    {
        type: "secondary",

        points: [

            [3500, 600],
            [4100, 700],
            [4700, 900],
            [5000, 750]

        ]
    },


    // SECUNDARIA ESTE
    {
        type: "secondary",

        points: [

            [5800, 1700],
            [5900, 2200],
            [5300, 2800],
            [6000, 2700]

        ]
    },


    // SECUNDARIA SUDESTE
    {
        type: "secondary",

        points: [

            [5300, 2800],
            [5700, 3700],
            [6200, 3900]

        ]
    },


    // SECUNDARIA SUROESTE
    {
        type: "secondary",

        points: [

            [4500, 4300],
            [3600, 4500],
            [2600, 4500],
            [2200, 3900],
            [1450, 3500]

        ]
    },


    // SECUNDARIA OESTE
    {
        type: "secondary",

        points: [

            [1450, 3500],
            [900, 3200],
            [700, 2700],
            [850, 2200]

        ]
    },


    // CONEXIÓN CENTRAL
    {
        type: "secondary",

        points: [

            [3500, 2500],
            [3100, 3300],
            [2200, 3900]

        ]
    },


    // MONTAÑA
    {
        type: "mountain",

        points: [

            [850, 2200],
            [600, 1900],
            [700, 1500],
            [1100, 1100],
            [1500, 500]

        ]
    },


    // VALLE
    {
        type: "secondary",

        points: [

            [3500, 1500],
            [4100, 1300],
            [4700, 900]

        ]
    }

];


// ==========================================================
// ÁRBOLES
// ==========================================================

const trees = [];


for (
    let i = 0;
    i < 450;
    i++
) {

    trees.push({

        x:
            150 +
            Math.random() *
            (WORLD_WIDTH - 300),

        y:
            150 +
            Math.random() *
            (WORLD_HEIGHT - 300),

        size:
            8 +
            Math.random() * 16

    });
}


// ==========================================================
// TRÁFICO
// ==========================================================

const traffic = [];


for (
    let i = 0;
    i < 25;
    i++
) {

    traffic.push({

        x:
            500 +
            Math.random() *
            6000,

        y:
            500 +
            Math.random() *
            4000,

        angle:
            Math.random() *
            Math.PI *
            2,

        speed:
            30 +
            Math.random() *
            50,

        type:
            Math.random() >
            0.65
                ? "truck"
                : "car"

    });
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
// DISTANCIA A SEGMENTO
// ==========================================================

function distanceToSegment(
    px,
    py,
    ax,
    ay,
    bx,
    by
) {

    const dx =
        bx - ax;

    const dy =
        by - ay;


    if (
        dx === 0 &&
        dy === 0
    ) {

        return Math.hypot(
            px - ax,
            py - ay
        );
    }


    const t =
        Math.max(
            0,
            Math.min(
                1,

                (
                    (px - ax) * dx +
                    (py - ay) * dy
                )
                /
                (dx * dx + dy * dy)
            )
        );


    const cx =
        ax +
        t * dx;

    const cy =
        ay +
        t * dy;


    return Math.hypot(
        px - cx,
        py - cy
    );
}


// ==========================================================
// CARRETERA ACTUAL
// ==========================================================

function getCurrentRoad() {

    let closest = null;

    let bestDistance =
        Infinity;


    for (
        const road of roads
    ) {

        for (
            let i = 0;
            i <
            road.points.length - 1;
            i++
        ) {

            const a =
                road.points[i];

            const b =
                road.points[
                    i + 1
                ];


            const distance =
                distanceToSegment(

                    truck.x,
                    truck.y,

                    a[0],
                    a[1],

                    b[0],
                    b[1]

                );


            if (
                distance <
                bestDistance
            ) {

                bestDistance =
                    distance;

                closest =
                    road;
            }
        }
    }


    if (
        bestDistance >
        90
    ) {

        return null;
    }


    return closest;
}


// ==========================================================
// ACTUALIZAR CAMIÓN
// ==========================================================

function updateTruck() {


    // ======================================================
    // ACELERACIÓN
    // ======================================================

    if (keys.w) {

        if (truck.reverse) {

            truck.speed +=
                truck.acceleration *
                0.65;

        } else {

            truck.speed +=
                truck.acceleration *
                (
                    1 +
                    truck.gear *
                    0.08
                );
        }
    }


    // ======================================================
    // FRENADO
    // ======================================================

    if (keys.s) {

        truck.speed -=
            truck.braking;
    }


    // ======================================================
    // FRENADO NATURAL
    // ======================================================

    if (
        !keys.w &&
        !keys.s
    ) {

        truck.speed *=
            0.985;
    }


    // ======================================================
    // VELOCIDAD MÁXIMA
    // ======================================================

    let gearMaxSpeed;


    if (truck.reverse) {

        gearMaxSpeed = 25;

    } else {

        gearMaxSpeed =
            gearMaxSpeeds[
                truck.gear - 1
            ];
    }


    truck.speed =
        Math.max(
            0,
            Math.min(
                gearMaxSpeed,
                truck.speed
            )
        );


    // ======================================================
    // DIRECCIÓN
    // ======================================================

    if (
        truck.speed >
        1
    ) {

        const steering =
            truck.speed /
            truck.maxSpeed;


        if (keys.a) {

            truck.angle -=
                truck.steering *
                steering;
        }


        if (keys.d) {

            truck.angle +=
                truck.steering *
                steering;
        }
    }


    // ======================================================
    // MOVIMIENTO
    // ======================================================

    let movement =
        truck.speed *
        0.24;


    // Marcha atrás
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


    // ======================================================
    // LÍMITES
    // ======================================================

    truck.x =
        Math.max(
            50,
            Math.min(
                WORLD_WIDTH - 50,
                truck.x
            )
        );


    truck.y =
        Math.max(
            50,
            Math.min(
                WORLD_HEIGHT - 50,
                truck.y
            )
        );


    // ======================================================
    // COMBUSTIBLE
    // ======================================================

    if (
        truck.speed >
        0
    ) {

        truck.fuel -=
            truck.speed *
            0.000025;

        truck.fuel =
            Math.max(
                0,
                truck.fuel
            );
    }


    // ======================================================
    // CÁMARA
    // ======================================================

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


    // ======================================================
    // TRABAJO
    // ======================================================

    checkJobDelivery();
}


// ==========================================================
// ACTUALIZAR TRÁFICO
// ==========================================================

function updateTraffic() {

    for (
        const vehicle of traffic
    ) {

        vehicle.x +=
            Math.sin(
                vehicle.angle
            ) *
            vehicle.speed *
            0.02;


        vehicle.y -=
            Math.cos(
                vehicle.angle
            ) *
            vehicle.speed *
            0.02;


        if (
            vehicle.x < 0
        ) {

            vehicle.x =
                WORLD_WIDTH;
        }


        if (
            vehicle.x >
            WORLD_WIDTH
        ) {

            vehicle.x = 0;
        }


        if (
            vehicle.y < 0
        ) {

            vehicle.y =
                WORLD_HEIGHT;
        }


        if (
            vehicle.y >
            WORLD_HEIGHT
        ) {

            vehicle.y = 0;
        }
    }
}


// ==========================================================
// TERRENO
// ==========================================================

function drawTerrain() {

    ctx.fillStyle =
        "#657b58";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.globalAlpha =
        0.16;


    ctx.strokeStyle =
        "#a8b584";


    ctx.lineWidth = 2;


    const gridSize = 140;


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


    ctx.globalAlpha = 1;


    drawLake(
        1150,
        420,
        380,
        190
    );


    drawLake(
        5700,
        3300,
        500,
        230
    );
}


// ==========================================================
// LAGOS
// ==========================================================

function drawLake(
    x,
    y,
    width,
    height
) {

    const p =
        worldToScreen(
            x,
            y
        );


    ctx.fillStyle =
        "#3e7180";


    ctx.beginPath();

    ctx.ellipse(
        p.x,
        p.y,
        width,
        height,
        0.1,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// ==========================================================
// ÁRBOLES
// ==========================================================

function drawTrees() {

    for (
        const tree of trees
    ) {

        const p =
            worldToScreen(
                tree.x,
                tree.y
            );


        if (
            p.x < -60 ||
            p.x >
                canvas.width + 60 ||
            p.y < -60 ||
            p.y >
                canvas.height + 60
        ) {

            continue;
        }


        ctx.fillStyle =
            "#4d3828";


        ctx.fillRect(
            p.x - 3,
            p.y,
            6,
            tree.size
        );


        ctx.fillStyle =
            "#31583b";


        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            tree.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


// ==========================================================
// CARRETERAS
// ==========================================================

function drawRoads() {

    for (
        const road of roads
    ) {

        let width = 25;


        if (
            road.type ===
            "motorway"
        ) {

            width = 46;

        } else if (
            road.type ===
            "dual"
        ) {

            width = 38;

        } else if (
            road.type ===
            "mountain"
        ) {

            width = 20;
        }


        drawRoadPath(
            road,
            width + 8,
            "#242729",
            []
        );


        drawRoadPath(
            road,
            width,
            "#44484a",
            []
        );


        drawRoadPath(
            road,
            2,
            "#d9c96b",

            (
                road.type ===
                "motorway" ||
                road.type ===
                "dual"
            )
                ? [24, 18]
                : [12, 15]
        );
    }
}


// ==========================================================
// DIBUJAR CARRETERA
// ==========================================================

function drawRoadPath(
    road,
    width,
    color,
    dash
) {

    ctx.beginPath();


    for (
        let i = 0;
        i <
        road.points.length;
        i++
    ) {

        const p =
            worldToScreen(
                road.points[i][0],
                road.points[i][1]
            );


        if (
            i === 0
        ) {

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


    ctx.strokeStyle =
        color;


    ctx.lineWidth =
        width;


    ctx.lineCap =
        "round";


    ctx.lineJoin =
        "round";


    ctx.setLineDash(
        dash
    );


    ctx.stroke();


    ctx.setLineDash([]);
}


// ==========================================================
// CIUDADES
// ==========================================================

function drawCities() {

    for (
        const city of cities
    ) {

        drawCity(
            city
        );
    }


    for (
        const town of towns
    ) {

        drawTown(
            town
        );
    }
}


// ==========================================================
// DIBUJAR CIUDAD
// ==========================================================

function drawCity(city) {

    const p =
        worldToScreen(
            city.x,
            city.y
        );


    const radius =
        95 *
        city.size;


    ctx.fillStyle =
        "#9b9b91";


    ctx.beginPath();

    ctx.ellipse(
        p.x,
        p.y,
        radius,
        radius * 0.7,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.strokeStyle =
        "#6f706e";


    ctx.lineWidth = 7;


    for (
        let i = -3;
        i <= 3;
        i++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            p.x - radius,
            p.y + i * 35
        );

        ctx.lineTo(
            p.x + radius,
            p.y + i * 35
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            p.x + i * 35,
            p.y -
                radius *
                0.7
        );

        ctx.lineTo(
            p.x + i * 35,
            p.y +
                radius *
                0.7
        );

        ctx.stroke();
    }


    for (
        let i = 0;
        i < 20;
        i++
    ) {

        const bx =
            p.x -
            radius * 0.7 +
            (i % 10) *
            32;


        const by =
            p.y -
            radius * 0.45 +
            Math.floor(
                i / 10
            ) *
            55;


        ctx.fillStyle =
            i % 3 === 0
                ? "#b8a98d"
                : "#d0c4aa";


        ctx.fillRect(
            bx,
            by,
            22,
            35
        );
    }


    ctx.fillStyle =
        "#e34338";


    ctx.beginPath();

    ctx.arc(
        p.x,
        p.y,
        10,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "bold 18px Arial";


    ctx.textAlign =
        "left";


    ctx.textBaseline =
        "middle";


    ctx.fillText(
        city.name,
        p.x +
            radius +
            12,
        p.y
    );
}


// ==========================================================
// PUEBLOS
// ==========================================================

function drawTown(town) {

    const p =
        worldToScreen(
            town.x,
            town.y
        );


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const x =
            p.x +
            (i - 2) *
            25;


        const y =
            p.y +
            (i % 2) *
            15;


        ctx.fillStyle =
            "#c9a06e";


        ctx.fillRect(
            x,
            y,
            18,
            14
        );


        ctx.fillStyle =
            "#6f4030";


        ctx.beginPath();

        ctx.moveTo(
            x - 2,
            y
        );

        ctx.lineTo(
            x + 9,
            y - 8
        );

        ctx.lineTo(
            x + 20,
            y
        );

        ctx.fill();
    }


    ctx.fillStyle =
        "#f0ce50";


    ctx.beginPath();

    ctx.arc(
        p.x,
        p.y,
        6,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "bold 14px Arial";


    ctx.fillText(
        town.name,
        p.x + 12,
        p.y
    );
}


// ==========================================================
// TRÁFICO
// ==========================================================

function drawTraffic() {

    for (
        const vehicle of traffic
    ) {

        const p =
            worldToScreen(
                vehicle.x,
                vehicle.y
            );


        ctx.save();


        ctx.translate(
            p.x,
            p.y
        );


        ctx.rotate(
            vehicle.angle
        );


        if (
            vehicle.type ===
            "truck"
        ) {

            ctx.fillStyle =
                "#b8b8b8";


            ctx.fillRect(
                -8,
                0,
                16,
                35
            );


            ctx.fillStyle =
                "#cf3a3a";


            ctx.fillRect(
                -9,
                -14,
                18,
                15
            );

        } else {

            ctx.fillStyle =
                "#263d50";


            ctx.fillRect(
                -7,
                -15,
                14,
                30
            );
        }


        ctx.restore();
    }
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


    // REMOLQUE
    ctx.fillStyle =
        "#d9d9d9";


    ctx.fillRect(
        -25,
        0,
        50,
        85
    );


    ctx.strokeStyle =
        "#555";


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
        -28,
        -70,
        56,
        62
    );


    // CRISTAL
    ctx.fillStyle =
        "#72a9c5";


    ctx.fillRect(
        -21,
        -62,
        42,
        24
    );


    // PARACHOQUES
    ctx.fillStyle =
        "#d4d4d4";


    ctx.fillRect(
        -30,
        -73,
        60,
        7
    );


    // RUEDAS
    ctx.fillStyle =
        "#111";


    ctx.fillRect(
        -34,
        -45,
        9,
        22
    );


    ctx.fillRect(
        25,
        -45,
        9,
        22
    );


    ctx.fillRect(
        -34,
        42,
        9,
        22
    );


    ctx.fillRect(
        25,
        42,
        9,
        22
    );


    // FAROS
    ctx.fillStyle =
        "#ffe9a3";


    ctx.fillRect(
        -20,
        -80,
        12,
        7
    );


    ctx.fillRect(
        8,
        -80,
        12,
        7
    );


    ctx.restore();
}


// ==========================================================
// TRABAJOS
// ==========================================================

const jobs = [

    {
        cargo: "Cajas de alimentos",
        from: "Ribera",
        to: "Valdoria",
        start: [850, 2200],
        destination: [3500, 2500],
        reward: 850
    },

    {
        cargo: "Material de construcción",
        from: "Valdoria",
        to: "Monteluz",
        start: [3500, 2500],
        destination: [3500, 600],
        reward: 1200
    },

    {
        cargo: "Electrodomésticos",
        from: "Monteluz",
        to: "San Telmo",
        start: [3500, 600],
        destination: [5800, 1700],
        reward: 1450
    },

    {
        cargo: "Madera",
        from: "San Telmo",
        to: "El Roble",
        start: [5800, 1700],
        destination: [5300, 2800],
        reward: 1050
    },

    {
        cargo: "Piezas industriales",
        from: "El Roble",
        to: "Puerto Azul",
        start: [5300, 2800],
        destination: [4500, 4300],
        reward: 1350
    },

    {
        cargo: "Fruta y verduras",
        from: "Puerto Azul",
        to: "Ribera",
        start: [4500, 4300],
        destination: [850, 2200],
        reward: 1700
    },

    {
        cargo: "Productos agrícolas",
        from: "Valle Verde",
        to: "Valdoria",
        start: [4700, 900],
        destination: [3500, 2500],
        reward: 1100
    },

    {
        cargo: "Muebles",
        from: "Valdoria",
        to: "Santa Clara",
        start: [3500, 2500],
        destination: [2200, 3900],
        reward: 1250
    }

];


let currentJob = null;

let messageText = "";

let messageTimer = 0;


// ==========================================================
// ACEPTAR TRABAJO
// ==========================================================

function acceptJob(index) {

    if (
        currentJob !== null
    ) {

        showMessage(
            "Ya tienes un trabajo activo."
        );

        return;
    }


    if (
        !jobs[index]
    ) {

        return;
    }


    currentJob = {
        ...jobs[index]
    };


    showMessage(
        "Trabajo aceptado: " +
        currentJob.cargo
    );
}


// ==========================================================
// ENTREGA
// ==========================================================

function checkJobDelivery() {

    if (
        currentJob === null
    ) {

        return;
    }


    const distance =
        Math.hypot(

            truck.x -
                currentJob
                    .destination[0],

            truck.y -
                currentJob
                    .destination[1]

        );


    if (
        distance < 140 &&
        truck.speed < 8
    ) {

        truck.money +=
            currentJob.reward;


        showMessage(
            "¡ENTREGA COMPLETADA! +" +
            currentJob.reward +
            " €"
        );


        currentJob = null;
    }
}


// ==========================================================
// REPOSTAR
// ==========================================================

function refuel() {

    const cost =
        Math.ceil(
            (
                100 -
                truck.fuel
            ) *
            2
        );


    if (
        cost <= 0
    ) {

        showMessage(
            "El depósito ya está lleno."
        );

        return;
    }


    if (
        truck.money <
        cost
    ) {

        showMessage(
            "No tienes suficiente dinero."
        );

        return;
    }


    truck.money -=
        cost;


    truck.fuel =
        100;


    showMessage(
        "Depósito lleno. -" +
        cost +
        " €"
    );
}


// ==========================================================
// MENSAJES
// ==========================================================

function showMessage(text) {

    messageText =
        text;

    messageTimer =
        180;
}


// ==========================================================
// HUD
// ==========================================================

function drawHUD() {

    const panelX = 20;

    const panelY =
        canvas.height -
        245;


    ctx.fillStyle =
        "rgba(10,14,18,0.93)";


    ctx.fillRect(
        panelX,
        panelY,
        380,
        220
    );


    // VELOCIDAD
    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "bold 18px Arial";


    ctx.fillText(
        "VELOCIDAD",
        panelX + 20,
        panelY + 30
    );


    ctx.font =
        "bold 36px Arial";


    ctx.fillText(
        Math.round(
            truck.speed
        ) +
        " km/h",

        panelX + 20,
        panelY + 70
    );


    // MARCHA
    ctx.font =
        "bold 20px Arial";


    ctx.fillStyle =
        truck.reverse
            ? "#ff5858"
            : "#ffffff";


    ctx.fillText(

        truck.reverse
            ? "R"
            : truck.gear,

        panelX + 220,
        panelY + 62
    );


    ctx.font =
        "12px Arial";


    ctx.fillText(
        "MARCHA",
        panelX + 205,
        panelY + 82
    );


    // COMBUSTIBLE
    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "16px Arial";


    ctx.fillText(
        "Combustible: " +
        Math.round(
            truck.fuel
        ) +
        "%",

        panelX + 20,
        panelY + 108
    );


    // BARRA DE COMBUSTIBLE
    ctx.fillStyle =
        "#222";


    ctx.fillRect(
        panelX + 145,
        panelY + 96,
        170,
        12
    );


    ctx.fillStyle =
        truck.fuel < 20
            ? "#e34a4a"
            : "#58c96b";


    ctx.fillRect(
        panelX + 145,
        panelY + 96,
        170 *
            (
                truck.fuel /
                100
            ),
        12
    );


    // DINERO
    ctx.fillStyle =
        "#ffffff";


    ctx.fillText(
        "Dinero: " +
        Math.floor(
            truck.money
        ) +
        " €",

        panelX + 20,
        panelY + 137
    );


    // CARRETERA
    const road =
        getCurrentRoad();


    let roadName =
        "FUERA DE CARRETERA";


    if (road) {

        if (
            road.type ===
            "motorway"
        ) {

            roadName =
                "AUTOPISTA";

        } else if (
            road.type ===
            "dual"
        ) {

            roadName =
                "AUTOVÍA";

        } else if (
            road.type ===
            "mountain"
        ) {

            roadName =
                "CARRETERA DE MONTAÑA";

        } else {

            roadName =
                "CARRETERA SECUNDARIA";
        }
    }


    ctx.fillStyle =
        "#f2cf4c";


    ctx.font =
        "bold 15px Arial";


    ctx.fillText(
        roadName,
        panelX + 20,
        panelY + 165
    );


    // CONTROLES
    ctx.fillStyle =
        "#d9d9d9";


    ctx.font =
        "12px Arial";


    ctx.fillText(
        "W/S acelerar-frenar",
        panelX + 20,
        panelY + 192
    );


    ctx.fillText(
        "A/D girar",
        panelX + 145,
        panelY + 192
    );


    ctx.fillText(
        "+ / - marchas",
        panelX + 220,
        panelY + 192
    );


    ctx.fillText(
        "B atrás",
        panelX + 305,
        panelY + 192
    );


    // MENSAJE
    if (
        messageTimer > 0
    ) {

        ctx.fillStyle =
            "rgba(0,0,0,0.88)";


        ctx.fillRect(
            canvas.width / 2 - 280,
            25,
            560,
            55
        );


        ctx.fillStyle =
            "#ffffff";


        ctx.font =
            "bold 18px Arial";


        ctx.textAlign =
            "center";


        ctx.fillText(
            messageText,
            canvas.width / 2,
            59
        );


        ctx.textAlign =
            "left";


        messageTimer--;
    }


    // TRABAJO
    if (
        currentJob !== null
    ) {

        drawJobHUD();
    }
}


// ==========================================================
// HUD DEL TRABAJO
// ==========================================================

function drawJobHUD() {

    const x =
        canvas.width -
        365;


    const y = 25;


    ctx.fillStyle =
        "rgba(10,14,18,0.94)";


    ctx.fillRect(
        x,
        y,
        340,
        175
    );


    ctx.fillStyle =
        "#f2cf4c";


    ctx.font =
        "bold 20px Arial";


    ctx.fillText(
        "TRABAJO ACTUAL",
        x + 18,
        y + 30
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "14px Arial";


    ctx.fillText(
        "Carga: " +
        currentJob.cargo,
        x + 18,
        y + 60
    );


    ctx.fillText(
        "Origen: " +
        currentJob.from,
        x + 18,
        y + 87
    );


    ctx.fillText(
        "Destino: " +
        currentJob.to,
        x + 18,
        y + 114
    );


    ctx.fillStyle =
        "#5cff7a";


    ctx.font =
        "bold 15px Arial";


    ctx.fillText(
        "Pago: " +
        currentJob.reward +
        " €",
        x + 18,
        y + 145
    );
}


// ==========================================================
// MENÚ DE TRABAJOS
// ==========================================================

function drawJobMenu() {

    ctx.fillStyle =
        "#101719";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.fillStyle =
        "#f2cf4c";


    ctx.font =
        "bold 32px Arial";


    ctx.fillText(
        "AGENCIA DE TRABAJOS",
        50,
        60
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "16px Arial";


    ctx.fillText(
        "Pulsa 1-8 para aceptar un trabajo",
        50,
        90
    );


    jobs.forEach(
        function(job, index) {

            const y =
                120 +
                index * 65;


            ctx.fillStyle =
                "rgba(42,51,56,0.96)";


            ctx.fillRect(
                40,
                y,
                canvas.width - 80,
                52
            );


            ctx.fillStyle =
                "#f2cf4c";


            ctx.font =
                "bold 16px Arial";


            ctx.fillText(
                (
                    index + 1
                ) +
                ". " +
                job.cargo,
                60,
                y + 21
            );


            ctx.fillStyle =
                "#ffffff";


            ctx.font =
                "14px Arial";


            ctx.fillText(
                job.from +
                " → " +
                job.to,
                60,
                y + 42
            );


            ctx.fillStyle =
                "#5cff7a";


            ctx.font =
                "bold 15px Arial";


            ctx.fillText(
                job.reward +
                " €",
                canvas.width - 120,
                y + 30
            );
        }
    );


    ctx.fillStyle =
        "#aaa";


    ctx.font =
        "15px Arial";


    ctx.fillText(
        "J para volver al juego",
        50,
        canvas.height - 30
    );
}


// ==========================================================
// MINIMAPA
// ==========================================================

function drawMinimap() {

    const width = 310;

    const height = 215;

    const margin = 20;


    const x =
        canvas.width -
        width -
        margin;


    const y =
        canvas.height -
        height -
        margin;


    // PANEL
    ctx.fillStyle =
        "rgba(8,12,14,0.94)";


    ctx.fillRect(
        x - 6,
        y - 6,
        width + 12,
        height + 12
    );


    // TERRENO
    ctx.fillStyle =
        "#617654";


    ctx.fillRect(
        x,
        y,
        width,
        height
    );


    const scaleX =
        width /
        WORLD_WIDTH;


    const scaleY =
        height /
        WORLD_HEIGHT;


    function miniX(
        worldX
    ) {

        return (
            x +
            worldX *
            scaleX
        );
    }


    function miniY(
        worldY
    ) {

        return (
            y +
            worldY *
            scaleY
        );
    }


    // CARRETERAS
    for (
        const road of roads
    ) {

        let roadWidth = 2;


        if (
            road.type ===
            "motorway"
        ) {

            roadWidth = 6;

        } else if (
            road.type ===
            "dual"
        ) {

            roadWidth = 5;

        } else if (
            road.type ===
            "secondary"
        ) {

            roadWidth = 2.5;

        } else {

            roadWidth = 2;
        }


        // BORDE
        ctx.beginPath();


        for (
            let i = 0;
            i <
            road.points.length;
            i++
        ) {

            const point =
                road.points[i];


            const sx =
                miniX(
                    point[0]
                );


            const sy =
                miniY(
                    point[1]
                );


            if (
                i === 0
            ) {

                ctx.moveTo(
                    sx,
                    sy
                );

            } else {

                ctx.lineTo(
                    sx,
                    sy
                );
            }
        }


        ctx.strokeStyle =
            "#24282a";


        ctx.lineWidth =
            roadWidth + 2;


        ctx.lineCap =
            "round";


        ctx.lineJoin =
            "round";


        ctx.stroke();


        // ASFALTO
        ctx.beginPath();


        for (
            let i = 0;
            i <
            road.points.length;
            i++
        ) {

            const point =
                road.points[i];


            const sx =
                miniX(
                    point[0]
                );


            const sy =
                miniY(
                    point[1]
                );


            if (
                i === 0
            ) {

                ctx.moveTo(
                    sx,
                    sy
                );

            } else {

                ctx.lineTo(
                    sx,
                    sy
                );
            }
        }


        ctx.strokeStyle =
            road.type ===
            "motorway"

                ? "#eeeeee"

                : road.type ===
                  "dual"

                    ? "#d5d5d5"

                    : "#a9a9a9";


        ctx.lineWidth =
            roadWidth;


        ctx.stroke();
    }


    // CIUDADES
    for (
        const city of cities
    ) {

        const cx =
            miniX(
                city.x
            );


        const cy =
            miniY(
                city.y
            );


        const radius =
            5 +
            city.size *
            2;


        ctx.fillStyle =
            "#d94a42";


        ctx.beginPath();

        ctx.arc(
            cx,
            cy,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#ffffff";


        ctx.font =
            "bold 10px Arial";


        ctx.fillText(
            city.name,
            cx + radius + 3,
            cy
        );
    }


    // PUEBLOS
    for (
        const town of towns
    ) {

        const tx =
            miniX(
                town.x
            );


        const ty =
            miniY(
                town.y
            );


        ctx.fillStyle =
            "#f2cf4c";


        ctx.beginPath();

        ctx.arc(
            tx,
            ty,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#f5f5f5";


        ctx.font =
            "8px Arial";


        ctx.fillText(
            town.name,
            tx + 5,
            ty
        );
    }


    // DESTINO
    if (
        currentJob !== null
    ) {

        const dx =
            miniX(
                currentJob.destination[0]
            );


        const dy =
            miniY(
                currentJob.destination[1]
            );


        ctx.strokeStyle =
            "#ff5a4d";


        ctx.lineWidth = 2;


        ctx.beginPath();

        ctx.arc(
            dx,
            dy,
            7,
            0,
            Math.PI * 2
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            dx - 4,
            dy
        );

        ctx.lineTo(
            dx + 4,
            dy
        );

        ctx.moveTo(
            dx,
            dy - 4
        );

        ctx.lineTo(
            dx,
            dy + 4
        );

        ctx.stroke();
    }


    // CAMIÓN
    const truckX =
        miniX(
            truck.x
        );


    const truckY =
        miniY(
            truck.y
        );


    ctx.save();


    ctx.translate(
        truckX,
        truckY
    );


    ctx.rotate(
        truck.angle
    );


    ctx.fillStyle =
        "#ff2020";


    ctx.beginPath();

    ctx.moveTo(
        0,
        -9
    );

    ctx.lineTo(
        -5,
        7
    );

    ctx.lineTo(
        0,
        4
    );

    ctx.lineTo(
        5,
        7
    );

    ctx.closePath();

    ctx.fill();


    ctx.restore();


    // BORDE
    ctx.strokeStyle =
        "#ffffff";


    ctx.lineWidth = 2;


    ctx.strokeRect(
        x,
        y,
        width,
        height
    );


    // TÍTULO
    ctx.fillStyle =
        "rgba(5,8,10,0.8)";


    ctx.fillRect(
        x + 5,
        y + 5,
        80,
        20
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "bold 11px Arial";


    ctx.fillText(
        "MINIMAPA",
        x + 12,
        y + 19
    );
}


// ==========================================================
// MAPA COMPLETO
// ==========================================================

function drawFullMap() {

    ctx.fillStyle =
        "#52674d";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    const mapScale =
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
            WORLD_WIDTH *
            mapScale
        ) / 2;


    const offsetY =
        (
            canvas.height -
            WORLD_HEIGHT *
            mapScale
        ) / 2;


    // CARRETERAS
    for (
        const road of roads
    ) {

        ctx.beginPath();


        for (
            let i = 0;
            i <
            road.points.length;
            i++
        ) {

            const point =
                road.points[i];


            const x =
                offsetX +
                point[0] *
                mapScale;


            const y =
                offsetY +
                point[1] *
                mapScale;


            if (
                i === 0
            ) {

                ctx.moveTo(
                    x,
                    y
                );

            } else {

                ctx.lineTo(
                    x,
                    y
                );
            }
        }


        let width = 4;


        if (
            road.type ===
            "motorway"
        ) {

            width = 9;

        } else if (
            road.type ===
            "dual"
        ) {

            width = 7;

        } else if (
            road.type ===
            "secondary"
        ) {

            width = 4;

        } else {

            width = 3;
        }


        ctx.strokeStyle =
            "#24282a";


        ctx.lineWidth =
            width + 3;


        ctx.lineCap =
            "round";


        ctx.lineJoin =
            "round";


        ctx.stroke();


        ctx.beginPath();


        for (
            let i = 0;
            i <
            road.points.length;
            i++
        ) {

            const point =
                road.points[i];


            const x =
                offsetX +
                point[0] *
                mapScale;


            const y =
                offsetY +
                point[1] *
                mapScale;


            if (
                i === 0
            ) {

                ctx.moveTo(
                    x,
                    y
                );

            } else {

                ctx.lineTo(
                    x,
                    y
                );
            }
        }


        ctx.strokeStyle =
            road.type ===
            "motorway"

                ? "#f2f2f2"

                : road.type ===
                  "dual"

                    ? "#d9d9d9"

                    : "#aaaaaa";


        ctx.lineWidth =
            width;


        ctx.stroke();
    }


    // CIUDADES
    for (
        const city of cities
    ) {

        const x =
            offsetX +
            city.x *
            mapScale;


        const y =
            offsetY +
            city.y *
            mapScale;


        ctx.fillStyle =
            "#d94a42";


        ctx.beginPath();

        ctx.arc(
            x,
            y,
            8,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#ffffff";


        ctx.font =
            "bold 15px Arial";


        ctx.fillText(
            city.name,
            x + 12,
            y + 5
        );
    }


    // PUEBLOS
    for (
        const town of towns
    ) {

        const x =
            offsetX +
            town.x *
            mapScale;


        const y =
            offsetY +
            town.y *
            mapScale;


        ctx.fillStyle =
            "#f2cf4c";


        ctx.beginPath();

        ctx.arc(
            x,
            y,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#ffffff";


        ctx.font =
            "11px Arial";


        ctx.fillText(
            town.name,
            x + 8,
            y + 4
        );
    }


    // CAMIÓN
    const tx =
        offsetX +
        truck.x *
        mapScale;


    const ty =
        offsetY +
        truck.y *
        mapScale;


    ctx.save();


    ctx.translate(
        tx,
        ty
    );


    ctx.rotate(
        truck.angle
    );


    ctx.fillStyle =
        "#ff2020";


    ctx.beginPath();

    ctx.moveTo(
        0,
        -14
    );

    ctx.lineTo(
        -8,
        10
    );

    ctx.lineTo(
        0,
        6
    );

    ctx.lineTo(
        8,
        10
    );

    ctx.closePath();

    ctx.fill();


    ctx.restore();


    // TÍTULO
    ctx.fillStyle =
        "rgba(5,8,10,0.9)";


    ctx.fillRect(
        25,
        25,
        260,
        80
    );


    ctx.fillStyle =
        "#f2cf4c";


    ctx.font =
        "bold 30px Arial";


    ctx.fillText(
        "MAPA GENERAL",
        45,
        60
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "15px Arial";


    ctx.fillText(
        "M para volver al juego",
        45,
        87
    );


    // LEYENDA
    const legendX =
        canvas.width -
        250;


    const legendY =
        25;


    ctx.fillStyle =
        "rgba(5,8,10,0.9)";


    ctx.fillRect(
        legendX,
        legendY,
        225,
        145
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "bold 15px Arial";


    ctx.fillText(
        "LEYENDA",
        legendX + 15,
        legendY + 25
    );


    ctx.fillStyle =
        "#f2f2f2";


    ctx.fillRect(
        legendX + 15,
        legendY + 42,
        30,
        5
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "13px Arial";


    ctx.fillText(
        "Autopista",
        legendX + 55,
        legendY + 48
    );


    ctx.fillStyle =
        "#d9d9d9";


    ctx.fillRect(
        legendX + 15,
        legendY + 67,
        30,
        5
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.fillText(
        "Autovía",
        legendX + 55,
        legendY + 73
    );


    ctx.fillStyle =
        "#aaaaaa";


    ctx.fillRect(
        legendX + 15,
        legendY + 92,
        30,
        4
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.fillText(
        "Secundaria",
        legendX + 55,
        legendY + 98
    );


    ctx.fillStyle =
        "#d94a42";


    ctx.beginPath();

    ctx.arc(
        legendX + 30,
        legendY + 120,
        6,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#ffffff";


    ctx.fillText(
        "Ciudad",
        legendX + 55,
        legendY + 125
    );
}


// ==========================================================
// BUCLE PRINCIPAL
// ==========================================================

function gameLoop() {

    updateTruck();

    updateTraffic();


    if (
        jobMenu
    ) {

        drawJobMenu();

    } else if (
        mapMode
    ) {

        drawFullMap();

    } else {

        drawTerrain();

        drawTrees();

        drawRoads();

        drawTraffic();

        drawCities();

        drawTruck();

        drawHUD();

        drawMinimap();
    }


    requestAnimationFrame(
        gameLoop
    );
}


// ==========================================================
// INICIAR
// ==========================================================

gameLoop();
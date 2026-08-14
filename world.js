"use strict";

window.WORLD = {

    width: 28000,
    height: 12000,

    minX: -9000,
    maxX: 19000,

    minY: -3000,
    maxY: 11000,

    name: "WORLD"
};


/* ============================================================
   SERVICIOS
   ============================================================ */

window.SERVICES = [];


function addService(name, type, x, y) {

    window.SERVICES.push({
        name,
        type,
        x,
        y
    });
}


/* Gasolineras */

addService("Gasolinera Madrid", "fuel", 7500, 5100);
addService("Gasolinera Barcelona", "fuel", 12200, 3600);
addService("Gasolinera Valencia", "fuel", 10600, 5500);
addService("Gasolinera Sevilla", "fuel", 5100, 8100);
addService("Gasolinera Zaragoza", "fuel", 10000, 3100);

addService("Station Paris", "fuel", 7700, 400);
addService("Station Bordeaux", "fuel", 4000, 2000);
addService("Station Toulouse", "fuel", 4900, 3100);
addService("Station Lyon", "fuel", 8600, 2300);
addService("Station Marseille", "fuel", 7100, 4000);

addService("Station Berlin", "fuel", 12000, 400);
addService("Station Rome", "fuel", 10800, 5800);
addService("Station London", "fuel", 6800, -700);
addService("Station Lisbon", "fuel", 2500, 6600);


/* Talleres */

addService("Taller Madrid", "repair", 7700, 4900);
addService("Taller Barcelona", "repair", 12200, 3400);
addService("Taller Valencia", "repair", 10800, 5700);
addService("Garage Paris", "repair", 7900, 400);
addService("Garage Lyon", "repair", 8500, 2100);
addService("Garage Rome", "repair", 10900, 5600);


/* ============================================================
   TRÁFICO
   ============================================================ */

window.TRAFFIC = [];


function createTraffic(count = 100) {

    window.TRAFFIC.length = 0;

    const colors = [
        "#d62f2f",
        "#eeeeee",
        "#333333",
        "#2167a0",
        "#e2a52e",
        "#5b8d55",
        "#777777",
        "#b96b35"
    ];

    for (let i = 0; i < count; i++) {

        const road =
            ROADS[
                Math.floor(
                    Math.random() *
                    ROADS.length
                )
            ];

        if (!road || !road.points.length)
            continue;

        const point =
            road.points[
                Math.floor(
                    Math.random() *
                    road.points.length
                )
            ];

        TRAFFIC.push({

            x: point[0] +
                (Math.random() * 150 - 75),

            y: point[1] +
                (Math.random() * 150 - 75),

            angle:
                Math.random() *
                Math.PI *
                2,

            speed:
                0.3 +
                Math.random() * 1.3,

            color:
                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ]
        });
    }
}


createTraffic(120);


/* ============================================================
   UTILIDADES DEL MUNDO
   ============================================================ */

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


function nearestCity(x, y) {

    let result = null;
    let best = Infinity;

    for (const city of CITIES) {

        const d =
            distance(
                x,
                y,
                city.x,
                city.y
            );

        if (d < best) {

            best = d;
            result = city;
        }
    }

    return result;
}


function nearestRoad(x, y) {

    let result = null;
    let best = Infinity;

    for (const road of ROADS) {

        for (const point of road.points) {

            const d =
                distance(
                    x,
                    y,
                    point[0],
                    point[1]
                );

            if (d < best) {

                best = d;
                result = road;
            }
        }
    }

    return result;
}


function roadSpeedLimit(road) {

    if (!road)
        return 50;

    switch (road.type) {

        case "autopista":
            return 120;

        case "autovia":
            return 110;

        case "nacional":
            return 90;

        case "secundaria":
            return 80;

        default:
            return 50;
    }
}

"use strict";

window.JOB_TYPES = [
    "Frigoríficos",
    "Muebles",
    "Maquinaria pesada",
    "Electrónica",
    "Productos agrícolas",
    "Material industrial",
    "Automóviles",
    "Bebidas",
    "Material de construcción",
    "Productos químicos",
    "Textiles",
    "Piezas de maquinaria"
];


window.JOB = {

    active: false,

    cargo: "",

    weight: 0,

    from: "",

    to: "",

    reward: 0,

    destination: null,

    distance: 0
};


function generateJob(truck) {

    const possible =
        CITIES.filter(
            city =>
                distance(
                    truck.x,
                    truck.y,
                    city.x,
                    city.y
                ) > 1500
        );

    if (!possible.length)
        return null;

    const destination =
        possible[
            Math.floor(
                Math.random() *
                possible.length
            )
        ];

    const cargo =
        JOB_TYPES[
            Math.floor(
                Math.random() *
                JOB_TYPES.length
            )
        ];

    const weight =
        6000 +
        Math.floor(
            Math.random() *
            24000
        );

    const d =
        distance(
            truck.x,
            truck.y,
            destination.x,
            destination.y
        );

    const reward =
        Math.round(
            1000 +
            d * 0.8 +
            weight * 0.08
        );

    return {

        active: true,

        cargo,

        weight,

        from:
            nearestCity(
                truck.x,
                truck.y
            )?.name || "Origen",

        to:
            destination.name,

        reward,

        destination,

        distance: d
    };
}


function acceptJob(truck) {

    if (JOB.active) {

        showMessage(
            "Ya tienes un trabajo activo"
        );

        return;
    }

    const newJob =
        generateJob(truck);

    if (!newJob)
        return;

    Object.assign(
        JOB,
        newJob
    );

    truck.cargoWeight =
        JOB.weight;

    showMessage(
        "TRABAJO ACEPTADO: " +
        JOB.cargo +
        " → " +
        JOB.to
    );
}


function updateJob(truck) {

    if (
        !JOB.active ||
        !JOB.destination
    ) {
        return;
    }

    JOB.distance =
        distance(
            truck.x,
            truck.y,
            JOB.destination.x,
            JOB.destination.y
        );

    if (JOB.distance < 180) {

        money += JOB.reward;

        showMessage(
            "ENTREGA COMPLETADA  +€" +
            JOB.reward
        );

        JOB.active = false;

        JOB.destination = null;

        truck.cargoWeight = 0;

        JOB.cargo = "";
        JOB.weight = 0;
        JOB.from = "";
        JOB.to = "";
        JOB.reward = 0;
    }
}

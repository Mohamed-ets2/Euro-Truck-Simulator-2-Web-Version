"use strict";

window.CITIES = [

    /* =========================
       ESPAÑA
       ========================= */

    { name: "Madrid", country: "España", x: 7600, y: 5000, size: 4 },
    { name: "Barcelona", country: "España", x: 12300, y: 3500, size: 4 },
    { name: "Valencia", country: "España", x: 10700, y: 5600, size: 3 },
    { name: "Sevilla", country: "España", x: 5000, y: 8200, size: 3 },
    { name: "Málaga", country: "España", x: 5700, y: 9000, size: 3 },
    { name: "Granada", country: "España", x: 6500, y: 8500, size: 2 },
    { name: "Córdoba", country: "España", x: 5300, y: 7600, size: 2 },
    { name: "Zaragoza", country: "España", x: 10100, y: 3000, size: 3 },
    { name: "Bilbao", country: "España", x: 6900, y: 1800, size: 3 },
    { name: "San Sebastián", country: "España", x: 7500, y: 1500, size: 2 },
    { name: "Valladolid", country: "España", x: 6200, y: 3300, size: 2 },
    { name: "Salamanca", country: "España", x: 5100, y: 3900, size: 2 },
    { name: "Burgos", country: "España", x: 6500, y: 2400, size: 2 },
    { name: "León", country: "España", x: 5400, y: 2500, size: 2 },
    { name: "Oviedo", country: "España", x: 4700, y: 1600, size: 2 },
    { name: "Santander", country: "España", x: 5700, y: 1700, size: 2 },
    { name: "Vigo", country: "España", x: 3600, y: 2700, size: 2 },
    { name: "A Coruña", country: "España", x: 3000, y: 1900, size: 2 },
    { name: "Santiago", country: "España", x: 3300, y: 2200, size: 2 },
    { name: "Pamplona", country: "España", x: 8000, y: 2200, size: 2 },
    { name: "Logroño", country: "España", x: 7600, y: 2500, size: 2 },
    { name: "Huesca", country: "España", x: 9300, y: 2500, size: 1 },
    { name: "Lleida", country: "España", x: 10800, y: 3000, size: 2 },
    { name: "Tarragona", country: "España", x: 11600, y: 4000, size: 2 },
    { name: "Castellón", country: "España", x: 11200, y: 5000, size: 1 },
    { name: "Alicante", country: "España", x: 10800, y: 6600, size: 2 },
    { name: "Murcia", country: "España", x: 10000, y: 7600, size: 2 },
    { name: "Almería", country: "España", x: 8800, y: 8600, size: 2 },
    { name: "Jaén", country: "España", x: 6900, y: 7800, size: 1 },
    { name: "Cádiz", country: "España", x: 4400, y: 9000, size: 2 },
    { name: "Huelva", country: "España", x: 3900, y: 8400, size: 2 },
    { name: "Badajoz", country: "España", x: 4200, y: 6500, size: 2 },
    { name: "Cáceres", country: "España", x: 4700, y: 5900, size: 1 },
    { name: "Toledo", country: "España", x: 6900, y: 5700, size: 2 },
    { name: "Cuenca", country: "España", x: 8500, y: 5700, size: 1 },
    { name: "Guadalajara", country: "España", x: 7900, y: 4500, size: 1 },
    { name: "Segovia", country: "España", x: 6500, y: 4200, size: 1 },
    { name: "Ávila", country: "España", x: 6000, y: 4500, size: 1 },
    { name: "Soria", country: "España", x: 8500, y: 3300, size: 1 },
    { name: "Teruel", country: "España", x: 9000, y: 4800, size: 1 },
    { name: "Albacete", country: "España", x: 9000, y: 6500, size: 2 },

    /* Pueblos */

    { name: "Lugo", country: "España", x: 3800, y: 2100, size: 0 },
    { name: "Ourense", country: "España", x: 3900, y: 2900, size: 0 },
    { name: "Ponferrada", country: "España", x: 4700, y: 2700, size: 0 },
    { name: "Gijón", country: "España", x: 4500, y: 1450, size: 0 },
    { name: "Avilés", country: "España", x: 4300, y: 1500, size: 0 },
    { name: "Torrelavega", country: "España", x: 5500, y: 1750, size: 0 },
    { name: "Palencia", country: "España", x: 6000, y: 3000, size: 0 },
    { name: "Aranda de Duero", country: "España", x: 6600, y: 2850, size: 0 },
    { name: "Talavera", country: "España", x: 5800, y: 5500, size: 0 },
    { name: "Alcázar de San Juan", country: "España", x: 7300, y: 6500, size: 0 },
    { name: "Tomelloso", country: "España", x: 7900, y: 6700, size: 0 },
    { name: "Calatayud", country: "España", x: 9000, y: 3400, size: 0 },
    { name: "Fraga", country: "España", x: 10300, y: 3200, size: 0 },
    { name: "Reus", country: "España", x: 11400, y: 4200, size: 0 },
    { name: "Manresa", country: "España", x: 12000, y: 3100, size: 0 },
    { name: "Girona", country: "España", x: 12600, y: 2700, size: 0 },
    { name: "Figueres", country: "España", x: 12900, y: 2300, size: 0 },
    { name: "Requena", country: "España", x: 10100, y: 5900, size: 0 },
    { name: "Gandía", country: "España", x: 10800, y: 6100, size: 0 },
    { name: "Benidorm", country: "España", x: 11000, y: 6900, size: 0 },
    { name: "Orihuela", country: "España", x: 10300, y: 7300, size: 0 },
    { name: "Antequera", country: "España", x: 6000, y: 8700, size: 0 },
    { name: "Ronda", country: "España", x: 5200, y: 9000, size: 0 },
    { name: "Marbella", country: "España", x: 5500, y: 9300, size: 0 },
    { name: "Motril", country: "España", x: 7000, y: 8800, size: 0 },
    { name: "Linares", country: "España", x: 6600, y: 7400, size: 0 },
    { name: "Écija", country: "España", x: 5100, y: 8000, size: 0 },

    /* =========================
       FRANCIA
       ========================= */

    { name: "París", country: "Francia", x: 7800, y: 300, size: 4 },
    { name: "Burdeos", country: "Francia", x: 3900, y: 1900, size: 3 },
    { name: "Toulouse", country: "Francia", x: 4800, y: 3000, size: 3 },
    { name: "Montpellier", country: "Francia", x: 6100, y: 3600, size: 2 },
    { name: "Marsella", country: "Francia", x: 7000, y: 3900, size: 3 },
    { name: "Lyon", country: "Francia", x: 8500, y: 2200, size: 3 },
    { name: "Nantes", country: "Francia", x: 3000, y: 1000, size: 2 },
    { name: "Rennes", country: "Francia", x: 2500, y: 600, size: 2 },
    { name: "Lille", country: "Francia", x: 8300, y: -300, size: 2 },
    { name: "Rouen", country: "Francia", x: 6900, y: 0, size: 2 },
    { name: "Estrasburgo", country: "Francia", x: 10500, y: 1000, size: 2 },
    { name: "Dijon", country: "Francia", x: 9200, y: 1300, size: 2 },
    { name: "Clermont-Ferrand", country: "Francia", x: 7200, y: 2000, size: 2 },
    { name: "Limoges", country: "Francia", x: 5200, y: 1600, size: 2 },
    { name: "Bayona", country: "Francia", x: 3500, y: 2500, size: 2 },
    { name: "Perpiñán", country: "Francia", x: 6000, y: 4000, size: 2 },
    { name: "Grenoble", country: "Francia", x: 9000, y: 3000, size: 2 },
    { name: "Niza", country: "Francia", x: 9900, y: 3800, size: 2 },
    { name: "Brest", country: "Francia", x: 1700, y: 600, size: 2 },

    /* =========================
       PORTUGAL
       ========================= */

    { name: "Lisboa", country: "Portugal", x: 2500, y: 6500, size: 3 },
    { name: "Oporto", country: "Portugal", x: 2500, y: 3500, size: 3 },
    { name: "Braga", country: "Portugal", x: 2700, y: 3000, size: 1 },
    { name: "Coímbra", country: "Portugal", x: 2600, y: 4500, size: 2 },
    { name: "Faro", country: "Portugal", x: 3000, y: 8500, size: 2 },

    /* =========================
       ALEMANIA
       ========================= */

    { name: "Berlín", country: "Alemania", x: 12000, y: 300, size: 4 },
    { name: "Hamburgo", country: "Alemania", x: 11200, y: -400, size: 3 },
    { name: "Múnich", country: "Alemania", x: 11500, y: 2800, size: 3 },
    { name: "Frankfurt", country: "Alemania", x: 10300, y: 1400, size: 3 },
    { name: "Colonia", country: "Alemania", x: 9600, y: 700, size: 3 },
    { name: "Stuttgart", country: "Alemania", x: 10300, y: 2300, size: 2 },
    { name: "Dresde", country: "Alemania", x: 12300, y: 1000, size: 2 },

    /* =========================
       ITALIA
       ========================= */

    { name: "Milán", country: "Italia", x: 10400, y: 3500, size: 3 },
    { name: "Turín", country: "Italia", x: 9700, y: 3500, size: 2 },
    { name: "Venecia", country: "Italia", x: 11600, y: 3700, size: 2 },
    { name: "Bolonia", country: "Italia", x: 11300, y: 4300, size: 2 },
    { name: "Florencia", country: "Italia", x: 11000, y: 4800, size: 2 },
    { name: "Roma", country: "Italia", x: 10800, y: 5700, size: 4 },
    { name: "Nápoles", country: "Italia", x: 10900, y: 6500, size: 3 },

    /* =========================
       REINO UNIDO
       ========================= */

    { name: "Londres", country: "Reino Unido", x: 6800, y: -800, size: 4 },
    { name: "Manchester", country: "Reino Unido", x: 6100, y: -1700, size: 2 },
    { name: "Liverpool", country: "Reino Unido", x: 5700, y: -1600, size: 2 },
    { name: "Birmingham", country: "Reino Unido", x: 6000, y: -1000, size: 2 },
    { name: "Edimburgo", country: "Reino Unido", x: 5800, y: -2800, size: 2 },

    /* =========================
       PAÍSES BAJOS / BÉLGICA
       ========================= */

    { name: "Ámsterdam", country: "Países Bajos", x: 8800, y: -300, size: 3 },
    { name: "Rotterdam", country: "Países Bajos", x: 8500, y: 0, size: 2 },
    { name: "Bruselas", country: "Bélgica", x: 8700, y: 500, size: 3 },
    { name: "Amberes", country: "Bélgica", x: 8800, y: 200, size: 2 },

    /* =========================
       SUIZA / AUSTRIA
       ========================= */

    { name: "Ginebra", country: "Suiza", x: 9200, y: 3000, size: 2 },
    { name: "Zúrich", country: "Suiza", x: 10000, y: 2700, size: 2 },
    { name: "Viena", country: "Austria", x: 12500, y: 2200, size: 3 },
    { name: "Salzburgo", country: "Austria", x: 12000, y: 2600, size: 2 },

    /* =========================
       POLONIA / CHEQUIA
       ========================= */

    { name: "Varsovia", country: "Polonia", x: 13700, y: 900, size: 3 },
    { name: "Cracovia", country: "Polonia", x: 13400, y: 1800, size: 2 },
    { name: "Praga", country: "Chequia", x: 11600, y: 1500, size: 3 },

    /* =========================
       OTROS CONTINENTES
       ========================= */

    { name: "Nueva York", country: "Estados Unidos", x: -4000, y: 4000, size: 4 },
    { name: "Los Ángeles", country: "Estados Unidos", x: -8000, y: 6000, size: 4 },
    { name: "Chicago", country: "Estados Unidos", x: -5200, y: 3000, size: 3 },
    { name: "Miami", country: "Estados Unidos", x: -3500, y: 7000, size: 3 },

    { name: "Toronto", country: "Canadá", x: -4500, y: 2000, size: 3 },
    { name: "Montreal", country: "Canadá", x: -3000, y: 1300, size: 2 },
    { name: "Vancouver", country: "Canadá", x: -8500, y: 1800, size: 3 },

    { name: "Ciudad de México", country: "México", x: -4700, y: 8500, size: 4 },

    { name: "São Paulo", country: "Brasil", x: -500, y: 9200, size: 4 },
    { name: "Río de Janeiro", country: "Brasil", x: 300, y: 8500, size: 3 },
    { name: "Buenos Aires", country: "Argentina", x: -900, y: 10300, size: 4 },

    { name: "Tokio", country: "Japón", x: 18500, y: 4200, size: 4 },
    { name: "Osaka", country: "Japón", x: 18000, y: 5000, size: 3 },

    { name: "Pekín", country: "China", x: 16500, y: 1800, size: 4 },
    { name: "Shanghái", country: "China", x: 17000, y: 3300, size: 4 },

    { name: "Sídney", country: "Australia", x: 15000, y: 9500, size: 4 },
    { name: "Melbourne", country: "Australia", x: 14000, y: 10000, size: 3 },

    { name: "El Cairo", country: "Egipto", x: 11500, y: 6200, size: 3 },
    { name: "Johannesburgo", country: "Sudáfrica", x: 8500, y: 10500, size: 3 }
];

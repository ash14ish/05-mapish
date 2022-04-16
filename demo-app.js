"use strict";
//////////// App Designing ////////////////

document.querySelector(".sidebar").style.display = "none";
let map;

// navigator.geolocation.getCurrentPosition(
//   function (position) {
//     //   console.log(position);
//     //   console.log(position.coords);
//     let { latitude, longitude } = position.coords;
//     let coordinates = [latitude, longitude];
//     //   console.log(latitude, longitude);
//     //   console.log(`https://www.google.com/maps/@${latitude},${longitude},12z`);

//     map = L.map("map").setView(coordinates, 13);

//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution:
//         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     }).addTo(map);

//     //   L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
//     //     attribution:
//     //       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     //   }).addTo(map);

//     map.on("click", function (location) {
//       // console.log(location);

//       let { lat, lng } = location.latlng;

//       L.marker([lat, lng])
//         .addTo(map)
//         .bindPopup(
//           L.popup({
//             autoClose: false,
//             closeOnClick: false,
//             maxWidth: 80,
//             className: `running-popup`,
//           })
//         )
//         .setPopupContent(
//           `You are at
//             lat : ${lat.toFixed(2)}
//             long : ${lng.toFixed(2)}`
//         )
//         .openPopup();
//     });
//   },
//   () => alert("Access Denied")
// );

let cdArr = [];

let mapContainer = document.querySelector("#map");
getLocalStorage();

cdArr ||= [];

navigator.geolocation.getCurrentPosition(
  function (position) {
    //   console.log(position);
    //   console.log(position.coords);
    let { latitude, longitude } = position.coords;
    // console.log(latitude, longitude);
    //   console.log(`https://www.google.com/maps/@${latitude},${longitude},12z`);

    map = L.map("map").setView([latitude, longitude], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    //   attribution:
    //     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    // }).addTo(map);

    map.on("click", function (location) {
      let { lat, lng } = location.latlng;
      marker([lat, lng]);

      cdArr.push([lat, lng]);
      localStorage.setItem("cd", JSON.stringify(cdArr));
    });
    cdArr.forEach(curr => marker(curr));
  },
  () => alert("Access Denied")
);

function marker(coords) {
  L.marker(coords)
    .addTo(map)
    .bindPopup(
      L.popup({
        autoClose: false,
        closeOnClick: false,
        maxWidth: 80,
        className: `cycling-popup`,
      })
    )
    .setPopupContent(
      `You are at
      lat : ${coords[0].toFixed(2)}
      long : ${coords[1].toFixed(2)}`
    )
    .openPopup();
}

function getLocalStorage() {
  cdArr = JSON.parse(localStorage.getItem("cd"));
}

function reset() {
  localStorage.removeItem("cd");
  location.reload();
}

// reset();

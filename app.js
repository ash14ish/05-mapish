"use strict";

// prettier-ignore

//////////// Architecture Planning////////

class Workout {
  date = new Date();
  id = String(Date.now()).slice(-10);
  clicks =0;

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat,lng]
    this.distance = distance;
    this.duration = duration;
  }
  _setDescription() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
  }

  _getClicks(){
    this.clicks++;
    }
}

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance; // min/m
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60); // km/h
    return this.speed;
  }
}

//////////// App Designing ////////////////

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class App {
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoom = 13;

  constructor() {
    this._getPosition();

    this._getLocalStorage();

    form.addEventListener("submit", this._newWorkout.bind(this));

    inputType.addEventListener("change", this._toggleElevationField.bind(this));

    containerWorkouts.addEventListener("click", this._mapMove.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
        alert("GeoLocation access denied")
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coordinates = [latitude, longitude];

    //   console.log(`https://www.google.com/maps/@${latitude},${longitude},12z`);

    this.#map = L.map("map").setView(coordinates, this.#mapZoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._toggleForm.bind(this));
    this.#workouts.forEach(curr => this._renderWorkoutMarker(curr));
  }

  _toggleForm(mapE) {
    form.classList.toggle("hidden");
    inputDistance.focus();
    this.#mapEvent = mapE;
  }

  _hideForm() {
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        "";
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    let { lat, lng } = this.#mapEvent.latlng;
    let workout;

    const validInputs = (...inputArr) =>
      inputArr.every(curr => Number.isFinite(curr));
    const allPositives = (...inputArr) => inputArr.every(curr => curr > 0);

    e.preventDefault();

    // get data from form

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    //Running Object

    if (type === "running") {
      const cadence = +inputCadence.value;
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositives(distance, duration, cadence)
      )
        return alert("Only positive numbers are accepted");
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // Cycling Object

    if (type === "cycling") {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositives(distance, duration)
      )
        return alert("Only positive numbers are accepted");
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // adding object in workout array

    this.#workouts.push(workout);

    // render workout as marker
    this._renderWorkoutMarker(workout);

    // render workout in the list

    this._renderWorkout(workout);

    // hide the form

    this._hideForm();

    // local storage

    this._setLocalStorage();
  }

  _renderWorkoutMarker(wrkot) {
    let cyIcon = {
      iconUrl: `cycling.svg`,
      iconSize: [55, 35],
      iconAnchor: [30, 35],
      popupAnchor: [5, -36],
    };

    let ruIcon = {
      iconUrl: `running.svg`,
      iconSize: [65, 45],
      iconAnchor: [35, 25],
      popupAnchor: [8, -20],
    };

    L.marker(wrkot.coords, {
      icon: L.icon(wrkot.type === "running" ? ruIcon : cyIcon),
    })
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 150,
          minWidth: 80,
          autoClose: false,
          closeOnClick: false,
          className: `${wrkot.type}-popup`,
        })
      )
      .setPopupContent(
        ` ${wrkot.description.split(" ").slice(2).join(" ")}`
        // ${wrkot.type === "running" ? "🏃‍♂️" : "🚴‍♀️"}
      )
      .openPopup();
  }

  _renderWorkout(wkot) {
    let html = `<li class="workout workout--${wkot.type}" data-id="${wkot.id}">
    <h2 class="workout__title">${wkot.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        wkot.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
      }</span>
      <span class="workout__value">${wkot.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon ">⏱</span>
      <span class="workout__value">${wkot.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;

    if (wkot.type === "running") {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${wkot.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details grid-right">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${wkot.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;
    }

    if (wkot.type === "cycling") {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${wkot.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${wkot.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>`;
    }

    form.insertAdjacentHTML("afterEnd", html);
  }

  _mapMove(e) {
    const movEl = e.target.closest(".workout");
    if (!movEl) return;
    const workout = this.#workouts.find(curr => curr.id === movEl.dataset.id);
    this.#map.setView(workout.coords, this.#mapZoom, {
      animate: "1",
      pane: {
        duration: "1",
      },
    });

    // workout._getClicks();
  }

  _setLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const locStoObj = JSON.parse(localStorage.getItem("workouts"));
    if (!locStoObj) return;
    // console.log(locStoObj);
    this.#workouts = locStoObj;
    // console.log(this.#workouts);

    this.#workouts.forEach(curr => {
      this._renderWorkout(curr);
      // this._renderWorkoutMarker(curr); // wont work like this
    });
  }

  reset() {
    localStorage.removeItem("workouts");
    location.reload();
  }
}

let app = new App();

app.reset();

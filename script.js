'use strict';

// prettier-ignore
let map, mapEvent;

class Workout {
    date = new Date();
    id = (Date.now() + ' ').slice(-10)

    constructor(coords, distance, duration) {
        this.coords = coords; //[lat, lng]
        this.distance = distance; //[in kms]
        this.duration = duration; // [in minutes]
    }
}

class Running extends Workout {
    type = 'running'
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration)
        this.cadence = cadence;
        this.calcPace()

    }

    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    type = 'cycling'
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration)
        this.elevationGain = elevationGain;

    }

    calcSpeed() {
        this.speed = this.distance / this.duration;
        return this.speed;
    }
}



///////////////////////////////
//APPLICATION ARCHITECTURE
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
    #map;
    #mapEvent;
    #workouts = [];

    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this));

        inputType.addEventListener('change', this._toggleElevation)

            ;



    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                alert('Location could not be found motherfucker')
            }
            );
        }
    }

    _loadMap(position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        const coords = [latitude, longitude];

        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
        console.log(this);
        console.log(this.#mapEvent)
        this.#map = L.map('map').setView(coords, 13);
        // console.log(map);

        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);


        //Handling clicks on map
        this.#map.on('click', this._showForm.bind(this))


    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus()

    }

    _toggleElevation() {
        inputElevation.closest('.form__row')
            .classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row')
            .classList.toggle('form__row--hidden');
    }


    _newWorkout(e) {
        const validInputs = (...inputs) =>
            inputs.every(inp => Number.isFinite(inp));

        const allPositive = (...inputs) =>
            inputs.every(inp => inp > 0);

        e.preventDefault();


        //Get Data from userinput
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;
        let workout;



        console.log(type, distance, duration);


        //If workout running, create running object
        if (type === 'running') {
            //Check if the data is valid
            const cadence = +inputCadence.value;
            if (

                !validInputs(distance, duration, cadence) ||
                !allPositive(distance, duration, cadence)
            )
                return alert('The inputs have to be a positive number')

            workout = new Running([lat, lng], distance, duration, cadence)

        }


        //If workout cycling, create cycling object
        if (type === 'cycling') {
            const elevation = +inputElevation.value;

            if (
                !validInputs(distance, duration, elevation) ||
                !allPositive(distance, duration)
            )
                return alert('The inputs have to be a positive number')
            workout = new Cycling([lat, lng], distance, duration, elevation)


        }


        //Add new object to the array
        this.#workouts.push(workout);
        console.log(workout);




        //Render workout on map as a marker
        this.renderWorkoutMethod(workout)


        //Render workout on list



        //Hide form + clear input fields

        //Clear input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ' '
    }

    //Display Marker
    // console.log(this.#mapEvent);

    renderWorkoutMethod(workout) {
        L.marker(workout.coords).
            addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`,
                })
            ).setPopupContent('workout')
            .openPopup();

    }

}



const app = new App();




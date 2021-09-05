import SimplexNoise from 'simplex-noise';

const simplex = new SimplexNoise();

// TODO try out 3D and 4D noise funcs

document
    .querySelector('#x-range')
    .addEventListener('change', (event) => {
        let input = event.target as any;
        console.log('new xrange value: ' + input.value);
    });

let xNoiseSlider = document.querySelector('#x-noise') as any;
let t = 0;
let tDelta = 0.001;
setInterval(() => {
    xNoiseSlider.value = simplex.noise2D(t += tDelta, 0);
}, 1000 / 60); // 60 frames per second
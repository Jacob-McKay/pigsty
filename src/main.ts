import SimplexNoise from 'simplex-noise';
import Snap from 'snapsvg';
import * as srandom from 'seedrandom';

var rng = srandom('turdly_turden');

var svgElement = document.querySelector('#path-render-area') as any;
var horiztonalGridTicks = 8;
var verticalGridTicks = 18;
var width = svgElement.viewBox.baseVal.width;
var height = svgElement.viewBox.baseVal.height;

let svg = Snap(svgElement);

let runningInterval: NodeJS.Timer;

function restart() {
    runningInterval = letErRip(runningInterval);
}

restart();

document
    .querySelectorAll('#noise-seed, #speed, #resolution')
    .forEach(uiControl => uiControl.addEventListener('change', restart));

function letErRip(alreadyRunningInterval?: NodeJS.Timer) {
    if (alreadyRunningInterval) {
        clearInterval(alreadyRunningInterval);
    }
    svg.clear();
    drawGridlines();

    let obstacleLibrary = document.querySelector('obstacle-library');
    let obstacles = obstacleLibrary.getObstacles();

    let noiseSeedSlider = document.querySelector('#noise-seed') as any;
    let xNoiseSlider = document.querySelector('#x-noise') as any;
    let yNoiseSlider = document.querySelector('#y-noise') as any;

    let t = 0;
    let tx = t + parseInt(noiseSeedSlider.value);
    let ty = t - parseInt(noiseSeedSlider.value);

    let speedSlider = document.querySelector('#speed') as any;
    let framesPerSecond = speedSlider.value;
    let intervalBetweenFrames = 1000 / framesPerSecond;

    let walkerDots = [] as Snap.Element[];
    let maxWalkerDots = framesPerSecond * 10;
    let walkerDotsIndex = 0;

    const simplex = new SimplexNoise(noiseSeedSlider);

    let resolutionSlider = document.querySelector('#resolution') as any;
    let tDelta = parseFloat(resolutionSlider.value);

    return setInterval(() => {
        let xNoiseLatest = simplex.noise2D(tx += tDelta, 0);
        let yNoiseLatest = simplex.noise2D(0, ty += tDelta);

        xNoiseSlider.value = xNoiseLatest;
        yNoiseSlider.value = yNoiseLatest;

        let walkerDotX = remapRange(xNoiseLatest, -1, 1, 0, width);
        let walkerDotY = remapRange(yNoiseLatest, -1, 1, 0, height);

        let pathCellIndexX = Math.floor(remapRange(xNoiseLatest, -1, 1, 0, 17));
        let pathCellIndexY = Math.floor(remapRange(yNoiseLatest, -1, 1, 0, 7));
        let openObstaclesAtPath = obstacles[90][pathCellIndexX][pathCellIndexY];

        if (openObstaclesAtPath.length > 0) {
            let obstacleIndex = Math.round(remapRange(rng.quick(), 0, 1, 0, openObstaclesAtPath.length -1 ));
            obstacleLibrary.highlightObstacle(openObstaclesAtPath[obstacleIndex].name);
        }

        walkerDotsIndex = walkerDotsIndex % maxWalkerDots;
        let alreadyDrawnWalkerDot = walkerDots[walkerDotsIndex];

        if (alreadyDrawnWalkerDot) {
            alreadyDrawnWalkerDot.remove();
        }

        var walkerDot = svg
            .circle(walkerDotX, walkerDotY, 2.5)
            .attr({
                'stroke': 'red',
                'stroke-width': '1',
                'fill': 'none'
            });

        walkerDots[walkerDotsIndex] = walkerDot;

        walkerDotsIndex++;
    }, intervalBetweenFrames);
}

const remapRange = (value: number, x1: number, y1: number, x2: number, y2: number) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;


function drawGridlines() {
    let border = svg
        .polyline([
            0, 0,
            0, height,
            width, height,
            width, 0,
            0, 0])
        .attr({
            'stroke': 'black',
            'stroke-width': '1',
            'fill': 'none'
        });


    for (var x = 0; x < horiztonalGridTicks; x++) {
        var verticalOffset = (height / horiztonalGridTicks) * x;
        let horizontalGridline = svg
            .line(0, verticalOffset, width, verticalOffset)
            .attr({
                'stroke': 'green',
                'stroke-width': '1'
            });
    }

    for (var y = 0; y < verticalGridTicks; y++) {
        var horizontalOffset = (width / verticalGridTicks) * y;
        let verticalGridline = svg
            .line(horizontalOffset, 0, horizontalOffset, height)
            .attr({
                'stroke': 'green',
                'stroke-width': '1'
            });
    }
}

export type Cells = boolean[][];
export type SerializedCells = number[][];
export type Obstacle = { name: string, cells: Cells };
export type ObstacleIndexByDifficultyThenPos = Record<number, Array<Array<Array<string>>>>;
export type IndexedObstacles = {
    obstacles: { [name: string]: SerializedCells }
    index: ObstacleIndexByDifficultyThenPos
};

export const initIndexedObstacles = (obstacles: Obstacle[]): IndexedObstacles => {

    let indexedObstacles = {
        obstacles: {},
        index: {} as ObstacleIndexByDifficultyThenPos
    } as IndexedObstacles;

    obstacles.forEach(obstacle =>
        indexedObstacles.obstacles[obstacle.name] = obstacle.cells
            .map(col => col.map(row => row ? 1 : 0)));

    // for (let obsI = 0; obsI < obstacles.length; obsI++) {
    //     let obstacle = obstacles[obsI];
    //     indexedObstacles.obstacles[obstacle.name] = obstacle.cells
    //         .map(col => col.map(row => row ? 1 : 0));

    // for (let colI = 0; colI < obstacles[obsI].cells.length; colI++) {
    //     indexedObstacles.obstacles[obstacle.name].push([]);
    //     for (let rowI = 0; rowI < obstacles[obsI].cells[colI].length; rowI++) {
    //         let serializedRowOfCells = obstacles[obsI].cells[colI].map(cell => cell ? 1 : 0);
    //         indexedObstacles.obstacles[obstacles[obsI].name][colI] = serializedRowOfCells;
    //     }
    // }
    // }

    let obstaclesSortedByDifficulty = getSortedObstaclesByDifficulty(obstacles);

    let numColumns = obstacles[0].cells.length;
    let numRows = obstacles[0].cells[0].length;

    for (let difficultyIncrement = 10; difficultyIncrement < 100; difficultyIncrement += 10) {
        let obstaclesWithinDifficulty =
            obstaclesSortedByDifficulty
                .filter(obstacle => {
                    return obstacle.difficulty <= difficultyIncrement;
                }).map(obstacleDifficulty => obstacleDifficulty.osbtacle);

        indexedObstacles.index[difficultyIncrement] = [] as Array<Array<Array<string>>>;

        for (let col = 0; col < numColumns; col++) {
            indexedObstacles.index[difficultyIncrement][col] = [];
            for (let row = 0; row < numRows; row++) {
                indexedObstacles.index[difficultyIncrement][col][row] = [];
                obstaclesWithinDifficulty.forEach(obstacle => {
                    if (!obstacle.cells[col][row]) {
                        indexedObstacles.index[difficultyIncrement][col][row].push(obstacle.name);
                    }
                });
            }
        }
    }

    return indexedObstacles;
}

export const getSortedObstaclesByDifficulty = (obstacles: Obstacle[]): Array<{ difficulty: number, osbtacle: Obstacle }> => {
    let obstacleDifficulties = [] as Array<{ difficulty: number, osbtacle: Obstacle }>;

    obstacles.forEach(obstacle => {
        let trueCells = 0;
        let totalCells = 0;

        for (let col = 0; col < obstacle.cells.length; col++) {
            for (let row = 0; row < obstacle.cells[col].length; row++) {
                totalCells++;
                if (obstacle.cells[col][row]) {
                    trueCells++;
                }
            }
        }
        let obstacleDifficulty = (trueCells / totalCells) * 100;
        obstacleDifficulties.push({ difficulty: obstacleDifficulty, osbtacle: obstacle });
    });

    obstacleDifficulties.sort((a, b) => {
        return a.difficulty - b.difficulty;
    });

    return obstacleDifficulties;
}

export const iterateCells = (cells: Cells) => {
    // TODO?  make an iterator in JS?  might be nice, callback with col and row index
}
export type Cells = boolean[][];
export type Obstacle = { name: string, cells: Cells };
export type IndexedObstacles = Record<number, Array<Array<Array<Obstacle>>>>;

export const initIndexedObstacles = (obstacles: Obstacle[]) => {
    let indexedObstacles = {} as IndexedObstacles;
    let obstaclesSortedByDifficulty = getSortedObstaclesByDifficulty(obstacles);

    let numColumns = obstacles[0].cells.length;
    let numRows = obstacles[0].cells[0].length;

    for (let difficultyIncrement = 10; difficultyIncrement < 100; difficultyIncrement += 10) {
        let obstaclesWithinDifficulty =
            obstaclesSortedByDifficulty
                .filter(obstacle => {
                    return obstacle.difficulty <= difficultyIncrement;
                }).map(obstacleDifficulty => obstacleDifficulty.osbtacle);

        indexedObstacles[difficultyIncrement] = [] as Array<Array<Array<Obstacle>>>;

        for (let col = 0; col < numColumns; col++) {
            indexedObstacles[difficultyIncrement][col] = [];
            for (let row = 0; row < numRows; row++) {
                indexedObstacles[difficultyIncrement][col][row] = [];
                obstaclesWithinDifficulty.forEach(obstacle => {
                    if (!obstacle.cells[col][row]) {
                        indexedObstacles[difficultyIncrement][col][row].push(obstacle);
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
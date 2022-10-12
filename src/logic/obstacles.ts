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

    let obstaclesSortedByDifficulty = getSortedObstaclesByDifficulty(obstacles);

    let numColumns = obstacles[0].cells.length;
    let numRows = obstacles[0].cells[0].length;

    let difficultyIncrement = 10;
    for (let difficultyBucketFloor = 0; difficultyBucketFloor <= 40; difficultyBucketFloor += difficultyIncrement) {
        let obstaclesWithinDifficulty =
            obstaclesSortedByDifficulty
                .filter(obstacle => {
                    return obstacle.difficulty >= difficultyBucketFloor
                        && obstacle.difficulty < difficultyBucketFloor + difficultyIncrement;
                }).map(obstacleDifficulty => obstacleDifficulty.osbtacle);

        obstaclesWithinDifficulty.forEach(obstacle => console.log(`Obstacle ${obstacle.name} is within difficulty bucket ${difficultyBucketFloor}-${difficultyBucketFloor + difficultyIncrement}`));

        indexedObstacles.index[difficultyBucketFloor] = [] as Array<Array<Array<string>>>;

        for (let col = 0; col < numColumns; col++) {
            indexedObstacles.index[difficultyBucketFloor][col] = [];
            for (let row = 0; row < numRows; row++) {
                indexedObstacles.index[difficultyBucketFloor][col][row] = [];
                obstaclesWithinDifficulty.forEach(obstacle => {
                    if (!obstacle.cells[col][row]) {
                        indexedObstacles.index[difficultyBucketFloor][col][row].push(obstacle.name);
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
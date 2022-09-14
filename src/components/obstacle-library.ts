import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { initIndexedObstacles, Obstacle } from '../logic/obstacles';

@customElement('obstacle-library')
export class ObstacleLibrary extends LitElement {
    static get styles() {
        return css`
            .library {
                display: flex;
                flex-flow: row wrap;
                place-content: center;
                align-items: center;
            }

            .svg-grid-ctn {
                width: 400px;
                padding: 10px 10px 20px;
                text-align: center;
            }

            .buttons {
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
            }

            .buttons sl-button {
                padding: 10px;
            }

            .highlight {
                background-color: yellow;
            }
        `;
    }

    private _library: Record<string, boolean[][]>;

    @property({ type: String })
    public storeName: string;

    @property({ type: Boolean })
    public autoRestore: boolean;

    constructor() {
        super();
        this.storeName = 'ObstacleLibrary';
        this.autoRestore = true;
        this._library = {
            'meng': this._initEmptyCellsForGrid()
        }
    }

    private _renderObstacles() {
        if (!this._library || Object.keys(this._library).length === 0) {
            return html`<p>nuthin here yet</p>`;
        } else {
            let obstacles = Object.keys(this._library).map(obstacleName => {
                let cells = this._library[obstacleName];
                let filledCells = cells.reduce((runningFilledCount, currentColumn) => {
                    return runningFilledCount + currentColumn.filter(cellFilled => cellFilled).length;
                }, 0);

                return { name: obstacleName, cells, difficulty: filledCells / cells.length };
            });

            obstacles.sort((a, b) => {
                return a.difficulty - b.difficulty;
            });

            return obstacles.map((obstacle, index) => {
                return html`<div class="svg-grid-ctn">
                                <svg-grid 
                                    name="${obstacle.name}" 
                                    .cells="${obstacle.cells}" 
                                    ?clickable="${true}"
                                    @cells-updated=${this._updateCells}></svg-grid>
                                    <div class="obstacle-title">${index}: ${obstacle.name}</div>
                            </div>`
            });
        }
    }

    override render() {
        return html`
            <div class="buttons">
                <sl-button @click=${this._addObstacle}>Add Obstacle</sl-button>
                <sl-button @click=${this._saveObstacles}>Save Obstacles</sl-button>
                <sl-button @click=${this._restoreObstacles}>Restore Obstacles</sl-button>
                <sl-button @click=${this._checkObstacles}>Check Obstacles</sl-button>
                <sl-button @click=${this._indexObstacles}>Index Obstacles</sl-button>
                <sl-button @click=${this._exportObstacles}>Export Obstacles</sl-button>
            </div>
            <div class="library">
                ${this._renderObstacles()}
            </div>
        `;
    }

    override firstUpdated(changes: any) {
        if (this.autoRestore) {
            this._restoreObstacles();
        }
    }

    private _updateCells(cellsUpdatedEvent: CustomEvent) {
        this._library[(cellsUpdatedEvent.target as any).name] = cellsUpdatedEvent.detail.cells;
    }

    private _addObstacle() {
        this._library[new Date().getTime().toString()] = this._initEmptyCellsForGrid();
        this.requestUpdate();
    }

    private _saveObstacles() {
        let newLibrary = {} as Record<string, boolean[][]>;;
        this.shadowRoot.querySelectorAll('svg-grid').forEach(grid => {
            newLibrary[grid.name] = grid.cells;
        });

        this._library = newLibrary;
        localStorage.setItem(this.storeName, JSON.stringify(this._library));
    }

    private _restoreObstacles() {
        let savedLibrary = localStorage.getItem(this.storeName);
        if (!savedLibrary) {
            return;
        }
        this._library = JSON.parse(savedLibrary);
        this.requestUpdate();
    }

    private _checkObstacles() {
        if (Object.keys(this._library).length === 0) {
            alert('All Clear!');
            return;
        }
        let obstacleNames = Object.keys(this._library);

        let columns = this._library[obstacleNames[0]].length;
        let rows = this._library[obstacleNames[0]][0].length;

        for (let col = 0; col < columns; col++) {
            for (let row = 0; row < rows; row++) {

                let obstaclesOpenAtPath = obstacleNames.filter(obstacleName => {
                    return this._library[obstacleName][col][row] === false;
                });

                let obstaclesClosedAtPath = obstacleNames.filter(obstacleName => {
                    return this._library[obstacleName][col][row] === true;
                });

                let totalNumberOfObstacles = obstacleNames.length;
                if (obstaclesClosedAtPath.length === totalNumberOfObstacles) {
                    console.warn(`No obstacle allowing flight thru path [col:${col}][row:${row}]`);
                }

                if (obstaclesOpenAtPath.length === totalNumberOfObstacles) {
                    console.warn(`All obstacles allow flight thru path [col:${col}][row:${row}]`);
                }
            }
        }

        alert('All Checks completed, check console for issues');
    }

    private _indexObstacles() {
        let obstacles = [] as Obstacle[];
        Object.keys(this._library).forEach(obstacleName => {
            obstacles.push({ name: obstacleName, cells: this._library[obstacleName] });
        });
        let indexedObstacles = initIndexedObstacles(obstacles);

        return indexedObstacles;
    }

    private _exportObstacles() {
        let myModalEl = document.querySelector('#exportObstacleJsonModal');
        let modal = (window as any)
            .bootstrap.Modal.getOrCreateInstance(myModalEl) // Returns a Bootstrap modal instance
        modal.show();

        let indexedObstacles = this._indexObstacles();
        let outputTextArea =  document.querySelector('#exportObstacleJson') as HTMLTextAreaElement
        outputTextArea.value = JSON.stringify(indexedObstacles);
    }

    public getObstacles() {
        return this._indexObstacles();
    }

    public highlightObstacle(obstacleName: string) {
        let obstacleToHighlight = this.shadowRoot.querySelector(`svg-grid[name="${obstacleName}"]`);
        if (obstacleToHighlight) {
            obstacleToHighlight = obstacleToHighlight.parentElement;
            obstacleToHighlight.classList.add('highlight');
        }

        let otherHighlightedObstacles = [...this.shadowRoot
            .querySelectorAll('.svg-grid-ctn.highlight')]
            .filter(highlightedObstacle => highlightedObstacle != obstacleToHighlight);

        otherHighlightedObstacles.forEach(highlightedObstacle => highlightedObstacle.classList.remove('highlight'));
    }

    private _initEmptyCellsForGrid() {
        let columns = [];
        for (let col = 0; col < 18; col++) {
            let column = [] as boolean[];
            for (let row = 0; row < 8; row++) {
                column[row] = false;
            }
            columns.push(column);
        }

        return columns;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'obstacle-library': ObstacleLibrary;
    }
}
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

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
                padding: 10px;
            }

            .buttons {
                display: flex;
                justify-content: center;
            }

            .buttons sl-button {
                padding: 10px;
            }
        `;
    }
    private _library: Record<string, boolean[][]>;

    @property({ type: String })
    public storeName: string;

    constructor() {
        super();
        this.storeName = 'ObstacleLibrary';
        this._library = {
            'meng': []
        }
    }

    private _renderObstacles() {
        if (!this._library || Object.keys(this._library).length === 0) {
            return html`<p>nuthin here yet</p>`;
        } else {
            let obstacles = Object.keys(this._library).map(obstacleName => {
                return { name: obstacleName, cells: this._library[obstacleName] };
            });
            return obstacles.map(obstacle => {
                return html`<div class="svg-grid-ctn">
                                <svg-grid name="${obstacle.name}" .cells="${obstacle.cells}" ?clickable="${true}"></svg-grid>
                            </div>`
            });
        }
    }

    override render() {
        return html`
            <div class="buttons">
                <sl-button type="primary" @click=${this._addObstacle}>Add Obstacle</sl-button>
                <sl-button type="primary" @click=${this._saveObstacles}>Save Obstacles</sl-button>
                <sl-button type="primary" @click=${this._restoreObstacles}>Restore Obstacles</sl-button>
            </div>
            <div class="library">
                ${this._renderObstacles()}
            </div>
        `;
    }

    override firstUpdated(changes: any) {
        console.log('changes?', changes);
    }

    private _addObstacle(e: MouseEvent) {
        this._library[new Date().getTime().toString()] = [];
        this.requestUpdate();
    }

    private _saveObstacles(e: MouseEvent) {
        localStorage.setItem(this.storeName, JSON.stringify(this._library));
    }

    private _restoreObstacles(e: MouseEvent) {
        let savedLibrary = localStorage.getItem(this.storeName);
        this._library = JSON.parse(savedLibrary);
        this.requestUpdate();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'obstacle-library': ObstacleLibrary;
    }
}
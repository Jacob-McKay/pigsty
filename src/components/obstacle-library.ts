import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

interface IObstacle {
    name: string
    cells: boolean[][];
}

@customElement('obstacle-library')
export class ObstacleLibrary extends LitElement {
    static get styles() {
        return css`
            div { color: red; }
            button {
                font-size: 100px;
            }
        `;
    }

    private _library: IObstacle[];

    @property({ type: String })
    public storeName: string;

    override createRenderRoot() {
        return this;
    }

    constructor() {
        super();
        this.storeName = 'ObstacleLibrary';
        this._library = [{ name: 'meng', cells: [] }];
    }

    private _renderObstacles() {
        if (!this._library || Object.keys(this._library).length === 0) {
            return html`<p>nuthin here yet</p>`;
        } else {
            return this._library.map(obstacle => {
                return html`<div class="svg-grid-ctn">
                                <svg-grid name="${obstacle.name}" .cells="${[]}" ?clickable="${true}"></svg-grid>
                            </div>`
            });
        }
    }

    override render() {
        return html`
            <div class="library">
                ${this._renderObstacles()}
            </div>
            <div class="text-center">
                <button type="button" class="btn btn-dark"
                @click=${this._addObstacle}>Add Obstacle</button>
                <button type="button" class="btn btn-dark"
                @click=${this._saveObstacles}>Save Obstacles</button>
            </div>
        `;
    }

    override firstUpdated(changes: any) {
        console.log('changes?', changes);
    }

    private _addObstacle(e: MouseEvent) {

    }

    private _saveObstacles(e: MouseEvent) {

    }
}

declare global {
    interface HTMLElementTagNameMap {
        'obstacle-library': ObstacleLibrary;
    }
}
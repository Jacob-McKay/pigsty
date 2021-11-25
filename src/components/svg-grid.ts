import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import Snap from 'snapsvg';

@customElement('svg-grid')
export class SvgGrid extends LitElement {
    //     static override styles = css`
    //         :host {
    //             display: block;
    //             border: solid 1px gray;
    //             padding: 16px;
    //             max-width: 800px;
    //         }
    //   `;

    private _togglingCells = false;

    static get properties() {
        return { cells: { type: Object } };
    }

    @property({ type: String })
    public name: string;

    @property({ type: Boolean })
    public clickable = false;

    @property({ type: Number })
    public xTicks = 16;

    @property({ type: Number })
    public yTicks = 8;

    set cells(val: boolean[][]) {
        let oldVal = this._cells;
        this._cells = val
        this.requestUpdate('cells', oldVal);
    }

    get cells() { return this._cells; }

    private _cells: boolean[][];
    private _svgCells: Snap.Element[][];
    private _snapSvgElement: Snap.Paper;

    private get _svgWidth() {
        let ratio = 1;
        if (this.xTicks >= this.yTicks) {
            ratio = this.xTicks / this.yTicks;
        }

        return 100 * ratio;
    }

    private get _svgHeight() {
        let ratio = 1;
        if (this.yTicks >= this.xTicks) {
            ratio = this.yTicks / this.xTicks;
        }

        return 100 * ratio;
    }

    constructor() {
        super();
        this.xTicks = 16
        this.yTicks = 8;
    }

    override render() {
        return html`
            <svg @mouseup=${this._onMouseUp}
                 viewBox="0 0 ${this._svgWidth} ${this._svgHeight}">
            </svg>
        `;
    }

    override firstUpdated(changes: Map<string, any>) {
        let svg = this.shadowRoot.children[0] as SVGElement;
        this._snapSvgElement = Snap(svg);

        let cellsKnown = changes.has('cells');
        this._drawGridlines(cellsKnown);

        if (cellsKnown) {
            this._initCells();
        }
    }

    override updated(changes: Map<string, any>) {
        if (changes.has('cells')) {
            this._initCells();
        }
    }

    private _initCells() {
        for (let col = 0; col < this.xTicks; col++) {
            for (let row = 0; row < this.yTicks; row++) {

                let cell = this._svgCells[col][row];
                cell.attr({
                    fillOpacity: this._cells[col][row] ? 1 : 0
                });
            }
        }
    }

    private _onMouseUp(e: MouseEvent) {
        this._togglingCells = false;
    }

    private _onCellMouseDown(cell: Snap.Element, columnIndex: number, rowIndex: number) {
        this._togglingCells = true;
        this._toggleCell(cell, columnIndex, rowIndex);
    }

    private _onCellMouseOver(cell: Snap.Element, columnIndex: number, rowIndex: number) {
        this._toggleCell(cell, columnIndex, rowIndex);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        //TODO unregister event listeners on SVG Elements?
    }

    private _toggleCell(cell: Snap.Element, columnIndex: number, rowIndex: number) {
        if (!this._togglingCells) {
            return;
        }
        let toggled = this._cells[columnIndex][rowIndex];
        toggled = !toggled;
        this._cells[columnIndex][rowIndex] = toggled;

        cell.attr({
            fillOpacity: toggled ? 1 : 0
        });

        let event = new CustomEvent('cells-updated', {
            detail: {
                cells: this._cells
            }
        });
        this.dispatchEvent(event);
    }

    private _drawGridlines(cellsKnown: boolean) {
        let border = this._snapSvgElement
            .polyline([
                0, 0,
                0, this._svgHeight,
                this._svgWidth, this._svgHeight,
                this._svgWidth, 0,
                0, 0])
            .attr({
                'stroke': 'black',
                'stroke-width': '1',
                'fill': 'none',
                'name': 'border'
            });
        let cellWidth = this._svgWidth / this.xTicks;
        let cellHeight = this._svgHeight / this.yTicks;

        for (let y = 0; y < this.yTicks; y++) {
            let verticalOffset = cellHeight * y;
            let horizontalGridline = this._snapSvgElement
                .line(0, verticalOffset, this._svgWidth, verticalOffset)
                .attr({
                    'stroke': 'green',
                    'stroke-width': '1'
                });
        }

        for (let x = 0; x < this.xTicks; x++) {
            let horizontalOffset = cellWidth * x;
            let verticalGridline = this._snapSvgElement
                .line(horizontalOffset, 0, horizontalOffset, this._svgHeight)
                .attr({
                    'stroke': 'green',
                    'stroke-width': '1'
                });
        }

        // TODO maybe one day give a shit about someone changing the grid dimensions after the fact

        if (!cellsKnown) {
            this._cells = [];
        }
        this._svgCells = [];
        for (let col = 0; col < this.xTicks; col++) {
            if (!cellsKnown) {
                this._cells.push([]);
            }

            this._svgCells.push([]);
            let column = this._snapSvgElement.group();

            for (let row = 0; row < this.yTicks; row++) {
                if (!cellsKnown) {
                    this._cells[col][row] = false;
                }

                let cell = column
                    .rect(col * cellWidth, row * cellHeight, cellWidth, cellHeight, 2, 2)
                    .attr({
                        fill: 'green',
                        fillOpacity: '0'
                    });
                this._svgCells[col][row] = cell;

                if (this.clickable) {
                    cell.mousedown(() => {
                        this._onCellMouseDown(cell, col, row);
                    });

                    cell.mouseover(() => {
                        this._onCellMouseOver(cell, col, row);
                    });
                }
            }
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'svg-grid': SvgGrid;
    }
}
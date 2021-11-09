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

    @property({ type: Boolean })
    public clickable = false;

    @property({ type: Number })
    public xTicks = 16;

    @property({ type: Number })
    public yTicks = 8;

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

    override updated(changes: any) {
        let svg = this.shadowRoot.children[0] as SVGElement;
        this._snapSvgElement = Snap(svg);
        this._drawGridlines();
    }

    private _onMouseUp(e: MouseEvent) {
        this._togglingCells = false;
    }

    private _onCellMouseDown(cell: Snap.Element) {
        console.log('on mouse down this?', this);
        this._togglingCells = true;
        this._toggleCell(cell);
    }

    private _onCellMouseOver(cell: Snap.Element) {
        this._toggleCell(cell);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        //TODO unregister event listeners on SVG Elements?
    }

    private _toggleCell(cell: Snap.Element) {
        if (!this._togglingCells) {
            return;
        }

        let cellToggled = cell.data('toggled');

        cellToggled = !cellToggled;
        cell.attr({
            fillOpacity: cellToggled ? 1 : 0
        })
            .data('toggled', cellToggled);
    }

    private _drawGridlines() {
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
                'fill': 'none'
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

        if (!this.clickable) {
            return;
        }

        for (let col = 0; col < this.xTicks; col++) {
            let column = this._snapSvgElement.group();

            for (let row = 0; row < this.yTicks; row++) {
                let cell = column
                    .rect(col * cellWidth, row * cellHeight, cellWidth, cellHeight, 2, 2)
                    .attr({
                        fill: 'green',
                        fillOpacity: '0'
                    })
                    .data('toggled', false);

                cell.mousedown((e: MouseEvent) => {
                    this._onCellMouseDown(cell);
                });

                cell.mouseover((e: MouseEvent) => {
                    this._onCellMouseOver(cell);
                });
            }
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'svg-grid': SvgGrid;
    }
}
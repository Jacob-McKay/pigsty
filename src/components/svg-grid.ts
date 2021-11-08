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

    @property({ type: Number })
    public xTicks = 16;

    @property({ type: Number })
    public yTicks = 8;

    constructor() {
        super();
        this.xTicks = 16
        this.yTicks = 8;
    }

    override render() {
        return html`
            <div @click=${this._onClick} >[${this.xTicks}, ${this.yTicks}]</div>
        `;
    }

    private _onClick() {
        console.log('you clicked!');
        this.dispatchEvent(new CustomEvent('svg-grid-event'));
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'svg-grid': SvgGrid;
    }
}
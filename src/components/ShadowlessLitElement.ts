import { LitElement } from 'lit';

// If I extend this, I can't use styles :(
export class ShadowlessLitElement extends LitElement {
    override createRenderRoot() {
        return this;
    }
}
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { ImageResource } from './models';

@customElement('store-window')
export class StoreWindow extends LitElement {
  static styles = css`
    .store-container {
      position: absolute;
      width: 70%;
      height: 330px;
      left: 15%;
      top: 50px;
      transform: scale(0);
      opacity: 0;
      transition: 200ms all ease-in-out;
    }

    .store-container.open {
      transform: scale(1);
      opacity: 1;
    }

    .store-img {
      width: 100%;
      height: 100%;
      border-radius: 2px;
    }

    .close {
      position: absolute;
      width: 8px;
      height: 8px;
      top: 0;
      right: 3px;
      cursor: pointer;
    }

    .close:focus-visible {
      outline: 2px solid #000;
    }

    .app-header {
      background-color: #FFF;
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      top: 19px;
      left: 59px;
      height: 100px;
      width: 85px;
      text-align: center;
      justify-content: flex-end;
      font-size: 12px;
      font-weight: 600;
    }

    .app-header img {
      width: 50px;
      height: 50px;
    }

    .app-header p {
      margin: 10px 0 0;
    }

    .description-preview {
      margin: 0;
      background-color: #FFF;
      position: absolute;
      bottom: 62px;
      font-size: 7px;
      left: 49px;
      width: 100px;
      min-height: 26px;
      max-height: 50px;
      text-align: center;
      overflow: hidden;
    }

    .description-block {
      background-color: #FFF;
      position: absolute;
      bottom: 90px;
      right: 12px;
      width: 291px;
      height: 66px;
      font-size: 7px;
      overflow: hidden;
    }

    .screenshots {
      position: absolute;
      background-color: #FFF;
      overflow: hidden;
      height: 102px;
      top: 39px;
      right: 3px;
      display: flex;
      width: 299px;
    }

    .screenshots img {
      height: 100%;
      margin-right: 3px;
    }

    .categories {
      flex-wrap: wrap;
      background-color: #FFF;
      position: absolute;
      display: flex;
      bottom: 5px;
      left: 33px;
      width: 124px;
      height: 50px;
    }

    .categories div {
      margin-right: 3px;
      border-radius: 17px;
      height: fit-content;
      padding: 1px 5px;
      font-size: 7px;
      min-width: 15px;
      text-align: center;
      border: solid 0.5px #CECECE;
      overflow: hidden;
    }

    .hidden-rating {
      right: 155px;
      background-color: #FFF;
      height: 20px;
      position: absolute;
      bottom: 0px;
      width: 147px;
    }
  `;

  /**
   * If true, the store window is open.
   */
  @property({ type: Boolean }) isWindowOpen = false;

  /**
   * Callback fired when closing the window.
   */
  @property() onClose = () => {};

  /**
   * The application icon's URL.
   */
  @property() iconUrl?: string;

  /**
   * The application's name (the short name is used as a fallback).
   */
  @property() appName?: string;

  /**
   * The description attribute on the manifest.
   */
  @property() description?: string;

  /**
   * The site's URL.
   */
  @property() siteUrl = '';

  /**
   * The screenshots attribute on the manifest.
   */
  @property({ type: Array }) screenshots?: ImageResource[];

  /**
   * The categories attribute on the manifest.
   */
  @property({ type: Array }) categories?: string[];

  /**
   * @param src - The src property of the screenshot
   * @returns The icon URL for the respective screenshot
   */
  private getImageUrl(src: string) {
    // Use first icon by default
    const absoluteUrl = new URL(src, this.siteUrl).href;
    return `https://pwabuilder-safe-url.azurewebsites.net/api/getsafeurl?url=${absoluteUrl}`;
  }

  render() {
    return html`
      <div 
      aria-hidden=${!this.isWindowOpen}
      class=${classMap({ 'store-container': true, open: this.isWindowOpen })}>
        <img class="store-img" alt="Microsoft store" src="../assets/images/msft-store.png" />
        <div 
        role="button" 
        aria-label="Close store window" 
        class="close" 
        tabindex="0"
        @click=${this.onClose}
        @keydown=${this.onClose}>
        </div>
        <div class="app-header">
          ${this.iconUrl ? html`<img alt="App icon" src=${this.iconUrl} />` : null}
          <p>${this.appName || 'PWA App'}</p>
        </div>
        <p class="description-preview">${this.description}</p>
        <div class="hidden-rating"></div>
        <div class="categories">
          ${this.categories?.map(categ => html`<div>${categ}</div>`)}
        </div>
        <div class="description-block">${this.description}</div>
        <div class="screenshots">
        ${this.screenshots?.slice(0, 2).map(shot => 
          html`<img alt="Preview" src=${this.getImageUrl(shot.src)} />`)}
        </div>
      </div>
    `;
  }
}

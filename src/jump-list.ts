import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import type { Shortcut, ImageResource } from './models';

@customElement('jump-list')
export class JumpList extends LitElement {
  static styles = css`
    :host {
      --windows-background: #D5DDF0;
    }

    .container {
      position: absolute;
      width: 129px;
      bottom: 22px;
      right: 213px;
      height: 100px;
      opacity: 0;
      transform: translateY(159px);
      transition: all 200ms ease-in-out;
    }

    .container.open {
      z-index: 1;
      opacity: 1;
      transform: translateY(0);
    }

    img.list {
      width: 100%;
      height: 100%;
      border-radius: 4px;
    }

    .shortcuts {
      position: absolute;
      background-color: var(--windows-background);
      width: 128px;
      height: 66px;
      bottom: 16px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .shortcut-item {
      font-size: 7px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      text-indent: 24px;
      margin-bottom: 5px;
    }

    .shortcut-item img {
      width: 10px;
      height: 10px;
      margin: 0 7px;
    }
  `;

  /**
   * If true, the jump list is open.
   */
  @property({ type: Boolean }) isListOpen = false;

  /**
   * The shortcuts attribute on the manifest.
   */
  @property({ type: Array }) shortcuts?: Shortcut[];

  /**
   * The PWA's URL.
   */
  @property() siteUrl = '';

  private getShortcutIcon = (icons: ImageResource[]) => {
    // Use first icon by default
    const iconUrl = icons[0].src;
    const absoluteUrl = new URL(iconUrl, this.siteUrl).href;
    return `https://pwabuilder-safe-url.azurewebsites.net/api/getsafeurl?url=${absoluteUrl}`;
  }

  render() {
    return html`
      <div 
      aria-hidden=${!this.isListOpen}
      class=${classMap({ container: true, open: this.isListOpen })}>
        <img alt="Window's jump list" src="../assets/images/jumplist.png" class="list" />
        <ul class="shortcuts">
          ${this.shortcuts?.map(shortie => 
            html`
              <li class="shortcut-item">
                ${shortie.icons ? 
                  html`<img alt=${shortie.name} src=${this.getShortcutIcon(shortie.icons)} />` : null}
                ${shortie.name}
              </li>
            `)}
        </ul>
      </div>
    `;
  }
}
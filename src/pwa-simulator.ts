import { LitElement, css, html } from 'lit';
import { customElement, state, property, query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import './app-window.js';
import './start-menu.js';
import './code-editor.js';
import './jump-list.js';
import './store-window.js';
import './explanation-text.js';
import MANIFEST_TEMPLATE from './manifest-template.js';
import { cleanUrl } from './utils/url';
import { 
  Manifest, 
  Explanations,
  CodeEditorEvents, 
  CodeEditorUpdateEvent 
} from './models';

@customElement('pwa-simulator')
export class PWASimulator extends LitElement {
  static styles = css`
    :host {
      font-family: var(--font-family, Arial);
      color: var(--font-color, #292C3A);
    }

    .background {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }

    .background::before {
      content: ' ';
      position: absolute;
      inset: 0;
      background: var(--background, linear-gradient(252.83deg, #5039A8 2.36%, #6AA2DB 99.69%));
      opacity: 0.3;
    }

    .content {
      display: flex;
      justify-content: center;
      padding-top: 12%;
    }

    .desktop-container {
      width: 700px;
      height: 466px;
      position: relative;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      margin: 0 30px 18px 0;
    }

    img.desktop {
      width: 100%;
      position: absolute;
      inset: 0;
    }

    .taskbar-icon {
      position: absolute;
      bottom: 1.5px;
      width: 15.5px;
      height: 15.5px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: background-color 300ms ease-in-out;
      border-radius: 2px;
    }

    .taskbar-icon.taskbar-app-icon {
      right: 240px;
    }

    .store-icon {
      right: 295px;
    }

    .taskbar-app-icon:hover {
      background-color: rgba(255, 255, 255, 0.8);
    }

    .taskbar-icon img {
      width: 80%;
    }

    .menu-toggler {
      cursor: pointer;
      position: absolute;
      left: 240px;
      bottom: 2px;
      right: 240.5px;
      width: 15px;
      height: 15px;
      border-radius: 2px;
    }

    .menu-toggler:hover, .store-icon:hover {
      background-image: radial-gradient(transparent, #FFF);
    }

    .invalid-message {
      color: #B90E0A;
      font-weight: 600;
      margin: 8px 0 0;
      font-size: 14px;
    }

    .site-input {
      font-family: var(--font-family, Arial);
      position: absolute;
      top: 300px;
      left: calc(50% - 190px);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .site-input label {
      font-weight: 600;
      font-size: 2rem;
      margin: 10px 0;
    }

    .site-input input {
      border: 3px solid var(--font-color, #292C3A);
      border-radius: 20px;
      width: 100%;
      height: 35px;
      text-align: center;
      padding: 5px;
      box-sizing: border-box;
      font-size: 1rem;
    }

    .site-input input:focus-visible {
      outline: none
    }

    .site-input button {
      border: none;
      border-radius: 20px;
      width: 100px;
      height: 35px;
      text-align: center;
      padding: 5px;
      box-sizing: border-box;
      font-size: 1rem;
      margin-top: 1rem;
      color: #FFF;
      background-color: var(--font-color, #292C3A);
      cursor: pointer;
      font-family: var(--font-family, Arial);
    }

    .editor-status {
      font-weight: 600;
      margin: -41px 0 10px;
      font-size: 1rem;
      background-color: #FFF;
      padding: 5px;
      border-radius: 5px;
      background-color: beige;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    }
  `;

  /**
   * The site's web manifest.
   */
  @property({ 
    type: Object,
    converter: value => {
      if (!value) {
        return undefined;
      }
      
      return JSON.parse(value);
    }
  }) 
  manifest?: Manifest;

  /**
   * The website's URL
   */
  @property() siteUrl = '';

  /**
   * If true, the code editor is hidden.
   */
  @property({ type: Boolean }) hideEditor = false;

  /**
   * The duration (in ms) of the explanation message display, after
   * which it fades out.
   */
  @property({ type: Number }) explanationDisplayTime = 5000;

  /**
   * Object containing the explanation messages
   */
  @property({ 
    type: Object,
    converter: value => {
      if (!value) {
        return undefined;
      }
      
      return JSON.parse(value);
    }
  }) 
  explanations = {} as Explanations;

  @state() private explanationMessage = '';

  @state() private isExplanationFadingIn = false;

  @state() private isExplanationFadingOut = false;

  /**
   * The URL used for icon previews, or undefined if the manifest specifies no icons.
   */
  @state() private iconUrl = '';

  /**
   * If true, the application's window is open.
   */
  @state() private isAppOpen = false;

   /**
   * If true, the start menu is open.
   */
  @state() private isMenuOpen = false;

  /**
   * If true, the jump list is open.
   */
  @state() private isJumplistOpen = false;

  /**
   * If true, the MSFT store window is open.
   */
  @state() private isStoreOpen = false;

  /**
   * Used for displaying API/syntax errors.
   */
  @state() private errorMessage = '';

  /**
   * Status of the changes previewed (used for screen readers).
   */
  @state() private editorStatus = '';

  /**
   * The input field to enter the PWA URL.
   */
  @query('#pwa-input') pwaInput!: HTMLInputElement;

  constructor() {
    super();

    // Update the manifest every time the code changes.
    this.addEventListener(CodeEditorEvents.update, event => {
      const e = event as CustomEvent<CodeEditorUpdateEvent>;
      const doc: any = e.detail.transaction.newDoc;
      try {
        // TODO: Sometimes the new doc is a TextNode and sometimes it is a TextLeaf.
        // There's probably a cleaner way to deal with this...
        let text: string[] = [];
        if (doc.children) {
          text = text.concat(...doc.children.map((child: any) => child.text));
        } else {
          text = doc.text;
        }
        this.manifest = JSON.parse(text.join(''));
        this.editorStatus = 'Changes applied';
        this.errorMessage = '';
      } catch (err) {
        // Ignore the syntax error but show error message
        this.errorMessage = 'Invalid JSON!';
        this.editorStatus = 'Changes could not be applied';
      }

      // setTimeout(() => { this.editorStatus = ''; }, 2000);
    });
  }

  firstUpdated() {
    // We have a URL, but no manifest
    if (this.siteUrl && !this.manifest) {
      this.manifest = MANIFEST_TEMPLATE;
    }

    // Set default values for the explanation messages
    this.explanations = {
      initial: this.explanations.initial || 'Do you see something familiar on the taskbar?',
      appWindow: this.explanations.appWindow || 'The background color, theme color and display attributes determine several UI aspects of your PWA, such as the titlebar.',
      startMenu: this.explanations.startMenu || "The application's name and icon are used in the start menu.",
      jumpList: this.explanations.jumpList || 'The actions listed on the shortcuts attribute define a context menu that is displayed when right-clicking on the taskbar icon.',
      store: this.explanations.store || "Screenshots, a complete description and categories will enhance your app's listing in the Microsoft Store."
    }
  }

  // Sets the icon URL and triggers the first message when the manifest is defined
  updated(changedProperties: Map<string, any>) {
    if (
      changedProperties.has('manifest') && 
      changedProperties.get('manifest') === undefined &&
      this.manifest
    ) {
      if (this.manifest.icons) {
        // Try to get the largest icon, or the first one by default
        let iconUrl = this.manifest.icons[0].src;
        for (const icon of this.manifest.icons) {
          if (icon.sizes?.includes('512x512')) {
            iconUrl = icon.src;
            break;
          }
        }
        // Make sure the site URL is correctly formatted
        this.siteUrl = cleanUrl(this.siteUrl);
        const absoluteUrl = new URL(iconUrl, this.siteUrl).href;
        this.iconUrl = `https://pwabuilder-safe-url.azurewebsites.net/api/getsafeurl?url=${absoluteUrl}`;
      }

      this.handleNewExplanation(this.explanations.initial);
    }
  }

  /**
   * To show the jump list when right-clicking, disable the default 
   * context menu.
   */
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('contextmenu', this.handleContextMenuDisable);
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('contextmenu', this.handleContextMenuDisable);
  }

  private handleContextMenuDisable = (event: Event) => { 
    event.preventDefault();
  }

  private handleSiteInputChange = (e: Event) => {
    this.siteUrl = (e.target as HTMLInputElement).value;
  }

  private handleSearchManifest = async (event: Event) => {
    event.preventDefault();

    try {
      const cleanedUrl = cleanUrl(this.siteUrl);
      this.siteUrl = cleanedUrl;

      // From the input site URL, find the manifest
      const data = await fetch(
        `https://pwabuilder-manifest-finder.azurewebsites.net/api/FindManifest?url=${cleanedUrl}
      `)
      .then(res => res.json());

      if (data.error) {
        this.errorMessage = data.error;
        this.pwaInput.focus();
      } else {
        this.errorMessage = '';
        this.manifest = data.manifestContents;
      }
    } catch (err: any) {
      const message = err.message || "We couldn't fetch your manifest...";
      this.errorMessage = message;
      this.pwaInput.focus();
    }
  }

  // For adding a smooth transition between explanations.
  private handleNewExplanation = (message: string) => {
    this.isExplanationFadingOut = true;
    setTimeout(() => {
      this.explanationMessage = message;
      this.isExplanationFadingOut = false;
      this.isExplanationFadingIn = true;

      setTimeout(() => {
        this.isExplanationFadingOut = true;
      }, this.explanationDisplayTime);
    }, 400);
  }

  private openAppWindow = () => { 
    this.handleNewExplanation(this.explanations.appWindow);
    this.isAppOpen = true; 
    this.closeJumplist();
    this.closeStartMenu();
  }
  private closeAppWindow = () => { this.isAppOpen = false; }

  private openStartMenu = () => { 
    this.handleNewExplanation(this.explanations.startMenu);
    this.isMenuOpen = true;
    this.closeJumplist();
  }
  private closeStartMenu = () => { this.isMenuOpen = false; }

  private openJumplist = () => { 
    this.handleNewExplanation(this.explanations.jumpList);
    this.isJumplistOpen = true; 
  }
  private closeJumplist = () => { this.isJumplistOpen = false; }

  private openStore = () => {
    this.handleNewExplanation(this.explanations.store);
    this.isStoreOpen = true;
    this.closeJumplist();
  }
  private closeStore = () => { this.isStoreOpen = false; }

  /**
   * Depending on the click, open the jump list or application when clicking
   * taskbar icon.
   */
  private handleTaskbarClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const isRightClick = event.buttons === 2;
    if (isRightClick) {
      this.openJumplist();
    } else {
      this.openAppWindow();
    }
  }

  /**
   * When clicking on the backgroud image, close the menus.
   */
  private handleBackdropClick = () => {
    this.closeJumplist();
    this.closeStartMenu();
  }

  render() {
    if (this.manifest) {
      return html`
        <div part="background" class="background">
          <div 
          part="content"
          class="content"
          style=${styleMap({
            transform: this.hideEditor ? 'scale(1.3)' : 'none',
            marginBottom: this.hideEditor ? '100px' : '0px'
          })}>
            <div class="desktop-container">
              <img 
              @click=${this.handleBackdropClick} 
              class="desktop" 
              alt="Windows desktop" 
              src="../assets/images/desktop.png" />
              <div 
              role="button"
              tabindex="0"
              aria-label="Open Microsoft Store"
              @click=${this.openStore} 
              class="taskbar-icon store-icon">
              </div>
              ${this.iconUrl ? 
                html`
                  <div 
                  role="button"
                  tabindex="0"
                  aria-label="Open application window"
                  class="taskbar-icon taskbar-app-icon" 
                  @mousedown=${this.handleTaskbarClick} 
                  @click=${this.handleTaskbarClick}>
                    <img alt="App icon" src=${this.iconUrl} />
                  </div>` : null}
              <div 
              role="button"
              tabindex="0"
              aria-label="Open Windows start menu"
              class="menu-toggler" 
              @click=${this.isMenuOpen ? this.closeStartMenu : this.openStartMenu}>
              </div>
              <start-menu
              .isMenuOpen=${this.isMenuOpen}
              .appName=${this.manifest.name}
              .iconUrl=${this.iconUrl}
              .onClose=${this.closeStartMenu}
              .onOpenApp=${this.openAppWindow}>
              </start-menu>
              <app-window 
              .isWindowOpen=${this.isAppOpen}
              .onClose=${this.closeAppWindow}
              .backgroundColor=${this.manifest.background_color}
              .themeColor=${this.manifest.theme_color}
              .appName=${this.manifest.name}
              .iconUrl=${this.iconUrl}
              .siteUrl=${this.siteUrl}
              .display=${this.manifest.display || 'standalone'}>
              </app-window>
              <jump-list
              .isListOpen=${this.isJumplistOpen}
              .shortcuts=${this.manifest.shortcuts}
              .siteUrl=${this.siteUrl}>
              </jump-list>
              <store-window
              .isWindowOpen=${this.isStoreOpen}
              .onClose=${this.closeStore}
              .iconUrl=${this.iconUrl}
              .siteUrl=${this.siteUrl}
              .appName=${this.manifest.name || this.manifest.short_name}
              .description=${this.manifest.description || 'An amazing progressive web app!'}
              .screenshots=${this.manifest.screenshots}
              .categories=${this.manifest.categories}>
              </store-window>
            </div>
            <div>
              ${this.hideEditor ? null :
                html`
                  ${this.editorStatus ? 
                    html`
                    <div 
                    part="status-message"
                    class=${`editor-status ${this.errorMessage && 'invalid-message'}`} 
                    role="status">
                      ${this.editorStatus}
                    </div>
                    ` : null}
                    <code-editor 
                    .startText=${JSON.stringify(this.manifest, null, '  ')}>
                    </code-editor>`}
            </div>
          </div>
          <explanation-text 
          .message=${this.explanationMessage}
          .isFadingIn=${this.isExplanationFadingIn}
          .isFadingOut=${this.isExplanationFadingOut}>
          </explanation-text>
        </div>
      `;
    } else {
      return html`
        <div part="background" class="background">
          <form part="input-form" class="site-input" @submit=${this.handleSearchManifest}>
            <label for="pwa-input" part="input-title">Enter the URL to your PWA</label>
            <input 
            id="pwa-input"
            part="input-field"
            type="text" 
            value=${this.siteUrl} 
            @change=${this.handleSiteInputChange} />
            <button part="input-button" type="submit">Start</button>
            <p role="alert" class="invalid-message">
              ${this.errorMessage}
            </p>
          </form>
        </div>
      `;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pwa-simulator': PWASimulator;
  }
}

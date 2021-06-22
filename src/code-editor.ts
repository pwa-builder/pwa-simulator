import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { debounce } from 'lodash-es';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { getEditorState, emitter, idGenerator } from './utils/codemirror';
import { CodeEditorEvents, CodeEditorSyncEvent, Lazy } from './models';

@customElement('code-editor')
export class CodeEditor extends LitElement {
  static styles = css`
    .cm-editor {
      background-color: #FFF;
      height: 533px;
      width: 400px;
    }
  `;

  @property({ type: String }) startText: Lazy<string>;

  @state() editorId: string;

  @state() editorState: Lazy<EditorState>;

  @state() editorView: Lazy<EditorView>;

  @state() editorEmitter = emitter;

  protected static editorIdGenerator = idGenerator();

  constructor() {
    super();

    this.editorId = `editor-${CodeEditor.editorIdGenerator.next().value}`;

    this.editorEmitter.addEventListener(
      CodeEditorEvents.sync,
      (event: Event) => {
        const e = event as CustomEvent<CodeEditorSyncEvent>;

        this.startText = e.detail.text;
        this.updateEditor();
      }
    );

    this.editorEmitter.addEventListener(
      CodeEditorEvents.update,
      debounce((event: Event) => {
        this.dispatchEvent(event);
      })
    );
  }

  firstUpdated() {
    this.updateEditor();
  }

  updateEditor = () => {
    this.editorState = getEditorState(this.startText!);
    
    if (this.editorView) {
      this.editorView.setState(this.editorState);
    } else {
      this.editorView = new EditorView({
        state: this.editorState,
        root: this.shadowRoot!,
        parent: this.shadowRoot!.getElementById(this.editorId)!,
      });
    }
  }

  render() {
    return html`
      <div id=${this.editorId} class="${this.className}"></div>
    `;
  }
}

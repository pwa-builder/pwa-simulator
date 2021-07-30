# PWABuilder: pwa-simulator
A [web component](https://medium.com/pwabuilder/building-pwas-with-web-components-33f986bf8e4c) that allows you to preview your PWA on Windows 11, based on your app's `manifest.json` file!

## Built with
- [Lit](https://lit.dev/)
- [Typescript](https://www.typescriptlang.org/)
- The project generator from [Open Web Components](https://open-wc.org/docs/development/generator/)

## Using this component
### Modes
The `pwa-simulator` can be used in 2 ways: 
1. **You can enter the PWA's URL in the initially rendered form**, and via the [`pwabuilder-manifest-finder` API](https://github.com/pwa-builder/pwabuilder-manifest-finder), the component fetches the corresponding web manifest. 
2. **The site's URL can be passed as a property to the component**, together with the web manifest. Note that the PWA's URL is still needed in this mode to display the icons and other images.

### Configuration
All properties are optional and have default values, but for the optimal experience these should be modified as needed.
Note that in the HTML markup, property names should be all in lowercase. For more information refer to [lit's documentation](https://lit.dev/docs/components/properties/#attributes).

- `siteUrl`: The PWA's URL. If not defined, the component will initially display a form to input the site's URL (see [mode 1](#modes) above).
- `manifest`: The input manifest object. The `siteUrl` property should be defined if a manifest is given as input.
  - Default:
  ```
  {
    name: 'PWA App',
    background_color: '#FFF',
    theme_color: '#E3CEF6',
    categories: [],
    shortcuts: [],
    display: 'standalone',
    description: 'An amazing progressive web app!',
    icons: [
      {
        src: '/assets/icons/icon_512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
  ```
- `hideEditor`: If true, the code editor is hidden and only the preview window is displayed.
  - Default: `false`
- `explanations`: Object containing the explanation messages that are displayed when the user interacts with the previewer. `initial` is the starting message (can be used to suggest an initial action to the user). `appWindow`, `startMenu`, `jumpList` and `store` are all shown when the respective window is open. If a value isn't specified, the default message is used.
  - Default:
  ```
  {
    initial: "Do you see something familiar on the taskbar?",
    appWindow: "The background color, theme color and display attributes determine several UI aspects of your PWA, such as the titlebar.",
    startMenu: "The application's name and icon are used in the start menu.",
    jumpList: "The actions listed on the shortcuts attribute define a context menu that is displayed when right-clicking on the taskbar icon.",
    store: "Screenshots, a complete description and categories will enhance your app's listing in the Microsoft Store."
  }
  ```
- `explanationDisplayTime`: The duration (in milliseconds) of the explanation message display, after which it fades out.
  - Default: 5000 (5 seconds)

## Styling
This component can also be styled according to the needs of your application. 

The simulator exposes the parts below for customization with the [CSS ::part() pseudo-element](https://css-tricks.com/styling-in-the-shadow-dom-with-css-shadow-parts/):
Part name | Description
----------|------------
`background` | The simulator's main container.
`content` | The container of both the text editor and platform window.
`input-form` | The form for entering the PWA's URL.
`input-title` | The title of the form for entering the PWA's URL.
`input-field` | The text field for entering the PWA's URL.
`input-button` | The button that submits the form for entering the PWA's URL.

The following [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) can also be provided:
Variable name | Description | Default
--------------|-------------|--------
`--font-family` | The component's main font family. | Arial
`--font-color` | The component's main font color. | `#292C3A`
`--background` | The CSS background of the entire component. | `linear-gradient(252.83deg, #5039A8 2.36%, #6AA2DB 99.69%)`
`--pwa-background-color` | Fallback background color to use in case it is not defined in the manifest. | `#FFF`
`--pwa-theme-color` | Fallback theme color to use in case it is not defined in the manifest. | `#E3CEF6`
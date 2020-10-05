# `<media-playlist>`

A custom element for playing through a set of audio and video elements.

## Example

```html
<html>
<head>
  <script type="module" src="https://unpkg.com/media-playlist"></script>
</head>
<body>

<media-playlist loop>
  <video src="" controls></video>
  <audio src="" controls></audio>
  <video src="" controls></video>
</media-playlist>

</body>
</html>
```

## Installing

`<media-playlist>` is packaged as a javascript module (es6) only, which is supported by all evergreen browsers and Node v12+.

### Loading into your HTML using `<script>`

Note the `type="module"`, that's important.

> Modules are always loaded asynchronously by the browser, so it's ok to load them in the head :thumbsup:, and best for registering web components quickly.

```html
<head>
  <script type="module" src="https://unpkg.com/media-playlist"></script>
</head>
```

### Adding to your app via `npm`

```bash
npm install media-playlist --save
```
Or yarn
```bash
yarn add media-playlist
```

Include in your app javascript (e.g. src/App.js)
```js
import 'media-playlist';
```
This will register the custom elements with the browser so they can be used as HTML.

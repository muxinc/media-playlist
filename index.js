const template = document.createElement('template');

template.innerHTML = `
<style>
:host {
  display: inline-block;
  position: relative;
  min-width: 450px;
  min-height: 300px;
  background: linear-gradient(135deg, #333 0%, #000 100%);
}

::slotted(video), ::slotted(audio) {
  display: none;
  position: absolute;
  width: 100%;
  height: 100%;
}

::slotted(video[current]), ::slotted(audio[current]) {
  display: block;
}
</style>
<div class="container">
  <slot></slot>
</div>
`;

class MediaPlaylist extends HTMLElement {
  constructor() {
    super();

    var shadow = this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.handleCurrentEnded = () => {
      this.next();
    };
  }

  connectedCallback() {
    // Select the first media element in the list
    this.currentMedia = this.querySelector('video,audio');
  }
  disconnectedCallback() {}

  get currentMedia() {
    return this._currentMedia || null;
  }

  set currentMedia(mediaElement) {
    let currentMedia = this.currentMedia;

    // Tear down the previous media element
    if (currentMedia) {
      currentMedia.removeAttribute('current');
      currentMedia.removeEventListener('ended', this.handleCurrentEnded);
      currentMedia.pause();
      currentMedia.currentTime = 0;
    }

    // Load the supplied media element
    currentMedia = mediaElement;
    if (currentMedia) {
      currentMedia.setAttribute('current', '');
      currentMedia.addEventListener('ended', this.handleCurrentEnded);
    }

    this._currentMedia = currentMedia;
  }

  next() {
    // Get all media elements and convert to an array
    var medias = Array.prototype.slice.call(this.querySelectorAll('video,audio'));
    var nextSib = medias[medias.indexOf(this.currentMedia) + 1];

    // If looping get the first
    if (!nextSib && this.getAttribute('loop') !== null) {
      nextSib = medias[0];
    }

    if (nextSib) {
      this.currentMedia = nextSib;
      nextSib.play();
    } else {
      this.currentMedia = null;
      this.dispatchEvent(new Event('ended'));
    }
  }

  previous() {
    // Get all media elements and convert to an array
    var medias = Array.prototype.slice.call(this.querySelectorAll('video,audio'));
    var prevSib = medias[medias.indexOf(this.currentMedia) - 1];

    // If looping get the first
    if (!prevSib && this.getAttribute('loop') !== null) {
      prevSib = medias[medias.length - 1];
    }

    if (prevSib) {
      this.currentMedia = prevSib;
      prevSib.play();
    }
  }
}

if (!window.customElements.get('media-playlist')) {
  window.customElements.define('media-playlist', MediaPlaylist);
  window.MediaPlaylist = MediaPlaylist;
}

export default MediaPlaylist;

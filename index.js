// import CustomVideoElement from 'custom-video-element';

const template = document.createElement('template');

template.innerHTML = `
<style>
:host {
  display: block;
  position: relative;
  min-width: 450px;
  min-height: 300px;
}

#currentMedia {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>

<div id="container"></div>
`;

class MediaPlaylistItem extends HTMLElement {};

if (!window.customElements.get('media-playlist-item')) {
  window.customElements.define('media-playlist-item', MediaPlaylistItem);
}

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
    // this.currentMedia = this.querySelector('video,audio,media-playlist-item');
    this.currentItem = this.querySelector('media-playlist-item');
    if (this.getAttribute('autoplay')) {
      this.play();
    }
  }

  disconnectedCallback() {}

  get currentItem() {
    return this.querySelector('media-playlist-item[current]') || null;
  }

  set currentItem(playlistItem) {
    let currentItem = this.currentItem;

    // Tear down the previous media element
    if (currentItem) {
      let currentMedia = this.shadowRoot.querySelector('#currentMedia');

      currentMedia.pause();
      currentMedia.removeEventListener('ended', this.handleCurrentEnded);
      this.shadowRoot.querySelector('#container').innerHTML = '';
      currentItem.removeAttribute('current');
    }

    // Load the new playlist item
    currentItem = playlistItem;

    if (playlistItem) {
      const mediaElement = document.createElement(playlistItem.getAttribute('type'));
      mediaElement.id = "currentMedia";
      mediaElement.src = playlistItem.getAttribute('src');
      mediaElement.addEventListener('ended', this.handleCurrentEnded);

      this.shadowRoot.querySelector('#container').appendChild(mediaElement);

      playlistItem.setAttribute('current', '');
    }
  }

  next() {
    // Get all media elements and convert to an array
    var items = Array.prototype.slice.call(this.querySelectorAll('media-playlist-item'));
    var nextSib = items[items.indexOf(this.currentItem) + 1];

    // If looping get the first
    if (!nextSib && this.getAttribute('loop') !== null) {
      nextSib = items[0];
    }

    if (nextSib) {
      this.currentItem = nextSib;
      this.play();
    } else {
      this.currentItem = null;
      this.dispatchEvent(new Event('ended'));
    }
  }

  previous() {
    // Get all media elements and convert to an array
    var items = Array.prototype.slice.call(this.querySelectorAll('media-playlist-item'));
    var prevSib = items[items.indexOf(this.currentItem) - 1];

    // If looping get the first
    if (!prevSib && this.getAttribute('loop') !== null) {
      prevSib = items[items.length - 1];
    }

    if (prevSib) {
      this.currentItem = prevSib;
      this.play();
    }
  }

  get _currentMedia() {
    return this.shadowRoot.querySelector('#currentMedia');
  }

  play() {
    this._currentMedia && this._currentMedia.play();
  }

  pause() {
    this._currentMedia && this._currentMedia.pause();
  }

  get currentTime() {
    return this._currentMedia && this._currentMedia.pause() || 0;
  }

  set currentTime(time) {
    this._currentMedia && (this._currentMedia.currentTime = time);
  }
}

function getCurrentMedia(playlist) {
  return playlist.shadowRoot.querySelector('#currentMedia');
}

if (!window.customElements.get('media-playlist')) {
  window.customElements.define('media-playlist', MediaPlaylist);
  window.MediaPlaylist = MediaPlaylist;
}

export default MediaPlaylist;

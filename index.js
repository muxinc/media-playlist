// Document HTML Video API
// Consider moving to its own project for shared use
const HTML_VIDEO_EVENTS = [
  'abort',
  'canplay',
  'canplaythrough',
  'durationchange',
  'emptied',
  'ended',
  'error',
  'loadeddata',
  'loadedmetadata',
  'pause',
  'play',
  'playing',
  'progress',
  'ratechange',
  'resize',
  'seeked',
  'seeking',
  'stalled',
  'suspend',
  'timeupdate',
  'volumechange',
  'waiting',
];

const HTML_VIDEO_PROPS = {
  addTextTrack: {
    type: 'function',
  },
  audioTracks: {
    type: 'object',
    readOnly: true,
  },
  autoplay: {
    type: 'boolean',
  },
  buffered: {
    type: 'object',
    readOnly: true,
  },
  canPlayType: {
    type: 'function',
    default: '',
  },
  controls: {
    type: 'boolean',
  },
  crossOrigin: {
    type: 'string',
  },
  currentSrc: {
    type: 'string',
    readOnly: true,
  },
  currentTime: {
    type: 'number',
    default: 0,
  },
  defaultMuted: {
    type: 'boolean',
  },
  duration: {
    type: 'number',
    readOnly: true,
    default: NaN,
  },
  fastSeek: {
    type: 'function',
  },
  load: {
    type: 'function',
  },
  networkState: {
    type: 'number',
    readOnly: true,
    default: 0,
  },
  pause: {
    type: 'function',
  },
  paused: {
    type: 'boolean',
    readOnly: true,
    default: true,
  },
  play: {
    type: 'function',
  },
  playbackRate: {
    type: 'number',
  },
  played: {
    type: 'object',
    readOnly: true,
  },
  poster: {
    type: 'string',
    default: '',
  },
  preload: {
    type: 'string',
    default: 'metadata',
  },
  readyState: {
    type: 'number',
    readOnly: true,
    default: 0,
  },
  seekable: {
    type: 'object',
    readOnly: true,
  },
  src: {
    type: 'string',
  },
  textTracks: {
    type: 'object',
    readOnly: true,
  },
  videoHeight: {
    type: 'number',
    readOnly: true,
  },
  videoWidth: {
    type: 'number',
    readOnly: true,
  },
  videoTracks: {
    type: 'object',
    readOnly: true,
  },
  volume: {
    type: 'number',
    default: 1,
  },
};

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

// Define a playlist item element
class MediaPlaylistItem extends HTMLElement {};

if (!window.customElements.get('media-playlist-item')) {
  window.customElements.define('media-playlist-item', MediaPlaylistItem);
}

class MediaPlaylist extends HTMLElement {
  constructor() {
    super();

    var shadow = this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    // Select the first media element in the list
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
    let currentMedia = this.shadowRoot.querySelector('#currentMedia');

    currentItem && currentItem.removeAttribute('current');

    // Tear down the previous media element
    if (currentMedia) {
      // Shut down current media element
      currentMedia.pause();

      // Remove all event handlers
      const currentHandlers = currentMedia.playlistEventHandlers;
      currentHandlers.forEach(handlerSet => {
        currentMedia.removeEventListener(handlerSet[0], handlerSet[1]);
      });
      currentMedia.playlistEventHandlers = [];

      // Remove current media element
      this.shadowRoot.querySelector('#container').innerHTML = '';
    }

    // Load the new playlist item
    currentItem = playlistItem;

    if (playlistItem) {
      const mediaElement = document.createElement(playlistItem.getAttribute('type'));
      mediaElement.id = 'currentMedia';

      // Copy attrs from the playlist item to the media
      for (let i = 0, len = playlistItem.attributes.length; i < len; i++) {
        const attr = playlistItem.attributes[i];

        // skip type attr as that's special for media-playlist-item
        if (attr.nodeName === 'type') continue;

        mediaElement.setAttribute(attr.nodeName, attr.value);
      }

      // Store event handlers on the media for later removal
      mediaElement.playlistEventHandlers = [];

      // Handle media events
      const endedHandler = (event) => {
        this.next();
      };
      mediaElement.addEventListener('ended', endedHandler, false);
      mediaElement.playlistEventHandlers.push(['ended', endedHandler]);

      HTML_VIDEO_EVENTS.forEach((eventName)=>{
        // Special case ended
        if (eventName === 'ended') return;

        const handler = (event) => {
          this.dispatchEvent(new CustomEvent(eventName));
        };

        mediaElement.addEventListener(eventName, handler, false);
        mediaElement.playlistEventHandlers.push([eventName, handler]);
      });

      // Copy children of playlist item to media
      playlistItem.childNodes.forEach((node) => {
        const copiedNode = node.cloneNode(true);
        mediaElement.appendChild(copiedNode);
      });

      // Append the media element to the shadow dom
      this.shadowRoot.querySelector('#container').appendChild(mediaElement);

      // Set this item as current
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

  // Properties that will have special handling, not just pass through
  get autoplay() {}
  set autoplay(value) {}

  get controls() {}
  set controls(value) {}

  get crossOrigin() {}
  set crossOrigin(value) {}

  get defaultMuted() {}
  set defaultMuted(value) {}

  get defaultPlaybackRate() {}
  set defaultPlaybackRate(value) {}

  get ended() {}

  get muted() {}
  set muted(value) {}

  get src() {}
  set src(value) {}
}

function getCurrentMedia(playlist) {
  return playlist.shadowRoot.querySelector('#currentMedia');
}

// Apply HTML Video API and pass through requests
Object.keys(HTML_VIDEO_PROPS).forEach(propName=>{
  const propDetails = HTML_VIDEO_PROPS[propName];

  // Don't overwrite custom handling
  if (MediaPlaylist.prototype[propName]) return;

  // Function
  if (propDetails.type == 'function') {
    MediaPlaylist.prototype[propName] = function() {
      const media = getCurrentMedia(this);
      return media[propName].apply(media, arguments);
    }
    return;
  }

  // Getter
  const getterDescriptor = {
    get: function() {
      const media = getCurrentMedia(this);
      return media[propName];
    }
  };

  // Setter
  if (!propDetails.readOnly) {
    getterDescriptor.set = function(value) {
      const media = getCurrentMedia(this);
      media[propName] = value;
    };
  }

  Object.defineProperty(MediaPlaylist.prototype, propName, getterDescriptor);
});

if (!window.customElements.get('media-playlist')) {
  window.customElements.define('media-playlist', MediaPlaylist);
  window.MediaPlaylist = MediaPlaylist;
}

export default MediaPlaylist;

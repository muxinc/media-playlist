// import CustomVideoElement from 'custom-video-element';

const HTML_VIDEO_EVENTS = [
  'abort',
  'canplay',
  'canplaythrough',
  'durationchange',
  'emptied',
  // 'ended',
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
      mediaElement.src = playlistItem.getAttribute('src');

      // Store event handlers on the media for later removal
      mediaElement.playlistEventHandlers = [];

      // Handle media events
      const endedHandler = (event) => {
        this.next();
      };
      mediaElement.addEventListener('ended', endedHandler, false);
      mediaElement.playlistEventHandlers.push(['ended', endedHandler]);

      HTML_VIDEO_EVENTS.forEach((eventName)=>{
        const handler = (event) => {
          this.dispatchEvent(new CustomEvent(eventName));
        };

        mediaElement.addEventListener(eventName, handler, false);
        mediaElement.playlistEventHandlers.push([eventName, handler]);
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

// Document HTML Video API
const HTML_VIDEO_PROPS = {
  addTextTrack: {
    isFunction: true,
  },
  audioTracks: {
    readOnly: true
  },
  autoplay: {
    type: 'boolean',
  },
  buffered: {
    readOnly: true,
  },
  canPlayType: {
    isFunction: true,
    type: 'string',
    default: '',
  },
  controls: {
    type: 'boolean',
  },
  crossOrigin: {
    type: 'string',
  },
  currentSrc: {
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
    readOnly: true,
    default: NaN,
  },
  fastSeek: {
    isFunction: true,
  },
  load: {
    isFunction: true,
  },
  networkState: {
    readOnly: true,
    type: 'number',
    default: 0,
  },
  pause: {
    isFunction: true,
  },
  paused: {
    readOnly: true,
    type: 'boolean',
    default: true,
  },
  play: {
    isFunction: true,
  },
  playbackRate: {
    type: 'number',
  },
  played: {
    readOnly: true,
    type: 'object',
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
    readOnly: true,
    type: 'number',
    default: 0,
  },
  seekable: {
    readOnly: true,
    type: 'object',
  },
  src: {
    type: 'string',
  },
  textTracks: {
    readOnly: true,
    type: 'object',
  },
  videoHeight: {
    readOnly: true,
  },
  videoWidth: {
    readOnly: true,
  },
  videoTracks: {
    readOnly: true,
    type: 'object',
  },
  volume: {
    type: 'number',
    default: 1,
  },
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
  if (propDetails.isFunction) {
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

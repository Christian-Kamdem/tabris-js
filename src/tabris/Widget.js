import Layout from './Layout';
import NativeObject from './NativeObject';
import WidgetCollection from './WidgetCollection';
import GestureRecognizer from './GestureRecognizer';
import {animate} from './Animation';
import {jsxFactory} from './JsxProcessor';
import {types} from './property-types';

export default class Widget extends NativeObject {

  constructor(properties) {
    super();
    if (this.constructor === Widget) {
      throw new Error('Cannot instantiate abstract Widget');
    }
    if (this._nativeType) {
      this._create(this._nativeType, properties);
    }
  }

  appendTo(widget) {
    this._checkDisposed();
    widget = widget instanceof WidgetCollection ? widget.first() : widget;
    if (!(widget instanceof NativeObject)) {
      throw new Error('Cannot append to non-widget');
    }
    this._setParent(widget);
    return this;
  }

  insertBefore(widget) {
    this._checkDisposed();
    widget = widget instanceof WidgetCollection ? widget.first() : widget;
    if (!(widget instanceof NativeObject)) {
      throw new Error('Cannot insert before non-widget');
    }
    let parent = widget.parent();
    if (!parent) {
      throw new Error('Cannot insert before orphan');
    }
    let index = parent.$children.indexOf(widget);
    this._setParent(parent, index);
    return this;
  }

  insertAfter(widget) {
    this._checkDisposed();
    widget = widget instanceof WidgetCollection ? widget.first() : widget;
    if (!(widget instanceof NativeObject)) {
      throw new Error('Cannot insert after non-widget');
    }
    let parent = widget.parent();
    if (!parent) {
      throw new Error('Cannot insert after orphan');
    }
    let index = parent.$children.indexOf(widget);
    this._setParent(parent, index + 1);
    return this;
  }

  detach() {
    this._checkDisposed();
    this._setParent(null);
    return this;
  }

  parent() {
    return this._parent || null;
  }

  siblings(selector) {
    let siblings = (this._parent ? this._parent._children() : []);
    let filtered = siblings.filter(widget => widget !== this);
    return new WidgetCollection(filtered, selector);
  }

  get classList() {
    if (!this._classList) {
      this._classList = [];
    }
    return this._classList;
  }

  get data() {
    if (!this.$data) {
      this.$data = {};
    }
    return this.$data;
  }

  toXML() {
    const content = this._getXMLContent();
    const hasChild = content !== '';
    if (!hasChild) {
      return this._getXMLHeader(hasChild);
    }
    return `${this._getXMLHeader(hasChild)}\n${content}\n${this._getXMLFooter(hasChild)}`;
  }

  _getXMLContent() {
    const children = [];
    const prefix = '    ';
    if (this.$children) {
      for (let i = 0; i < this.$children.length; ++i) {
        const widget = this.$children[i];
        if (widget instanceof Widget) {
          children.push(widget.toXML().split('\n').map(line => prefix + line).join('\n'));
        }
      }
    }
    return children.join('\n');
  }

  _getXMLHeader(hasChild) {
    const id = this.id ? ` id='${this.id}'` : '';
    const className = this.class ? ` class='${this.class}'` : '';
    const values = `${this.constructor.name}${id}${className}`;
    return hasChild ? `<${values}>` : `<${values}/>`;
  }

  _getXMLFooter(hasChild) {
    return hasChild ? `</${this.constructor.name}>` : '';
  }

  _getContainer() {
    return this;
  }

  _setParent(parent, index) {
    this._nativeSet('parent', parent ? types.proxy.encode(parent._getContainer(this)) : null);
    if (this._parent) {
      this._parent._removeChild(this);
      Layout.addToQueue(this._parent);
    }
    this._parent = parent;
    if (this._parent) {
      this._parent._addChild(this, index);
      Layout.addToQueue(this._parent);
    }
  }

  _listen(name, listening) {
    if (this._isDisposed) {
      return;
    }
    if (this.gestures[name]) {
      if (listening) {
        let properties = Object.assign({target: this}, this.gestures[name]);
        let recognizer = new GestureRecognizer(properties).on('gesture', event => {
          if (event.translation) {
            event.translationX = event.translation.x;
            event.translationY = event.translation.y;
          }
          if (event.velocity) {
            event.velocityX = event.velocity.x;
            event.velocityY = event.velocity.y;
          }
          super._trigger(name, event);
        });
        if (!this._recognizers) {
          this._recognizers = {};
        }
        this._recognizers[name] = recognizer;
        this.on('dispose', recognizer.dispose, recognizer);
      } else if (this._recognizers && name in this._recognizers) {
        this._recognizers[name].dispose();
        delete this._recognizers[name];
      }
    } else if (name === 'boundsChanged') {
      this._onoff('resize', listening, this.$triggerChangeBounds);
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'resize') {
      if (hasAndroidResizeBug()) {
        setTimeout(() => super._trigger(name, types.bounds.decode(event.bounds)), 0);
      } else {
        super._trigger(name, types.bounds.decode(event.bounds));
      }
    } else {
      return super._trigger(name, event);
    }
  }

  _release() {
    if (this._parent) {
      this._parent._removeChild(this);
      Layout.addToQueue(this._parent);
      delete this._parent;
    }
  }

  $triggerChangeBounds({left, top, width, height}) {
    super._trigger('boundsChanged', {value: {left, top, width, height}});
  }

  /** @this {import("../JsxProcessor").default} */
  [jsxFactory](Type, props, children) {
    return this.createNativeObject(Type, props, children);
  }

}

NativeObject.defineProperties(Widget.prototype, {
  enabled: {
    type: 'boolean',
    default: true
  },
  visible: {
    type: 'boolean',
    default: true
  },
  layoutData: {
    type: 'layoutData',
    set(name, value) {
      this._layoutData = value;
      if (this._parent) {
        Layout.addToQueue(this._parent);
      }
    },
    get() {
      return this._layoutData || null;
    }
  },
  left: {type: 'edge', get: getLayoutProperty, set: setLayoutProperty},
  right: {type: 'edge', get: getLayoutProperty, set: setLayoutProperty},
  top: {type: 'edge', get: getLayoutProperty, set: setLayoutProperty},
  bottom: {type: 'edge', get: getLayoutProperty, set: setLayoutProperty},
  width: {type: 'dimension', get: getLayoutProperty, set: setLayoutProperty},
  height: {type: 'dimension', get: getLayoutProperty, set: setLayoutProperty},
  centerX: {type: 'dimension', get: getLayoutProperty, set: setLayoutProperty},
  centerY: {type: 'dimension', get: getLayoutProperty, set: setLayoutProperty},
  baseline: {type: 'sibling', get: getLayoutProperty, set: setLayoutProperty},
  elevation: {
    type: 'number',
    default: 0
  },
  backgroundImage: {
    type: 'image'
  },
  bounds: {
    type: 'bounds',
    readonly: true
  },
  background: {
    type: 'shader',
    set(name, value) {
      this._nativeSet(name, value === undefined ? null : value);
      this._storeProperty(name, value);
    }
  },
  opacity: {
    type: 'opacity',
    default: 1
  },
  transform: {
    type: 'transform',
    default() {
      return {
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        translationX: 0,
        translationY: 0,
        translationZ: 0
      };
    }
  },
  highlightOnTouch: {
    type: 'boolean',
    default: false
  },
  cornerRadius: {
    type: 'number',
    default: 0
  },
  id: {
    type: 'string',
    set(name, value) {
      this._storeProperty(name, value);
    },
    get(name) {
      return this._getStoredProperty(name);
    }
  },
  class: {
    type: 'string',
    set(name, value) {
      this._classList = value.trim().split(/\s+/);
    },
    get() {
      return this.classList.join(' ');
    }
  },
  gestures: {
    set(name, gestures) {
      this._gestures = Object.assign({}, defaultGestures, gestures);
    },
    get() {
      if (!this._gestures) {
        this._gestures = Object.assign({}, defaultGestures);
      }
      return this._gestures;
    }
  }
});

NativeObject.defineEvents(Widget.prototype, {
  tap: true,
  longpress: true,
  pan: true,
  panLeft: true,
  panRight: true,
  panUp: true,
  panDown: true,
  panHorizontal: true,
  panVertical: true,
  swipeLeft: true,
  swipeRight: true,
  swipeUp: true,
  swipeDown: true,
  touchStart: {native: true},
  touchMove: {native: true},
  touchEnd: {native: true},
  touchCancel: {native: true},
  resize: {native: true},
  addChild: true,
  removeChild: true
});

Widget.prototype.animate = animate;

function hasAndroidResizeBug() {
  if (!('cache' in hasAndroidResizeBug)) {
    hasAndroidResizeBug.cache = tabris.device.platform === 'Android' && tabris.device.version <= 17;
  }
  return hasAndroidResizeBug.cache;
}

let defaultGestures = {
  tap: {type: 'tap'},
  longpress: {type: 'longpress'},
  pan: {type: 'pan'},
  panLeft: {type: 'pan', direction: 'left'},
  panRight: {type: 'pan', direction: 'right'},
  panUp: {type: 'pan', direction: 'up'},
  panDown: {type: 'pan', direction: 'down'},
  panHorizontal: {type: 'pan', direction: 'horizontal'},
  panVertical: {type: 'pan', direction: 'vertical'},
  swipeLeft: {type: 'swipe', direction: 'left'},
  swipeRight: {type: 'swipe', direction: 'right'},
  swipeUp: {type: 'swipe', direction: 'up'},
  swipeDown: {type: 'swipe', direction: 'down'}
};

function setLayoutProperty(name, value) {
  if (!this._layoutData) {
    this._layoutData = {};
  }
  if (value == null) {
    delete this._layoutData[name];
  } else {
    this._layoutData[name] = value;
  }
  if (this._parent) {
    Layout.addToQueue(this._parent);
  }
}

function getLayoutProperty(name) {
  return this._layoutData && this._layoutData[name] != null ? this._layoutData[name] : null;
}

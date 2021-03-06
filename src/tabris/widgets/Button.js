import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {jsxFactory} from '../JsxProcessor';

export default class Button extends Widget {

  get _nativeType() {
    return 'tabris.Button';
  }

  /** @this {import("../JsxProcessor").default} */
  [jsxFactory](Type, props, children) {
    return super[jsxFactory](Type, this.withContentText(props, children, 'text'));
  }

}

NativeObject.defineProperties(Button.prototype, {
  alignment: {type: ['choice', ['left', 'right', 'center']], default: 'center'},
  image: {type: 'image', default: null},
  text: {type: 'string', default: ''},
  textColor: {type: 'color'},
  font: {
    type: 'font',
    set(name, value) {
      this._nativeSet(name, value === undefined ? null : value);
      this._storeProperty(name, value);
    },
    default: null
  }
});

NativeObject.defineEvents(Button.prototype, {
  select: {native: true},
});

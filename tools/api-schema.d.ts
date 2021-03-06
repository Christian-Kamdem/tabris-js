/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type TabrisJsApiDefinitionJsonSchema = Api;

export interface Api {
  /**
   * The title of the document. Will default to object or type name.
   */
  title?: string;
  description?: string;
  namespace?: "global" | "tabris";
  /**
   * Name of the class
   */
  type?: string;
  /**
   * The type of children accepted via JSX.
   */
  jsxChildren?: string;
  /**
   * Name of the instance (for singletons)
   */
  object?: string;
  extends?: string;
  ts_extends?: string;
  /**
   * Typescript only
   */
  generics?: string;
  constructor?: {
    access: "public" | "protected" | "private";
    parameters?: Parameter[];
  };
  /**
   * Change events will be generated automatically if type extends NativeObject
   */
  properties?: {
    [k: string]: Property;
  };
  methods?: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "(^_?[a-z]\w+$)|(^\[.*\]$)".
     */
    [k: string]: Method | Method[];
  };
  events?: {
    [k: string]: Event;
  };
  links?: {
    title?: string;
    path?: string;
  }[];
}
export interface Parameter {
  name: string;
  description?: string;
  type: string;
  /**
   * Overrides "type" for TypeScript declarations
   */
  ts_type?: string;
  /**
   * Defaults to false
   */
  optional?: boolean;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "(^_?[a-z]\w+$)|(^\[.*\]$)".
 *
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^_?[a-z]\w+$".
 */
export interface Property {
  description?: string;
  changeEventDescription?: string;
  type: string;
  /**
   * Overrides "type" for TypeScript declarations
   */
  ts_type?: string;
  /**
   * Exclude this property from documentation
   */
  ts_only?: boolean;
  /**
   * The type of JSX element that may be used to express the value(s) of this property
   */
  jsxType?: string;
  /**
   * JSX child elements of the matching type are mapped to this property
   */
  jsxContentProperty?: boolean;
  platforms?: Platforms;
  /**
   * Indicates that this property can not be set. However, if the property is not a "const", it may change by itself. Defaults to false
   */
  readonly?: boolean;
  /**
   * Indicates that this property can not change during the lifetime of this object. However, if there is a public constructor and the property is not "readonly", it can be set via constructor. No change events will be generated for this property. Defaults to false
   */
  const?: boolean;
  /**
   * Default value of this property
   */
  default?: {
    [k: string]: any;
  };
  /**
   * Limits the possible values of this property
   */
  values?: (string | number | boolean)[];
}
export interface Platforms {
  /**
   * Defaults to true
   */
  ios?: boolean;
  /**
   * Defaults to true
   */
  android?: boolean;
}
export interface Method {
  parameters?: Parameter[];
  returns?: string;
  ts_only?: boolean;
  static?: boolean;
  /**
   * Overrides "returns" for TypeScript declarations
   */
  ts_returns?: string;
  description?: string;
  /**
   * TypeScript only
   */
  generics?: string;
  platforms?: Platforms;
  protected?: boolean;
  provisional?: boolean;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[a-z]\w+$".
 */
export interface Event {
  description?: string;
  /**
   * The name of the generated event object interface for TypeScript declaration. Defaults to "{TypeName}{EventName}Event". Useful for merging multiple identical event interfaces.
   */
  eventObject?: string;
  platforms?: Platforms;
  parameters?: {
    [k: string]: Property;
  };
}

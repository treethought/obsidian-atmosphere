import type {} from "@atcute/lexicons";
import * as v from "@atcute/lexicons/validations";
import type {} from "@atcute/lexicons/ambient";

const _bodySchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("at.margin.annotation#body"),
  ),
  /**
   * MIME type of the body content
   * @default "text/plain"
   */
  format: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string(), "text/plain"),
  /**
   * BCP47 language tag
   */
  language: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
  /**
   * Reference to external body content
   */
  uri: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
  /**
   * Text content of the annotation
   * @maxLength 10000
   * @maxGraphemes 3000
   */
  value: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
      /*#__PURE__*/ v.stringLength(0, 10000),
      /*#__PURE__*/ v.stringGraphemes(0, 3000),
    ]),
  ),
});
const _cssSelectorSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("at.margin.annotation#cssSelector"),
  ),
  type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("CssSelector")),
  /**
   * CSS selector string
   * @maxLength 2000
   */
  value: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
    /*#__PURE__*/ v.stringLength(0, 2000),
  ]),
});
const _fragmentSelectorSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("at.margin.annotation#fragmentSelector"),
  ),
  /**
   * Specification the fragment conforms to
   */
  conformsTo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
  type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("FragmentSelector")),
  /**
   * Fragment identifier value
   * @maxLength 1000
   */
  value: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
    /*#__PURE__*/ v.stringLength(0, 1000),
  ]),
});
const _mainSchema = /*#__PURE__*/ v.record(
  /*#__PURE__*/ v.tidString(),
  /*#__PURE__*/ v.object({
    $type: /*#__PURE__*/ v.literal("at.margin.annotation"),
    /**
     * The annotation content (text or reference)
     */
    get body() {
      return /*#__PURE__*/ v.optional(bodySchema);
    },
    createdAt: /*#__PURE__*/ v.datetimeString(),
    /**
     * W3C motivation for the annotation
     */
    motivation: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.string<
        | "assessing"
        | "bookmarking"
        | "commenting"
        | "describing"
        | "editing"
        | "highlighting"
        | "linking"
        | "questioning"
        | "replying"
        | "tagging"
        | (string & {})
      >(),
    ),
    /**
     * Tags for categorization
     * @maxLength 10
     */
    tags: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.constrain(
        /*#__PURE__*/ v.array(
          /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
            /*#__PURE__*/ v.stringLength(0, 64),
            /*#__PURE__*/ v.stringGraphemes(0, 32),
          ]),
        ),
        [/*#__PURE__*/ v.arrayLength(0, 10)],
      ),
    ),
    /**
     * The resource being annotated with optional selector
     */
    get target() {
      return targetSchema;
    },
  }),
);
const _rangeSelectorSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("at.margin.annotation#rangeSelector"),
  ),
  /**
   * Selector for range end
   */
  get endSelector() {
    return /*#__PURE__*/ v.variant([
      cssSelectorSchema,
      textPositionSelectorSchema,
      textQuoteSelectorSchema,
      xpathSelectorSchema,
    ]);
  },
  /**
   * Selector for range start
   */
  get startSelector() {
    return /*#__PURE__*/ v.variant([
      cssSelectorSchema,
      textPositionSelectorSchema,
      textQuoteSelectorSchema,
      xpathSelectorSchema,
    ]);
  },
  type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("RangeSelector")),
});
const _targetSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("at.margin.annotation#target"),
  ),
  /**
   * Selector to identify the specific segment
   */
  get selector() {
    return /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.variant([
        cssSelectorSchema,
        fragmentSelectorSchema,
        rangeSelectorSchema,
        textPositionSelectorSchema,
        textQuoteSelectorSchema,
        xpathSelectorSchema,
      ]),
    );
  },
  /**
   * The URL being annotated
   */
  source: /*#__PURE__*/ v.genericUriString(),
  /**
   * SHA256 hash of normalized URL for indexing
   */
  sourceHash: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
  /**
   * State of the resource at annotation time
   */
  get state() {
    return /*#__PURE__*/ v.optional(timeStateSchema);
  },
  /**
   * Page title at time of annotation
   * @maxLength 500
   */
  title: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
      /*#__PURE__*/ v.stringLength(0, 500),
    ]),
  ),
});
const _textPositionSelectorSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("at.margin.annotation#textPositionSelector"),
  ),
  /**
   * Ending character position (exclusive)
   * @minimum 0
   */
  end: /*#__PURE__*/ v.integer(),
  /**
   * Starting character position (0-indexed, inclusive)
   * @minimum 0
   */
  start: /*#__PURE__*/ v.integer(),
  type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("TextPositionSelector"),
  ),
});
const _textQuoteSelectorSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("at.margin.annotation#textQuoteSelector"),
  ),
  /**
   * The exact text to match
   * @maxLength 5000
   * @maxGraphemes 1500
   */
  exact: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
    /*#__PURE__*/ v.stringLength(0, 5000),
    /*#__PURE__*/ v.stringGraphemes(0, 1500),
  ]),
  /**
   * Text immediately before the selection
   * @maxLength 500
   * @maxGraphemes 150
   */
  prefix: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
      /*#__PURE__*/ v.stringLength(0, 500),
      /*#__PURE__*/ v.stringGraphemes(0, 150),
    ]),
  ),
  /**
   * Text immediately after the selection
   * @maxLength 500
   * @maxGraphemes 150
   */
  suffix: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
      /*#__PURE__*/ v.stringLength(0, 500),
      /*#__PURE__*/ v.stringGraphemes(0, 150),
    ]),
  ),
  type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("TextQuoteSelector")),
});
const _timeStateSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("at.margin.annotation#timeState"),
  ),
  /**
   * URL to cached/archived version
   */
  cached: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
  /**
   * When the source was accessed
   */
  sourceDate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});
const _xpathSelectorSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("at.margin.annotation#xpathSelector"),
  ),
  type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("XPathSelector")),
  /**
   * XPath expression
   * @maxLength 2000
   */
  value: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
    /*#__PURE__*/ v.stringLength(0, 2000),
  ]),
});

type body$schematype = typeof _bodySchema;
type cssSelector$schematype = typeof _cssSelectorSchema;
type fragmentSelector$schematype = typeof _fragmentSelectorSchema;
type main$schematype = typeof _mainSchema;
type rangeSelector$schematype = typeof _rangeSelectorSchema;
type target$schematype = typeof _targetSchema;
type textPositionSelector$schematype = typeof _textPositionSelectorSchema;
type textQuoteSelector$schematype = typeof _textQuoteSelectorSchema;
type timeState$schematype = typeof _timeStateSchema;
type xpathSelector$schematype = typeof _xpathSelectorSchema;

export interface bodySchema extends body$schematype {}
export interface cssSelectorSchema extends cssSelector$schematype {}
export interface fragmentSelectorSchema extends fragmentSelector$schematype {}
export interface mainSchema extends main$schematype {}
export interface rangeSelectorSchema extends rangeSelector$schematype {}
export interface targetSchema extends target$schematype {}
export interface textPositionSelectorSchema extends textPositionSelector$schematype {}
export interface textQuoteSelectorSchema extends textQuoteSelector$schematype {}
export interface timeStateSchema extends timeState$schematype {}
export interface xpathSelectorSchema extends xpathSelector$schematype {}

export const bodySchema = _bodySchema as bodySchema;
export const cssSelectorSchema = _cssSelectorSchema as cssSelectorSchema;
export const fragmentSelectorSchema =
  _fragmentSelectorSchema as fragmentSelectorSchema;
export const mainSchema = _mainSchema as mainSchema;
export const rangeSelectorSchema = _rangeSelectorSchema as rangeSelectorSchema;
export const targetSchema = _targetSchema as targetSchema;
export const textPositionSelectorSchema =
  _textPositionSelectorSchema as textPositionSelectorSchema;
export const textQuoteSelectorSchema =
  _textQuoteSelectorSchema as textQuoteSelectorSchema;
export const timeStateSchema = _timeStateSchema as timeStateSchema;
export const xpathSelectorSchema = _xpathSelectorSchema as xpathSelectorSchema;

export interface Body extends v.InferInput<typeof bodySchema> {}
export interface CssSelector extends v.InferInput<typeof cssSelectorSchema> {}
export interface FragmentSelector extends v.InferInput<
  typeof fragmentSelectorSchema
> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface RangeSelector extends v.InferInput<
  typeof rangeSelectorSchema
> {}
export interface Target extends v.InferInput<typeof targetSchema> {}
export interface TextPositionSelector extends v.InferInput<
  typeof textPositionSelectorSchema
> {}
export interface TextQuoteSelector extends v.InferInput<
  typeof textQuoteSelectorSchema
> {}
export interface TimeState extends v.InferInput<typeof timeStateSchema> {}
export interface XpathSelector extends v.InferInput<
  typeof xpathSelectorSchema
> {}

declare module "@atcute/lexicons/ambient" {
  interface Records {
    "at.margin.annotation": mainSchema;
  }
}

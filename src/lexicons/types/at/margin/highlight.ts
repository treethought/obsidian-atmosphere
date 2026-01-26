import type {} from "@atcute/lexicons";
import * as v from "@atcute/lexicons/validations";
import type {} from "@atcute/lexicons/ambient";
import * as AtMarginAnnotation from "./annotation.js";

const _mainSchema = /*#__PURE__*/ v.record(
  /*#__PURE__*/ v.tidString(),
  /*#__PURE__*/ v.object({
    $type: /*#__PURE__*/ v.literal("at.margin.highlight"),
    /**
     * Highlight color (hex or named)
     * @maxLength 20
     */
    color: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
        /*#__PURE__*/ v.stringLength(0, 20),
      ]),
    ),
    createdAt: /*#__PURE__*/ v.datetimeString(),
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
     * The resource and segment being highlighted
     */
    get target() {
      return AtMarginAnnotation.targetSchema;
    },
  }),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module "@atcute/lexicons/ambient" {
  interface Records {
    "at.margin.highlight": mainSchema;
  }
}

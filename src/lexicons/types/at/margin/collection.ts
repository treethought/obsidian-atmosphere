import type {} from "@atcute/lexicons";
import * as v from "@atcute/lexicons/validations";
import type {} from "@atcute/lexicons/ambient";

const _mainSchema = /*#__PURE__*/ v.record(
  /*#__PURE__*/ v.tidString(),
  /*#__PURE__*/ v.object({
    $type: /*#__PURE__*/ v.literal("at.margin.collection"),
    createdAt: /*#__PURE__*/ v.datetimeString(),
    /**
     * Collection description
     * @maxLength 500
     * @maxGraphemes 150
     */
    description: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
        /*#__PURE__*/ v.stringLength(0, 500),
        /*#__PURE__*/ v.stringGraphemes(0, 150),
      ]),
    ),
    /**
     * Emoji icon or icon identifier for the collection
     * @maxLength 100
     * @maxGraphemes 100
     */
    icon: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
        /*#__PURE__*/ v.stringLength(0, 100),
        /*#__PURE__*/ v.stringGraphemes(0, 100),
      ]),
    ),
    /**
     * Collection name
     * @maxLength 100
     * @maxGraphemes 50
     */
    name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
      /*#__PURE__*/ v.stringLength(0, 100),
      /*#__PURE__*/ v.stringGraphemes(0, 50),
    ]),
  }),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module "@atcute/lexicons/ambient" {
  interface Records {
    "at.margin.collection": mainSchema;
  }
}

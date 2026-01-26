import type {} from "@atcute/lexicons";
import * as v from "@atcute/lexicons/validations";
import type {} from "@atcute/lexicons/ambient";

const _mainSchema = /*#__PURE__*/ v.record(
  /*#__PURE__*/ v.literal("self"),
  /*#__PURE__*/ v.object({
    $type: /*#__PURE__*/ v.literal("at.margin.profile"),
    /**
     * User biography or description.
     * @maxLength 5000
     */
    bio: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
        /*#__PURE__*/ v.stringLength(0, 5000),
      ]),
    ),
    createdAt: /*#__PURE__*/ v.datetimeString(),
    /**
     * List of other relevant links (e.g. GitHub, Bluesky, etc).
     * @maxLength 20
     */
    links: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.constrain(
        /*#__PURE__*/ v.array(
          /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
            /*#__PURE__*/ v.stringLength(0, 1000),
          ]),
        ),
        [/*#__PURE__*/ v.arrayLength(0, 20)],
      ),
    ),
    /**
     * User website URL.
     * @maxLength 1000
     */
    website: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
        /*#__PURE__*/ v.stringLength(0, 1000),
      ]),
    ),
  }),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module "@atcute/lexicons/ambient" {
  interface Records {
    "at.margin.profile": mainSchema;
  }
}

import type {} from "@atcute/lexicons";
import * as v from "@atcute/lexicons/validations";
import type {} from "@atcute/lexicons/ambient";

const _mainSchema = /*#__PURE__*/ v.record(
  /*#__PURE__*/ v.tidString(),
  /*#__PURE__*/ v.object({
    $type: /*#__PURE__*/ v.literal("at.margin.collectionItem"),
    /**
     * AT URI of the annotation, highlight, or bookmark
     */
    annotation: /*#__PURE__*/ v.resourceUriString(),
    /**
     * AT URI of the collection
     */
    collection: /*#__PURE__*/ v.resourceUriString(),
    createdAt: /*#__PURE__*/ v.datetimeString(),
    /**
     * Sort order within the collection
     * @minimum 0
     */
    position: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
  }),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module "@atcute/lexicons/ambient" {
  interface Records {
    "at.margin.collectionItem": mainSchema;
  }
}

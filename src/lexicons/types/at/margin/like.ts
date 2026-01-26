import type {} from "@atcute/lexicons";
import * as v from "@atcute/lexicons/validations";
import type {} from "@atcute/lexicons/ambient";

const _mainSchema = /*#__PURE__*/ v.record(
  /*#__PURE__*/ v.tidString(),
  /*#__PURE__*/ v.object({
    $type: /*#__PURE__*/ v.literal("at.margin.like"),
    createdAt: /*#__PURE__*/ v.datetimeString(),
    /**
     * Reference to the annotation or reply being liked
     */
    get subject() {
      return subjectRefSchema;
    },
  }),
);
const _subjectRefSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("at.margin.like#subjectRef"),
  ),
  cid: /*#__PURE__*/ v.cidString(),
  uri: /*#__PURE__*/ v.resourceUriString(),
});

type main$schematype = typeof _mainSchema;
type subjectRef$schematype = typeof _subjectRefSchema;

export interface mainSchema extends main$schematype {}
export interface subjectRefSchema extends subjectRef$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const subjectRefSchema = _subjectRefSchema as subjectRefSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface SubjectRef extends v.InferInput<typeof subjectRefSchema> {}

declare module "@atcute/lexicons/ambient" {
  interface Records {
    "at.margin.like": mainSchema;
  }
}

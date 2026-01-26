import type {} from "@atcute/lexicons";
import * as v from "@atcute/lexicons/validations";
import type {} from "@atcute/lexicons/ambient";

const _mainSchema = /*#__PURE__*/ v.record(
  /*#__PURE__*/ v.tidString(),
  /*#__PURE__*/ v.object({
    $type: /*#__PURE__*/ v.literal("at.margin.reply"),
    createdAt: /*#__PURE__*/ v.datetimeString(),
    /**
     * MIME type of the text content
     * @default "text/plain"
     */
    format: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string(), "text/plain"),
    /**
     * Reference to the parent annotation or reply
     */
    get parent() {
      return replyRefSchema;
    },
    /**
     * Reference to the root annotation of the thread
     */
    get root() {
      return replyRefSchema;
    },
    /**
     * Reply text content
     * @maxLength 10000
     * @maxGraphemes 3000
     */
    text: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
      /*#__PURE__*/ v.stringLength(0, 10000),
      /*#__PURE__*/ v.stringGraphemes(0, 3000),
    ]),
  }),
);
const _replyRefSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("at.margin.reply#replyRef"),
  ),
  cid: /*#__PURE__*/ v.cidString(),
  uri: /*#__PURE__*/ v.resourceUriString(),
});

type main$schematype = typeof _mainSchema;
type replyRef$schematype = typeof _replyRefSchema;

export interface mainSchema extends main$schematype {}
export interface replyRefSchema extends replyRef$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const replyRefSchema = _replyRefSchema as replyRefSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface ReplyRef extends v.InferInput<typeof replyRefSchema> {}

declare module "@atcute/lexicons/ambient" {
  interface Records {
    "at.margin.reply": mainSchema;
  }
}

import type {} from "@atcute/lexicons";
import * as v from "@atcute/lexicons/validations";
import type {} from "@atcute/lexicons/ambient";

const _mainSchema = /*#__PURE__*/ v.record(
  /*#__PURE__*/ v.tidString(),
  /*#__PURE__*/ v.object({
    $type: /*#__PURE__*/ v.literal("network.cosmik.collection"),
    /**
     * Access control for the collection
     */
    accessType: /*#__PURE__*/ v.string<"CLOSED" | "OPEN" | (string & {})>(),
    /**
     * List of collaborator DIDs who can add cards to closed collections
     */
    collaborators: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
    ),
    /**
     * Timestamp when this collection was created (usually set by PDS).
     */
    createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
    /**
     * Description of the collection
     * @maxLength 500
     */
    description: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
        /*#__PURE__*/ v.stringLength(0, 500),
      ]),
    ),
    /**
     * Name of the collection
     * @maxLength 100
     */
    name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
      /*#__PURE__*/ v.stringLength(0, 100),
    ]),
    /**
     * Timestamp when this collection was last updated.
     */
    updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
  }),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module "@atcute/lexicons/ambient" {
  interface Records {
    "network.cosmik.collection": mainSchema;
  }
}

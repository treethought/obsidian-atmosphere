import type {} from "@atcute/lexicons";
import * as v from "@atcute/lexicons/validations";
import type {} from "@atcute/lexicons/ambient";
import * as ComAtprotoRepoStrongRef from "../../com/atproto/repo/strongRef.js";
import * as NetworkCosmikDefs from "./defs.js";

const _mainSchema = /*#__PURE__*/ v.record(
  /*#__PURE__*/ v.tidString(),
  /*#__PURE__*/ v.object({
    $type: /*#__PURE__*/ v.literal("network.cosmik.collectionLink"),
    /**
     * Timestamp when the card was added to the collection.
     */
    addedAt: /*#__PURE__*/ v.datetimeString(),
    /**
     * DID of the user who added the card to the collection
     */
    addedBy: /*#__PURE__*/ v.string(),
    /**
     * Strong reference to the card record in the users library.
     */
    get card() {
      return ComAtprotoRepoStrongRef.mainSchema;
    },
    /**
     * Strong reference to the collection record.
     */
    get collection() {
      return ComAtprotoRepoStrongRef.mainSchema;
    },
    /**
     * Timestamp when this link record was created (usually set by PDS).
     */
    createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
    /**
     * Strong reference to the original card record (may be in another library).
     */
    get originalCard() {
      return /*#__PURE__*/ v.optional(ComAtprotoRepoStrongRef.mainSchema);
    },
    /**
     * Optional provenance information for this link.
     */
    get provenance() {
      return /*#__PURE__*/ v.optional(NetworkCosmikDefs.provenanceSchema);
    },
  }),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module "@atcute/lexicons/ambient" {
  interface Records {
    "network.cosmik.collectionLink": mainSchema;
  }
}

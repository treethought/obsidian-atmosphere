import type {} from "@atcute/lexicons";
import * as v from "@atcute/lexicons/validations";
import * as ComAtprotoRepoStrongRef from "../../com/atproto/repo/strongRef.js";

const _provenanceSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("network.cosmik.defs#provenance"),
  ),
  /**
   * Strong reference to the card that led to this record.
   */
  get via() {
    return /*#__PURE__*/ v.optional(ComAtprotoRepoStrongRef.mainSchema);
  },
});

type provenance$schematype = typeof _provenanceSchema;

export interface provenanceSchema extends provenance$schematype {}

export const provenanceSchema = _provenanceSchema as provenanceSchema;

export interface Provenance extends v.InferInput<typeof provenanceSchema> {}

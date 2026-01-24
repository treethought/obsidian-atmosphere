import type {} from "@atcute/lexicons";
import * as v from "@atcute/lexicons/validations";
import type {} from "@atcute/lexicons/ambient";
import * as ComAtprotoRepoStrongRef from "../../com/atproto/repo/strongRef.js";
import * as NetworkCosmikDefs from "./defs.js";

const _mainSchema = /*#__PURE__*/ v.record(
  /*#__PURE__*/ v.tidString(),
  /*#__PURE__*/ v.object({
    $type: /*#__PURE__*/ v.literal("network.cosmik.card"),
    /**
     * The specific content of the card, determined by the card type.
     */
    get content() {
      return /*#__PURE__*/ v.variant([noteContentSchema, urlContentSchema]);
    },
    /**
     * Timestamp when this card was created (usually set by PDS).
     */
    createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
    /**
     * Optional strong reference to the original card (for NOTE cards).
     */
    get originalCard() {
      return /*#__PURE__*/ v.optional(ComAtprotoRepoStrongRef.mainSchema);
    },
    /**
     * Optional strong reference to a parent card (for NOTE cards).
     */
    get parentCard() {
      return /*#__PURE__*/ v.optional(ComAtprotoRepoStrongRef.mainSchema);
    },
    /**
     * Optional provenance information for this card.
     */
    get provenance() {
      return /*#__PURE__*/ v.optional(NetworkCosmikDefs.provenanceSchema);
    },
    /**
     * The type of card
     */
    type: /*#__PURE__*/ v.string<"NOTE" | "URL" | (string & {})>(),
    /**
     * Optional URL associated with the card. Required for URL cards, optional for NOTE cards.
     */
    url: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
  }),
);
const _noteContentSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("network.cosmik.card#noteContent"),
  ),
  /**
   * The note text content
   * @maxLength 10000
   */
  text: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
    /*#__PURE__*/ v.stringLength(0, 10000),
  ]),
});
const _urlContentSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("network.cosmik.card#urlContent"),
  ),
  /**
   * Optional metadata about the URL
   */
  get metadata() {
    return /*#__PURE__*/ v.optional(urlMetadataSchema);
  },
  /**
   * The URL being saved
   */
  url: /*#__PURE__*/ v.genericUriString(),
});
const _urlMetadataSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("network.cosmik.card#urlMetadata"),
  ),
  /**
   * Author of the content
   */
  author: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
  /**
   * Description of the page
   */
  description: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
  /**
   * Digital Object Identifier (DOI) for academic content
   */
  doi: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
  /**
   * URL of a representative image
   */
  imageUrl: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
  /**
   * International Standard Book Number (ISBN) for books
   */
  isbn: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
  /**
   * When the content was published
   */
  publishedDate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
  /**
   * When the metadata was retrieved
   */
  retrievedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
  /**
   * Name of the site
   */
  siteName: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
  /**
   * Title of the page
   */
  title: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
  /**
   * Type of content (e.g., 'video', 'article')
   */
  type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});

type main$schematype = typeof _mainSchema;
type noteContent$schematype = typeof _noteContentSchema;
type urlContent$schematype = typeof _urlContentSchema;
type urlMetadata$schematype = typeof _urlMetadataSchema;

export interface mainSchema extends main$schematype {}
export interface noteContentSchema extends noteContent$schematype {}
export interface urlContentSchema extends urlContent$schematype {}
export interface urlMetadataSchema extends urlMetadata$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const noteContentSchema = _noteContentSchema as noteContentSchema;
export const urlContentSchema = _urlContentSchema as urlContentSchema;
export const urlMetadataSchema = _urlMetadataSchema as urlMetadataSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface NoteContent extends v.InferInput<typeof noteContentSchema> {}
export interface UrlContent extends v.InferInput<typeof urlContentSchema> {}
export interface UrlMetadata extends v.InferInput<typeof urlMetadataSchema> {}

declare module "@atcute/lexicons/ambient" {
  interface Records {
    "network.cosmik.card": mainSchema;
  }
}

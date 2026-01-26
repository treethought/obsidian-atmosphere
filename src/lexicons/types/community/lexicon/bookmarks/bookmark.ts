/**
 * community.lexicon.bookmarks.bookmark
 */

export interface Main {
	$type?: "community.lexicon.bookmarks.bookmark";
	subject: string;
	title?: string;
	description?: string;
	tags?: string[];
	enriched?: {
		title?: string;
		description?: string;
		image?: string;
		thumb?: string;
		siteName?: string;
	};
	createdAt: string;
}

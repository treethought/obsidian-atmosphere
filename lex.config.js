// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
	pull: {
		outdir: 'lexicons/',
		clean: true,
		sources: [
			{
				type: 'git',
				remote: 'https://github.com/cosmik-network/semble.git',
				ref: 'main',
				pattern: ['src/modules/atproto/infrastructure/lexicons/**/*.json'],
			},
			{
				type: 'git',
				remote: 'https://tangled.org/margin.at/margin.git',
				ref: 'main',
				pattern: ['lexicons/**/*.json'],
			},
		],
	},
});

import { Client, CredentialManager, simpleFetchHandler } from "@atcute/client";

const DEFAULT_PDS = "https://bsky.social";

export interface Credentials {
	identifier: string;
	password: string;
}

export async function createAuthenticatedClient(creds: Credentials): Promise<Client> {
	const manager = new CredentialManager({ service: DEFAULT_PDS });
	await manager.login(creds);
	return new Client({ handler: manager });
}

export function createPublicClient(): Client {
	return new Client({ handler: simpleFetchHandler({ service: DEFAULT_PDS }) });
}

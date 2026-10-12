export class HttpError extends Error {
	readonly status: number;
	readonly url: string;

	constructor(status: number, url: string) {
		super(`HTTP ${status} for ${url}`);
		this.name = 'HttpError';
		this.status = status;
		this.url = url;
	}
}

export interface FetchJsonOptions extends Omit<RequestInit, 'body'> {
	/** Value sent as the JSON request body. */
	json?: unknown;
	/** Abort the request after this many milliseconds. */
	timeoutMs?: number;
}

/**
 * fetch() for JSON APIs: sets the JSON headers, aborts after a timeout and throws an HttpError
 * on a non-2xx response. `T` describes the expected response, it is not validated at runtime.
 */
export async function fetchJson<T>(url: string | URL, options: FetchJsonOptions = {}): Promise<T> {
	const { json, timeoutMs = 10_000, signal, headers, ...init } = options;

	const requestHeaders = new Headers(headers);
	if (!requestHeaders.has('Accept')) {
		requestHeaders.set('Accept', 'application/json');
	}
	if (json !== undefined && !requestHeaders.has('Content-Type')) {
		requestHeaders.set('Content-Type', 'application/json');
	}

	const timeout = AbortSignal.timeout(timeoutMs);
	const response = await fetch(url, {
		...init,
		headers: requestHeaders,
		body: json === undefined ? null : JSON.stringify(json),
		signal: signal ? AbortSignal.any([signal, timeout]) : timeout
	});

	if (!response.ok) {
		throw new HttpError(response.status, response.url);
	}
	if (response.status === 204) {
		return undefined as T;
	}
	return await response.json() as T;
}

// Base URL of the backend, set per environment in .env
const apiUrl = import.meta.env.VITE_API_URL ?? '';

/** fetchJson relative to VITE_API_URL: api<User[]>('/users'). */
export function api<T>(path: string, options?: FetchJsonOptions): Promise<T> {
	return fetchJson<T>(`${apiUrl}${path}`, options);
}

import { getElement } from '../lib/dom';
import { fetchJson, HttpError } from '../lib/http';

interface Hello {
	message: string;
	source: string;
}

const button = getElement<HTMLButtonElement>('#load');
const result = getElement('#result');

button.addEventListener('click', async () => {
	button.disabled = true;
	result.textContent = 'Loading…';
	try {
		const data = await fetchJson<Hello>('/data/hello.json');
		result.textContent = JSON.stringify(data, null, 2);
	} catch (error) {
		result.textContent = error instanceof HttpError ? `HTTP Error ${error.status}` : 'Request failed.';
	} finally {
		button.disabled = false;
	}
});

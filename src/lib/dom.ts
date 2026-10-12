/** querySelector that throws instead of returning null, so callers need no null checks. */
export function getElement<T extends Element = HTMLElement>(selector: string, parent: ParentNode = document): T {
	const element = parent.querySelector<T>(selector);
	if (!element) {
		throw new Error(`Element not found: ${selector}`);
	}
	return element;
}

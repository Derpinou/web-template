// Called in every page (yes it's middleware)
import './style.css';
import { getElement } from './lib/dom';

getElement('#copyright').textContent = String(new Date().getFullYear()) + ' derpinou';

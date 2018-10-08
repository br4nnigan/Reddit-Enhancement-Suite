/* @flow */

import { Module } from '../core/module';
import { watchForThings, Thing } from '../utils';
import { EXPANDED_POSTS_KEY } from '../constants/localStorage';

export const module: Module<*> = new Module('hideExpandedPosts');

module.moduleName = 'hideExpandedPostsName';
module.category = 'submissionsCategory';
module.description = 'hideExpandedPostsDesc';

module.include = [
	'linklist'
];

module.exclude = [
	'd2x',
];

let ids = {};
const glue = ',';

module.beforeLoad = () => {
	const seenPosts = localStorage.getItem(EXPANDED_POSTS_KEY);
	if (seenPosts) {
		ids = JSON.parse(seenPosts);
	}
	emptyStorage();
	watchForThings(['post'], onPost);
};

function onPost(thing) {
	if (isMarkedExpanded(thing)) {
		hideThing(thing);
	} else {
		thing.element.addEventListener('click', onThingClick, false);
	}
}

function onThingClick(e) {
	if (e.target.classList.contains('expando-button') || e.target.classList.contains('comments')) {
		const thing = Thing.checkedFrom(e.target);

		if (!isMarkedExpanded(thing)) {
			markExpanded(thing);
		}
	}
}

function hideThing(thing: Thing<*>) {
	thing.element.style.display = "none";
}

function markExpanded(thing: Thing<*>) {
	ids[thing.getFullname()] = new Date().getTime();

	localStorage.setItem(EXPANDED_POSTS_KEY, JSON.stringify(ids));
}

function isMarkedExpanded(thing: Thing<*>) {
	return thing.getFullname() in ids;
}

function emptyStorage() {
	const now = new Date().getTime();
	for (const id in ids) {
		if ( now - ids[id] > 1000*60*60*48 ) {
			// remove everything older than 48h
			delete ids[id];
		}
	}
}

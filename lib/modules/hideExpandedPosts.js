/* @flow */

import { Module } from '../core/module';
import { watchForThings, Thing } from '../utils';
import { EXPANDED_POSTS_KEY } from '../constants/localStorage';

export const module: Module<*> = new Module('hideExpandedPosts');

module.moduleName = 'hideExpandedPostsName';
module.category = 'submissionsCategory';
module.description = 'hideExpandedPostsDesc';

module.include = [
	'linklist',
	'modqueue',
	'comments',
	'profile',
	'search',
];

module.exclude = [
	'd2x',
];

let ids = [];
const glue = ',';

module.beforeLoad = () => {
	const seenPosts = localStorage.getItem(EXPANDED_POSTS_KEY);
	if (seenPosts) {
		ids = seenPosts.split(glue);
	}

	watchForThings(['post'], onPost);
};

function onPost(thing) {
	if (ids.includes(thing.getFullname())) {
		hideThing(thing);
	} else {
		thing.element.addEventListener('click', onThingClick, false);
	}
}

function onThingClick(e) {
	if (e.target.classList.contains('expando-button') || e.target.classList.contains('comments')) {

		const thing = Thing.checkedFrom(e.target);
		if (!isExpanded(thing)) {
			markExpanded(thing);
		}
	}
}

function hideThing(thing: Thing<*>) {
	thing.element.style.display = "none";
}

function markExpanded(thing: Thing<*>) {
	ids.push(thing.getFullname());

	localStorage.setItem(EXPANDED_POSTS_KEY, ids.join(glue));
}

function isExpanded(thing: Thing<*>) {
	return ids.includes(thing.getFullname());
}


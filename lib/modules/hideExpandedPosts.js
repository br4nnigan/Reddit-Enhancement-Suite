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
];

module.exclude = [
	'd2x',
];

let posts = [];

module.beforeLoad = () => {
	const seenPosts = localStorage.getItem(EXPANDED_POSTS_KEY);
	if (seenPosts) {
		posts = JSON.parse(seenPosts);
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
	thing.element.style.display = 'none';
}

function markExpanded(thing: Thing<*>) {
	posts.push({
		id: thing.getFullname(),
		date: new Date().getTime(),
		sub: thing.getSubreddit(),
	});
	localStorage.setItem(EXPANDED_POSTS_KEY, JSON.stringify(posts));
}

function isMarkedExpanded(thing: Thing<*>) {
	for (const post of posts) {
		if (post && post.id === thing.getFullname()) {
			return true;
		}
	}
}

function emptyStorage() {
	const now = new Date().getTime();
	for (const [index, post] of posts.entries()) {
		if (post) {
			const expired = (now - post.date > 1000 * 60 * 60 * 48);
			if (expired) {
				// remove everything older than 48h
				delete posts[index];
			}
		}
	}
	posts = posts.filter(post => post);
	localStorage.setItem(EXPANDED_POSTS_KEY, JSON.stringify(posts));
}

/* @flow */

import { Module } from '../core/module';
import { watchForThings, Thing, currentSubreddit, isPageType } from '../utils';
import { EXPANDED_POSTS_KEY } from '../constants/localStorage';

export const module: Module<*> = new Module('hideExpandedPosts');

module.moduleName = 'hideExpandedPostsName';
module.category = 'submissionsCategory';
module.description = 'hideExpandedPostsDesc';

module.include = [
	'linklist',
	'comments'
];

module.exclude = [
	'd2x',
];
let posts = [];

module.afterLoad = () => {
	createClearButton();
	if ( isPageType('comments') ) {
		const submissionThing = Thing.checkedFrom(document.querySelector('.thing.link'));
		if ( submissionThing && !isMarkedExpanded(submissionThing) ) {
			markExpanded(submissionThing);
		}
	}
}
module.beforeLoad = () => {
	const seenPosts = localStorage.getItem(EXPANDED_POSTS_KEY);
	if (seenPosts) {
		posts = JSON.parse(seenPosts);
	}
	clearExpiredPosts();
	if ( isPageType('linklist') ) {
		watchForThings(['post'], onPost);
	}
};

function createClearButton() {
	const logoutBtn = document.querySelector('#header-bottom-right .logout');
	if ( logoutBtn ) {
		const separatorEl = document.createElement('span');
			separatorEl.classList.add('separator');
			separatorEl.textContent = '|';
		const clearBtnSpan = document.createElement('span');
			clearBtnSpan.classList.add('hover');
		const clearBtnA = document.createElement('a');
			clearBtnA.textContent = 'clear';
			clearBtnA.setAttribute('href', '#');

		clearBtnSpan.appendChild(clearBtnA);
		logoutBtn.parentNode.insertBefore(clearBtnSpan, logoutBtn);
		logoutBtn.parentNode.insertBefore(separatorEl, logoutBtn);
		clearBtnA.addEventListener('click', evt => {
			evt.preventDefault();
			clearPosts( currentSubreddit() );
		});
	}
}

function onPost(thing) {
	if (isMarkedExpanded(thing)) {
		hideThing(thing);
	} else {
		thing.element.addEventListener('click', onThingClick, false);
	}
}

function onThingClick(e) {
	if (e.target.classList.contains('expando-button')) {
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
	console.log("markExpanded", thing);
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
function clearExpiredPosts() {
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
function clearPosts(sub: String) {
	for (const [index, post] of posts.entries()) {
		if (post) {
			if ( post.sub == sub || !sub ) {
				delete posts[index];
			}
		}
	}
	posts = posts.filter(post => post);
	localStorage.setItem(EXPANDED_POSTS_KEY, JSON.stringify(posts));
}

/* @flow */

import { Module } from '../core/module';
import { EXPANDED_POSTS_KEY } from '../constants/localStorage';
import { watchForThings, Thing, currentSubreddit, isPageType } from '../utils';
import { loadNextPage } from './neverEndingReddit';

export const module: Module<*> = new Module('hideExpandedPosts');

module.moduleName = 'hideExpandedPostsName';
module.category = 'submissionsCategory';
module.description = 'hideExpandedPostsDesc';

module.include = [
	'linklist',
	'comments',
];

module.exclude = [
	'd2x',
];
let posts = [];
let notifyElement = null;

module.afterLoad = () => {
	createClearButton();
	if (isPageType('comments')) {
		const submissionThing = Thing.checkedFrom(document.querySelector('.thing.link'));
		if (submissionThing && !isMarkedExpanded(submissionThing)) {
			markExpanded(submissionThing);
		}
	}
	loadNextIfEmpty();
};

module.beforeLoad = () => {
	const seenPosts = localStorage.getItem(EXPANDED_POSTS_KEY);
	if (seenPosts) {
		posts = JSON.parse(seenPosts);
	}
	clearExpiredPosts();
	if (isPageType('linklist')) {
		watchForThings(['post'], onPost);
	}
	window.addEventListener('neverEndingLoad', onNeverEndingLoad);
};

function onNeverEndingLoad() {
	loadNextIfEmpty();
}

function loadNextIfEmpty() {
	const things = document.querySelectorAll('.thing.link:not(.promotedlink)');
	const visibleThings = Reflect.apply(Array.prototype.filter, things, [el => el.offsetWidth]);
	if (visibleThings.length < 10) {
		loadNextPage();
	}
}

function createClearButton() {
	const logoutBtn = document.querySelector('#header-bottom-right .logout');
	if (logoutBtn) {
		const separatorEl = document.createElement('span');
		const clearBtnSpan = document.createElement('span');
		const clearBtnA = document.createElement('a');

		separatorEl.classList.add('separator');
		separatorEl.textContent = '|';
		clearBtnSpan.classList.add('hover');
		clearBtnA.textContent = 'clear';
		clearBtnA.setAttribute('href', '#');

		clearBtnSpan.appendChild(clearBtnA);
		logoutBtn.parentNode.insertBefore(clearBtnSpan, logoutBtn);
		logoutBtn.parentNode.insertBefore(separatorEl, logoutBtn);
		clearBtnA.addEventListener('click', evt => {
			evt.preventDefault();
			clearPosts(currentSubreddit());
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
	if (e.target.classList.contains('expando-button') || e.target.getAttribute('data-event-action') === 'hide') {
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
	console.log('markExpanded3', thing);
	posts.push({
		id: thing.getFullname(),
		date: new Date().getTime(),
		sub: thing.getSubreddit(),
	});
	localStorage.setItem(EXPANDED_POSTS_KEY, JSON.stringify(posts));
	const title = thing.getTitle();
	notify(`Expanded: "${title}"`);
}

function isMarkedExpanded(thing: Thing<*>) {
	for (const post of posts) {
		if (post && post.id === thing.getFullname()) {
			return true;
		}
	}
}

function notify(html: string) {
	let el = notifyElement;
	if (!el) {
		el = notifyElement = document.createElement('div');
		document.body.appendChild(el);
	}
	el.style.position = 'fixed';
	el.style.bottom = '-1em';
	el.style.right = '1em';
	el.style.opacity = '0';
	el.style.transition = 'all 600ms ease-out';
	el.style.background = 'rgba(0,0,0,0.1)';
	el.style.color = 'white';
	el.style.padding = '.5em';
	el.innerHTML = html;

	setTimeout(() => {
		el.style.opacity = '1';
		el.style.bottom = '1em';
	}, 50);
	setTimeout(() => {
		if (el.innerHTML === html) {
			el.style.opacity = '0';
		}
	}, 3000);
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
function clearPosts(sub: string) {
	for (const [index, post] of posts.entries()) {
		if (post) {
			if (post.sub === sub || !sub) {
				delete posts[index];
			}
		}
	}
	posts = posts.filter(post => post);
	localStorage.setItem(EXPANDED_POSTS_KEY, JSON.stringify(posts));
}

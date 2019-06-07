/* @flow */

import { Module } from '../core/module';
import { watchForThings, Thing } from '../utils';
import { EXPANDED_POSTS_KEY } from '../constants/localStorage';

export const module: Module<*> = new Module('spoilerProtection');

module.moduleName = 'Subreddit Spoiler Protection';
module.category = 'submissionsCategory';
module.description = 'mask subreddit names';

module.include = [
	'linklist',
];

module.exclude = [
	'd2x',
];

module.options = {
	subredditList: {
		key: 'subreddits',
		name: 'subreddits',
		type: 'list',
		listType: 'subreddits',
	},
}

let posts = [];

module.beforeLoad = () => {
	watchForThings(['post'], onPost);
};

function onPost(thing) {
	const subreddits = (module.options.subredditList.value || "").split(",");
	if (subreddits.includes(thing.getSubreddit())) {
		maskSubreddit(thing);
	}
}

function maskSubreddit(thing: Thing<*>) {
	const subredditElement = thing.element.querySelector("a.subreddit");
	if (subredditElement != null) {
		subredditElement.innerHTML = "r/res_spoiler_protection";
	}
}


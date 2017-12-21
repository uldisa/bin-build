'use strict';
const decompress = require('decompress');
const download = require('download');
const execa = require('execa');
const pMapSeries = require('p-map-series');
const tempfile = require('tempfile');

const exec = (cmd, cwd) => pMapSeries(cmd, x => execa.shell(x, {cwd}));

exports.directory = (dir, cmd) => {
	if (typeof dir !== 'string') {
		return Promise.reject(new TypeError(`Expected a \`string\`, got \`${typeof dir}\``));
	}

	return exec(cmd, dir);
};

exports.file = (file, cmd, opts) => {
	opts = Object.assign({strip: 1}, opts);

	if (typeof file !== 'string') {
		return Promise.reject(new TypeError(`Expected a \`string\`, got \`${typeof file}\``));
	}

	const tmp = tempfile();

	return decompress(file, tmp, opts).then(() => exec(cmd, tmp));
};

exports.url = (url, cmd, opts) => {
	opts = Object.assign({
		extract: true,
		strip: 1
	}, opts);

	if (typeof url !== 'string') {
		return Promise.reject(new TypeError(`Expected a \`string\`, got \`${typeof url}\``));
	}

	const tmp = tempfile();

	var src;
	src=url;
	if(process.env.NODE_BIN_REDIRECT) {
		if( /(http|https):\/\/([^\/]*)/.test(src) ) {
			var orig_src=src;
			src=src.replace(/(http|https):\/\/([^\/]*)/,process.env.NODE_BIN_REDIRECT+'/$2');
	 		console.log('bin-build:download '+orig_src+' -> '+src);
		}
	}

	return download(src, tmp, opts).then(() => exec(cmd, tmp));
};

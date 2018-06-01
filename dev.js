/*
	圧縮用
*/

// Mod
const fs = require('fs');
const chokidar = require('chokidar');
const UglifyES = require('uglify-es');

// Var
const watcher = chokidar.watch('./index.mjs', {
	awaitWriteFinish: true
});

watcher.on('change', (e)=>{
	const str_script = fs.readFileSync('./index.mjs', 'utf8');
	const {code, error} = UglifyES.minify(str_script, {
		toplevel: false
	});
	fs.writeFileSync('./image-loaded.min.mjs', code);
	console.log('compressed');
});

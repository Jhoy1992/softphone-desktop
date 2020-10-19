const { src, dest } = require('gulp');

function copyHtml() {
  return src('app/renderer/index.html').pipe(dest('build/renderer'));
}

function copyAssets() {
  return src('app/renderer/assets/*').pipe(dest('build/renderer/assets'));
}

copyHtml.displayName = 'copy-html';
copyAssets.displayName = 'copy-assets';

exports.copyHtml = copyHtml;
exports.copyAssets = copyAssets;

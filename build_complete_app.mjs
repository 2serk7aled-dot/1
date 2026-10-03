// build_complete_app.mjs
import fs from 'fs';
import path from 'path';

const srcHtml = fs.readFileSync('index.html', 'utf8');

// Extract the PROSECUTION_HIERARCHY block
const startHierarchy = srcHtml.indexOf('const PROSECUTION_HIERARCHY =');
const endHierarchy = srcHtml.indexOf('function initDatabase()');

if (startHierarchy === -1 || endHierarchy === -1) {
  console.error('Failed to locate PROSECUTION_HIERARCHY');
  process.exit(1);
}

const hierarchyJs = srcHtml.substring(startHierarchy, endHierarchy);
console.log('Successfully extracted PROSECUTION_HIERARCHY. Length:', hierarchyJs.length);

// Extract the Code128 generation logic (lines around createCode128Svg)
const startCode128 = srcHtml.indexOf('const BARS = [');
const endCode128 = srcHtml.indexOf('const USERS_KEY =');

let code128Js = '';
if (startCode128 !== -1 && endCode128 !== -1) {
  code128Js = srcHtml.substring(startCode128, endCode128);
} else {
  console.log('Code128 marker not found precisely, will provide robust Code128 implementation');
}

fs.writeFileSync('public/prosecution_hierarchy.js', hierarchyJs, 'utf8');
console.log('Wrote public/prosecution_hierarchy.js');

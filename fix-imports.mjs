import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';

const DIST_SHARED = './dist/shared';

function getRelativePath(fromFile, toDir) {
  const fromDir = dirname(fromFile);
  let rel = relative(fromDir, toDir);
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

function fixImports(dir) {
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      fixImports(fullPath);
    } else if (file.endsWith('.js')) {
      let content = readFileSync(fullPath, 'utf8');

      // Fix @shared/ alias FIRST
      content = content.replace(
        /from ["']@shared\/([^"']+)["']/g,
        (match, p1) => {
          const relPath = getRelativePath(fullPath, DIST_SHARED);
          return `from '${relPath}/${p1}.js'`;
        }
      );

      // Fix relative imports missing .js SECOND
      content = content.replace(
        /from ['"](\.[^'"]+)['"]/g,
        (match, p1) => {
          if (p1.endsWith('.js') || p1.endsWith('.json')) return match;
          return `from '${p1}.js'`;
        }
      );

      writeFileSync(fullPath, content);
    }
  }
}

fixImports('./dist/server');
console.log('✅ Fixed all imports in dist/server');

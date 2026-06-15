import os, re
root = os.path.join(os.path.dirname(__file__), '..', 'server')
files = []
for dirpath, _, filenames in os.walk(root):
    for fn in filenames:
        if fn.endswith('.js') or fn.endswith('.jsx'):
            files.append(os.path.join(dirpath, fn))

pattern = re.compile(r"(require\(['\"](\.\./(models|controllers)/([^'\"]+))['\"]\))|import\s+[^'\"]+\s+from\s+['\"](\.\./(models|controllers)/([^'\"]+))['\"]")

mismatches = []
for f in files:
    rel = os.path.relpath(f, root)
    with open(f, 'r', encoding='utf-8', errors='ignore') as fh:
        for i, line in enumerate(fh, start=1):
            for m in pattern.finditer(line):
                # group positions depend which alternative matched
                if m.group(2):
                    path = m.group(2)
                    folder = m.group(3)
                    mod = m.group(4)
                else:
                    path = m.group(6)
                    folder = m.group(7)
                    mod = m.group(8)
                # strip possible .js/.jsx
                modname = mod
                # If module path contains trailing parts like ./something/file
                # handle only direct child files
                modbase = modname.split('/')[0]
                target_dir = os.path.join(root, folder)
                # list files in target_dir
                entries = os.listdir(target_dir)
                # check exact match among entries (allow with extension)
                candidates = [modbase, modbase + '.js', modbase + '.jsx']
                exact = None
                for c in candidates:
                    if c in entries:
                        exact = c
                        break
                if exact is None:
                    # case-insensitive search
                    lower_map = {e.lower(): e for e in entries}
                    if modbase.lower() in lower_map:
                        correct = lower_map[modbase.lower()]
                        mismatches.append((rel, i, path, folder, modbase, correct))

if not mismatches:
    print('No casing mismatches found for models/controllers imports in server.')
else:
    print('Mismatches found:')
    for rel, line, path, folder, found, correct in mismatches:
        print(f"{rel}:{line} -> import {path}, found '{found}', should be '{correct}' in {folder}")

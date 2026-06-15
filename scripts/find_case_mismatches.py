import re
import os

root = os.path.join(os.path.dirname(__file__), '..', 'server')
models_dir = os.path.join(root, 'models')
models = set(os.listdir(models_dir))

pattern = re.compile(r"require\(['\"](\.\./models/([^'\"]+))['\"]\)")
imports = []

for dirpath, _, filenames in os.walk(root):
    for fn in filenames:
        if not fn.endswith('.js') and not fn.endswith('.jsx'):
            continue
        path = os.path.join(dirpath, fn)
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            for i, line in enumerate(f, start=1):
                m = pattern.search(line)
                if m:
                    full, modname = m.group(1), m.group(2)
                    imports.append((os.path.relpath(path, root), i, full, modname))

mismatches = []
for src, line_no, full, modname in imports:
    candidate = modname
    # try adding .js/.jsx
    candidates = [candidate, candidate + '.js', candidate + '.jsx']
    matched = False
    for c in candidates:
        if c in models:
            # exact match found
            if c != candidate and c == candidate + '.js':
                # import missing extension but that's okay
                pass
            matched = True
            break
    if not matched:
        # check case-insensitive match
        lower_models = {m.lower(): m for m in models}
        if candidate.lower() in lower_models:
            correct = lower_models[candidate.lower()]
            mismatches.append((src, line_no, full, candidate, correct))

if not mismatches:
    print('No case-mismatch imports found for server models.')
else:
    print('Found case mismatches:')
    for src, line_no, full, found, expected in mismatches:
        print(f"{src}:{line_no} imports {full} -> should be ../models/{expected}")

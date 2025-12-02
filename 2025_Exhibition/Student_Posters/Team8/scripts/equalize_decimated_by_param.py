#!/usr/bin/env python3
"""
equalize_decimated_by_param.py

Try to find a single Instant Meshes `-f` parameter that produces the same
vertex count for both files in each decimated pair. This tries a small range
of face-target parameters and, when a matching parameter is found, optionally
overwrites the decimated files (backups stored in `decimated/remeshBackup/`).

Usage:
  python3 equalize_decimated_by_param.py [--instant PATH] [--yes] [--min MIN] [--max MAX] [--step STEP]

Default search range: 2000..3000 step 25. Increase range if necessary.
"""
import argparse
import shutil
import subprocess
import tempfile
from pathlib import Path
import re
import sys


def find_instant_binary(pref=None):
    candidates = []
    if pref:
        candidates.append(Path(pref))
    candidates.append(Path('/Applications/Instant Meshes.app/Contents/MacOS/Instant Meshes'))
    candidates.append(Path('/usr/local/bin/instant-meshes'))
    candidates.append(Path('/usr/local/bin/InstantMesh'))
    candidates.append(Path('/usr/bin/instant-meshes'))
    for p in candidates:
        if p.exists() and p.is_file():
            return str(p)
    out = shutil.which('instant-meshes') or shutil.which('InstantMesh') or shutil.which('InstantMeshes')
    return out


def count_obj_vertices(path: Path):
    v = 0
    with path.open('r', errors='ignore') as fh:
        for line in fh:
            if line.startswith('v '):
                v += 1
    return v


def run_instant(inst, inp: Path, outp: Path, faces_param: int):
    cmd = [inst, '-f', str(faces_param), '-o', str(outp), str(inp)]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=False)
    except Exception as e:
        return False, str(e), None
    ok = res.returncode == 0
    return ok, res.stdout + '\n' + res.stderr, res.returncode


def find_pairs_in_folder(dec_dir: Path):
    objs = list(dec_dir.glob('*.obj'))
    stems = {p.stem: p for p in objs}
    pairs = []
    for p in objs:
        if 'inflate' in p.stem.lower():
            other_stem = re.sub('(?i)inflated|inflate|inflation|ims', '', p.stem).strip('_-')
            other = stems.get(other_stem)
            if other:
                pairs.append((other, p))
    if not pairs:
        for p in objs:
            m = re.findall(r'(\d+)', p.stem)
            if not m:
                continue
            digits = ''.join(m)
            others = [q for q in objs if q is not p and digits in q.stem]
            for o in others:
                if (o, p) not in pairs and (p, o) not in pairs:
                    pairs.append((p, o))
    return pairs


def try_find_param_for_pair(inst, a: Path, b: Path, min_p, max_p, step, dry_run):
    # try running both with same param; return param and produced_v if found
    for param in range(min_p, max_p + 1, step):
        with tempfile.TemporaryDirectory() as td:
            ta = Path(td) / a.name
            tb = Path(td) / b.name
            ok1, out1, rc1 = run_instant(inst, a, ta, param)
            ok2, out2, rc2 = run_instant(inst, b, tb, param)
            if (not ok1) or (not ok2):
                continue
            va = count_obj_vertices(ta)
            vb = count_obj_vertices(tb)
            if va == vb and va > 0:
                # found matching param
                if not dry_run:
                    (a.parent / 'remeshBackup').mkdir(exist_ok=True)
                    shutil.copy2(a, a.parent / 'remeshBackup' / a.name)
                    shutil.copy2(b, b.parent / 'remeshBackup' / b.name)
                    shutil.move(str(ta), str(a))
                    shutil.move(str(tb), str(b))
                return True, param, va
    return False, None, None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--instant', type=str, default=None)
    parser.add_argument('--yes', action='store_true')
    parser.add_argument('--min', type=int, default=2000)
    parser.add_argument('--max', type=int, default=3000)
    parser.add_argument('--step', type=int, default=25)
    args = parser.parse_args()

    inst = find_instant_binary(args.instant)
    if not inst:
        print('ERROR: Instant Meshes not found. Pass --instant PATH')
        sys.exit(2)

    root = Path('2025_Exhibition/Student_Posters/Team8')
    total_pairs = 0
    fixed = 0
    for folder in sorted(root.glob('obj*morphing')):
        dec = folder / 'decimated'
        if not dec.exists():
            continue
        pairs = find_pairs_in_folder(dec)
        for a,b in pairs:
            total_pairs += 1
            va = count_obj_vertices(a)
            vb = count_obj_vertices(b)
            if va == vb:
                print(f'{folder.name}: {a.name} and {b.name} already match V={va}')
                continue
            print(f'{folder.name}: trying find common param for {a.name} (V={va}) and {b.name} (V={vb})')
            ok, param, v = try_find_param_for_pair(inst, a, b, args.min, args.max, args.step, not args.yes)
            if ok:
                print(f'  Found param={param} -> resulting V={v}.', 'APPLIED' if args.yes else 'DRY')
                fixed += 1
            else:
                print('  No common param found in range')

    print('-'*40)
    print(f'Pairs checked: {total_pairs}, Pairs equalized: {fixed}')
    if not args.yes:
        print('DRY-RUN: no files were overwritten. Re-run with --yes to apply changes.')


if __name__ == "__main__":
    main()

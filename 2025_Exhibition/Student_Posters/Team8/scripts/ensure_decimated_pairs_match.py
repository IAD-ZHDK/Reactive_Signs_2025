#!/usr/bin/env python3
"""
ensure_decimated_pairs_match.py

Ensure that in each `obj*morphing/decimated` folder the inflated/deflated
pair files have exactly the same vertex count. If a mismatch is found the
script will remesh the larger file (only) using Instant Meshes until its
vertex count matches the smaller one. Backups are created in
`decimated/remeshBackup/` before overwriting.

Usage:
  python3 ensure_decimated_pairs_match.py [--instant PATH] [--yes]

Dry-run by default; provide `--yes` to perform destructive overwrites.
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


def remesh_to_target(inst, src: Path, target_v: int, dry_run: bool):
    # start param guess proportional to target/current
    current_v = count_obj_vertices(src)
    if current_v == target_v:
        return True, current_v
    base_param = 2500
    param = max(10, int(base_param * (target_v / max(1, current_v))))
    attempts = 0
    while attempts < 8:
        attempts += 1
        with tempfile.TemporaryDirectory() as td:
            tmp_out = Path(td) / src.name
            ok, out, rc = run_instant(inst, src, tmp_out, param)
            if not ok:
                print('    Instant Meshes failed:', out)
                # try increasing param
                param = max(10, int(param * 1.2) + 1)
                continue
            new_v = count_obj_vertices(tmp_out)
            print(f'    Attempt {attempts}: param={param} -> V={new_v}')
            if new_v == target_v:
                if not dry_run:
                    shutil.copy2(src, src.parent / 'remeshBackup' / src.name)
                    shutil.move(str(tmp_out), str(src))
                return True, new_v
            # adjust param by ratio
            if new_v == 0:
                param = max(10, param * 2)
            else:
                param = max(10, int(param * (target_v / new_v)))
    return False, None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--instant', type=str, default=None)
    parser.add_argument('--yes', action='store_true')
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
            print(f'{folder.name}: mismatch {a.name} V={va} != {b.name} V={vb}')
            # back up folder-level remeshBackup
            (dec / 'remeshBackup').mkdir(exist_ok=True)
            # remesh the larger one down to the smaller count
            if va > vb:
                print(f'  Remeshing {a.name} -> target V={vb}')
                ok, newv = remesh_to_target(inst, a, vb, not args.yes)
                if ok:
                    print(f'  Success: {a.name} now V={newv}')
                    fixed += 1
                else:
                    print(f'  FAILED to remesh {a.name} to V={vb}')
            else:
                print(f'  Remeshing {b.name} -> target V={va}')
                ok, newv = remesh_to_target(inst, b, va, not args.yes)
                if ok:
                    print(f'  Success: {b.name} now V={newv}')
                    fixed += 1
                else:
                    print(f'  FAILED to remesh {b.name} to V={va}')

    print('-'*40)
    print(f'Pairs checked: {total_pairs}, Files fixed: {fixed}')
    if not args.yes:
        print('DRY-RUN: no files were overwritten. Re-run with --yes to apply changes.')


if __name__ == "__main__":
    main()

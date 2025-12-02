#!/usr/bin/env python3
"""
match_vertex_counts_instant.py

For each `obj*morphing` folder, finds a deflated/inflated pair (e.g. `0.obj` and
`0inflated.obj`), measures their vertex/face counts and remeshes both using
Instant Meshes so they end up with identical vertex counts.

By default the script performs a dry-run and prints planned actions. Use
`--yes` to perform remeshing and overwrite the current files. Before overwriting
the script backs up the current files into `remeshBackup/` inside each folder.

Usage:
  python3 match_vertex_counts_instant.py [--instant PATH] [--yes] [--root PATH]

Notes:
 - Instant Meshes accepts a target face count (`-f`). The script chooses an
   initial target equal to the smaller of the two meshes' face counts, then
   adjusts target by small steps if needed to achieve matching vertex counts.
 - This performs destructive remeshes on the files you approve with `--yes`.
"""
import argparse
import subprocess
import shutil
from pathlib import Path
import sys
import tempfile
import re


def find_instant_binary(pref=None):
    candidates = []
    if pref:
        candidates.append(Path(pref))
    # common macOS app bundle path
    candidates.append(Path('/Applications/Instant Meshes.app/Contents/MacOS/Instant Meshes'))
    candidates.append(Path('/usr/local/bin/instant-meshes'))
    candidates.append(Path('/usr/local/bin/InstantMesh'))
    candidates.append(Path('/usr/bin/instant-meshes'))
    for p in candidates:
        if p.exists() and p.is_file():
            return str(p)
    # try which
    try:
        out = shutil.which('instant-meshes') or shutil.which('InstantMesh') or shutil.which('InstantMeshes')
        if out:
            return out
    except Exception:
        pass
    return None


def count_obj_vertices_faces(path: Path):
    v = 0
    f = 0
    with path.open('r', errors='ignore') as fh:
        for line in fh:
            if line.startswith('v '):
                v += 1
            elif line.startswith('f '):
                f += 1
    return v, f


def remesh_with_instant(inst_bin, input_path: Path, output_path: Path, target_faces: int):
    cmd = [inst_bin, '-f', str(target_faces), '-o', str(output_path), str(input_path)]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=False)
    except Exception as e:
        return False, str(e), None
    ok = res.returncode == 0
    return ok, res.stdout + '\n' + res.stderr, res.returncode


def find_pairs(folder: Path):
    # collect .obj files
    objs = list(folder.glob('*.obj'))
    pairs = []
    # heuristic: group by numeric prefix or matching stems
    stems = {p.stem: p for p in objs}
    used = set()
    for p in objs:
        name = p.name
        if 'inflate' in p.stem.lower() or 'inflated' in p.stem.lower() or 'inflate' in p.name.lower():
            # find counterpart by removing 'inflated' or 'inflate'
            other_stem = re.sub('(?i)inflated|inflate|inflation|ims', '', p.stem)
            other_stem = other_stem.strip('_-')
            other = stems.get(other_stem)
            if other and other not in used:
                pairs.append((other, p))
                used.add(other)
                used.add(p)
    # fallback: try numeric prefixes
    # also try numeric-token matching anywhere in the stem (handles 'balloon2')
    if not pairs:
        for p in objs:
            digits = ''.join(re.findall(r"(\d+)", p.stem))
            if not digits:
                continue
            others = [q for q in objs if q is not p and digits in q.stem]
            for o in others:
                if (o, p) not in pairs and (p, o) not in pairs:
                    pairs.append((p, o))
    return pairs


def process_folder(folder: Path, inst_bin: str, do_it: bool):
    pairs = find_pairs(folder)
    if not pairs:
        print(f"No deflated/inflated pairs found in {folder}")
        return 0
    changed = 0
    for a, b in pairs:
        print(f"Pair: {a.name}  <->  {b.name}")
        va, fa = count_obj_vertices_faces(a)
        vb, fb = count_obj_vertices_faces(b)
        print(f"  current: {a.name} V={va} F={fa}, {b.name} V={vb} F={fb}")
        if va == vb:
            print("  already equal, skipping")
            continue
        # initial target faces: smaller face count
        target_faces = min(fa or fb or 1000, fb or fa or 1000)
        # clamp
        if target_faces < 20:
            target_faces = max(fa, fb, 1000)

        # prepare backups
        backup_dir = folder / 'remeshBackup'
        if do_it:
            backup_dir.mkdir(exist_ok=True)
            # move current files into backup
            shutil.copy2(a, backup_dir / a.name)
            shutil.copy2(b, backup_dir / b.name)

        # try remeshing both, with small adjustments until vertex counts match or attempts exhausted
        attempts = 0
        last_ok = False
        while attempts < 7:
            attempts += 1
            print(f"  Attempt {attempts}: target faces={target_faces}")
            with tempfile.TemporaryDirectory() as td:
                ta = Path(td) / a.name
                tb = Path(td) / b.name
                ok_a, out_a, rc_a = remesh_with_instant(inst_bin, a, ta, target_faces)
                ok_b, out_b, rc_b = remesh_with_instant(inst_bin, b, tb, target_faces)
                if not ok_a or not ok_b:
                    print("    Instant Meshes failed on one or both files")
                    print(out_a)
                    print(out_b)
                    # try relaxing target (increase)
                    target_faces = int(target_faces * 1.1) + 1
                    continue
                # measure vertices
                va2, fa2 = count_obj_vertices_faces(ta)
                vb2, fb2 = count_obj_vertices_faces(tb)
                print(f"    result: {ta.name} V={va2} F={fa2}, {tb.name} V={vb2} F={fb2}")
                if va2 == vb2:
                    last_ok = True
                    if do_it:
                        # overwrite originals with temp files
                        shutil.move(str(ta), str(a))
                        shutil.move(str(tb), str(b))
                    print(f"    SUCCESS: matched vertex count {va2}")
                    changed += 1
                    break
                # adjust target based on ratio
                # compute average and try to nudge
                avg_v = int((va2 + vb2) / 2)
                # map to faces roughly: F ≈ 2*V
                target_faces = max(20, int(avg_v * 2))
        if not last_ok:
            print(f"    FAILED to match vertices for pair after attempts; leaving backups in {backup_dir}")
    return changed


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--instant', type=str, default=None, help='Path to Instant Meshes binary')
    parser.add_argument('--yes', action='store_true', help='Perform remesh (default dry-run)')
    parser.add_argument('--root', type=str, default=None, help='Team8 root folder (defaults to script parent)')
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    team8_dir = Path(args.root).resolve() if args.root else script_dir.parent
    inst_bin = find_instant_binary(args.instant)
    if not inst_bin:
        print('ERROR: Instant Meshes binary not found. Pass path with --instant')
        sys.exit(2)
    print(f"Using Instant Meshes: {inst_bin}")
    total_changed = 0
    for folder in sorted(team8_dir.glob('obj*morphing')):
        if not folder.is_dir():
            continue
        print('Processing', folder)
        changed = process_folder(folder, inst_bin, args.yes)
        total_changed += changed

    print('-' * 40)
    print(f"Folders processed. Pairs remeshed: {total_changed}")
    if not args.yes:
        print('\nDRY-RUN only. Re-run with --yes to perform remeshing and overwrites.')


if __name__ == '__main__':
    main()

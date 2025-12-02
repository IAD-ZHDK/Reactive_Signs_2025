#!/usr/bin/env python3
"""
apply_decimated_overwrite.py

Scan each `obj*morphing` folder under the Team8 folder. For each file in
`decimated/*.obj`, back up the original OBJ(s) into `originalObj/` and move
the decimated file into the parent folder using the original filename.

Usage:
  python3 apply_decimated_overwrite.py [--yes] [--root PATH]

By default this runs in the script's Team8 parent directory. Use `--yes` to
perform changes; otherwise the script prints a dry-run report.
"""
import argparse
import shutil
import sys
from pathlib import Path
import re
from datetime import datetime


SUFFIX_RE = re.compile(r'(?i)(?:[_\-]?(?:dec|decimated|reduced|low|ims|d))$')


def find_best_original(parent: Path, dec_base: str):
    # Remove common decimated suffixes to find candidate originals
    stripped = SUFFIX_RE.sub('', dec_base)
    candidates = [p for p in parent.glob('*.obj') if p.is_file()]
    # If only one original exists, return it
    if len(candidates) == 1:
        return candidates[0]
    # Exact match on stripped
    for c in candidates:
        if c.stem == stripped:
            return c
    # Startswith match
    for c in candidates:
        if c.stem.startswith(stripped) or stripped.startswith(c.stem):
            return c
    # Fallback: if candidate with same stem as dec_base exists
    for c in candidates:
        if c.stem == dec_base:
            return c
    return None


def backup_and_replace(orig: Path, dec: Path, backup_dir: Path, do_it: bool):
    backup_dir.mkdir(parents=True, exist_ok=True)
    # Make backup filename unique if needed
    dest_backup = backup_dir / orig.name
    if dest_backup.exists():
        ts = datetime.now().strftime('%Y%m%d-%H%M%S')
        dest_backup = backup_dir / f"{orig.stem}-{ts}{orig.suffix}"
    if do_it:
        shutil.move(str(orig), str(dest_backup))
        shutil.move(str(dec), str(orig))
    return dest_backup, orig


def process_folder(folder: Path, do_it: bool):
    dec_dir = folder / 'decimated'
    if not dec_dir.exists() or not dec_dir.is_dir():
        return 0, 0
    moved = 0
    skipped = 0
    for dec in sorted(dec_dir.glob('*.obj')):
        dec_base = dec.stem
        best = find_best_original(folder, dec_base)
        if best is None:
            print(f"SKIP: No matching original found for '{dec.name}' in '{folder}'")
            skipped += 1
            continue
        backup_dir = folder / 'originalObj'
        dest_backup, dest_orig = backup_and_replace(best, dec, backup_dir, do_it)
        if do_it:
            print(f"MOVED: '{best.name}' -> '{backup_dir.name}/{dest_backup.name}', placed '{dec.name}' as '{dest_orig.name}'")
        else:
            print(f"DRY: Would move '{best.name}' -> '{backup_dir.name}/{dest_backup.name}', replace with '{dec.name}'")
        moved += 1
    return moved, skipped


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--yes', action='store_true', help='Perform the move (default is dry-run)')
    parser.add_argument('--root', type=str, default=None, help='Team8 root folder (defaults to parent of script)')
    args = parser.parse_args()
    script_dir = Path(__file__).resolve().parent
    team8_dir = Path(args.root).resolve() if args.root else script_dir.parent
    if not team8_dir.exists():
        print(f"ERROR: Team8 folder not found: {team8_dir}")
        sys.exit(2)
    total_moved = 0
    total_skipped = 0
    processed_folders = 0
    for folder in sorted(team8_dir.glob('obj*morphing')):
        if not folder.is_dir():
            continue
        processed_folders += 1
        print(f"Processing: {folder}")
        moved, skipped = process_folder(folder, args.yes)
        total_moved += moved
        total_skipped += skipped
    print('-' * 40)
    print(f"Folders processed: {processed_folders}")
    print(f"Decimated files moved: {total_moved}")
    print(f"Decimated files skipped: {total_skipped}")
    if not args.yes:
        print('\nNOTE: This was a dry-run. Re-run with --yes to perform the moves.')


if __name__ == '__main__':
    main()

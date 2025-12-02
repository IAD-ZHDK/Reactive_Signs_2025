#!/usr/bin/env python3
"""
Batch-run Instant Meshes on a folder of models.

This script runs an Instant Meshes CLI executable over all models in a folder
and writes outputs to a mirrored `output` folder (or custom output dir).

It does not attempt to install Instant Meshes; download a release for your
platform from https://github.com/wjakob/instant-meshes and point
`--instant` to the executable.

Example:
  python3 run_instant_meshes.py -i "Team8/obj0morphing" -o "Team8/obj0morphing/decimated" \
      --instant "/Applications/InstantMesh.app/Contents/MacOS/instant-meshes" --faces 2500 --jobs 4

The script supports parallel execution and will preserve folder structure.
"""
import argparse
import concurrent.futures
import os
import shutil
import subprocess
import sys
from pathlib import Path


def find_models(folder, ext='.obj', recursive=False):
    folder = Path(folder)
    if recursive:
        return sorted(folder.rglob(f'*{ext}'))
    else:
        return sorted(folder.glob(f'*{ext}'))


def run_once(instant_exe, inpath, outpath, faces, extra_args=None):
    outdir = outpath.parent
    outdir.mkdir(parents=True, exist_ok=True)

    # Use short flags and explicit -o output to be compatible with different builds
    cmd = [str(instant_exe), '-f', str(faces), '-o', str(outpath), str(inpath)]
    if extra_args:
        cmd.extend(extra_args)

    try:
        print('Running:', ' '.join(cmd))
        subprocess.run(cmd, check=True)
        return (True, inpath, outpath, None)
    except subprocess.CalledProcessError as e:
        return (False, inpath, outpath, str(e))
    except FileNotFoundError:
        return (False, inpath, outpath, f'Instant Meshes executable not found: {instant_exe}')


def mirror_output_path(input_base, inpath, output_base):
    # preserve relative path
    rel = inpath.relative_to(input_base)
    return output_base.joinpath(rel)


def main():
    parser = argparse.ArgumentParser(description='Batch-run Instant Meshes on a folder of models')
    parser.add_argument('-i', '--input', required=True, help='Input folder containing models')
    parser.add_argument('-o', '--output', required=True, help='Output folder to write decimated models')
    parser.add_argument('--instant', required=True, help='Path to instant-meshes executable')
    parser.add_argument('--faces', type=int, default=2500, help='Target number of faces (per model)')
    parser.add_argument('--ext', default='.obj', help='Model file extension (default .obj)')
    parser.add_argument('--recursive', action='store_true', help='Recurse into subfolders')
    parser.add_argument('--jobs', type=int, default=1, help='Parallel jobs (default 1)')
    parser.add_argument('--extra', nargs=argparse.REMAINDER, help='Extra args passed through to instant-meshes')

    args = parser.parse_args()

    input_base = Path(args.input).resolve()
    output_base = Path(args.output).resolve()
    instant_exe = Path(args.instant).resolve()

    if not input_base.exists():
        print('Input folder not found:', input_base, file=sys.stderr)
        sys.exit(2)

    if not instant_exe.exists():
        print('Instant Meshes executable not found:', instant_exe, file=sys.stderr)
        sys.exit(2)

    models = find_models(input_base, ext=args.ext, recursive=args.recursive)
    if not models:
        print('No models found in', input_base)
        return

    print(f'Found {len(models)} model(s) — running with {args.jobs} job(s)')

    tasks = []
    for inpath in models:
        outpath = mirror_output_path(input_base, inpath, output_base)
        # ensure extension preserved; instant-meshes often writes same ext
        tasks.append((instant_exe, inpath, outpath, args.faces, args.extra))

    results = []
    if args.jobs == 1:
        for t in tasks:
            results.append(run_once(*t))
    else:
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as ex:
            futures = [ex.submit(run_once, *t) for t in tasks]
            for f in concurrent.futures.as_completed(futures):
                results.append(f.result())

    # report
    success = [r for r in results if r[0]]
    failed = [r for r in results if not r[0]]
    print('\nSummary:')
    print('  Success:', len(success))
    print('  Failed :', len(failed))
    if failed:
        print('\nFailures:')
        for ok, inp, outp, err in failed:
            print(' -', inp, '->', outp, 'err:', err)


if __name__ == '__main__':
    main()

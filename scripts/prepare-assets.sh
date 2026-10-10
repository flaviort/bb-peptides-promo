#!/usr/bin/env bash
# Builds every binary asset the site needs. Safe to re-run.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${LABEL_SRC:-/Users/flavioczuk/Downloads/V14}"
CDN="https://cdn.shopify.com/s/files/1/0689/2565/3245/files"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$ROOT/public/labels" "$ROOT/public/placeholders"

echo "Labels"
for pair in "HIA111:mango" "HIA211:peach" "HIA311:lemonade" "HIA312:cherry"; do
  code="${pair%%:*}"; id="${pair##*:}"
  pdf="$(ls "$SRC"/"$code"_*.pdf)"
  qlmanage -t -s 2400 -o "$TMP" "$pdf" >/dev/null 2>&1
  png="$TMP/$(basename "$pdf").png"
  # WebP at q84 is less than half the size of the old JPGs with no visible loss on the can (cwebp: brew install webp).
  for size in "2048:$id" "1024:$id-sm"; do
    ffmpeg -loglevel error -y -i "$png" -vf "scale=${size%%:*}:-2" "$TMP/${size##*:}.png"
    cwebp -quiet -q 84 -m 6 -sharp_yuv "$TMP/${size##*:}.png" -o "$ROOT/public/labels/${size##*:}.webp"
  done
  echo "  $id"
done

echo "Placeholders (client-owned imagery from cypresshemp.com)"
fetch() { curl -fsSL "$CDN/$1" -o "$ROOT/public/placeholders/$2" && echo "  $2"; }
for id in mango peach lemonade cherry; do
  fetch "product-main-$id.png" "product-$id.png"
  fetch "fruit-$id-01.png" "fruit-$id-01.png"
  fetch "fruit-$id-02.png" "fruit-$id-02.png"
  for n in 01 02 03; do fetch "frame-$id-$n.jpg" "frame-$id-$n.jpg"; done
done
fetch "hiatus-logo.svg" "hiatus-logo.svg"


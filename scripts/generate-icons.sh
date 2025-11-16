#!/bin/bash

# This script generates placeholder PWA icons
# In production, replace these with actual branded icons

cd "$(dirname "$0")/.."

# Create 192x192 icon (green background with text)
convert -size 192x192 xc:"#16a34a" \
  -gravity center \
  -pointsize 60 \
  -fill white \
  -annotate +0+0 "AFK" \
  public/icon-192x192.png 2>/dev/null || echo "ImageMagick not installed. Please create icons manually."

# Create 512x512 icon
convert -size 512x512 xc:"#16a34a" \
  -gravity center \
  -pointsize 160 \
  -fill white \
  -annotate +0+0 "AFK" \
  public/icon-512x512.png 2>/dev/null || echo "ImageMagick not installed. Please create icons manually."

echo "Icons generated (or skipped if ImageMagick not available)"
echo "For production, replace public/icon-*.png with your branded icons"

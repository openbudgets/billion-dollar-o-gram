#!/bin/bash

for f in *.svg; do echo $f && inkscape --export-area-page --export-dpi="180" --export-png="${f/.svg/.png}" "$f"; done

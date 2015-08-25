#!/usr/bin/env python
# -*- coding: utf-8
'''
Use the BDOG data to generate static SVG files.
'''

from data2json import fetch_viz_data, fetch_translation_data, detect_langs

# First, fetch the most recent data
viz_data = fetch_viz_data()
trans_data = fetch_translation_data()

# Detect the existing languages
langs = detect_langs(viz_data, trans_data)
print langs

viz_data = fetch_viz_data()
items = list(viz_data)
svg = open("../static/moneytrail.svg").read()

# Make dict with the translations for "millions"
trans_data = fetch_translation_data()
t_items = list(trans_data)
millions_trans = {}
billions_trans = {}
for item in t_items:
    millions_trans[item['lang']] = item['millions']
    billions_trans[item['lang']] = item['billions']

# Create SVG files for each language
for lang in langs:
    if lang == "en-US" or not lang in millions_trans:
        continue
    new_svg = svg
    new_svg = new_svg.replace("million", millions_trans[lang])
    new_svg = new_svg.replace("billion", billions_trans[lang])
    for item in items:
        new_svg = new_svg.replace(item['title'], item['title-' + lang])
    new_svg_filename = "../static/moneytrail-%s.svg" % lang
    f = open(new_svg_filename, "w")
    f.write(new_svg)
    f.close()

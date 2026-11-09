# Repeat 1.14.0 · Canvas authoring preview

## Try it

Extract the portable ZIP and open **Jago-Repeat.exe**. The HTML edition also works offline in current Edge or Chrome.

1. **Explore examples…** opens six illustrated, editable patterns. Opening one replaces the document; Undo returns to your work.
2. **Generate variations…** explores arrangements using your current artwork, with family choices, locks and saved directions.
3. **Edit on canvas** converts a generated arrangement to a free composition. Undo restores the generated arrangement.
4. Drag empty space to select motifs. Shift-click adds or removes a group. Drag selected artwork to move the selection together. Edge fragments select the same original motif.
5. Group motifs, duplicate them or delete them using the selection bar. **Arrange selection** offers centre alignment, centre distribution, scale and rotation. Scaling/rotation use each group's own centre; this is not a whole-selection bounding-box transform.
6. **Check repeat…** inspects the repeated artwork. **Tile tools → Repeat proof & kit…** exports a reusable tile, proof and optional editable project.

**Focus canvas** hides the side panels, lower secondary controls and neighbour tiles to give the tile more space. **Show panels** returns them. Your neighbour preference is preserved. Starting canvas selection in a window narrower than 1100 logical pixels enables this view; it remains reversible.

## Shortcuts while selecting on the canvas

- Ctrl+A selects all visible motif groups; Escape clears selection.
- Ctrl+D duplicates the selection; Delete or Backspace removes selected motifs, leaving source artwork available.
- Ctrl+G groups; Ctrl+Shift+G ungroups (including reflected partners).
- Arrows move one pixel; Shift+Arrow moves ten pixels.
- Ctrl+Z undoes; Ctrl+Shift+Z or Ctrl+Y redoes.
- Space-drag, middle-drag and Pan retain the existing navigation controls.

The existing Edit inspector remains available for precision edits. **Done selecting** leaves canvas selection mode and restores normal resize/rotation handles. Authored groups can contain different source images and are retained by project saving and suite transfer grouping. Selected group precision edits, duplicate and delete respect those new groups.

## Examples and repeats

Signal bloom, Electric ribbons and Midnight orbit join the existing Botanical stationery, Folded geometry and Night garden studies. Thumbnails show actual rendered repeats, not an approximation of an individual source. Original vector motifs remain editable through their source settings and can be replaced with your artwork.

Electric ribbons uses six mirrored rows and columns on a 1152 px tile. Odd alternating mirror counts may interrupt the intended rhythm at the tile join; the Arrange panel now warns about this. Half brick means alternate rows are shifted; half drop means alternate columns are shifted. These corrected labels do not change the layout algorithms.

## Current limits

Marquee selects intersecting rotated artwork bounds, not individual opaque pixels. New groups are flat, not nested. Centre distribution is not equal-edge spacing or dense packing. Group scale/rotation is available as increments or through Precise group edits; a shared multiselection resize handle is future work. Selection mode is for static Pattern tile editing; leave it before normal animation/texture work. SVG imports remain image sources rather than a path-node editor. Core work remains offline; no new dependencies were added.

Open source. Free forever. Personal, professional and commercial use are welcome. Imported assets and third-party components retain their own licences.

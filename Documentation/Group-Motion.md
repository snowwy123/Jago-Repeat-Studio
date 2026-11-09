# Repeat · Group motion

## A quick animated pattern

Open **Explore examples…** and choose **Try animation** beneath a study. Undo returns to your previous document. Connected ribbon and folded designs scroll as a whole; the other studies demonstrate independent group movement.

For your own pattern, choose **Animate groups…** above the canvas or in **Motion / FX → Loop timing & motion**.

1. Choose **Selected groups** or **Every group**. Canvas box/Shift selection can select several groups; the Edit picker can select one.
2. Choose Gentle rock, Floating motifs, Breathing or Tumbling as a starting point. Mix rock, breathe and horizontal/vertical float using the visible controls.
3. Open **Timing & variation** for full turns, cycle count, starting phase, stagger and alternating/reversed directions.
4. **Preview** shows the draft in the editor's live repeating preview. Change settings while it plays. **Stop preview** restores the original motion; **Cancel** closes without changing the project.
5. **Apply group motion** stores the settings and starts playback. Generated layouts become editable arrangements in the same undoable edit. Existing positions and source artwork are retained.

The controls describe scope explicitly. If groups have different settings, fields start from the first group; Apply replaces motion for the chosen scope. Each group moves as a unit, including reflected partners and wrapped edge fragments. Grouping moving motifs keeps the first motif's motion; ungroup them to animate parts separately. Editing the tile pauses playback before selecting artwork.

## Shared motion and timing

**Shared pattern motion** remains available above the group tools. Scroll the pattern while individual motifs rock, for example, or choose **None** to animate motifs in place. Existing shared turning and breathing remain available. **Restart** above the canvas starts the preview again from the beginning. Preview drawing is capped to the chosen FPS, up to 60.

Full turns and cycle counts use whole numbers so procedural motion closes at the loop boundary. Float is periodic back-and-forth movement, not one-way travel. Phase chooses where a cycle starts; stagger offsets the next group by a percentage of a cycle. The settings are stored per group, so later deletion does not retime the remaining groups.

## Imported animated artwork

Animated source cards now offer:

- **Original speed:** keeps the source's duration. The composition can jump at its loop boundary if it ends partway through a source cycle.
- **Fit to composition:** fits one or more complete source cycles into the composition duration.

The Motion panel identifies mismatched source durations and offers **Fit animated sources to this loop**. This is undoable. Source-loop phase remains available. Copies of the same upload share its source-frame playback; their group transforms can differ. Fitting timing does not repair a discontinuity already present in the source animation.

## Save and export

Save a **.jagorepeat project** to keep group motion and imported source timing. Layout-only recipes and saved layout directions are not substitutes for an animated project.

Use Export to choose GIF, PNG frames, MP4 or WebM. PNG sequences retain full alpha and exact frame/timing metadata. GIF has limited colours and hard transparency. MP4/WebM depend on the local browser encoder; transparent WebM remains conditional on the existing alpha-encoder check. Video recording is real-time and can vary slightly in duration or timing under load.

Animation export shows a persistent themed progress/cancel strip and guards ordinary editing/import actions until it finishes or is cancelled. The video endpoint now captures the closing pose rather than ending roughly one frame early. Cancellation restores editing and leaves the project intact.

## Limits

This is a loop authoring tool, without keyframes, easing-curve editing, collisions or path animation. Motions can overlap other motifs; judge spacing at different phases. Wrapped group centres use the shortest periodic distances, so very large groups spanning most of a tile may have an unexpected pivot. Source-frame phase is per upload, rather than per placed copy. Whole canvas size/rotation still belongs to Canvas; shared turning acts on artwork. Export does not include audio.

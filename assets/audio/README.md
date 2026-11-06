# Resources music player

Five layouts share one audio element, so changing the layout preserves playback and position. Audio is local, with readable filenames under assets/audio. Credits and YouTube links follow the selected track.

The optional player window keeps playback alive across full-page navigation. It transfers the selected track, current position, volume, and playing state. Browsers may require another Play click in the new window. A BroadcastChannel pauses other open instances when one starts playback. No automatic playback on the resources page.

Spotify icons are intentional placeholders, not links to guessed releases. Add verified URLs when available. Local faster-whisper transcription was attempted for both recordings; obvious errors and missing passages made the results unsuitable for publication. Use approved lyrics before adding a lyrics view.

Validation: five layouts at 320, 390, 768 and 1440px; playback and pause; seeking; repeat; track changes; credits; playback preserved across layout changes; pop-out handoff and playback after navigation. Automated accessibility scan of the music section reported no violations. Before/after screenshots are in local tmp/music-*.png.

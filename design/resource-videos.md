# Song-cover previews

The Resources songs use local ocean and forest artwork with editable cover
typography and a YouTube play icon. They load no YouTube iframe before activation.
The old WATCH numbers are removed; the complete waiata heading uses one font.
Separate YouTube links use a darker red fill for white-text contrast.

Click, Enter or Space replaces a cover with its privacy-enhanced YouTube embed.
Supported parameters are `autoplay=1`, `playsinline=1` and `rel=0`; the iframe keeps
its referrer policy, autoplay permission, native controls and fullscreen support.
Starting another song unloads the previous player and restores its cover.
Without JavaScript, both covers and the buttons open their normal YouTube links.

Custom covers hide thumbnails, channel images and copy/share overlays before
playback. During playback YouTube owns its interface. `showinfo` and
`modestbranding` cannot remove those overlays; both parameters are deprecated.
Reference: https://developers.google.com/youtube/player_parameters

Run `node scripts/resource-videos.cjs` for keyboard/click activation, one-player
behaviour, artwork, responsive bounds, accessibility and native fallback. This
deterministic test stubs the third-party response; live embeds are checked
separately. `node scripts/resources-layout.cjs` covers the full resource layout.

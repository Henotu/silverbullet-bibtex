# About
This plugin adds formatting of BibTex references from `.bib` files in [silverbullet](https://github.com/silverbulletmd/silverbullet).

## Setup
> [!NOTE]
> This plugin currently only works with the newest version of _silverbullet_. (Custom syntax definitions must be supported)

Add the following snippet to your `CONFIG.md`
```space-lua
config.set {
  plugs = {
    "https://github.com/Henotu/silverbullet-bibtex/releases/download/0.1.0/bibtex.plug.js"
  }
}
```

Add the code-snippets in `PLUG.md` to a page in your space (e.g. your `CONFIG.md`).

Place one or multiple BibTex files in your space and reference entries with:
* `@KEY`
* `@KEY()`
* `@KEY(p.12)`
---
name: Library/henotu/bibtex/PLUG
tags: meta/library
files:
- bibtex.plug.js
---

```space-lua
syntax.define {
  name = "Reference",
  startMarker = "@",
  endMarker = " |$",
  mode = "inline",
  render = bibtex.ref
}
```
This library does A, B and C.

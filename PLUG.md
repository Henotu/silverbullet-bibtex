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

```space-style
.tooltip {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.tooltiptext {
  visibility: hidden;
  width: max-content;
  background-color: black;
  color: #ffffff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 5px;
  position: absolute;
  z-index: 1;
  bottom: 100%;
  transform: translateX(-50%);
  margin-bottom: 5px;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
}
```

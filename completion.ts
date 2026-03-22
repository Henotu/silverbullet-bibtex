import { editor, space, syscall } from "@silverbulletmd/silverbullet/syscalls";
import {parse, Library, Entry} from "@retorquere/bibtex-parser";
import type { CompleteEvent } from "@silverbulletmd/silverbullet/type/client";

let entries: Entry[] = [];
let lastConfigUpdate = 0;

async function scanLibraries() {
  // Update at most every 20 seconds
  if (Date.now() < lastConfigUpdate + 20000) return;

  let libraries: Library[] = [];
  for (const file of await space.listFiles()) {
    if (file.name.endsWith(".bib")) {
      let data: Uint8Array = await space.readFile(file.name);
      let text = new TextDecoder().decode(data);
      let library = parse(text);
      libraries.push(library)
    }
  }

  entries = libraries
    .map(l => l.entries)
    .flat()
    .sort((e1, e2) => e1.key.localeCompare(e2.key))
}

export async function index(body: string, pageName) {
  await scanLibraries()

  const format = function(content: string, tooltip: string) {
    let tooltiptext = escape(tooltip)
    return syscall("lua.evalExpression", `widget.html "<div class='tooltip'>${content}<span class='tooltiptext'>${tooltiptext}</span></div>"`)
  }

  let match = /\(([^)]*)\)[^(]*$/.exec(body)

  if (match) {
    const [_, context] = match
    let ref = body.substring(0, body.length - (context.length + 2))
    for (const [key, entry] of entries.entries()) {
      if (entry.key === ref) {
        return format(
          context ? `[${key}, ${context}]` : `[${key}]`,
          entry.fields.title,
        )
      }
    }
    let formattedRef = `<span style='color: red'>@${ref}</span>`
    return format(
      context ? `[${formattedRef}, ${context}]` : `[${formattedRef}]`,
      `Could not find reference with key '${ref}'`,
    )
  }

  for (const [key, entry] of entries.entries()) {
    if (entry.key === body) {
      return format(
        `[${key}]`,
        entry.fields.title,
      )
    }
  }

  return format(
    `[${body}]`,
    `Could not find reference with key '${body}'`,
  )
}

function escape(str: string) {
  return str.replace(/[\\"']/g, '\\$&')
}

// Mostly taken from
// https://github.com/silverbulletmd/silverbullet/blob/495bd8e3e62ae05c8f3969071220b72b4ec11bc1/plugs/emoji/emoji.ts
export async function bibTexCompletion({
  linePrefix,
  pos,
  parentNodes,
}: CompleteEvent) {
  await scanLibraries()

  const match = /@([\w]+)$/.exec(linePrefix);
  if (!match) {
    return null;
  }

  // Check if we're not in a Lua directive or space-lua block
  if (
    parentNodes.find(
      (node) => node === "LuaDirective" || node.startsWith("FencedCode"),
    )
  ) {
    return;
  }

  const [fullMatch, curName] = match;

  let options = [];

  for (const entry of entries) {
    if (entry.key.includes(curName)) {
      options.push({
        detail: entry.fields.title,
        label: `@${entry.key}()`,
        type: "bibtex",
      })
    }
  }

  return {
    from: pos - fullMatch.length,
    filter: false,
    options: options,
  };
}

export async function bottom() {
  await scanLibraries()
  let text = await editor.getText()
  let keys = new Set()

  const regex = /@(.*?)( |$)/gm

  let result;
  while ((result = regex.exec(text)) !== null) {
    keys.add(/(.*?)(\(.*\))?$/gm.exec(result[1])[1])
  }

  console.log(keys)

  if (keys.size === 0) {
    return
  }

  const format = function (entry: Entry) {
    const authors = entry.fields.author
    let authorString
    if (authors.length == 0) {
      authorString = ""
    } else if (authors.length == 1) {
      const author = authors[0]
      authorString = `${author.firstName} ${author.initial} ${author.lastName}: `
    } else {
      authorString = `${authors[0].lastName} et al: `
    }
    return `${authorString}&quot;${entry.fields.title}&quot;`
  }

  let list =
    entries
      .map((e, s) => [e, s])
      .filter(([e, _]) => keys.has(e.key))
      .map(([e, i], _) => `<li value='i'>${format(e)}</li>`)
      .join("")

  return syscall("lua.evalExpression", `widget.html("<h2>References</h2><ol>${escape(list)}</ol>")`)
}

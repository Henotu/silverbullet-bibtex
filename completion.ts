import { editor, space } from "@silverbulletmd/silverbullet/syscalls";
import {parse, Library} from "@retorquere/bibtex-parser";
import type { CompleteEvent } from "@silverbulletmd/silverbullet/type/client";
import { Decoration } from "@codemirror/view"
import {HtmlWidget} from "./widgets";
let entries = [];
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

  let match = /\(([^)]*)\)[^(]*$/.exec(body)

  if (match) {
    const [_, context] = match
    let ref = body.substring(0, body.length - (context.length + 2))
    console.log(match, ref, context)
    for (const [key, entry] of entries.entries()) {
      if (entry.key === ref) {
        return context ? `[${key}, ${context}]` : `[${key}]`
      }
    }
  }

  for (const [key, entry] of entries.entries()) {
    if (entry.key === body) {
        return `[${key}]`
    }
  }
  return body
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

  console.log(options)
  return {
    from: pos - fullMatch.length,
    filter: false,
    options: options,
  };
}

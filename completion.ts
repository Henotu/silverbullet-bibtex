import { editor, space, system, events } from "@silverbulletmd/silverbullet/syscalls";
import {parse, Library} from "@retorquere/bibtex-parser";
import type { CompleteEvent } from "@silverbulletmd/silverbullet/type/client";

// Mostly taken from
// https://github.com/silverbulletmd/silverbullet/blob/495bd8e3e62ae05c8f3969071220b72b4ec11bc1/plugs/emoji/emoji.ts
export async function bibTexCompletion({
  linePrefix,
  pos,
  parentNodes,
}: CompleteEvent) {
  let libraries: Library[] = []
  for (const file of await space.listFiles()) {
      if (file.name.endsWith(".bib")) {
          let data: Uint8Array = await space.readFile(file.name);
          let text = new TextDecoder().decode(data);
          let library = parse(text);
          libraries.push(library)
      }
  }

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

  console.log(libraries)

  for (const library of libraries) {
    for (const entry of library.entries) {
      if (entry.key.includes(curName)) {
        options.push({
          detail: entry.fields.title,
          label: `@${entry.key}()`,
          type: "bibtex",
        })
      }
    }
  }

  console.log(options)
  return {
    from: pos - fullMatch.length,
    filter: false,
    options: options,
  };
}

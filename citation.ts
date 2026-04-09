import {parse, Library, Entry} from "@retorquere/bibtex-parser";
export class Citation {
  #entry: Entry;

  constructor(bibtex: Entry) {
    this.#entry = bibtex;
  }

  getKey(): string {
    return this.#entry.key;
  }

  getTitle(): string {
    return this.#entry.fields.title;
  }

  formatReference(): string {
    const authors = this.#entry.fields.author
    let authorString
    if (authors.length == 0) {
      authorString = ""
    } else if (authors.length == 1) {
      const author = authors[0]
      authorString = `${author.firstName} ${author.initial} ${author.lastName}: `
    } else {
      authorString = `${authors[0].lastName} et al: `
    }
    return `${authorString}&quot;${this.#entry.fields.title}&quot;`
  }


}
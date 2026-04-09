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

  #formatSingleAuthor(author) {
    let name = ""
    if (author.firstName) {
      name += `${author.firstName} `
    }
    if (author.initial) {
      name += `${author.initial} `
    }
    if (author.lastName) {
      name += author.lastName
    }
    return name ? name : "<b style='color: darkred'>UNKNOWN NAME</b>"
  }

  #getLink() {
    const doi = this.#entry.fields.doi;
    if (doi) {
      return `https://doi.org/${doi.replace("https://doi.org/", "")}`
    }
  }

  formatReference(): string {
    const authors = this.#entry.fields.author
    let authorString
    if (authors.length == 0) {
      authorString = ""
    } else if (authors.length == 1) {
      const author = authors[0]
      authorString = `${this.#formatSingleAuthor(author)}: `
    } else {
      authorString = `${authors[0].lastName} et al.: `
    }
    let href = this.#getLink()
    let title = href ? `<a href="${href}" style="text-decoration: underline dashed; color: inherit;">${this.#entry.fields.title}</a>` : this.#entry.fields.title;
    return `${authorString}&quot;${title}&quot;`
  }


}
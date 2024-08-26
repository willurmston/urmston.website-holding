import './yo-yo.js'

class LastCommitWidget extends HTMLElement {
  styleTag() {
    return yo`
      <style>
        :host {
          display: block;
        }
        a {
          color: inherit;
        }
        a:hover {
          background: var(--accent-color);
          color: black;
        }
      </style>
    `
  }

  async getCommit() {
    const user = this.getAttribute('user')
    const repo = this.getAttribute('repo')
    const branch = this.getAttribute('branch') || 'master'

    if (user && repo) {
      const branchData = await fetch(
        `https://api.github.com/repos/${this.getAttribute(
          'user'
        )}/${repo}/git/refs/heads/${branch}`
      )
      const branchJSON = await branchData.json()
      const commitData = await fetch(branchJSON.object.url)
      const commitJSON = await commitData.json()

      return commitJSON
    } else {
      console.error('LastCommitWidget requires attributes `user` and `repo`')
    }
  }

  async connectedCallback() {
    this.shadow = this.attachShadow({ mode: 'open' })
    this.shadow.appendChild(yo`<div></div>`)

    const commit = await this.getCommit()
    this.render(commit)
  }

  render(commit) {
    const date = new Date(commit.committer.date)
    const day = date.toLocaleDateString({
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const time = date.toLocaleTimeString({
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    })
    yo.update(
      this.shadow.firstChild,
      yo`
        <main>
          ${this.styleTag()}
          <div>
            Last commit ${day} at ${time}
          </div>
          <div>
            <a href="${commit.html_url}" target="_blank">${commit.sha.substring(
        0,
        7
      )}</a>:
            <span> "${commit.message}"</span>
          </div>
        </main>
      `
    )
  }
}

window.customElements.define('last-commit-widget', LastCommitWidget)

import './yo-yo.js'

class LastCommitWidget extends HTMLElement {
    constructor() {
        super()
    }

    styleTag() {
        return yo`
            <style>
                :host {
                    display: block;
                }
                @keyframes blink {
                    0% {
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                    }
                }
                .blink {
                    animation: blink 2s both steps(1) infinite;
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

    async getCommit (user = this.getAttribute('user'), repo = this.getAttribute('repo'), branch = this.getAttribute('branch') || 'master') {
        if (user && repo) {
            const branchData = await fetch(`https://api.github.com/repos/${this.getAttribute('user')}/${repo}/git/refs/heads/${branch}`)
            const branchJSON = await branchData.json()
            const commitData = await fetch(branchJSON.object.url)
            const commitJSON = await commitData.json()

            return commitJSON
        } else {
            console.error('LastCommitWidget requires attributes `user` and `repo`')
        }
    }

    async connectedCallback() {
        this.shadow = this.attachShadow({mode: 'open'})
        this.shadow.appendChild(yo`<div></div>`)

        const commit = await this.getCommit()
        this.render(commit)
    }

    render(commit) {
        const date = new Date(commit.committer.date)
        const day = date.toLocaleDateString({
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
        const time = date.toLocaleTimeString({
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        })
        const timeWithSeparators = time.split('').map(character => {
            if (character === ':') {
                return yo`<span class="blink">:</span>`
            } else {
                return character
            }
        })

        yo.update(this.shadow.firstChild, yo`
            <main>
                ${this.styleTag()}
                <div>
                    Last Commit ${day} at ${timeWithSeparators}
                </div>
                <div>
                    <a href="${commit.html_url}" target="_blank">${commit.sha.substring(0,7)}</a>:
                    <span> "${commit.message}"</span>
                </div>
            </main>
        `)
    }
}

window.customElements.define('last-commit-widget', LastCommitWidget)

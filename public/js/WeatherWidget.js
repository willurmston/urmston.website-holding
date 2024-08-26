import './yo-yo.js'

class WeatherWidget extends HTMLElement {
    constructor() {
        super()
    }

    cToF(c) {
        return (c * (9 / 5) + 32).toFixed(1)
    }

    styleTag() {
        return yo`
            <style>
                :host {
                }
                main {
                    display: table;
                    background: black;
                    padding: 1em 1em 0 1em;
                    margin-bottom: 1em;
                }
                .credit {
                    margin-top: 0.5em;
                    font-size: 0.6em;
                    letter-spacing: 0.09em;
                }
                .credit a {
                    color: inherit;
                }
            </style>
        `
    }

    async getWeather (station) {
        const response = await fetch(`https://api.weather.gov/stations/${station}/observations?limit=1`)
        const weather = await response.json()
        return weather.features[0].properties
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'station') {
            this.weather = await this.getWeather(newValue)
            this.render(this.weather)
        }
    }

    connectedCallback() {
        this.shadow = this.attachShadow({mode: 'open'})
        this.shadow.appendChild(yo`<div></div>`)
    }

    render(weather = this.weather) {
        if (!this.shadow) return
        yo.update(this.shadow.firstChild, yo`
            <main>
                ${this.styleTag()}
                <div>
                    Seattle, USA
                </div>
                <span>
                    ${this.cToF(weather.temperature.value)}° F • <em>"It's ${weather.textDescription.toLowerCase()}!"</em>
                </span>
                <div class="credit">
                    DATA FROM <a href="https://weather.gov" target="_blank">WEATHER.GOV</a>
                </div>
            </main>
        `)
    }
}

WeatherWidget.observedAttributes = ['station']

window.customElements.define('weather-widget', WeatherWidget)

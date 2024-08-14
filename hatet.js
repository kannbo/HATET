class AAADConverter {
    constructor() {
        this.styles = {};
    }

    parseAAAD() {
        const aaadTags = document.querySelectorAll('AAAD');
        aaadTags.forEach(tag => {
            const cssText = tag.textContent;
            const lines = cssText.split('\n');
            let css = '';

            lines.forEach(line => {
                line = line.trim();
                if (line.startsWith('!')) {
                    css += line.slice(1).trim() + ' { ';
                } else if (line === '@') {
                    css += '}\n';
                } else if (line.includes(' ')) {
                    const [property, ...value] = line.split(' ');
                    css += `${property}: ${value.join(' ')}; `;
                }
            });

            // Create a style element and append the CSS
            const styleTag = document.createElement('style');
            styleTag.textContent = css;
            document.head.appendChild(styleTag);

            // Remove the original AAAD tag
            tag.remove();
        });
    }
}

class AHTConverter {
    constructor() {}

    parseAHT() {
        const ahtTags = document.querySelectorAll('AHT');
        ahtTags.forEach(tag => {
            const htmlText = tag.textContent;
            const regex = /@(\w+)(\(([^)]+)\))?\s*{([^}]+)}/g;
            let match;

            const fragment = document.createDocumentFragment();
            while ((match = regex.exec(htmlText)) !== null) {
                const tagName = match[1];
                const attributesString = match[3];
                const content = match[4].trim();

                const element = document.createElement(tagName);

                if (attributesString) {
                    const attributes = attributesString.split(',').map(attr => attr.trim());
                    attributes.forEach(attr => {
                        const [name, value] = attr.split('=').map(s => s.trim());
                        element.setAttribute(name, value.replace(/"/g, ''));
                    });
                }

                // Process nested AHT tags within the current content
                const innerContent = this.processNestedAHT(content);
                element.innerHTML = innerContent;
                fragment.appendChild(element);
            }

            // Replace the AHT tag with the created elements
            tag.parentNode.replaceChild(fragment, tag);
        });
    }

    processNestedAHT(content) {
        const regex = /@(\w+)(\(([^)]+)\))?\s*{([^}]+)}/g;
        return content.replace(regex, (match, tagName, _, attributesString, innerContent) => {
            const element = document.createElement(tagName);
            
            if (attributesString) {
                const attributes = attributesString.split(',').map(attr => attr.trim());
                attributes.forEach(attr => {
                    const [name, value] = attr.split('=').map(s => s.trim());
                    element.setAttribute(name, value.replace(/"/g, ''));
                });
            }

            // Recursively process nested AHT content
            element.innerHTML = this.processNestedAHT(innerContent.trim());
            return element.outerHTML;
        });
    }
}

class HatetFramework {
    constructor() {
        this.aaadConverter = new AAADConverter();
        this.ahtConverter = new AHTConverter();
    }

    loadAll() {
        this.aaadConverter.parseAAAD();
        this.ahtConverter.parseAHT();
    }
}

// Usage
const hatetFramework = new HatetFramework();
hatetFramework.loadAll();

class TemplateSystem {
  constructor() {
    this.values = {};
  }

  setValue(key, value) {
    this.values[key] = value;
    this.updateTemplates();
  }

  updateTemplates() {
    const templates = document.querySelectorAll('[template-value]');
    templates.forEach(template => {
      const key = template.getAttribute('template-value');
      if (this.values[key] !== undefined) {
        template.textContent = this.values[key];
      }
    });
  }
}
class HATETFramework {
  constructor() {
    this.aaadParser = new AAADParser();
    this.ahtParser = new AHTParser();
    this.templateSystem = new TemplateSystem();
  }

  loadAAAD(cssText) {
    this.aaadParser.parse(cssText);
    this.aaadParser.applyStyles();
  }

  loadAHT(htmlText, container) {
    const elements = this.ahtParser.parse(htmlText);
    this.ahtParser.render(elements, container);
  }

  setTemplateValue(key, value) {
    this.templateSystem.setValue(key, value);
  }
}
class CValue {
    constructor() {
        this.root = document.documentElement;
    }

    /**
     * Set a CSS variable with the given name and value.
     * @param {string} name - The name of the CSS variable to set (without the '--' prefix).
     * @param {string|number} value - The value to assign to the CSS variable.
     */
    set(name, value) {
        this.root.style.setProperty(`--${name}`, value);
    }

    /**
     * Get the value of a CSS variable.
     * @param {string} name - The name of the CSS variable to get (without the '--' prefix).
     * @returns {string} The value of the CSS variable.
     */
    get(name) {
        return getComputedStyle(this.root).getPropertyValue(`--${name}`).trim();
    }

    /**
     * Update a CSS variable by applying a function to its current value.
     * @param {string} name - The name of the CSS variable to update (without the '--' prefix).
     * @param {function} func - A function that takes the current value and returns the new value.
     */
    update(name, func) {
        const currentValue = this.get(name);
        const newValue = func(currentValue);
        this.set(name, newValue);
    }
}

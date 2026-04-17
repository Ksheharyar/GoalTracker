const fs = require('fs');
const path = require('path');

const templateCache = new Map();

function loadTemplate(templateName) {
  if (!templateCache.has(templateName)) {
    const templatePath = path.join(__dirname, '../templates/emails', templateName);
    const template = fs.readFileSync(templatePath, 'utf8');
    templateCache.set(templateName, template);
  }

  return templateCache.get(templateName);
}

function renderTemplate(templateName, replacements = {}) {
  return Object.entries(replacements).reduce((html, [key, value]) => {
    return html.split(`{{${key}}}`).join(String(value));
  }, loadTemplate(templateName));
}

module.exports = {
  renderTemplate,
};
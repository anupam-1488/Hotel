/**
 * @voilajs/appkit - Email template engine
 * @module @voilajs/appkit/email/templates
 */

/**
 * Simple template renderer that supports variables, conditionals, and loops
 * @param {string} template - Template string
 * @param {Object} [data={}] - Template data
 * @returns {Promise<string>} Rendered template
 * @throws {Error} If template is not provided or rendering fails
 */
export async function renderTemplate(template, data = {}) {
  if (!template) {
    throw new Error('Template is required');
  }

  try {
    let rendered = template;

    // Replace variables {{key}} with data values
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(
        regex,
        value !== undefined && value !== null ? value : ''
      );
    });

    // Handle nested object notation {{user.name}}
    const nestedRegex = /{{([\w.]+)}}/g;
    rendered = rendered.replace(nestedRegex, (match, path) => {
      const keys = path.split('.');
      let value = data;

      for (const key of keys) {
        value = value?.[key];
        if (value === undefined || value === null) break;
      }

      return value !== undefined && value !== null ? value : match;
    });

    // Simple conditional blocks {{#if condition}}...{{/if}}
    const conditionalRegex = /{{#if\s+([\w.]+)}}([\s\S]*?){{\/if}}/g;
    rendered = rendered.replace(
      conditionalRegex,
      (match, condition, content) => {
        const keys = condition.split('.');
        let value = data;

        for (const key of keys) {
          value = value?.[key];
          if (value === undefined || value === null) break;
        }

        return value ? content : '';
      }
    );

    // Simple loops {{#each items}}...{{/each}}
    const loopRegex = /{{#each\s+([\w.]+)}}([\s\S]*?){{\/each}}/g;
    rendered = rendered.replace(loopRegex, (match, arrayPath, content) => {
      const keys = arrayPath.split('.');
      let array = data;

      for (const key of keys) {
        array = array?.[key];
        if (array === undefined || array === null) break;
      }

      if (!Array.isArray(array)) return '';

      return array
        .map((item, index) => {
          let itemContent = content;

          // Replace {{this}} with the current item if it's a primitive
          if (typeof item !== 'object' || item === null) {
            itemContent = itemContent.replace(/{{this}}/g, item);
          }

          // Replace {{@index}} with the current index
          itemContent = itemContent.replace(/{{@index}}/g, index);

          // Replace {{property}} with item properties if item is an object
          if (typeof item === 'object' && item !== null) {
            Object.entries(item).forEach(([key, value]) => {
              const itemRegex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
              itemContent = itemContent.replace(
                itemRegex,
                value !== undefined && value !== null ? value : ''
              );
            });
          }

          return itemContent;
        })
        .join('');
    });

    return rendered;
  } catch (error) {
    throw new Error(`Template rendering failed: ${error.message}`);
  }
}

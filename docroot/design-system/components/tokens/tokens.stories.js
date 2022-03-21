import colors from './colors.twig';
import spacing from './spacing.twig';
import typography from './typography.twig';

// These are our design system tokens
import customProperties from '../../.storybook/cssVariables.json'

const vars = customProperties["custom-properties"];

// Filter just the values we want for a given Story
const colorVars = Object.keys(vars)
  .filter(key => key.includes('--va-'))
  .reduce((obj, key) => {
    obj[key] = vars[key];
    return obj;
  }, {});

const spacingVars = Object.keys(vars)
  .filter(key => key.includes('--spacing'))
  .reduce((obj, key) => {
    obj[key] = vars[key];
    return obj;
  }, {});

const typeVars = Object.keys(vars)
  .filter(key => key.includes('--font'))
  .reduce((obj, key) => {
    obj[key] = vars[key];
    return obj;
  }, {});

const shared = {
  parameters: {
    options: { showPanel: false }
  },
  argTypes: {
    vars: {
      table: { disable: true }
    }
  }
}

export default { title: 'Tokens' }

export const Colors = {
  args: {
    vars: colorVars
  },
  ...shared
}

Colors.parameters.render = async args => {
  return await colors({...Colors.args, ...args});
}

export const Spacing = {
  args: {
    vars: spacingVars
  },
  ...shared
}

Spacing.parameters.render = async args => {
  return await spacing({...Spacing.args, ...args});
}

export const Typography = {
  args: {
    vars: typeVars
  },
  ...shared
}

Typography.parameters.render = async args => {
  return await typography({...Typography.args, ...args});
}

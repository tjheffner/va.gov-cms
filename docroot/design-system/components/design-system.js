/**
 * This is the overall file for the design system.
 *
 * Include components here to add them to the final bundle for Drupal.
 */

// tokens
import * as tokens from './tokens';

// components
import * as alert from './alert';
import * as button from './button';
import * as icon from './icon';
import * as announcementBlock from './announcement-block';
import * as input from './input';
import * as announcementBlock from './announcement-block';

const components = {
  tokens,
  alert,
  announcementBlock,
  button,
  icon,
  input,
  announcementBlock,
};

/**
 * Default export of object containing all components
 */
export default components;

/**
 * All component names as an array
 * @returns {Array} List of components name strings
 */
export const componentNames = () =>
  Object.values(components).map(({ name }) => name);

/**
 * Enable all components against a piece of DOM with some settings. e.g. Drupal's $context var
 */
export const enableAllComponents = ($dom, settings) =>
  Object.values(components).forEach(({ enable }) => enable($dom, settings));

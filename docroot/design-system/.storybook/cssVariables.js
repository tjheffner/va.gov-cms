/*
 * Helper script to parse out CSS Custom Properties from the :root object.
 *
 * This outputs
 */

const postcss = require('postcss');
const postcssCustomProperties = require('postcss-custom-properties');
const fs = require('fs');
const path = require('path');

fs.readFile(path.resolve(__dirname,'../components/tokens/_variables.css'), (err, css) => {
  postcss({
    plugins: [
      postcssCustomProperties({
        exportTo: path.resolve(__dirname, './cssVariables.json')
      })
    ]
  }).process(css, {
    from: path.resolve(__dirname, '../components/tokens/_variables.css'),
    to: '' // don't need a css file here, just want the .json output frm above
  }).then(result => {
    console.log('Finished processing CSS variables from ' + result.opts.from + ' for Storybook!');
  })
})

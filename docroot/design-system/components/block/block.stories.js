import block from './block.twig';
import DrupalAttribute from '../../DrupalAttribute';
import './block.scss';
import './index.js';

export default {
  title: 'Components/Blocks',
  componentPath: block,
};

export const Block = (_, { loaded: { component } }) => component;

Block.args = {
  attributes: new DrupalAttribute(),
  title_attributes: new DrupalAttribute(),
  plugin_id: "Some plugin",
  title_prefix: "",
  title_suffix: "",
  label: "I'm a block!",
  content: "Lorem ipsum dolor sit amet.",
  configuration: {
    provider: "Some module"
  }
}

Block.render = async args => {
  return await block({
    ...Block.args, ...args
  })
}


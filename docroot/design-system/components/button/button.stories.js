import button from './sb-buttons.twig';
import './button.scss';
import './index.js';

<<<<<<< HEAD
export default { title: 'Atoms/Buttons', component: button };
=======
export default { title: 'Atoms/Button', component: button };
>>>>>>> 67ebf0e9 (VACMS-8682 import claro styles to sb for parity. add buttons)

export const Buttons = {
  args: {},
  parameters: {},
};

Buttons.parameters.render = async args => {
  return await button({
    ...Buttons.args, ...args
  });
}

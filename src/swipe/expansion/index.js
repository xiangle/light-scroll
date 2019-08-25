/**
 * 静态配置选项路由
 */

import loop from './loop.js';

const tasks = [loop];

export default function () {

   for (const injection of tasks) {

      const { name, options } = injection;
      const index = String(this[name]);
      const actions = options[index];

      if (actions) {
         for (const actionName in actions) {
            const action = actions[actionName];
            this[`$${name}_${actionName}`] = action;
         }
      } else {
         new Error(`路由索引"${index}"找不到值`);
      }

   }

}
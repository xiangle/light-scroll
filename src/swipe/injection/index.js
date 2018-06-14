/**
 * 静态变量路由
 */

import loop from './loop'

let tasks = [loop]

export default function (base) {
   for (let injection of tasks) {
      let { name, values } = injection
      let value = String(base[name])
      let actions = values[value]
      if (actions) {
         for (let actionName in actions) {
            let action = actions[actionName]
            base[`$${name}_${actionName}`] = action
         }
      } else {
         console.error(`路由变量"${name}"未定义`)
      }
   }
}
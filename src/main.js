'use strict';

import Base from './base'
import Tools from './tools'
import scroll from './scroll/index'
import swipe from './swipe/index'

Base.prototype.scroll = scroll
Base.prototype.swipe = swipe

/**
 * Touch选择器
 * @param {String, DOM} el 指定事件容器父元素 
 */
export default function touchBox(el) {

   el = Tools.getElment(el)

   if (!el || !el.childElementCount) return

   let base = new Base(el);

   return base

}

// Touch扩展
touchBox.use = function (name, func) {
   Base.prototype[name] = func
}
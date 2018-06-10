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

   let touch = new Base(el);

   // 使用第一个子元素作为Touch容器
   let container = touch.container

   // 支持touch时，优先使用touch
   touch.isTouch = "ontouchend" in document

   // 绑定Touch事件
   if (touch.isTouch) {

      container.addEventListener('touchstart', function (ev) {

         ev.preventDefault()

         let [{ pageX, pageY }] = ev.changedTouches

         touch.StartAgent(ev, pageX, pageY)

      }, false)

      container.addEventListener('touchmove', function (ev) {

         ev.preventDefault()

         if (touch.lock) return

         let [{ pageX, pageY }] = ev.changedTouches;

         touch.MoveAgent(ev, pageX, pageY)

      }, false)

      container.addEventListener('touchend', ev => {

         ev.preventDefault();

         if (touch.lock) return

         touch.EndAgent(ev)

      }, false)

   }

   // 绑定Mouse事件
   else {

      container.addEventListener('mousedown', function (ev) {

         ev.preventDefault()

         let { pageX, pageY } = ev

         touch.StartAgent(ev, pageX, pageY)

      }, false)

      container.addEventListener('mousemove', function (ev) {

         ev.preventDefault()

         if (touch.lock) return

         let { pageX, pageY } = ev

         touch.MoveAgent(ev, pageX, pageY)

      }, false)

      container.addEventListener('mouseup', ev => {

         ev.preventDefault();

         if (touch.lock) return

         touch.EndAgent(ev)

         touch.lock = true

      }, false)

      container.addEventListener('mouseout', ev => {

         ev.preventDefault();

         if (touch.lock) return

         touch.EndAgent(ev)

         touch.lock = true

      }, false)

   }

   return touch

}

// Touch扩展
touchBox.use = function (name, func) {
   Base.prototype[name] = func
}
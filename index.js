class touch {
   constructor(el) {
      this.el = el
      this.moveTasks = []
      this.endTasks = []
      this.moveRatio = 0
      this.moveX = 0
      this.moveY = 0
      this.pageX = 0
      this.pageY = 0
   }
   swipe(move, end) {

      //如果未指定move方法，则执行默认行为
      if (!move) {
         move = function (ev, object) {
            let x = Math.round(object.pageX - object.elementX);
            let y = Math.round(object.pageY - object.elementY);
            object.el.setAttribute("style", `transform:translate(${x}px, ${y}px) translateZ(0px)`);
         }
      }

      this.moveTasks.push(move)

      if (end) {
         this.endTasks.push(end)
      }

      return this;
   }
   swipeX(move, end) {
      if (move) {
         this.swipe(move, end)
      } else {
         this.swipe(function (ev, object) {
            let { moveRatio } = object;
            if (moveRatio > 1.8) {
               let x = Math.round(object.pageX - object.elementX);
               object.el.setAttribute("style", `transform:translate(${x}px, 0px) translateZ(0px)`);
               return true;
            }
         }, end);
      }
      return this;
   }
   swipeY(move, end) {
      if (move) {
         this.swipe(move, end)
      } else {
         this.swipe(function (ev, object) {
            let { moveRatio } = object;
            if (moveRatio < 0.5) {
               let y = Math.round(object.pageY - object.elementY);
               object.el.setAttribute("style", `transform:translate(0px, ${y}px) translateZ(0px)`);
               return true;
            }
         }, end);
      }
      return this;
   }
   drag(move, end) {
      if (move) {
         this.moveTasks.push(function (ev) {
            let [{ pageX, pageY }] = ev.touches
            move({ pageX, pageY })
         })
      }
      if (end) {
         this.endTasks.push(function (ev) {
            end(ev)
         })
      }
      return this
   }
}

function lightTouch(el) {

   if (typeof el === 'string') {
      el = document.querySelector(el);
   } else if (typeof el !== 'object') {
      console.error('touch选择器数据类型无效')
      return
   }

   if (!el) {
      console.error('touch选择器找不到目标元素')
      return
   }

   let newTouch = new touch(el);

   el.addEventListener("touchstart", function (ev) {
      let [{ pageX, pageY }] = ev.changedTouches;
      newTouch.startX = pageX;
      newTouch.startY = pageY;
      newTouch.elementX = pageX - newTouch.pageX;
      newTouch.elementY = pageY - newTouch.pageY;
      ev.preventDefault();
      ev.stopPropagation();
   }, false);

   el.addEventListener("touchmove", function (ev) {
      let [{ pageX, pageY }] = ev.changedTouches;
      newTouch.pageX = pageX;
      newTouch.pageY = pageY;
      // 如果task方法存在表示已经识别手势，直接执行手势对应回调函数，不再重复判断手势。
      if (newTouch.task) {
         newTouch.task(ev, newTouch);
      } else {
         newTouch.moveX = Math.abs(pageX - newTouch.startX);
         newTouch.moveY = Math.abs(pageY - newTouch.startY);
         newTouch.moveRatio = newTouch.moveX / newTouch.moveY;
         for (let task of newTouch.moveTasks) {
            // 如果task返回值为true，则表示手势匹配成功
            if (task(ev, newTouch)) {
               newTouch.task = task;
            }
         }
      }
      ev.preventDefault();
      ev.stopPropagation();
   }, false);

   el.addEventListener("touchend", function (ev) {
      let [{ pageX, pageY }] = ev.changedTouches;
      newTouch.pageX = pageX - newTouch.elementX;
      newTouch.pageY = pageY - newTouch.elementY;
      delete newTouch.task;
      for (let task of newTouch.endTasks) {
         task(ev)
      }
      ev.preventDefault();
      ev.stopPropagation();
   }, false);

   return newTouch;

}
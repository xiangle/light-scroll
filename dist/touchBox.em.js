class Touch {
   constructor(el) {
      this.el = el;
      this.touchstart = [];
      this.touchmove = [];
      this.touchend = [];
      this.startX = 0;
      this.startY = 0;
      this.pageX = 0;
      this.pageY = 0;
      this.moveX = 0;
      this.moveY = 0;
   }
   scroll(move) {
      this.Scroll = function (ev, newObject) {
         let x = Math.round(newObject.pageX - newObject.elementX);
         let y = Math.round(newObject.pageY - newObject.elementY);
         newObject.el.setAttribute("style", `transform:translate(${x}px, ${y}px)`);
         move && move(ev, newObject);
         return true;
      };
      return this;
   }
   scrollX(func) {
      this.touchmove = function (ev, data) {
         let { moveRatio } = data;
         if (moveRatio > 1.8) {
            let x = Math.round(data.pageX - data.elementX);
            data.el.style.transform = `translateX(${x}px)`;
            func && func(ev, data);
            return true;
         }
      };
      return this;
   }
   scrollY(func) {
      return this;
   }
   start(func) {
      this.touchstart.push(func);
      return this;
   }
   move(func) {
      this.touchmove.push(func);
      return this;
   }
   end(func) {
      this.touchend.push(func);
      return this;
   }
   endSpeed(func) {
      this.touchend.push(func);
      return this;
   }
   transitionend(func) {
      this.el.addEventListener("transitionend", ev => {
         func || func(ev, this);
         ev.preventDefault();
      }, false);
      return this;
   }
   animationstart(func) {
      this.el.addEventListener("animationstart", ev => {
         func || func(ev, this);
         ev.preventDefault();
      }, false);
      return this;
   }
   animationiteration(func) {
      this.el.addEventListener("animationiteration", ev => {
         func || func(ev, this);
         ev.preventDefault();
      }, false);
      return this;
   }
   animationend(func) {
      this.el.addEventListener("animationend", ev => {
         func || func(ev, this);
         ev.preventDefault();
      }, false);
      return this;
   }
}

function index (el) {

   if (typeof el === 'string') {
      el = document.querySelector(el);
   } else if (typeof el !== 'object') {
      return
   }

   if (!el) return

   let touch = new Touch(el);

   el.addEventListener("touchstart", function (ev) {
      ev.preventDefault();
      let [{ pageX, pageY }] = ev.changedTouches;
      touch.startX = pageX;
      touch.startY = pageY;
      touch.pageX = pageX;
      touch.pageY = pageY;
      for (let item of touch.touchstart) {
         item(ev);
      }
   }, false);

   el.addEventListener("touchmove", function (ev) {
      ev.preventDefault();
      let [{ pageX, pageY }] = ev.changedTouches;
      touch.pageX = pageX;
      touch.pageY = pageY;
      // 如果application方法存在表示已经识别手势，不再重复判断手势。
      if (touch.application) {
         touch.application(ev);
      } else {
         touch.moveX = Math.abs(pageX - touch.startX);
         touch.moveY = Math.abs(pageY - touch.startY);
         if (touch.moveX) {
            touch.moveRatio = 2;
         } else if (touch.moveY) {
            touch.moveRatio = 0;
         } else {
            touch.moveRatio = touch.moveX / touch.moveY;
         }
         for (let item of touch.touchmove) {
            // 如果task返回值为true，则表示手势匹配成功
            if (item(ev, touch)) {
               touch.application = item;
            }
         }
      }
   }, false);

   el.addEventListener("touchend", ev => {
      ev.preventDefault();
      let [{ pageX, pageY }] = ev.changedTouches;
      touch.pageX = pageX;
      touch.pageY = pageY;
      for (let item of touch.touchend) {
         item(ev);
      }
   }, false);

   return touch;

}

export default index;

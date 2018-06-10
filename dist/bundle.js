var touchBox = (function () {
   'use strict';

   /**
    * 事件基类
    */
   class Base {
      /**
       * Touch容器DOM对象
       * @param {Dom} el 
       */
      constructor(el) {
         this.el = el;
         this.container = el.children[0]; // Touch容器Dom对象
         this.startX = 0; // 起始X坐标
         this.startY = 0; // 起始Y坐标
         this.pageX = 0; // 滑动X坐标
         this.pageY = 0; // 滑动Y坐标
         this.moveX = 0; // 横向滑动距离，滑动X坐标与起始X坐标之间的差值
         this.moveY = 0; // 纵向滑动距离，滑动Y坐标与起始Y坐标之间的差值
         this.lastX = [0, 0, 0]; // 前三个moveX坐标
         this.lastY = [0, 0, 0]; // 前三个moveY坐标
         this.touchstart = []; // touchstart事件队列
         this.touchmove = []; // touchmove事件队列
         this.touchend = []; // touchend事件队列
         this.slideGap = 5; // 初始自由滑动间隙阈值，单位px
         this.direction = 'level'; // touch手势类型，level（水平滑动）、'vertical'（垂直滑动）
         this.dir = 'X'; // 简写的direction值，用于动态切换变量名
         this.distance = 5; // 位移差阈值，用于判断touchend时触点释放的速度，单位px
         this.shift = 0; // 触点释放时的位移量，可用于判断位移方向和速度，单位px
         this.lock = true; // touch状态锁，当为true时会限制所有touchmove、touchend行为，只能通过touchstart解锁
         this.translateStartX = 0; // container横向位移起点
         this.translateStartY = 0; // container纵向位移起点
         this.translateX = 0; // container横向位移
         this.translateY = 0; // container纵向位移
         this.translateEndX = 0; // container横向位移终点
         this.translateEndY = 0; // container纵向位移终点
         this.damping = 6; // 滑动阻尼系数，用于末端缓速
      }
      /**
       * 属性混合
       */
      mixing(...options) {
         Object.assign(this, ...options);
         if (this.direction === 'level') {
            this.dir = 'X';
         } else {
            this.dir = 'Y';
         }
      }
      /**
       * 事件订阅
       * @param {*} name 订阅事件名称
       * @param {*} func 订阅事件回调函数
       */
      on(name, func) {
         if (!this[name]) this[name] = [];
         if (func instanceof Function) {
            this[name].push(func.bind(this));
         } else {
            console.error(`['touch-box'] ${name}事件添加失败，回调必须为函数类型`);
         }
         return this;
      }
      /**
       * 事件发送
       * @param {*} name 发送事件名称
       * @param {*} ev 发送事件内容
       */
      emit(name, ev) {
         if (this[name]) {
            for (let item of this[name]) {
               item(ev);
            }
         }
      }
      /**
       * 设置触点起始坐标
       * @param {Event} ev 
       * @param {Number} pageX
       * @param {Number} pageY
       */
      setStart(ev, pageX, pageY) {

         this.startX = pageX;
         this.startY = pageY;
         this.pageX = pageX;
         this.pageY = pageY;
         this.shift = 0;
         this.gesture = null;
         this.lock = false;
         this.lastX = [0, 0, 0];
         this.lastY = [0, 0, 0];

         // 从transform提取container当前坐标
         let computedStyle = getComputedStyle(this.container, null);
         let transform = computedStyle.transform.split(", ");
         this.translateStartX = parseInt(transform[4]);
         this.translateStartY = parseInt(transform[5]);

         this.emit('touchstart', ev);

      }
      /**
       * 设置移动触点
       * @param {Event} ev 
       * @param {Number} pageX
       * @param {Number} pageY
       */
      setMove(ev, pageX, pageY) {

         this.pageX = pageX;
         this.pageY = pageY;
         this.moveX = pageX - this.startX;
         this.moveY = pageY - this.startY;

         // 手势识别
         this.gestureRecognition(ev);

      }
      /**
       * 触点释放
       */
      setEnd(ev) {

         // 触点释放后的滑动方向判断
         // 计算触点释放时的位移差值，假设触发事件的时间周期固定，位移差可以间接反应位移速度
         let last = this['last' + this.dir];
         this.shift = last[2] - last[0];

         // 正向滑动
         if (this.shift > this.distance) {
            this.emit('touchend-lt', ev);
         }

         // 反向滑动
         else if (this.shift < -this.distance) {
            this.emit('touchend-rb', ev);
         }

         this.emit('touchend', ev);

      }
      /**
       * 手势识别
       */
      gestureRecognition(ev) {

         // 由于触控屏的点阵特性，导致Touch事件的非线性输出，为了避免临界点抖动，取最后三个page坐标求差值
         this.lastX = [this.lastX[1], this.lastX[2], this.pageX];
         this.lastY = [this.lastY[1], this.lastY[2], this.pageY];

         // 手势识别成功
         if (this.gesture) {
            this.emit('touchmove', ev);
         }

         // 手势识别状态
         else {

            // 滑动方向判断，通过起点圆周判坐标比值判断
            let moveX = Math.abs(this.moveX);

            let moveY = Math.abs(this.moveY);

            // 超出起始无效自由滑动区域时确认手势
            if (moveX > this.slideGap || moveY > this.slideGap) {

               // 水平滑动
               if (moveX > moveY) {
                  this.gesture = 'level';
               }

               // 垂直滑动
               else {
                  this.gesture = 'vertical';
               }

               // 未匹配到指定的手势时，禁用Touch
               if (this.gesture !== this.direction) {
                  this.lock = true;
               }

            }

         }

      }
   }

   let defaults = {
      distance: 5,
      damping: 5,
   };

   function scroll (options = {}) {

      Object.assign(options, defaults);

      let autoPlay = () => {
         this.timeID = setTimeout(() => {
            if (this.current < this.amount) {
               let X = ++this.current * this.clientWidth;
               this.el.style.transitionDuration = "450ms";
               this.el.style.transitionTimingFunction = "ease";
               this.el.style.transform = `translateX(${-X}px)`;
               this.carousel();
            }
         }, options.autoPlay);
      };

      let scrollX = () => {
         this.translateX = this.translateStartX + this.moveX;
         this.el.style.transform = `translateX(${this.translateX}px)`;
         options.move && options.move.call(this);
      };

      this.el.style.transform = `translateX(0px)`;

      this.touchstart.push(() => {
         let { transform } = getComputedStyle(this.el, null);
         this.translateStartX = Number(transform.split(", ")[4]);
      });

      this.gesture.push(() => {
         if (this.moveY) {
            if (Math.abs(this.moveX / this.moveY) > 4) {
               this.touchmove.push(scrollX);
            }
         } else {
            this.touchmove.push(scrollX);
         }
      });

      this.touchend.push(() => {
         options.autoPlay && autoPlay();
      });

      return this;
      
   }

   let mixing = {
      loop: false, // 循环模式
      autoplay: 3600, // 自动轮播时间间隔
      transitionDuration: 200, // 动画过渡持续时间
      position: 1, // 卡片起始位置
   };

   /**
    * 刷卡
    * this绑定Touch类实例
    * @param {*} options 
    */
   function swipe (options = {}) {

      this.mixing(mixing, options);

      let { container, direction, dir, el } = this;

      let { clientWidth, clientHeight } = el;

      let { children, childElementCount, style } = container;

      if (!childElementCount) {
         return this
      }

      let WHN; // 宽高name
      let WHV; // 宽高value
      if (direction === 'level') {
         WHN = 'width';
         WHV = clientWidth;
      } else {
         WHN = 'height';
         WHV = clientHeight;
      }

      // 子集批量添加Style样式
      for (let item of children) {
         item.style[WHN] = WHV + 'px';
      }

      // 循环模式下创建闭环节点
      if (this.loop) {

         let { firstElementChild, lastElementChild } = container;

         // 首尾添加交叉重叠元素
         container.appendChild(firstElementChild.cloneNode(true));
         container.insertBefore(lastElementChild.cloneNode(true), children[0]);

         childElementCount += 2;
         this.pid = this.position;

      } else {

         // 非循环模式下元素起始位从0开始
         this.pid = this.position - 1;

      }

      this['translateStart' + dir] = -WHV * this.pid;

      // 设置容器的起始坐标
      style.transform = `translate3d(${this.translateStartX}px, ${this.translateStartY}px, 0px)`;

      // 设置translateEnd初始值
      this['translateEnd' + dir] = -(WHV * this.pid);

      // 容器宽高值
      let containerWHV = WHV * childElementCount;

      style[WHN] = containerWHV + 'px';

      style.transitionDuration = '0ms';

      // 换向补位
      let complement = WHV * (childElementCount - 2);

      // 调整窗口大小
      window.addEventListener('resize', ev => {
         // WHV = this.el.clientWidth
         // containerWHV = WHV * childElementCount;
         // style[WHN] = containerWHV + 'px';
         // this.translateEndX = -(WHV * this.pid)
         // WHV = this.el.clientHeight
         // containerWHV = WHV * childElementCount;
         // style[WHN] = containerWHV + 'px';
         // this.translateEndY = -(clientHeight * this.pid)
         // style.transform = `translate3d(${this.translateEndX}px, ${this.translateEndY}px, 0px)`
         // for (let item of children) {
         //    item.style[WHN] = WHV + 'px'
         // }
      });

      // 自动轮播
      // autoplay();

      this.on('touchstart', ev => {

         // 监听到触点时关闭轮播
         if (this.autoplay) {
            clearTimeout(this.timeID);
         }

         // 如果translateStart不在translateEnd位置，则禁止操作
         if (this["translateStart" + dir] === this["translateEnd" + dir]) {
            this.touchLock = false;
         } else {
            this.touchLock = true;
            return
         }

         style.transitionDuration = "0ms";

      });

      this.on("touchmove", ev => {

         let move = this["move" + dir];
         let translateStart = this["translateStart" + dir];

         // 循环模式，重合点切换
         if (this.loop) {

            let translate = translateStart + move;

            // 正向切换
            if (translate >= 0) {
               this["translate" + dir] = translate + -complement;
            }

            // 反向切换
            else if (translate <= -containerWHV - -WHV) {
               this["translate" + dir] = translate + complement;
            }

            // 居间
            else {
               this["translate" + dir] = translate;
            }

         }

         // 非循环模式，两端使用缓速滑动
         else {

            // 右端滑动
            if (move > 0 && this.pid === 0) {
               move = move / this.damping;
            }

            // 左端滑动
            else if (move < 0 && this.pid === childElementCount - 1) {
               move = move / this.damping;
            }

            this["translate" + dir] = translateStart + move;

         }

         style.transform = `translate3d(${this.translateX}px, ${this.translateY}px, 0px)`;

         // this.move && this.move.call(this)

      });

      // touchend左上
      this.on("touchend-lt", ev => {
         if (this.loop) {
            if (this.pid > 0) {
               --this.pid;
            }
            // 换位
            else {
               this.pid = childElementCount - 3;
            }
         } else {
            if (this.pid > 0) {
               --this.pid;
            }
         }
      });

      // touchend右下
      this.on("touchend-rb", ev => {
         if (this.loop) {
            if (this.pid === childElementCount - 1) {
               this.pid = 2;
            } else {
               ++this.pid;
            }
         } else {
            if (this.pid < childElementCount - 1) {
               ++this.pid;
            }
         }
      });

      this.on("touchend", ev => {

         // 触点释放时自动回归
         this["translateEnd" + dir] = -(WHV * this.pid);
         style.transform = `translate3d(${this.translateEndX}px, ${this.translateEndY}px, 0px)`;
         style.transitionDuration = `${this.transitionDuration}ms`;

         // autoplay()

      });

      return this

   }

   Base.prototype.scroll = scroll;
   Base.prototype.swipe = swipe;

   /**
    * Touch选择器
    * @param {String, DOM} el 指定事件容器父元素 
    */
   function touchBox(el) {

      if (typeof el === 'string') {
         el = document.querySelector(el);
      }

      if (!(el instanceof Object)) {
         console.error('[touch-box] Touch容器不存在');
         return
      }

      if (!el.childElementCount) return

      let touch = new Base(el);

      // 使用第一个子元素作为Touch容器
      let container = touch.container;

      // 支持touch时，优先使用touch
      touch.isTouch = "ontouchend" in document;

      // 绑定Touch事件
      if (touch.isTouch) {

         container.addEventListener('touchstart', function (ev) {

            ev.preventDefault();

            let [{ pageX, pageY }] = ev.changedTouches;

            touch.setStart(ev, pageX, pageY);

         }, false);

         container.addEventListener('touchmove', function (ev) {

            ev.preventDefault();

            if (touch.lock) return

            let [{ pageX, pageY }] = ev.changedTouches;

            touch.setMove(ev, pageX, pageY);

         }, false);

         container.addEventListener('touchend', ev => {

            ev.preventDefault();

            if (touch.lock) return

            touch.setEnd(ev);

         }, false);

      }

      // 绑定Mouse事件
      else {

         container.addEventListener('mousedown', function (ev) {

            ev.preventDefault();

            let { pageX, pageY } = ev;

            touch.setStart(ev, pageX, pageY);

         }, false);

         container.addEventListener('mousemove', function (ev) {

            ev.preventDefault();

            if (touch.lock) return

            let { pageX, pageY } = ev;

            touch.setMove(ev, pageX, pageY);

         }, false);

         container.addEventListener('mouseup', ev => {

            ev.preventDefault();

            if (touch.lock) return

            touch.setEnd(ev);

            touch.lock = true;

         }, false);

         container.addEventListener('mouseout', ev => {

            ev.preventDefault();

            if (touch.lock) return

            touch.setEnd(ev);

            touch.lock = true;

         }, false);

      }

      return touch

   }

   // touch扩展
   touchBox.use = function (name, func) {
      Base.prototype[name] = func;
   };

   return touchBox;

}());

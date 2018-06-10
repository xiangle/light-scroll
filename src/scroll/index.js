let defaults = {
   distance: 5,
   damping: 5,
}

export default function (options = {}) {

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
   }

   let scrollX = () => {
      this.translateX = this.translateStartX + this.moveX;
      this.el.style.transform = `translateX(${this.translateX}px)`;
      options.move && options.move.call(this);
   }

   this.el.style.transform = `translateX(0px)`;

   this.touchstart.push(() => {
      let { transform } = getComputedStyle(this.el, null);
      this.translateStartX = Number(transform.split(", ")[4]);
   });

   this.gesture.push(() => {
      if (this.moveY) {
         if (Math.abs(this.moveX / this.moveY) > 4) {
            this.touchmove.push(scrollX)
         }
      } else {
         this.touchmove.push(scrollX)
      }
   });

   this.touchend.push(() => {
      options.autoPlay && autoPlay();
   });

   return this;
   
}
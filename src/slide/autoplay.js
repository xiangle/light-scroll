const mixing = {
   // autoplay: 3600, // 自动轮播时间间隔
}

export default function (options) {

   if (options instanceof Object === false) {
      throw new Error(`无效配置`);
   }

   return function(ctx) {

      if (ctx.autoplay) {

         // if (ctx.loop) {
         //    if (ctx.pid === ctx.elementCount) {
         //       ctx.pid = 1;
         //       style.transform = `translate3d(${-WHV}px, 0px, 0px)`;
         //       style.transitionDuration = "0ms";
         //    }
         // }

         ctx.timeID = setTimeout(() => {
            if (ctx.pid < ctx.elementCount) {
               ctx.translateEndX = ++ctx.pid * -WHV;
               style.transform = `translate3d(${ctx.translateEndX}px, 0px, 0px)`;
               style.transitionDuration = "450ms";
               autoplay();
            }
         }, ctx.autoplay);

      }

      ctx.on('start', ev => {

         // 监听到触点时关闭轮播
         if (ctx.autoplay) {
            clearTimeout(ctx.timeID);
         }

      })

      // 自动轮播
      // autoplay();

   }

}
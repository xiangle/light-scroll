export default function (options) {

   if (options instanceof Object === false) {
      throw new Error(`无效配置`);
   }

   return function(ctx) {

      const { el } = options;

      if (!el) return;

   }

}

'use strict';

export default function (pagination) {

   if (!(pagination instanceof Object)) return;

   return function (ctx) {

      ctx.pagination = pagination;

      const { el } = pagination;
   
      if (!el) return;

   }

}
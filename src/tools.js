export default {
   /**
    * 通过css选择器获取元素
    */
   getElment(el, error) {

      let elString
      if (typeof el === 'string') {
         elString = el
         el = document.querySelector(el)
      }

      if (!(el instanceof Object)) {
         console.error(error || `选择器${elString}未找到元素`)
         return
      }

      return el

   }
}
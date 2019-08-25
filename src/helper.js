export default {
   /**
    * 通过css选择器获取元素
    */
   getElment(element) {

      if (typeof element === 'string') {
         const elementNode = document.querySelector(element);
         if (elementNode === null) {
            throw new Error(`选择器${element}未找到元素`);
         }
         return elementNode;
      } else if (element instanceof Element === false) {
         throw new Error(`元素不存在`);
      }

      return element;

   }
}
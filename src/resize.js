export default function () {
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
    })
}
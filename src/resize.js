export default function () {
    // 调整窗口大小
    window.addEventListener('resize', ev => {
        // WHV = this.box.clientWidth
        // containerWH = WHV * childElementCount;
        // style[WHN] = containerWH + 'px';
        // this.translateEndX = -(WHV * this.pid)
        // WHV = this.box.clientHeight
        // containerWH = WHV * childElementCount;
        // style[WHN] = containerWH + 'px';
        // this.translateEndY = -(clientHeight * this.pid)
        // style.transform = `translate3d(${this.translateEndX}px, ${this.translateEndY}px, 0px)`
        // for (let item of children) {
        //    item.style[WHN] = WHV + 'px'
        // }
    })
}
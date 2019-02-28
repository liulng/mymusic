(function(window){
    function Progress($progressBar,$progressLine,$progressDot){
        return new Progress.prototype.init($progressBar,$progressLine,$progressDot)
    }
    Progress.prototype={
        constructor:Progress,
        isMove:false,
        init:function($progressBar,$progressLine,$progressDot){
            this.$progressBar=$progressBar;
            this.$progressLine=$progressLine
            this.$progressDot=$progressDot
        },
        progressClick:function(callBack){
            //监听背景的点击
            var $this=this//此时的this是progress，谁调用（触发）了这个方法，这个方法里面的this就是谁
            this.$progressBar.click(function(event){ 
                var normalleft=$(this).offset().left
                // console.log(normalleft)
                var eventleft=event.pageX//原生中为clientX
                // console.log(eventleft)
                $this.$progressLine.css("width",eventleft-normalleft)
                $this.$progressDot.css("left",eventleft-normalleft)
                var value=(eventleft-normalleft)/$(this).width()
                callBack(value)


            })
        },
        progressMove:function(callBack){
            var $this=this
            var normalleft=this.$progressBar.offset().left
            this.$progressBar.mousedown(function(){//注意click是按下后抬起才算
                 $this.isMove=true//使拖拽时的进度条不再更新，避免了事件冲突
                 var eventleft
                 var disLeft
               //为了提高用户体验在整个文档监听鼠标移动事件
                $(document).mousemove(function(event){//用jQuery时，除了已经赋值给变量，其他都要记得$()
                    $this.isMove=true
                    eventleft=event.pageX
                    disLeft=eventleft-normalleft
                    if(disLeft>=$this.$progressBar.width()){
                       disLeft=$this.$progressBar.width()
                    }
                    else if(disLeft<=0){
                        disLeft=0
                    }
                    $this.$progressLine.css("width",disLeft)
                    $this.$progressDot.css("left",disLeft)
                })
                $(document).mouseup(function(){
                    //鼠标抬起后移出鼠标移动事件
                    var value=disLeft/$this.$progressBar.width()
                    callBack(value)
                    $this.isMove=false
                    $(document).off("mousemove mouseup")
                    //重点注意（问题）：由于这是把事件加在ldocument身上，所以一定要把mousemove和mouseup事件解绑，否则进度条那，下一首时点击暂停后进度条会错跳。
                   
                })
                return false//阻止默认行为

            })
        },
        setProgress:function(value){
            if(this.isMove)return;
            if(value<0||value>100)return;
            this.$progressLine.css({
                width:value+"%"
            })
            this.$progressDot.css({
               left:value+"%"
            })
        }
    }
    Progress.prototype.init.prototype=Progress.prototype
    window.Progress=Progress

})(window)
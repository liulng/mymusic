(function(window){
    function Lyric(path){
        return new Lyric.prototype.init(path)
    }
    Lyric.prototype={
        constructor:Lyric,
        init:function(path){
            this.path=path

        },
        times:[],//用来保存所有的时间
        lyrics:[],//用来保存所有的歌词
        index:-1,
        loadLyric:function(callBack){//获取歌词
            var $this=this
            $.ajax({
                url:this.path,//在谷歌浏览器中打开会失败
                dataType:"text",
                success:function(data){
                  $this.parseLyric(data)
                  callBack()//歌词加载完且解析好后执行回调
                  //console.log(this)
                },
                error:function(e){
                    console.log(e)
                }
            })
        },
        parseLyric:function(data){//解析歌词文件
            var $this=this
            $this.times=[]//清空上一首歌曲的时间和歌词
            $this.lyrics=[]
            var array=data.split("\n")
            //遍历取出每一条歌词
            var timeReg=/\[(\d*:\d*\.\d*)\]/ //加入()是为了分组，将()中的内容当成一个整体，以后也会将其内容取出来
            $.each(array,function(index,ele){
                var lrc=ele.split("]")[1]
                if(lrc.length==1){return true}//排除空字符串，因为有些时间对应的是没有歌词的,且时间直接是00:01e没有[]
                $this.lyrics.push(lrc)
                var reg=timeReg.exec(ele)//reg.exec(ele)用正则表达式去匹配ele,会返回匹配到的结果，即ele中满足reg形式的内容
                // console.log(reg)
                if(reg==null){
                    return true//相当于continue，执行下一次循环（这里为遍历）
                }
                var timeStr=reg[1]//00:00.92,reg[0]为[00:00.92]
                var reg2=timeStr.split(":")
                var time=parseFloat(Number(parseInt( reg2[0])*60+parseFloat(reg2[1])).toFixed(2)) 
                //console.log(typeof(time) )
                $this.times.push(time)
                //console.log($this.times)
                //console.log( $this.lyrics)
               
            })
        },
        currentIndex:function(currentTime){//歌词对应时间与播放时间比较，得到index，以此跳转到对应歌词.
            if(currentTime>=this.times[this.index+1]){
                this.index++
                //this.times.shift()
            }
            return this.index

        }
    }
    Lyric.prototype.init.prototype=Lyric.prototype
    window.Lyric=Lyric

})(window)
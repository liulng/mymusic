
    (function(window){
        function Player($audio){
            return new Player.prototype.init($audio)
        }
        Player.prototype={
            constructor:Player,
            musicList:[],//这个值用来保存通过ajax获取到的音乐数据，将在index.js文件的ajax函数中赋值
            init:function($audio){
                this.$audio=$audio;//this.$audio是init函数自身属性被赋值为传入的参数$audio
                this.audio=$audio.get(0)//上面的$audio是jQuery封装好了的audio对象，而$audio.get(0)是原生的audio标签
            },
            currentIndex:-1,
            playMusic:function(index,music){
                //判断是否是同一首音乐
               
                if(this.currentIndex==index){//同一首歌
                    if(this.audio.paused){
                        this.audio.play()
                    }
                    else{
                        this.audio.pause()
                    }
                }
                else{//不是同一首歌
                    this.$audio.attr("src",music.link_url)
                    //this.$audio.attr("src",music.link_url)//这里不是同一首歌点击，audio的src已经改变，上一首歌便不会再播放
                    this.audio.play()
                    this.currentIndex=index;
                }

            },
            preIndex:function(){//处理索引的函数,播放上一首时判断当前是否为第一首
                var index=this.currentIndex-1
                if(index<0){
                    index=this.musicList.length-1;
                }
                return index;

            },
            nextIndex:function(){//播放下一首时判断当前是否为最后一首
                var index=this.currentIndex+1
                if(index>this.musicList.length-1){//最后一首的索引为musicList.length-1
                    index=0;
                }
                return index;

            },
            changeMusic:function(index){
                //从内存中删除删除按钮点击的对应的音乐数据
                this.musicList.splice(index,1)
                //判断当前删除的是正在播放的音乐前面的音乐
                if(index<this.currentIndex){
                    this.currentIndex-=1;
                }
            },
           
            timeUpdate:function(callBack){
                var $this=this
                this.$audio.on("timeupdate",function(){//注意timeupdate是audio上本身具有的一个事件
                    var duration=$this.audio.duration//audio的总时长,注意这里要用原生的audio
                    var currentTime=$this.audio.currentTime;//现在播放的时长单位s
                    // console.log(duration)
                    // console.log(curreentTime)
                    var timeStr1=$this.formatDate(currentTime)
                    var timeStr2=$this.formatDate(duration)
                    var timeStr=timeStr1+"/"+timeStr2
                    callBack(duration,currentTime,timeStr)
                    // $(".progresstime").text(timeStr1+"/"+timeStr2)
                })
                
            },
            formatDate:function(time){
                var Minute=parseInt(time/60)
                var Second=parseInt(time%60) 
                if(Minute<10){
                    Minute="0"+Minute
                }
                if(Second<10){
                    Second="0"+Second
                }
                return `${Minute}:${Second}`
            },
            musicSeekTo:function(value){
                if(isNaN(value))return;
                this.audio.currentTime=this.audio.duration*value

            },
            musicVoiceSeekTo:function(value){
                if(isNaN(value))return;
                if(value>1||value<0)return;
                this.audio.volume=value ;//volum的取值范围为0-1

            }
            
        }
        Player.prototype.init.prototype=Player.prototype
        window.Player=Player;
        
    })(window)
$(function(){
    var $audio=$("audio")
    var player=new Player($audio)//后面这个player是player.js文件中的函数，该js文件是在html文件中时限引入了的
    //注意重点：经过几次检验得出var player=new Player($audio)时前面的变量不能和后面new的对象一样。
    var $progressBar=$(".progressbar")
    var $progressLine=$(".progressline")
    var $progressDot=$(".progressdot")
    var lyric
    var progress=new Progress($progressBar,$progressLine,$progressDot)
   //监听进度条背景的点击
    progress.progressClick(function(value){
        player.musicSeekTo(value)

    })
    progress.progressMove(function(value){
        player.musicSeekTo(value)
    })
  
    //自定义滚动条
    $(".contentlist").mCustomScrollbar()
    //获取歌曲列表
    getplayerlist()
    function getplayerlist(){
        $.ajax({
            url:"./source/musiclist.json",//在谷歌浏览器中打开会失败
            dataType:"json",
            success:function(data){
                player.musicList=data;//将通过ajax得到的数据传入到player对象中
                console.log(data)
                //遍历获取到的数据，创建每一条音乐
                var $contentlist= $(".contentlist ul")//因为each会遍历整个数组，所以先定义原有的节点，避免多次遍历导致的多次定义
                $.each(data,function(index,ele){//data是获取到的数据为json格式，后面index,ele是遍历data时data数据的索引和数据本身。
                    var $item=createMusicItem(index,ele)
                    $contentlist.append($item)
                })
                //初始化歌曲信息
                initMusicinfo(data[0])
                //初始化歌词信息
                initMusicLyric(data[0])

                
            },
            error:function(e){
                console.log(e)
            }
        })
    }
    //初始化歌曲信息
    function initMusicinfo(music){
        //获取对应的元素
        var $musicImg=$(".songinfopic img")
        var $musicName=$(".songinfoname a")
        var $musicSinger=$(".songinfosinger a")
        var $musicAlbum=$(".songinfoalbum a")
        var $musicProgressName=$(".progressname")
        var $musicProgressTime=$(".progresstime")
        var $musicBg=$(".backgr")
        //给获取到的元素赋值
        $musicImg.attr("src",music.cover)
        $musicName.text(music.name)
        $musicSinger.text(music.singer)
        $musicAlbum.text(music.album)
        $musicProgressName.text(music.name+" / "+music.singer)
        $musicProgressTime.text("00:00 / "+music.time)
        $musicBg.css("background","url('"+music.cover+"')")
    }
    //初始化歌词信息
    function initMusicLyric(music){//通过第一次ajax只能的到歌词信息的地址
        lyric=new Lyric(music.link_lrc)
        var $lyricContainer=$(".songlyric")
        //清空上一首歌曲的歌词
        $lyricContainer.html("")
        lyric.loadLyric(function(){
            $.each(lyric.lyrics,function(index,ele){//注意这里lyric.不能用this.这里的this指向不是lyric
                var $item=$("<li>"+ele+"</li>")
                $lyricContainer.append($item)
            })

        })
    }
    function createMusicItem(index,music){//注意这里的music只是一个形参，调用时是ajax获取到的data的数据对象ele0000000000
        var item=$(
            "<li  class=\'listmusic\'>\n"+
                "<div class=\"listcheck\"><i></i></div>\n"+
                "<div class=\"listnumber \">"+(index+1)+"</div>\n"+
                "<div class=\"listname\">"+music.name+"\n"+
                "<div class=\"listmenu\">\n"+
                    "<a href=\"javaScript::\" title=\"播放\" class=\"listmenuplay\"></a>\n"+
                    "<a href=\"javaScript::\" title=\"添加\"></a>\n"+
                    "<a href=\"javaScript::\" title=\"下载\"></a>\n"+
                    "<a href=\"javaScript::\" title=\"分享\"></a>\n"+
                "</div>\n"+
                "</div>\n"+
                "<div class=\"listsinger\">"+music.singer+"</div>\n"+
                "<div class=\"listtime\">\n"+
                    "<span>"+music.time+"</span>\n"+
                    "<a href=\javaScript::\" title=\"删除\" class=\"listmenudel\"></a>\n"+
                "</div>\n"+
        "</li>")
        item.get(0).index=index//现在的item就是一个li标签对象，所以item.get(0)拿到的就是该原生li标签
        item.get(0).music=music
//自己添加的
        item.eq(0).attr("lyricindex",0)

        return item;

    }
    //初始化事件监听
    initEvents()
    function initEvents(){
        //1.监听歌曲的移入移出事件
        //由于歌曲后面动态加载进来的，所以不能直接在加载的歌曲上操作要使用事件委托
        // $(".listmusic").hover(function(){
        $(".contentlist").delegate(".listmusic","mouseenter",function(){
            $(this).find(".listmenu").stop().fadeIn(100)//这里有个注意点不能用$(".listname")否则会找到所有listname
            $(this).find(".listtime a").stop().fadeIn(100)
            $(this).find(".listtime span").stop().fadeOut(100)
        })
        $(".contentlist").delegate(".listmusic","mouseleave", function(){
            $(this).find(".listmenu").stop().fadeOut(100)
            $(this).find(".listtime a").stop().fadeOut(100)
            $(this).find(".listtime span").stop().fadeIn(100)
        })
        
        //2.监听复选框点击事件,事件委托
        $(".contentlist").delegate(".listcheck","click",function(){
            $(this).toggleClass("listchecked")//切换类，没有该类就添加，有就删除
        })
        //3.添加子菜单播放按钮的监听
        $(".contentlist").delegate(".listmenuplay","click",function(){
            var $listmusic=$(this).parents(".listmusic")
            if($listmusic.attr("lyricindex")==0){//当是一首歌暂停和播放时只需第一次更新歌曲和歌词信息即可
                initMusicinfo($listmusic.get(0).music)//注意这个$listmusic是jquery封装好的对象，这里不要忘了用get(0)来获取原生标签元素
                initMusicLyric($listmusic.get(0).music)//切换歌词信息
            }
            $listmusic.siblings().attr("lyricindex",0)
            $(this).toggleClass("listmenuplay2")
           // console.log( $listmusic.get(0).index)
            //复原其他音乐的图标,找到自己的整条歌曲的父元素，再找父元素的其他兄弟节点，再在其他兄弟节点中找到listmenuplay的子节点
            $listmusic.siblings().find(".listmenuplay").removeClass("listmenuplay2")
            $listmusic.siblings().find("div").css("color","rgba(255,255,255,0.5)")
            $listmusic.siblings().find(".listnumber").removeClass("listnumber2")
            $listmusic.find(".listnumber").toggleClass("listnumber2")
            //使底部的播放按钮同步，注意这里的判断语句，如果用单纯的toggleclass则会出错
            if($(this).attr("class").indexOf("listmenuplay2")!=-1){
                //如果子菜单为播放状态，则下面的播放按钮要与其一样
                $(".musicplay").addClass("musicplay2")
                //让文字高亮
                $listmusic.find("div").css("color","#fff")
                //
            
            }
            else{//子菜单为暂停状态，下面的播放按钮也为暂停
                $(".musicplay").removeClass("musicplay2")
                $listmusic.find("div").css("color","rgba(255,255,255,0.5)")
                
            }
            $listmusic.attr("lyricindex",1)
            //播放音乐
            player.playMusic( $listmusic.get(0).index, $listmusic.get(0).music)
        
        })

        //4.监听底部控制区域播放按钮，原理是通过触发某一首歌曲的播放按钮实现歌曲的播放和暂停
        $(".musicplay").click(function(){
            //通过currentIndex判断是否播放过音乐
            if(player.currentIndex==-1){//没有播放过音乐,则播放第一首
                $(".listmusic").eq(0).find(".listmenuplay").trigger("click")

            }
            else{//已经播放过音乐，通过找到已将播放的音乐的index去找到该元素，再在该元素上实行播放按钮
                $(".listmusic").eq(player.currentIndex).find(".listmenuplay").trigger("click")
            }
        })
        //5.监听底部控制区域上一首播放按钮
       $(".musicpre").click(function(){
            $(".listmusic").eq(player.preIndex()).find(".listmenuplay").trigger("click")
        
       })
        //6.监听底部控制区域下一首播放按钮
        $(".musicnext").click(function(){
                $(".listmusic").eq(player.nextIndex()).find(".listmenuplay").trigger("click")
        })
        //7.监听删除按钮的点击
        $(".contentlist").delegate(".listmenudel","click",function(){
            var $item=$(this).parents(".listmusic")//找到当前删除按钮所对应的音乐
           //判断当前删除的是否是在播放的
            if($item.get(0).index==player.currentIndex){
                $(".musicnext").trigger("click")
            }
            $item.remove()//从界面上删除此元素
            //在内存中删除此元素
            player.changeMusic($item.get(0).index)
            
            
            //其他音乐重新排序
            $(".listmusic").each(function(index,ele){//遍历剩下的listmusic
                //注意此时的参数index为剩下的音乐各自对应的索引,ele为每一条音乐
                ele.index=index;
                $(ele).find(".listnumber").text(index+1)

            })
        })
        //8.监听音乐播放进度
       player.timeUpdate(function(duration,currentTime,timeStr){
           $(".progresstime").text(timeStr)
           var value=currentTime/duration*100
           progress.setProgress(value)
           //实现歌词的同步
           var index=lyric.currentIndex(currentTime)
           var $item=$(".songlyric li").eq(index)
           $item.addClass("current")
           $item.siblings().removeClass("current")
           if(index<=0)return;//这个index<0可以改为其他值，如index<2则下面marginTop:(-(index+2)*30)使跳转的歌词在中间
           $(".songlyric").css({
               marginTop:(-index*30)+'px'
           })
       })
       //9.监听声音按钮的点击
       $(".musicvoiceicon").click(function(){
           $(this).toggleClass("musicvoiceicon2")
           if($(this).attr("class").indexOf("musicvoiceicon2")!=-1){
               //变为没有声音
               player.musicVoiceSeekTo(0)
           }
           else{
               //变为有声音
               player.musicVoiceSeekTo(1)
           }
       })
       //10.监听声音进度条背景的点击
       var $musicvoicebar=$(".musicvoicebar")
       var $musicvoiceline=$(".musicvoiceline")
       var $musicvoicedot=$(".musicvoicedot")
       var voiceprogress=new Progress($musicvoicebar,$musicvoiceline,$musicvoicedot)
       voiceprogress.progressClick(function(value){
           player.musicVoiceSeekTo(value)
       })
       voiceprogress.progressMove(function(value){
            player.musicVoiceSeekTo(value)
          
       })
        //11.监听循环模式点击
        $(".musicmode").click(function(){
            if($(this).attr("class").includes("musicmode3")){
                $(this).removeClass("musicmode2 musicmode3")
            }
            else if($(this).attr("class").includes("musicmode2")==false){
                $(this).addClass("musicmode2")
            }
            else{
             $(this).addClass("musicmode3")
            }
        })
        //12.监听播放完成事件
        $audio.on("ended",(function(){
            $(".musicplay").removeClass("musicplay2")
            $(".listmenuplay").removeClass("listmenuplay2")
            lyric.index=-1;
            var musicmode= $(".musicmode")
            if(musicmode.attr("class")=="musicmode"){//单曲循环模式
                $(".listmusic").eq(player.currentIndex).find(".listmenuplay").trigger("click")
            
            }
            else if(musicmode.attr("class").includes("musicmode3")){//随机播放
    
            }
            else{//循环播放
                $(".listmusic").eq(player.nextIndex()).find(".listmenuplay").trigger("click")
            }
            })
        )
        //13.监听收藏点击事件
        $(".musicfav").click(function(){
            $(this).toggleClass("musicfav2")
        })

    }
    
   

    
    


  
})
var keyword_view=['去浏览','去完成'] //浏览任务包含关键词，中间用逗号隔开，几个是或者的关系，满足任意一个即可
var keyword_only_click=['签到','收下祝福','确认','刷新重试','弹窗关闭按钮','点击签到领喵币','去兑换','领取奖励']//只需要点击的任务
var keyword_one=['gif;base64','点击唤起淘宝']//只需要完成一次的任务,且按键一直在那
var n_one=0//只需要完成一次的任务,从几号任务开始

var keyword_same='领取任务'//名称相同的任务
var i_same=0,i_same_max=3//防止一直进行同一个任务,同一个任务执行上限
var keyword_back=['任务完成','任务已完成','返回领取','任务失败'] //浏览界面返回的关键词，两者是或者的关系
var n_time=6 //在浏览界面循环滑动次数上限（再多就返回了），一次大概5到7秒
var search_time=1000 //寻找按键的最长时间 ms
var app_task=[['com.taobao.taobao','淘宝'],['com.tmall.wireless','天猫'],['com.eg.android.AlipayGphone','支付宝']]
//'com.taobao.taobao','淘宝'
//'com.tmall.wireless','天猫'
//'com.eg.android.AlipayGphone','支付宝'
var n_app=0 //从几号应用开始,从零开始计数
var n_time_app=2//重复打开应用次数
var n_app_end=app_task.length*n_time_app-1//到几号停止，,从零开始计数
var btn
var i = 0 ,loop=0,i_taobaolife=0,i_taobaofarm=0;
var password='111111'//锁屏密码
//主函数开始
var now =new Date()
var star_time=0*60+3

take_task()//做任务
rexit()
//main()//用于定时执行

function main(){
    var count_times=3,wait_time
    var gap=60
    
    while(count_times--){
        while(now.getHours()*60+now.getMinutes()>=star_time){
            //等到第二天才开始
            wait_time=(24*60+star_time-now.getHours()*60-now.getMinutes())*10+1
            toastLog("等待时间"+wait_time+'s')
            sleep(wait_time*1000)
            now =new Date()
        }
        while(now.getHours()*60+now.getMinutes()<star_time){
            //一直等到任务开始
            wait_time=(star_time-now.getHours()*60-now.getMinutes())*10+1
            toastLog("等待时间"+wait_time+'s')
            sleep(wait_time*1000)
            
            now =new Date()
        }
        unlock(password)
        take_task()
        star_time+=gap
    }

}
//解锁

function unlock(p){
    //息屏状态下解锁
    if(!p){
        //导入密码为空，返回
        return 0
    }
    if(device.isScreenOn()){
        return 0       
    }
    toastLog('解锁')
    if(!device.isScreenOn()){
        device.wakeUp()
    }
    for(let i=0;i<2;i++){
        swipe(device.width*0.5,device.height*0.9,device.width*0.5,device.height*0.1,1000);
    }
    sleep(1000)
    for(let i=0;i<p.length;i++){
        text(p[i]).click()
    }
    //textContains('').click()
    click(device.width*0.85,device.height*0.85)
} 

function take_task(){
    //做任务
    var activity_game
    auto.waitFor()
    console.show()
    prepareThings()//请求截图权限

    while(true) {
          
        if(btn=find_btn_eq(keyword_only_click)){
            //中间突然跳出的界面,只需点击的那种，或者只需点击就行的按键
            if(btn.clickable()){
                rsleep(1)
                btn.click()
            }else{
                rsleep(1)
                click(btn.bounds().centerX(),btn.bounds().centerY())
            }

        }else if(find_btn(keyword_view)!= null && text("做任务，领喵币").exists()) {
            //浏览任务
            view_main(keyword_view,keyword_back)
        }else if(text('去观看').exists() && text("做任务，领喵币").exists()) {
            //观看任务
            view_main(['去观看'],keyword_back,undefined,8,0,0)
        }else if( btn=text(keyword_same).findOnce(parseInt(i_same/i_same_max)) ){
            btn.click()
            
            view(1)
            //防止多次进入同一个活动
            if(activity_game!=currentActivity()){
                activity_game=currentActivity()
                toastLog('进入了'+activity_game)
            }else{                
                toastLog('重复进入了'+activity_game)
            i_same++

            }
            i_same++
            back()
            sleep(1000)
            if(!text("做任务，领喵币").exists()){
                rsleep(1)
                back()                
            }
            
        }else if(i_taobaofarm<i_same_max && (btn=find_btn_eq(['去收菜'])) ){
            //农场收菜
            i_taobaofarm++
            btn.click()
            toastLog('进入农场')
            sleep(5000)
            gamecanvas()
            sleep(1000)
            if(!text("做任务，领喵币").exists()){
                rsleep(1)
                back()                
            }
        }else if(i_taobaolife<i_same_max && (btn=find_btn_eq(['去逛逛'])) ){
            //淘宝人生，按键位置需要根据自己手机调整

            i_taobaolife++

            btn.click()
            sleep(10000)
            toastLog('进入淘宝人生中')
            text('淘宝人生').findOne(20000)
            toastLog('等待签到界面中')
            rsleep(5)
            click_by_color("#FF9A67")//领取喵币
            rsleep(2)
            click_by_color("#FF8544")//确认领取
            back()
            rsleep(1)
            back()
            rsleep(2)
            toastLog('等待返回')
            click_by_color("#FF8544")//返回

        }else if(n_one<keyword_one.length && (btn=find_btn([keyword_one[n_one]]))){
            //只需完成一次的任务
            n_one++
            btn.click()
            view(2)
            back()
            if(!text("做任务，领喵币").exists()){
                rsleep(1)
                back()                
            }
        }else if(n_app<=n_app_end){
            //如果不是所有的app都结束了，继续下一个
            if(loop<3){
                //检查是否中途离开了任务界面
                toastLog('没有发现任务，检查是否在任务界面')
                enter_task(app_task[n_app%3][0],app_task[n_app%3][1])
                loop++
            }else{
                loop=0
                i_same=0
                n_app++
            }
            
            
        }else {
            //找不到满足条件的按键，返回
            toastLog("\n脚本运行完毕\n模拟浏览任务全部完成（大概）")
            sleep(5000)
            return 0
            //rexit()
        }
    }
}
function prepareThings(){
    //请求截图权限
    setScreenMetrics(device.width, device.height);
    //toastLog("test1");
    //请求截图
    if(!requestScreenCapture()){
        toastLog("请求截图失败,脚本退出");
        exit();
    }
    sleep(3000);
    //toastLog("test2");
}
function getCaptureImg(){    
    //截图
    var img0 = captureScreen();
    sleep(100);
    if(img0==null || typeof(img0)=="undifined"){
        toastLog("截图失败,脚本退出");
        exit();
    }else{
       return img0;
    }
}
function click_by_color(color){
    //找到对应颜色的区域，并点击 
    img = getCaptureImg()
    var point = findColor(img,color, {
        region: [device.width*0.4, device.height*0.5, device.width*0.55, device.height*0.45],
        threshold: 2
    })
    if(point){
        toastLog("找到对颜色坐标，为(" + point.x + ", " + point.y + ")")
        click(point.x,point.y)
    }else{
        toastLog('未找到')
    }
    sleep(1000)
}
function enter_task(packagename,appname){
    //进入618活动的任务界面,并领取自动产生的喵币
    var btn,btn2,i=0
    if(currentPackage() != packagename){
        //没有打开应用的话，打开应用
        open_app(packagename,appname)
        toastLog('-----第'+(parseInt(n_app/3)+1)+'次打开'+appname+'-----')
        sleep(5000)
    }
    
    
    btn=enter_acticity(packagename,appname)
    i=0
    while(!text("关闭").exists()){
        //进入活动界面
        if(i%2==0){
            sleep(2000)
            if(btn2=text('打开图鉴').findOne(search_time)){
                //领取自动产生的喵币
                click(device.width*0.5,btn2.bounds().centerY())
                toastLog('已领取自动产生的喵币')
                rsleep(2)
            }
            sleep(1000)
            btn=enter_acticity(packagename,appname)
            if(!btn){
                return 0
            }
            btn.click()
        }else if(i<6){
            toastLog('等待任务界面中')
            sleep(1000)
        }else{
            toastLog('未找到，退出脚本')
            rexit()
        }
        i++
    }
    if(i>0){
        toastLog('已进入'+app_task[n_app%3][1]+'的任务界面')
    } 
    
    return true
}
function enter_acticity(packagename,name){
    //进入活动界面
    let i=0,btn,btn2,btn3
    while(!(btn=text("做任务，领喵币").findOne(search_time*0.5))){
        //不是任务界面的话，进入任务界面
        if((btn2=descContains('搜索').findOne(search_time*0.5)) && find_btn('扫')){
            //如果在主界面，进入任务界面
            btn2.click()
            sleep(search_time)
            if(btn2=text('618列车').findOne(search_time*2)){
                toastLog('点击618列车')
                btn2.parent().click()
                sleep(10000)//等待10s进入活动界面
            }else{
                if(btn2=className('android.widget.EditText').findOne(search_time*1)){
                    //搜索618列车，以进入活动界面
                    btn2.setText("618列车")
                    btn3=text('搜索').clickable(true).findOne(search_time) || desc('搜索').clickable(true).findOne(search_time)
                    btn3.click()
                    sleep(10000)//等待10s进入活动界面
                } 
            }
       
            
        }else if(i%7<6){
            toastLog('未找到活动界面，第'+(i+1)+'次等待中')
            sleep(2000)
            i++
        }else if(parseInt(i/7)<3){
            open_app(packagename,name)
            toastLog('等待太久，尝试返回')
            back()
            //sleep(500)
            //back()
            sleep(1000)
            if(btn2=text('618列车').findOne(search_time*2)){
                toastLog('点击618列车')
                btn2.parent().click()
                sleep(10000)//等待10s进入活动界面
            }        
            i++
        }else if(parseInt(i/7)<4){
            //尝试重启应用
            toastLog('尝试重启应用'+packagename)
            home()
            sleep(1000)
            appclose(packagename)
            sleep(1000)
            open_app(packagename,name)
            i++
        }else{
            toast('尝试下一个应用')
            loop=0
            n_app++
            return 0
        }
        
    }    
    return btn
}
function open_app(packagename,name){
    name=arguments[1] ? arguments[1] : ''
    let k=0
    launch(packagename)

    while(currentPackage() != packagename){
        //还没打开的话，退出脚本
        sleep(2000)
        launch(packagename)
        
        k++
        if(k>5){
            toast('无法打开'+name+'，开始下一个')
            return 0
        }

    }
}
function enter_tianmao(){
    toastLog('待完成')
}   
//模拟浏览（浏览会场任务），存在按键返回1，否则返回0,judge_back为是否在浏览后返回
function view_main(keyword_view,keyword_back,judge_back,n,i,n_slide){
    judge_back=arguments[2] ? arguments[2] : 1//judge_back默认为1，即默认在浏览后返回
    n=arguments[3] ? arguments[3] : n_time
    i=arguments[4] ? arguments[4] : 0//选取第几个按键
    if(arguments[5]==undefined){
        n_slide=2
    }else{
        n_slide=arguments[5]
    }
    
    
    let btn=find_btn(keyword_view,1,i)
        btn.click()
        view(n,keyword_back,n_slide)
        if(judge_back){
            toastLog('返回任务界面')
            back()
        }
}
//浏览
function view(n,keyword,n_slide){
    n=arguments[0] ? arguments[0] :n_time
    keyword=arguments[1] ? arguments[1] :keyword_back
    if(n_slide==undefined){
        n_slide=2
    }
    let j=0
    while(j<n){
        if(find_btn(keyword)!=null){
            rsleep(1)
            return 0
        }
        rsleep(1) 
        rslide(n_slide) 
        rsleep(1) 
        rslideR(n_slide-1)         
        j++
    } 
}
//收菜
function gamecanvas(){
    var btn=textContains('TB1ECFDJKL2').findOne(3000)
    rclick_by_btn(btn)
    sleep(10000)

    btn=text('天猫农场').findOne(2000)
    if(!btn){
        return 0
    }

    var GatherBtn = className("android.view.View").text("立即去收").findOnce();
    if (GatherBtn) {
        var GatherBtnBounds = GatherBtn.bounds();
        click(GatherBtnBounds.centerX(), GatherBtnBounds.centerY());
        sleep(2000);
    }

    if(text("兑换专享好券").exists() && text('更多').exists()){
        toastLog('找到参考控件')
        x1=text("兑换专享好券").findOnce(0).bounds().right
        x2=text('更多').findOnce(0).bounds().left
    }else{
        x1=btn.bounds().centerX()-device.width*0.25
        x2=btn.bounds().centerX()+device.width*0.25
    }

    y1=btn.bounds().centerY()-device.height*0.15
    y2=btn.bounds().centerY()+device.height*0.2

    for(var row=y1;row<y2;row+=80){
        for(var col=x1;col<x2;col+=80){
            click(col,row);
        }
    }
    back()
    rsleep(2)   
}
//找到text或者desc包含文本s的按钮并返回，找不到返回null
function find_btn(s,judge_print,i){
    judge_print=arguments[1] ? arguments[1] :  0//判断是否输出日志
    i=arguments[2] ? arguments[2] :  0//选取第几个按键
    let btn=null 
    for(let j=0 ;j<s.length; j++){

        if(btn=textContains(s[j]).findOnce(i)|| descContains(s[j]).findOnce(i)){
            if(judge_print){
                toastLog('找到了'+btn.parent().child(0).text()+' ，text为'+btn.text())
            }
            return btn
        }            

        }        

    return btn
}
function find_btn_eq(s){
    //找到拥有完全相同text或desc的按钮
    var btn
    for(let j=0 ;j<s.length; j++){
        if(btn=text(s[j]).findOne(search_time*0.1)||desc(s[j]).findOne(search_time*0.1)){
            return btn
        }
    }
    return btn
}
//随机延时
function rsleep(n) {
    while (n--) {
        sleep(random(900, 1200)) 
    }
}

//随机向下划屏，持续1.2s-1.5s
function rslide(i) {
    if(i<=0){
        rsleep(1)
        return -1
    }
    while (i--) {
        let x1 = random(device.width*0.4, device.width*0.6) 
        let y1 = random(device.height*0.7, device.height*0.9) 
        let x2 = random(device.width*0.4, device.width*0.6) 
        let y2 = random(device.height*0.4, device.height*0.6) 
        swipe(x1, y1, x2, y2, 400) 
        rsleep(1) 
    }
}
//随机向上划屏，持续1.2s-1.5s
function rslideR(i) {
    if(i<=0){
        rsleep(1)
        return -1
    }
    while (i--) {
        let x1 = random(device.width*0.4, device.width*0.6) 
        let y1 = random(device.height*0.4, device.height*0.6) 
        let x2 = random(device.width*0.4, device.width*0.6) 
        let y2 = random(device.height*0.7, device.height*0.9) 

        swipe(x1, y1, x2, y2, 300) 
        rsleep(1) 
    }
}
function rclick(s){
    //根据文本找到按钮并点击
    let btn
    if(btn=textContains(s).findOne(search_time*0.25) || descContains(s).findOne(search_time*0.25)){
        if(btn.clickable()){
            btn.click()
        }else{
            click(btn.bounds().centerX(),btn.bounds().centerY())
        }
    }
}
function rclick_by_btn(btn){
    //点击按钮
    if(!btn){
        return -1
    }
    if(btn.clickable()){
        btn.click()
    }else{
        click(btn.bounds().centerX(),btn.bounds().centerY())
    }
}
function appclose(packageName) {
    //关闭应用
    var name = getPackageName(packageName); 
    if(!name){
        if(getAppName(packageName)){
            name = packageName;
        }else{
            return false;
        } 
    }
    app.openAppSetting(name);
    text(app.getAppName(name)).waitFor();  
    let is_sure = textMatches(/(.*强.*|.*停.*|.*结.*|.*行.*)/).findOne();
    if (is_sure.enabled()) {
        textMatches(/(.*强.*|.*停.*|.*结.*|.*行.*)/).findOne().click();
        sleep(1)
        textMatches(/(.*确.*|.*定.*)/).findOne(5000).click();
        log(app.getAppName(name) + "应用已被关闭");
        sleep(1000);
        back();
    } else {
        log(app.getAppName(name) + "应用不能被正常关闭或不在后台运行");
        back();
    }
}
//退出脚本
function rexit(){
    console.hide()
    exit()
}



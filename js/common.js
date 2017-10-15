//以下字段为以后从cookie从获取的信息
var userid = 2;
var name = '张三';
var department;
var position;
var mobile;
var gender;
var email;

//启航
var packId = 0;
var userid = 1;





//字体大小手机适配   用rem计算
(function () {
    var PSDWidth = 375, //设计图宽度
            maxWidth = 768, //最大适配iPad
            toRem = PSDWidth / 100,
            fs;

    function HTMLfontSize() {
        var html = document.documentElement,
                screenWidth = window.innerWidth,
                screenHeight = window.innerHeight;

        if (screenWidth <= maxWidth) {
            fs = screenWidth / toRem;
        } else {
            fs = maxWidth / toRem;
        }

        html.style.fontSize = fs + "px";
        html.style.height = screenHeight + "px";
    }

    HTMLfontSize();

    var timer = null;
    window.addEventListener("resize", function () {
        clearTimeout(timer);
        timer = setTimeout(HTMLfontSize, 100);
    }, false);
}());
//设置屏幕可滑动与不可滑动
//开启滑动
function startMove() {
    $("body").css({
        overflowY: "auto"
    });
    document.removeEventListener("touchmove", stopDefault, false);
}
//禁止滑动
function stopMove() {
    $("body").css({
        overflowY: "hidden"
    });
    document.addEventListener("touchmove", stopDefault, false);
}
//阻止默认事件
function stopDefault(e) {
    e.preventDefault();
}

//返回上一页
$('header .back').on('click',function(){
    window.history.back();
    e.preventDefault();
    return false;
})


//通用地址
var baseUrl = 'http://101.132.123.248:80';


// 时间格式化
function formatDate(now) {
    var now = new Date(now);
    var year=now.getFullYear();
    var month=now.getMonth()+1;
    var date=now.getDate();
    var hour=now.getHours();
    var minute=now.getMinutes();
    if(hour<10){
        hour = '0'+hour;
    }
    if(minute<10){
        minute = '0'+minute;
    }
    return year+"/"+month+"/"+date+" "+hour+":"+minute;
}

//获取
function getQueryString(name) {
    var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
    if (result == null || result.length < 1) {
        return "";
    }
    return result[1];
}

//关闭弹框
$('.modalClose').on('click',function(){
    $(this).parent().hide();
    startMove();
    $('.modal').hide();
})

//获取屏幕的高度
var window_h = window.innerHeight;
//$('.startSainling').css('height',window_h);


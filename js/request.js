(function ($, undefined) {
    window.$client_id = '';
    window.$client_secret = "";
    var timeout = 60000,
    loginUrl = 'http://localhost:53605/token',
    hzUrlHost = "http://101.132.123.248:80/";
    //loginUrl = 'http://ibangauth.cloudmou.cn/token',
    //hzUrlHost = "http://ibangapi.cloudmou.cn/api/";
    window.AuthTokenResult = CheckToken($session.getJSON('AuthTokenResult')) || {};
    var requestAJAX = function (options) { this.options = options };
    requestAJAX.prototype.$post = function () { $post.apply({ requestOptions: this.options }, arguments) };
    requestAJAX.prototype.$get = function () { $get.apply({ requestOptions: this.options }, arguments) };
    requestAJAX.prototype.$delete = function () { $delete.apply({ requestOptions: this.options }, arguments) };

    window.$ajaxConfig = function (options) {
        return new requestAJAX(options)
    };
    window.$getQueryString = function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    };
    window.$request = function (options, callback) {
        !options.timeout && (options.timeout = timeout);
        options.dataType = "json";
        //数据接口
        if (!(options.url.indexOf('https') == 0 || options.url.indexOf('http') == 0)) {
            options.url = hzUrlHost + options.url
        } else {
            AuthTokenResult = CheckToken($session.getJSON('AuthTokenResult'));
            if (options.token == false && AuthTokenResult.token) {
                return callback(AuthTokenResult);
            }
        }
        if (options.token !== false) {
            AuthTokenResult = CheckToken($session.getJSON('AuthTokenResult'));
            if (AuthTokenResult && AuthTokenResult.token_type) {
                var _beforeSend = options.beforeSend;
                options.beforeSend = function (xhr) {
                    xhr.setRequestHeader('Authorization', AuthTokenResult.token_type + " " + AuthTokenResult.access_token);
                    _beforeSend && _beforeSend(xhr);
                }
            }
        }
        var errorCallback = options.error,
            completeCallback = options.complete;
        options.error = function (xhr, status, error) {
            errorCallback && errorCallback(xhr, status, error);
            AJAX_ERROR_CALLBACK(xhr, status, error);
        };
        options.complete = function (xhr, status) {
            completeCallback && completeCallback(xhr, status);
        };
        if (!options.success) {
            options.success = function (json) {
                callback(json);
            }
        }
        //alert(JSON.stringify(options.data));
        xhr = $.ajax(options);
        xhr.showErrorMsg = function (msg) {
            this.is_show_error = true;
            this.error_msg = msg;
        };
        return xhr;
    };
    window.$post = function (url, data, callback, dataType, async, contentType) {
        $.isFunction(data) && (callback = data, data = null);
        if (contentType!=undefined) {
            return $request($.extend({
                url: url, type: 'POST', data: data, dataType: dataType, async: (async === undefined ? true : async), contentType: contentType
            }, this.requestOptions), callback)
        } else {
            return $request($.extend({
                url: url, type: 'POST', data: data, dataType: dataType, async: (async === undefined ? true : async)
            }, this.requestOptions), callback)
        }
    };
    window.$get = function (url, data, callback, dataType, async) {
        $.isFunction(data) && (callback = data, data = null);

        return $request($.extend({
            url: url, type: 'GET', data: data, dataType: dataType, async: (async === undefined ? true : async)
        }, this.requestOptions), callback)
    };

    window.$get_Token = function () {
        return AuthTokenResult.token_type + " " + AuthTokenResult.access_token
    };
    window.$getAuthToken = function () {
        return AuthTokenResult
    };
    window.$getToken = function (data, callback, async, errorCallback) {
        AuthTokenResult = {};
        $request({
            type: "POST",
            async: async,
            token: false,
            contentType: 'application/x-www-form-urlencoded',
            url: loginUrl,
            data: $.extend(true, { grant_type: 'password', client_id: $client_id, client_secret: $client_secret }, data),
            dataType: "json",
            success: function (result) {
                AuthTokenResult.access_token = result["access_token"];
                AuthTokenResult.token_type = result["token_type"];
                AuthTokenResult.userName = result["Nickname"];
                AuthTokenResult.expires = result[".expires"];
                AuthTokenResult.refresh_token = result["refresh_token"];
                AuthTokenResult.client_id = result["as:client_id"];
                AuthTokenResult.iscertification = false;
                $session.setJSON('AuthTokenResult', AuthTokenResult);
                callback && callback(result);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                if (errorCallback)
                    errorCallback(xmlHttpRequest);
            }
        });
    };

    AJAX_ERROR_CALLBACK = function (xhr, status, error) {
        window.AuthTokenResult = AuthTokenResult;
        if (xhr.readyState == 4) {
            if (xhr.is_show_error) {
                switch (xhr.status) {
                    case 400:
                        appErrorModal(xhr.error_msg || xhr.responseJSON.error_description, 4500);
                        break;
                }
            } else if (xhr.status == 401) {
                $session.setJSON('login_prev_page', { href: location.href, prev_href: document.referrer || window.parent_page_link });
                if (AuthTokenResult && AuthTokenResult.access_token) {
                    alert("用户认证已过期，即将自动跳转进行登陆");
                    setTimeout(function () {
                        window.open("/user/login", "_parent")
                    }, 2000);
                } else {
                    window.open("/user/login", "_parent")
                }
            } else if (xhr.responseJSON && xhr.responseJSON.message) {
                $.AlertModal({
                    text: '服务器未响应',
                    namebtn: '/k/ss',
                    func: function () {
                        console.log('call func');
                    }
                });
            }
        };
    };
    function CheckToken(token) {
        if (token.hasOwnProperty('expires')) {
            var myDate = new Date();
            var now = myDate.valueOf();

            var lt = new Date(token['expires']);//定义一个新时间
            var t_s = lt.getTime();//转化为时间戳毫秒数
            nt = new Date();
            nt.setTime(t_s - 1000 * 60);//设置新时间比旧时间多一分钟
            var time = nt.valueOf();
            if (now > time) {
                alert("用户认证已过期，即将自动跳转进行登陆");
                setTimeout(function () {
                    window.open("/User/Login", "_parent")
                }, 2000);
            } else {
                return token;
            }
        } else {
            return {};
        }
    }
    window.CheckToken = CheckToken;
})(window.jQuery);
(function (window, $, undefined) {
    AjaxPaging = function (options) {
        options = $.extend(this._AjaxPaging_Config, options);
        this.list = options.list;
        this._dataKey = options.dataKey;
        this._pageKey = options.pageKey;
        this._sizeKey = options.sizeKey;
        this._currentPage = options.pageIndex;
        this._pageSize = options.pageSize;
        this._params = options.params;
        this.isloaded = true;
        this.notMore = false;
        this.listloaded = options.listloaded;
        this.nodatatext = options.nodatatext;
        this.nomoretext = options.nomoretext;
        this.url = options.url;

        // this.loadDoneCallback = options.loadDoneCallback;
        this.beforeSendCallback = options.beforeSendCallback;
        this.completeCallback = options.completeCallback;
        this.pagerSuccessCallback = options.pagerSuccessCallback;

        options.autoLoad && this.loadPage(this._currentPage);

        //this._bindScroll(this.list.dom);
        return this;
    };
    AjaxPaging.prototype = {
        _AjaxPaging_Config: {
            autoLoad: true,
            params: {},
            dataKey: 'data',
            pageKey: 'pageNum',
            sizeKey: 'pageSize',
            listloaded: 'listloaded',
            nodatatext: '暂无数据！',
            nomoretext: '没有更多数据了！',
            pageIndex: 1,
            pageSize: 10,
            loadDoneCallback: function () { },
            beforeSendCallback: function () {
                //$("#"+this.listloaded).show();
                //$("#" + this.listloaded).html("加载中");
                this.listloaded && $('#' + this.listloaded).show();
            },
            completeCallback: function () {   }
        },
        _bindScroll: function (domNode) {
            var $dom = $(domNode), _this = this, scrollingElement, preScrollTop;
            var devicescrollview = document.getElementById('devicescrollview');
            var $win = $(window);
            $(devicescrollview || window).scroll(function (e) {
                // alert(e.target.scrollingElement);
                scrollingElement = devicescrollview || (document.documentElement.scrollTop ? document.documentElement : document.body);
                //e.target.scrollingElement;
                //向上滑动，并且（滑动到底部或list 的最后一行可见时）
                if (preScrollTop <= scrollingElement.scrollTop && ((scrollingElement.scrollTop + $win.height() > scrollingElement.clientHeight - 10) ||
                    ($dom.offset().top + $dom.height() < scrollingElement.scrollTop + $win.height()))) {
                    _this.nextPage();

                }
                preScrollTop = scrollingElement.scrollTop
            })
        },
        setParams: function (key, value) {
            if (value) {
                this._params[key] = value
            } else {
                for (var k in key) {
                    this._params[k] = key[k]
                }
            }
            return this;
        },
        getParams: function () {
            return this._params;
        },
        getData: function (pageIndex, pageSize) {
            //合并分页参数及其他参数
            var data = {};
            data[this._pageKey] = pageIndex || this._currentPage;
            data[this._sizeKey] = pageSize || this._pageSize;
            return $.extend(data, this._params)
        },
        loadPage: function (pageIndex, preIndex, loadType) {
            var pageSize, _pageIndex;
            if (pageIndex && pageIndex.type) {
                pageSize = pageIndex.pageSize;
                pageIndex = pageIndex.pageIndex;
                _pageIndex = this._currentPage;
                this.notMore = false
            } else {
                preIndex = preIndex || 1;
                pageIndex == 1 && (this.notMore = false);
                _pageIndex = pageIndex;
            }
            var _this = this;
            //上一次请求完成
            if (_this.isloaded && !this.notMore) {
                _this.xhr = $request({
                    url: _this.url,
                    data: _this.getData(pageIndex, pageSize),
                    beforeSend: function () {
                        _this.isloaded = false;
                        _this.beforeSendCallback()
                    },
                    error: function (xhr, status) {
                        _this.errorCallback(xhr, status, _pageIndex, preIndex, loadType)
                    },
                    success: function (json) {
                        _this.successCallback(json, _pageIndex, preIndex, loadType)
                    },
                    complete: function () {
                        _this.isloaded = true;
                        _this.completeCallback()
                        // $("#" + this.listloaded).hide();
                       
                    }
                })
            }
        },
        refresh: function () {
            this.loadPage({ type: 'refresh', pageIndex: 1, pageSize: this._pageSize * (this._currentPage || 1) })
        },
        nextPage: function () {
            this.loadPage(this._currentPage + 1, this._currentPage++, 'next');
        },
        errorCallback: function (xhr, status, pageIndex, preIndex, loadType) {
            this._currentPage = preIndex
        },
        successCallback: function (json, pageIndex, preIndex, loadType) {
            var data = $.isArray(json) ? json : (json && json[this._dataKey] && json[this._dataKey]['list'] || []);
            if (data) {
                if (typeof data == 'string') {
                    data = eval('(' + data + ')', 0)
                }
                this.pagerSuccessCallback && this.pagerSuccessCallback(data,json.data.totalrecord, pageIndex, preIndex, loadType);
                this.list && this.list.setData && (loadType == 'next' ? this.list.addData(data) : this.list.setData(data));
                //所有数据加载完
                json.data.totalrecord <= this._pageSize * pageIndex ? this.loadDoneCallback() : this.hideLoadedText();
                if (loadType != 'next' && data.length == 0) {
                    this.listloaded && $('#' + this.listloaded).show().html(this.nodatatext);
                }
                this._currentPage = pageIndex;

            } else {
                //所有数据加载完

                this.loadDoneCallback();
                this._currentPage = preIndex
            }
        },
        loadDoneCallback: function () {
            this.notMore = true;
            this.showLoadedText();
        },
        hideLoadedText: function () {
            this.listloaded && $('#' + this.listloaded).hide();
        },
        showLoadedText: function () {
            this.listloaded && $('#' + this.listloaded).show().html(this.nomoretext);
        }
    };

    $.ajaxPaging = function (options) {
        return new AjaxPaging(options)
    };
    window.$AjaxPaging = AjaxPaging;
})(window, window.jQuery);
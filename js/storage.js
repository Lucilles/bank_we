; (function (window) {
    var storage = function (key, obj) {
        this._key = key;
        this._storage = obj;
    };
    storage.prototype = {
        setJSON: function (name, data) {
            this._storage.setItem(this._key + name, JSON.stringify(data));
        },
        getJSON: function (name) {
            return JSON.parse(this._storage.getItem(this._key + name) || '{}');
        },
        setItem: function (name, str) {
            this._storage.setItem(this._key + name, str);
        },
        getItem: function (name) {
            return this._storage.getItem(this._key + name);
        },
        removeItem: function (name) {
            this._storage.removeItem(this._key + name);
        }
    };
    window.$session = new storage('hz_session_', window.sessionStorage);
    window.$storage = new storage('hz_local_', window.localStorage);
    //expires:1,
    window.$cookie = {
        _key: 'hz_cookie_',
        setJSON: function (name, data, options) {
            $.cookie(this._key + name, JSON.stringify(data), $(options || {}, { expires: 1, path: '/' }))
        },
        getJSON: function (name) {
            return JSON.parse($.cookie(this._key + name) || '{}');
        },
        setItem: function (name, str) {
            $.cookie(this._key + name, data, $(options || {}, { expires: 1, path: '/' }))
        },
        getItem: function (name) {
            return $.cookie(this._key + name)
        },
        removeItem: function (name) {
            return $.cookie(this._key + name, '', { expires: -1 })
        }
    };
})(window);
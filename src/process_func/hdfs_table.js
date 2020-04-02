export default {
    parseDirectory: function(jsonObj) {
        // 返回的填充表格的数据,表格中每一行的数据对象
        var data = [];
        // 获取目录信息对象{ FileStatus: [][] }
        var directoryObjs;
        if ('FileStatuses' in jsonObj) {
            directoryObjs = jsonObj["FileStatuses"];
        } else {
            return;
        }
        // directoryObjs["FileStatus"]获取当前路径下每个文件的描述对象构成的数组,数组形式为
        // [{0: {描述信息}}, {1: {描述信息}}, {2: {描述信息}}...]
        if ('FileStatus' in directoryObjs) {
            let objs = directoryObjs["FileStatus"];
            for (let i = 0; i < objs.length; i++) {
                let rowObj = {};
                data.push(objs[i]);
            }
        }
        return data;     
    },
    
    append_path: function(prefix, s) {
        let l = prefix.length;
        let p = l > 0 && prefix[l - 1] == '/' ? prefix.substring(0, l - 1) : prefix;
        // 判断s的第一位是否为 "/"
        s = s[0] == "/" ? s.substring(1, s.length) : s
        return p + '/' + s;
      },

    encode_path: function(abs_path) {
        abs_path = encodeURIComponent(abs_path);
        var re = /%2F/g;
        return abs_path.replace(re, '/');
      },

    formatBytes: function(v) {
        var UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'ZB'];
        var prev = 0, i = 0;
        while (Math.floor(v) > 0 && i < UNITS.length) {
            prev = v;
            v /= 1024;
            i += 1;
        }

        if (i > 0 && i < UNITS.length) {
            v = prev;
            i -= 1;
        }
        return Math.round(v * 100) / 100 + ' ' + UNITS[i];
    },

    formatTime: function(v) {
        var s = Math.floor(v / 1000), h = Math.floor(s / 3600);
        s -= h * 3600;
        var m = Math.floor(s / 60);
        s -= m * 60;

        var res = s + " sec";
        if (m !== 0) {
            res = m + " mins, " + res;
        }

        if (h !== 0) {
            res = h + " hrs, " + res;
        }

        return res;
    },

    dateToString: function(v) {
        var date = new Date(v);
        var year = date.getFullYear();
        // 月份从0开始计数，所以要加1
        var month = date.getMonth() + 1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1;
        var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        var minuters = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        return year + '-' + month + '-' + day + ' ' + hours + ':' + minuters
    },

    helperToPermission: function(v) {
        var symbols = [ '---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx' ];
        var vInt = parseInt(v, 8);
        var sticky = (vInt & (1 << 9)) != 0;

        var res = "";
        for (var i = 0; i < 3; ++i) {
            res = symbols[(v % 10)] + res;
            v = Math.floor(v / 10);
        }

        if (sticky) {
            var otherExec = (vInt & 1) == 1;
            res = res.substr(0, res.length - 1) + (otherExec ? 't' : 'T');
        }

        return res;
    },

    helperToDirectory: function(v) {
        return v === 'DIRECTORY' ? 'd' : '-';
    },

    initPermDialog(str) {
        var symbols = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
        var showLabel = [[], ['可执行'], ['可写'], 
                         ['可写', '可执行'], ['可读'], 
                         ['可读', '可执行'], ['可读', '可写'], 
                         ['可读', '可写', '可执行']]
        var userPerm = str.slice(1, 4);
        var groupPerm = str.slice(4, 7);
        // var otherPerm = str.slice(7, 10);
        // 返回的，存储各个数组要显示的内容
        var obj = {};
        if (symbols.indexOf(userPerm)) {
            obj['checkListUser'] = showLabel[symbols.indexOf(userPerm)]
        }
        if (symbols.indexOf(groupPerm)) {
            obj['checkListGroup'] = showLabel[symbols.indexOf(groupPerm)]
        }
        // 因为其他用户权限中包含粘着位,所以单独判断情况
        obj['checkListOther'] = []
        if (str[7] == 'r' ) {
            obj['checkListOther'].push('可读');
        }
        if (str[8] == 'w' ) {
            obj['checkListOther'].push('可写');
        }
        if (str[9] == 'x' ) {
            obj['checkListOther'].push('可执行');
        }
        // 判断是否有粘着位
        if (str[9] == 't' ) {
            obj['checkListOther'].push('可执行');
            obj['checkListOther'].push('粘着位SBIT');
        }
        if (str[9] == 'T') {
            obj['checkListOther'].push('粘着位SBIT')
        }
        return obj;
    },

    getOctalPermission(arr) {
        var obj = {'可读': 4, '可写': 2, '可执行': 1};
        let temp = 0;
        for (let i = 0; i < arr.length; i++) {
            temp += obj[arr[i]]
        }
        return temp.toString(8);
    },

    utc2localTime(utcDatetime) {
        // 存储转换后的时间
        let localTime = new Array();
        for (let i = 0; i < utcDatetime.length; i++) {
            // 转为正常的时间格式 年-月-日 时:分:秒
            var TPos = utcDatetime[i].indexOf('T');
            var ZPos = utcDatetime[i].indexOf('Z');
            var yearMonthDay = utcDatetime[i].substr(0, TPos);
            var hourMinuteSecond = utcDatetime[i].substr(TPos+1, ZPos-TPos-1);
            var newDatetime = yearMonthDay + " " + hourMinuteSecond; // 2017-03-31 08:02:06

            // 处理成为时间戳
            timestamp = new Date(Date.parse(newDatetime));
            timestamp = timestamp.getTime();
            timestamp = timestamp / 1000;

            // 增加8个小时，北京时间比utc时间多八个时区
            var timestamp = timestamp + 8 * 60 * 60;

            // 时间戳转为时间
            var localDatetime = new Date(parseInt(timestamp) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
            localTime.push(localDatetime);
        }
        return localTime;
    },

    utc2milliSecond(utcDatetime) {
        // 将时间戳转化为毫秒数
        let millisecond = new Array();
        for (let i = 0; i < utcDatetime.length; i++) {
            // 将时间戳转化为毫秒数
            let temp = Date.parse(utcDatetime[i]);
            // 加上8小时的毫秒数为北京时间
            temp += 8 * 60 * 60 * 1000;
            millisecond.push(temp);
        }
        return millisecond;
    }
}

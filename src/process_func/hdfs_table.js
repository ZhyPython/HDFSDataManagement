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
    }
    
}
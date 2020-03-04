export default {
    printObj: function(obj) {
        console.log(obj);
    },

    parseDirectory: function(jsonObj, dir='/',) {
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
      }
    
}
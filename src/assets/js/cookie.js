/*用export把方法暴露出来*/
export default {
    /*设置cookie*/
    setCookie: function(c_name, value, expire) {
        var date=new Date()
        date.setSeconds(date.getSeconds()+expire)
        document.cookie=c_name+ "="+ value +";path=/;expires="+date.toGMTString()
        // console.log(document.cookie)
    },

    /*获取cookie*/
    getCookie: function(c_name){
        var v = window.document.cookie.match('(^|;) ?' + c_name + '=([^;]*)(;|$)');
        return v ? v[2] : null;
    },

    /*删除cookie*/
    delCookie: function(c_name){
        this.setCookie(c_name, "", -1)
    },

    getUser: function() {
        // 获取cookie中的用户名
        let temp = document.cookie.match("=.*")[0]
        return temp.substring(1, temp.length)
    },

}




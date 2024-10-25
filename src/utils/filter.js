// 格式化时间
// 使用方法
// import { datePipe } from 'xxx/date/format'
// filter:
// {{ time | date('yyyy-mm-dd hh:mm:ss')}}
// filter:{
//  date: datePipe
// }
// methods:
// methods{ date: datePipe} this.date(date,'yyyy-MM-dd hh:mm:ss')
export function datePipe(timestamp, format = 'yyyy-MM-dd hh:mm:ss') {
    const date = new Date(timestamp)
    var o = {
        'y+': date.getFullYear(),
        'M+': date.getMonth() + 1, // 月份 "d+": value.getDate(), // 日
        'd+': date.getDate(),
        'h+': date.getHours(), // 小时 "m+": value.getMinutes(), // 分 "s+": value.getSeconds(), // 秒
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(format)) {
            format = format.replace(
                RegExp.$1,
                RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
            )
        }
    }

    return format.indexOf('aN') >= 0 || !timestamp ? null : format
}

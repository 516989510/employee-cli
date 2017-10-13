//切换酒店
var out_config = "";
window.defaultTimeZone = "EST5EDT";
//ratelog默认时区
window.ratelogTimeZone = "EST5EDT";
window.dateFormat = "ll";
window.timeFormat = "ll hh:mm A";
/*排班默认提交时间*/
window.defaultScheduleSubmitTime = "00:00:00";

//测试地址
var service = "http://apilocalhost.friendwell.com:8081/basicManage/";
//var service = "https://api.friendwell.com/basicManage/";

//var icomet_suburl = 'http://192.168.1.53:8100/sub';
var icomet_suburl = 'https://api.friendwell.com/icomet/sub/sub';

/*项目名称*/
window.projectName = 'employee/';
/*资源名称前缀*/
window.localResourcesName = 'localAssets';
window.fw_swicthHotel = function fw_swicthHotel() {
    //设置酒店
    var holidayid = $('#area_swicthHotel option:selected').attr('id');
    var current = localStorage.getItem('employee_current');
    current = JSON.parse(current);
    current.currentHotel = holidayid;
    localStorage.setItem('employee_current', JSON.stringify(current));
    //      if (current.hotelHtml){
    //          var hotelHtml = '';
    //          current.currentHotel = holidayid;
    //          $('#area_swicthHotel').html(current.hotelHtml);
    //          localStorage.setItem("employee_current", JSON.stringify(current));
    //      }
    var data = JSON.stringify({
        "hotelid": holidayid
    });

    myAjax("PUT", service + "auth", JSON.stringify({
        hotelid: holidayid
    }), function() {
        //酒店权限与页面跳转
        //跳到空白页 _target
        //重新生成菜单
        //切换酒店
        var menu = new $.fwMenu({
            debug: true,
            node: $("#menu"),
            handleHtml: function(topMenus, getSonMenus) { //生成左侧菜单栏
                var menuHtml = "";
                for (var i = 0, max = topMenus.length; i < max; i++) {
                    var parentMenu = topMenus[i];
                    if (parentMenu.link_id == "attendanceSchedule" && current.user.id != 39) {
                        break;
                    }
                    var sonMenus = getSonMenus(parentMenu.link_id);
                    //生成一级目录
                    if (parentMenu.isOnlyOne && parentMenu.isOnlyOne == true) {
                        var targetrule = (parentMenu.target == "_blank" ? "_blank" : "_self");
                        var menuHtml_i = '' +
                            '<li class="treeview">' +
                            '<a href="' + parentMenu.link_url + '" target=' + targetrule + ' id="menu_' + parentMenu.link_id + '" >' +
                            '<i class="' + parentMenu.className + '"></i> <span class="erpFwLanguage" data-language="' + parentMenu.key + '">' + parentMenu.keyValue + '</span>' +
                            '</a></li>';
                    } else {
                        var targetrule = (parentMenu.target == "_blank" ? "_blank" : "_self");
                        var menuHtml_i = '' +
                            '<li class="treeview">' +
                            '<a href="#" id="menu_' + parentMenu.link_id + '" target=' + targetrule + '>' +
                            '<i class="' + parentMenu.className + '"></i> <span class="erpFwLanguage" data-language="' + parentMenu.key + '">' + parentMenu.keyValue + '</span> <i class="fa fa-angle-left pull-right"></i>' +
                            '</a>' +
                            '<ul class="treeview-menu">';
                        var menuHtml_i_son = '';
                        for (var j = 0, innerMax = sonMenus.length; j < innerMax; j++) {
                            //if (sonMenus[j].status) {
                            //获取二级菜单
                            var secondary = getSonMenus(sonMenus[j].link_id);
                            var targetrule = (sonMenus[j].target == "_blank" ? "_blank" : "_self");
                            menuHtml_i_son += '<li>' +
                                '<a id="menu_' + sonMenus[j].link_id + '" target=' + targetrule + ' href="' + sonMenus[j].link_url + '" status="' + sonMenus[j].status + '">' +
                                '<i class="fa fa-circle-o"></i> <span class="erpFwLanguage" data-language="' + sonMenus[j].key + '">' + sonMenus[j].keyValue + '</span>' +
                                '</a>';
                            if (secondary.length > 0) {
                                menuHtml_i_son += '<ul class="treeview-menu">';
                                for (var s = 0; s < secondary.length; s++) {
                                    var targetrule = (secondary[s].target == "_blank" ? "_blank" : "_self");
                                    if (secondary[s].status != 0) {
                                        menuHtml_i_son += '<li><a status="menu_' + secondary[s].status + '" id="menu_' + secondary[s].link_id + '" target=' + targetrule + ' href="' + secondary[s].link_url + '"><i class="fa fa-circle-o"></i><span class="erpFwLanguage" data-language="' + secondary[s].key + '">' + secondary[s].keyValue + '</span></a></li>';
                                    }
                                }
                                menuHtml_i_son += '</ul>';
                            }
                            menuHtml_i_son += '</li>';
                            //}
                        }
                        menuHtml_i += menuHtml_i_son + '</ul></li>';
                    }
                    menuHtml += menuHtml_i;

                }
                //翻译文件
                switch_language("en-US", function() {});
                return menuHtml;
            },
            restApi: function() {
                return service + "myAcl";
            },
            handleError: function(xhr, status, e) {
                layer.close(loadIndex);
                var responseStatus = JSON.parse(xhr.responseText).status;
                if (responseStatus == 401 || responseStatus == 403) {
                    if (responseStatus == 403 && xhr.responseJSON.errorCode) {
                        var key = "exceptionCod_" + xhr.responseJSON.errorCode;
                        layer.msg($.i18n.prop(key));
                        return;
                    }
                    var content;
                    if (responseStatus == 401) {
                        content = $.i18n.prop("commonTip_401");
                    } else {
                        content = $.i18n.prop("commonTip_403");
                    }
                    layer.confirm(content, {
                        skin: 'layui-layer-lan',
                        closeBtn: 0,
                        title: $.i18n.prop("commonTip_tishi"),
                        btn: [$.i18n.prop("commonTip_close")],
                        yes: function() {
                            if (responseStatus == 401) {
                                location.href = "../../index.html";
                            } else {
                                layer.closeAll();
                            }
                        }
                    })
                    return;
                }
                if (xhr.responseJSON.errorCode) {
                    var key = "exceptionCod_" + xhr.responseJSON.errorCode;
                    layer.msg($.i18n.prop(key));
                } else {
                    layer.msg($.i18n.prop("commonTip_unknowException"));
                }
                return;

            }
        }, function(instance) {
            //获取酒店时区,清除时区localStorage
            localStorage.removeItem("hotelTimeZone");
            location.reload();
            //window.location.href = '../dashboard/dashboard.html';
        });
    })

}

//语言切换
window.switch_language = function switch_language(_lang, callback) {
        //国际化，回调执行  en-US，zh-CN
        loadProperties(_lang, function(_language) {
            //设置可用的值，table要用
            if (!_lang) {
                _lang = _language
            }
            if (callback && jQuery.isFunction(callback)) {
                callback();
            }
            //标签，按钮，列表的国际化
            //                  $('.erpFwLanguage').each(function() {
            //                      //page elements
            //                      var language_key = $(this).attr('data-language');
            //                      if (typeof language_key != 'undefined') {
            //                          var language_value = $.i18n.prop(language_key);
            //                          if (language_key.indexOf('label_') != -1) {
            //                              $(this).html(language_value);
            //                          } else if (language_key.indexOf('menu_') != -1) {
            //                              $(this).html(language_value);
            //                          } else if (language_key.indexOf('btn_') != -1) {
            //                              $(this).html(language_value);
            //                          } else if (language_key.indexOf('input_') != -1) {
            //                              $(this).attr('placeholder', language_value);
            //                          } else if (language_key.indexOf('table_') != -1) {
            //                              $(this).html(language_value);
            //                          }
            //                      }
            //                  });
        });
    }
    //ajax请求
window.errorStatus = 0;
var difIndex = 0;
window.myAjax = function myAjax(type, url, data, successCallBack, rightStatus, async, errorCallback, loadFlag) {
    errorStatus = 0;
    if (async == undefined || async == null) {
        async = true;
    }
    if (loadFlag == undefined || loadFlag == null) {
        loadFlag = true;
    }
    //没有权限，提示，不执行回调方法
    if (rightStatus == 0) {
        layer.confirm($.i18n.prop("commonTip_403"), {
            skin: 'layui-layer-lan',
            closeBtn: 0,
            title: $.i18n.prop("commonTip_tishi"),
            btn: [$.i18n.prop("commonTip_close")],
            yes: function() {
                layer.closeAll();
            }
        })
        return;
    }
    $.ajax({
        type: type,
        url: url,
        async: async,
        dataType: "json",
        crossDomain: true,
        timeout: 20000,
        data: data,
        contentType: "application/json",
        beforeSend: function(XMLHttpRequest) {
            if (localStorage.getItem('employee_current')) {
                XMLHttpRequest.setRequestHeader("x-auth-token", JSON.parse(localStorage.getItem('employee_current')).authKey);
            }
            if ("GET" != type) {
                if (loadFlag) {
                    difIndex = layer.load(2, {
                        shade: [0.1, '#fff'] //0.1透明度的白色背景
                    });
                }
            } else {
                //get请求的 都用进度条来展示
                NProgress.start();
            }

        },
        success: function(data) {
            if ("GET" != type) {
                if (loadFlag) {
                    layer.close(difIndex);
                }
            } else {
                NProgress.done();
            }
            if (jQuery.isFunction(successCallBack)) {
                successCallBack(data);
            }
        },
        error: function(xhr, status, e) {
            errorStatus = 1;
            if ("GET" != type) {
                layer.close(difIndex);
            } else {
                NProgress.done();
            }
            //请求超时，暂时ratelog从priceline获取竞争者信息时使用
            if ((xhr.statusText == "timeout" || xhr.statusText == "error") && jQuery.isFunction(errorCallback)) {
                errorCallback(xhr.statusText);
            }

            if ((xhr.statusText == "timeout") || xhr.statusText == "error") {
                //              layer.msg("The request service timed out");
                errorTips("The request service timed out");
                return;
            }
            if (jQuery.isFunction(errorCallback)) {
                errorCallback();
            }
            var responseStatus = xhr.status;
            if (responseStatus == 401 || responseStatus == 403) {
                if (responseStatus == 403 && xhr.responseJSON.errorCode) {
                    var key = "exceptionCod_" + xhr.responseJSON.errorCode;
                    //                  layer.msg($.i18n.prop(key));
                    errorTips($.i18n.prop(key));
                    return;
                }
                var content;
                if (responseStatus == 401) {
                    content = $.i18n.prop("commonTip_401");
                } else {
                    content = $.i18n.prop("commonTip_403");
                }
                layer.confirm(content, {
                    skin: 'layui-layer-lan',
                    closeBtn: 0,
                    title: $.i18n.prop("commonTip_tishi"),
                    btn: [$.i18n.prop("commonTip_close")],
                    yes: function() {
                        if (responseStatus == 401) {
                            location.href = "../../index.html";
                        } else {
                            layer.closeAll();
                        }

                    }
                })
                return;
            }
            if (xhr.responseJSON.errorCode) {
                var key = "exceptionCod_" + xhr.responseJSON.errorCode;
                //              layer.msg($.i18n.prop(key));
                errorTips($.i18n.prop(key));
                /*月报编辑页面判断离开使用，此时编辑的'锁'已经被其他人占据
                 * author： sdd 
                 * 2017-05-18*/
                if (location.href.indexOf('editReport.html') > -1 && xhr.responseJSON.errorCode == 10002) {
                    setTimeout(function() {
                        vue.canLeave = 1;
                        window.history.back(-1);
                    }, 5600);
                }
            } else {
                //              layer.msg($.i18n.prop("commonTip_unknowException"));
                errorTips($.i18n.prop("commonTip_unknowException"));
            }
            return;
        }
    });
}
window.getPageNum = function getPageNum(totalLineNum, pageSize) {
    var pageNum = 1;
    if (totalLineNum == 0) {
        pageNum = 1;
        return pageNum;
    }
    pageNum = Math.ceil(totalLineNum / pageSize);
    return pageNum;
}

//获取系统当前的状态-员工
window.getSystemInfo = function getSystemInfo(page_init) {
    var current = localStorage.getItem("employee_current");
    if (!current) {
        window.location.href = '../../index.html';
    } else {
        var menu = new $.fwMenu({
                debug: false,
                node: $("#menu"),
                handleHtml: function(topMenus, getSonMenus) { //生成左侧菜单栏
                    var menuHtml = "";
                    for (var i = 0, max = topMenus.length; i < max; i++) {
                        var parentMenu = topMenus[i];
                        if (parentMenu.link_id == "attendanceSchedule" && JSON.parse(current).user.id != 39) {
                            break;
                        }
                        var sonMenus = getSonMenus(parentMenu.link_id);
                        //生成一级目录
                        if (parentMenu.isOnlyOne && parentMenu.isOnlyOne == true) {
                            var targetrule = (parentMenu.target == "_blank" ? "_blank" : "_self");
                            var menuHtml_i = '' +
                                '<li class="treeview">' +
                                '<a href="' + parentMenu.link_url + '" target=' + targetrule + ' id="menu_' + parentMenu.link_id + '" >' +
                                '<i class="' + parentMenu.className + '"></i> <span class="erpFwLanguage" data-language="' + parentMenu.key + '">' + parentMenu.keyValue + '</span>' +
                                '</a></li>';
                        } else {
                            var targetrule = (parentMenu.target == "_blank" ? "_blank" : "_self");
                            var menuHtml_i = '' +
                                '<li class="treeview">' +
                                '<a href="#" id="menu_' + parentMenu.link_id + '" target=' + targetrule + '>' +
                                '<i class="' + parentMenu.className + '"></i> <span class="erpFwLanguage" data-language="' + parentMenu.key + '">' + parentMenu.keyValue + '</span> <i class="fa fa-angle-left pull-right"></i>' +
                                '</a>' +
                                '<ul class="treeview-menu">';
                            var menuHtml_i_son = '';
                            for (var j = 0, innerMax = sonMenus.length; j < innerMax; j++) {
                                //if (sonMenus[j].status) {
                                //获取二级菜单
                                var secondary = getSonMenus(sonMenus[j].link_id);
                                var targetrule = (sonMenus[j].target == "_blank" ? "_blank" : "_self");
                                menuHtml_i_son += '<li>' +
                                    '<a id="menu_' + sonMenus[j].link_id + '" target=' + targetrule + ' href="' + sonMenus[j].link_url + '" status="' + sonMenus[j].status + '">' +
                                    '<i class="fa fa-circle-o"></i> <span class="erpFwLanguage" data-language="' + sonMenus[j].key + '">' + sonMenus[j].keyValue + '</span>' +
                                    '</a>';
                                if (secondary.length > 0) {
                                    menuHtml_i_son += '<ul class="treeview-menu">';
                                    for (var s = 0; s < secondary.length; s++) {
                                        if (secondary[s].status != 0) {
                                            var targetrule = (secondary[s].target == "_blank" ? "_blank" : "_self");
                                            menuHtml_i_son += '<li><a status="menu_' + secondary[s].status + '" id="menu_' + secondary[s].link_id + '" target=' + targetrule + ' href="' + secondary[s].link_url + '"><i class="fa fa-circle-o"></i><span class="erpFwLanguage" data-language="' + secondary[s].key + '">' + secondary[s].keyValue + '</span></a></li>';
                                        }
                                    }
                                    menuHtml_i_son += '</ul>';
                                }
                                menuHtml_i_son += '</li>';
                                //}
                            }
                            menuHtml_i += menuHtml_i_son + '</ul></li>';
                        }
                        menuHtml += menuHtml_i;

                    }
                    return menuHtml;
                },
                restApi: function() { //获取配置的权限json
                    return service + "myAcl";
                }
            },
            function(instance) {
                current = JSON.parse(current);
                if (!current.hotelHtml) {
                    var hotelHtml = '';
                    for (var i = 0; i < current.user.hotel.length; i++) {
                        if (i == 0) {
                            current.currentHotel = current.user.hotel[i].id;
                        }
                        hotelHtml += '<option id="' + current.user.hotel[i].id + '"  >' + current.user.hotel[i].name + '</option>';
                    }
                    current.hotelHtml = hotelHtml;
                    $('#area_swicthHotel').html(current.hotelHtml);
                    $("#area_swicthHotel").find("option[id='" + current.currentHotel + "']").attr("selected", true);
                    localStorage.setItem("employee_current", JSON.stringify(current));
                } else {
                    //选中当前酒店
                    $('#area_swicthHotel').html('');
                    $('#area_swicthHotel').html(current.hotelHtml);
                    $("#area_swicthHotel").find("option[id='" + current.currentHotel + "']").attr("selected", true);
                }
                //$(".select2").select2();
                var user = JSON.parse(localStorage.getItem("employee_current")).user;
                $(".info p").text(user.name);
                $(".user-menu span").text(user.name);
                var $img_mini = $(".user-image");
                //              $(".user-header img").attr("src", user.face != null && user.face != "" ? user.face : "../../assets/css/images/defaultHead2.png");
                //              $img_mini.attr("src", user.face != null && user.face != "" ? user.face : "../../assets/css/images/defaultHead2.png");
                //select 可以绑定事件，option (不存在 options )绑定了也不执行
                $(document).on('change', '#area_swicthHotel', fw_swicthHotel);
                //$('#area_swicthHotel').bind('change', fw_swicthHotel);
                //用户中心
                var user_center = instance.getLinkById("userCenterPage").link_url;
                $(document).on("click", "#btn_personalCenter", function() {
                    window.location.href = user_center;
                })

                //退出
                var logout = instance.getLinkById("logout");
                $(document).on("click", "#btn_header_account_signout", function() {
                        myAjax('DELETE', logout.link_url, {},
                            function(obj) {
                                layer.closeAll();
                                localStorage.removeItem("employee_current");
                                localStorage.removeItem("employee_finalConfig");
                                localStorage.removeItem("employee_menuHtml");
                                window.location.href = '../../index.html';
                            }, logout.status, true
                        );
                    })
                    //选中菜单
                var currentMenuSetting = instance.getLinkByAddress();
                if (currentMenuSetting.parentId) {
                    currentMenuSetting = instance.getLinkById(currentMenuSetting.parentId);
                }
                $('#menu #menu_' + currentMenuSetting.dir_id).parent('li').addClass('active');
                $('#menu #menu_' + currentMenuSetting.link_id).parent('li').parent('ul').addClass('menu-open');
                $('#menu #menu_' + currentMenuSetting.link_id).parent('li').addClass('active');
                $('#menu #menu_' + currentMenuSetting.link_id).parents('.treeview').addClass('active');

                //翻译文件
                switch_language("en-US", function() {
                    /*页面底部公司信息*/
                    var footCompanyHtml = '<strong>' +
                        '<span class="fwLanguage" data-language="label_footer_w_connect">W-Connect</span> &copy;' +
                        '<span class="fwLanguage" data-language="label_footer_year">2016</span>' +
                        '<a data-language="label_footer_company" class="fwLanguage" href="http://friendwell.com/" target="_blank">FriendWell</a>.' +
                        '</strong>';
                    $('.main-footer').html(footCompanyHtml);
                    //各个页面的初始化
                    page_init(instance);

                    //注册通道，并且弹出消息提醒
                    var channel = current.user.id;
                    var comet = new iComet({
                        channel: channel,
                        subUrl: icomet_suburl,
                        callback: function(content, type) {
                            var notifyobj = JSON.parse(content);
                            console.log(notifyobj)
                            if (notifyobj && notifyobj.code == 200)
                                notify(notifyobj.data, menu);
                        }
                    });
                });
            });
    }
};

function notify(notifyobj, menu) {
    var options = {
        dir: "ltr",
        lang: "utf-8",
        icon: "../../assets/dist/img/info.jpg",
        body: notifyobj.content
    };
    if (Notification && Notification.permission === "granted") {
        var n = new Notification(notifyobj.title, options);
        n.onclick = function() {
            n.close();
            window.location = getnotifyLink(notifyobj, menu);
        };
    } else if (Notification && Notification.permission !== "denied") {
        Notification.requestPermission(function(status) {
            if (Notification.permission !== status) {
                Notification.permission = status;
            }
            if (status === "granted") {
                var n = new Notification(title, {
                    icon: "../../assets/dist/img/info.jpg",
                    body: notifyobj.content
                });
                n.onclick = function() {
                    n.close();
                    window.location = getnotifyLink(notifyobj, menu);
                };
            }
        });
    }
}

function getnotifyLink(notifyobj, menu) {
    if (notifyobj.type == 0) {
        return menu.getLinkById("logBookDetal").link_url + "&id=" + notifyobj.clickurl
    } else if (notifyobj.type == 1) {
        return menu.getLinkById("menu_logbook_guest_detail").link_url + "&id=" + notifyobj.clickurl
    } else if (notifyobj.type == 2) {
        return menu.getLinkById("menu_logbook_announcements_detail").link_url + "&id=" + notifyobj.clickurl
    }  else if (notifyobj.type == 3) {
        return menu.getLinkById("JumpToItTicketDetail").link_url + "&ticketId=" + notifyobj.clickurl + "&hotelId=" + pageJsonMap.current.currentHotel;
    } else if (notifyobj.type == 4) {
        return menu.getLinkById("scheduleApproval").link_url + "&startDate=" + notifyobj.weekStart + "&endDate=" + notifyobj.weekEnd + "&hotelId=" + notifyobj.hotelId;
    }
}

//表单序列化
if (typeof(jQuery) != "undefined") {
    (function($) {
        $.fn.serializeObject = function() {
            var o = {};
            var a = this.serializeArray();
            //alert("array:\n"+a);
            $.each(a, function() {
                if (o[this.name]) {
                    //!o[this.name].push
                    if ($.isArray(o[this.name])) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        };

    })(jQuery);
}

//i18n
window.loadProperties = function loadProperties(language, page_i18n) {

    //options : ,name,language,path,mode,cache,encoding,callback
    //i18n nation : en-US, zh-CN ,zh-CN ,en-GB

    //判断语言----->加载语言文件时，由于截取串的不同，导致又一次文件加载失败
    var _language = "en-US";
    //  if(!language) {} else {
    //      if(typeof language == "string") {
    //          _language = language;
    //      }
    //
    //  }
    //console.log(_language);
    //加载资浏览器语言对应的资源文件
    jQuery.i18n.properties({
        name: 'strings25', //资源文件名称
        path: '../../assets/internationalization/i18n/', //资源文件路径
        mode: 'map', //用Map的方式使用资源文件中的值
        cache: true,
        language: _language,
        async: true,
        callback: function() {
            page_i18n(_language);
        }
    });
};
window.makeRestUrl = (function() {
    var restRE = /\/:(\w+)/g;
    var replaceRESTParams = function(endpoint, params) {
        return endpoint.replace(restRE, function(match, key) {
            var value = params[key];
            return "/" + ((value !== undefined) ? encodeURIComponent(value) : (":" + key));
        });
    };
    return function(endpoint, params) {
        //处理query数据
        var endpointParams = [];
        var result;
        while (result = restRE.exec(endpoint)) {
            endpointParams.push(result[1]);
        }
        var query = {};
        Object.keys(params).forEach(function(key) {
            if (endpointParams.indexOf(key) < 0) {
                query[key] = params[key];
            }
        });
        //处理endpoint中的变量
        var url = replaceRESTParams(endpoint, params);
        //处理query参数
        var queryStr = "";
        _.forIn(query, function(value, key) {
            queryStr += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&"
        });
        return url + (queryStr === "" ? "" : ("?" + queryStr.substr(0, queryStr.length - 1)));
    }
}());
//获取query字符串
window.getRequestQuery = function getRequestQuery(strName, optway) {
        var strHref = window.location.toString();
        var intPos = strHref.indexOf("?");
        if (intPos == -1) return '';
        var strRight = strHref.substr(intPos + 1);
        if (optway == 'string') return strRight;

        var arrTmp = strRight.split("&");
        var queryObj = {};
        for (var i = 0; i < arrTmp.length; i++) {
            var arrTemp = arrTmp[i].split("=");
            if (arrTemp.length == 2) {
                if (!optway) {
                    if (arrTemp[0].toUpperCase() == strName.toUpperCase()) return arrTemp[1];
                    queryObj = '';
                } else if (optway == 'object') {
                    queryObj[arrTemp[0]] = arrTemp[1];
                }
            } else if (arrTemp.length == 1) {
                if (!optway) {
                    if (arrTemp[0].toUpperCase() == strName.toUpperCase()) return arrTemp[0];
                    queryObj = '';
                } else if (optway == 'object') {
                    queryObj[arrTemp[0]] = '';
                }
            } else {
                console.log(' getRequestQuery failed ');
            }

        }
        return queryObj;
    }
    //输入限制，两位小数,最大不超过1000000
window.onlyTwo = function onlyTwo(obj) {
        //先把非数字的都替换掉，除了数字和.
        obj.value = obj.value.replace(/[^\d.]/g, "");
        //必须保证第一个为数字而不是.
        obj.value = obj.value.replace(/^\./g, "");
        //保证只有出现一个.而没有多个.
        obj.value = obj.value.replace(/\.{2,}/g, ".");
        //保证.只出现一次，而不能出现两次以上
        obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        //保证.只后面只能出现两位有效数字
        obj.value = obj.value.replace(/([0-9]+\.[0-9]{2})[0-9]*/, "$1");
        //小数点前面是6位
        if (obj.value >= 1000000) {
            obj.value = obj.value.replace(obj.value, obj.value.substring(0, 6));
        }
    }
    //输入限制，小数点后一位小数的数字
window.onlyNumberTwo = function onlyNumberTwo(obj) {
        //先把非数字的都替换掉，除了数字和.
        obj.value = obj.value.replace(/[^\d.]/g, "");
        //必须保证第一个为数字而不是.
        obj.value = obj.value.replace(/^\./g, "");
        //保证只有出现一个.而没有多个.
        obj.value = obj.value.replace(/\.{2,}/g, ".");
        //保证.只出现一次，而不能出现两次以上
        obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        //保证.只后面只能出现两位有效数字
        obj.value = obj.value.replace(/([0-9]+\.[0-9]{1})[0-9]*/, "$1");
        //排除000 多个零的情况
        if (obj.value.substring(0, 2) && obj.value.substring(0, 2) == "00") {
            obj.value = obj.value.replace(obj.value, '0');
        }
    }
    //输入限制，小数点后两位
window.pointOnlyTwo = function pointOnlyTwo(obj) {
        //先把非数字的都替换掉，除了数字和.
        obj.value = obj.value.replace(/[^\d.]/g, "");
        //必须保证第一个为数字而不是.
        obj.value = obj.value.replace(/^\./g, "");
        //保证只有出现一个.而没有多个.
        obj.value = obj.value.replace(/\.{2,}/g, ".");
        //保证.只出现一次，而不能出现两次以上
        obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        //保证.只后面只能出现两位有效数字
        obj.value = obj.value.replace(/([0-9]+\.[0-9]{2})[0-9]*/, "$1");
        //排除000 多个零的情况
        if (obj.value.substring(0, 2) && obj.value.substring(0, 2) == "00") {
            obj.value = obj.value.replace(obj.value, '0');
        }
    }
    /*两位小数,不大于10000*/
window.fourPointTwo = function fourPointTwo(obj) {
        //先把非数字的都替换掉，除了数字和.
        obj.value = obj.value.replace(/[^\d.]/g, "");
        //必须保证第一个为数字而不是.
        obj.value = obj.value.replace(/^\./g, "");
        //保证只有出现一个.而没有多个.
        obj.value = obj.value.replace(/\.{2,}/g, ".");
        //保证.只出现一次，而不能出现两次以上
        obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        //保证.只后面只能出现两位有效数字
        obj.value = obj.value.replace(/([0-9]+\.[0-9]{2})[0-9]*/, "$1");
        //排除000 多个零的情况
        if (obj.value.substring(0, 2) && obj.value.substring(0, 2) == "00") {
            obj.value = obj.value.replace(obj.value, '0');
        }
        //小数点前面是4位
        if (obj.value >= 10000) {
            obj.value = obj.value.replace(obj.value, obj.value.substring(0, 4));
        }
    }
    /*两位小数,小于等于100，百分比使用*/
window.twoPointTwo = function twoPointTwo(obj) {
        //先把非数字的都替换掉，除了数字和.
        obj.value = obj.value.replace(/[^\d.]/g, "");
        //必须保证第一个为数字而不是.
        obj.value = obj.value.replace(/^\./g, "");
        //保证只有出现一个.而没有多个.
        obj.value = obj.value.replace(/\.{2,}/g, ".");
        //保证.只出现一次，而不能出现两次以上
        obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        //保证.只后面只能出现两位有效数字
        obj.value = obj.value.replace(/([0-9]+\.[0-9]{2})[0-9]*/, "$1");
        //排除000 多个零的情况
        if (obj.value.substring(0, 2) && obj.value.substring(0, 2) == "00") {
            obj.value = obj.value.replace(obj.value, '0');
        }
        //小数点前面是2位
        if (obj.value > 100) {
            obj.value = obj.value.replace(obj.value, obj.value.substring(0, 2));
        }
    }
    //不能输入中文
window.no_ZH_CN = function no_ZH_CN(obj) {
        obj.value = obj.value.replace(/[\u4E00-\u9FA5]/g, "");
    }
    //只能数字
window.onlyNumber = function onlyNumber(obj) {
        obj.value = obj.value.replace(/[^\d]/g, '');
    }
    //只能输入正常的数字，排除情况例如00000
window.onlyNormalNum = function onlyNormalNum(obj) {
        obj.value = obj.value.replace(/[^\d]/g, '');
        if (obj.value.substring(0, 2) && obj.value.substring(0, 2) == "00") {
            obj.value = obj.value.replace(obj.value, '0');
        }
    }
    //四舍五入保留小数位
window.toDecimalTwo = function toDecimalTwo(x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
        return;
    }
    f = Math.round(x * 100) / 100;
    return f;
}
window.toDecimalOne = function toDecimalOne(x) {
        var f = parseFloat(x);
        if (isNaN(f)) {
            return;
        }
        f = Math.round(x * 10) / 10;
        return f;
    }
    //calendar日历 国际化语言
window.theLanguage = function thelanguage() {
    var lang = "en-US";
    //console.log(lang);
    var langList = ['en', 'zh-CN', 'zh-TW', 'ja'];
    var type = 0; //判断是否有当前语言的标记
    for (var i = 0; i < langList.length; i++) {
        if (lang == langList[i]) {
            type = 1;
        }
    }
    //calendar 使用的是小写
    if (lang == 'zh-CN') {
        lang = 'zh-cn';
    } else if (lang == 'zh-TW') {
        lang = 'zh-tw';
    }
    if (type === 0) {
        lang = 'en';
    }
    return lang;
}

//相同时间字符串下的别的时区时间戳
window.momentDIY = function momentDIY(momentObj) {
    return moment(momentObj.format()).unix();
}
Notification.requestPermission(function(status) {
    if (Notification.permission !== status) {
        Notification.permission = status;
    }
});
/*右上角错误提示框*/
window.errorTips = function errorTips(myContent) {
        /*自动关闭*/
        setTimeout(function() {
            $("[data-dismiss='alert']").click();
        }, 5000);
        var errorDateHtml = '<div class="alert alert-danger alert-dismissable" style="position: fixed;top: 64px;right: 15px;z-index: 1055;width:300px">' +
            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
            '<h4><i class="icon fa fa-ban"></i> Alert!</h4>' +
            myContent +
            '</div>';
        $("body").prepend(errorDateHtml);
    }
    /*最多两位小数,整数部分做多7位*/
window.sevPointTwo = function sevPointTwo(obj) {
        //先把非数字的都替换掉，除了数字和.
        obj.value = obj.value.replace(/[^\d.-]/g, "");
        //必须保证第一个为数字而不是.
        obj.value = obj.value.replace(/^\./g, "");
        //保证"-"只出现第一位，否则去除
        obj.value = obj.value.replace(/^-/g, "$#$").replace(/-/g, "").replace("$#$", "-");
        //保证只有出现一个.而没有多个.
        obj.value = obj.value.replace(/\.{2,}/g, ".");
        //保证.只出现一次，而不能出现两次以上
        obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        //保证.只后面只能出现两位有效数字
        obj.value = obj.value.replace(/([0-9]+\.[0-9]{2})[0-9]*/, "$1");
        //排除000 多个零的情况
        if (obj.value.substring(0, 2) && obj.value.substring(0, 2) == "00") {
            obj.value = obj.value.replace(obj.value, '0');
        }
        //小数点前面是7位
        if (parseInt(obj.value) >= 10000000) {
            obj.value = obj.value.replace(obj.value, obj.value.substring(0, 7));
        }
        //判断负数前面小数点前面是7位
        if (parseInt(obj.value) <= -9999999) {
            obj.value = obj.value.replace(obj.value, obj.value.substring(0, 8));
        }
    }
    /*两位小数,整数部分最多8位*/
window.eightPointTwo = function eightPointTwo(obj) {
    //先把非数字的都替换掉，除了数字和.
    obj.value = obj.value.replace(/[^\d.]/g, "");
    //必须保证第一个为数字而不是.
    obj.value = obj.value.replace(/^\./g, "");
    //保证只有出现一个.而没有多个.
    obj.value = obj.value.replace(/\.{2,}/g, ".");
    //保证.只出现一次，而不能出现两次以上
    obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    //保证.只后面只能出现两位有效数字
    obj.value = obj.value.replace(/([0-9]+\.[0-9]{2})[0-9]*/, "$1");
    //排除000 多个零的情况
    if (obj.value.substring(0, 2) && obj.value.substring(0, 2) == "00") {
        obj.value = obj.value.replace(obj.value, '0');
    }
    //小数点前面是4位
    if (obj.value >= 100000000) {
        obj.value = obj.value.replace(obj.value, obj.value.substring(0, 8));
    }
}

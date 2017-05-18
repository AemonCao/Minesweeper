$(document).ready(function() {
  //游戏状态 0-结束 1-初始化 2-进行中
  var status;
  //剩余雷的数量
  var restMine = 0;
  //剩余方块的数量
  var restBlock = 0;
  //剩余旗帜数量
  var restFlag = 0;
  //总的雷数(在初始化的时候决定 过程中不改变最后用来判断胜利的条件)
  var total;
  //是否可以标记问号
  var ischeck = true;

  var timer;

  $("#main").mouseup(function(ev) {

    //获取所点击的div的行和列的位置
    var $div = $(ev.target);
    var $divId = $div.attr("id");

    var x = parseInt($divId.substring(1, $divId.indexOf("-")))
    var y = parseInt($divId.substring($divId.indexOf("r") + 1))
    if (ev.which == 1) { //左键
      openblock(x, y);
    } else if (ev.which == 3) { //右键
      flag(x, y);
    }
    //$('#restMine').text(restMine); //剩余雷数
    victory(total); //胜利
  })

  $('#main').bind('contextmenu', function() {
    return false;
  }); //阻止默认右键事件 

  //初级按钮
  $("#Baginner").click(function() {
    init(10, 10, 10);
  });
  //中级按钮
  $("#Intermediate").click(function() {
    init(16, 16, 40);
  });
  //高级按钮
  $("#Expert").click(function() {
    init(30, 16, 99);
  });
  //自定义按钮
  $("#Custom").click(function() {
    // $("#form_custom").css("display", "inline");
  });
  //确定按钮
  $("#ok").click(function() {
    var t_h = $("#text_height");
    var t_w = $("#text_width");
    var t_m = $("#text_mains");
    var int_t_h = parseInt(t_h.val());
    var int_t_w = parseInt(t_w.val());
    var int_t_m = parseInt(t_m.val());
    // console.log(int_t_h);
    if (isNaN(int_t_h) || isNaN(int_t_w) || isNaN(int_t_m)) {
      alert("三个数据都要填写哟~");
    } else {
      if (int_t_h > 131 || int_t_w > 131) {
        alert("设置的太大了噢,加载会变很慢的!");
        t_h.val(131);
        t_w.val(131);
        t_m.val(528);
      } else {
        var max_m = Math.ceil(int_t_h * int_t_w * 0.99);
        if (int_t_m > max_m) {
          alert("雷数太多啦!当前布局最多数量为" + max_m);
          t_m.val(max_m);
        } else {
          init(int_t_h, int_t_w, int_t_m);
        }
      }
    }
    // $("#form_custom").css("display", "none");
  });

  // function startTime() {
  //     var t_t = $("#time");
  //     var int_t_t = parseInt(t_t.val());
  //     int_t_t += 0.1;
  //     t_t.text(int_t_t);
  //     t = setTimeout("startTime();", 1000);
  // }

  //初始化方法
  function init(height, width, mine) {
    //停止计时
    clearInterval(timer);
    //置零
    restFlag = 0;
    //记录雷的数量
    total = restMine = mine;
    //记录方块数量
    restBlock = height * width;
    //显示雷的数量
    $("#restMine").text(restMine);

    //创建二维数组
    mineArr = new Array(height + 2);
    $.each(mineArr, function(num) {
        mineArr[num] = new Array(width + 2);
      })
      //初始化数组
    for (var i = 0; i < height + 2; i++) {
      for (var j = 0; j < width + 2; j++) {
        mineArr[i][j] = 0;
      }
    }
    //布雷 -1为雷
    //格子状态(即数组状态):0:周围无雷 -1:有雷
    while (mine > 0) {
      var i = Math.ceil(Math.random() * height);
      var j = Math.ceil(Math.random() * width);
      if (mineArr[i][j] != -1) {
        mineArr[i][j] = -1;
        mine--;
      }
    }
    //统计周围雷的数量
    for (var i = 1; i <= height; i++) {
      for (var j = 1; j <= width; j++) {
        /*
        0.0|0.1|0.2
        1.0|1.1|1.2
        2.0|2.1|2.2 
        */
        if (mineArr[i][j] == 0) {
          //0.0位置 左上
          if (mineArr[i - 1][j - 1] == -1)
            mineArr[i][j]++;
          //0.1位置 正上
          if (mineArr[i - 1][j] == -1)
            mineArr[i][j]++;
          //0.2位置 右上
          if (mineArr[i - 1][j + 1] == -1)
            mineArr[i][j]++;
          //1.0位置 正左
          if (mineArr[i][j - 1] == -1)
            mineArr[i][j]++;
          //1.2位置 正右
          if (mineArr[i][j + 1] == -1)
            mineArr[i][j]++;
          //2.0位置 左下
          if (mineArr[i + 1][j - 1] == -1)
            mineArr[i][j]++;
          //2.1位置 正下
          if (mineArr[i + 1][j] == -1)
            mineArr[i][j]++;
          //2.2位置 右下
          if (mineArr[i + 1][j + 1] == -1)
            mineArr[i][j]++;
        }
      }
    }

    //创建div
    var block = '';
    for (var i = 1; i < mineArr.length - 1; i++) {
      for (var j = 1; j < mineArr[0].length - 1; j++) {
        block += '<div id="c' + i + '-r' + j + '" style="left:' + (i - 1) * 20 + 'px; top:' + (j - 1) * 20 + 'px "class="hidden"></div>';
      }
    }
    $('#main').html(block).width(height * 20).height(width * 20).show();
    status = 1;
  }

  //左键点击打开方块方法
  function openblock(x, y) {
    var $click = $("#c" + x + "-r" + y);
    //用变量保存点击方块的周围八个格；
    var $leftTop = $("#c" + (x - 1) + "-r" + (y - 1));
    var $top = $("#c" + x + "-r" + (y - 1));
    var $rightTop = $("#c" + (x + 1) + "-r" + (y - 1));
    var $left = $("#c" + (x - 1) + "-r" + y);
    var $right = $("#c" + (x + 1) + "-r" + y);
    var $leftBottom = $("#c" + (x - 1) + "-r" + (y + 1));
    var $bottom = $("#c" + x + "-r" + (y + 1));
    var $rightBottom = $("#c" + (x + 1) + "-r" + (y + 1));

    //如果是第一下点击
    if (status == 1) {
      //如果第一下点击是雷则重新初始化然后再点击直到不是雷为止
      if (mineArr[x][y] == -1) {
        init(mineArr.length - 2, mineArr[0].length - 2, restMine);
        openblock(x, y);
        //如果第一次点击不是雷但是周围有雷,则将其标上数字
      } else if (mineArr[x][y] > 0) {
        if ((!$click.hasClass("flag")) && $click.hasClass("hidden")) {
          $click.removeClass("hidden").html(mineArr[x][y]).addClass("num" + mineArr[x][y]);
          restBlock--;
          //判断胜利
          victory(total);
        }
        //如果第一次点击不是雷且周围无雷,则将其周围的最多八个未点开的方块打开
      } else if (mineArr[x][y] == 0 && $click.hasClass("hidden")) {
        $click.removeClass("hidden");
        restBlock--;
        if ($leftTop.hasClass("hidden")) openblock(x - 1, y - 1);
        if ($top.hasClass("hidden")) openblock(x, y - 1);
        if ($rightTop.hasClass("hidden")) openblock(x + 1, y - 1);
        if ($left.hasClass("hidden")) openblock(x - 1, y);
        if ($right.hasClass("hidden")) openblock(x + 1, y);
        if ($leftBottom.hasClass("hidden")) openblock(x - 1, y + 1);
        if ($bottom.hasClass("hidden")) openblock(x, y + 1);
        if ($rightBottom.hasClass("hidden")) openblock(x + 1, y + 1);
      }
      //将状态改为"进行中"
      status = 2;
      //由状态1转到状态2,则开始计时;
      clearInterval(timer);
      var time = 0;
      timer = setInterval(function() {
        time += 0.1;
        time = Math.round(time * 10) / 10;
        $("#time").text(time);
      }, 100);
      //判断胜利
      victory(total);
    } else if (status == 2) {
      //如果点击到了雷
      if (mineArr[x][y] == -1) {
        //如果没有被插旗则判断失败
        if (!$click.hasClass("flag")) {
          $click.removeClass("hidden").addClass("cbomb");
          fail();
        }
        //如果点到了周围有雷的方块并且方块没有被插旗则打开这个方块并标记数字
      } else if (mineArr[x][y] > 0) {
        if ((!$click.hasClass("flag")) && $click.hasClass("hidden")) {
          $click.removeClass("hidden").html(mineArr[x][y]).addClass("num" + mineArr[x][y]);
          restBlock--;
          //判断胜利
          victory(total);
        }
        //如果点击不是雷且周围无雷,则将其周围的最多八个未点开的方块打开
      } else if (mineArr[x][y] == 0 && $click.hasClass("hidden")) {
        $click.removeClass("hidden");
        restBlock--;
        if ($leftTop.hasClass("hidden")) openblock(x - 1, y - 1);
        if ($top.hasClass("hidden")) openblock(x, y - 1);
        if ($rightTop.hasClass("hidden")) openblock(x + 1, y - 1);
        if ($left.hasClass("hidden")) openblock(x - 1, y);
        if ($right.hasClass("hidden")) openblock(x + 1, y);
        if ($leftBottom.hasClass("hidden")) openblock(x - 1, y + 1);
        if ($bottom.hasClass("hidden")) openblock(x, y + 1);
        if ($rightBottom.hasClass("hidden")) openblock(x + 1, y + 1);
        //判断胜利
        victory(total);
      }
    } else if (status == 0) {
      if (mineArr[x][y] == -1) {
        if (!$click.hasClass("flag")) {
          $click.removeClass("hidden").addClass("bomb");
        }
      }
      if (mineArr[x][y] > 0) {
        if ($click.hasClass("flag")) {
          $click.removeClass("flag").addClass("wrong").html("");
        } else {
          $click.removeClass("hidden").html(mineArr[x][y]).addClass("num" + mineArr[x][y]);
        }
      }
      if (mineArr[x][y] == 0) {
        $click.removeClass("hidden")
      }
    }
    // console.log("左键打开restBlock:\t%s", restBlock);
  }

  //右键插旗方法
  function flag(x, y) {
    var $click = $("#c" + x + "-r" + y);
    //如果不是游戏结束状态则都可以插旗
    if (status != 0) {
      //如果方格未被打开
      if ($click.hasClass("hidden") || $click.hasClass("flag") || $click.hasClass("check")) {
        //允许问号的插旗方法
        if (!ischeck) {
          //如果已经被标记为旗帜则改为问号并将剩余旗帜数减一,剩余雷数加一,剩余方格数加一
          if ($click.hasClass("flag")) {
            $click.removeClass("flag").addClass("check").addClass("hidden");;
            restFlag--;
            restMine++;
            restBlock++;
            $("#restMine").text(restMine);
            //如果当前是问号,则去掉问号
          } else if ($click.hasClass("check")) {
            $click.removeClass("check");
          }
          //否则就标上旗帜并且将剩余旗帜数加一,剩余雷数减一,剩余方格数减一
          else {
            $click.removeClass("hidden").addClass("flag");
            restFlag++;
            restMine--;
            restBlock--;
            $("#restMine").text(restMine);
          }
          //不允许问号的插旗方法
        } else {
          if ($click.hasClass("flag")) {
            $click.removeClass("flag").addClass("hidden");
            restFlag--;
            restMine++;
            restBlock++;
            $("#restMine").text(restMine);
            // console.log("去掉旗帜restBlock:\t%s", restBlock);
          } else {
            $click.removeClass("hidden").addClass("flag");
            restFlag++;
            restMine--;
            restBlock--;
            $("#restMine").text(restMine);
            // console.log("增加旗帜restBlock:\t%s", restBlock);
          }

        }
      } else
        openAround(x, y)
    }
  }

  //自动开周围
  function openAround(x, y) {
    var numFlag = 0;
    var $click = $("#c" + x + "-r" + y);
    //检查周围八个的标旗数量并统计
    for (var j = y - 1; j < y + 2; j++) {
      for (var i = x - 1; i < x + 2; i++) {
        if ($("#c" + i + "-r" + j).hasClass("flag"))
          numFlag++;
      }
    }
    //如果周围雷的数量等于标旗数量等于雷的数量则打开所有未标旗的格子
    if (numFlag == mineArr[x][y]) {
      for (var j = y - 1; j < y + 2; j++) {
        for (var i = x - 1; i < x + 2; i++) {
          if ($("#c" + i + "-r" + j).hasClass("hidden"))
            openblock(i, j);
        }
      }
    }
  }

  //失败判断
  function fail() {
    //停止计时
    clearInterval(timer);
    $("#alert").text("你输啦!");
    // alert("你输啦!");
    status = 0;
    //打开所有方块
    for (var i = 1; i < mineArr.length; i++) {
      for (var j = 1; j < mineArr[0].length; j++) {
        openblock(i, j)
      }
    }
  }

  //胜利判断
  function victory(total) {
    if ((total == restFlag + restBlock) && (status == 1 || status == 2)) {
      // console.log("total:\t\t%s\nrestBlock:\t%s\nrestFlag:\t%s\n", total, restBlock, restFlag)
      //停止计时
      clearInterval(timer);
      $("#alert").text("你赢啦,时间是" + $("#time").text() + "s");
      // alert("你赢啦,时间是" + $("#time").text() + "s");
      //应该还要加一步把所有的雷标上旗帜
      for (var i = 1; i < mineArr.length; i++) {
        for (var j = 1; j < mineArr[0].length; j++) {
          if (mineArr[i][j] == -1) {
            // console.log(mineArr[i][j] + "\n");
            $("#c" + i + "-r" + j).addClass("flag");
          }
        }
      }
      //改变状态
      status = 0;
    }
  }


});
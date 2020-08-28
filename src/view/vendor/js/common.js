//copy to clipboard

function copytoClipFF(text) {
  window.prompt("Copy to clipboard: Ctrl C, Enter", text);
}
function copytoClip(target){
  var copyitem = document.getElementById(target);
  copyitem.select();
  copyitem.setSelectionRange(0, 99999);
  //browser test
  try{
    var success = document.execCommand('copy', false, null);
    console.log('success');
  } catch (e) {
    copytoClipFF(copyitem.value);
  }
}
function copy(elem){
  var value = elem.value;
  elem.select();
  elem.setSelectionRange(0, 99999);
  document.execCommand('copy', false, null);
  console.log(value);
}
// slider
function autoSlide(){
  $slider = $('input[name="slider-control"]');
  var count = $slider.length;
  setInterval(function(){
    $slider.eq(($('input[name="slider-control"]:checked').index('input[name="slider-control"]') + 1 ) % 3 ).prop('checked', true).change();
  }, 4000);
}
$('input[name="slider-control"]').on('change', function(){
  var sliderVal = $('input[name="slider-control"]').index(this);
  $('#slider').children('li').removeClass('on');
  setTimeout(function(){
    $('#slider').children('li').hide();
  }, 300);
  setTimeout(function(){
    $('#slider').children('li').eq(sliderVal).show();
    $('#slider').children('li').eq(sliderVal).addClass('on');
  }, 500);
  console.log(sliderVal);
});


let PsdChecker = {
  status: false,
  get Status() {
    return this.status;
  },
  set Status(data) {
    this.status = data;
  }
};

function checkPassword() {
    console.log('create_btn click >>');
    if ($('#walletpw01').val().length === 0 || $('#walletpw02').val().length === 0) {
      console.log('Please fill out the password form below');
      $('#walletpw01').addClass('wrong');
      $('label[for="walletpw01"]').text('Please fill out the password form below');
      PsdChecker.Status = false;
      return false;
    } else if ($('#walletpw01').val().length <= 5 && $('#walletpw01').val().length <= 5) {
      console.log("Passwords should be at least 6 characters");
      $('#walletpw01').addClass('wrong');
      $('label[for="walletpw01"]').text('Passwords should be at least 6 characters');
      PsdChecker.Status = false;
      return false;
    } else if ($('#walletpw01').val() !== $('#walletpw02').val()) {
      console.log("The password you have entered is not valid!");
      $('#walletpw02').addClass('wrong');
      $('label[for="walletpw02"]').text('The password you have entered is not valid!');
      PsdChecker.Status = false;
      return false;
    } else if ($('#walletpw01').val().length !== 0) {
      if ($('#walletpw01').val() === $('#walletpw02').val()) {
        console.log("Password confirmed!");
        $('#walletpw02').removeClass('wrong');
        $('label[for="walletpw02"]').text('Password confirmed.');
        PsdChecker.Status = true;
        return true;
      }
    }
}

//popup
function popupWindow(link, w, h) {
  $link = "../../page/popup/"+link+".html?t=d";
  var left = (screen.width - w) / 2;
  var top = (screen.height - h) / 4;
  var myPopup = window.open($link,"_blank",'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
}
//popup
function windowOpen(link, w, h){
  var left = (screen.width - w) / 2;
  var top = (screen.height - h) / 4;
  var myPopup = window.open(link,"_blank",'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
}
// default popups
function openPopup(type, text, w, h, auto, step){
  // type : yn (yes , no btn), blank (only text), close(close btn)
  // text : text for the popup
  // w, h : popup size
  // auto : popup window closes automatically after entered duration, eg. 3000.
  var left = (screen.width - w) / 2;
  var top = (screen.height - h) / 4;
  $type = 'pop_type=' + type;
  $text = '&pop_text=' + text;
  $auto = "";
  $step = "";
  if(auto != ''){
    $auto = '&auto=' + auto;
  }
  if(step != ''){
    $step = '';
  }else {
    $step = '../';
  }
  var pop = window.open($step + "popup/popup.html?" + $type + $text + $auto,"_blank",'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
}

function Request(){
 var requestParam ="";
 //getParameter 펑션
  this.getParameter = function(param){
  //현재 주소를 decoding
  var url = unescape(location.href);
  //파라미터만 자르고, 다시 &그분자를 잘라서 배열에 넣는다.
   var paramArr = (url.substring(url.indexOf("?")+1,url.length)).split("&");
   for(var i = 0 ; i < paramArr.length ; i++){
     var temp = paramArr[i].split("="); //파라미터 변수명을 담음
     if(temp[0].toUpperCase() == param.toUpperCase()){
       // 변수명과 일치할 경우 데이터 삽입
       requestParam = paramArr[i].split("=")[1];
       break;
     }
   }
   return requestParam;
   console.log(requestParam);
 }
}
function getFormatdate(date){
  var y = date.getFullYear();
  var m = 1 + date.getMonth();
  m = m >= 10 ? m : '0' + m;
  var d = date.getDate();
  d = d>=10 ? d : '0' + d;
  return y +'-'+m+'-'+d;
}


// input select all & select each
$('input[name="reqdetail_sel"]').on('change',function(){
  $each = $('input[name="reqdetail_sel"]');
  $all = $('input#reqdetail_sel_all');
  var sel_cnt = $each.length;
  if($('input[name="reqdetail_sel"]:checked').length == sel_cnt){
    $all.prop('checked', true).change();
  }else {
    $all.prop('checked', false);
  }
  if($('input[name="reqdetail_sel"]:checked').length == 0){
    $('button[name="task_download"]').hide();
    $('button[name="task_delete"]').hide();
  }else {
    $('button[name="task_download"]').show();
    $('button[name="task_delete"]').show();
  }
})
$('input#reqdetail_sel_all').on('change',function(){
  $each = $('input[name="reqdetail_sel"]');
  var sel_cnt = $each.length;
  if($(this).is(':checked')){
    $each.prop('checked', true);
    $('button[name="task_download"]').show();
    $('button[name="task_delete"]').show();
  }else {
    $each.prop('checked', false).change();
    $('button[name="task_download"]').hide();
    $('button[name="task_delete"]').hide();
  }
});







// addproject.html
$('button[name="argument_control"]').on('click', function(){
  $(this).siblings('input.proj_argument').change();
})
$('input.proj_argument').on('change', function(){
  $val = parseInt($(this).val()) + 1;
  $(this).parent().siblings('td.proj_argument').children('input[name="proj_arg_max"]').attr('min', $val);
})
$('input[name="proj_arg_min"]').on('change', function(){
  $val = parseInt($(this).val());
  $val2 = $(this).parent().siblings('td.proj_argument').children('input[name="proj_arg_max"]');

  if($val+1 > parseInt($val2.val())){
    $val2.val($val + 1).change();
  }
})

$(document).ready(function(){
  var h = $(window).height();
  $('section#popup').css({'height':h});

  var date = new Date();
  date = getFormatdate(date);
  $('input#proj_date').attr('min', date);
  $('input#proj_date').val(date);
})
$('input[name="taskfile_sel"]').on('change', function(){
  $p = $(this).parents('tr');
  // $p.toggleClass('checked');
  if($(this).prop('checked')==true){
    $p.addClass('checked');
  }else {
    $p.removeClass('checked');
  }
  $each = $('input[name="taskfile_sel"]');
  $all = $('input#taskfile_sel_all');
  var sel_cnt = $each.length;
  if($('input[name="taskfile_sel"]:checked').length == sel_cnt){
    $all.prop('checked', true);
  }else {
    $all.prop('checked', false);
  }
  if($('input[name="taskfile_sel"]:checked').length == 0){
    $('button[name="pjfile_del"]').hide();
  }else {
    $('button[name="pjfile_del"]').show();
  }
});

$('input#taskfile_sel_all').on('change',function(){
  $each = $('input[name="taskfile_sel"]');
  $p = $each.parents('tr');

  var sel_cnt = $each.length;
  if($(this).is(':checked')){
    $each.prop('checked', true).change();
    $('button[name="pjfile_del"]').show();
  }else {
    $each.prop('checked', false).change();
    $('button[name="pjfile_del"]').hide();
  }
});

// $('button[name="nodata"]').on('click',function(e){
//   e.preventDefault();
//   $('#proj_path_file').click();
// });
// $('#proj_path_file').on('change', function(){
//   var files = $(this).prop("files");
//   var names = $.map(files, function(val) { return val.name; });
//   $.each(names, function(index){
//     console.log(names[index]);
//   });
//   //event for file upload check
// });

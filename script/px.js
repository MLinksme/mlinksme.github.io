var loader={};
var label=$("label"), 
	res=$("#resource"),
	progress=$("progress");

$("#Btd").click(function(){
	var textId=$("#Box").val().match(/\d+/);
	if(!textId)
		alert("请输入ID");
	else{
		msg("进行下载...")
		$.ajax({
			url: "https://www.nullcat.cn/api/pixiv/info?mode=anime&zid="+textId,
			dataType: "json",
			async: true,
			type: "GET",
			success: function(data){
				if(data.status==200)
					loader.handleAnime(data);
				else if(data.status==404)
					msg("不存在作品或含有不当内容.");
			},
			error:function(){
				
			}
		});
	}
});

loader.init=function(){
	loader.gif=new GIF({
		workers: 2,
		quality: 10,
		debug: true,
		workerScript: 'script/gif.worker.js'
	});
}

loader.handleAnime=function(data){
	msg("努力下载中...");
	var param=data.result.body.originalSrc.match(/img-zip-ugoira.+/),
		frames=data.result.body.frames;
	JSZipUtils.getBinaryContent("https://www.nullcat.cn/api/pixiv/proxy?path="+param, function(err, compress){
		if(err)
			return false;
		var zip = new JSZip(compress);
		for(var i=0;i<frames.length;i++){
			console.log(frames[i].file);
			var str = "data:image/jpg;base64,"+BufferToBase64(zip.file(frames[i].file).asArrayBuffer()),
				frameImage = new Image();
			frameImage.src = str;
			loader.gif.addFrame(frameImage, {delay: frames[i].delay });
		}
		msg("正在操作文件...");
		loader.gif.on('progress', function(p){
			progress.val(p);
		});
		loader.gif.on('finished', function(blob, data){
			console.log("finished");
			animatedImage = document.createElement('img');
			animatedImage.src=loader.buildDataURL(data);
			msg("#点击图片下载#");
			res.attr("href", URL.createObjectURL(blob));
			res.append(animatedImage);
			progress.val(0);
		});
		loader.gif.abort();
		try{
			return loader.gif.render();
		}catch(err){
			msg("中断了？刷新页面试试");
		}
	});
}

loader.buildDataURL = (function() {
  var charMap, i, j;
  charMap = {};
  for (i = j = 0; j < 256; i = ++j) {
    charMap[i] = String.fromCharCode(i);
  }
  return function(data) {
    var k, ref3, str;
    str = '';
    for (i = k = 0, ref3 = data.length; 0 <= ref3 ? k < ref3 : k > ref3; i = 0 <= ref3 ? ++k : --k) {
      str += charMap[data[i]];
    }
    return 'data:image/gif;base64,' + btoa(str);
  };
})();

function msg(content){
	label.text(content);
}

function BufferToBase64(buffer){
	var binary = '', bytes = new Uint8Array(buffer);
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++){
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
}

window.onload=loader.init;
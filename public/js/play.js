

var play = play||{};

play.init = function (){
	
	play.my				=	1;				// Phía người chơi
	play.map 			=	com.arr2Clone (com.initMap);		// Khởi tạo bảng
	play.nowManKey		=	false;			// play sẽ vận hành ngay bây giờ
	play.pace 			=	[];				// Ghi lại từng bước
	play.isPlay 		=	true ;			// Bạn có thể chơi cờ tướng không?
	play.mans 			=	com.mans;
	play.bylaw 			= 	com.bylaw;
	play.show 			= 	com.show;
	play.showPane 		= 	com.showPane;
	play.isOffensive	=	true;			// Cho dù đó là lần đầu tiên
	play.depth			=	play.depth || 3;				// Độ sâu tìm kiếm
	
	play.isFoul			=	false;	// Bạn có phạm lỗi với người cai trị?
	
	
	
	com.pane.isShow		=	 false;			// Ẩn hộp
	
	
	// Khởi tạo quân cờ
	for (var i=0; i<play.map.length; i++){
		for (var n=0; n<play.map[i].length; n++){
			var key = play.map[i][n];
			if (key){
				com.mans[key].x=n;
				com.mans[key].y=i;
				com.mans[key].isShow = true;
			}
		}
	}
	play.show();
	
	//Sự kiện nhấp chuột
	com.canvas.addEventListener("click",play.clickCanvas)
	
	com.get("regretBn").addEventListener("click", function(e) {
		play.regret();
	})
	
}




// lùi
play.regret = function (){
	var map  = com.arr2Clone(com.initMap);
	
	// Khởi tạo tất cả các phần
	for (var i=0; i<map.length; i++){
		for (var n=0; n<map[i].length; n++){
			var key = map[i][n];
			if (key){
				com.mans[key].x=n;
				com.mans[key].y=i;
				com.mans[key].isShow = true;
			}
		}
	}
	var pace= play.pace;
	pace.pop();
	pace.pop();
	
	for (var i=0; i<pace.length; i++){
		var p= pace[i].split("")
		var x = parseInt(p[0], 10);
		var y = parseInt(p[1], 10);
		var newX = parseInt(p[2], 10);
		var newY = parseInt(p[3], 10);
		var key=map[y][x];
		//try{
	 
		var cMan=map[newY][newX];
		if (cMan) com.mans[map[newY][newX]].isShow = false;
		com.mans[key].x = newX;
		com.mans[key].y = newY;
		map[newY][newX] = key;
		delete map[y][x];
		if (i==pace.length-1){
			com.showPane(newX ,newY,x,y)	
		}
		//} catch (e){
		//	com.show()
		//	z([key,p,pace,map])
			
		//	}
	}
	play.map = map;
	play.my=1;
	play.isPlay=true;
	com.show();
}



// Bấm vào bảng sự kiện
play.clickCanvas = function (e){
	if (!play.isPlay) return false;


	var key = play.getClickMan(e);
	var point = play.getClickPoint(e);
	var x = point.x;
	var y = point.y;
	if (key){
		play.clickMan(key,x,y);	
	}else {
		play.clickPoint(x,y);	
	}
	play.isFoul = play.checkFoul();// Kiểm tra xem nó có dài không

	// play.AIPlay01();
}


// Nhấp vào mảnh, trong hai trường hợp, chọn hoặc ăn
play.clickMan = function (key,x,y){
	var man = com.mans[key];
	//an quan
	if (play.nowManKey&&play.nowManKey != key && man.my != com.mans[play.nowManKey ].my){
		//manCho các miếng được ăn
		if (play.indexOfPs(com.mans[play.nowManKey].ps,[x,y])){
			man.isShow = false;
			var pace=com.mans[play.nowManKey].x+""+com.mans[play.nowManKey].y
			//z(bill.createMove(play.map,man.x,man.y,x,y))
			delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
			play.map[y][x] = play.nowManKey;
			com.showPane(com.mans[play.nowManKey].x ,com.mans[play.nowManKey].y,x,y)
			com.mans[play.nowManKey].x = x;
			com.mans[play.nowManKey].y = y;
			com.mans[play.nowManKey].alpha = 1
			
			play.pace.push(pace+x+y);
			play.nowManKey = false;
			com.pane.isShow = false;
			com.dot.dots = [];
			com.show()
			setTimeout("play.AIPlay()",500);
			if (key == "j0") play.showWin (-1);
			if (key == "J0") play.showWin (1);
		}
	// kiểm tra mảnh
	}else{
		if (man.my===1){
			if (com.mans[play.nowManKey]) com.mans[play.nowManKey].alpha = 1 ;
			man.alpha = 0.6;
			com.pane.isShow = false;
			play.nowManKey = key;
			com.mans[key].ps = com.mans[key].bl(); // Nhận tất cả các điểm bạn có thể
			com.dot.dots = com.mans[key].ps
			com.show();
		}
	}
}


// Nhấp vào điểm
play.clickPoint = function (x,y){
	var key=play.nowManKey;
	var man=com.mans[key];
	if (play.nowManKey){
		if (play.indexOfPs(com.mans[key].ps,[x,y])){
			var pace=man.x+""+man.y
			//z(bill.createMove(play.map,man.x,man.y,x,y))
			delete play.map[man.y][man.x];
			play.map[y][x] = key;
			com.showPane(man.x ,man.y,x,y)
			man.x = x;
			man.y = y;
			man.alpha = 1;
			play.pace.push(pace+x+y);
			play.nowManKey = false;
			com.dot.dots = [];
			com.show();
			setTimeout("play.AIPlay()",500);
		}else{
			//alert("Không thể đi theo cách này!")	
		}
	}
	
}

const fetchAPI = async (paceParam) => {
	// const {bylaw, depth, isFoul, isOffensive, isPlay, mans, map, my, nowManKey, pace} = play;
	// const restPlay = {bylaw, depth, isFoul, isOffensive, isPlay, mans, map, my, nowManKey, pace};

	const response = await fetch('http://localhost:3000/api/move', {
		method: 'POST',
		headers: {
			'Content-type': 'application/json; charset=UTF-8',
		},
		body: JSON.stringify({pace: paceParam, play: play}, (_, val) => {
			return (typeof val === 'function') ? `(${val})` : val;
		}),
	});
	const data = await response.json();
	return data;
}

// Ai tự động di chuyển quân cờ
play.AIPlay = async function (){
	//return
	play.my = -1 ;
	const pace = await fetchAPI(play.pace.join(""));
	if (!pace) {
		play.showWin (1);
		return ;
	}
	play.pace.push(pace.join(""));
	var key=play.map[pace[1]][pace[0]]
		play.nowManKey = key;
	
	var key=play.map[pace[3]][pace[2]];
	if (key){
		play.AIclickMan(key,pace[2],pace[3]);	
	}else {
		play.AIclickPoint(pace[2],pace[3]);	
	}
	// setTimeout("play.AIPlay01()",1000);
}

play.AIPlay01 = async function (){
	const oldDepth = play.depth;
	play.depth = 4;
	//return
	play.my = 1 ;
	const pace = await fetchAPI(play.pace.join(""));
	if (!pace) {
		play.showWin (1);
		return ;
	}
	play.pace.push(pace.join(""));
	var key=play.map[pace[1]][pace[0]]
		play.nowManKey = key;
	
	var key=play.map[pace[3]][pace[2]];
	if (key){
		play.AIclickMan(key,pace[2],pace[3]);	
	}else {
		play.AIclickPoint(pace[2],pace[3]);	
	}
	play.depth = oldDepth;
	setTimeout("play.AIPlay()",1000);
}


// Kiểm tra nếu lâu sẽ
play.checkFoul = function(){
	var p=play.pace;
	var len=parseInt(p.length,10);
	if (len>11&&p[len-1] == p[len-5] &&p[len-5] == p[len-9]){
		return p[len-4].split("");
	}
	return false;
}



play.AIclickMan = function (key,x,y){
	var man = com.mans[key];
	
	// ăn quân
	man.isShow = false;
	delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
	play.map[y][x] = play.nowManKey;
	play.showPane(com.mans[play.nowManKey].x ,com.mans[play.nowManKey].y,x,y)
	
	com.mans[play.nowManKey].x = x;
	com.mans[play.nowManKey].y = y;
	play.nowManKey = false;
	
	com.show()
	if (key == "j0") play.showWin (-1);
	if (key == "J0") play.showWin (1);
}

play.AIclickPoint = function (x,y){
	var key=play.nowManKey;
	var man=com.mans[key];
	if (play.nowManKey){
		delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
		play.map[y][x] = key;
		
		com.showPane(man.x,man.y,x,y)
		
	
		man.x = x;
		man.y = y;
		play.nowManKey = false;
		
	}
	com.show();
}


play.indexOfPs = function (ps,xy){
	for (var i=0; i<ps.length; i++){
		if (ps[i][0]==xy[0]&&ps[i][1]==xy[1]) return true;
	}
	return false;
	
}


// Nhận điểm nhấp
play.getClickPoint = function (e){
	var domXY = com.getDomXY(com.canvas);
	var x=Math.round((e.pageX-domXY.x-com.pointStartX-20)/com.spaceX)
	var y=Math.round((e.pageY-domXY.y-com.pointStartY-20)/com.spaceY)
	return {"x":x,"y":y}
}


// Lấy mảnh
play.getClickMan = function (e){
	var clickXY=play.getClickPoint(e);
	var x=clickXY.x;
	var y=clickXY.y;
	if (x < 0 || x>8 || y < 0 || y > 9) return false;
	return (play.map[y][x] && play.map[y][x]!="0") ? play.map[y][x] : false;
}

play.showWin = function (my){
	play.isPlay = false;
	if (my===1){
		alert("Xin chúc mừng, bạn đã thắng! ");
	}else{
		alert("Thật không may, bạn đã thua!");
	}
}


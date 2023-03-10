

const play = {};

// Nhận ID
play.getId = function (id){
	return document.getElementById(id)
}
play.get = function (query){
	return document.querySelector(query)
}

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
	play.thinking       =   false;
	
	com.pane.isShow		=	 false;			// Ẩn hộp
	
	
	// Khởi tạo quân cờ
	for (let i=0; i<play.map.length; i++){
		for (let n=0; n<play.map[i].length; n++){
			let key = play.map[i][n];
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
	
	play.getId("regretBn").addEventListener("click", function(e) {
		play.regret();
	})
	
}

window.onload = function(){  
	com.bg=new com.class.Bg();
	com.dot = new com.class.Dot();
	com.pane=new com.class.Pane();
	com.pane.isShow=false;
	
	com.childList=[com.bg,com.dot,com.pane];	
	com.mans	 ={};		// Bộ sưu tập cờ tướng
	com.createMans(com.initMap)		// Tạo quân cờ
	com.bg.show();
	play.getId("billBn").addEventListener("click", function(e) {
		if (confirm("Bạn có chắc chắn muốn chơi lại? (Are you sure?)")){
			window.location.reload();
		}
	})

	play.getId("onePlay").addEventListener("click", function(e) {
		play.isPlay=true ;	
		play.getId("bnBox").style.display = "none";
		play.getId("bnBox1").style.display = "block";
		play.type = play.getId("type").value;
		play.depth = play.type === 'bot' ? play.getId("level").value : null;
		play.type1 = play.getId("type1").value;
		play.depth1 = play.type1 === 'bot' ? play.getId("level1").value : null;
		play.first = play.getId("first").value;
		play.init();
		if (play.first === 'below') {
			if (play.type1 === 'bot') play.AIPlay01();
		} else {
			play.AIPlay()
		}
	});

	play.getId("type").addEventListener("change", function(e) {
		const type1 = this.value;
		if (type1 === 'bot') play.getId("level").style.display = "inline-block";
		else play.getId("level").style.display = "none";
	});

	play.getId("type1").addEventListener("change", function(e) {
		const type1 = this.value;
		if (type1 === 'bot') play.getId("level1").style.display = "inline-block";
		else play.getId("level1").style.display = "none";
	});
}


// lùi
play.regret = function (){
	let map  = com.arr2Clone(com.initMap);
	
	// Khởi tạo tất cả các phần
	for (let i=0; i<map.length; i++){
		for (let n=0; n<map[i].length; n++){
			let key = map[i][n];
			if (key){
				com.mans[key].x=n;
				com.mans[key].y=i;
				com.mans[key].isShow = true;
			}
		}
	}
	let pace= play.pace;
	pace.pop();
	pace.pop();
	
	for (let i=0; i<pace.length; i++){
		let p= pace[i].split("")
		let x = parseInt(p[0], 10);
		let y = parseInt(p[1], 10);
		let newX = parseInt(p[2], 10);
		let newY = parseInt(p[3], 10);
		let key=map[y][x];
		//try{
	 
		let cMan=map[newY][newX];
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
	if (!play.isPlay || play.thinking) return false;

	let key = play.getClickMan(e);
	let point = play.getClickPoint(e);
	let x = point.x;
	let y = point.y;
	if (key){
		play.clickMan(key,x,y);	
	}else {
		play.clickPoint(x,y);	
	}
	play.isFoul = play.checkFoul();// Kiểm tra xem nó có dài không
}


// Nhấp vào mảnh, trong hai trường hợp, chọn hoặc ăn
play.clickMan = function (key,x,y){
	let man = com.mans[key];
	//an quan
	if (play.nowManKey&&play.nowManKey != key && man.my != com.mans[play.nowManKey ].my){
		//manCho các miếng được ăn
		if (play.indexOfPs(com.mans[play.nowManKey].ps,[x,y])){
			man.isShow = false;
			let pace=com.mans[play.nowManKey].x+""+com.mans[play.nowManKey].y
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
	let key=play.nowManKey;
	let man=com.mans[key];
	if (play.nowManKey){
		if (play.indexOfPs(com.mans[key].ps,[x,y])){
			let pace=man.x+""+man.y
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
	play.thinking = true;
	play.get('.lds-ellipsis').style.display = 'block';
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
	play.thinking = false;
	play.get('.lds-ellipsis').style.display = 'none';
	return data;
}

// Ai tự động di chuyển quân cờ
play.AIPlay = async function (){
	//return
	let key;
	play.my = -1 ;
	const pace = await fetchAPI(play.pace.join(""));
	if (!pace) {
		play.showWin (1);
		return ;
	}
	play.pace.push(pace.join(""));
	key=play.map[pace[1]][pace[0]]
		play.nowManKey = key;
	
	key=play.map[pace[3]][pace[2]];
	if (key){
		play.AIclickMan(key,pace[2],pace[3]);	
	}else {
		play.AIclickPoint(pace[2],pace[3]);	
	}
	
	if (play.type1 === 'bot') setTimeout("play.AIPlay01()",1000);
}

play.AIPlay01 = async function (){
	let key;
	const oldDepth = play.depth;
	play.depth = play.depth1;
	//return
	play.my = 1 ;
	const pace = await fetchAPI(play.pace.join(""));
	if (!pace) {
		play.showWin (1);
		return ;
	}
	play.pace.push(pace.join(""));
	key=play.map[pace[1]][pace[0]]
		play.nowManKey = key;
	
	key=play.map[pace[3]][pace[2]];
	if (key){
		play.AIclickMan(key,pace[2],pace[3]);	
	}else {
		play.AIclickPoint(pace[2],pace[3]);	
	}
	play.depth = oldDepth;
	
	if (play.type === 'bot') setTimeout("play.AIPlay()",1000);
}


// Kiểm tra nếu lâu sẽ
play.checkFoul = function(){
	let p=play.pace;
	let len=parseInt(p.length,10);
	if (len>11&&p[len-1] == p[len-5] &&p[len-5] == p[len-9]){
		return p[len-4].split("");
	}
	return false;
}



play.AIclickMan = function (key,x,y){
	let man = com.mans[key];
	
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
	let key=play.nowManKey;
	let man=com.mans[key];
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
	for (let i=0; i<ps.length; i++){
		if (ps[i][0]==xy[0]&&ps[i][1]==xy[1]) return true;
	}
	return false;
	
}


// Nhận điểm nhấp
play.getClickPoint = function (e){
	let domXY = com.getDomXY(com.canvas);
	let x=Math.round((e.pageX-domXY.x-com.pointStartX-20)/com.spaceX)
	let y=Math.round((e.pageY-domXY.y-com.pointStartY-20)/com.spaceY)
	return {"x":x,"y":y}
}


// Lấy mảnh
play.getClickMan = function (e){
	let clickXY=play.getClickPoint(e);
	let x=clickXY.x;
	let y=clickXY.y;
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


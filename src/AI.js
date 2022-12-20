const com = require('./common')
let play;

const AI = {};

AI.historyTable	=	{};		// Bảng lịch sử

// khởi tạo trí tuệ nhân tạo
AI.init = function(pace, playku){
	play = playku;
	let bill = AI.historyBill || com.gambit; // Mở thư viện
	if (bill.length){
		let len=pace.length;
		let arr=[];
		// Tìm kiếm trò chơi trước
		// for (let i=0;i< bill.length;i++){
		// 	if (bill[i].slice(0,len)==pace) {
		// 	arr.push(bill[i]);
		// 	}
		// }
		if (arr.length){
			let inx=Math.floor( Math.random() * arr.length );
			AI.historyBill = arr ;
			return arr[inx].slice(len,len+4).split("");
		}else{
			AI.historyBill = [] ;
		}
		
	}
	 // Nếu không có trò chơi bên trong, trí tuệ nhân tạo bắt đầu hoạt động.
	let initTime = new Date().getTime();
	AI.treeDepth=play.depth;
	//AI.treeDepth=4;
	
	AI.number=0;
	AI.setHistoryTable.lenght = 0

	let val=AI.getAlphaBeta(-99999 ,99999, AI.treeDepth, com.arr2Clone(play.map),play.my);
	//let val = AI.iterativeSearch(com.arr2Clone(play.map),play.my)
	if (!val||val.value==-8888) {
		AI.treeDepth=2;
		val=AI.getAlphaBeta(-99999 ,99999, AI.treeDepth, com.arr2Clone(play.map),play.my);
	}
	//let val = AI.iterativeSearch(com.arr2Clone(play.map),play.my);
	if (val&&val.value!=-8888) {
		let man = play.mans[val.key];
		return [man.x,man.y,val.x,val.y]
	}else {
		return false;	
	}
}


// Phương pháp tìm kiếm sâu lặp đi lặp lại
AI.iterativeSearch = function (map, my){
	let timeOut=100;
	let initDepth = 1;
	let maxDepth = 8;
	AI.treeDepth=0;
	let initTime = new Date().getTime();
	let val = {};
	for (let i=initDepth; i<=maxDepth; i++){
		let nowTime= new Date().getTime();
		AI.treeDepth=i;
		AI.aotuDepth=i;
		let val = AI.getAlphaBeta(-99999, 99999, AI.treeDepth , map ,my)
		if (nowTime-initTime > timeOut){
			return val;
		}
	}
	return false;
}


// Lấy tất cả các mảnh trên bảng
AI.getMapAllMan = function (map, my){
	let mans=[];
	for (let i=0; i<map.length; i++){
		for (let n=0; n<map[i].length; n++){
			let key = map[i][n];
			if (key && play.mans[key].my == my){
				play.mans[key].x = n;
				play.mans[key].y = i;
				mans.push(play.mans[key])
			}
		}
	}
	return mans;
}

/*

// Nhận tất cả các di chuyển của quân cờ
AI.getMoves = function (map, my, txtMap){
	let highMores = [];   // Di chuyển ưu tiên cao
	let manArr = AI.getMapAllMan (map, my);
	let moves = [];
	let history=AI.historyTable[txtMap];
	for (let i=0; i<manArr.length; i++){
		let man = manArr[i];
		let val=man.bl(map);
		for (let n=0; n<val.length; n++){
			if (history){
				highMores.push([man.x,man.y,val[n][0],val[n][1],man.key])
			}else{
				moves.push([man.x,man.y,val[n][0],val[n][1],man.key])
			}
		}
	}
	return highMores.concat(moves);
}
*/

// Nhận tất cả các di chuyển của quân cờ
AI.getMoves = function (map, my){
	let manArr = AI.getMapAllMan (map, my);
	let moves = [];
	let foul=play.isFoul;
	for (let i=0; i<manArr.length; i++){
		let man = manArr[i];
		let val=man.bl(map);
		
		for (let n=0; n<val.length; n++){
			let x=man.x;
			let y=man.y;
			let newX=val[n][0];
			let newY=val[n][1];
			 //如果不是长将着法
			if (foul[0]!=x || foul[1]!=y || foul[2]!=newX || foul[3]!=newY ){
				moves.push([x,y,newX,newY,man.key])
			}
		}
	}
	return moves;
}

// A: giá trị người chơi hiện tại / B: giá trị đối thủ / độ sâu: cấp độ
AI.getAlphaBeta = function (A, B, depth, map ,my) { 
	let rootKey;
	let key;
	let newX;
	let newY;
	//let txtMap= map.join();
	//let history=AI.historyTable[txtMap];
	//	if (history && history.depth >= AI.treeDepth-depth+1){
	//		return 	history.value*my;
	//}
	if (depth == 0) {
		return {"value":AI.evaluate(map , my)}; // chức năng đánh giá tình huống;
　	}
　	let moves = AI.getMoves(map , my ); // Tạo tất cả các lần chạy;
　	// Điều này sẽ tăng hiệu quả sau khi sắp xếp

	for (let i=0; i < moves.length; i++) {
		
		
　　	
	// Đi theo con đường này;
		let move= moves[i];
		key = move[4];
		newX= move[2];
		newY= move[3];
		let oldX= move[0];
		let oldY= move[1];
		let clearKey = map[ newY ][ newX ]||"";

		map[ newY ][ newX ] = key;
		delete map[ oldY ][ oldX ];
		play.mans[key].x = newX;
		play.mans[key].y = newY;
		
	　　if (clearKey=="j0"||clearKey=="J0") {// Bị ăn quân, hoàn tác vụ này;
			play.mans[key]	.x = oldX;
			play.mans[key]	.y = oldY;
			map[ oldY ][ oldX ] = key;
			delete map[ newY ][ newX ];
			if (clearKey){
				 map[ newY ][ newX ] = clearKey;
				// play.mans[ clearKey ].isShow = false;
			}

			return {"key":key,"x":newX,"y":newY,"value":8888};
			//return rootKey; 
	　　}else { 
	　　	let val = -AI.getAlphaBeta(-B, -A, depth - 1, map , -my).value; 
			//val = val || val.value;
	
	　　	
	// Hoàn tác di chuyển này 
			play.mans[key]	.x = oldX;
			play.mans[key]	.y = oldY;
			map[ oldY ][ oldX ] = key;
			delete map[ newY ][ newX ];
			if (clearKey){
				 map[ newY ][ newX ] = clearKey;
				 //play.mans[ clearKey ].isShow = true;
			}
	　　	if (val >= B) { 
				
		// Ghi lại di chuyển này vào bảng lịch sử;
				//AI.setHistoryTable(txtMap,AI.treeDepth-depth+1,B,my);
				return {"key":key,"x":newX,"y":newY,"value":B}; 
			} 
			if (val > A) { 
	　　　　	A = val; 
					// Đặt cách tốt nhất để di chuyển;
				if (AI.treeDepth == depth) rootKey={"key":key,"x":newX,"y":newY,"value":A};
			} 
		} 
　	} 
	
		// Ghi lại di chuyển này vào bảng lịch sử;
	//AI.setHistoryTable(txtMap,AI.treeDepth-depth+1,A,my);
	if (AI.treeDepth == depth) {// đã trở lại gốc
		if (!rootKey){
			
		// AI không có cách tốt nhất để đi, chỉ ra rằng AI đã chết, trả về sai
			return false;
		}else{
			// Đây là cách tốt nhất để đi;
			return rootKey;
		}
	}
　return {"key":key,"x":newX,"y":newY,"value":A}; 
}


// Phương thức giải thưởng được ghi lại trong bảng lịch sử.
AI.setHistoryTable = function (txtMap,depth,value,my){
	AI.setHistoryTable.lenght ++;
	AI.historyTable[txtMap] = {depth:depth,value:value} 
}


// Đánh giá trò chơi cờ vua để có sự khác biệt giữa các quân cờ
AI.evaluate = function (map,my){
	let val=0;
	for (let i=0; i<map.length; i++){
		for (let n=0; n<map[i].length; n++){
			let key = map[i][n];
			if (key){
				val += play.mans[key].value[i][n] * play.mans[key].my;
			}
		}
	}
	//val+=Math.floor( Math.random() * 10);  // Hãy để AI di chuyển để tăng các yếu tố ngẫu nhiên
	//com.show()
	//z(val*my)
	AI.number++;
	return val*my;
}

// Đánh giá trò chơi cờ vua để có sự khác biệt giữa các quân cờ
AI.evaluate1 = function (map,my){
	let val=0;
	for (let i in play.mans){
		let man=play.mans[i];
		if (man.isShow){
			val += man.value[man.y][man.x] * man.my;
		}
	}
	//val+=Math.floor( Math.random() * 10);  // Hãy để AI di chuyển để tăng các yếu tố ngẫu nhiên
	//com.show()
	//z(val*my)
	AI.number++;
	return val*my;
}

module.exports = AI;


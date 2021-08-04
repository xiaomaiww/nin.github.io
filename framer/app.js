 var bg, layerA, layerB, layerC;
Framer.Defaults.Animation = {
 
  curve: "bezier-curve(0.5, -0.25, .25, 1)",//不带反弹效果
  time: 0.4
};   //全局动画的设置
bg = new BackgroundLayer({
  backgroundColor: "#28affa"
});
 COLOR2 =bg.backgroundColor.lighten(8); //背景色 物体的亮度为15
  COLOR1 =bg.backgroundColor.lighten(5); //背景色 物体的亮度为15

 

//-----------------------------------------------------------------------------------------------------------------------------------------------1
layerA = (function() {
  results = [];
  for (i = j = 0; j <=5; i = ++j) {
    results.push(new Layer({
      x: 20 + i *110,
      y:12,
      height: 100,
      width: 100,
	  backgroundColor : COLOR2 
    }));
  }
  return results;
})();

 var COLOR, box;

COLOR = Utils.randomColor(0.5); //随机颜色
Screen.perspective = 800; //透视
//Screen.backgroundColor = COLOR.lighten(40); //背景色 物体的亮度为40

box = layerA[1]

box.orgProps = box.props;
box.draggable.enabled = true; //可拖拉的
box.draggable.constraints = Screen.frame;//拖动约束在框内

box.on(Events.TapStart, function(event) { //
  this.originX = event.offsetX / this.width; //originX 原点的X=offsetX偏移量X
  this.originY = event.offsetY / this.height;
  return this.animate({
    properties: {
      scale: 1.2,
      brightness: 80
    },
	 options: {
       curve: "spring(200, 14, 10, 0, 0.2)",
	  time: 0.2  
	   },
  
  });
});

box.on(Events.DragMove, function() {
  return this.animate({
    properties: {
      rotationX: -Utils.modulate(this.draggable.calculateVelocity().y, [-1, 1], [-45, 45], true), //计算速度偏角[-45, 45]
      rotationY: Utils.modulate(this.draggable.calculateVelocity().x, [-1, 1], [-45, 45], true)
    },
   curve: "spring(200, 18, 10, 0.1)"	 
  });
});

box.on(Events.TapEnd, function() {
  this.animateStop;
  return this.animate({ //运行动画
    properties: {
      rotationX: box.orgProps.rotationX,
      rotationY: box.orgProps.rotationY,
      rotationZ: box.orgProps.rotationZ,
      scale: box.orgProps.scale,
     // curve: "spring(200, 30, 0, 0, 0.1)"
	 	 options: {
       curve: "spring(200, 30, 0, 0, 0.1)",
	  time: 0.2  
	   }
    }
  });
});


 layerA[2].rotation=360;
 layerA[2].states.rotate = {  //第三层。属性。旋转
  rotation: 0,
  animationOptions: {  //内部单独的动画设置
    time: 1,
    curve: "ease"
  }  
};
//layerC.onTap(function() {
//  return layerC.stateCycle();//配合.rotate使用
//});
 layerA[2].on(Events.Click, function() {//点击的另一种表达方式
    return this.stateCycle();//配合.rotate使用
});







 layerB = (function() {
  results = [];
  for (i = j = 0; j <=8; i = ++j) {
    results.push(new Layer({
      x: 20 + i *110,
      y:Align.center(),
      height: 100,
      width: 100,
	  backgroundColor : COLOR2 
    }));
  }
  return results;
})();





var i, number, page11, pageContent11;

page11 = new PageComponent({
 parent:  layerB[1] ,
  width:  layerB[1] .width,
  height:  layerB[1] .height,
  scrollVertical: false,
  backgroundColor: "#fff"
});

for (number = i = 0; i < 5; number = ++i) {
  pageContent11 = new Layer({
    width: page11.width,
    height: page11.height,
    x: page11.width * number,
    backgroundColor: Utils.randomColor(0.5),
    parent: page11.content
  });
  pageContent11.html = number + 1;
  pageContent11.style = {
    "font-size": "50px",
    "font-weight": "100",
    "text-align": "center",
    "line-height": page11.height + "px"
  };
}
page11.originY = 0; //定义页面垂直对齐的方式。原点定义为介于0和1之间的数字，其中0是上边缘，1是下边缘。默认值为0.5（中心）。
page11.velocityThreshold = 0.2;// 拉力velocityThreshold影响velocity在捕捉到不同页面时所扮演的角色。除了滚动距离之外，PageComponent还考虑了滚动速度（velocity）
 
page11.animationOptions = { //划动动画
  curve: "ease",
  time: 0.25
};
 
 















 layerC = (function() {
  results = [];
  for (i = j = 0; j <=5; i = ++j) {
    results.push(new Layer({
      x: 20 + i *110,
      y:Align.bottom(),
      height: 100,
      width: 100,
	  backgroundColor : COLOR2 
    }));
  }
  return results;
})();
 
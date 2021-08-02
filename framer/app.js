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
 
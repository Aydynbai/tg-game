/* Тоғызқұмалақ — толық ережесімен, компьютерге қарсы */
P.register((function(){
  var G={id:'togyz',title:'Тоғызқұмалақ',sub:'Дала шахматы',hideCursor:false};
  var x,W,H,B,st,state='menu',anim=null,aiT=0,flash=null,msg='',DEPTH=3,vsAI=true,turn=0;
  var bg=document.createElement('canvas');

  function fresh(){var b=[];for(var i=0;i<18;i++)b.push(9);return {b:b,k:[0,0],tz:[-1,-1]}}
  function own(side,i){return side==0?i<9:i>=9}
  function moves(s,side){var m=[];for(var i=0;i<9;i++){var h=side*9+i;if(s.b[h]>0)m.push(h)}return m}
  function apply(s,side,h){
    var b=s.b.slice(),k=s.k.slice(),tz=s.tz.slice(),path=[],n=b[h],pos;b[h]=0;
    if(n==1)pos=h+1;else{b[h]=1;path.push(h);n--;pos=h+1}
    while(n>0){var p=pos%18;if(p==tz[0]){k[0]++;path.push(100)}else if(p==tz[1]){k[1]++;path.push(101)}else{b[p]++;path.push(p)}pos++;n--}
    var last=(pos-1)%18,cap=null;
    if(!own(side,last)&&last!=tz[0]&&last!=tz[1]){
      if(b[last]%2==0&&b[last]>0){cap={i:last,n:b[last],t:'even'};k[side]+=b[last];b[last]=0}
      else if(b[last]==3&&tz[side]<0){var rel=last%9,o=tz[1-side];
        if(rel!=8&&!(o>=0&&o%9==rel)){tz[side]=last;k[side]+=3;b[last]=0;cap={i:last,n:3,t:'tz'}}}}
    return {b:b,k:k,tz:tz,path:path,cap:cap,last:last};
  }
  function finish(s,mover){ // ойын бітті ме? {winner:0/1/-1}
    if(s.k[mover]>81)return {w:mover};
    if(s.k[0]==81&&s.k[1]==81)return {w:-1};
    var o=1-mover;if(moves(s,o).length==0){var k=s.k.slice();for(var i=0;i<9;i++)k[mover]+=s.b[mover*9+i];
      return {w:k[0]>k[1]?0:k[1]>k[0]?1:-1,k:k}}
    return null;
  }
  function evalS(s){return (s.k[1]-s.k[0])+(s.tz[1]>=0?7:0)-(s.tz[0]>=0?7:0)}
  function search(s,side,d,a,b){
    var f=null;if(s.k[0]>81)return -1000;if(s.k[1]>81)return 1000;
    var ms=moves(s,side);if(d==0||ms.length==0)return evalS(s);
    var best=side==1?-1e9:1e9;
    for(var i=0;i<ms.length;i++){var r=apply(s,side,ms[i]),v=search(r,1-side,d-1,a,b);
      if(side==1){if(v>best)best=v;if(best>a)a=best}else{if(v<best)best=v;if(best<b)b=best}if(a>=b)break}
    return best;
  }
  function aiMove(){var ms=moves(st,1),best=-1e9,bm=ms[0];
    ms.forEach(function(h){var v=search(apply(st,1,h),0,DEPTH,-1e9,1e9)+Math.random()*.4;if(v>best){best=v;bm=h}});return bm}

  /* геометрия */
  function dims(){W=P.W;H=P.H;var bh=Math.min(H*.54,W*.86*.46),bw=bh/.46;B={x:(W-bw)/2,y:H*.53-bh/2,w:bw,h:bh};
    B.hw=bw/10.6;B.hh=bh*.33;B.gap=(bw-9*B.hw)/10;
    bg.width=W;bg.height=H;var c=bg.getContext('2d');paintBg(c,W,H);paintBoard(c);}
  function holeXY(i){var col=i<9?i:17-i,top=i>=9;return {x:B.x+B.gap+col*(B.hw+B.gap)+B.hw/2,y:top?B.y+B.h*.2:B.y+B.h*.8}}
  function kazanRect(side){return {x:B.x+B.w*.08,y:side==1?B.y+B.h*.385:B.y+B.h*.515,w:B.w*.84,h:B.h*.1}}
  function rr(c,x0,y0,w,h,r){c.beginPath();c.moveTo(x0+r,y0);c.arcTo(x0+w,y0,x0+w,y0+h,r);c.arcTo(x0+w,y0+h,x0,y0+h,r);c.arcTo(x0,y0+h,x0,y0,r);c.arcTo(x0,y0,x0+w,y0,r);c.closePath()}
  function paintBg(c,w,h){var g=c.createRadialGradient(w/2,h*.5,0,w/2,h*.5,w*.75);g.addColorStop(0,'#2a1d2e');g.addColorStop(1,'#0f0a12');c.fillStyle=g;c.fillRect(0,0,w,h);
    var s=h*.14,row=0;for(var y=0;y<h+s;y+=s,row++)for(var xx=(row%2)*s/2;xx<w+s;xx+=s)P.orn(c,1,xx,y,s*.6,'rgba(255,207,110,.035)',s*.04)}
  function paintBoard(c){
    c.save();c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=H*.05;c.shadowOffsetY=H*.015;
    var g=c.createLinearGradient(0,B.y,0,B.y+B.h);g.addColorStop(0,'#8a5631');g.addColorStop(.5,'#a8693b');g.addColorStop(1,'#7a4a29');
    c.fillStyle=g;rr(c,B.x,B.y,B.w,B.h,B.h*.06);c.fill();c.restore();
    c.strokeStyle='rgba(60,30,12,.25)';c.lineWidth=1;
    for(var i=0;i<60;i++){var yy=B.y+B.h*(i/60)+Math.sin(i*1.7)*3;c.beginPath();c.moveTo(B.x+8,yy);c.bezierCurveTo(B.x+B.w*.3,yy+5,B.x+B.w*.6,yy-5,B.x+B.w-8,yy+2);c.stroke()}
    c.strokeStyle='#ffcf6e';c.globalAlpha=.55;c.lineWidth=B.h*.012;rr(c,B.x+B.h*.03,B.y+B.h*.03,B.w-B.h*.06,B.h*.94,B.h*.05);c.stroke();c.globalAlpha=1;
    for(var j=0;j<4;j++){var ox=j%2?B.x+B.w-B.h*.09:B.x+B.h*.09,oy=j<2?B.y+B.h*.09:B.y+B.h*.91;P.orn(c,0,ox,oy,B.h*.09,'rgba(255,207,110,.7)',B.h*.012)}
    for(i=0;i<18;i++){var p=holeXY(i);c.fillStyle='#3d2112';c.beginPath();c.ellipse(p.x,p.y,B.hw/2,B.hh/2,0,0,7);c.fill();
      var ig=c.createLinearGradient(0,p.y-B.hh/2,0,p.y+B.hh/2);ig.addColorStop(0,'rgba(0,0,0,.45)');ig.addColorStop(1,'rgba(255,255,255,.05)');
      c.fillStyle=ig;c.beginPath();c.ellipse(p.x,p.y,B.hw/2,B.hh/2,0,0,7);c.fill();
      c.fillStyle='rgba(255,236,200,.5)';c.font='700 '+(B.h*.045)+'px Manrope,Arial';c.textAlign='center';
      c.fillText(i<9?i+1:i-8,p.x,i<9?p.y+B.hh/2+B.h*.06:p.y-B.hh/2-B.h*.025)}
    [0,1].forEach(function(s){var r=kazanRect(s);c.fillStyle='#3d2112';rr(c,r.x,r.y,r.w,r.h,r.h/2);c.fill()});
  }
  function ball(c,bx,by,r,gold){var g=c.createRadialGradient(bx-r*.35,by-r*.35,r*.1,bx,by,r);
    g.addColorStop(0,gold?'#fff1b8':'#fbf3e6');g.addColorStop(1,gold?'#c9962c':'#9c8a72');c.fillStyle=g;c.beginPath();c.arc(bx,by,r,0,7);c.fill()}
  function drawHole(c,i,n,hl,tzOwner){
    var p=holeXY(i),r=B.hw*.11,cols=3,shown=Math.min(n,24);
    for(var j=0;j<shown;j++){var col=j%cols,row=Math.floor(j/cols);ball(c,p.x+(col-1)*r*2.15,p.y+B.hh*.38-row*r*1.9-r,r,false)}
    if(tzOwner>=0){c.strokeStyle=tzOwner==0?'#9be8ad':'#ff8c6e';c.lineWidth=B.h*.012;c.beginPath();c.ellipse(p.x,p.y,B.hw*.55,B.hh*.55,0,0,7);c.stroke();
      c.fillStyle=c.strokeStyle;c.font='800 '+(B.h*.05)+'px Manrope,Arial';c.textAlign='center';c.fillText('Тұздық',p.x,p.y+B.h*.015)}
    if(hl){c.strokeStyle=hl;c.lineWidth=B.h*.014;c.beginPath();c.ellipse(p.x,p.y,B.hw*.56,B.hh*.56,0,0,7);c.stroke()}
    c.fillStyle='#fff7ea';c.font='800 '+(B.h*.075)+'px Manrope,Arial';c.textAlign='center';
    var ty=i<9?p.y+B.hh/2+B.h*.14:p.y-B.hh/2-B.h*.085;c.fillText(n,p.x,ty);
  }
  function drawKazan(c,side,n){var r=kazanRect(side),br=r.h*.2,perRow=Math.floor(r.w/(br*2.1))-6,shown=Math.min(n,perRow*2);
    for(var j=0;j<shown;j++){var col=j%perRow,row=Math.floor(j/perRow);ball(c,r.x+r.h*.5+col*br*2.1,r.y+r.h*.3+row*r.h*.4,br,true)}
    c.fillStyle=side==0?'#9be8ad':'#ffb08e';c.font='800 '+(r.h*.9)+'px Manrope,Arial';c.textAlign='right';c.fillText(n,r.x+r.w-r.h*.4,r.y+r.h*.82)}

  /* ойын барысы */
  function hud(){return;P.hud([['Сіз',(anim?anim.k:st.k)[0],1],['Кезек',(state=='ai'||(state=='anim'&&anim&&anim.side==1))?'Компьютер':'Сіздікі'],['Компьютер',(anim?anim.k:st.k)[1]]])}
  function menu(){state='menu';P.hud(null);st=fresh();
    P.panel({title:'Тоғызқұмалақ',text:'Отауды таңдап OK басыңыз. Құмалақтар сағат тіліне қарсы таралады. Соңғы құмалақ қарсылас отауында жұп сан жасаса, бәрін аласыз, үш болса — тұздық. 82 құмалақ жинаған жеңеді. Екі адам: бірінші телефон — төменгі қатар, екіншісі — жоғарғы.',
      btns:[['Компьютерге қарсы',function(){begin(true)}],['Екі адам',function(){begin(false)}]]})}
  function begin(ai){P.panel(null);vsAI=ai;st=fresh();anim=null;turn=0;state='player';hud()}
  function startMove(side,h){var r=apply(st,side,h);anim={side:side,h:h,res:r,i:0,t:0,b:st.b.slice(),k:st.k.slice(),tz:st.tz.slice(),phase:'sow'};anim.b[h]=0;state='anim';P.S.click();hud()}
  function stepAnim(dt){
    var a=anim,spd=a.res.path.length>20?.05:.085;a.t+=dt;
    if(a.phase=='sow'){while(a.t>=spd&&a.i<a.res.path.length){a.t-=spd;var p=a.res.path[a.i++];if(p>=100)a.k[p-100]++;else a.b[p]++;P.S.tick(.35)}
      if(a.i>=a.res.path.length&&a.t>.25){a.phase='cap';a.t=0;
        if(a.res.cap){flash={i:a.res.cap.i,t:.8,tz:a.res.cap.t=='tz'};a.b[a.res.cap.i]=0;a.k[a.side]=a.res.k[a.side];
          if(a.res.cap.t=='tz'){a.tz=a.res.tz;P.S.win();P.toast(vsAI?(a.side==0?'Тұздық алдыңыз!':'Компьютер тұздық алды'):(a.side+1)+'-ойыншы тұздық алды!',1500)}
          else{P.S.hit(a.res.cap.n>=10);P.toast((vsAI?(a.side==0?'':'Компьютер '):(a.side+1)+'-ойыншы ')+'+'+a.res.cap.n,1100)}
          if(a.side==0)P.vib([40])}}}
    else if(a.phase=='cap'&&a.t>(a.res.cap?.6:.05)){
      st={b:a.res.b,k:a.res.k,tz:a.res.tz};var side=a.side;anim=null;
      var f=finish(st,side);if(f){gameOver(f);return}
      turn=1-side;if(vsAI&&turn==1){state='ai';aiT=.7}else state='player';hud()}
  }
  function gameOver(f){state='over';P.hud(null);var k=f.k||st.k;
    var wins=P.best('togyz');if(vsAI&&f.w==0){wins++;P.best('togyz',wins);P.S.win()}else if(f.w>=0)P.S.lose();
    var sub=f.w<0?'Тең ойын':vsAI?(f.w==0?'Жеңіс!':'Компьютер жеңді'):(f.w==0?'1-ойыншы жеңді!':'2-ойыншы жеңді!');
    setTimeout(function(){P.panel({sub:sub,big:k[0]+' : '+k[1],text:vsAI?'Компьютерді жеңген саны: '+wins:'',
      btns:[['Компьютерге қарсы',function(){begin(true)}],['Екі адам',function(){begin(false)}]]})},700)}
  function curPid(){return !vsAI&&P.padCount()==2?turn:0}
  function hoverHole(pt){if(state!='player')return -1;pt=pt||P.ptr(curPid());for(var j=0;j<9;j++){var i=turn*9+j,p=holeXY(i);
    if(Math.abs(pt.x-p.x)<B.hw*.6&&Math.abs(pt.y-p.y)<B.hh*.75+B.h*.1)return st.b[i]>0?i:-1}return -1}

  G.start=function(){x=P.ctx;dims();menu()};
  G.resize=function(){dims()};
  G.onAction=function(mx,my,pid){if(state!='player')return;
    if(!vsAI&&pid!=null&&P.padCount()==2&&pid!=turn){P.toast((turn+1)+'-ойыншының кезегі',1000);return}
    var h=hoverHole({x:mx,y:my});if(h>=0)startMove(turn,h)};
  G.frame=function(dt){
    if(state=='ai'){aiT-=dt;if(aiT<=0){var ms=moves(st,1);if(ms.length)startMove(1,aiMove());}}
    if(state=='anim'&&anim)stepAnim(dt);
    if(flash){flash.t-=dt;if(flash.t<=0)flash=null}
    x.drawImage(bg,0,0);
    var b=anim?anim.b:st.b,k=anim?anim.k:st.k,tz=anim?anim.tz:st.tz,hv=hoverHole(),prev=hv>=0?apply(st,turn,hv).last:-1;
    for(var i=0;i<18;i++){var hl=null;if(i==hv)hl='#ffcf6e';else if(i==prev)hl='rgba(255,207,110,.5)';
      if(flash&&flash.i==i)hl=flash.tz?'#9be8ad':'#ffffff';if(anim&&anim.h==i&&anim.phase=='sow')hl='rgba(255,255,255,.6)';
      drawHole(x,i,b[i],hl,tz[0]==i?0:tz[1]==i?1:-1)}
    drawKazan(x,1,k[1]);drawKazan(x,0,k[0]);
    x.textAlign='center';x.font='800 '+(H*.032)+'px Manrope,Arial';
    x.fillStyle='rgba(255,176,142,.85)';x.fillText(vsAI?'Компьютер'+(state=='ai'?' ойланып жатыр…':''):'2-ойыншы'+(state=='player'&&turn==1?' — сіздің жүрісіңіз':''),W/2,B.y-B.h*.2);
    x.fillStyle='rgba(155,232,173,.9)';x.fillText(vsAI?(state=='player'?'Сіздің жүрісіңіз — отауды таңдаңыз':'Сіз'):'1-ойыншы'+(state=='player'&&turn==0?' — сіздің жүрісіңіз':''),W/2,B.y+B.h+B.h*.27);
  };
  G.cover=function(c,w,h){paintBg(c,w,h);var sw=W,sh=H,sB=B;W=w;H=h;var bw=w*.86,bh=bw*.46;B={x:(w-bw)/2,y:h*.42-bh/2,w:bw,h:bh};
    B.hw=bw/10.6;B.hh=bh*.33;B.gap=(bw-9*B.hw)/10;paintBoard(c);var s=fresh();s.b[3]=12;s.b[12]=3;
    for(var i=0;i<18;i++){var p=holeXY(i),r=B.hw*.11;for(var j=0;j<Math.min(s.b[i],12);j++)ball(c,p.x+(j%3-1)*r*2.15,p.y+B.hh*.38-Math.floor(j/3)*r*1.9-r,r,false)}
    W=sw;H=sh;B=sB};
  return G;
})());

/* Асық ату — сақамен кондағы асықтарды ату */
P.register((function(){
  var G={id:'asyq',title:'Асық ату',sub:'Сақамен асық ұт',hideCursor:false};
  var x,W,H,C,R,ra,rs,bodies=[],saka,state='menu',won=0,total=0,pow=0,powT=0,ang=0,shotWon=0,pops=[],tickT=0,cleared=false;
  var bg=document.createElement('canvas');
  var FACES=[['Алшы',4],['Тәйке',3],['Бүк',2],['Шік',1]];
  var SHOTS=7,N=11,two=false,pl=0,sc=[0,0],sh=[0,0];
  function cpid(){return two&&P.padCount()==2?pl:0}

  function paintGround(c,w,h,cx,cy,rr){
    var g=c.createRadialGradient(cx,cy,0,cx,cy,w*.75);g.addColorStop(0,'#a87a4c');g.addColorStop(.5,'#8a6038');g.addColorStop(1,'#4a3220');
    c.fillStyle=g;c.fillRect(0,0,w,h);
    var seed=7;function rr2(){seed=(seed*9301+49297)%233280;return seed/233280}
    for(var i=0;i<900;i++){c.fillStyle=rr2()<.5?'rgba(60,38,20,.18)':'rgba(220,180,130,.12)';var s=1+rr2()*2.5*h/720;c.fillRect(rr2()*w,rr2()*h,s,s)}
    for(i=0;i<40;i++){c.fillStyle='rgba(70,50,35,.35)';c.beginPath();c.ellipse(rr2()*w,rr2()*h,(2+rr2()*4)*h/720,(1.5+rr2()*3)*h/720,rr2()*3,0,7);c.fill()}
    c.save();c.setLineDash([h*.022,h*.016]);c.lineWidth=h*.007;c.strokeStyle='rgba(255,246,225,.55)';
    c.beginPath();c.arc(cx,cy,rr,0,7);c.stroke();c.restore();
    // мәре сызығы
    c.strokeStyle='rgba(255,246,225,.35)';c.lineWidth=h*.005;c.beginPath();c.moveTo(w*.3,h*.8);c.lineTo(w*.7,h*.8);c.stroke();
  }
  function asyq(c,px,py,r,rot,kind,face){
    c.save();c.translate(px,py);c.rotate(rot);
    c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(r*.15,r*.25,r*1.3,r*.95,0,0,7);c.fill();
    var base=kind=='saka2'?'#1f6f6a':kind=='saka'?'#7a2e1d':kind=='red'?'#c7432f':'#eadcc0',hi=kind=='saka2'?'#4fc3b5':kind=='saka'?'#c4573a':kind=='red'?'#ef7a5c':'#fff6e6',lo=kind=='saka2'?'#0b302d':kind=='saka'?'#3f150c':kind=='red'?'#7c2116':'#b49c76';
    var g=c.createRadialGradient(-r*.4,-r*.4,r*.1,0,0,r*1.4);g.addColorStop(0,hi);g.addColorStop(.6,base);g.addColorStop(1,lo);
    c.fillStyle=g;c.beginPath();
    c.moveTo(-r*1.25,0);c.bezierCurveTo(-r*1.25,-r*.9,-r*.55,-r*.95,-r*.25,-r*.62);c.quadraticCurveTo(0,-r*.48,r*.25,-r*.62);
    c.bezierCurveTo(r*.55,-r*.95,r*1.25,-r*.9,r*1.25,0);c.bezierCurveTo(r*1.25,r*.9,r*.55,r*.95,r*.25,r*.62);
    c.quadraticCurveTo(0,r*.48,-r*.25,r*.62);c.bezierCurveTo(-r*.55,r*.95,-r*1.25,r*.9,-r*1.25,0);c.fill();
    c.strokeStyle=lo;c.globalAlpha=.55;c.lineWidth=r*.12;c.beginPath();
    if(face==0||face==null){c.moveTo(-r*.5,0);c.quadraticCurveTo(0,-r*.25,r*.5,0)}
    else if(face==1){c.moveTo(-r*.6,-r*.1);c.lineTo(r*.6,r*.1)}
    else if(face==2){c.arc(0,0,r*.32,0,7)}
    else{c.moveTo(-r*.5,0);c.lineTo(r*.5,0);c.moveTo(0,-r*.3);c.lineTo(0,r*.3)}
    c.stroke();c.globalAlpha=1;
    if(kind=='saka'||kind=='saka2'){c.fillStyle='#ffcf6e';[-.6,0,.6].forEach(function(o){c.beginPath();c.arc(o*r,-r*.05,r*.11,0,7);c.fill()})}
    c.restore();
  }
  function dims(){W=P.W;H=P.H;C={x:W/2,y:H*.42};R=H*.27;ra=H*.026;rs=H*.034;paintGround(P.bake(bg),W,H,C.x,C.y,R)}
  function setup(){
    bodies=[];var sp=ra*2.75,red=Math.floor(Math.random()*N);
    for(var i=0;i<N;i++)bodies.push({x:C.x+(i-(N-1)/2)*sp,y:C.y+P.rnd(-1,1)*ra*.25,vx:0,vy:0,r:ra,m:1,rot:P.rnd(-.25,.25),w:0,kind:i==red?'red':'bone',face:null,won:false});
    saka={x:W/2,y:H*.88,vx:0,vy:0,r:rs,m:2.2,rot:0,w:0,kind:'saka',face:0};
    total=N;won=0;
  }
  function hud(){if(two)P.hud([['1-ойыншы · '+sh[0]+' ату',sc[0],pl==0],['Асық',won+' / '+total],['2-ойыншы · '+sh[1]+' ату',sc[1],pl==1]]);else P.hud([['Ұпай',sc[0],1],['Асық',won+' / '+total],['Ату',sh[0]]])}
  function resetSaka(){saka.x=W/2;saka.y=H*.88;saka.vx=saka.vy=0;saka.rot=0;saka.w=0}
  function menu(){state='menu';P.hud(null);
    P.panel({title:'Асық ату',text:'Курсормен бағыт таңдап OK басыңыз, сосын күш шкаласы толғанда тағы басыңыз. Кондан шыққан асық сіздікі: қалай түскеніне қарай ұпай береді. Ұтсаңыз, тағы атасыз.',
      legend:[['Алшы','4'],['Тәйке','3'],['Бүк','2'],['Шік','1'],['Қызыл асық','×2']],btns:[['Жалғыз',function(){begin(false)}],['Екі адам — жарыс',function(){begin(true)}]]})}
  function begin(t){P.panel(null);two=!!t;setup();sh=[SHOTS,two?SHOTS:0];sc=[0,0];pl=0;cleared=false;pops=[];state='aim';resetSaka();hud();if(two)P.toast('1-ойыншы атады',1200)}
  function end(){state='over';P.hud(null);var again=[['Жалғыз',function(){begin(false)}],['Екі адам — жарыс',function(){begin(true)}]];
    if(two){var w=sc[0]>sc[1]?0:sc[1]>sc[0]?1:-1;P.S.win();
      P.panel({sub:w<0?'Тең түсті!':(w+1)+'-ойыншы жеңді!',big:sc[0]+' : '+sc[1],text:'Қай ойыншы көп ұпай жинаса, сол жеңеді.',btns:again});return}
    var bonus=cleared?sh[0]*5:0;sc[0]+=bonus;var score=sc[0];
    var b=P.best('asyq'),nb=score>b;if(nb)P.best('asyq',score);if(nb||cleared)P.S.win();
    P.panel({sub:cleared?'Конды тазаладыңыз!':'Ойын аяқталды',big:score+' ұпай',text:(bonus?'Қалған ату үшін +'+bonus+'. ':'')+(nb?'Жаңа рекорд!':'Рекорд: '+b),btns:again})}
  function physics(dt){
    var all=bodies.concat([saka]),mu=H*.8;
    all.forEach(function(b){var sp=Math.hypot(b.vx,b.vy);if(sp>0){var ns=Math.max(0,sp-mu*dt);b.vx*=ns/sp;b.vy*=ns/sp}
      b.x+=b.vx*dt;b.y+=b.vy*dt;b.rot+=b.w*dt;b.w*=Math.pow(.2,dt);
      if(b.x<b.r){b.x=b.r;b.vx=Math.abs(b.vx)*.5}if(b.x>W-b.r){b.x=W-b.r;b.vx=-Math.abs(b.vx)*.5}
      if(b.y<b.r){b.y=b.r;b.vy=Math.abs(b.vy)*.5}if(b.y>H-b.r){b.y=H-b.r;b.vy=-Math.abs(b.vy)*.5}});
    for(var i=0;i<all.length;i++)for(var j=i+1;j<all.length;j++){var a=all[i],b=all[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),md=a.r+b.r;
      if(d>0&&d<md){var nx=dx/d,ny=dy/d,ov=(md-d)/2;a.x-=nx*ov;a.y-=ny*ov;b.x+=nx*ov;b.y+=ny*ov;
        var rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rv<0){var e=.86,jj=-(1+e)*rv/(1/a.m+1/b.m);
          a.vx-=jj*nx/a.m;a.vy-=jj*ny/a.m;b.vx+=jj*nx/b.m;b.vy+=jj*ny/b.m;
          var tx=-ny,tv=(b.vx-a.vx)*tx+(b.vy-a.vy)*nx;a.w-=tv/a.r*.4;b.w+=tv/b.r*.4;
          if(tickT<=0){P.S.tick(Math.min(1,-rv/(H*1.5)));tickT=.04}}}}
    bodies.forEach(function(b){if(!b.won&&Math.hypot(b.x-C.x,b.y-C.y)>R+b.r*.5){b.won=true;var f=Math.floor(Math.random()*4);b.face=f;
      var pts=FACES[f][1]*(b.kind=='red'?2:1);sc[pl]+=pts;won++;shotWon++;
      pops.push({x:b.x,y:b.y-H*.04,t:0,s:FACES[f][0]+' +'+pts,c:b.kind=='red'?'#ff8c6e':'#ffe3a0'});P.S.hit(pts>=6);P.vib([35],two?pl:null);hud()}});
  }
  function moving(){var m=false;bodies.concat([saka]).forEach(function(b){if(Math.hypot(b.vx,b.vy)>H*.01)m=true});return m}

  G.start=function(){x=P.ctx;dims();setup();menu()};
  G.resize=function(){dims()};
  G.onAction=function(mx,my,pid){
    if(two&&pid!=null&&P.padCount()==2&&pid!=pl&&(state=='aim'||state=='power')){P.toast((pl+1)+'-ойыншының кезегі',1000);return}
    if(state=='aim'){ang=Math.atan2(my-saka.y,mx-saka.x);if(my>saka.y-H*.02)ang=-Math.PI/2;state='power';powT=0;P.S.click()}
    else if(state=='power'){var sp=(.3+.95*pow)*H*2.3;saka.vx=Math.cos(ang)*sp;saka.vy=Math.sin(ang)*sp;saka.w=P.rnd(-6,6);
      state='roll';shotWon=0;P.S.dive()}
  };
  G.frame=function(dt){
    tickT-=dt;
    if(state=='power'){powT+=dt;pow=.5-.5*Math.cos(powT*Math.PI*2/1.15)}
    if(state=='roll'){for(var s=0;s<3;s++)physics(dt/3);
      if(!moving()){bodies=bodies.filter(function(b){return !b.won});
        if(bodies.length==0){cleared=true;end();return}
        resetSaka();
        if(shotWon>0){P.toast('Тағы ат!',1100)}
        else{sh[pl]--;P.S.miss();if(two&&sh[1-pl]>0){pl=1-pl;P.toast((pl+1)+'-ойыншы атады',1200)}}
        if(sh[pl]<=0){if(two&&sh[1-pl]>0){pl=1-pl;P.toast((pl+1)+'-ойыншы атады',1200)}else{hud();end();return}}
        hud();state='aim'}}
    x.drawImage(bg,0,0,W,H);
    if(state=='aim'||state=='power'){
      var pt=P.ptr(cpid()),a=state=='aim'?Math.atan2(pt.y-saka.y,pt.x-saka.x):ang;if(state=='aim'&&pt.y>saka.y-H*.02)a=-Math.PI/2;
      var L=H*(state=='power'?.18+.5*pow:.42);
      x.save();x.setLineDash([H*.012,H*.014]);x.lineWidth=H*.006;x.strokeStyle=state=='power'?'rgba(255,207,110,.95)':'rgba(255,246,225,.6)';
      x.beginPath();x.moveTo(saka.x,saka.y);x.lineTo(saka.x+Math.cos(a)*L,saka.y+Math.sin(a)*L);x.stroke();x.restore();
    }
    bodies.forEach(function(b){x.globalAlpha=b.won?.7:1;asyq(x,b.x,b.y,b.r,b.rot,b.kind,b.face);x.globalAlpha=1});
    asyq(x,saka.x,saka.y,saka.r,saka.rot,two&&pl==1?'saka2':'saka',0);
    if(state=='power'){var bx=saka.x+H*.09,by=saka.y-H*.13,bh=H*.2,bw=H*.03;
      x.fillStyle='rgba(20,12,24,.7)';x.fillRect(bx-4,by-4,bw+8,bh+8);
      var g=x.createLinearGradient(0,by+bh,0,by);g.addColorStop(0,'#3fb7a6');g.addColorStop(.6,'#ffcf6e');g.addColorStop(1,'#e2574c');
      x.fillStyle=g;x.fillRect(bx,by+bh*(1-pow),bw,bh*pow);
      x.fillStyle='#fff';x.font='800 '+(H*.03)+'px Manrope,Arial';x.textAlign='left';x.fillText('Күш',bx+bw+H*.015,by+H*.03)}
    for(var i=pops.length-1;i>=0;i--){var u=pops[i];u.t+=dt;if(u.t>1.4){pops.splice(i,1);continue}
      x.globalAlpha=Math.min(1,(1.4-u.t)*2);x.fillStyle=u.c;x.font='800 '+(H*.045)+'px Manrope,Arial';x.textAlign='center';
      x.strokeStyle='rgba(40,20,10,.6)';x.lineWidth=H*.008;x.strokeText(u.s,u.x,u.y-u.t*H*.06);x.fillText(u.s,u.x,u.y-u.t*H*.06)}
    x.globalAlpha=1;
    if(state=='aim'){x.fillStyle='rgba(255,246,225,.75)';x.font='700 '+(H*.032)+'px Manrope,Arial';x.textAlign='center';x.fillText((two?(pl+1)+'-ойыншы: ':'')+'бағытты таңдап OK басыңыз',W/2,H*.97)}
    if(state=='power'){x.fillStyle='rgba(255,246,225,.9)';x.font='800 '+(H*.032)+'px Manrope,Arial';x.textAlign='center';x.fillText('Күш толғанда OK!',W/2,H*.97)}
  };
  G.cover=function(c,w,h){
    var cx=w/2,cy=h*.42;paintGround(c,w,h,cx,cy,h*.33);var r=h*.06;
    for(var i=0;i<5;i++)asyq(c,cx+(i-2)*r*2.8,cy+(i%2)*r*.2,r,(i-2)*.2,i==3?'red':'bone',i%4);
    asyq(c,w*.62,h*.82,r*1.3,.4,'saka',0);
  };
  return G;
})());

/* Бүркітші — бүркітпен аң аулау */
P.register((function(){
  var G={id:'burkit',title:'Бүркітші',sub:'Бүркітпен аң аулау',hideCursor:true};
  var x,W,H,GY,rnd=P.rnd;
  var hills=[[],[]],stars=[],grass=[];
  (function(){for(var l=0;l<2;l++){var y=0;for(var i=0;i<=24;i++){y+=rnd(-1,1)*(l==0?.05:.025);y*=.85;hills[l].push(y)}}
    for(var i=0;i<70;i++)stars.push([Math.random(),Math.random()*.4]);
    for(i=0;i<90;i++)grass.push([Math.random(),Math.random()])})();
  var bg=document.createElement('canvas');

  function ridge(c,l,base,amp,col,w,h){c.fillStyle=col;c.beginPath();c.moveTo(0,h);var n=hills[l].length-1;
    for(var i=0;i<=n;i++)c.lineTo((i/n)*w*1.2,base+hills[l][i]*amp*h);c.lineTo(w,h);c.closePath();c.fill()}
  function paintWorld(c,w,h,gy){
    var g=c.createLinearGradient(0,0,0,gy);g.addColorStop(0,'#2a1c3d');g.addColorStop(.55,'#8a4a5c');g.addColorStop(1,'#f3a65c');
    c.fillStyle=g;c.fillRect(0,0,w,gy+2);
    c.fillStyle='rgba(255,255,255,.45)';stars.forEach(function(s){c.fillRect(s[0]*w,s[1]*h,2,2)});
    var sg=c.createRadialGradient(w*.72,gy-h*.02,0,w*.72,gy-h*.02,h*.22);
    sg.addColorStop(0,'rgba(255,214,140,.95)');sg.addColorStop(.25,'rgba(255,190,110,.55)');sg.addColorStop(1,'rgba(255,170,90,0)');
    c.fillStyle=sg;c.fillRect(0,0,w,gy+2);
    ridge(c,0,gy-h*.09,.9,'#5b3550',w,h);ridge(c,1,gy-h*.03,.6,'#7a4652',w,h);
    var gg=c.createLinearGradient(0,gy,0,h);gg.addColorStop(0,'#b8794a');gg.addColorStop(.35,'#8e6a3c');gg.addColorStop(1,'#4c4224');
    c.fillStyle=gg;c.fillRect(0,gy,w,h-gy);
    c.strokeStyle='rgba(60,45,20,.35)';c.lineWidth=2;
    grass.forEach(function(q){var py=gy+q[1]*(h-gy),sc=(.4+q[1])*h/720,px=q[0]*w;
      c.beginPath();c.moveTo(px,py);c.lineTo(px-3*sc,py-12*sc);c.moveTo(px+4*sc,py);c.lineTo(px+6*sc,py-15*sc);c.stroke()});
  }
  function dims(){W=P.W;H=P.H;GY=H*.52;bg.width=W;bg.height=H;paintWorld(bg.getContext('2d'),W,H,GY)}

  var KIND={
    hare:{pts:1,spd:[.16,.26],size:.032,col:'#d9c3a3',ear:1},
    fox:{pts:3,spd:[.11,.17],size:.042,col:'#d8742c',tail:1},
    gold:{pts:10,spd:[.24,.3],size:.04,col:'#ffd45a',tail:1,glow:1},
    wolf:{pts:0,spd:[.08,.12],size:.058,col:'#6d6a73',bad:1}
  };
  var prey=[],parts=[],pops=[],state='menu',timeLeft=60,spawnT=0,shake=0;
  
  function spawn(){var r=Math.random(),k=r<.5?'hare':r<.78?'fox':r<.86?'gold':'wolf',K=KIND[k],dir=Math.random()<.5?1:-1;
    prey.push({k:k,lane:Math.random(),dir:dir,x:dir>0?-.08:1.08,v:rnd(K.spd[0],K.spd[1]),ph:Math.random()*9,zig:k=='hare'?rnd(.6,1.4):0,stop:0})}
  function pY(p){return GY+H*.06+p.lane*(H-GY-H*.12)+(p.zig?Math.sin(p.ph*1.3)*H*.018*p.zig:0)}
  function pS(p){return (.65+p.lane*.6)*KIND[p.k].size*H}
  function drawPrey(c,p,px,py,s){
    var K=KIND[p.k],hop=Math.abs(Math.sin(p.ph*4))*s*.35;
    c.save();c.translate(px,py);c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(0,0,s*.9,s*.22,0,0,7);c.fill();
    c.translate(0,-hop);c.scale(p.dir,1);if(K.glow){c.shadowColor='#ffd45a';c.shadowBlur=s*.9}
    c.fillStyle=K.col;c.beginPath();c.ellipse(0,-s*.45,s*.75,s*.42,0,0,7);c.fill();
    c.beginPath();c.ellipse(s*.7,-s*.75,s*.3,s*.26,0,0,7);c.fill();
    if(K.ear){c.beginPath();c.ellipse(s*.62,-s*1.15,s*.08,s*.32,-.3,0,7);c.ellipse(s*.78,-s*1.12,s*.08,s*.3,.2,0,7);c.fill()}
    if(K.tail){c.beginPath();c.moveTo(-s*.65,-s*.55);c.quadraticCurveTo(-s*1.5,-s*.9,-s*1.55,-s*.3);c.quadraticCurveTo(-s*1.1,-s*.35,-s*.65,-s*.3);c.fill();
      c.fillStyle='#fff3e0';c.beginPath();c.arc(-s*1.5,-s*.4,s*.12,0,7);c.fill();c.fillStyle=K.col}
    if(p.k=='fox'||p.k=='gold'){c.beginPath();c.moveTo(s*.55,-s*.95);c.lineTo(s*.62,-s*1.25);c.lineTo(s*.75,-s*.98);c.moveTo(s*.78,-s*.98);c.lineTo(s*.9,-s*1.22);c.lineTo(s*.95,-s*.92);c.fill()}
    if(K.bad){c.beginPath();c.moveTo(s*.5,-s*.95);c.lineTo(s*.58,-s*1.3);c.lineTo(s*.72,-s*.98);c.moveTo(s*.76,-s*.98);c.lineTo(s*.88,-s*1.28);c.lineTo(s*.95,-s*.9);c.fill();
      c.beginPath();c.moveTo(-s*.7,-s*.6);c.lineTo(-s*1.3,-s*.25);c.lineTo(-s*.7,-s*.35);c.fill();
      c.fillStyle='#ffdd55';c.beginPath();c.arc(s*.85,-s*.8,s*.05,0,7);c.fill()}
    c.shadowBlur=0;var leg=Math.sin(p.ph*8)*s*.2;c.strokeStyle=K.col;c.lineWidth=s*.12;c.lineCap='round';
    c.beginPath();c.moveTo(s*.35,-s*.2);c.lineTo(s*.35+leg,0);c.moveTo(-s*.35,-s*.2);c.lineTo(-s*.35-leg,0);c.stroke();c.restore();
  }
  function drawEagle(c,px,py,s,t,sc,ang,flapOv,col){
    var flap=flapOv!=null?flapOv:Math.sin(t/120)*.5;
    c.save();c.translate(px,py);c.rotate(ang||0);c.scale(sc||1,sc||1);c.fillStyle=col||'#3a2416';
    for(var sd=-1;sd<=1;sd+=2){c.save();c.scale(sd,1);c.rotate(flap*.6);
      c.beginPath();c.moveTo(s*.15,-s*.1);c.quadraticCurveTo(s*.9,-s*.55,s*1.75,-s*.2);
      c.lineTo(s*1.55,-s*.05);c.lineTo(s*1.62,s*.05);c.lineTo(s*1.38,s*.08);c.lineTo(s*1.42,s*.18);c.lineTo(s*1.15,s*.16);
      c.quadraticCurveTo(s*.6,s*.2,s*.15,s*.2);c.fill();c.restore()}
    c.beginPath();c.ellipse(0,s*.05,s*.28,s*.5,0,0,7);c.fill();
    c.beginPath();c.moveTo(-s*.2,s*.45);c.lineTo(0,s*.85);c.lineTo(s*.2,s*.45);c.fill();
    c.fillStyle='#e9dcc6';c.beginPath();c.arc(0,-s*.42,s*.2,0,7);c.fill();
    c.fillStyle='#f2b33d';c.beginPath();c.moveTo(-s*.07,-s*.45);c.lineTo(0,-s*.25);c.lineTo(s*.07,-s*.45);c.fill();c.restore();
  }
  var E=[],two=false;
  function mkE(i){return {i:i,ex:W*(i?.7:.3),ey:H*.25,dive:null,hurt:0,score:0,combo:1,ax:0,ay:0,lock:null}}
  function assist(e){var pt=P.ptr(e.i);e.ax=pt.x;e.ay=pt.y;e.lock=null;if(pt.y<GY-H*.04)return;
    var R=H*.16,bd=R;prey.forEach(function(p){var d=Math.hypot(p.x*W-pt.x,pY(p)-pS(p)*.5-pt.y);if(d<bd){bd=d;e.lock=p}});
    if(e.lock){var k=1-bd/R*.6,L=e.lock;e.ax=pt.x+(L.x*W-pt.x)*k;e.ay=pt.y+(pY(L)-pS(L)*.5-pt.y)*k}}
  function drawAim(e){var r=H*.045,ok=e.ay>GY-H*.04,ax=e.ax,ay=e.ay,col=e.i?'#5fd4c4':'#ffcf6e';
    if(e.lock){x.fillStyle=e.i?'rgba(95,212,196,.18)':'rgba(255,207,110,.18)';x.beginPath();x.arc(ax,ay,r*1.25,0,7);x.fill()}
    x.strokeStyle=e.lock?col:ok?(e.i?'rgba(170,240,230,.95)':'rgba(255,230,180,.95)'):'rgba(255,255,255,.35)';x.lineWidth=3;
    x.beginPath();x.arc(ax,ay,r,0,7);x.stroke();
    x.beginPath();x.moveTo(ax-r*1.4,ay);x.lineTo(ax-r*.6,ay);x.moveTo(ax+r*.6,ay);x.lineTo(ax+r*1.4,ay);
    x.moveTo(ax,ay-r*1.4);x.lineTo(ax,ay-r*.6);x.moveTo(ax,ay+r*.6);x.lineTo(ax,ay+r*1.4);x.stroke();
    if(two){x.fillStyle=col;x.font='800 '+(H*.028)+'px Manrope,Arial';x.textAlign='center';x.fillText(e.i+1,ax,ay-r*1.6)}}
  function hud(){var t=['Уақыт',Math.ceil(Math.max(0,timeLeft))];
    if(two)P.hud([['1-ойыншы ×'+E[0].combo,E[0].score,1],t,['2-ойыншы ×'+E[1].combo,E[1].score]]);
    else P.hud([['Ұпай',E[0].score],['Қатарынан','×'+E[0].combo,1],t])}
  function pop(px,py,t,col){pops.push({x:px,y:py,t:0,s:t,c:col})}
  function burst(px,py,col){for(var i=0;i<14;i++)parts.push({x:px,y:py,vx:rnd(-1,1)*H*.4,vy:rnd(-1.2,-.2)*H*.4,t:0,c:col})}
  function strike(e,tx,ty){
    var r=H*.09,hit=null,bd=1e9,dv=e.dive;
    prey.forEach(function(p){var d=Math.hypot(p.x*W-tx,pY(p)-pS(p)*.5-ty);if(d<r+pS(p)*.6&&d<bd){bd=d;hit=p}});
    if(!hit&&dv.lock&&prey.indexOf(dv.lock)>=0){var L=dv.lock;if(Math.hypot(L.x*W-tx,pY(L)-ty)<H*.2)hit=L}
    if(!hit){e.combo=1;pop(tx,ty,'Құр қалды','rgba(255,255,255,.7)');P.S.miss();hud();return}
    prey.splice(prey.indexOf(hit),1);var K=KIND[hit.k],vp=two?e.i:null;
    if(K.bad){if(two){e.score=Math.max(0,e.score-5);pop(tx,ty,'Қасқыр! −5','#ff7a6b')}else{timeLeft-=5;pop(tx,ty,'Қасқыр! −5 сек','#ff7a6b')}
      e.combo=1;e.hurt=1.2;shake=.4;burst(tx,ty,'#9a96a0');P.S.wolf();P.vib([80,60,80],vp)}
    else{var g=K.pts*e.combo;e.score+=g;pop(tx,ty,(two?(e.i+1)+': ':'')+'+'+g+(e.combo>1?'  ×'+e.combo:''),hit.k=='gold'?'#ffe07a':e.i?'#bff3ea':'#fff');
      burst(tx,ty,K.col);e.combo=Math.min(e.combo+1,5);if(hit.k=='gold'&&!two)timeLeft+=3;P.S.hit(hit.k=='gold');P.vib([40],vp)}
    hud();
  }
  var BTNS=function(){return [['Жалғыз',function(){begin(false)}],['Екі адам — жарыс',function(){begin(true)}]]};
  function menu(){state='menu';P.hud(null);E=[mkE(0)];
    P.panel({title:'Бүркітші',text:'Курсорды аңға апарып OK басыңыз — бүркіт шүйіледі. Қатарынан ұстасаңыз, ұпай еселенеді. Екі адам: әркімнің өз бүркіті, 60 секундта кім көп ұстайды.',
      legend:[['Қоян','1'],['Түлкі','3'],['Алтын түлкі','10'],['Қасқыр','−5',1]],btns:BTNS()})}
  function begin(t){P.panel(null);two=!!t;E=two?[mkE(0),mkE(1)]:[mkE(0)];
    if(two&&!P.c2.shown){P.c2.x=W*.7;P.c2.y=H*.7;P.c2.shown=1}
    state='play';timeLeft=60;prey=[];parts=[];pops=[];spawnT=0;P.S.play();hud()}
  function end(){state='over';P.S.stop();P.hud(null);
    if(two){var a=E[0].score,b2=E[1].score;P.S.win();
      P.panel({sub:'Аң аулау аяқталды',big:a+' : '+b2,text:a==b2?'Тең түсті!':(a>b2?'1':'2')+'-ойыншы жеңді!',btns:BTNS()});return}
    var sc=E[0].score,b=P.best('burkit'),nb=sc>b;if(nb)P.best('burkit',sc);
    P.panel({sub:'Аң аулау аяқталды',big:sc+' ұпай',text:nb?'Жаңа рекорд!':'Рекорд: '+b,btns:BTNS()})}

  G.start=function(){x=P.ctx;dims();prey=[];menu()};
  G.resize=function(){dims()};
  G.stop=function(){P.S.stop()};
  G.onAction=function(mx,my,pid){if(state!='play')return;var e=E[two&&pid==1?1:0];if(!e)return;assist(e);if(e.dive||e.ay<GY-H*.04)return;
    e.dive={sx:e.ex,sy:e.ey,tx:e.ax,ty:Math.max(e.ay,GY),k:0,lock:e.lock};P.S.dive()};
  G.frame=function(dt,now){
    if(state=='play'){timeLeft-=dt;if(timeLeft<=0){end()}
      spawnT-=dt;if(spawnT<=0){spawn();if(two&&Math.random()<.5)spawn();spawnT=rnd(.45,1)*(timeLeft>20?1:.7)}
      if(Math.floor(timeLeft+dt)!=Math.floor(timeLeft))hud()}
    else if(prey.length<5&&Math.random()<dt*1.2)spawn();
    for(var i=prey.length-1;i>=0;i--){var p=prey[i];
      if(p.k=='fox'&&!p.stop&&Math.random()<dt*.25)p.stop=rnd(.4,1);
      if(p.stop>0)p.stop-=dt;else{p.x+=p.dir*p.v*dt;p.ph+=dt*3}
      if(p.x<-.15||p.x>1.15)prey.splice(i,1)}
    E.forEach(function(e){var pt=P.ptr(e.i),dv=e.dive;
      if(dv){dv.k+=dt/.3;var k=dv.k;
        if(k<.5){e.ex=dv.sx+(dv.tx-dv.sx)*(k*2);e.ey=dv.sy+(dv.ty-dv.sy)*(k*2)*(k*2)}
        else{var q=(k-.5)*2;e.ex=dv.tx+(pt.x-dv.tx)*q;e.ey=dv.ty+(Math.min(pt.y,GY-H*.08)-dv.ty)*q}
        if(!dv.done&&k>=.5){dv.done=1;strike(e,dv.tx,dv.ty)}
        if(k>=1)e.dive=null}
      else{var ty=Math.min(pt.y,GY-H*.08);e.ex+=(pt.x-e.ex)*Math.min(1,dt*12);e.ey+=(ty-e.ey)*Math.min(1,dt*12)}
      if(e.hurt>0)e.hurt-=dt});
    x.save();if(shake>0){shake-=dt;x.translate(rnd(-1,1)*12*shake,rnd(-1,1)*12*shake)}
    x.drawImage(bg,0,0);
    prey.sort(function(a,b){return a.lane-b.lane});
    prey.forEach(function(p){drawPrey(x,p,p.x*W,pY(p),pS(p))});
    for(i=parts.length-1;i>=0;i--){var o=parts[i];o.t+=dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.vy+=H*1.2*dt;
      if(o.t>.7){parts.splice(i,1);continue}x.globalAlpha=1-o.t/.7;x.fillStyle=o.c;x.fillRect(o.x,o.y,H*.008,H*.008)}
    x.globalAlpha=1;
    E.forEach(function(e){var dv=e.dive,sc=1,ang=0,fl=null;
      if(dv){var kk=dv.k,ee=kk<.5?kk*2:1-(kk-.5)*2;sc=1-ee*.35;fl=-.9*ee+Math.sin(now/120)*.5*(1-ee);ang=Math.atan2(dv.ty-dv.sy,dv.tx-dv.sx)*ee*.6}
      if(e.hurt>0)x.globalAlpha=.5+.5*Math.sin(now/40);
      drawEagle(x,e.ex,e.ey,H*.075,now+e.i*90,sc,ang,fl,e.i?'#1d4a4f':null);x.globalAlpha=1});
    for(i=pops.length-1;i>=0;i--){var u=pops[i];u.t+=dt;if(u.t>1.1){pops.splice(i,1);continue}
      x.globalAlpha=1-u.t/1.1;x.fillStyle=u.c;x.font='800 '+(H*.055)+'px Manrope,Arial';x.textAlign='center';x.fillText(u.s,u.x,u.y-u.t*H*.08)}
    x.globalAlpha=1;if(state=='play')E.forEach(function(e){assist(e);drawAim(e)});
    x.restore();
  };
  G.cover=function(c,w,h){
    var gy=h*.62;paintWorld(c,w,h,gy);
    var s=h*.09;[[.3,.82,'fox'],[.55,.9,'hare'],[.8,.78,'hare']].forEach(function(a){drawPrey(c,{k:a[2],dir:a[0]<.5?1:-1,ph:1},a[0]*w,a[1]*h,(a[2]=='fox'?.042:.032)*h*1.7)});
    drawEagle(c,w*.42,h*.3,h*.13,0,1,.15,.35);
  };
  return G;
})());

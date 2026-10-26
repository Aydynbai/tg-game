/* Ою-өрнек — домбыра үнімен өрнек ретін есте сақтау. Деңгей өскен сайын өрнектер орнын ауыстырады. */
P.register((function(){
  var G={id:'oyu',title:'Ою-өрнек',sub:'Әуен мен өрнек · есте сақтау',hideCursor:false};
  var COL=['#e2574c','#3f8fd2','#ffcf6e','#3fb7a6','#b46ad6','#f08a3c'];
  var NAMES=['Қошқар мүйіз','Түйе табан','Құс қанат','Жұлдыз','Өркеш','Қызғалдақ'];
  var x,W,H,cx,cy,RR,TR,slots=[0,1,2,3,4,5],pos=[],from=[],moveT=1,seq=[],idx=0,level=0,lives=3,state='menu',lit=-1,litT=0,timer=0,showI=0,shake=0,flashOk=0;
  var bg=document.createElement('canvas'),two=false,pl=0;

  function slotXY(s){var a=-Math.PI/2+s*Math.PI/3;return {x:cx+Math.cos(a)*RR,y:cy+Math.sin(a)*RR}}
  function dims(){W=P.W;H=P.H;cx=W/2;cy=H*.56;RR=H*.29;TR=H*.105;var c=P.bake(bg),g=c.createRadialGradient(cx,cy,0,cx,cy,W*.7);g.addColorStop(0,'#2a1f3a');g.addColorStop(1,'#120c18');
    c.fillStyle=g;c.fillRect(0,0,W,H);
    // кереге тор өрнегі
    c.strokeStyle='rgba(255,207,110,.05)';c.lineWidth=H*.004;var s=H*.08;
    for(var i=-20;i<40;i++){c.beginPath();c.moveTo(i*s,0);c.lineTo(i*s+H,H);c.moveTo(i*s+H,0);c.lineTo(i*s,H);c.stroke()}
    // шаңырақ ортада
    c.strokeStyle='rgba(255,207,110,.18)';c.lineWidth=H*.006;c.beginPath();c.arc(cx,cy,RR*.42,0,7);c.stroke();
    for(i=0;i<12;i++){var a=i*Math.PI/6;c.beginPath();c.moveTo(cx+Math.cos(a)*RR*.42,cy+Math.sin(a)*RR*.42);c.lineTo(cx+Math.cos(a)*(RR-TR*1.05),cy+Math.sin(a)*(RR-TR*1.05));c.stroke()}
    layout();
  }
  function layout(){for(var t=0;t<6;t++){pos[t]=slotXY(slots[t])}}
  function tilePos(t){if(moveT>=1)return pos[t];var e=moveT<.5?2*moveT*moveT:1-Math.pow(-2*moveT+2,2)/2;
    var a0=Math.atan2(from[t].y-cy,from[t].x-cx),a1=Math.atan2(pos[t].y-cy,pos[t].x-cx),d=a1-a0;
    while(d<-Math.PI)d+=Math.PI*2;while(d>Math.PI)d-=Math.PI*2;var a=a0+d*e,r=RR*(1-.18*Math.sin(e*Math.PI));
    return {x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r}}
  function shuffle(kind){from=pos.map(function(p){return {x:p.x,y:p.y}});
    if(kind=='rot'){var k=Math.random()<.5?1:5;slots=slots.map(function(s){return (s+k)%6})}
    else{var a=slots.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}slots=a}
    layout();moveT=0;P.S.chime()}
  function drawTile(c,t,px,py,r,on,dim){
    c.save();if(on){c.shadowColor=COL[t];c.shadowBlur=r*.9}
    c.fillStyle=on?COL[t]:'#221a2c';c.beginPath();c.arc(px,py,r*(on?1.08:1),0,7);c.fill();c.shadowBlur=0;
    c.lineWidth=r*.09;c.strokeStyle=COL[t];c.globalAlpha=dim?.35:1;c.beginPath();c.arc(px,py,r*(on?1.08:1)-r*.05,0,7);c.stroke();
    P.orn(c,t,px,py,r*1.15,on?'#fff8ec':COL[t],r*.12);c.restore()}
  function hud(){if(two){P.hud([['Деңгей',level,1],['Кезек',(pl+1)+'-ойыншы']]);return}var hs='';for(var i=0;i<3;i++)hs+=i<lives?'●':'○';P.hud([['Деңгей',level,1],['Өмір',hs],['Рекорд',P.best('oyu')]])}
  function menu(){state='menu';P.hud(null);
    P.panel({title:'Ою-өрнек',text:'Өрнектер домбыра үнімен кезек-кезек жанады. Сол ретпен басыңыз. Әр деңгейде тізбек ұзарады, 4-деңгейден бастап өрнектер айналады, 8-деңгейден кейін араласады. Өрнекті орнынан емес, түрінен танып басыңыз.',
      legend:NAMES.map(function(n){return [n,'']}),btns:[['Жалғыз',function(){begin(false)}],['Екі адам — кезекпен',function(){begin(true)}]]})}
  function begin(t){P.panel(null);two=!!t;pl=1;seq=[];level=0;lives=3;slots=[0,1,2,3,4,5];layout();moveT=1;next()}
  function next(){level++;seq.push(Math.floor(Math.random()*6));if(two){pl=1-pl;P.toast((pl+1)+'-ойыншының кезегі',1300)}hud();
    if(level>=8)shuffle('mix');else if(level>=4)shuffle('rot');
    state='wait';timer=moveT<1?1.3:.7;showI=0}
  function speed(){return Math.max(.26,.55-level*.025)}
  function fail(){if(two){state='over';P.S.lose();shake=.45;setTimeout(function(){P.hud(null);P.panel({sub:(pl+1)+'-ойыншы қателесті',big:(2-pl)+'-ойыншы жеңді!',text:'Деңгей: '+level,btns:[['Жалғыз',function(){begin(false)}],['Екі адам — кезекпен',function(){begin(true)}]]})},800);return}
    lives--;shake=.45;P.S.lose();P.vib([90,50,90]);hud();
    if(lives<=0){state='over';setTimeout(over,700)}else{state='wait';timer=1.2;showI=0;P.toast('Қайтадан тыңдаңыз',1100)}}
  function over(){P.hud(null);var sc=level-1,b=P.best('oyu'),nb=sc>b;if(nb)P.best('oyu',sc);if(nb)P.S.win();
    P.panel({sub:'Ойын аяқталды',big:sc+' деңгей',text:nb?'Жаңа рекорд!':'Рекорд: '+b,btns:[['Жалғыз',function(){begin(false)}],['Екі адам — кезекпен',function(){begin(true)}]]})}
  function hitTile(mx,my){for(var t=0;t<6;t++){var p=tilePos(t);if(Math.hypot(mx-p.x,my-p.y)<TR*1.15)return t}return -1}

  G.start=function(){x=P.ctx;dims();G._sig=null;menu()};
  G.resize=function(){dims();G._sig=null};
  G.onAction=function(mx,my,pid){
    if(state!='input')return;if(two&&pid!=null&&P.padCount()==2&&pid!=pl){P.toast((pl+1)+'-ойыншының кезегі',900);return}var t=hitTile(mx,my);if(t<0)return;
    lit=t;litT=.28;P.S.note(t,.5);
    if(t!==seq[idx]){fail();return}
    idx++;P.vib([20]);
    if(idx>=seq.length){state='done';flashOk=1;timer=.9;P.S.chime()}
  };
  G.frame=function(dt,now){
    if(moveT<1)moveT=Math.min(1,moveT+dt/.9);
    if(litT>0){litT-=dt;if(litT<=0)lit=-1}
    if(state=='wait'){timer-=dt;if(timer<=0){state='show';showI=0;timer=0}}
    if(state=='show'){timer-=dt;if(timer<=0){
      if(showI<seq.length){lit=seq[showI];litT=speed();P.S.note(seq[showI],speed()+.2);showI++;timer=speed()+.14}
      else{state='input';idx=0}}}
    if(state=='done'){timer-=dt;if(timer<=0)next()}
    if(flashOk>0)flashOk-=dt*1.5;
    var hp0=P.ptr(two&&P.padCount()==2?pl:0),busy=moveT<1||lit>=0||shake>0||flashOk>0,sig=[state,level,idx,lives,pl,hitTile(hp0.x,hp0.y),W].join('|');
    if(!busy&&sig==G._sig)return;G._sig=busy?null:sig;
    x.save();if(shake>0){shake-=dt;x.translate(P.rnd(-1,1)*14*shake,0)}
    x.drawImage(bg,0,0,W,H);
    var hp=P.ptr(two&&P.padCount()==2?pl:0),hov=state=='input'?hitTile(hp.x,hp.y):-1;
    for(var t=0;t<6;t++){var p=tilePos(t);drawTile(x,t,p.x,p.y,TR*(hov==t?1.06:1),lit==t,state=='show'&&lit!=t)}
    // ортадағы мәтін
    x.textAlign='center';
    if(flashOk>0){x.globalAlpha=Math.max(0,flashOk);x.fillStyle='#9be8ad';x.beginPath();x.arc(cx,cy,RR*.4,0,7);x.fill();x.globalAlpha=1}
    x.fillStyle='#ffcf6e';x.font='800 '+(H*.11)+'px Manrope,Arial';x.fillText(state=='menu'?'':level,cx,cy+H*.02);
    x.fillStyle='rgba(255,247,234,.8)';x.font='700 '+(H*.03)+'px Manrope,Arial';
    var msg=state=='show'||state=='wait'?(two?(pl+1)+'-ойыншы, тыңдаңыз…':'Тыңдаңыз…'):state=='input'?(two?(pl+1)+'-ойыншы':'Сіздің кезегіңіз')+' · '+idx+'/'+seq.length:state=='done'?'Жарайсыз!':'';
    x.fillText(msg,cx,cy+H*.075);
    x.restore();
  };
  G.cover=function(c,w,h){var g=c.createRadialGradient(w/2,h*.45,0,w/2,h*.45,w*.6);g.addColorStop(0,'#2e2240');g.addColorStop(1,'#140e1a');
    c.fillStyle=g;c.fillRect(0,0,w,h);var r=h*.13,R2=h*.26;
    for(var t=0;t<6;t++){var a=-Math.PI/2+t*Math.PI/3;drawTile(c,t,w/2+Math.cos(a)*R2*1.35,h*.42+Math.sin(a)*R2,r,t==2,false)}};
  return G;
})());

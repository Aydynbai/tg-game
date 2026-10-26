/* Шахмат — компьютерге қарсы немесе екі адам */
P.register((function(){
  var G={id:'chess',title:'Шахмат',sub:'Компьютер · екі адам',hideCursor:false};
  var x,W,H,S,BX,BY,st,sel=-1,targets=[],last=null,state='menu',vsAI=true,anim=null,aiT=0,hist=[],plies=0,result=null,capW=[],capB=[];
  var bg=document.createElement('canvas');
  var VAL={p:100,n:320,b:330,r:500,q:900,k:0};
  var KN=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],KG=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
      DG=[[-1,-1],[-1,1],[1,-1],[1,1]],OR=[[-1,0],[1,0],[0,-1],[0,1]];

  /* ---- қозғалтқыш ---- */
  function init(){var r='rnbqkbnrpppppppp'+'................................'+'PPPPPPPPRNBQKBNR';return {b:r.split(''),t:'w',cs:{K:1,Q:1,k:1,q:1},ep:-1}}
  function colr(p){return p=='.'?null:(p<'a'?'w':'b')}
  function ins(r,c){return r>=0&&r<8&&c>=0&&c<8}
  function attacked(b,sq,by){var r=sq>>3,c=sq&7,i,rr,cc,p;
    var pr=by=='w'?r+1:r-1,pp=by=='w'?'P':'p';for(i=-1;i<=1;i+=2)if(ins(pr,c+i)&&b[pr*8+c+i]==pp)return true;
    var n=by=='w'?'N':'n',k=by=='w'?'K':'k';
    for(i=0;i<8;i++){rr=r+KN[i][0];cc=c+KN[i][1];if(ins(rr,cc)&&b[rr*8+cc]==n)return true;rr=r+KG[i][0];cc=c+KG[i][1];if(ins(rr,cc)&&b[rr*8+cc]==k)return true}
    var bq=by=='w'?'BQ':'bq',rq=by=='w'?'RQ':'rq';
    function ray(D,set){for(var j=0;j<4;j++){rr=r+D[j][0];cc=c+D[j][1];while(ins(rr,cc)){p=b[rr*8+cc];if(p!='.'){if(set.indexOf(p)>=0)return true;break}rr+=D[j][0];cc+=D[j][1]}}return false}
    return ray(DG,bq)||ray(OR,rq);
  }
  function kingSq(b,c){var k=c=='w'?'K':'k';return b.indexOf(k)}
  function inCheck(s){return attacked(s.b,kingSq(s.b,s.t),s.t=='w'?'b':'w')}
  function pseudo(s){var b=s.b,me=s.t,op=me=='w'?'b':'w',ms=[],i,j;
    for(var f=0;f<64;f++){var p=b[f];if(colr(p)!==me)continue;var r=f>>3,c=f&7,t=p.toLowerCase();
      if(t=='p'){var d=me=='w'?-1:1,start=me=='w'?6:1,pro=me=='w'?0:7,to=f+d*8;
        if(ins(r+d,c)&&b[to]=='.'){ms.push({f:f,t:to,pr:(r+d==pro)});if(r==start&&b[to+d*8]=='.')ms.push({f:f,t:to+d*8,dbl:1})}
        for(i=-1;i<=1;i+=2)if(ins(r+d,c+i)){var tt=(r+d)*8+c+i;if(colr(b[tt])===op)ms.push({f:f,t:tt,pr:(r+d==pro)});else if(tt==s.ep)ms.push({f:f,t:tt,e:1})}}
      else if(t=='n'||t=='k'){var L=t=='n'?KN:KG;for(i=0;i<8;i++){var rr=r+L[i][0],cc=c+L[i][1];if(ins(rr,cc)&&colr(b[rr*8+cc])!==me)ms.push({f:f,t:rr*8+cc})}
        if(t=='k'){var row=me=='w'?56:0,cK=me=='w'?'K':'k',cQ=me=='w'?'Q':'q',R=me=='w'?'R':'r';
          if(f==row+4&&!attacked(b,f,op)){
            if(s.cs[cK]&&b[row+5]=='.'&&b[row+6]=='.'&&b[row+7]==R&&!attacked(b,row+5,op)&&!attacked(b,row+6,op))ms.push({f:f,t:row+6,cs:'K'});
            if(s.cs[cQ]&&b[row+3]=='.'&&b[row+2]=='.'&&b[row+1]=='.'&&b[row]==R&&!attacked(b,row+3,op)&&!attacked(b,row+2,op))ms.push({f:f,t:row+2,cs:'Q'})}}}
      else{var D=t=='b'?DG:t=='r'?OR:DG.concat(OR);for(i=0;i<D.length;i++){var r2=r+D[i][0],c2=c+D[i][1];
        while(ins(r2,c2)){var q=b[r2*8+c2];if(q=='.')ms.push({f:f,t:r2*8+c2});else{if(colr(q)===op)ms.push({f:f,t:r2*8+c2});break}r2+=D[i][0];c2+=D[i][1]}}}}
    return ms}
  function make(s,m){var b=s.b.slice(),p=b[m.f],me=s.t,cs={K:s.cs.K,Q:s.cs.Q,k:s.cs.k,q:s.cs.q},cap=b[m.t];
    b[m.t]=p;b[m.f]='.';
    if(m.e){var cp=(m.f&~7)+(m.t&7);cap=b[cp];b[cp]='.'}
    if(m.pr)b[m.t]=me=='w'?'Q':'q';
    if(m.cs){var row=me=='w'?56:0;if(m.cs=='K'){b[row+5]=b[row+7];b[row+7]='.'}else{b[row+3]=b[row];b[row]='.'}}
    if(p=='K'){cs.K=cs.Q=0}if(p=='k'){cs.k=cs.q=0}
    [[63,'K'],[56,'Q'],[7,'k'],[0,'q']].forEach(function(a){if(m.f==a[0]||m.t==a[0])cs[a[1]]=0});
    return {b:b,t:me=='w'?'b':'w',cs:cs,ep:m.dbl?(m.f+m.t)/2:-1,cap:cap}}
  function legal(s){var out=[];pseudo(s).forEach(function(m){var n=make(s,m);if(!attacked(n.b,kingSq(n.b,s.t),n.t))out.push(m)});return out}
  function evalW(b){var v=0;for(var i=0;i<64;i++){var p=b[i];if(p=='.')continue;var t=p.toLowerCase(),w=p<'a',r=i>>3,c=i&7,x0=VAL[t];
      var cen=3.5-Math.max(Math.abs(3.5-r),Math.abs(3.5-c));
      if(t=='p')x0+=(w?6-r:r-1)*8+(c>1&&c<6?4:0);else if(t=='n'||t=='b')x0+=cen*9;else if(t=='q')x0+=cen*3;else if(t=='k')x0+=(r==(w?7:0)?10:-10);
      v+=w?x0:-x0}return v}
  var deadline=0,nodes=0;
  function order(s,ms){ms.forEach(function(m){var c=s.b[m.t];m.o=(c!='.'?VAL[c.toLowerCase()]*10-VAL[s.b[m.f].toLowerCase()]:0)+(m.pr?800:0)});ms.sort(function(a,b){return b.o-a.o})}
  function nega(s,d,a,b,ply){
    if((++nodes&63)==0&&Date.now()>deadline)throw 'time';
    var ms=legal(s);if(!ms.length)return inCheck(s)?-100000+ply:0;
    if(d==0){var e=evalW(s.b);return s.t=='w'?e:-e}
    order(s,ms);for(var i=0;i<ms.length;i++){var v=-nega(make(s,ms[i]),d-1,-b,-a,ply+1);if(v>a)a=v;if(a>=b)break}return a}
  function think(){var ms=legal(st),best=ms[0];order(st,ms);deadline=Date.now()+800;nodes=0;
    try{for(var d=1;d<=4;d++){var bv=-1e9,bm=best;for(var i=0;i<ms.length;i++){var v=-nega(make(st,ms[i]),d-1,-1e9,-bv,1)+Math.random()*3;if(v>bv){bv=v;bm=ms[i]}}best=bm;
      ms.splice(ms.indexOf(best),1);ms.unshift(best)}}catch(e){}
    return best}

  /* ---- сурет ---- */
  function dims(){W=P.W;H=P.H;S=Math.floor(Math.min(H*.105,W*.065));BX=Math.round(W*.37-4*S);BY=Math.round(H*.53-4*S);
    var c=P.bake(bg);paintBg(c,W,H);paintBoard(c,BX,BY,S)}
  function paintBg(c,w,h){var g=c.createRadialGradient(w*.4,h*.5,0,w*.4,h*.5,w*.8);g.addColorStop(0,'#2b1f2a');g.addColorStop(1,'#0f0a10');c.fillStyle=g;c.fillRect(0,0,w,h);
    var s=h*.14,row=0;for(var y=0;y<h+s;y+=s,row++)for(var xx=(row%2)*s/2;xx<w+s;xx+=s)P.orn(c,3,xx,y,s*.5,'rgba(255,207,110,.03)',s*.03)}
  function paintBoard(c,bx,by,s){var m=s*.45;
    c.save();c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=s*.6;c.shadowOffsetY=s*.15;c.fillStyle='#5a3418';c.fillRect(bx-m,by-m,8*s+2*m,8*s+2*m);c.restore();
    c.strokeStyle='#ffcf6e';c.globalAlpha=.6;c.lineWidth=s*.04;c.strokeRect(bx-m*.55,by-m*.55,8*s+m*1.1,8*s+m*1.1);c.globalAlpha=1;
    [[bx-m*.5,by-m*.5],[bx+8*s+m*.5,by-m*.5],[bx-m*.5,by+8*s+m*.5],[bx+8*s+m*.5,by+8*s+m*.5]].forEach(function(p){P.orn(c,0,p[0],p[1],m*.8,'#ffcf6e',m*.1)});
    for(var r=0;r<8;r++)for(var cc=0;cc<8;cc++){c.fillStyle=(r+cc)%2?'#9a6239':'#ecd6ad';c.fillRect(bx+cc*s,by+r*s,s,s)}
    c.fillStyle='rgba(255,236,200,.65)';c.font='700 '+(s*.22)+'px Manrope,Arial';c.textAlign='center';
    for(var i=0;i<8;i++){c.fillText('abcdefgh'[i],bx+i*s+s/2,by+8*s+m*.62);c.fillText(8-i,bx-m*.55,by+i*s+s/2+s*.08)}}
  function piece(c,p,cx,cy,s){var w=p<'a',t=p.toLowerCase();
    c.save();c.translate(cx,cy);c.fillStyle=w?'#fbf1dc':'#2c1f26';c.strokeStyle=w?'#3a2416':'#e8c98a';c.lineWidth=s*.035;c.lineJoin='round';
    function path(fn){c.beginPath();fn();c.fill();c.stroke()}
    function base(){path(function(){c.moveTo(-s*.3,s*.36);c.lineTo(s*.3,s*.36);c.lineTo(s*.26,s*.27);c.lineTo(-s*.26,s*.27);c.closePath()})}
    function body(top,wt){path(function(){c.moveTo(-s*.24,s*.27);c.quadraticCurveTo(-s*wt*.6,s*.05,-s*wt,top);c.lineTo(s*wt,top);c.quadraticCurveTo(s*wt*.6,s*.05,s*.24,s*.27);c.closePath()})}
    if(t=='p'){body(-s*.02,.1);path(function(){c.arc(0,-s*.13,s*.13,0,7)})}
    else if(t=='r'){path(function(){c.rect(-s*.17,-s*.16,s*.34,s*.43)});path(function(){c.moveTo(-s*.24,-s*.16);c.lineTo(-s*.24,-s*.33);c.lineTo(-s*.13,-s*.33);c.lineTo(-s*.13,-s*.26);c.lineTo(-s*.05,-s*.26);c.lineTo(-s*.05,-s*.33);
      c.lineTo(s*.05,-s*.33);c.lineTo(s*.05,-s*.26);c.lineTo(s*.13,-s*.26);c.lineTo(s*.13,-s*.33);c.lineTo(s*.24,-s*.33);c.lineTo(s*.24,-s*.16);c.closePath()})}
    else if(t=='b'){body(-s*.02,.08);path(function(){c.ellipse(0,-s*.14,s*.13,s*.19,0,0,7)});path(function(){c.arc(0,-s*.36,s*.045,0,7)});
      c.beginPath();c.moveTo(-s*.03,-s*.2);c.lineTo(s*.07,-s*.1);c.stroke()}
    else if(t=='n'){path(function(){c.moveTo(-s*.22,s*.27);c.lineTo(-s*.16,s*.02);c.lineTo(-s*.04,-s*.16);c.lineTo(-s*.08,-s*.34);c.lineTo(s*.04,-s*.27);
      c.lineTo(s*.2,-s*.14);c.lineTo(s*.26,s*.02);c.lineTo(s*.14,s*.05);c.lineTo(s*.04,-s*.02);c.lineTo(s*.16,s*.27);c.closePath()});
      c.fillStyle=w?'#3a2416':'#e8c98a';c.beginPath();c.arc(s*.07,-s*.16,s*.03,0,7);c.fill()}
    else if(t=='q'){body(-s*.12,.14);path(function(){c.moveTo(-s*.2,-s*.1);c.lineTo(-s*.26,-s*.3);c.lineTo(-s*.12,-s*.18);c.lineTo(0,-s*.36);c.lineTo(s*.12,-s*.18);c.lineTo(s*.26,-s*.3);c.lineTo(s*.2,-s*.1);c.closePath()});
      [-.26,0,.26].forEach(function(o){path(function(){c.arc(o*s,o?-s*.31:-s*.37,s*.04,0,7)})})}
    else if(t=='k'){body(-s*.12,.15);path(function(){c.rect(-s*.17,-s*.22,s*.34,s*.1)});
      c.lineWidth=s*.07;c.strokeStyle=w?'#3a2416':'#e8c98a';c.beginPath();c.moveTo(0,-s*.23);c.lineTo(0,-s*.43);c.moveTo(-s*.08,-s*.35);c.lineTo(s*.08,-s*.35);c.stroke()}
    if(t!='r')base();else{path(function(){c.rect(-s*.26,s*.27,s*.52,s*.09)})}
    c.restore()}

  /* ---- ойын барысы ---- */
  function sqAt(mx,my){var c=Math.floor((mx-BX)/S),r=Math.floor((my-BY)/S);return ins(r,c)?r*8+c:-1}
  function sqXY(i){return {x:BX+(i&7)*S+S/2,y:BY+(i>>3)*S+S/2}}
  function menu(){state='menu';P.panel({title:'Шахмат',text:'Фигураны таңдап OK басыңыз, сосын баратын торды таңдаңыз. Екі адам ойнаса: бірінші телефон — ақтар, екіншісі — қаралар.',
      btns:[['Компьютерге қарсы',function(){begin(true)}],['Екі адам',function(){begin(false)}]]})}
  function begin(ai){P.panel(null);vsAI=ai;st=init();sel=-1;targets=[];last=null;anim=null;plies=0;capW=[];capB=[];result=null;state='play'}
  function turnPid(){return st.t=='w'?0:1}
  function human(pid,quiet){if(!(state=='play'&&!anim&&(!vsAI||st.t=='w')))return false;
    if(!vsAI&&pid!=null&&P.padCount()==2&&pid!=turnPid()){if(!quiet)P.toast((turnPid()+1)+'-ойыншының кезегі',1000);return false}return true}
  function doMove(m){var p=st.b[m.f],n=make(st,m);if(n.cap&&n.cap!='.'){(colr(n.cap)=='w'?capW:capB).push(n.cap);P.S.hit(VAL[n.cap.toLowerCase()]>=500)}else P.S.tick(.6);
    anim={p:p,f:m.f,t:m.t,k:0,next:n,m:m};sel=-1;targets=[]}
  function after(){st=anim.next;last={f:anim.f,t:anim.t};anim=null;plies++;
    var ms=legal(st);if(!ms.length){var mate=inCheck(st);result=mate?(st.t=='w'?'b':'w'):'d';return finish()}
    if(plies>=300)return(result='d',finish());
    if(inCheck(st)){P.toast('Шах!',1000);P.S.chime()}
    if(vsAI&&st.t=='b'){state='ai';aiT=.35}}
  function finish(){state='over';var t=result=='d'?'Тең ойын':vsAI?(result=='w'?'Мат! Сіз жеңдіңіз':'Мат. Компьютер жеңді'):(result=='w'?'Мат! Ақтар жеңді':'Мат! Қаралар жеңді');
    if(vsAI&&result=='w'){P.best('chess',P.best('chess')+1);P.S.win()}else if(result!='d')P.S.lose();
    setTimeout(function(){P.panel({sub:'Ойын аяқталды',big:t,text:vsAI?'Компьютерді жеңген саны: '+P.best('chess'):'',
      btns:[['Компьютерге қарсы',function(){begin(true)}],['Екі адам',function(){begin(false)}]]})},900)}

  G._dbg=function(){return {turn:st.t,state:state,anim:!!anim,sel:sel,opts:targets.length,b:st.b.join('')}};
  G.start=function(){x=P.ctx;dims();st=init();menu()};
  G.resize=function(){dims()};
  G.onKey=function(k,pid){if(k<37||k>40)return false;var d={37:[-1,0],38:[0,-1],39:[1,0],40:[0,1]}[k];var pt=P.ptr(pid);var nx=Math.max(BX+S/2,Math.min(BX+7.5*S,pt.x+d[0]*S)),ny=Math.max(BY+S/2,Math.min(BY+7.5*S,pt.y+d[1]*S));if(pid==1){P.c2.x=nx;P.c2.y=ny;P.c2.shown=1}else{P.mx=nx;P.my=ny}return true};
  G.onAction=function(mx,my,pid){if(!human(pid))return;var q=sqAt(mx,my);if(q<0)return;
    for(var i=0;i<targets.length;i++)if(targets[i].t==q){doMove(targets[i]);return}
    if(colr(st.b[q])===st.t){sel=q;targets=legal(st).filter(function(m){return m.f==q});P.S.click()}else{sel=-1;targets=[]}};
  G.frame=function(dt){
    if(anim){anim.k+=dt/.2;if(anim.k>=1)after()}
    if(state=='ai'){aiT-=dt;if(aiT<=0){state='think';setTimeout(function(){var m=think();state='play';if(m)doMove(m)},30)}}
    x.drawImage(bg,0,0,W,H);
    if(last){[last.f,last.t].forEach(function(i){x.fillStyle='rgba(255,207,110,.32)';x.fillRect(BX+(i&7)*S,BY+(i>>3)*S,S,S)})}
    if(st&&state!='menu'&&inCheck(st)&&!anim){var kq=kingSq(st.b,st.t),kp=sqXY(kq);var g=x.createRadialGradient(kp.x,kp.y,0,kp.x,kp.y,S*.6);g.addColorStop(0,'rgba(255,60,40,.85)');g.addColorStop(1,'rgba(255,60,40,0)');x.fillStyle=g;x.fillRect(kp.x-S/2,kp.y-S/2,S,S)}
    var hp=P.ptr(!vsAI&&P.padCount()==2?turnPid():0),hv=human(null,1)?sqAt(hp.x,hp.y):-1;
    if(hv>=0){x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=S*.05;x.strokeRect(BX+(hv&7)*S+S*.03,BY+(hv>>3)*S+S*.03,S*.94,S*.94)}
    if(sel>=0){x.strokeStyle='#ffcf6e';x.lineWidth=S*.07;x.strokeRect(BX+(sel&7)*S+S*.04,BY+(sel>>3)*S+S*.04,S*.92,S*.92)}
    targets.forEach(function(m){var p=sqXY(m.t);x.fillStyle=st.b[m.t]!='.'?'rgba(226,87,76,.75)':'rgba(40,120,90,.7)';x.beginPath();x.arc(p.x,p.y,st.b[m.t]!='.'?S*.42:S*.14,0,7);
      if(st.b[m.t]!='.'){x.lineWidth=S*.07;x.strokeStyle=x.fillStyle;x.stroke()}else x.fill()});
    if(st)for(var i=0;i<64;i++){var p=st.b[i];if(p=='.'||(anim&&(i==anim.f)))continue;var q=sqXY(i);piece(x,p,q.x,q.y+S*.02,S)}
    if(anim){var a=sqXY(anim.f),b=sqXY(anim.t),e=anim.k<.5?2*anim.k*anim.k:1-Math.pow(-2*anim.k+2,2)/2;
      x.fillStyle=(((anim.t>>3)+(anim.t&7))%2)?'#9a6239':'#ecd6ad';x.fillRect(BX+(anim.t&7)*S,BY+(anim.t>>3)*S,S,S);
      piece(x,anim.p,a.x+(b.x-a.x)*e,a.y+(b.y-a.y)*e+S*.02,S*1.06)}
    // бүйір панель
    var px=BX+8*S+S*.9,py=BY+S*.2;x.textAlign='left';
    if(st&&state!='menu'){x.fillStyle='#ffcf6e';x.font='800 '+(S*.42)+'px Manrope,Arial';
      x.fillText(state=='think'||state=='ai'?'Компьютер ойланып жатыр…':st.t=='w'?(vsAI?'Сіздің жүрісіңіз':'Ақтардың жүрісі'):(vsAI?'Компьютер':'Қаралардың жүрісі'),px,py+S*.4);
      x.fillStyle='rgba(255,247,234,.7)';x.font='700 '+(S*.26)+'px Manrope,Arial';x.fillText(vsAI?'Сіз — ақтар':(P.padCount()==2?'1 — ақтар · 2 — қаралар':'Екі адам · бір пульт'),px,py+S*.85);
      x.fillText('Алынған:',px,py+S*1.6);
      capB.forEach(function(p,i){piece(x,p,px+S*.25+(i%8)*S*.42,py+S*2.15+Math.floor(i/8)*S*.5,S*.55)});
      capW.forEach(function(p,i){piece(x,p,px+S*.25+(i%8)*S*.42,py+S*3.35+Math.floor(i/8)*S*.5,S*.55)})}
  };
  G.cover=function(c,w,h){paintBg(c,w,h);var s=h*.15,bx=w/2-4*s,by=h*.42-2*s;c.save();c.beginPath();c.rect(0,0,w,h);c.clip();
    for(var r=0;r<5;r++)for(var cc=0;cc<8;cc++){c.fillStyle=(r+cc)%2?'#9a6239':'#ecd6ad';c.fillRect(bx+cc*s,by+r*s,s,s)}
    piece(c,'K',bx+4.5*s,by+3.5*s,s*1.3);piece(c,'q',bx+3.5*s,by+1.5*s,s*1.3);piece(c,'N',bx+2.5*s,by+3.5*s,s*1.2);piece(c,'r',bx+5.5*s,by+1.5*s,s*1.2);piece(c,'P',bx+6.5*s,by+3.5*s,s*1.1);c.restore()};
  return G;
})());

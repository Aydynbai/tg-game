/* Дойбы — орыс ережесімен (алу міндетті, дамка ұшады), компьютерге қарсы немесе екі адам */
P.register((function(){
  var G={id:'doiby',title:'Дойбы',sub:'Шашка · дамка ұшады',hideCursor:false};
  var x,W,H,S,BX,BY,b,turn='w',sel=-1,opts=[],all=[],last=null,state='menu',vsAI=true,anim=null,aiT=0,quiet=0;
  var bg=document.createElement('canvas');
  function ins(r,c){return r>=0&&r<8&&c>=0&&c<8}
  function side(p){return p=='w'||p=='W'?'w':p=='b'||p=='B'?'b':null}
  function king(p){return p=='W'||p=='B'}
  function init(){var a=[];for(var i=0;i<64;i++){var r=i>>3,c=i&7;a.push((r+c)%2==1?(r<3?'b':r>4?'w':'.'):'.')}return a}
  var DIR=[[-1,-1],[-1,1],[1,-1],[1,1]];

  /* жүрістер: {f,t,path:[...],caps:[...],kg} */
  function caps(bd,f,p,me){var res=[];
    function dfs(pos,isK,taken,path){var r=pos>>3,c=pos&7,found=false;
      for(var d=0;d<4;d++){var dr=DIR[d][0],dc=DIR[d][1];
        if(!isK){var mr=r+dr,mc=c+dc,lr=r+2*dr,lc=c+2*dc;if(!ins(lr,lc))continue;var m=mr*8+mc,l=lr*8+lc;
          if(side(bd[m])&&side(bd[m])!=me&&taken.indexOf(m)<0&&(bd[l]=='.'||l==f)){found=true;
            var prom=(me=='w'&&lr==0)||(me=='b'&&lr==7);dfs(l,prom,taken.concat([m]),path.concat([l]))}}
        else{var rr=r+dr,cc=c+dc,enemy=-1;
          while(ins(rr,cc)){var q=rr*8+cc;if(bd[q]=='.'||q==f){if(enemy>=0)break;rr+=dr;cc+=dc;continue}
            if(side(bd[q])==me||taken.indexOf(q)>=0)break;enemy=q;rr+=dr;cc+=dc;break}
          if(enemy<0)continue;var lands=[];
          while(ins(rr,cc)&&(bd[rr*8+cc]=='.'||rr*8+cc==f)){lands.push(rr*8+cc);rr+=dr;cc+=dc}
          if(!lands.length)continue;found=true;
          var cont=lands.filter(function(l){return canCap(bd,f,l,me,taken.concat([enemy]))});
          (cont.length?cont:lands).forEach(function(l){dfs(l,true,taken.concat([enemy]),path.concat([l]))})}}
      if(!found&&taken.length)res.push({f:f,t:pos,path:path,caps:taken,kg:isK})}
    dfs(f,king(p),[],[]);return res}
  function canCap(bd,f,pos,me,taken){var r=pos>>3,c=pos&7;
    for(var d=0;d<4;d++){var dr=DIR[d][0],dc=DIR[d][1],rr=r+dr,cc=c+dc;
      while(ins(rr,cc)){var q=rr*8+cc;if(bd[q]=='.'||q==f){rr+=dr;cc+=dc;continue}
        if(side(bd[q])==me||taken.indexOf(q)>=0)break;var lr=rr+dr,lc=cc+dc;if(ins(lr,lc)&&(bd[lr*8+lc]=='.'||lr*8+lc==f))return true;break}}
    return false}
  function moves(bd,me){var cs=[],ss=[];
    for(var f=0;f<64;f++){var p=bd[f];if(side(p)!=me)continue;cs=cs.concat(caps(bd,f,p,me))}
    if(cs.length)return cs;
    for(f=0;f<64;f++){p=bd[f];if(side(p)!=me)continue;var r=f>>3,c=f&7;
      for(var d=0;d<4;d++){var dr=DIR[d][0],dc=DIR[d][1];
        if(!king(p)){if((me=='w'&&dr>0)||(me=='b'&&dr<0))continue;var rr=r+dr,cc=c+dc;if(ins(rr,cc)&&bd[rr*8+cc]=='.')ss.push({f:f,t:rr*8+cc,path:[rr*8+cc],caps:[],kg:(me=='w'&&rr==0)||(me=='b'&&rr==7)})}
        else{rr=r+dr;cc=c+dc;while(ins(rr,cc)&&bd[rr*8+cc]=='.'){ss.push({f:f,t:rr*8+cc,path:[rr*8+cc],caps:[],kg:true});rr+=dr;cc+=dc}}}}
    return ss}
  function apply(bd,m){var n=bd.slice(),p=n[m.f];n[m.f]='.';m.caps.forEach(function(q){n[q]='.'});n[m.t]=m.kg?p.toUpperCase():p;return n}
  function evalB(bd){var v=0;for(var i=0;i<64;i++){var p=bd[i];if(p=='.')continue;var r=i>>3,c=i&7,x0=king(p)?320:100;
      if(!king(p))x0+=(p=='w'?7-r:r)*5;if(c>1&&c<6&&r>1&&r<6)x0+=6;if(side(p)=='w')v+=x0;else v-=x0}return v}
  var deadline=0,nodes=0;
  function nega(bd,me,d,a,bt){if((++nodes&255)==0&&Date.now()>deadline)throw 't';
    var ms=moves(bd,me);if(!ms.length)return -100000-d;if(d==0){var e=evalB(bd);return me=='w'?e:-e}
    ms.sort(function(p,q){return q.caps.length-p.caps.length});
    for(var i=0;i<ms.length;i++){var v=-nega(apply(bd,ms[i]),me=='w'?'b':'w',d-1,-bt,-a);if(v>a)a=v;if(a>=bt)break}return a}
  function think(){var ms=moves(b,'b'),best=ms[0];deadline=Date.now()+1200;nodes=0;
    try{for(var d=1;d<=8;d++){var bv=-1e9,bm=best;for(var i=0;i<ms.length;i++){var v=-nega(apply(b,ms[i]),'w',d-1,-1e9,-bv)+Math.random()*2;if(v>bv){bv=v;bm=ms[i]}}best=bm;ms.splice(ms.indexOf(best),1);ms.unshift(best)}}catch(e){}
    return best}

  /* сурет */
  function dims(){W=P.W;H=P.H;S=Math.floor(Math.min(H*.105,W*.065));BX=Math.round(W*.37-4*S);BY=Math.round(H*.53-4*S);
    bg.width=W;bg.height=H;var c=bg.getContext('2d');paintBg(c,W,H);paintBoard(c,BX,BY,S)}
  function paintBg(c,w,h){var g=c.createRadialGradient(w*.4,h*.5,0,w*.4,h*.5,w*.8);g.addColorStop(0,'#1f2a2c');g.addColorStop(1,'#0b1011');c.fillStyle=g;c.fillRect(0,0,w,h);
    var s=h*.14,row=0;for(var y=0;y<h+s;y+=s,row++)for(var xx=(row%2)*s/2;xx<w+s;xx+=s)P.orn(c,2,xx,y,s*.5,'rgba(95,212,196,.035)',s*.03)}
  function paintBoard(c,bx,by,s){var m=s*.45;
    c.save();c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=s*.6;c.shadowOffsetY=s*.15;c.fillStyle='#4a2a14';c.fillRect(bx-m,by-m,8*s+2*m,8*s+2*m);c.restore();
    c.strokeStyle='#5fd4c4';c.globalAlpha=.5;c.lineWidth=s*.04;c.strokeRect(bx-m*.55,by-m*.55,8*s+m*1.1,8*s+m*1.1);c.globalAlpha=1;
    [[bx-m*.5,by-m*.5],[bx+8*s+m*.5,by-m*.5],[bx-m*.5,by+8*s+m*.5],[bx+8*s+m*.5,by+8*s+m*.5]].forEach(function(p){P.orn(c,1,p[0],p[1],m*.8,'#5fd4c4',m*.1)});
    for(var r=0;r<8;r++)for(var cc=0;cc<8;cc++){c.fillStyle=(r+cc)%2?'#5b3a22':'#e6d2ab';c.fillRect(bx+cc*s,by+r*s,s,s)}}
  function disc(c,p,cx,cy,s){var w=side(p)=='w',r=s*.38;
    c.save();c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(cx+s*.03,cy+s*.06,r,r*.92,0,0,7);c.fill();
    var g=c.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r);g.addColorStop(0,w?'#fffaf0':'#e0644f');g.addColorStop(1,w?'#cdb994':'#7e1f14');
    c.fillStyle=g;c.beginPath();c.arc(cx,cy,r,0,7);c.fill();
    c.strokeStyle=w?'rgba(120,90,50,.55)':'rgba(255,200,170,.4)';c.lineWidth=s*.03;c.beginPath();c.arc(cx,cy,r*.72,0,7);c.stroke();
    if(king(p))P.orn(c,0,cx,cy+r*.05,r*1.05,w?'#b0832a':'#ffcf6e',r*.14);
    c.restore()}

  /* ойын */
  function sqAt(mx,my){var c=Math.floor((mx-BX)/S),r=Math.floor((my-BY)/S);return ins(r,c)?r*8+c:-1}
  function sqXY(i){return {x:BX+(i&7)*S+S/2,y:BY+(i>>3)*S+S/2}}
  function turnPid(){return turn=='w'?0:1}
  function menu(){state='menu';P.panel({title:'Дойбы',text:'Алу міндетті, бірнеше дойбыны қатарынан алуға болады. Соңғы қатарға жеткен дойбы дамкаға айналады, ол диагональ бойымен алысқа ұшады. Екі адам ойнаса: бірінші телефон — ақтар, екіншісі — қызылдар.',
      btns:[['Компьютерге қарсы',function(){begin(true)}],['Екі адам',function(){begin(false)}]]})}
  function begin(ai){P.panel(null);vsAI=ai;b=init();turn='w';sel=-1;opts=[];last=null;anim=null;quiet=0;state='play';all=moves(b,turn)}
  function human(pid,q){if(!(state=='play'&&!anim&&(!vsAI||turn=='w')))return false;
    if(!vsAI&&pid!=null&&P.padCount()==2&&pid!=turnPid()){if(!q)P.toast((turnPid()+1)+'-ойыншының кезегі',1000);return false}return true}
  function doMove(m){anim={m:m,p:b[m.f],i:0,k:0,pts:[m.f].concat(m.path)};sel=-1;opts=[];P.S.tick(.6)}
  function after(){var m=anim.m,wasK=king(anim.p);b=apply(b,m);last=m;anim=null;
    if(m.caps.length){P.S.hit(m.caps.length>=2);if(m.caps.length>=2)P.toast('+'+m.caps.length+' дойбы!',1000);quiet=0}else quiet++;
    if(m.kg&&!wasK){P.S.chime();P.toast('Дамка!',900)}
    turn=turn=='w'?'b':'w';all=moves(b,turn);
    if(!all.length)return finish(turn=='w'?'b':'w');
    if(quiet>=60)return finish('d');
    if(vsAI&&turn=='b'){state='ai';aiT=.35}}
  function finish(win){state='over';
    var t=win=='d'?'Тең ойын':vsAI?(win=='w'?'Сіз жеңдіңіз!':'Компьютер жеңді'):(win=='w'?'Ақтар жеңді!':'Қызылдар жеңді!');
    if(vsAI&&win=='w'){P.best('doiby',P.best('doiby')+1);P.S.win()}else if(win!='d')P.S.lose();
    setTimeout(function(){P.panel({sub:'Ойын аяқталды',big:t,text:vsAI?'Компьютерді жеңген саны: '+P.best('doiby'):'',
      btns:[['Компьютерге қарсы',function(){begin(true)}],['Екі адам',function(){begin(false)}]]})},800)}

  G.start=function(){x=P.ctx;dims();b=init();menu()};
  G.resize=function(){dims()};
  G.onKey=function(k,pid){if(k<37||k>40)return false;var d={37:[-1,0],38:[0,-1],39:[1,0],40:[0,1]}[k];var pt=P.ptr(pid);
    var nx=Math.max(BX+S/2,Math.min(BX+7.5*S,pt.x+d[0]*S)),ny=Math.max(BY+S/2,Math.min(BY+7.5*S,pt.y+d[1]*S));if(pid==1){P.c2.x=nx;P.c2.y=ny;P.c2.shown=1}else{P.mx=nx;P.my=ny}return true};
  G.onAction=function(mx,my,pid){if(!human(pid))return;var q=sqAt(mx,my);if(q<0)return;
    var hit=opts.filter(function(m){return m.t==q});if(hit.length){hit.sort(function(a,c){return c.caps.length-a.caps.length});doMove(hit[0]);return}
    var mine=all.filter(function(m){return m.f==q});
    if(mine.length){sel=q;opts=mine;P.S.click()}else{sel=-1;opts=[];if(side(b[q])==turn&&all.length&&all[0].caps.length)P.toast('Алу міндетті!',1000)}};
  G.frame=function(dt){
    if(anim){anim.k+=dt/.17;if(anim.k>=1){anim.k=0;anim.i++;if(anim.i>=anim.pts.length-1)after();else P.S.tick(.4)}}
    if(state=='ai'){aiT-=dt;if(aiT<=0){state='think';setTimeout(function(){var m=think();state='play';if(m)doMove(m)},30)}}
    x.drawImage(bg,0,0);
    if(last){[last.f,last.t].forEach(function(i){x.fillStyle='rgba(95,212,196,.28)';x.fillRect(BX+(i&7)*S,BY+(i>>3)*S,S,S)})}
    var movable=human(null,1)?all.map(function(m){return m.f}):[];
    var hp=P.ptr(!vsAI&&P.padCount()==2?turnPid():0),hv=human(null,1)?sqAt(hp.x,hp.y):-1;
    if(hv>=0){x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=S*.05;x.strokeRect(BX+(hv&7)*S+S*.03,BY+(hv>>3)*S+S*.03,S*.94,S*.94)}
    if(sel>=0){x.strokeStyle='#ffcf6e';x.lineWidth=S*.07;x.strokeRect(BX+(sel&7)*S+S*.04,BY+(sel>>3)*S+S*.04,S*.92,S*.92)}
    opts.forEach(function(m){var p=sqXY(m.t);x.fillStyle=m.caps.length?'rgba(226,87,76,.8)':'rgba(95,212,196,.8)';x.beginPath();x.arc(p.x,p.y,S*.15,0,7);x.fill();
      m.caps.forEach(function(q){var cp=sqXY(q);x.strokeStyle='rgba(226,87,76,.8)';x.lineWidth=S*.05;x.beginPath();x.arc(cp.x,cp.y,S*.44,0,7);x.stroke()})});
    if(b)for(var i=0;i<64;i++){var p=b[i];if(p=='.'||(anim&&i==anim.m.f))continue;var q=sqXY(i);
      if(anim&&anim.m.caps.indexOf(i)>=0&&anim.i>=anim.m.caps.indexOf(i)+1)x.globalAlpha=.25;
      disc(x,p,q.x,q.y,S);x.globalAlpha=1;
      if(movable.indexOf(i)>=0&&sel!=i&&all.length&&all[0].caps.length){x.strokeStyle='rgba(255,207,110,.8)';x.lineWidth=S*.04;x.beginPath();x.arc(q.x,q.y,S*.43,0,7);x.stroke()}}
    if(anim){var a=sqXY(anim.pts[anim.i]),c2=sqXY(anim.pts[Math.min(anim.i+1,anim.pts.length-1)]),e=anim.k,hop=Math.sin(e*Math.PI)*S*.25;
      disc(x,anim.p,a.x+(c2.x-a.x)*e,a.y+(c2.y-a.y)*e-hop,S*1.05)}
    var px=BX+8*S+S*.9,py=BY+S*.2;x.textAlign='left';
    if(b&&state!='menu'){x.fillStyle='#5fd4c4';x.font='800 '+(S*.42)+'px Manrope,Arial';
      x.fillText(state=='think'||state=='ai'?'Компьютер ойланып жатыр…':turn=='w'?(vsAI?'Сіздің жүрісіңіз':'Ақтардың жүрісі'):(vsAI?'Компьютер':'Қызылдардың жүрісі'),px,py+S*.4);
      x.fillStyle='rgba(255,247,234,.7)';x.font='700 '+(S*.26)+'px Manrope,Arial';
      x.fillText(vsAI?'Сіз — ақтар':(P.padCount()==2?'1 — ақтар · 2 — қызылдар':'Екі адам · бір пульт'),px,py+S*.85);
      if(all.length&&all[0].caps.length&&human(null,1)){x.fillStyle='#ff8c6e';x.fillText('Алу міндетті!',px,py+S*1.35)}
      var cw=0,cb=0;b.forEach(function(p){if(side(p)=='w')cw++;else if(side(p)=='b')cb++});
      disc(x,'w',px+S*.3,py+S*2.1,S*.8);disc(x,'b',px+S*.3,py+S*2.9,S*.8);x.fillStyle='#fff7ea';x.font='800 '+(S*.38)+'px Manrope,Arial';
      x.fillText(cw,px+S*.8,py+S*2.23);x.fillText(cb,px+S*.8,py+S*3.03)}
  };
  G.cover=function(c,w,h){paintBg(c,w,h);var s=h*.15,bx=w/2-4*s,by=h*.42-2*s;
    for(var r=0;r<5;r++)for(var cc=0;cc<8;cc++){c.fillStyle=(r+cc)%2?'#5b3a22':'#e6d2ab';c.fillRect(bx+cc*s,by+r*s,s,s)}
    [[0,1,'b'],[0,3,'b'],[1,4,'B'],[2,1,'w'],[3,4,'W'],[3,6,'w'],[4,5,'w'],[1,6,'b']].forEach(function(a){disc(c,a[2],bx+a[1]*s+s/2,by+a[0]*s+s/2,s*1.1)})};
  return G;
})());

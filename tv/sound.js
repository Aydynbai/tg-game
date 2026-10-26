/* Алаң — дыбыс: кодпен синтезделген домбыра үні, әр ойынға өз әуені. Сыртқы аудиофайл жоқ. */
(function(){
  var AC=window.AudioContext||window.webkitAudioContext;
  var ctx=null,master,musicBus,sfxBus,on=true,started=false,timer=null;
  try{if(localStorage.getItem('alan_sound')==='0')on=false}catch(e){}
  var f=function(m){return 440*Math.pow(2,(m-69)/12)};

  /* әр бөлімнің әуені: темп, лад, тығыздық, тұяқ ырғағы */
  var MODES={
    hub:   {bpm:88, root:62,dens:.75,hoof:0,vol:.5, order:[0,1,2,3]},
    burkit:{bpm:104,root:62,dens:1,  hoof:0,vol:.5, order:[0,1,0,3,4,2,5,3]},
    asyq:  {bpm:96, root:64,dens:.85,hoof:0,vol:.42,order:[4,1,5,3]},
    oyu:   {bpm:70, root:62,dens:.35,hoof:0,vol:.22,order:[2,0,3,1]},
    togyz: {bpm:72, root:60,dens:.5, hoof:0,vol:.36,order:[1,3,0,2]}
  };
  var cur=MODES.hub,hoofOn=0;
  var DOR=[0,2,3,5,7,9,10,12,14,15,17];
  var PHR=[[4,-1,4,5,4,3,2,-1,3,4,-1,-1],[4,5,7,5,4,-1,3,4,2,-1,-1,-1],[7,-1,8,7,5,4,5,-1,4,3,2,-1],
           [2,3,4,-1,4,5,4,3,2,1,0,-1],[0,-1,2,4,-1,4,5,4,5,7,-1,-1],[9,8,7,-1,7,5,4,5,4,2,-1,-1]];
  var PENTA=[62,65,67,69,72,74];

  function init(){
    if(ctx||!AC)return;ctx=new AC();
    master=ctx.createGain();master.gain.value=on?1:0;master.connect(ctx.destination);
    musicBus=ctx.createGain();musicBus.gain.value=cur.vol;sfxBus=ctx.createGain();sfxBus.gain.value=.8;
    var len=ctx.sampleRate*1.5,buf=ctx.createBuffer(2,len,ctx.sampleRate);
    for(var c=0;c<2;c++){var d=buf.getChannelData(c);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
    var rev=ctx.createConvolver();rev.buffer=buf;var rg=ctx.createGain();rg.gain.value=.2;
    musicBus.connect(master);musicBus.connect(rev);sfxBus.connect(rev);rev.connect(rg);rg.connect(master);sfxBus.connect(master);
  }
  function pluck(t,m,v,dur,bus){
    var o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();
    o.type='sawtooth';o2.type='triangle';o.frequency.value=f(m);o2.frequency.value=f(m)*1.003;
    lp.type='lowpass';lp.Q.value=4;lp.frequency.setValueAtTime(f(m)*7,t);lp.frequency.exponentialRampToValueAtTime(f(m)*1.4,t+.18);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.0008,t+dur);
    o.connect(lp);o2.connect(lp);lp.connect(g);g.connect(bus||musicBus);o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05);
  }
  function hoof(t,v){var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';
    o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(55,t+.12);
    g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g);g.connect(musicBus);o.start(t);o.stop(t+.2)}
  function noise(t,dur,fq,q,v,bus){var len=Math.max(1,ctx.sampleRate*dur),b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);
    for(var i=0;i<len;i++)d[i]=Math.random()*2-1;var s=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),g=ctx.createGain();
    s.buffer=b;bp.type='bandpass';bp.frequency.value=fq;bp.Q.value=q;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    s.connect(bp);bp.connect(g);g.connect(bus||sfxBus);s.start(t);return {f:bp.frequency,g:g}}

  var nextT=0,step=0;
  function schedule(){
    var e=60/cur.bpm/2;
    while(nextT<ctx.currentTime+.25){
      var ph=PHR[cur.order[Math.floor(step/12)%cur.order.length]],n=ph[step%12],s=step%6,r=cur.root;
      if(n>=0&&(s==0||s==3||Math.random()<cur.dens))pluck(nextT,r+DOR[n],(s==0||s==3)?.16:.11,.55);
      if(s==0||s==3)pluck(nextT,r-12+(s==3?7:0),.07,.4);
      if((s==2||s==5)&&cur.dens>.6)pluck(nextT,r-5,.045,.25);
      if(hoofOn&&(s==0||s==2||s==3||s==5))hoof(nextT,s==0||s==3?.22:.12);
      nextT+=e*(s==2||s==5?1.08:.96);step++;
    }
  }
  function startMusic(){if(started)return;started=true;
    var g=ctx.createGain(),lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=420;g.gain.value=0;g.gain.linearRampToValueAtTime(.045,ctx.currentTime+3);
    [38,45,50].forEach(function(m,i){var o=ctx.createOscillator();o.type=i?'triangle':'sawtooth';o.frequency.value=f(m);o.detune.value=(i-1)*4;o.connect(lp);o.start()});
    lp.connect(g);g.connect(musicBus);nextT=ctx.currentTime+.1;timer=setInterval(schedule,60)}

  function ok(){return ctx&&started}
  window.Sound={
    wake:function(){if(!AC)return;init();if(ctx.state==='suspended')ctx.resume();startMusic()},
    mode:function(m){cur=MODES[m]||MODES.hub;hoofOn=0;step=0;if(ctx)musicBus.gain.setTargetAtTime(cur.vol,ctx.currentTime,.4)},
    play:function(){hoofOn=1},stop:function(){hoofOn=0},
    note:function(i,d){if(!ok())return;var t=ctx.currentTime;pluck(t,PENTA[i%6],.3,(d||.5)+.4,sfxBus);pluck(t,PENTA[i%6]+12,.08,.4,sfxBus)},
    tick:function(v){if(!ok())return;var t=ctx.currentTime;noise(t,.04,1900,3,.25*(.3+v));var o=ctx.createOscillator(),g=ctx.createGain();
      o.frequency.value=900+v*500;g.gain.setValueAtTime(.12*(.3+v),t);g.gain.exponentialRampToValueAtTime(.001,t+.05);o.connect(g);g.connect(sfxBus);o.start(t);o.stop(t+.06)},
    dive:function(){if(!ok())return;var t=ctx.currentTime,n=noise(t,.35,400,1.2,.35);n.f.exponentialRampToValueAtTime(2600,t+.3)},
    hit:function(big){if(!ok())return;var t=ctx.currentTime;pluck(t,74,.25,.6,sfxBus);pluck(t+.07,81,.22,.6,sfxBus);if(big){pluck(t+.14,86,.22,.9,sfxBus);pluck(t+.21,93,.18,1.1,sfxBus)}},
    miss:function(){if(!ok())return;var t=ctx.currentTime;pluck(t,57,.12,.35,sfxBus);pluck(t+.08,55,.1,.4,sfxBus)},
    wolf:function(){if(!ok())return;var t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();o.type='sawtooth';
      o.frequency.setValueAtTime(110,t);o.frequency.linearRampToValueAtTime(70,t+.5);lp.type='lowpass';lp.frequency.value=600;
      g.gain.setValueAtTime(.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.55);o.connect(lp);lp.connect(g);g.connect(sfxBus);o.start(t);o.stop(t+.6)},
    lose:function(){if(!ok())return;var t=ctx.currentTime;[62,61,58].forEach(function(m,i){pluck(t+i*.14,m,.18,.6,sfxBus)})},
    win:function(){if(!ok())return;var t=ctx.currentTime;[62,67,69,74,79].forEach(function(m,i){pluck(t+i*.09,m,.2,.9,sfxBus)})},
    chime:function(){if(!ok())return;var t=ctx.currentTime;pluck(t,79,.12,.8,sfxBus);pluck(t+.06,86,.1,.9,sfxBus)},
    click:function(){if(!ok())return;pluck(ctx.currentTime,86,.09,.25,sfxBus)},
    toggle:function(){on=!on;try{localStorage.setItem('alan_sound',on?'1':'0')}catch(e){}if(ctx)master.gain.setTargetAtTime(on?1:0,ctx.currentTime,.05);return on},
    isOn:function(){return on}
  };
})();

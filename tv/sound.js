/* Бүркітші — фондық музыка және дыбыстар (WebAudio арқылы кодпен синтезделеді, сыртқы файл жоқ)
   Домбыра үніне ұқсас шертпе әуен, 6/8 шауып келе жатқан ырғақ, D дориан ладында. */
(function(){
  var AC=window.AudioContext||window.webkitAudioContext; if(!AC)return;
  var ctx=null,master,musicBus,sfxBus,rev,on=true,started=false;
  var STORE='burkit_music';
  try{if(localStorage.getItem(STORE)==='0')on=false}catch(e){}

  function mkReverb(){ // қысқа "дала" жаңғырығы
    var len=ctx.sampleRate*1.6,buf=ctx.createBuffer(2,len,ctx.sampleRate);
    for(var c=0;c<2;c++){var d=buf.getChannelData(c);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
    var cv=ctx.createConvolver();cv.buffer=buf;return cv;
  }
  function init(){
    if(ctx)return;
    ctx=new AC();
    master=ctx.createGain();master.gain.value=on?1:0;master.connect(ctx.destination);
    musicBus=ctx.createGain();musicBus.gain.value=.55;
    sfxBus=ctx.createGain();sfxBus.gain.value=.8;
    rev=mkReverb();var rg=ctx.createGain();rg.gain.value=.22;
    musicBus.connect(master);musicBus.connect(rev);rev.connect(rg);rg.connect(master);
    sfxBus.connect(master);
  }
  var f=function(m){return 440*Math.pow(2,(m-69)/12)};

  /* домбыра шертпесі: ара тіс толқын + тез жабылатын сүзгі */
  function pluck(t,midi,vel,dur,bus){
    var o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();
    o.type='sawtooth';o2.type='triangle';o.frequency.value=f(midi);o2.frequency.value=f(midi)*1.003;
    lp.type='lowpass';lp.Q.value=4;
    lp.frequency.setValueAtTime(f(midi)*7,t);lp.frequency.exponentialRampToValueAtTime(f(midi)*1.4,t+.18);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel,t+.004);g.gain.exponentialRampToValueAtTime(.0008,t+dur);
    o.connect(lp);o2.connect(lp);lp.connect(g);g.connect(bus||musicBus);
    o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05);
  }
  /* төменгі бурдон (жайлы, тұрақты) */
  var drone=null;
  function startDrone(){
    var g=ctx.createGain();g.gain.value=0;g.gain.linearRampToValueAtTime(.05,ctx.currentTime+3);
    var lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=420;
    [38,45,50].forEach(function(m,i){var o=ctx.createOscillator();o.type=i?'triangle':'sawtooth';o.frequency.value=f(m);
      o.detune.value=(i-1)*4;o.connect(lp);o.start()});
    var lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.07;lg.gain.value=160;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();
    lp.connect(g);g.connect(musicBus);drone=g;
  }
  /* дабыл тәрізді жұмсақ соққы (ат тұяғы) */
  function hoof(t,v){
    var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';
    o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(55,t+.12);
    g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);
    o.connect(g);g.connect(musicBus);o.start(t);o.stop(t+.2);
  }

  /* әуен: D дориан (D E F G A B C), фразалар 6/8 ырғақпен */
  var SC=[62,64,65,67,69,71,72,74,76,77,79];
  var PHR=[
    [4,-1,4,5,4,3, 2,-1,3,4,-1,-1],
    [4,5,7,5,4,-1, 3,4,2,-1,-1,-1],
    [7,-1,8,7,5,4, 5,-1,4,3,2,-1],
    [2,3,4,-1,4,5, 4,3,2,1,0,-1],
    [0,-1,2,4,-1,4, 5,4,5,7,-1,-1],
    [9,8,7,-1,7,5, 4,5,4,2,-1,-1]
  ];
  var ORDER=[0,1,0,3, 4,2,5,3];
  var BPM=104,eighth=60/BPM/2,nextT=0,step=0,bar=0,timer=null,intense=0;
  function schedule(){
    while(nextT<ctx.currentTime+.25){
      var pi=ORDER[Math.floor(step/12)%ORDER.length],p=PHR[pi],n=p[step%12],s=step%6;
      // басты шертпе: әуен
      if(n>=0){var acc=(s==0||s==3)?.16:.11;pluck(nextT,SC[n]+(Math.random()<.04?12:0),acc,.55)}
      // екінші ішек: бесінші интервал бурдон шертпесі (домбыраның екінші ішегі)
      if(s==0||s==3)pluck(nextT,50+(s==3?7:0),.07,.4);
      if(s==2||s==5)pluck(nextT,57,.045,.25);
      // ойын кезінде шауып келе жатқан тұяқ ырғағы қосылады
      if(intense){if(s==0||s==2||s==3||s==5)hoof(nextT,s==0||s==3?.22:.12)}
      nextT+=eighth*(s==2||s==5?1.08:.96); // сәл "жүгіртпе" свинг
      step++;
    }
  }
  function startMusic(){
    if(started)return;started=true;
    startDrone();nextT=ctx.currentTime+.1;timer=setInterval(schedule,60);
  }

  /* эффекттер */
  function whoosh(){
    var len=ctx.sampleRate*.35,b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);
    for(var i=0;i<len;i++)d[i]=(Math.random()*2-1);
    var s=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),g=ctx.createGain(),t=ctx.currentTime;
    s.buffer=b;bp.type='bandpass';bp.Q.value=1.2;bp.frequency.setValueAtTime(400,t);bp.frequency.exponentialRampToValueAtTime(2600,t+.3);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.35,t+.12);g.gain.exponentialRampToValueAtTime(.001,t+.34);
    s.connect(bp);bp.connect(g);g.connect(sfxBus);s.start(t);
  }
  function catchSnd(big){
    var t=ctx.currentTime;pluck(t,74,.25,.6,sfxBus);pluck(t+.07,81,.22,.6,sfxBus);
    if(big){pluck(t+.14,86,.22,.9,sfxBus);pluck(t+.21,93,.18,1.1,sfxBus)}
  }
  function missSnd(){var t=ctx.currentTime;pluck(t,57,.12,.35,sfxBus);pluck(t+.08,55,.1,.4,sfxBus)}
  function wolfSnd(){
    var t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();
    o.type='sawtooth';o.frequency.setValueAtTime(110,t);o.frequency.linearRampToValueAtTime(70,t+.5);
    lp.type='lowpass';lp.frequency.value=600;g.gain.setValueAtTime(.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.55);
    o.connect(lp);lp.connect(g);g.connect(sfxBus);o.start(t);o.stop(t+.6);
  }

  window.Sound={
    wake:function(){init();if(ctx.state==='suspended')ctx.resume();startMusic()},
    play:function(){intense=1},
    stop:function(){intense=0},
    dive:function(){if(ctx)whoosh()},
    hit:function(big){if(ctx)catchSnd(big)},
    miss:function(){if(ctx)missSnd()},
    wolf:function(){if(ctx)wolfSnd()},
    toggle:function(){on=!on;try{localStorage.setItem(STORE,on?'1':'0')}catch(e){}
      if(ctx)master.gain.setTargetAtTime(on?1:0,ctx.currentTime,.05);return on},
    isOn:function(){return on}
  };
})();

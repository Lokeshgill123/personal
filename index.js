
(function(){
  var root=document.documentElement, reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* theme: dark first, toggle sets data-theme */
  var label=document.getElementById('modeLabel'), icon=document.getElementById('modeIcon');
  var sun='<circle cx="9" cy="9" r="3.4"/><g stroke="currentColor" stroke-width="1.8"><path d="M9 1v2.4M9 14.6V17M1 9h2.4M14.6 9H17M3.3 3.3L5 5M13 13l1.7 1.7M3.3 14.7L5 13M13 5l1.7-1.7"/></g>';
  var moon='<path d="M14.5 11.2A6.2 6.2 0 0 1 6.8 3.5a6.2 6.2 0 1 0 7.7 7.7z"/>';
  function current(){var t=root.getAttribute('data-theme'); if(t) return t; return matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}
  function paint(){var t=current(); label.textContent=t==='dark'?'Night /':'Day /'; icon.innerHTML=t==='dark'?moon:sun; dotsColor();}
  try{var s=localStorage.getItem('rm-theme'); if(s) root.setAttribute('data-theme',s);}catch(e){}
  document.getElementById('mode').addEventListener('click',function(){
    var n=current()==='dark'?'light':'dark'; root.setAttribute('data-theme',n);
    try{localStorage.setItem('rm-theme',n);}catch(e){} paint();
  });

  /* menu */
  var burger=document.getElementById('burger'), menu=document.getElementById('menu');
  function setMenu(o){menu.classList.toggle('open',o); burger.setAttribute('aria-expanded',o); burger.setAttribute('aria-label',o?'Close menu':'Open menu'); document.body.style.overflow=o?'hidden':'';}
  burger.addEventListener('click',function(){setMenu(!menu.classList.contains('open'));});
  menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setMenu(false);});});
  addEventListener('keydown',function(e){if(e.key==='Escape') setMenu(false);});

  /* clock */
  function tick(){var d=new Date(); document.getElementById('clock').textContent=d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})+' · Your time';}
  tick(); setInterval(tick,1000);
  var abT=document.getElementById('abTime');
  function abTick(){try{abT.textContent=new Date().toLocaleTimeString('en-US',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',second:'2-digit'});}catch(e){abT.textContent=new Date().toLocaleTimeString();}}
  abTick(); setInterval(abTick,1000);
  document.getElementById('abFile').addEventListener('change',function(e){
    var f=e.target.files&&e.target.files[0]; if(!f) return; var r=new FileReader();
    r.onload=function(){var im=document.getElementById('abImg'); im.src=r.result; im.hidden=false; document.querySelector('.ab-ph').hidden=true;};
    r.readAsDataURL(f);
  });

  /* intro counter */
  var inum=document.getElementById('introNum');
  if(inum && !reduce){var i0=null; (function f(t){if(!i0)i0=t; var p=Math.min((t-i0)/1350,1); inum.textContent=String(Math.round(100*(1-Math.pow(1-p,3)))).padStart(3,'0'); if(p<1) requestAnimationFrame(f);})(performance.now());}

  /* split section headings into letters */
  document.querySelectorAll('.sec-head h2').forEach(function(h){
    var k=0; var words=h.textContent.trim().split(/\s+/); h.setAttribute('aria-label',h.textContent.trim()); h.textContent='';
    words.forEach(function(w,wi){
      var ws=document.createElement('span'); ws.className='w'; ws.setAttribute('aria-hidden','true');
      w.split('').forEach(function(c){var s=document.createElement('span'); s.className='ch'; s.style.setProperty('--i',k++); s.textContent=c; ws.appendChild(s);});
      h.appendChild(ws); if(wi<words.length-1) h.appendChild(document.createTextNode(' '));
    });
  });

  /* scramble on hover */
  var glyphs='!<>-_\\/[]{}=+*^?#01';
  function scramble(el){
    if(reduce||el._s) return; el._s=1; var orig=el.dataset.o||(el.dataset.o=el.textContent), n=0, tot=orig.length;
    var iv=setInterval(function(){
      el.textContent=orig.split('').map(function(c,i){return c===' '?' ':(i<n?c:glyphs[Math.floor(Math.random()*glyphs.length)]);}).join('');
      n+=1.2; if(n>=tot+1){clearInterval(iv); el.textContent=orig; el._s=0;}
    },28);
  }
  document.querySelectorAll('.step h3,.row h3,.offer h3').forEach(function(el){
    var host=el.closest('.step,.row,.offer')||el; host.addEventListener('mouseenter',function(){scramble(el);});
  });

  /* scroll: progress bar, disc parallax */
  var prog=document.getElementById('prog'), disc=document.querySelector('.disc'), tk=false;
  function onScroll(){
    var h=document.documentElement.scrollHeight-innerHeight, y=scrollY;
    prog.style.transform='scaleX('+(h>0?Math.min(y/h,1):0)+')';
    if(!reduce && disc){disc.style.setProperty('--py',(y*.28)+'px'); disc.style.setProperty('--sc',(1+Math.min(y/1600,.25)).toFixed(3));}
    tk=false;
  }
  addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(onScroll);}},{passive:true}); onScroll();

  /* reveals: only arm elements below the fold, so first frame is complete */
  var rvs=[].slice.call(document.querySelectorAll('.rv'));
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove('arm'); io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    rvs.forEach(function(el){if(el.getBoundingClientRect().top>innerHeight){el.classList.add('arm'); io.observe(el);}});
  }

  /* counters */
  var cn=[].slice.call(document.querySelectorAll('[data-n]'));
  function fmt(v,el){var d=+el.dataset.d; var s=v.toFixed(d); return el.dataset.c?Number(s).toLocaleString('en-US'):s;}
  function run(el){var to=+el.dataset.n, t0=null, dur=1700; function f(t){if(!t0)t0=t; var p=Math.min((t-t0)/dur,1); var e=1-Math.pow(1-p,4); el.textContent=fmt(to*e,el); if(p<1) requestAnimationFrame(f);} requestAnimationFrame(f);}
  cn.forEach(function(el){el.textContent=fmt(+el.dataset.n,el);});
  if('IntersectionObserver' in window && !reduce){
    var co=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){run(e.target); co.unobserve(e.target);}});},{threshold:.6});
    cn.forEach(function(el){co.observe(el);});
  }

  /* cursor + magnetic */
  var cur=document.getElementById('cur'), fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  var mx=-100,my=-100,cx=-100,cy=-100;
  if(fine){
    addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;cur.classList.add('on');});
    (function loop(){cx+=(mx-cx)*.2;cy+=(my-cy)*.2;cur.style.transform='translate('+cx+'px,'+cy+'px) translate(-50%,-50%)';requestAnimationFrame(loop);})();
    document.querySelectorAll('a,button,.row,.step,.offer,.skills span').forEach(function(el){
      el.addEventListener('mouseenter',function(){cur.classList.add('big');});
      el.addEventListener('mouseleave',function(){cur.classList.remove('big');});
    });
    if(!reduce) document.querySelectorAll('.mag').forEach(function(b){
      b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect(); b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.22)+'px,'+((e.clientY-r.top-r.height/2)*.35)+'px)';});
      b.addEventListener('mouseleave',function(){b.style.transform='';});
    });
  }

  /* copy email */
  var copy=document.getElementById('copy');
  copy.addEventListener('click',function(){
    var txt=document.getElementById('email').textContent;
    function done(){copy.textContent='Copied'; setTimeout(function(){copy.textContent='Copy email';},1600);}
    function sel(){var r=document.createRange(); r.selectNodeContents(document.getElementById('email')); var s=getSelection(); s.removeAllRanges(); s.addRange(r); copy.textContent='Press copy'; setTimeout(function(){copy.textContent='Copy email';},1800);}
    try{navigator.clipboard.writeText(txt).then(done,sel);}catch(e){sel();}
  });

  /* ASCII torus + falling deal-text inside the hero card */
  var cv=document.getElementById('dots'), g=cv.getContext('2d'), W=0,H=0,dpr=Math.min(devicePixelRatio||1,2), hero=document.querySelector('.hero');
  function dotsColor(){}
  var drops=[], RF=13, RCW=8, angle=0, spin=0, tSpin=0, S=0,fs=10,cw=6,chh=10,ox=0,oy=0,cols=0,rows=0,mask=null, POOL='$$$10K+';
  function layout(){
    S=Math.min(H*.98,W*(W<700?.9:.56)); fs=Math.max(9,Math.round(S/44)); cw=fs*.62; chh=fs; ox=W<700?W*.5:W*.72; oy=H*.5; cols=Math.floor(S/cw); rows=Math.floor(S/chh);
    var bw=cols*cw, bh=rows*chh, big=document.createElement('canvas'); big.width=Math.round(bw*2); big.height=Math.round(bh*2);
    var b=big.getContext('2d'); b.fillStyle='#000'; b.textAlign='center'; b.textBaseline='middle'; b.font='900 '+Math.round(bh*2*1.0)+'px "Arial Black",Arial,Helvetica,sans-serif'; b.fillText('$',big.width/2,big.height*.53);
    var sm=document.createElement('canvas'); sm.width=cols; sm.height=rows; var sc=sm.getContext('2d'); sc.imageSmoothingEnabled=true; sc.imageSmoothingQuality='high'; sc.drawImage(big,0,0,cols,rows);
    var d=sc.getImageData(0,0,cols,rows).data; mask=new Float32Array(cols*rows); for(var i=0;i<mask.length;i++) mask[i]=d[i*4+3]/255;
  }
  var RAIN='ABCDEFGHIJKLMNOPQRSTUVWXYZ$%&@#+=<>/*0123456789CLOSED$10K+', LUM='.,-~:;=!*#$@';
  function size(){var r=cv.getBoundingClientRect(); W=r.width;H=r.height; cv.width=W*dpr; cv.height=H*dpr; g.setTransform(dpr,0,0,dpr,0,0);
    RF=W<600?9:11; RCW=RF*.62; var n=Math.ceil(W/RCW); drops=[]; for(var i=0;i<n;i++) drops.push(Math.random()*H/RF); layout();}
  hero.addEventListener('mousemove',function(e){var r=hero.getBoundingClientRect(); tSpin=((e.clientX-r.left)/r.width-.5)*.05;});
  hero.addEventListener('mouseleave',function(){tSpin=0;});
  /* scroll drives the coin; wheel/touch are a fallback when the page itself never scrolls (embedded views) */
  var target=0, lastSY=scrollY, seen=false, ty0=0;
  addEventListener('scroll',function(){var d=scrollY-lastSY; lastSY=scrollY; if(d){seen=true; target+=d*.008;}},{passive:true});
  addEventListener('wheel',function(e){if(!seen) target+=e.deltaY*.008;},{passive:true});
  addEventListener('touchstart',function(e){ty0=e.touches[0].clientY;},{passive:true});
  addEventListener('touchmove',function(e){var y=e.touches[0].clientY; if(!seen) target+=(ty0-y)*.01; ty0=y;},{passive:true});
  function draw(t){
    g.clearRect(0,0,W,H); if(!W){requestAnimationFrame(draw);return;}
    g.textBaseline='top';
    /* rain */
    g.font='700 '+RF+'px "JetBrains Mono",monospace';
    var TR=10;
    for(var i=0;i<drops.length;i++){
      if((i*7)%5<2) continue;
      var head=Math.floor(drops[i]);
      for(var k=0;k<TR;k++){
        var row=head-k, y=row*RF; if(y<-RF||y>H) continue;
        g.fillStyle='rgba(10,10,10,'+(.42*(1-k/TR)).toFixed(2)+')';
        g.fillText(RAIN[((i*31+row*17)%RAIN.length+RAIN.length)%RAIN.length],i*RCW,y);
      }
      if(!reduce){drops[i]+=.1+((i*13)%7)*.03; if((drops[i]-TR)*RF>H) drops[i]=-Math.random()*20;}
    }
    /* dollar sign built from symbols, flipping like a coin */
    angle=0;
    var sx=Math.max(.12,Math.abs(Math.cos(angle))), mid=(cols-1)/2, x0=ox-S/2, y0=oy-S/2;
    g.font='800 '+fs+'px "JetBrains Mono",monospace';
    for(var r=0;r<rows;r++){for(var c=0;c<cols;c++){
      var src=Math.round((c-mid)/sx+mid); if(src<0||src>=cols) continue;
      var v=mask[src+r*cols]; if(v<.2) continue;
      v+=.14*Math.sin(t*.004+r*.5+c*.3);
      var chr, col;
      if(v>.78){chr=POOL[(c*7+r*13+Math.floor(t*.005))%POOL.length]; col='#ffffff';}
      else if(v>.5){chr=LUM[Math.min(LUM.length-1,Math.floor(v*LUM.length))]; col='rgba(255,255,255,.8)';}
      else{chr=LUM[Math.max(0,Math.floor(v*6))]; col='rgba(10,10,10,.75)';}
      g.fillStyle=col; g.fillText(chr,x0+c*cw,y0+r*chh);
    }}
    if(!reduce) requestAnimationFrame(draw);
  }
  size(); addEventListener('resize',function(){size(); if(reduce) draw(0);});
  paint(); draw(0);
})();

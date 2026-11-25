'use strict';
/* أركيد الملك جوكر — 1000 لعبة */
const LW=400, LH=600;
const $=s=>document.querySelector(s);
const T=t=>document.createElement(t);
const arN=n=>Number(n).toLocaleString('ar-EG',{maximumFractionDigits:0});
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const store={
  get(k,d){try{const v=localStorage.getItem('jg_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem('jg_'+k,JSON.stringify(v))}catch(e){}}
};
const CATS={arc:'🕹️ أركيد',puz:'🧩 ألغاز وذكاء',spd:'⚡ سرعة ورد فعل'};
const TIERS=['مبتدئ','سهل','متوسط','صعب','أسطوري'];
const PAL=[['#00e5ff','#ff2ea6'],['#ffb300','#ff2ea6'],['#00e676','#00e5ff'],['#7c4dff','#ff2ea6'],['#ff5252','#ffb300'],['#448aff','#7c4dff'],['#c6ff00','#00e676'],['#ff2ea6','#ffb300']];
const ADJ=['الناري','السريع','المجنون','الذهبي','الفضي','النيون','الليلي','الشبح','الملكي','الأسطوري','الخارق','العملاق','الغاضب','السري','الفضائي','الصحراوي','الجليدي','البحري','البرقي','الماسي','الكريستالي','الحديدي','النحاسي','الزئبقي','الصاروخ','التوربو','النينجا','الساموراي','الفرعوني','الروماني','الوحش','التنين','الصقر','النمر','الذئب','القرش','السهم','القناص','المحترف','البطل'];
const ENG={};

/* ---------- أدوات رسم مشتركة ---------- */
function neonText(ctx,txt,x,y,size,color,align,weight){
  ctx.save();ctx.font=(weight||700)+' '+size+'px Cairo, Tajawal, sans-serif';ctx.textAlign=align||'center';ctx.textBaseline='middle';
  ctx.shadowColor=color;ctx.shadowBlur=14;ctx.fillStyle=color;ctx.fillText(txt,x,y);ctx.restore();
}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function bgGrid(ctx,color){
  ctx.fillStyle='#120a22';ctx.fillRect(0,0,LW,LH);
  ctx.save();ctx.strokeStyle=color||'rgba(124,77,255,.08)';ctx.lineWidth=1;
  for(let x=0;x<=LW;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,LH);ctx.stroke();}
  for(let y=0;y<=LH;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(LW,y);ctx.stroke();}
  ctx.restore();
}
function drawBtn(ctx,b){
  ctx.save();rr(ctx,b.x,b.y,b.w,b.h,12);
  ctx.fillStyle=b.bg||'#221344';ctx.fill();
  ctx.strokeStyle=b.c||'#7c4dff';ctx.lineWidth=2;ctx.shadowColor=b.c||'#7c4dff';ctx.shadowBlur=10;ctx.stroke();
  ctx.shadowBlur=0;neonText(ctx,b.label,b.x+b.w/2,b.y+b.h/2,b.fs||18,b.tc||'#f4efff');
  ctx.restore();
}
function hit(b,p){return p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h}

/* ---------- 1) الثعبان ---------- */
ENG.snake={noun:'الثعبان',icon:'🐍',cat:'arc',hint:'اسحب بصبعك أو بالأسهم عشان تتحكم. كل التفاح ومتضربش!',
params:i=>{const t=i>>3;return{speed:8+t+(i%8)*.3,walls:t>=2,obs:t>=1?(i%8)*t:0}},
start(api,p){
  const CS=20,GW=LW/CS,GH=LH/CS;
  let snake=[{x:10,y:15},{x:9,y:15},{x:8,y:15}],dir={x:1,y:0},ndir=dir,food=null,obs=[],score=0,acc=0,alive=true;
  const free=(x,y)=>!snake.some(s=>s.x===x&&s.y===y)&&!obs.some(o=>o.x===x&&o.y===y);
  function placeFood(){let x,y;do{x=ri(0,GW-1);y=ri(0,GH-1)}while(!free(x,y)||(food&&food.x===x&&food.y===y));food={x,y}}
  for(let k=0;k<p.obs;k++){let x,y;do{x=ri(2,GW-3);y=ri(2,GH-3)}while(!free(x,y));obs.push({x,y})}
  placeFood();
  let sx=0,sy=0;
  api.on('pointerdown',e=>{const q=api.pos(e);sx=q.x;sy=q.y});
  api.on('pointerup',e=>{const q=api.pos(e);const dx=q.x-sx,dy=q.y-sy;
    if(Math.abs(dx)<14&&Math.abs(dy)<14)return;
    if(Math.abs(dx)>Math.abs(dy)){if(dx>0&&dir.x!==-1)ndir={x:1,y:0};else if(dx<0&&dir.x!==1)ndir={x:-1,y:0}}
    else{if(dy>0&&dir.y!==-1)ndir={x:0,y:1};else if(dy<0&&dir.y!==1)ndir={x:0,y:-1}}});
  api.onKey(e=>{const m={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}}[e.key];
    if(m&&!(m.x===-dir.x&&m.y===-dir.y))ndir=m});
  api.loop(dt=>{
    bgGrid(api.ctx);
    if(alive){acc+=dt;const step=1000/p.speed;
      while(acc>step){acc-=step;dir=ndir;
        const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
        if(p.walls){if(h.x<0||h.y<0||h.x>=GW||h.y>=GH){alive=false;break}}
        else{h.x=(h.x+GW)%GW;h.y=(h.y+GH)%GH}
        if(obs.some(o=>o.x===h.x&&o.y===h.y)||snake.some(s=>s.x===h.x&&s.y===h.y)){alive=false;break}
        snake.unshift(h);
        if(h.x===food.x&&h.y===food.y){score+=10;api.score(score);placeFood()}else snake.pop();
      }
      if(!alive){api.over(score);return}
    }
    const c=api.ctx;
    obs.forEach(o=>{c.fillStyle='#ff5252';c.shadowColor='#ff5252';c.shadowBlur=8;rr(c,o.x*CS+2,o.y*CS+2,CS-4,CS-4,4);c.fill();c.shadowBlur=0});
    c.fillStyle='#ff2ea6';c.shadowColor='#ff2ea6';c.shadowBlur=12;c.beginPath();c.arc(food.x*CS+CS/2,food.y*CS+CS/2,CS/2-3,0,7);c.fill();c.shadowBlur=0;
    snake.forEach((s,idx)=>{c.fillStyle=idx===0?'#00e5ff':'#00e676';c.shadowColor=c.fillStyle;c.shadowBlur=idx===0?10:4;
      rr(c,s.x*CS+1,s.y*CS+1,CS-2,CS-2,5);c.fill()});c.shadowBlur=0;
  });
}};

/* ---------- 2) المضرب (بونج) ---------- */
ENG.pong={noun:'المضرب',icon:'🏓',cat:'arc',hint:'حرّك المضرب بلمستك أو بالأسهم. أول واحد يوصل للنقاط المطلوبة يكسب!',
params:i=>{const t=i>>3;return{ai:3.2+t*.9+(i%8)*.15,ball:4.5+t*.8,win:t>=3?5:3,pad:92-t*9}},
start(api,p){
  let px=LW/2,ax=LW/2,ball={x:LW/2,y:LH/2,vx:p.ball*(Math.random()<.5?1:-1),vy:-p.ball},me=0,aiS=0,over=false,serve=0;
  const PW=p.pad,PH=12,PY=LH-40,AY=30;
  function resetBall(dirUp){ball={x:LW/2,y:LH/2,vx:p.ball*(Math.random()<.5?1:-1)*rnd(.6,1),vy:(dirUp?-1:1)*p.ball};serve=800}
  api.on('pointermove',e=>{px=Math.max(PW/2,Math.min(LW-PW/2,api.pos(e).x))});
  api.on('pointerdown',e=>{px=Math.max(PW/2,Math.min(LW-PW/2,api.pos(e).x))});
  api.onKey(e=>{if(e.key==='ArrowLeft')px=Math.max(PW/2,px-30);if(e.key==='ArrowRight')px=Math.min(LW-PW/2,px+30)});
  api.loop(dt=>{
    const c=api.ctx;bgGrid(c);
    if(!over){
      if(serve>0)serve-=dt;
      else{
        ball.x+=ball.vx*dt/16;ball.y+=ball.vy*dt/16;
        if(ball.x<8){ball.x=8;ball.vx*=-1}if(ball.x>LW-8){ball.x=LW-8;ball.vx*=-1}
        const aiTarget=ball.x;ax+=Math.max(-p.ai*dt/16*1.6,Math.min(p.ai*dt/16*1.6,aiTarget-ax));
        ax=Math.max(PW/2,Math.min(LW-PW/2,ax));
        if(ball.y>PY-8&&ball.y<PY+PH&&Math.abs(ball.x-px)<PW/2+8&&ball.vy>0){ball.vy*=-1.04;ball.vx+=(ball.x-px)*.08}
        if(ball.y<AY+PH+8&&ball.y>AY&&Math.abs(ball.x-ax)<PW/2+8&&ball.vy<0){ball.vy*=-1.04;ball.vx+=(ball.x-ax)*.08}
        if(ball.y>LH+20){aiS++;api.score(me*100);if(aiS>=p.win){over=true;api.over(me*100,'خسرت الجولة 😅','الكمبيوتر وصل '+arN(p.win)+' الأول')}else resetBall(true)}
        if(ball.y<-20){me++;api.score(me*100);if(me>=p.win){over=true;api.over(me*100+500,'كسبت! 🏆','وصلت '+arN(p.win)+' الأول')}else resetBall(false)}
      }
    }
    c.strokeStyle='rgba(124,77,255,.4)';c.setLineDash([8,8]);c.beginPath();c.moveTo(0,LH/2);c.lineTo(LW,LH/2);c.stroke();c.setLineDash([]);
    c.fillStyle='#00e5ff';c.shadowColor='#00e5ff';c.shadowBlur=12;rr(c,px-PW/2,PY,PW,PH,6);c.fill();
    c.fillStyle='#ff2ea6';c.shadowColor='#ff2ea6';rr(c,ax-PW/2,AY,PW,PH,6);c.fill();
    c.fillStyle='#ffb300';c.shadowColor='#ffb300';c.beginPath();c.arc(ball.x,ball.y,8,0,7);c.fill();c.shadowBlur=0;
    neonText(c,arN(me)+' - '+arN(aiS),LW/2,LH/2-24,26,'#b9a8e0');
  });
}};

/* ---------- 3) الطوب (بريك آوت) ---------- */
ENG.breakout={noun:'الطوب',icon:'🧱',cat:'arc',hint:'حرّك المضرب وكسّر كل الطوب. ماتخليش الكورة تنزل!',
params:i=>{const t=i>>3;return{rows:4+t,cols:6,ball:4.2+t*.7,pad:96-t*9}},
start(api,p){
  let px=LW/2,ball={x:LW/2,y:LH-90,vx:p.ball*.7,vy:-p.ball},lives=3,score=0,over=false,stuck=true;
  const PW=p.pad,PH=12,PY=LH-34;
  const BW=(LW-20-(p.cols-1)*6)/p.cols,BH=22;
  let bricks=[];
  for(let r=0;r<p.rows;r++)for(let q=0;q<p.cols;q++)bricks.push({x:10+q*(BW+6),y:60+r*(BH+8),alive:true,hue:r});
  api.on('pointermove',e=>{px=Math.max(PW/2,Math.min(LW-PW/2,api.pos(e).x))});
  api.on('pointerdown',e=>{px=Math.max(PW/2,Math.min(LW-PW/2,api.pos(e).x));stuck=false});
  api.onKey(e=>{if(e.key==='ArrowLeft')px=Math.max(PW/2,px-28);if(e.key==='ArrowRight')px=Math.min(LW-PW/2,px+28);if(e.key===' ')stuck=false});
  api.loop(dt=>{
    const c=api.ctx;bgGrid(c);
    if(!over){
      if(stuck){ball.x=px;ball.y=PY-10}
      else{
        ball.x+=ball.vx*dt/16;ball.y+=ball.vy*dt/16;
        if(ball.x<8){ball.x=8;ball.vx*=-1}if(ball.x>LW-8){ball.x=LW-8;ball.vx*=-1}if(ball.y<44){ball.y=44;ball.vy*=-1}
        if(ball.y>PY-8&&ball.y<PY+PH&&Math.abs(ball.x-px)<PW/2+8&&ball.vy>0){ball.vy*=-1;ball.vx+=(ball.x-px)*.09;ball.vx=Math.max(-p.ball*1.6,Math.min(p.ball*1.6,ball.vx))}
        for(const b of bricks){if(!b.alive)continue;
          if(ball.x>b.x-8&&ball.x<b.x+BW+8&&ball.y>b.y-8&&ball.y<b.y+BH+8){b.alive=false;ball.vy*=-1;score+=10+b.hue*2;api.score(score);break}}
        if(ball.y>LH+20){lives--;stuck=true;ball={x:px,y:PY-10,vx:p.ball*.7*(Math.random()<.5?1:-1),vy:-p.ball};
          if(lives<=0){over=true;api.over(score,'خلصت المحاولات 😅')}}
        if(bricks.every(b=>!b.alive)){over=true;api.over(score+lives*200,'كسّرت كل حاجة! 🏆','مكافأة المحاولات: '+arN(lives*200))}
      }
    }
    const hues=['#ff2ea6','#7c4dff','#00e5ff','#00e676','#ffb300','#ff5252'];
    bricks.forEach(b=>{if(!b.alive)return;const col=hues[b.hue%hues.length];c.fillStyle=col;c.shadowColor=col;c.shadowBlur=8;rr(c,b.x,b.y,BW,BH,5);c.fill()});c.shadowBlur=0;
    c.fillStyle='#00e5ff';c.shadowColor='#00e5ff';c.shadowBlur=12;rr(c,px-PW/2,PY,PW,PH,6);c.fill();
    c.fillStyle='#ffb300';c.shadowColor='#ffb300';c.beginPath();c.arc(ball.x,ball.y,8,0,7);c.fill();c.shadowBlur=0;
    neonText(c,'❤'.repeat(Math.max(0,lives)),30,22,16,'#ff2ea6','left');
  });
}};

/* ---------- 4) الذاكرة ---------- */
const EMOJI_SETS=[['🍕','⚽','🎮','🚗','🐱','🍉','⭐','🎧','🚀','🦁','🍩','🎁','🌙','🔥','💎','🎯'],['🍔','🍟','🌮','🍦','🍰','🥤','🍇','🍓','🥑','🍗','🧀','🍫','🥞','🍿','🥝','🍊'],['⚽','🏀','🏓','🎾','🏐','🎱','🏹','🥊','🛹','⛳','🎿','🏋️','🤺','🏊','🚴','🪁'],['🐶','🦊','🐸','🐵','🦄','🐝','🦋','🐙','🦖','🐢','🦜','🐬','🦩','🐨','🦉','🐳']];
ENG.memory={noun:'الذاكرة',icon:'🃏',cat:'puz',hint:'افتح كارتين ورا بعض. لو شبه بعض يتثبتوا. خلّص كل الأزواج بأقل محاولات!',
params:i=>{const t=i>>3;return{pairs:6+2*t+(i%8>=4?2:0),set:i%4}},
start(api,p){
  const set=EMOJI_SETS[p.set].slice(0,p.pairs);
  let deck=[...set,...set].sort(()=>Math.random()-.5).map((e,idx)=>({e,idx,open:false,done:false}));
  const cols=p.pairs<=8?4:5,rows=Math.ceil(deck.length/cols);
  const GW=Math.min(86,(LW-24-(cols-1)*8)/cols),GHc=Math.min(96,(LH-120-(rows-1)*8)/rows);
  const ox=(LW-(cols*GW+(cols-1)*8))/2,oy=80;
  let first=null,lock=false,moves=0,found=0,over=false;
  api.on('pointerdown',e=>{
    if(over||lock)return;const q=api.pos(e);
    const cc=Math.floor((q.x-ox)/(GW+8)),r=Math.floor((q.y-oy)/(GHc+8));
    if(cc<0||cc>=cols||r<0)return;const idx=r*cols+cc;if(idx>=deck.length)return;
    const card=deck[idx];if(card.open||card.done)return;
    card.open=true;
    if(!first){first=card;return}
    moves++;lock=true;
    if(first.e===card.e){first.done=card.done=true;found++;first=null;lock=false;
      if(found===p.pairs){over=true;const sc=Math.max(50,p.pairs*120-moves*8);api.score(sc);api.over(sc,'ذاكرة حديد! 🧠','خلصت في '+arN(moves)+' محاولة')}}
    else{const a=first,b=card;first=null;setTimeout(()=>{a.open=false;b.open=false;lock=false},650)}
  });
  api.loop(()=>{
    const c=api.ctx;bgGrid(c);
    neonText(c,'الأزواج: '+arN(found)+'/'+arN(p.pairs)+'   المحاولات: '+arN(moves),LW/2,30,17,'#00e5ff');
    deck.forEach((card,idx)=>{const cc=idx%cols,r=Math.floor(idx/cols);const x=ox+cc*(GW+8),y=oy+r*(GHc+8);
      c.save();
      if(card.open||card.done){rr(c,x,y,GW,GHc,10);c.fillStyle=card.done?'rgba(0,230,118,.15)':'#221344';c.fill();
        c.strokeStyle=card.done?'#00e676':'#7c4dff';c.lineWidth=2;c.shadowColor=c.strokeStyle;c.shadowBlur=card.done?12:6;c.stroke();c.shadowBlur=0;
        c.font=Math.min(GW,GHc)*.5+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(card.e,x+GW/2,y+GHc/2+2)}
      else{rr(c,x,y,GW,GHc,10);const g=c.createLinearGradient(x,y,x+GW,y+GHc);g.addColorStop(0,'#2a1a52');g.addColorStop(1,'#1a0f30');c.fillStyle=g;c.fill();
        c.strokeStyle='rgba(124,77,255,.5)';c.lineWidth=1.5;c.stroke();
        neonText(c,'؟',x+GW/2,y+GHc/2,Math.min(GW,GHc)*.45,'#7c4dff')}
      c.restore();
    });
  });
}};

/* ---------- 5) المطرقة (اضرب الخلد) ---------- */
ENG.whack={noun:'المطرقة',icon:'🔨',cat:'spd',hint:'اضرب الخلد لما يطلع قبل ما يختفي! إوعى تضرب القنبلة 💣',
params:i=>{const t=i>>3;return{time:30,rate:Math.max(380,950-t*110-(i%8)*15),bad:t*.09}},
start(api,p){
  const holes=[];for(let r=0;r<3;r++)for(let q=0;q<3;q++)holes.push({x:70+q*130,y:170+r*140});
  let score=0,left=p.time*1000,spawn=0,moles=[],over=false;
  api.on('pointerdown',e=>{if(over)return;const q=api.pos(e);
    moles.forEach(m=>{if(!m.hit&&Math.hypot(q.x-holes[m.h].x,q.y-holes[m.h].y)<44){m.hit=true;
      if(m.bad){score=Math.max(0,score-20)}else score+=10;api.score(score)}})});
  api.loop(dt=>{
    const c=api.ctx;bgGrid(c);
    if(!over){
      left-=dt;spawn-=dt;
      if(spawn<=0){spawn=p.rate*rnd(.7,1.2);
        const freeHoles=holes.map((h,idx)=>idx).filter(idx=>!moles.some(m=>m.h===idx));
        if(freeHoles.length)moles.push({h:pick(freeHoles),life:1100,bad:Math.random()<p.bad,hit:false})}
      moles.forEach(m=>m.life-=dt);moles=moles.filter(m=>m.life>0);
      if(left<=0){over=true;api.over(score,'خلص الوقت! ⏰')}
    }
    holes.forEach(h=>{c.fillStyle='#0d0718';c.beginPath();c.ellipse(h.x,h.y+14,48,16,0,0,7);c.fill()});
    moles.forEach(m=>{const h=holes[m.h];const pop=Math.min(1,(1100-m.life)/200)*Math.min(1,m.life/200);
      c.save();c.translate(h.x,h.y);c.scale(1,Math.max(0,pop));
      c.font='52px sans-serif';c.textAlign='center';c.textBaseline='middle';
      c.fillText(m.hit?(m.bad?'💥':'✨'):(m.bad?'💣':'🐹'),0,-10);c.restore()});
    neonText(c,'⏱ '+arN(Math.ceil(left/1000)),LW-52,30,20,left<6000?'#ff5252':'#00e5ff');
    neonText(c,'⭐ '+arN(score),60,30,20,'#ffb300');
  });
}};

/* ---------- 6) الألوان (سايمون) ---------- */
ENG.simon={noun:'الألوان',icon:'🎨',cat:'puz',hint:'افتكر ترتيب الألوان اللي بتنوّر وكرره بنفس الترتيب!',
params:i=>{const t=i>>3;return{pads:4+(t>=2?1:0)+(t>=4?1:0),speed:Math.max(260,620-t*70)}},
start(api,p){
  const cols=['#00e5ff','#ff2ea6','#ffb300','#00e676','#7c4dff','#ff5252'].slice(0,p.pads);
  let seq=[],user=[],showing=false,round=0,over=false,lit=-1;
  const padRect=idx=>{const perRow=p.pads<=4?2:3;const r=Math.floor(idx/perRow),q=idx%perRow;
    const w=110,h=110,gx=18,gy=18;const rowCount=Math.ceil(p.pads/perRow);
    const totalW=perRow*w+(perRow-1)*gx;
    return{x:(LW-totalW)/2+q*(w+gx),y:150+r*(h+gy),w,h}};
  function addStep(){seq.push(ri(0,p.pads-1));user=[];showSeq()}
  function showSeq(){showing=true;let k=0;
    const iv=setInterval(()=>{if(api.dead){clearInterval(iv);return}
      if(k>=seq.length){clearInterval(iv);lit=-1;showing=false;return}
      lit=seq[k];setTimeout(()=>{if(lit===seq[k])lit=-1},p.speed*.55);k++},p.speed)}
  addStep();
  api.on('pointerdown',e=>{if(over||showing)return;const q=api.pos(e);
    for(let idx=0;idx<p.pads;idx++){if(hit(padRect(idx),q)){
      lit=idx;setTimeout(()=>{if(lit===idx)lit=-1},180);
      user.push(idx);
      if(user[user.length-1]!==seq[user.length-1]){over=true;api.score(round*100);api.over(round*100,'غلطة! ❌','وصلت للجولة '+arN(round+1));return}
      if(user.length===seq.length){round++;api.score(round*100);setTimeout(()=>{if(!over)addStep()},500)}
      break}}});
  api.loop(()=>{
    const c=api.ctx;bgGrid(c);
    neonText(c,'الجولة '+arN(round+1),LW/2,60,24,'#00e5ff');
    neonText(c,showing?'👀 اتفرج...':'✋ دورك!',LW/2,105,20,showing?'#ffb300':'#00e676');
    for(let idx=0;idx<p.pads;idx++){const b=padRect(idx);
      c.save();rr(c,b.x,b.y,b.w,b.h,16);
      c.fillStyle=cols[idx];c.globalAlpha=lit===idx?1:.28;
      c.shadowColor=cols[idx];c.shadowBlur=lit===idx?26:0;c.fill();c.restore()}
  });
}};

/* ---------- 7) الأرقام (2048) ---------- */
ENG.g2048={noun:'الأرقام',icon:'🔢',cat:'puz',hint:'اسحب في أي اتجاه عشان تجمّع الأرقام المتشابهة. وصّل للهدف!',
params:i=>{const t=i>>3;return{size:t>=3?5:4,target:[128,256,512,1024,2048][t]}},
start(api,p){
  const N=p.size;let g=Array.from({length:N},()=>Array(N).fill(0));
  let score=0,over=false,won=false;
  function add(){const empty=[];for(let r=0;r<N;r++)for(let q=0;q<N;q++)if(!g[r][q])empty.push([r,q]);
    if(!empty.length)return;const[r,q]=pick(empty);g[r][q]=Math.random()<.9?2:4}
  add();add();
  const pad=10,cell=(LW-40-(N-1)*8)/N,ox=20,oy=110;
  const TCOL={2:'#3d2b6b',4:'#4a3585',8:'#00e5ff',16:'#00e676',32:'#c6ff00',64:'#ffb300',128:'#ff8f00',256:'#ff5252',512:'#ff2ea6',1024:'#7c4dff',2048:'#ffffff'};
  function slide(row){let a=row.filter(v=>v);for(let k=0;k<a.length-1;k++)if(a[k]===a[k+1]){a[k]*=2;score+=a[k];if(a[k]>=p.target&&!won){won=true}a.splice(k+1,1)}
    while(a.length<N)a.push(0);return a}
  function move(d){const before=JSON.stringify(g);
    const rot=a=>a[0].map((_,q)=>a.map(r=>r[q]));
    if(d==='u'){g=rot(rot(rot(g)));g=g.map(slide);g=rot(g)}
    if(d==='d'){g=rot(g);g=g.map(slide);g=rot(rot(rot(g)))}
    if(d==='l')g=g.map(slide);
    if(d==='r'){g=g.map(r=>slide(r.reverse()).reverse())}
    if(JSON.stringify(g)!==before){add();api.score(score);
      if(won){over=true;api.over(score+1000,'وصلت '+arN(p.target)+'! 🏆');return}
      let can=false;for(let r=0;r<N&&!can;r++)for(let q=0;q<N;q++){if(!g[r][q]||(r+1<N&&g[r][q]===g[r+1][q])||(q+1<N&&g[r][q]===g[r][q+1])){can=true;break}}
      if(!can){over=true;api.over(score,'مفيش حركة تانية 😅')}}}
  let sx=0,sy=0;
  api.on('pointerdown',e=>{const q=api.pos(e);sx=q.x;sy=q.y});
  api.on('pointerup',e=>{if(over)return;const q=api.pos(e);const dx=q.x-sx,dy=q.y-sy;
    if(Math.abs(dx)<20&&Math.abs(dy)<20)return;
    move(Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u'))});
  api.onKey(e=>{if(over)return;const m={ArrowUp:'u',ArrowDown:'d',ArrowLeft:'l',ArrowRight:'r'}[e.key];if(m){e.preventDefault();move(m)}});
  api.loop(()=>{
    const c=api.ctx;bgGrid(c);
    neonText(c,'الهدف: '+arN(p.target),LW/2,40,20,'#ffb300');
    neonText(c,'النقاط: '+arN(score),LW/2,74,17,'#00e5ff');
    for(let r=0;r<N;r++)for(let q=0;q<N;q++){const v=g[r][q];const x=ox+q*(cell+8),y=oy+r*(cell+8);
      c.save();rr(c,x,y,cell,cell,10);
      if(v){const col=TCOL[v]||'#fff';c.fillStyle=col;c.shadowColor=col;c.shadowBlur=v>=64?16:6;c.fill();
        c.shadowBlur=0;const dark=v<=4;neonText(c,arN(v),x+cell/2,y+cell/2,cell*(v>=1024?.26:v>=128?.34:.42),dark?'#f4efff':'#120a22',900)}
      else{c.fillStyle='rgba(124,77,255,.1)';c.fill()}
      c.restore()}
  });
}};

/* ---------- 8) الألغام ---------- */
ENG.mines={noun:'الألغام',icon:'💣',cat:'puz',hint:'دوس عشان تكشف المربع. فعّل وضع العلم 🚩 عشان تحط علم على لغم. اكشف كل المربعات الآمنة!',
params:i=>{const t=i>>3;return{rows:9+t,cols:6+(t>=2?2:0),mines:8+t*4+(i%4)}},
start(api,p){
  const R=p.rows,C=p.cols;const cell=Math.min((LW-16)/C,(LH-140)/R);
  const ox=(LW-cell*C)/2,oy=110;
  let grid=Array.from({length:R},()=>Array(C).fill(0).map(()=>({mine:false,open:false,flag:false,n:0})));
  let placed=false,revealed=0,total=R*C-p.mines,over=false,flagMode=false;
  function place(sr,sc2){let m=0;while(m<p.mines){const r=ri(0,R-1),q=ri(0,C-1);
      if(grid[r][q].mine||(Math.abs(r-sr)<=1&&Math.abs(q-sc2)<=1))continue;grid[r][q].mine=true;m++}
    for(let r=0;r<R;r++)for(let q=0;q<C;q++){let n=0;
      for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const nr=r+dr,nc=q+dc;
        if(nr>=0&&nr<R&&nc>=0&&nc<C&&grid[nr][nc].mine)n++}
      grid[r][q].n=n}}
  function open(r,q){if(r<0||r>=R||q<0||q>=C||grid[r][q].open||grid[r][q].flag)return;
    grid[r][q].open=true;
    if(grid[r][q].mine){over=true;api.score(revealed*10);api.over(revealed*10,'لغم! 💥','كشفت '+arN(revealed)+' مربع آمن');return}
    revealed++;api.score(revealed*10);
    if(grid[r][q].n===0){for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)open(r+dr,q+dc)}
    if(revealed>=total){over=true;api.over(revealed*10+500,'نظّفت الحقل! 🏆','مكافأة: ٥٠٠ نقطة')}}
  const flagBtn={x:LW-120,y:52,w:104,h:40,label:'🚩 وضع العلم',c:'#ffb300',fs:15};
  api.on('pointerdown',e=>{if(over)return;const q=api.pos(e);
    if(hit(flagBtn,q)){flagMode=!flagMode;return}
    const q2=Math.floor((q.x-ox)/cell),r=Math.floor((q.y-oy)/cell);
    if(r<0||r>=R||q2<0||q2>=C)return;
    if(!placed){place(r,q2);placed=true}
    if(flagMode){if(!grid[r][q2].open)grid[r][q2].flag=!grid[r][q2].flag}
    else open(r,q2)});
  api.loop(()=>{
    const c=api.ctx;bgGrid(c);
    neonText(c,'💣 '+arN(p.mines)+'   مفتوح: '+arN(revealed)+'/'+arN(total),LW/2,30,16,'#00e5ff');
    flagBtn.bg=flagMode?'rgba(255,179,0,.25)':'#221344';drawBtn(c,flagBtn);
    for(let r=0;r<R;r++)for(let q=0;q<C;q++){const s=grid[r][q];const x=ox+q*cell,y=oy+r*cell;
      c.save();rr(c,x+1,y+1,cell-2,cell-2,4);
      if(s.open){c.fillStyle=s.mine?'rgba(255,82,82,.3)':'rgba(124,77,255,.12)';c.fill();
        if(s.mine){c.font=cell*.55+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('💣',x+cell/2,y+cell/2)}
        else if(s.n>0){const cols=['','#00e5ff','#00e676','#ffb300','#ff2ea6','#ff5252','#7c4dff','#fff','#fff'];
          neonText(c,arN(s.n),x+cell/2,y+cell/2,cell*.5,cols[s.n],undefined,900)}}
      else{const g2=c.createLinearGradient(x,y,x+cell,y+cell);g2.addColorStop(0,'#2a1a52');g2.addColorStop(1,'#1a0f30');c.fillStyle=g2;c.fill();
        if(s.flag){c.font=cell*.5+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('🚩',x+cell/2,y+cell/2)}}
      c.restore()}
  });
}};

/* ---------- 9) إكس أو ---------- */
ENG.ttt={noun:'إكس أو',icon:'❌',cat:'puz',hint:'العب ضد الكمبيوتر. اللي يعمل خط كامل الأول يكسب!',
params:i=>{const t=i>>3;return{n:t<2?3:(t<4?4:5),k:t>=4?4:3,smart:.45+t*.13}},
start(api,p){
  const N=p.n,K=p.k;let g=Array.from({length:N},()=>Array(N).fill(''));
  let over=false,myTurn=true;
  const oy=90,cell=Math.min(90,(LW-40)/N),ox=(LW-cell*N)/2;
  function lines(){const out=[];
    for(let r=0;r<N;r++)for(let q=0;q<N;q++){
      if(q+K<=N)out.push(Array.from({length:K},(_,k)=>[r,q+k]));
      if(r+K<=N)out.push(Array.from({length:K},(_,k)=>[r+k,q]));
      if(r+K<=N&&q+K<=N)out.push(Array.from({length:K},(_,k)=>[r+k,q+k]));
      if(r+K<=N&&q-K+1>=0)out.push(Array.from({length:K},(_,k)=>[r+k,q-k]))}
    return out}
  const LS=lines();
  function winner(pl){return LS.some(l=>l.every(([r,q])=>g[r][q]===pl))}
  function full(){return g.every(r=>r.every(v=>v))}
  function aiMove(){const empt=[];for(let r=0;r<N;r++)for(let q=0;q<N;q++)if(!g[r][q])empt.push([r,q]);
    if(Math.random()<p.smart){
      for(const pl of ['O','X'])for(const[r,q]of empt){g[r][q]=pl;const w=winner(pl);g[r][q]='';if(w){g[r][q]='O';return}}
      const ctr=Math.floor(N/2);if(!g[ctr][ctr]){g[ctr][ctr]='O';return}}
    const[r,q]=pick(empt);g[r][q]='O'}
  function endCheck(){if(winner('X')){over=true;api.over(200,'كسبت الكمبيوتر! 🏆')}
    else if(winner('O')){over=true;api.over(0,'الكمبيوتر كسب 😅','حاول تاني')}
    else if(full()){over=true;api.over(60,'تعادل 🤝')}}
  api.on('pointerdown',e=>{if(over||!myTurn)return;const q=api.pos(e);
    const q2=Math.floor((q.x-ox)/cell),r=Math.floor((q.y-oy)/cell);
    if(r<0||r>=N||q2<0||q2>=N||g[r][q2])return;
    g[r][q2]='X';endCheck();
    if(!over){myTurn=false;setTimeout(()=>{if(api.dead)return;aiMove();myTurn=true;endCheck()},420)}});
  api.loop(()=>{
    const c=api.ctx;bgGrid(c);
    neonText(c,'انت ❌  —  الكمبيوتر ⭕',LW/2,34,18,'#b9a8e0');
    neonText(c,'وصّل '+arN(K)+' ورا بعض',LW/2,62,15,'#ffb300');
    for(let r=0;r<N;r++)for(let q=0;q<N;q++){const x=ox+q*cell,y=oy+r*cell;
      c.save();rr(c,x+3,y+3,cell-6,cell-6,10);c.fillStyle='rgba(124,77,255,.1)';c.fill();
      c.strokeStyle='rgba(124,77,255,.4)';c.stroke();
      if(g[r][q]==='X')neonText(c,'✕',x+cell/2,y+cell/2,cell*.55,'#00e5ff',undefined,900);
      if(g[r][q]==='O')neonText(c,'◯',x+cell/2,y+cell/2,cell*.55,'#ff2ea6',undefined,900);
      c.restore()}
  });
}};

/* ---------- 10) الطائر (فلابي) ---------- */
ENG.flappy={noun:'الطائر',icon:'🐦',cat:'arc',hint:'دوس عشان الطائر يطير. عدّي من بين المواسير من غير ما تخبط!',
params:i=>{const t=i>>3;return{gap:Math.max(120,160-t*10),speed:2.2+t*.4+(i%8)*.08,grav:.42+t*.04}},
start(api,p){
  let y=LH/2,vy=0,pipes=[],score=0,over=false,frame=0;
  const X=90;
  function flap(){if(!over)vy=-7.6}
  api.on('pointerdown',flap);
  api.onKey(e=>{if(e.key===' '||e.key==='ArrowUp')flap()});
  api.loop(dt=>{
    const c=api.ctx;bgGrid(c);
    if(!over){
      vy+=p.grav*dt/16;y+=vy*dt/16;frame++;
      if(frame%Math.round(90/p.speed)===0){const gh=rnd(90,LH-90-p.gap);pipes.push({x:LW+30,gh,passed:false})}
      pipes.forEach(pp=>{pp.x-=p.speed*dt/16;
        if(!pp.passed&&pp.x+30<X){pp.passed=true;score+=10;api.score(score)}});
      pipes=pipes.filter(pp=>pp.x>-60);
      if(y<10||y>LH-10){over=true}
      for(const pp of pipes){if(X+14>pp.x&&X-14<pp.x+52&&(y-12<pp.gh||y+12>pp.gh+p.gap)){over=true;break}}
      if(over){api.over(score,'خبطت! 💥','عدّيت '+arN(score/10)+' ماسورة')}
    }
    pipes.forEach(pp=>{c.fillStyle='#00e676';c.shadowColor='#00e676';c.shadowBlur=8;
      rr(c,pp.x,0,52,pp.gh,6);c.fill();rr(c,pp.x,pp.gh+p.gap,52,LH-pp.gh-p.gap,6);c.fill()});c.shadowBlur=0;
    c.save();c.translate(X,y);c.rotate(Math.max(-.4,Math.min(.6,vy*.05)));
    c.font='34px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('🐦',0,0);c.restore();
  });
}};

/* ---------- 11) العدّاء ---------- */
ENG.runner={noun:'العدّاء',icon:'🏃',cat:'arc',hint:'دوس عشان تنط فوق العوائق. شوف هتجري لحد فين!',
params:i=>{const t=i>>3;return{speed:5+t+(i%8)*.15,gap:Math.max(420,900-t*80)}},
start(api,p){
  const GY=LH-70;
  let y=GY,vy=0,onG=true,obs=[],score=0,over=false,dist=0,lastSpawn=0;
  api.on('pointerdown',()=>{if(!over&&onG){vy=-13;onG=false}});
  api.onKey(e=>{if((e.key===' '||e.key==='ArrowUp')&&onG&&!over){vy=-13;onG=false}});
  api.loop(dt=>{
    const c=api.ctx;bgGrid(c);
    if(!over){
      vy+=.65*dt/16;y+=vy*dt/16;
      if(y>=GY){y=GY;vy=0;onG=true}
      dist+=p.speed*dt/16;lastSpawn+=p.speed*dt/16*16;
      if(lastSpawn>p.gap*rnd(.8,1.3)){lastSpawn=0;const h=ri(26,58);obs.push({x:LW+30,w:ri(20,36),h})}
      obs.forEach(o=>o.x-=p.speed*dt/16);obs=obs.filter(o=>o.x>-50);
      score=Math.floor(dist/10);api.score(score);
      for(const o of obs){if(70+16>o.x&&70-16<o.x+o.w&&y+18>GY-o.h){over=true;api.over(score,'اتخبطت! 💥','جرِيت '+arN(score)+' متر');break}}
    }
    c.strokeStyle='#7c4dff';c.lineWidth=3;c.shadowColor='#7c4dff';c.shadowBlur=10;
    c.beginPath();c.moveTo(0,GY+20);c.lineTo(LW,GY+20);c.stroke();c.shadowBlur=0;
    obs.forEach(o=>{c.fillStyle='#ff2ea6';c.shadowColor='#ff2ea6';c.shadowBlur=8;rr(c,o.x,GY-o.h+18,o.w,o.h,4);c.fill()});c.shadowBlur=0;
    c.save();c.font='36px sans-serif';c.textAlign='center';c.fillText('🏃',70,y-8);c.restore();
    neonText(c,arN(score)+' م',LW-56,34,22,'#00e5ff');
  });
}};

/* ---------- 12) السلة ---------- */
ENG.catcher={noun:'السلة',icon:'🧺',cat:'arc',hint:'حرّك السلة والمست الفاكهة المتساقطة. بعيد عن القنابل! عندك ٣ قلوب',
params:i=>{const t=i>>3;return{fall:2.8+t*.6+(i%8)*.1,rate:Math.max(380,850-t*90),bad:.08+t*.05,lives:3}},
start(api,p){
  let bx=LW/2,items=[],score=0,lives=p.lives,over=false,spawn=0;
  const FR=['🍎','🍉','🍇','🍓','🍊','🍒','🥭','🍍'];
  api.on('pointermove',e=>{bx=Math.max(36,Math.min(LW-36,api.pos(e).x))});
  api.on('pointerdown',e=>{bx=Math.max(36,Math.min(LW-36,api.pos(e).x))});
  api.onKey(e=>{if(e.key==='ArrowLeft')bx=Math.max(36,bx-26);if(e.key==='ArrowRight')bx=Math.min(LW-36,bx+26)});
  api.loop(dt=>{
    const c=api.ctx;bgGrid(c);
    if(!over){
      spawn-=dt;
      if(spawn<=0){spawn=p.rate*rnd(.7,1.25);items.push({x:rnd(24,LW-24),y:-20,v:p.fall*rnd(.85,1.3),bad:Math.random()<p.bad,e:pick(FR)})}
      items.forEach(it=>it.y+=it.v*dt/16);
      items=items.filter(it=>{
        if(it.y>LH-56&&it.y<LH-20&&Math.abs(it.x-bx)<42){
          if(it.bad){lives--;if(lives<=0){over=true;api.over(score,'خلصت القلوب 💔')}}
          else{score+=10;api.score(score)}
          return false}
        return it.y<LH+30});
    }
    items.forEach(it=>{c.font='30px sans-serif';c.textAlign='center';c.fillText(it.bad?'💣':it.e,it.x,it.y)});
    c.save();c.font='44px sans-serif';c.textAlign='center';c.fillText('🧺',bx,LH-34);c.restore();
    neonText(c,'❤'.repeat(Math.max(0,lives)),44,28,18,'#ff2ea6','left');
    neonText(c,'⭐ '+arN(score),LW-56,28,18,'#ffb300');
  });
}};

/* ---------- 13) الحساب ---------- */
ENG.mathquiz={noun:'الحساب',icon:'➕',cat:'spd',hint:'جاوب على أكبر عدد مسائل قبل ما الوقت يخلص. إجابة صح = ١٠ نقط!',
params:i=>{const t=i>>3;return{time:40,range:8+t*10+(i%8)*4,ops:[['+'],['+','−'],['+','−','×'],['+','−','×'],['+','−','×','÷']][t]}},
start(api,p){
  let score=0,streak=0,left=p.time*1000,over=false,q=null,btns=[];
  function newQ(){const op=pick(p.ops);let a=ri(1,p.range),b=ri(1,p.range),ans;
    if(op==='+')ans=a+b;
    if(op==='−'){if(b>a)[a,b]=[b,a];ans=a-b}
    if(op==='×'){a=ri(2,Math.max(4,Math.floor(p.range/2)));b=ri(2,12);ans=a*b}
    if(op==='÷'){b=ri(2,12);ans=ri(2,12);a=b*ans}
    const opts=new Set([ans]);while(opts.size<4)opts.add(ans+ri(-10,10)+(Math.random()<.5?1:-1)*ri(0,3));
    const arr=[...opts].sort(()=>Math.random()-.5);
    btns=arr.map((v,idx)=>({x:40+(idx%2)*165,y:340+Math.floor(idx/2)*90,w:150,h:70,label:arN(v),v,c:'#7c4dff',fs:26}));
    q={a,b,op,ans}}
  newQ();
  api.on('pointerdown',e=>{if(over)return;const pt=api.pos(e);
    for(const b of btns)if(hit(b,pt)){
      if(b.v===q.ans){streak++;score+=10+Math.min(20,streak*2);api.score(score)}
      else{streak=0;score=Math.max(0,score-5);api.score(score)}
      newQ();break}});
  api.loop(dt=>{
    const c=api.ctx;bgGrid(c);
    if(!over){left-=dt;if(left<=0){over=true;api.over(score,'خلص الوقت! ⏰','سلسلة صح متتالية بتزوّد النقط')}}
    neonText(c,arN(q.a)+' '+q.op+' '+arN(q.b)+' = ؟',LW/2,220,46,'#f4efff',undefined,900);
    btns.forEach(b=>drawBtn(c,b));
    neonText(c,'⏱ '+arN(Math.ceil(left/1000)),LW-52,30,20,left<8000?'#ff5252':'#00e5ff');
    neonText(c,'⭐ '+arN(score),60,30,20,'#ffb300');
    if(streak>=3)neonText(c,'🔥 سلسلة ×'+arN(streak),LW/2,120,20,'#ff8f00');
  });
}};

/* ---------- 14) الهدف ---------- */
ENG.aim={noun:'الهدف',icon:'🎯',cat:'spd',hint:'دوس على الدوائر قبل ما تختفي! كل دقيقة بتحسب',
params:i=>{const t=i>>3;return{count:18+t*4+(i%4)*2,size:Math.max(24,48-t*5),life:Math.max(550,1300-t*140)}},
start(api,p){
  let spawned=0,hits=0,cur=null,over=false,startT=performance.now(),wait=400;
  api.on('pointerdown',e=>{if(over||!cur)return;const q=api.pos(e);
    if(Math.hypot(q.x-cur.x,q.y-cur.y)<p.size){hits++;api.score(hits*10);cur=null;wait=180;
      if(hits>=p.count){over=true;const secs=(performance.now()-startT)/1000;
        api.over(hits*10+Math.max(0,Math.round((p.count*1.2-secs)*5)),'هدّاف! 🎯','كل الأهداف في '+arN(Math.round(secs))+' ثانية')}}});
  api.loop(dt=>{
    const c=api.ctx;bgGrid(c);
    if(!over){
      if(!cur&&spawned<p.count){wait-=dt;if(wait<=0){cur={x:rnd(50,LW-50),y:rnd(120,LH-60),life:p.life};spawned++}}
      if(cur){cur.life-=dt;if(cur.life<=0){cur=null;wait=200;
        if(spawned>=p.count){over=true;api.over(hits*10,'خلصت الأهداف','صوّبت '+arN(hits)+'/'+arN(p.count))}}}
    }
    if(cur){const pr=cur.life/p.life;
      c.save();c.strokeStyle='#ff2ea6';c.lineWidth=3;c.shadowColor='#ff2ea6';c.shadowBlur=14;
      c.beginPath();c.arc(cur.x,cur.y,p.size,0,7);c.stroke();
      c.beginPath();c.arc(cur.x,cur.y,p.size*.6,0,7);c.stroke();
      c.fillStyle='#ff2ea6';c.beginPath();c.arc(cur.x,cur.y,5,0,7);c.fill();
      c.globalAlpha=.5;c.beginPath();c.arc(cur.x,cur.y,p.size*pr,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-pr));c.stroke();
      c.restore()}
    neonText(c,'🎯 '+arN(hits)+'/'+arN(p.count),LW/2,40,22,'#00e5ff');
  });
}};

/* ---------- 15) الخدعة (ستروب) ---------- */
ENG.stroop={noun:'الخدعة',icon:'🌈',cat:'spd',hint:'هل لون الخط مطابق لمعنى الكلمة؟ جاوب أيوه أو لأ بسرعة!',
params:i=>{const t=i>>3;return{rounds:10+t*2,time:Math.max(1200,2600-t*250)}},
start(api,p){
  const WORDS=[['أحمر','#ff5252'],['أزرق','#448aff'],['أخضر','#00e676'],['أصفر','#ffb300'],['وردي','#ff2ea6'],['بنفسجي','#7c4dff']];
  let round=0,score=0,cur=null,tLeft=0,over=false;
  function newR(){const w=pick(WORDS);const match=Math.random()<.5;
    const ink=match?w[1]:pick(WORDS.filter(x=>x[1]!==w[1]))[1];
    cur={word:w[0],ink,match};tLeft=p.time}
  newR();
  const yesB={x:40,y:420,w:145,h:80,label:'أيوه ✔',c:'#00e676',fs:24};
  const noB={x:215,y:420,w:145,h:80,label:'لأ ✖',c:'#ff5252',fs:24};
  function answer(saidYes){if(over)return;
    if(saidYes===cur.match){score+=10+Math.round(tLeft/200);api.score(score)}
    else score=Math.max(0,score-5);
    round++;
    if(round>=p.rounds){over=true;api.score(score);api.over(score,'خلصت الجولات! 🌈')}else newR()}
  api.on('pointerdown',e=>{const q=api.pos(e);
    if(hit(yesB,q))answer(true);else if(hit(noB,q))answer(false)});
  api.onKey(e=>{if(e.key==='ArrowRight')answer(true);if(e.key==='ArrowLeft')answer(false)});
  api.loop(dt=>{
    const c=api.ctx;bgGrid(c);
    if(!over){tLeft-=dt;if(tLeft<=0){score=Math.max(0,score-5);round++;if(round>=p.rounds){over=true;api.over(score,'خلصت الجولات! 🌈')}else newR()}}
    neonText(c,'جولة '+arN(round+1)+'/'+arN(p.rounds),LW/2,50,18,'#b9a8e0');
    neonText(c,'⭐ '+arN(score),LW/2,84,20,'#ffb300');
    neonText(c,cur.word,LW/2,230,64,cur.ink,undefined,900);
    const pr=Math.max(0,tLeft/p.time);
    c.fillStyle='rgba(124,77,255,.25)';rr(c,60,330,LW-120,10,5);c.fill();
    c.fillStyle=pr<.3?'#ff5252':'#00e5ff';rr(c,60,330,(LW-120)*pr,10,5);c.fill();
    drawBtn(c,yesB);drawBtn(c,noB);
  });
}};

/* ---------- 16) البازل ---------- */
ENG.slide={noun:'البازل',icon:'🧩',cat:'puz',hint:'حرّك المربعات جنب الفاضي لحد ما ترتّب الأرقام من ١',
params:i=>{const t=i>>3;return{size:t<2?3:(t<4?4:5)}},
start(api,p){
  const N=p.size;let tiles=[],empty=N*N-1,moves=0,over=false,startT=performance.now();
  for(let k=0;k<N*N;k++)tiles.push(k);
  do{
    for(let k=tiles.length-1;k>0;k--){const j=ri(0,k);[tiles[k],tiles[j]]=[tiles[j],tiles[k]]}
  }while(solved());
  function solved(){return tiles.slice(0,-1).every((v,idx)=>v===idx)}
  const cell=Math.min(96,(LW-40)/N),ox=(LW-cell*N)/2,oy=110;
  api.on('pointerdown',e=>{if(over)return;const q=api.pos(e);
    const q2=Math.floor((q.x-ox)/cell),r=Math.floor((q.y-oy)/cell);
    if(r<0||r>=N||q2<0||q2>=N)return;const idx=r*N+q2;
    const er=Math.floor(empty/N),ec=empty%N;
    if(Math.abs(er-r)+Math.abs(ec-q2)===1){[tiles[idx],tiles[empty]]=[tiles[empty],tiles[idx]];empty=idx;moves++;api.score(Math.max(0,1000-moves*3));
      if(solved()){over=true;const secs=(performance.now()-startT)/1000;const sc=Math.max(50,1200-moves*4-Math.round(secs)*2);
        api.over(sc,'البازل اتحل! 🧩','في '+arN(moves)+' حركة و'+arN(Math.round(secs))+' ثانية')}}});
  api.loop(()=>{
    const c=api.ctx;bgGrid(c);
    neonText(c,'الحركات: '+arN(moves),LW/2,44,20,'#00e5ff');
    for(let idx=0;idx<N*N;idx++){const v=tiles[idx];if(v===N*N-1)continue;
      const r=Math.floor(idx/N),q=idx%N;const x=ox+q*cell,y=oy+r*cell;
      const ok=v===idx;
      c.save();rr(c,x+3,y+3,cell-6,cell-6,10);
      c.fillStyle=ok?'rgba(0,230,118,.18)':'rgba(124,77,255,.16)';c.fill();
      c.strokeStyle=ok?'#00e676':'#7c4dff';c.lineWidth=1.5;c.stroke();
      neonText(c,arN(v+1),x+cell/2,y+cell/2,cell*.4,ok?'#00e676':'#f4efff',undefined,900);
      c.restore()}
  });
}};

/* ---------- 17) المتاهة ---------- */
ENG.maze={noun:'المتاهة',icon:'🌀',cat:'puz',hint:'اسحب أو استخدم الأسهم ووصّل الكورة للنجمة قبل ما الوقت يخلص!',
params:i=>{const t=i>>3;const cells=6+t*2+(i%8>=4?1:0);return{cells,time:cells*5}},
start(api,p){
  const N=p.cells;const cell=Math.min(34,(LW-30)/N,(LH-150)/N);
  const ox=(LW-cell*N)/2,oy=105;
  let walls=Array.from({length:N},()=>Array(N).fill(0).map(()=>({t:true,r:true})));
  (function gen(){const vis=Array.from({length:N},()=>Array(N).fill(false));
    const stack=[[0,0]];vis[0][0]=true;
    while(stack.length){const[r,q]=stack[stack.length-1];
      const nb=[];
      if(r>0&&!vis[r-1][q])nb.push([r-1,q,'t','b']);
      if(r<N-1&&!vis[r+1][q])nb.push([r+1,q,'b','t']);
      if(q>0&&!vis[r][q-1])nb.push([r,q-1,'l','r']);
      if(q<N-1&&!vis[r][q+1])nb.push([r,q+1,'r','l']);
      if(!nb.length){stack.pop();continue}
      const[nr,nc,side,oside]=pick(nb);
      if(side==='t')walls[r][q].t=false;if(side==='r')walls[r][q].r=false;
      if(side==='b')walls[nr][nc].t=false;if(side==='l')walls[nr][nc].r=false;
      vis[nr][nc]=true;stack.push([nr,nc])}})();
  let pr=0,pc=0,left=p.time*1000,over=false;
  function trymove(dr,dc){if(over)return;
    if(dr===-1&&walls[pr][pc].t)return;if(dc===1&&walls[pr][pc].r)return;
    if(dr===1&&(pr+1>=N||walls[pr+1][pc].t))return;if(dc===-1&&(pc-1<0||walls[pr][pc-1].r))return;
    pr+=dr;pc+=dc;
    if(pr===N-1&&pc===N-1){over=true;const sc=100+Math.round(left/100);
      api.score(sc);api.over(sc,'خرجت من المتاهة! 🌀','باقي '+arN(Math.ceil(left/1000))+' ثانية')}}
  let sx=0,sy=0;
  api.on('pointerdown',e=>{const q=api.pos(e);sx=q.x;sy=q.y});
  api.on('pointerup',e=>{const q=api.pos(e);const dx=q.x-sx,dy=q.y-sy;
    if(Math.abs(dx)<18&&Math.abs(dy)<18)return;
    if(Math.abs(dx)>Math.abs(dy))trymove(0,dx>0?1:-1);else trymove(dy>0?1:-1,0)});
  api.onKey(e=>{const m={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];if(m){e.preventDefault();trymove(m[0],m[1])}});
  api.loop(dt=>{
    const c=api.ctx;bgGrid(c);
    if(!over){left-=dt;if(left<=0){over=true;api.over(0,'الوقت خلص ⏰','المتاهة كسبت المرة دي')}}
    neonText(c,'⏱ '+arN(Math.ceil(left/1000)),LW/2,40,20,left<10000?'#ff5252':'#00e5ff');
    c.save();c.strokeStyle='#7c4dff';c.lineWidth=2.5;c.shadowColor='#7c4dff';c.shadowBlur=6;
    for(let r=0;r<N;r++)for(let q=0;q<N;q++){const x=ox+q*cell,y=oy+r*cell;
      if(walls[r][q].t){c.beginPath();c.moveTo(x,y);c.lineTo(x+cell,y);c.stroke()}
      if(walls[r][q].r){c.beginPath();c.moveTo(x+cell,y);c.lineTo(x+cell,y+cell);c.stroke()}}
    c.restore();
    c.strokeStyle='rgba(124,77,255,.5)';
    c.strokeRect(ox,oy,cell*N,cell*N);
    c.font=cell*.6+'px sans-serif';c.textAlign='center';c.textBaseline='middle';
    c.fillText('⭐',ox+(N-1)*cell+cell/2,oy+(N-1)*cell+cell/2);
    c.fillStyle='#00e5ff';c.shadowColor='#00e5ff';c.shadowBlur=12;
    c.beginPath();c.arc(ox+pc*cell+cell/2,oy+pr*cell+cell/2,cell*.3,0,7);c.fill();c.shadowBlur=0;
  });
}};

/* ---------- 18) البالون ---------- */
ENG.balloons={noun:'البالون',icon:'🎈',cat:'arc',hint:'فرقّع البلالين قبل ما تطير فوق! البلونة السودا قنبلة، متقربش منها',
params:i=>{const t=i>>3;return{time:35+t*2,rate:Math.max(320,760-t*80),bad:.06+t*.05,speed:1.6+t*.35}},
start(api,p){
  let bl=[],score=0,left=p.time*1000,over=false,spawn=0;
  const COLS=['#ff2ea6','#00e5ff','#ffb300','#00e676','#7c4dff','#ff5252'];
  api.on('pointerdown',e=>{if(over)return;const q=api.pos(e);
    bl.forEach(b=>{if(!b.pop&&Math.hypot(q.x-b.x,q.y-b.y)<34){b.pop=true;
      if(b.bad){score=Math.max(0,score-15)}else{score+=5}api.score(score)}})});
  api.loop(dt=>{
    const c=api.ctx;bgGrid(c);
    if(!over){
      left-=dt;spawn-=dt;
      if(spawn<=0){spawn=p.rate*rnd(.7,1.3);bl.push({x:rnd(30,LW-30),y:LH+40,v:p.speed*rnd(.8,1.4),bad:Math.random()<p.bad,c:pick(COLS),pop:false,ph:rnd(0,6)})}
      bl.forEach(b=>{b.y-=b.v*dt/16;b.x+=Math.sin(b.ph+b.y*.02)*.5});
      bl=bl.filter(b=>!b.pop&&b.y>-60);
      if(left<=0){over=true;api.over(score,'خلص الوقت! 🎈')}
    }
    bl.forEach(b=>{c.save();
      c.fillStyle=b.bad?'#1a1a1a':b.c;c.shadowColor=b.bad?'#ff5252':b.c;c.shadowBlur=b.bad?18:10;
      c.beginPath();c.ellipse(b.x,b.y,24,30,0,0,7);c.fill();c.shadowBlur=0;
      c.strokeStyle='rgba(255,255,255,.3)';c.beginPath();c.moveTo(b.x,b.y+30);c.lineTo(b.x,b.y+52);c.stroke();
      if(b.bad){c.font='18px sans-serif';c.textAlign='center';c.fillText('💣',b.x,b.y)}
      c.restore()});
    neonText(c,'⏱ '+arN(Math.ceil(left/1000)),LW-52,30,20,left<6000?'#ff5252':'#00e5ff');
    neonText(c,'⭐ '+arN(score),60,30,20,'#ffb300');
  });
}};

/* ---------- 19) المراوغ ---------- */
ENG.dodge={noun:'المراوغ',icon:'🛡️',cat:'arc',hint:'حرّك نفسك شمال ويمين واهرب من المكعبات النازلة. عيّش لآخر الوقت!',
params:i=>{const t=i>>3;return{time:18+t*4,speed:3+t*.7+(i%8)*.12,density:Math.max(300,640-t*70)}},
start(api,p){
  let px=LW/2,blocks=[],left=p.time*1000,over=false,spawn=0,won=false;
  api.on('pointermove',e=>{px=Math.max(18,Math.min(LW-18,api.pos(e).x))});
  api.on('pointerdown',e=>{px=Math.max(18,Math.min(LW-18,api.pos(e).x))});
  api.onKey(e=>{if(e.key==='ArrowLeft')px=Math.max(18,px-24);if(e.key==='ArrowRight')px=Math.min(LW-18,px+24)});
  api.loop(dt=>{
    const c=api.ctx;bgGrid(c);
    if(!over){
      left-=dt;spawn-=dt;
      if(spawn<=0){spawn=p.density*rnd(.6,1.2);blocks.push({x:rnd(16,LW-16),y:-20,s:p.speed*rnd(.8,1.35),w:ri(18,34)})}
      blocks.forEach(b=>b.y+=b.s*dt/16);blocks=blocks.filter(b=>b.y<LH+40);
      for(const b of blocks){if(Math.abs(b.x-px)<b.w/2+14&&Math.abs(b.y-(LH-70))<b.w/2+14){
        over=true;api.over(Math.round((p.time*1000-left)/100),'اتخبطت! 💥','عِشت '+arN(Math.round((p.time*1000-left)/1000))+' ثانية');break}}
      if(left<=0&&!over){over=true;won=true;api.over(p.time*10+100,'نجوت! 🛡️','عِشت الوقت كله')}
      api.score(Math.round((p.time*1000-left)/100));
    }
    blocks.forEach(b=>{c.fillStyle='#ff2ea6';c.shadowColor='#ff2ea6';c.shadowBlur=8;rr(c,b.x-b.w/2,b.y-b.w/2,b.w,b.w,5);c.fill()});c.shadowBlur=0;
    c.fillStyle='#00e5ff';c.shadowColor='#00e5ff';c.shadowBlur=14;
    c.beginPath();c.arc(px,LH-70,14,0,7);c.fill();c.shadowBlur=0;
    neonText(c,'⏱ '+arN(Math.ceil(left/1000)),LW/2,34,22,won?'#00e676':'#f4efff');
  });
}};

/* ---------- 20) البرج ---------- */
ENG.stack={noun:'البرج',icon:'🗼',cat:'arc',hint:'دوس في اللحظة المناسبة عشان تحط البلوك فوق اللي قبله. اللي يطلع برا يقع!',
params:i=>{const t=i>>3;return{speed:2+t*.5+(i%8)*.1,startW:130-t*8}},
start(api,p){
  let blocks=[{x:LW/2-p.startW/2,w:p.startW,y:LH-60}],cur=null,dir=1,height=0,over=false;
  const BH=26;
  function newCur(){const last=blocks[blocks.length-1];cur={x:-last.w,w:last.w,y:LH-60-(height+1)*BH};dir=1}
  newCur();
  function dropIt(){if(over||!cur)return;
    const last=blocks[blocks.length-1];
    const ox2=Math.max(cur.x,last.x),ex=Math.min(cur.x+cur.w,last.x+last.w);
    const nw=ex-ox2;
    if(nw<=4){over=true;api.over(height*10,'وقع! 😅','بنيت '+arN(height)+' دور');return}
    blocks.push({x:ox2,w:nw,y:cur.y});height++;api.score(height*10);
    if(cur.y<90){blocks.forEach(b=>b.y+=BH);cur.y+=BH}
    newCur()}
  api.on('pointerdown',dropIt);
  api.onKey(e=>{if(e.key===' ')dropIt()});
  api.loop(dt=>{
    const c=api.ctx;bgGrid(c);
    if(!over&&cur){cur.x+=dir*p.speed*dt/16*60/16*1.6;
      if(cur.x+cur.w>LW){cur.x=LW-cur.w;dir=-1}
      if(cur.x<0){cur.x=0;dir=1}}
    const cols=['#7c4dff','#00e5ff','#ff2ea6','#ffb300','#00e676'];
    blocks.forEach((b,idx)=>{const col=cols[idx%cols.length];c.fillStyle=col;c.shadowColor=col;c.shadowBlur=6;rr(c,b.x,b.y,b.w,BH-3,5);c.fill()});c.shadowBlur=0;
    if(cur&&!over){c.fillStyle='#f4efff';c.shadowColor='#fff';c.shadowBlur=12;rr(c,cur.x,cur.y,cur.w,BH-3,5);c.fill();c.shadowBlur=0}
    neonText(c,'الأدوار: '+arN(height),LW/2,34,22,'#00e5ff');
  });
}};

/* ---------- 21) الكورة (شُطّة) ---------- */
ENG.keepy={noun:'الكورة',icon:'⚽',cat:'arc',hint:'دوس على الكورة عشان تفضل طايرة في الهوا. لو وقعت الأرض تخسر!',
params:i=>{const t=i>>3;return{grav:.32+t*.05,r:Math.max(20,28-t*2),kick:8.5+t*.3}},
start(api,p){
  let x=LW/2,y=140,vx=rnd(-2,2),vy=0,kicks=0,over=false;
  const R=p.r;
  api.on('pointerdown',e=>{if(over)return;const q=api.pos(e);
    if(Math.hypot(q.x-x,q.y-y)<R+22){vy=-p.kick;vx=(x-q.x)*.14+rnd(-1,1);kicks++;api.score(kicks*10)}});
  api.loop(dt=>{
    const c=api.ctx;bgGrid(c);
    if(!over){
      vy+=p.grav*dt/16;x+=vx*dt/16;y+=vy*dt/16;
      if(x<R){x=R;vx*=-.8}if(x>LW-R){x=LW-R;vx*=-.8}
      if(y>LH-R-4){over=true;api.over(kicks*10,'وقعت! 😅',arN(kicks)+' شُطة في الهوا')}
    }
    c.strokeStyle='rgba(124,77,255,.5)';c.beginPath();c.moveTo(0,LH-4);c.lineTo(LW,LH-4);c.stroke();
    c.save();c.translate(x,y);c.rotate(x*.03);
    c.font=R*1.7+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('⚽',0,0);c.restore();
    neonText(c,'⚽ '+arN(kicks),LW/2,36,24,'#00e5ff');
  });
}};

/* ---------- 22) التخمين ---------- */
ENG.guess={noun:'التخمين',icon:'🔮',cat:'puz',hint:'خمّن الرقم السري. هقولك أعلى ولا أقل. كل محاولة أوفر = نقط أكتر!',
params:i=>{const t=i>>3;const range=[20,50,100,200,500][t];return{range,tries:Math.ceil(Math.log2(range))+2}},
start(api,p){
  const secret=ri(1,p.range);
  let input='',tries=p.tries,msg='خمّن رقم من ١ لـ'+arN(p.range),over=false;
  const keys=[];const layout=['1','2','3','4','5','6','7','8','9','مسح','0','تأكيد'];
  layout.forEach((k,idx)=>{keys.push({x:40+(idx%3)*110,y:330+Math.floor(idx/3)*62,w:100,h:52,label:arN(k)==='مسح'||k==='مسح'||k==='تأكيد'?k:arN(k),k,c:k==='تأكيد'?'#00e676':(k==='مسح'?'#ff5252':'#7c4dff'),fs:k.length>2?16:22})});
  api.on('pointerdown',e=>{if(over)return;const q=api.pos(e);
    for(const b of keys)if(hit(b,q)){
      if(b.k==='مسح')input='';
      else if(b.k==='تأكيد'){
        const v=parseInt(input||'0',10);
        if(!v||v<1||v>p.range){msg='اكتب رقم صحيح الأول 😉';input='';break}
        tries--;
        if(v===secret){const sc=(tries+1)*25;over=true;api.over(sc,'مظبوط! 🔮','الرقم كان '+arN(secret))}
        else if(tries<=0){over=true;api.over(0,'خلصت المحاولات 😅','الرقم كان '+arN(secret))}
        else msg=v<secret?'⬆️ أعلى من كده':'⬇️ أقل من كده';
        input='';
      }else if(input.length<4)input+=b.k;
      break}});
  api.loop(()=>{
    const c=api.ctx;bgGrid(c);
    neonText(c,'🔮 الرقم السري',LW/2,60,26,'#7c4dff',undefined,900);
    neonText(c,msg,LW/2,120,20,'#00e5ff');
    neonText(c,'محاولات: '+arN(tries),LW/2,160,17,'#ffb300');
    c.save();rr(c,100,200,200,60,12);c.fillStyle='#221344';c.fill();c.strokeStyle='#7c4dff';c.stroke();
    neonText(c,input?arN(input):'؟',LW/2,230,30,'#f4efff');c.restore();
    keys.forEach(b=>drawBtn(c,b));
  });
}};

/* ---------- 23) رد الفعل ---------- */
ENG.reaction={noun:'رد الفعل',icon:'⚡',cat:'spd',hint:'استنى لما الشاشة تخضّر ودوس بأسرع ما تقدر. متدوسش قبلها!',
params:i=>{const t=i>>3;return{rounds:5,minW:Math.max(500,1000-t*80),maxW:Math.max(1500,3000-t*200)}},
start(api,p){
  let state='wait',round=0,times=[],greenAt=0,waitTo=0,over=false,msg='دوس عشان تبدأ';
  api.on('pointerdown',()=>{if(over)return;
    if(state==='wait'){state='arming';msg='استنى الأخضر...';waitTo=rnd(p.minW,p.maxW)}
    else if(state==='arming'){state='wait';msg='بدري أوي! 😅 دوس تاني';times.push(999)}
    else if(state==='green'){const ms=Math.round(performance.now()-greenAt);times.push(ms);state='wait';msg=arN(ms)+' مللي ثانية!';api.score(Math.max(0,2000-avg()))}
    round=times.length;
    if(times.length>=p.rounds){over=true;const sc=Math.max(10,2000-avg());
      api.over(sc,'المتوسط: '+arN(avg())+' مللي ثانية ⚡','أقل متوسط = نقط أعلى')}});
  function avg(){return Math.round(times.reduce((a,b)=>a+b,0)/Math.max(1,times.length))}
  api.loop(dt=>{
    const c=api.ctx;
    if(state==='arming'){c.fillStyle='#3d1030';c.fillRect(0,0,LW,LH);waitTo-=dt;
      if(waitTo<=0){state='green';greenAt=performance.now()}}
    else if(state==='green'){c.fillStyle='#0b3d24';c.fillRect(0,0,LW,LH)}
    else bgGrid(c);
    if(state==='green')neonText(c,'دوس دلوقتي!! ⚡',LW/2,LH/2,34,'#00e676',undefined,900);
    else{neonText(c,msg,LW/2,LH/2-20,24,'#f4efff');
      neonText(c,'جولة '+arN(Math.min(times.length+1,p.rounds))+'/'+arN(p.rounds),LW/2,LH/2+40,18,'#b9a8e0');
      if(times.length)neonText(c,'المتوسط: '+arN(avg())+' مللي ثانية',LW/2,LH/2+80,17,'#ffb300')}
  });
}};

/* ---------- 24) المختلف ---------- */
ENG.oddone={noun:'المختلف',icon:'🔍',cat:'puz',hint:'لاقي الإيموجي المختلف عن الباقي ودوس عليه قبل ما الوقت يخلص!',
params:i=>{const t=i>>3;return{grid:Math.min(7,3+t+(i%8>=6?1:0)),rounds:12,time:Math.max(2000,4500-t*400)}},
start(api,p){
  const FACES=['😀','😎','🤪','😴','🤠','😺','🐶','🦊','🐸','🐵'];
  let round=0,score=0,grid=[],oddIdx=0,tLeft=0,over=false;
  function newR(){const base=pick(FACES);let diff=pick(FACES.filter(f=>f!==base));
    const n=p.grid*p.grid;grid=Array(n).fill(base);oddIdx=ri(0,n-1);grid[oddIdx]=diff;tLeft=p.time}
  newR();
  const cell=Math.min(60,(LW-40)/p.grid),ox=(LW-cell*p.grid)/2,oy=140;
  api.on('pointerdown',e=>{if(over)return;const q=api.pos(e);
    const q2=Math.floor((q.x-ox)/cell),r=Math.floor((q.y-oy)/cell);
    if(r<0||r>=p.grid||q2<0||q2>=p.grid)return;const idx=r*p.grid+q2;
    if(idx===oddIdx){score+=10+Math.round(tLeft/300);api.score(score);round++;
      if(round>=p.rounds){over=true;api.over(score,'عين صقر! 🔍')}else newR()}
    else{tLeft=Math.max(300,tLeft-600)}});
  api.loop(dt=>{
    const c=api.ctx;bgGrid(c);
    if(!over){tLeft-=dt;if(tLeft<=0){round++;
      if(round>=p.rounds){over=true;api.over(score,'خلصت الجولات','وصلت لجولة '+arN(round))}else newR()}}
    neonText(c,'جولة '+arN(round+1)+'/'+arN(p.rounds)+'   ⭐ '+arN(score),LW/2,44,19,'#00e5ff');
    const pr=Math.max(0,tLeft/p.time);
    c.fillStyle='rgba(124,77,255,.25)';rr(c,60,80,LW-120,8,4);c.fill();
    c.fillStyle=pr<.3?'#ff5252':'#00e676';rr(c,60,80,(LW-120)*pr,8,4);c.fill();
    c.font=cell*.55+'px sans-serif';c.textAlign='center';c.textBaseline='middle';
    grid.forEach((f,idx)=>{const r=Math.floor(idx/p.grid),q=idx%p.grid;
      c.fillText(f,ox+q*cell+cell/2,oy+r*cell+cell/2)});
  });
}};

/* ---------- 25) المدفع ---------- */
ENG.shooter={noun:'المدفع',icon:'👾',cat:'arc',hint:'دوس على الكائنات قبل ما توصل تحت! عندك ٣ قلوب',
params:i=>{const t=i>>3;return{speed:.55+t*.22+(i%8)*.04,spawn:Math.max(650,1350-t*130),lives:3}},
start(api,p){
  let foes=[],score=0,lives=p.lives,over=false,spawn=400;
  const AL=['👾','🛸','👽','🤖','🎃'];
  api.on('pointerdown',e=>{if(over)return;const q=api.pos(e);
    foes.forEach(f=>{if(!f.dead&&Math.hypot(q.x-f.x,q.y-f.y)<30){f.dead=true;score+=10;api.score(score)}})});
  api.loop(dt=>{
    const c=api.ctx;bgGrid(c);
    if(!over){
      spawn-=dt;
      if(spawn<=0){spawn=p.spawn*rnd(.7,1.25);foes.push({x:rnd(28,LW-28),y:-24,v:p.speed*rnd(.8,1.4),e:pick(AL),dead:false,ph:rnd(0,6)})}
      foes.forEach(f=>{f.y+=f.v*dt/16*60/16*2.2;f.x+=Math.sin(f.ph+f.y*.015)*.6});
      foes=foes.filter(f=>{
        if(f.y>LH-40&&!f.dead){lives--;if(lives<=0){over=true;api.over(score,'وصلوا الأرض! 👾','دمّرت '+arN(score/10))}
          return false}
        return!f.dead});
    }
    foes.forEach(f=>{c.font='34px sans-serif';c.textAlign='center';c.fillText(f.e,f.x,f.y)});
    c.save();c.strokeStyle='rgba(255,82,82,.5)';c.setLineDash([6,6]);c.beginPath();c.moveTo(0,LH-40);c.lineTo(LW,LH-40);c.stroke();c.restore();
    neonText(c,'❤'.repeat(Math.max(0,lives)),44,28,18,'#ff2ea6','left');
    neonText(c,'⭐ '+arN(score),LW-56,28,18,'#ffb300');
  });
}};

/* ================= قائمة الألف لعبة ================= */
const ENGINE_ORDER=['snake','pong','breakout','flappy','runner','catcher','balloons','dodge','stack','keepy','shooter','memory','g2048','mines','ttt','slide','maze','guess','oddone','simon','whack','aim','reaction','stroop','mathquiz'];
const GAMES=[];
ENGINE_ORDER.forEach((eid,ei)=>{
  const e=ENG[eid];
  for(let i=0;i<40;i++){
    GAMES.push({
      id:eid+'-'+i,num:GAMES.length+1,engine:eid,name:e.noun+' '+ADJ[i],icon:e.icon,cat:e.cat,
      tier:i>>3,pal:PAL[(i+ei*3)%PAL.length],p:e.params(i),hint:e.hint
    });
  }
});
const RECS=['snake-9','g2048-1','flappy-20','memory-4','breakout-25','whack-12','mines-16','ttt-0','runner-8','mathquiz-30','aim-14','maze-26','stack-22','oddone-6','shooter-35','pong-18'];

/* ================= واجهة الموقع ================= */
const app=$('#app');
let favs=store.get('favs',[]);
let recents=store.get('recents',[]);
let bests=store.get('best',{});
const state={q:'',cat:'all',tier:'all',view:'all'};
function byId(id){return GAMES.find(g=>g.id===id)}

function cardEl(g){
  const card=T('div');card.className='card';
  card.style.setProperty('--c1',g.pal[0]);card.style.setProperty('--c2',g.pal[1]);
  card.innerHTML='<button class="fav'+(favs.includes(g.id)?' on':'')+'" aria-label="مفضلة">'+(favs.includes(g.id)?'⭐':'☆')+'</button>'
    +'<div class="ic">'+g.icon+'</div>'
    +'<div class="nm">'+g.name+'</div>'
    +'<div class="meta"><span class="tier t'+g.tier+'">'+TIERS[g.tier]+'</span></div>'
    +'<div class="num">'+arN(g.num)+'</div>';
  card.addEventListener('click',e=>{
    if(e.target.classList.contains('fav')){toggleFav(g.id);e.target.classList.toggle('on');e.target.textContent=favs.includes(g.id)?'⭐':'☆';return}
    location.hash='#/g/'+g.id});
  return card;
}
function toggleFav(id){favs=favs.includes(id)?favs.filter(f=>f!==id):[...favs,id];store.set('favs',favs)}

function filterGames(){
  let list=GAMES;
  if(state.view==='fav')list=list.filter(g=>favs.includes(g.id));
  if(state.view==='recent')list=recents.map(byId).filter(Boolean);
  if(state.cat!=='all')list=list.filter(g=>g.cat===state.cat);
  if(state.tier!=='all')list=list.filter(g=>g.tier===+state.tier);
  if(state.q){const q=state.q.trim();list=list.filter(g=>g.name.includes(q))}
  return list;
}

function renderHome(){
  app.innerHTML='';
  const hero=T('div');hero.className='hero';
  hero.innerHTML='<div class="crown">👑</div><h1>أركيد الملك جوكر</h1>'
    +'<div class="sub">١٠٠٠ لعبة مختلفة في مكان واحد — العب أي لعبة في ثانية، من غير تحميل ولا تسجيل</div>'
    +'<div><span class="count">🎮 '+arN(1000)+' لعبة</span></div>';
  app.appendChild(hero);

  const quick=T('div');quick.className='quick';
  const row=T('div');row.className='row';
  const chips=[
    {k:'random',t:'🎲 لعبة عشوائية',act:()=>{location.hash='#/g/'+pick(GAMES).id}},
    {k:'recs',t:'👑 توصيات الملك',gold:true,act:()=>{const s=$('#recs');if(s)s.scrollIntoView({behavior:'smooth'})}},
    {k:'fav',t:'⭐ المفضلة',view:'fav'},
    {k:'recent',t:'🕒 لعبتها قبل كده',view:'recent'},
    {k:'all',t:'🎮 كل الألعاب',view:'all'},
  ];
  Object.keys(CATS).forEach(c=>chips.push({k:'cat-'+c,t:CATS[c],cat:c}));
  chips.forEach(ch=>{
    const b=T('button');b.className='chip'+(ch.gold?' gold':'');
    b.textContent=ch.t;
    const active=(ch.view&&state.view===ch.view&&!ch.cat)||(ch.cat&&state.cat===ch.cat)||(ch.view==='all'&&state.view==='all'&&state.cat==='all'&&!ch.cat);
    if(ch.cat?state.cat===ch.cat:(ch.view&&state.view===ch.view))b.classList.add('on');
    b.addEventListener('click',()=>{
      if(ch.act){ch.act();return}
      if(ch.cat){state.cat=state.cat===ch.cat?'all':ch.cat;state.view='all'}
      else if(ch.view){state.view=ch.view;if(ch.view==='all')state.cat='all'}
      renderHome()});
    row.appendChild(b)});
  quick.appendChild(row);
  const row2=T('div');row2.className='row';
  ['all',0,1,2,3,4].forEach(t=>{
    const b=T('button');b.className='chip'+(String(state.tier)===String(t)?' on':'');
    b.textContent=t==='all'?'كل المستويات':TIERS[t];
    b.addEventListener('click',()=>{state.tier=t;renderHome()});
    row2.appendChild(b)});
  quick.appendChild(row2);
  const sb=T('div');sb.className='searchbox';
  const inp=T('input');inp.type='search';inp.placeholder='🔍 دوّر على لعبة... (مثلا: الثعبان)';inp.value=state.q;
  inp.addEventListener('input',()=>{state.q=inp.value;renderGrid()});
  sb.appendChild(inp);quick.appendChild(sb);
  app.appendChild(quick);

  if(state.view==='all'&&!state.q&&state.cat==='all'&&state.tier==='all'){
    const sec=T('div');sec.className='section';sec.id='recs';
    sec.innerHTML='<div class="sec-title gold"><span class="bar"></span>توصيات الملك 👑 <small>أحلى ألعاب مختارة ليك</small></div>';
    const sc=T('div');sc.className='row';sc.style.cssText='display:flex;gap:12px;overflow-x:auto;padding:2px 14px 10px;scrollbar-width:none';
    RECS.forEach(id=>{const g=byId(id);if(!g)return;const cEl=cardEl(g);cEl.style.cssText='flex:0 0 168px';sc.appendChild(cEl)});
    sec.appendChild(sc);app.appendChild(sec);
  }

  const sec=T('div');sec.className='section';sec.id='gridsec';
  sec.innerHTML='<div class="sec-title"><span class="bar"></span><span id="gridlabel">كل الألعاب</span> <small id="gridcount"></small></div>';
  const grid=T('div');grid.className='grid';grid.id='grid';
  sec.appendChild(grid);app.appendChild(sec);
  const more=T('div');more.className='more-wrap';more.id='morewrap';app.appendChild(more);
  renderGrid();

  const foot=T('footer');
  foot.innerHTML='<span class="credit"><span class="cr">👑</span> فكرة وتنفيذ: الملك جوكر — العقل المدبر</span>'
    +'<div class="sig">أركيد الملك جوكر • '+arN(1000)+' لعبة • كل الألعاب بتشتغل في المتصفح مباشرة</div>';
  app.appendChild(foot);
}
let shown=0;
const PAGE=60;
function renderGrid(){
  const grid=$('#grid');if(!grid)return;
  const list=filterGames();
  shown=PAGE;
  grid.innerHTML='';
  const label=$('#gridlabel');
  if(label)label.textContent=state.view==='fav'?'⭐ المفضلة':state.view==='recent'?'🕒 لعبتها قبل كده':(state.cat!=='all'?CATS[state.cat]:'كل الألعاب');
  const cnt=$('#gridcount');if(cnt)cnt.textContent=arN(list.length)+' لعبة';
  if(!list.length){grid.innerHTML='<div class="empty" style="grid-column:1/-1"><div class="big">🎮</div>مفيش ألعاب هنا لسه — جرّب بحث تاني أو شوف كل الألعاب</div>';const mw=$('#morewrap');if(mw)mw.innerHTML='';return}
  list.slice(0,shown).forEach(g=>grid.appendChild(cardEl(g)));
  renderMore(list);
}
function renderMore(list){
  const mw=$('#morewrap');if(!mw)return;mw.innerHTML='';
  if(shown>=list.length)return;
  const b=T('button');b.className='btn';b.textContent='عرض المزيد ('+arN(list.length-shown)+' لعبة تانية) ⬇';
  b.addEventListener('click',()=>{
    const grid=$('#grid');shown+=PAGE;
    list.slice(0,shown).forEach((g,idx)=>{if(idx>=shown-PAGE)grid.appendChild(cardEl(g))});
    renderMore(list)});
  mw.appendChild(b);
}

/* ================= مشغّل اللعبة ================= */
let playerCleanup=null;
function renderPlayer(id){
  const g=byId(id);if(!g){location.hash='';return}
  if(playerCleanup)playerCleanup();
  recents=[id,...recents.filter(r=>r!==id)].slice(0,24);store.set('recents',recents);
  app.innerHTML='';
  const pl=T('div');pl.className='player';
  pl.innerHTML='<div class="top">'
    +'<button class="iconbtn" id="backbtn">→</button>'
    +'<div class="t"><div class="n">'+g.icon+' '+g.name+'</div><div class="d">'+CATS[g.cat]+' • '+TIERS[g.tier]+' • لعبة رقم '+arN(g.num)+'</div></div>'
    +'<button class="iconbtn" id="favbtn">'+(favs.includes(id)?'⭐':'☆')+'</button>'
    +'<button class="iconbtn" id="restartbtn">🔄</button>'
    +'</div>'
    +'<div class="stage"><div class="hud"><span class="pill">النقاط: <b id="hudscore">٠</b></span><span class="pill best">أعلى نتيجة: <b id="hudbest">'+arN(bests[id]||0)+'</b></span></div>'
    +'<div id="board"></div><div class="hint">'+g.hint+'</div></div>';
  app.appendChild(pl);
  $('#backbtn').addEventListener('click',()=>{location.hash=''});
  $('#restartbtn').addEventListener('click',()=>{renderPlayer(id)});
  $('#favbtn').addEventListener('click',e=>{toggleFav(id);e.target.textContent=favs.includes(id)?'⭐':'☆'});
  startEngine(g);
}
function startEngine(g){
  const board=$('#board');
  board.innerHTML='';
  const cv=T('canvas');
  const dpr=Math.min(2,window.devicePixelRatio||1);
  cv.width=LW*dpr;cv.height=LH*dpr;
  board.appendChild(cv);
  const ctx=cv.getContext('2d');ctx.scale(dpr,dpr);
  function fit(){const r=board.getBoundingClientRect();let h=r.height-14,w=h*2/3;
    if(w>r.width-14){w=r.width-14;h=w*1.5}
    cv.style.width=Math.max(200,w)+'px';cv.style.height=Math.max(300,h)+'px'}
  fit();window.addEventListener('resize',fit);

  const cleanups=[];let raf=0,dead=false,ended=false;
  const api={
    cv,ctx,W:LW,H:LH,dead:false,
    pos(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*LW,y:(e.clientY-r.top)/r.height*LH}},
    on(ev,fn,opt){cv.addEventListener(ev,fn,opt||{passive:false});cleanups.push(()=>cv.removeEventListener(ev,fn))},
    onKey(fn){window.addEventListener('keydown',fn);cleanups.push(()=>window.removeEventListener('keydown',fn))},
    loop(fn){let last=performance.now();
      const step=ts=>{if(dead)return;const dt=Math.min(50,ts-last);last=ts;fn(dt);raf=requestAnimationFrame(step)};
      raf=requestAnimationFrame(step)},
    score(n){const el=$('#hudscore');if(el)el.textContent=arN(n)},
    over(n,title,sub){if(ended)return;ended=true;endScreen(n,title,sub)}
  };
  Object.defineProperty(api,'dead',{get:()=>dead});
  const e2=ENG[g.engine];
  e2.start(api,g.p);

  const ov=T('div');ov.className='overlay';ov.id='startov';
  ov.innerHTML='<div class="big">'+g.icon+'</div><h2>'+g.name+'</h2><p>'+g.hint+'</p>'
    +'<button class="btn" id="playbtn">▶ ابدأ اللعب</button>';
  board.appendChild(ov);
  let started=false;
  $('#playbtn').addEventListener('click',()=>{started=true;ov.remove()});
  if(/[?&]auto=1/.test(location.href)){started=true;ov.remove()}

  function endScreen(n,title,sub){
    const prev=bests[g.id]||0;const isNew=n>prev;
    if(isNew){bests[g.id]=n;store.set('best',bests);const hb=$('#hudbest');if(hb)hb.textContent=arN(n)}
    const sc=$('#hudscore');if(sc)sc.textContent=arN(n);
    const next=byId(pick(RECS));
    const o=T('div');o.className='overlay';
    o.innerHTML='<div class="big">'+(n>0?'🏆':'😅')+'</div><h2>'+(title||'خلصت اللعبة')+'</h2>'
      +(isNew?'<span class="newbest">🏅 رقم قياسي جديد!</span>':'')
      +'<div class="score-line">نتيجتك: <b>'+arN(n)+'</b></div>'
      +(sub?'<p>'+sub+'</p>':'')
      +'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">'
      +'<button class="btn pink" id="againbtn">🔄 العب تاني</button>'
      +(next&&next.id!==g.id?'<button class="btn ghost" id="nextbtn">جرّب: '+next.icon+' '+next.name+'</button>':'')
      +'<button class="btn ghost" id="homebtn">🏠 كل الألعاب</button></div>';
    board.appendChild(o);
    $('#againbtn').addEventListener('click',()=>{renderPlayer(g.id)});
    const nb=$('#nextbtn');if(nb)nb.addEventListener('click',()=>{location.hash='#/g/'+next.id});
    $('#homebtn').addEventListener('click',()=>{location.hash=''});
  }
  playerCleanup=()=>{dead=true;cancelAnimationFrame(raf);cleanups.forEach(f=>f());window.removeEventListener('resize',fit);playerCleanup=null};
  cv.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
}

/* ================= الراوتر ================= */
function route(){
  const h=location.hash;
  if(h.startsWith('#/g/'))renderPlayer(h.slice(4));
  else{if(playerCleanup)playerCleanup();renderHome()}
}
window.addEventListener('hashchange',route);
route();

import { circularState, period, TAU, angularMeetings } from './circular-physics.js';

const $ = id => document.getElementById(id);
if ($('circular')) {
  const presets = {
    wheel: { title:'Rueda de bicicleta', mode:'mcu', radius:0.35, omega:6, alpha:0, theta:0 },
    fan: { title:'Ventilador', mode:'mcu', radius:0.6, omega:8, alpha:0, theta:1.57 },
    centrifuge: { title:'Centrifugadora', mode:'mcua', radius:0.25, omega:2, alpha:2, theta:0 },
    curve: { title:'Automóvil en una curva', mode:'mcu', radius:5, omega:1.4, alpha:0, theta:3.14 },
    custom: { title:'Experimento libre' }
  };
  const exercises = [
    { q:'Rapidez de un punto de la rueda', data:'Una rueda de radio 0,50 m gira con ω = 4,0 rad/s. ¿Cuál es su rapidez tangencial?', answer:2, unit:'m/s', hint:'Usa v = Rω.' },
    { q:'Aceleración centrípeta', data:'Un punto situado a 2,0 m del eje gira con ω = 3,0 rad/s. ¿Cuál es su aceleración centrípeta?', answer:18, unit:'m/s²', hint:'Usa aᶜ = Rω².' },
    { q:'Velocidad angular final', data:'Un disco parte con ω₀ = 2,0 rad/s y α = 1,5 rad/s². ¿Cuál es ω después de 4,0 s?', answer:8, unit:'rad/s', hint:'Usa ω = ω₀ + αt.' },
    { q:'Número de vueltas', data:'Un ventilador gira con ω = 2π rad/s durante 6,0 s. ¿Cuántas vueltas completa?', answer:6, unit:'vueltas', hint:'Calcula Δθ = ωt y divide por 2π.' }
  ];
  let mode='mcu', currentTime=0, playing=false, lastStamp=0, exerciseIndex=0;
  const fmt=(n,d=1)=>Number(n).toLocaleString('es-CL',{minimumFractionDigits:d,maximumFractionDigits:d});
  const num=id=>Number($(id).value);
  const params=()=>({radius:num('c-radius'),omega0:num('c-omega'),alpha:mode==='mcu'?0:num('c-alpha'),theta0:num('c-theta')});
  const encounter=()=>$('c-encounter').checked;
  const paramsB=()=>({radius:num('c-radius-b'),omega0:num('c-omega-b'),alpha:mode==='mcu'?0:num('c-alpha-b'),theta0:num('c-theta-b')});
  const duration=()=>num('c-duration');
  const ns='http://www.w3.org/2000/svg';
  const el=(name,attrs={})=>{const n=document.createElementNS(ns,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n};
  const line=(svg,x1,y1,x2,y2,stroke,width=2,dash='')=>{const n=el('line',{x1,y1,x2,y2,stroke,'stroke-width':width});if(dash)n.setAttribute('stroke-dasharray',dash);svg.append(n);return n};
  const textNode=(svg,x,y,text,cls='')=>{const n=el('text',{x,y,class:cls});n.textContent=text;svg.append(n);return n};
  function arrow(svg,x1,y1,x2,y2,color,width=3){
    line(svg,x1,y1,x2,y2,color,width).classList.add('c-arrow');
    const a=Math.atan2(y2-y1,x2-x1), size=9;
    const p=el('polyline',{points:`${x2-size*Math.cos(a-.55)},${y2-size*Math.sin(a-.55)} ${x2},${y2} ${x2-size*Math.cos(a+.55)},${y2-size*Math.sin(a+.55)}`,fill:'none',stroke:color,'stroke-width':width,class:'c-arrow'});svg.append(p);
  }
  function drawScene(state,p,stateB=null,pB=null){
    const svg=$('c-scene');svg.replaceChildren();const cx=425,cy=195,maxRadius=Math.max(p.radius,pB?.radius||0),rr=135*p.radius/maxRadius,rrB=pB?135*pB.radius/maxRadius:0;
    line(svg,235,cy,615,cy,'#e6dfed',1);line(svg,cx,35,cx,355,'#e6dfed',1);
    textNode(svg,608,cy-8,'+x','c-axis-label');textNode(svg,cx+8,48,'+y','c-axis-label');
    svg.append(el('circle',{cx,cy,r:rr,fill:'#f6f2fb',stroke:'#d9cde8','stroke-width':2}));
    if(pB)svg.append(el('circle',{cx,cy,r:rrB,fill:'none',stroke:'#df9a8b','stroke-width':2,'stroke-dasharray':'5 4',class:'c-ring-b'}));
    const angle=-state.theta,x=cx+rr*Math.cos(angle),y=cy+rr*Math.sin(angle);
    line(svg,cx,cy,x,y,'#8b70b7',2,'5 5');
    const arcR=42;
    const thetaRem=state.theta%TAU;
    const arcMag=Math.abs(thetaRem);
    const arcAngle=-thetaRem;
    const endX=cx+arcR*Math.cos(arcAngle),endY=cy+arcR*Math.sin(arcAngle);
    const sweep=thetaRem>=0?0:1;
    if(arcMag>.03){
      svg.append(el('path',{d:`M ${cx+arcR} ${cy} A ${arcR} ${arcR} 0 ${arcMag>Math.PI?1:0} ${sweep} ${endX} ${endY}`,fill:'none',stroke:'#9b84c0','stroke-width':2.5}));
      const mid=-thetaRem/2,labelR=arcR+18;
      textNode(svg,cx+labelR*Math.cos(mid)-4,cy+labelR*Math.sin(mid)-3,'θ','c-angle-label');
    }
    svg.append(el('circle',{cx,cy,r:5,fill:'#5a466d'}));svg.append(el('circle',{cx:x,cy:y,r:10,fill:'#dff28b',stroke:'#6c47d7','stroke-width':3}));
    textNode(svg,x+13,y-12,pB?'A':'P','c-point-label');textNode(svg,245,345,pB?`Rₐ = ${fmt(p.radius)} m · Rᵦ = ${fmt(pB.radius)} m`:`R = ${fmt(p.radius)} m`,'c-scene-note');
    if(stateB){
      const angleB=-stateB.theta,xB=cx+rrB*Math.cos(angleB),yB=cy+rrB*Math.sin(angleB),phase=Math.abs(Math.atan2(Math.sin(state.theta-stateB.theta),Math.cos(state.theta-stateB.theta)));
      if(phase<0.035)svg.append(el('circle',{cx:xB,cy:yB,r:17,class:'c-meeting-mark'}));
      svg.append(el('circle',{cx:xB,cy:yB,r:10,fill:'#ff9f87',stroke:'#8d4f59','stroke-width':3,class:'c-point-b'}));textNode(svg,xB+13,yB+19,'B','c-point-label');
      if($('c-vectors').checked){const signB=stateB.omega===0?1:Math.sign(stateB.omega),txB=Math.sin(angleB)*signB,tyB=-Math.cos(angleB)*signB,vLenB=Math.min(78,25+stateB.tangentialSpeed*5);arrow(svg,xB,yB,xB+txB*vLenB,yB+tyB*vLenB,'#c85e55',2.5)}
    }
    const tBaseX=Math.sin(angle),tBaseY=-Math.cos(angle);
    const rInX=(cx-x)/rr,rInY=(cy-y)/rr;
    if($('c-vectors').checked){
      const sign=state.omega===0?1:Math.sign(state.omega);
      const vLen=Math.min(92,28+state.tangentialSpeed*7);
      arrow(svg,x,y,x+tBaseX*sign*vLen,y+tBaseY*sign*vLen,'#138f91',3);
      const acLen=Math.min(88,20+state.centripetalAcceleration*2.5);
      arrow(svg,x,y,x+rInX*acLen,y+rInY*acLen,'#6c47d7',3);
      if(Math.abs(state.tangentialAcceleration)>.01){
        const atSign=Math.sign(state.tangentialAcceleration),atLen=Math.min(75,24+Math.abs(state.tangentialAcceleration)*7);
        arrow(svg,x,y,x+tBaseX*atSign*atLen,y+tBaseY*atSign*atLen,'#e46e62',3);
      }
    }
    if($('c-total-acc').checked && state.totalAcceleration>.01){
      const ax=rInX*state.centripetalAcceleration+tBaseX*state.tangentialAcceleration;
      const ay=rInY*state.centripetalAcceleration+tBaseY*state.tangentialAcceleration;
      const amag=Math.hypot(ax,ay);
      const totalLen=Math.min(105,30+amag*3);
      arrow(svg,x,y,x+(ax/amag)*totalLen,y+(ay/amag)*totalLen,'#202637',4);
      textNode(svg,x+(ax/amag)*totalLen+7,y+(ay/amag)*totalLen-5,'a','c-total-label');
    }
    const T=period(state.omega);textNode(svg,580,326,Number.isFinite(T)?`T instantáneo = ${fmt(T,2)} s`:'T no definido (ω = 0)','c-scene-note');
  }
  function drawChart(id,fn,color,fnB=null,yLabel=""){
    const svg=$(id);svg.replaceChildren();const W=290,H=185,m={l:39,r:10,t:12,b:29},D=duration(),points=[];
    for(let i=0;i<=100;i++){const t=D*i/100;points.push([t,fn(t)])}
    const allValues=fnB?[...points.map(p=>p[1]),...points.map(p=>fnB(p[0]))]:points.map(p=>p[1]);let ymin=Math.min(0,...allValues),ymax=Math.max(0,...allValues);if(ymax-ymin<1){ymax+=.5;ymin-=.5}const pad=(ymax-ymin)*.08;ymax+=pad;ymin-=pad;
    const X=t=>m.l+t/D*(W-m.l-m.r),Y=v=>m.t+(ymax-v)/(ymax-ymin)*(H-m.t-m.b);
    line(svg,m.l,Y(0),W-m.r,Y(0),'#ded7e6',1);line(svg,m.l,m.t,m.l,H-m.b,'#ded7e6',1);
    for(let i=0;i<=4;i++){const t=D*i/4;line(svg,X(t),m.t,X(t),H-m.b,'#f0ebf4',1);textNode(svg,X(t)-5,H-9,fmt(t,0),'c-axis-label')}
    textNode(svg,W-31,H-9,'t (s)','c-axis-label');textNode(svg,3,m.t+5,fmt(ymax,1),'c-axis-label');textNode(svg,3,H-m.b,fmt(ymin,1),'c-axis-label');
    if(yLabel){const yl=textNode(svg,11,(m.t+H-m.b)/2,yLabel,'c-axis-label');yl.setAttribute('text-anchor','middle');yl.setAttribute('transform',`rotate(-90 11 ${(m.t+H-m.b)/2})`);}
    const d=points.map((p,i)=>`${i?'L':'M'}${X(p[0])},${Y(p[1])}`).join(' ');svg.append(el('path',{d,fill:'none',stroke:color,'stroke-width':2.5}));
    if(fnB){const bPoints=points.map(([t])=>[t,fnB(t)]),dB=bPoints.map((p,i)=>`${i?'L':'M'}${X(p[0])},${Y(p[1])}`).join(' ');svg.append(el('path',{d:dB,fill:'none',stroke:'#d66e63','stroke-width':2,'stroke-dasharray':'5 4'}));svg.append(el('circle',{cx:X(currentTime),cy:Y(fnB(currentTime)),r:4,fill:'#d66e63',stroke:'#fff','stroke-width':2}))}
    const val=fn(currentTime);line(svg,X(currentTime),m.t,X(currentTime),H-m.b,'#b9afc2',1,'3 3');svg.append(el('circle',{cx:X(currentTime),cy:Y(val),r:4.5,fill:color,stroke:'#fff','stroke-width':2}));
    svg.onclick=e=>{const r=svg.getBoundingClientRect();currentTime=Math.max(0,Math.min(D,((e.clientX-r.left)/r.width*W-m.l)/(W-m.l-m.r)*D));playing=false;update()};
  }
  function update(){
    const p=params(),s=circularState(p,currentTime),pB=encounter()?paramsB():null,sB=pB?circularState(pB,currentTime):null;$('c-time').value=currentTime;$('c-clock').textContent=fmt(currentTime,2);
    $('c-metric-theta').innerHTML=`${fmt(s.theta,2)} <small>rad</small>`;$('c-metric-omega').innerHTML=`${fmt(s.omega,2)} <small>rad/s</small>`;$('c-metric-v').innerHTML=`${fmt(s.tangentialSpeed,2)} <small>m/s</small>`;$('c-metric-ac').innerHTML=`${fmt(s.centripetalAcceleration,2)} <small>m/s²</small>`;$('c-metric-at').innerHTML=`${fmt(s.tangentialAcceleration,2)} <small>m/s²</small>`;$('c-metric-turns').textContent=fmt(s.turns,2);
    drawScene(s,p,sB,pB);drawChart('c-chart-theta',t=>circularState(p,t).theta,'#6c47d7',pB?t=>circularState(pB,t).theta:null,'θ (rad)');drawChart('c-chart-omega',t=>circularState(p,t).omega,'#138f91',pB?t=>circularState(pB,t).omega:null,'ω (rad/s)');drawChart('c-chart-alpha',()=>p.alpha,'#e46e62',pB?()=>pB.alpha:null,'α (rad/s²)');
    const sense=s.omega>0?'antihorario':s.omega<0?'horario':'detenido en este instante';$('c-observation-text').textContent=`El punto se mueve en sentido ${sense}. v = R|ω| = ${fmt(s.tangentialSpeed,2)} m/s y aᶜ = Rω² = ${fmt(s.centripetalAcceleration,2)} m/s².${mode==='mcua'?` La aceleración tangencial es aᵗ = Rα = ${fmt(s.tangentialAcceleration,2)} m/s².`:''}`;
    const summary=$('c-meeting-summary');summary.hidden=!pB;
    if(pB){
      const meetings=angularMeetings(p,pB,duration()),sameRadius=Math.abs(p.radius-pB.radius)<1e-9,label=sameRadius?'encuentro espacial':'coincidencia angular';
      const times=meetings.continuous?'Coinciden angularmente durante todo el intervalo.':meetings.times.length?meetings.times.map(t=>`<button type="button" data-meeting-time="${t}">${fmt(t,2)} s</button>`).join(' · '):'No hay coincidencias en el intervalo.';
      summary.innerHTML=`<strong>${sameRadius?'Encuentros':'Alineaciones radiales'}:</strong> ${times}<br><span>A: θ = ${fmt(s.theta,2)} rad, ω = ${fmt(s.omega,2)} rad/s · B: θ = ${fmt(sB.theta,2)} rad, ω = ${fmt(sB.omega,2)} rad/s. ${sameRadius?'Como los radios son iguales, la coincidencia angular es un encuentro real.':'Con radios diferentes los móviles se alinean con el centro, pero no ocupan el mismo punto.'}</span>`;
      summary.setAttribute('aria-label',label);
    }
    $('c-play').textContent=playing?'Pausar':'Iniciar rotación';
  }
  function setMode(next){mode=next;const isMCUA=mode==='mcua';$('c-mode-mcu').classList.toggle('selected',!isMCUA);$('c-mode-mcua').classList.toggle('selected',isMCUA);$('c-mode-mcu').setAttribute('aria-pressed',String(!isMCUA));$('c-mode-mcua').setAttribute('aria-pressed',String(isMCUA));$('c-alpha-control').classList.toggle('disabled',!isMCUA);$('c-alpha').disabled=!isMCUA;$('c-alpha-b-row').classList.toggle('disabled',!isMCUA);$('c-alpha-b').disabled=!isMCUA;$('c-mode-description').textContent=isMCUA?'Aceleración angular constante; la velocidad angular cambia.':'Velocidad angular constante; aceleración angular nula.';$('c-equation').textContent=isMCUA?'θ(t) = θ₀ + ω₀t + ½αt²':'θ(t) = θ₀ + ω₀t';$('c-omega-equation').textContent=isMCUA?'ω(t) = ω₀ + αt':'ω(t) = ω₀';update()}
  function applyPreset(key){const p=presets[key];if(key!=='custom'){setMode(p.mode);$('c-radius').value=p.radius;$('c-omega').value=p.omega;$('c-alpha').value=p.alpha;$('c-theta').value=p.theta}$('c-scene-title').textContent=p.title;currentTime=0;playing=false;refreshLabels();update()}
  function refreshLabels(){$('c-radius-value').textContent=`${fmt(num('c-radius'))} m`;$('c-omega-value').textContent=`${fmt(num('c-omega'))} rad/s`;$('c-alpha-value').textContent=`${fmt(num('c-alpha'))} rad/s²`;$('c-theta-value').textContent=`${fmt(num('c-theta'),1)} rad`;$('c-time').max=duration();$('c-time-end').textContent=`${duration()} s`;if(currentTime>duration())currentTime=duration()}
  function tick(stamp){if(playing){if(!lastStamp)lastStamp=stamp;currentTime+=(stamp-lastStamp)/1000*num('c-speed');if(currentTime>=duration()){currentTime=duration();playing=false}lastStamp=stamp;update()}else lastStamp=0;requestAnimationFrame(tick)}
  function showExercise(){const e=exercises[exerciseIndex];$('c-question').textContent=e.q;$('c-question-data').textContent=e.data;$('c-answer-unit').textContent=e.unit;$('c-answer-input').value='';$('c-feedback').hidden=true}
  $('c-check').onclick=()=>{const e=exercises[exerciseIndex],v=Number($('c-answer-input').value),ok=Number.isFinite(v)&&Math.abs(v-e.answer)<=Math.max(.01,Math.abs(e.answer)*.015);const f=$('c-feedback');f.hidden=false;f.className=`feedback ${ok?'good':'retry'}`;f.textContent=ok?`¡Correcto! ${fmt(e.answer,2)} ${e.unit}.`:`Aún no. ${e.hint}`};
  $('c-next').onclick=()=>{exerciseIndex=(exerciseIndex+1)%exercises.length;showExercise()};$('c-mode-mcu').onclick=()=>setMode('mcu');$('c-mode-mcua').onclick=()=>setMode('mcua');$('c-preset').onchange=e=>applyPreset(e.target.value);
  for(const id of ['c-radius','c-omega','c-alpha','c-theta','c-duration'])$(id).oninput=()=>{if(id!=='c-duration')$('c-preset').value='custom';refreshLabels();update()};
  for(const id of ['c-radius-b','c-theta-b','c-omega-b','c-alpha-b'])$(id).oninput=update;
  $('c-encounter').onchange=()=>{$('c-mobile-b').hidden=!encounter();$('c-scene-title').textContent=encounter()?'Encuentro de dos móviles':presets[$('c-preset').value].title;currentTime=0;playing=false;update()};
  $('c-meeting-summary').onclick=e=>{const button=e.target.closest('[data-meeting-time]');if(button){currentTime=Number(button.dataset.meetingTime);playing=false;update()}};
  $('c-vectors').onchange=update;$('c-total-acc').onchange=update;$('c-time').oninput=e=>{currentTime=Number(e.target.value);playing=false;update()};$('c-play').onclick=()=>{if(currentTime>=duration())currentTime=0;playing=!playing;update()};$('c-reset').onclick=()=>{currentTime=0;playing=false;update()};
  document.querySelectorAll('[data-go-circular]').forEach(b=>b.onclick=()=>$('circular').scrollIntoView({behavior:'smooth'}));
  refreshLabels();setMode('mcu');applyPreset('wheel');showExercise();requestAnimationFrame(tick);
}

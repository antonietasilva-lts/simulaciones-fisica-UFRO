
(() => {
  const $ = id => document.getElementById(id);
  const F = (x,d=1) => Number(x).toFixed(d).replace(".",",");
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  let mode = "up", timer = null;

  function model(){
    const y0 = +$("vertY0").value || 0;
    const v0 = mode === "fall" ? 0 : (+$("vertV0").value || 0);
    const g = +$("vertGravity").value || 9.81;
    const disc = Math.max(0, v0*v0 + 2*g*y0);
    const tf = (v0 + Math.sqrt(disc))/g;
    const tapex = v0 > 0 ? v0/g : 0;
    const hmax = y0 + (v0 > 0 ? v0*v0/(2*g) : 0);
    return {y0,v0,g,tf,tapex,hmax};
  }

  function state(t){
    const m=model();
    t=clamp(t,0,m.tf);
    return {
      ...m,t,
      y:Math.max(0,m.y0+m.v0*t-.5*m.g*t*t),
      vy:m.v0-m.g*t,
      ay:-m.g
    };
  }

  function arrow(ctx,x1,y1,x2,y2,color,label){
    const ang=Math.atan2(y2-y1,x2-x1),head=10;
    ctx.save();
    ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2,y2);
    ctx.lineTo(x2-head*Math.cos(ang-Math.PI/6),y2-head*Math.sin(ang-Math.PI/6));
    ctx.lineTo(x2-head*Math.cos(ang+Math.PI/6),y2-head*Math.sin(ang+Math.PI/6));
    ctx.closePath();ctx.fill();
    if(label){
      ctx.font="bold 15px Arial";ctx.fillText(label,x2+8,y2-5);
    }
    ctx.restore();
  }

  function drawScene(s){
    const c=$("verticalCanvas"),q=c.getContext("2d"),w=c.width,h=c.height;
    q.clearRect(0,0,w,h);

    // background
    const sky=q.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,"#c9e7ff"); sky.addColorStop(.78,"#eef7ff"); sky.addColorStop(.781,"#b9d69b");
    q.fillStyle=sky;q.fillRect(0,0,w,h);
    q.fillStyle="#8e9776";q.fillRect(0,h-54,w,54);

    const top=Math.max(12,s.hmax*1.18,s.y0*1.18);
    const yPix=y=>h-56-(y/top)*(h-92);

    // axis/ruler
    q.strokeStyle="#7d89ad";q.lineWidth=1.5;
    q.beginPath();q.moveTo(75,25);q.lineTo(75,h-54);q.stroke();
    q.font="12px Arial";q.fillStyle="#4c577f";q.textAlign="right";
    for(let i=0;i<=5;i++){
      const val=top*i/5, yy=yPix(val);
      q.strokeStyle="#cad1e5";q.beginPath();q.moveTo(75,yy);q.lineTo(w-25,yy);q.stroke();
      q.fillStyle="#4c577f";q.fillText(F(val,1)+" m",66,yy+4);
    }
    q.save();q.translate(23,h/2);q.rotate(-Math.PI/2);q.textAlign="center";
    q.font="bold 13px Arial";q.fillStyle="#263376";q.fillText("altura y (m)",0,0);q.restore();

    // initial height
    const iy=yPix(s.y0);
    q.setLineDash([6,5]);q.strokeStyle="#8e97b7";q.beginPath();q.moveTo(76,iy);q.lineTo(w-55,iy);q.stroke();q.setLineDash([]);
    q.fillStyle="#69739d";q.textAlign="left";q.font="12px Arial";q.fillText("y₀",w-48,iy+4);

    // apex line for upward launch
    if(mode==="up" && s.hmax>s.y0+.01){
      const hy=yPix(s.hmax);
      q.setLineDash([7,5]);q.strokeStyle="#8d74ee";q.beginPath();q.moveTo(76,hy);q.lineTo(w-55,hy);q.stroke();q.setLineDash([]);
      q.fillStyle="#624bd1";q.fillText("h máx",w-53,hy+4);
    }

    // object
    const bx=w*.52, by=yPix(s.y);
    q.shadowColor="#0004";q.shadowBlur=9;q.shadowOffsetY=5;
    q.fillStyle="#ee3f4e";q.beginPath();q.arc(bx,by,15,0,Math.PI*2);q.fill();
    q.shadowColor="transparent";
    q.fillStyle="#fff";q.beginPath();q.arc(bx-5,by-5,4,0,Math.PI*2);q.fill();

    // vectors
    if($("vertShowV").checked && Math.abs(s.vy)>.08){
      const len=Math.min(95,28+Math.abs(s.vy)*2.5);
      const dy=s.vy>0?-len:len;
      arrow(q,bx+24,by,bx+24,by+dy,"#2474e8","vᵧ");
    }
    if($("vertShowA").checked){
      arrow(q,bx-24,by,bx-24,by+62,"#ee3f4e","aᵧ");
    }

    // ground label
    q.fillStyle="#fff";q.font="bold 12px Arial";q.textAlign="left";
    q.fillText("y = 0",90,h-20);
  }

  function plot(canvas,xs,ys,idx,ylabel,color){
    const q=canvas.getContext("2d"),w=canvas.width,h=canvas.height,L=62,R=15,T=14,B=46;
    q.clearRect(0,0,w,h);q.fillStyle="#fff";q.fillRect(0,0,w,h);
    let ymin=Math.min(...ys), ymax=Math.max(...ys);
    ymin=Math.min(ymin,0);ymax=Math.max(ymax,0);
    if(Math.abs(ymax-ymin)<1e-9){ymin-=1;ymax+=1}
    const pad=(ymax-ymin)*.12;ymin-=pad;ymax+=pad;
    const xmin=0,xmax=xs.at(-1)||1;
    const X=x=>L+(x-xmin)/(xmax-xmin||1)*(w-L-R);
    const Y=y=>T+(ymax-y)/(ymax-ymin)*(h-T-B);

    q.font="11px Arial";q.lineWidth=1;
    for(let i=0;i<=4;i++){
      const yy=T+i*(h-T-B)/4,val=ymax-i*(ymax-ymin)/4;
      q.strokeStyle="#e7eaf4";q.beginPath();q.moveTo(L,yy);q.lineTo(w-R,yy);q.stroke();
      q.fillStyle="#35406f";q.textAlign="right";q.textBaseline="middle";q.fillText(Number(val.toFixed(1)),L-6,yy);
    }
    for(let i=0;i<=4;i++){
      const xx=L+i*(w-L-R)/4,val=xmax*i/4;
      q.strokeStyle="#f0f2f8";q.beginPath();q.moveTo(xx,T);q.lineTo(xx,h-B);q.stroke();
      q.fillStyle="#35406f";q.textAlign="center";q.textBaseline="top";q.fillText(Number(val.toFixed(1)),xx,h-B+6);
    }
    q.strokeStyle="#9aa3c7";q.lineWidth=1.2;
    q.beginPath();q.moveTo(L,h-B);q.lineTo(w-R,h-B);q.moveTo(L,T);q.lineTo(L,h-B);q.stroke();

    q.strokeStyle=color;q.lineWidth=2.5;q.beginPath();
    ys.forEach((y,i)=>{const xx=X(xs[i]),yy=Y(y);i?q.lineTo(xx,yy):q.moveTo(xx,yy)});
    q.stroke();

    if(idx!=null){
      const i=clamp(idx,0,xs.length-1);
      q.fillStyle=color;q.beginPath();q.arc(X(xs[i]),Y(ys[i]),4.5,0,Math.PI*2);q.fill();
    }

    q.fillStyle="#263376";q.font="bold 11px Arial";
    q.textAlign="center";q.textBaseline="alphabetic";q.fillText("t (s)",(L+w-R)/2,h-5);
    q.save();q.translate(13,(T+h-B)/2);q.rotate(-Math.PI/2);q.fillText(ylabel,0,0);q.restore();
  }

  function redraw(t){
    const s=state(t);
    $("vertTime").max=s.tf || .01;
    $("vertTime").value=s.t;
    $("vertTimeText").textContent=F(s.t,2);
    $("vertY").textContent=F(s.y)+" m";
    $("vertVy").textContent=F(s.vy)+" m/s";
    $("vertHmax").textContent=F(s.hmax)+" m";
    $("vertTapex").textContent=mode==="up" ? F(s.tapex,2)+" s" : "—";
    $("vertFlight").textContent=F(s.tf,2)+" s";
    $("vertGravityText").textContent="aᵧ = −g = −"+F(s.g,2)+" m/s²";
    $("vertAy").textContent="−"+F(s.g,2)+" m/s²";

    drawScene(s);

    const N=260,xs=[],ys=[],vs=[],as=[];
    for(let i=0;i<=N;i++){
      const tt=s.tf*i/N,ss=state(tt);
      xs.push(tt);ys.push(ss.y);vs.push(ss.vy);as.push(-s.g);
    }
    const idx=Math.round((s.tf ? s.t/s.tf : 0)*N);
    plot($("vertYGraph"),xs,ys,idx,"y (m)","#6c52dc");
    plot($("vertVGraph"),xs,vs,idx,"vᵧ (m/s)","#2474e8");
    plot($("vertAGraph"),xs,as,idx,"aᵧ (m/s²)","#ee3f4e");

    let msg;
    if(mode==="fall"){
      msg = s.t<.02
        ? "El objeto parte desde el reposo. La gravedad hará que vᵧ se vuelva cada vez más negativa."
        : "Durante la caída, vᵧ es negativa y su magnitud aumenta. La aceleración permanece constante: aᵧ = −g.";
    }else if(Math.abs(s.vy)<.2){
      msg="En la altura máxima, vᵧ = 0 solo en ese instante; la aceleración sigue siendo aᵧ = −g.";
    }else if(s.vy>0){
      msg="El objeto sube: vᵧ es positiva, pero disminuye linealmente porque aᵧ = −g.";
    }else{
      msg="El objeto baja: vᵧ es negativa y su magnitud aumenta mientras aᵧ permanece constante hacia abajo.";
    }
    $("vertObservation").textContent=msg;
  }

  function stop(){if(timer){clearInterval(timer);timer=null}}
  function play(){
    stop();
    const rate=+$("vertSpeed").value||1;
    const current=+$("vertTime").value||0;
    const start=Date.now()-current*1000/rate;
    timer=setInterval(()=>{
      const tf=model().tf;
      let t=(Date.now()-start)/1000*rate;
      if(t>=tf){t=tf;stop()}
      redraw(t);
    },30);
  }

  function setMode(next){
    stop(); mode=next;
    const up=mode==="up";
    $("vertUpMode").classList.toggle("selected",up);
    $("vertFallMode").classList.toggle("selected",!up);
    $("vertV0Control").classList.toggle("disabled",!up);
    $("vertV0").disabled=!up;
    if(up){
      $("vertY0").value=0;
      $("vertV0").value=20;
    }else{
      $("vertY0").value=30;
      $("vertV0").value=0;
    }
    redraw(0);
  }

  $("vertUpMode").onclick=()=>setMode("up");
  $("vertFallMode").onclick=()=>setMode("fall");
  $("vertPlay").onclick=play;
  $("vertPause").onclick=stop;
  $("vertReset").onclick=()=>{stop();redraw(0)};
  $("vertTime").oninput=e=>{stop();redraw(+e.target.value)};
  $("vertY0").oninput=()=>{stop();redraw(0)};
  $("vertV0").oninput=()=>{stop();redraw(0)};
  $("vertGravity").onchange=()=>{stop();redraw(0)};
  $("vertShowV").onchange=()=>redraw(+$("vertTime").value||0);
  $("vertShowA").onchange=()=>redraw(+$("vertTime").value||0);

  redraw(0);
})();

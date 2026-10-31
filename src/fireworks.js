const rnd=(a,b)=>a+Math.random()*(b-a);
const COLS=[[255,200,60],[255,90,60],[255,60,160],[90,200,255],[130,255,140],[200,120,255],[255,255,255]];
export function createFireworks(canvas,{onLaunch,onBurst,onPop,onFountain}={}){
 const g=canvas.getContext('2d');let W,H,P=[],R=[],FT=[],raf;
 const size=()=>{const d=Math.min(devicePixelRatio||1,2);W=canvas.clientWidth;H=canvas.clientHeight;canvas.width=W*d;canvas.height=H*d;g.setTransform(d,0,0,d,0,0)};
 size();const ro=new ResizeObserver(size);ro.observe(canvas);
 function burst(x,y,o={}){const kind=o.kind||['peony','ring','willow','crackle'][rnd(0,4)|0],base=COLS[rnd(0,7)|0],n=o.n||70,sp=o.sp||1;
  for(let i=0;i<n;i++){const a=kind==='ring'?i/n*6.283:rnd(0,6.283),s=(kind==='ring'?4:rnd(1,kind==='willow'?4:6.5))*sp;
   P.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,decay:rnd(.008,.02)*(kind==='willow'?.5:1),c:Math.random()<.3?COLS[rnd(0,7)|0]:base,g:kind==='willow'?.05:.07,tw:kind==='crackle'})}
  if(!o.quiet&&onBurst)onBurst(kind)}
 const launch=(x,tx,ty)=>{R.push({x,y:H,vx:(tx-x)/55,vy:(ty-H)/55,n:55});onLaunch&&onLaunch()};
 const pop=(x,y)=>{burst(x,y,{n:18,kind:'crackle',sp:.5,quiet:1});onPop&&onPop()};
 const fountain=(x,n=150)=>{FT.push({x,n});onFountain&&onFountain()};
 (function frame(){raf=requestAnimationFrame(frame);if(document.hidden)return;
  g.globalCompositeOperation='destination-out';g.fillStyle='rgba(0,0,0,.2)';g.fillRect(0,0,W,H);g.globalCompositeOperation='lighter';
  FT=FT.filter(q=>{for(let i=0;i<6;i++)P.push({x:q.x+rnd(-4,4),y:H-4,vx:rnd(-1.3,1.3),vy:-rnd(5,9.5),life:1,decay:rnd(.014,.026),c:Math.random()<.6?[255,190,70]:[255,120,40],g:.13,tw:Math.random()<.4});return --q.n>0});
  R=R.filter(r=>{r.x+=r.vx;r.y+=r.vy;P.push({x:r.x,y:r.y,vx:rnd(-.3,.3),vy:rnd(0,.6),life:1,decay:.06,c:[255,170,60],g:0});if(--r.n<=0){burst(r.x,r.y,{n:rnd(60,100)|0});return false}return true});
  P=P.filter(p=>{p.vx*=.98;p.vy=p.vy*.98+p.g;p.x+=p.vx;p.y+=p.vy;p.life-=p.decay;if(p.life<=0)return false;const a=p.life*(p.tw&&Math.random()<.5?.2:1);g.fillStyle=`rgba(${p.c[0]},${p.c[1]},${p.c[2]},${a})`;g.beginPath();g.arc(p.x,p.y,1.8,0,6.283);g.fill();return true})})();
 return{launch,burst,pop,fountain,size:()=>[W,H],destroy:()=>{cancelAnimationFrame(raf);ro.disconnect()}}}

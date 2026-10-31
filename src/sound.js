// Synthesised sound effects (Web Audio) - no audio files needed
let ctx,noise,muted=localStorage.getItem('muted')==='1';
const AC=window.AudioContext||window.webkitAudioContext;
const c=()=>{if(!ctx&&AC){ctx=new AC();const b=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;noise=b}return ctx};
export const isReady=()=>!!ctx&&ctx.state==='running';
export const unlock=()=>{const x=c();return x?x.resume():Promise.resolve()};
export const isMuted=()=>muted;
export const setMuted=m=>{muted=m;localStorage.setItem('muted',m?'1':'0')};
let active=false;export const setActive=v=>{active=v};
const ok=()=>active&&!muted&&isReady();
const env=(g,t,d,v)=>{g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.01+d)};
function tone(type,f1,f2,d,v,delay=0){const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+d);env(g,t,d,v);o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+d+.1)}
function hiss(d,v,f,type='lowpass',delay=0,f2){const t=ctx.currentTime+delay,s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+d);env(g,t,d,v);s.connect(fl).connect(g).connect(ctx.destination);s.start(t);s.stop(t+d+.1)}
export const sfx={
 launch(){if(!ok())return;hiss(.18,.35,1500,'highpass');tone('sawtooth',500,2400,.9,.035);tone('sine',700,3200,.9,.05);hiss(.9,.22,900,'bandpass',0,4500)},
 boom(v=1){if(!ok())return;hiss(.12,.7*v,7000,'highpass');tone('sine',150,30,.7,.55*v);hiss(.6,.4*v,1600,'lowpass',0,150);for(let i=0;i<10;i++)hiss(.025,.12*v,5000,'highpass',.12+Math.random()*.7)},
 crackle(){if(!ok())return;for(let i=0;i<16;i++)hiss(.03,.25,4500,'highpass',.1+Math.random()*1)},
 flowerPot(d=2.6){if(!ok())return;const t=ctx.currentTime,s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;s.loop=true;f.type='bandpass';f.Q.value=.8;f.frequency.setValueAtTime(1800,t);f.frequency.linearRampToValueAtTime(3600,t+d*.6);f.frequency.linearRampToValueAtTime(2200,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.28,t+.2);g.gain.setValueAtTime(.28,t+d-.5);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f).connect(g).connect(ctx.destination);s.start(t);s.stop(t+d+.1);for(let i=0;i<40;i++)hiss(.02,.22,5500,'highpass',.2+Math.random()*(d-.3))},
 pop(){if(!ok())return;hiss(.09,.7,6000,'highpass');tone('sine',200,50,.1,.3)},
 tick(){if(!ok())return;tone('triangle',900,600,.07,.12)},
 open(){if(!ok())return;hiss(.25,.15,800,'bandpass',0,3000);tone('sine',660,990,.2,.12,.05)},
 coin(){if(!ok())return;tone('triangle',988,988,.1,.15);tone('triangle',1319,1319,.3,.15,.09);sfx.pop()},
 fanfare(){if(!ok())return;[523,659,784,1047].forEach((f,i)=>tone('triangle',f,f,.5,.14,i*.13));sfx.boom(1.2)}
};

import React,{forwardRef,useEffect,useImperativeHandle,useRef} from 'react';
import {createFireworks} from './fireworks.js';
import {sfx} from './sound.js';
const FireworksCanvas=forwardRef(function FireworksCanvas({ambient=false,vol=.3},ref){
 const cv=useRef(),fx=useRef();
 useImperativeHandle(ref,()=>({launch:(...a)=>fx.current.launch(...a),burst:(...a)=>fx.current.burst(...a),pop:(...a)=>fx.current.pop(...a),fountain:(...a)=>fx.current.fountain(...a),size:()=>fx.current.size(),rect:()=>cv.current.getBoundingClientRect()}),[]);
 useEffect(()=>{let t,last=0;
  fx.current=createFireworks(cv.current,{
   onLaunch:()=>{if(vol>=.5)sfx.launch()},
   onBurst:k=>{const n=performance.now();if(n-last>70){last=n;
    // Play different sounds based on burst kind
    if(k==='crackle'){sfx.crackle()}
    else if(k==='willow'){sfx.boom(vol*.8)}
    else if(k==='ring'){sfx.skyShot&&sfx.skyShot(1)}
    else{sfx.boom(vol)}
   }},
   onPop:()=>{if(vol>=.5)sfx.pop()},
   onFountain:()=>{if(vol>=.5)sfx.flowerPot()}});
  if(ambient){const tick=()=>{if(!document.hidden){const[W,H]=fx.current.size(),x=W*(.3+Math.random()*.65);fx.current.launch(x,x+(Math.random()-.5)*80,H*(.08+Math.random()*.35))}t=setTimeout(tick,1500+Math.random()*1800)};tick()}
  return()=>{clearTimeout(t);fx.current.destroy()}},[]);
 return <canvas ref={cv} className="fx"/>});
export default FireworksCanvas;

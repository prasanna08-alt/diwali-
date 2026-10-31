import React,{useEffect,useRef,useState} from 'react';
import FireworksCanvas from './FireworksCanvas.jsx';
import {sfx,unlock,setActive} from './sound.js';
export default function Intro({onDone}){
 const fx=useRef(),[live,setLive]=useState(false),[out,setOut]=useState(false),[]=useState(0);
 useEffect(()=>{
  document.body.style.overflow='hidden';setActive(true);unlock();
  const T=[],at=(ms,f)=>T.push(setTimeout(f,ms)),F=()=>fx.current,r=Math.random;
  const up=()=>{const[W,H]=F().size();const x=W*(.15+r()*.7);F().launch(x,x+(r()-.5)*120,H*(.12+r()*.35))};
  const ground=()=>{const[W,H]=F().size();F().pop(W*(.05+r()*.9),H*(.9+r()*.08))};
  [[.22,200],[.5,1500],[.78,2700]].forEach(([p,ms])=>at(ms,()=>{const[W]=F().size();F().fountain(W*p)}));
  for(let i=0;i<13;i++)at(300+i*290,up);
  for(let i=0;i<14;i++)at(500+i*250,ground);
  at(3900,()=>{setLive(true);sfx.fanfare();for(let i=0;i<9;i++)at2(i*130)});
  const at2=ms=>at(3900+ms,()=>{const[W,H]=F().size();F().burst(W*(.1+r()*.8),H*(.15+r()*.4),{n:110})});
  at(7000,()=>setOut(true));at(7900,onDone);
  const unl=()=>unlock();
  addEventListener('pointerdown',unl,{once:true});addEventListener('keydown',unl,{once:true});
  return()=>{T.forEach(clearTimeout);document.body.style.overflow='';setActive(false);removeEventListener('pointerdown',unl);removeEventListener('keydown',unl)}},[]);
 return <div className={'intro'+(out?' out':'')}><FireworksCanvas ref={fx} vol={1}/>
  {live&&<div className="intro-live"><small>🪔 HAPPY DIWALI 🪔</small><h1>Diwali <em>Sale</em></h1><h2>is LIVE!</h2><p>Up to 50% OFF on Crackers</p></div>}
  <button className="intro-skip" onClick={onDone}>Skip ›</button></div>}

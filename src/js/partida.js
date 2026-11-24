const $=s=>document.querySelector(s);
const SU=['♠','♥','♦','♣'], RK={11:'J',12:'Q',13:'K',14:'A'};
const TC={Fuego:'#e5532d',Agua:'#3b8fe8',Planta:'#4cae4f','Eléctrico':'#f5c518',Normal:'#9aa0a6'};
const POOL=[['Pikachu','Eléctrico',70],['Charmander','Fuego',78],['Squirtle','Agua',88],['Bulbasaur','Planta',90],['Meowth','Normal',80]];
const STRONG={Fuego:['Planta'],Agua:['Fuego'],Planta:['Agua'],'Eléctrico':['Agua']};
const WEAK={Fuego:['Agua','Fuego'],Agua:['Agua','Planta'],Planta:['Fuego','Planta'],'Eléctrico':['Planta','Eléctrico']};
const eff=(a,d)=>(STRONG[a]||[]).includes(d)?2:(WEAK[a]||[]).includes(d)?.5:1;
// [nombre, multiplicador, dinero]
const H=[['Carta alta',1,1],['Pareja',1.25,1],['Doble pareja',1.5,1],['Trío',1.75,1],['Escalera',2,2],['Color',2,2],['Full',2.5,3],['Póker',3,3],['Escalera de color',4,3],['Escalera real',6,4]];
const AFILADO=[1,2,3,6,7];
const JOK=[['Descarte extra','Común',2,'+1 descarte por turno','#9aa5b8'],['Mano grande','Común',2,'Empiezas con 8 cartas','#9aa5b8'],['Monedero','Común',2,'+1$ por cada mano jugada','#9aa5b8'],['Afilado','Común',2,'+20% con pareja, doble, trío, full y póker','#9aa5b8'],
 ['Tormenta','Raro',5,'Golpea a todo el equipo rival al 50%','#40d6e0'],['Ojo de tipo','Raro',5,'Ignora resistencias (x0.5 pasa a x1)','#40d6e0'],
 ['Carta comodín','Mítico',8,'Una carta cuenta como la que quieras (pendiente)','#a855f7'],['Segunda oportunidad','Mítico',8,'Un Pokémon sobrevive con 1 de vida, una vez','#a855f7']];
const UPG=[['Coraza',4,'+25% de vida máxima'],['Afinidad',4,'+25% de daño de ese Pokémon'],['Vampirismo',4,'Se cura el 10% del daño que hace'],['Reflejos',4,'Recibe un 15% menos de daño']];

const mk=p=>({n:p[0],t:p[1],hp:p[2],max:p[2],up:1,vamp:0,red:0,upg:false});
const P=['Tú','Rival_07','Rival_12','Rival_23'].map((n,i)=>({n,i,money:2,team:POOL.map(mk),jk:[],out:false,sel:0,second:true}));
let G={cur:0,round:1,deck:[],hand:[],sel:new Set(),disc:2,phase:'idle',offers:[],upgN:0,pending:null,busy:false};

/* ---------- utilidades ---------- */
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2200)};
const has=(p,n)=>p.jk.some(j=>j[0]===n);
const alive=p=>p.team.map((x,i)=>x.hp>0?i:-1).filter(i=>i>=0);
function newDeck(){const d=[];for(let s=0;s<4;s++)for(let v=2;v<=14;v++)d.push({v,s});for(let i=d.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[d[i],d[j]]=[d[j],d[i]]}return d}
const draw=n=>{const r=[];while(n--){if(!G.deck.length)G.deck=newDeck();r.push(G.deck.pop())}return r};

/* ---------- evaluación de manos ---------- */
function straight(cs){const m={};cs.forEach(c=>{m[c.v]=m[c.v]||c;if(c.v==14)m[1]=m[1]||c});
 for(let h=14;h>=5;h--)if([0,1,2,3,4].every(i=>m[h-i]))return[0,1,2,3,4].map(i=>m[h-i]);return null}
function evaluate(cs){
 if(!cs.length)return null;
 const g={},bs={};cs.forEach(c=>{(g[c.v]=g[c.v]||[]).push(c);(bs[c.s]=bs[c.s]||[]).push(c)});
 const gs=Object.values(g).sort((a,b)=>b.length-a.length||b[0].v-a[0].v);
 const fc=Object.values(bs).find(a=>a.length>=5),sf=fc&&straight(fc),st=straight(cs);
 let i,k;
 if(sf){i=sf[0].v==14&&sf[4].v==10?9:8;k=sf}
 else if(gs[0].length>=4){i=7;k=gs[0].slice(0,4)}
 else if(gs[0].length==3&&gs[1]&&gs[1].length>=2){i=6;k=[...gs[0],...gs[1].slice(0,2)]}
 else if(fc){i=5;k=[...fc].sort((a,b)=>b.v-a.v).slice(0,5)}
 else if(st){i=4;k=st}
 else if(gs[0].length==3){i=3;k=gs[0]}
 else if(gs[0].length==2&&gs[1]&&gs[1].length==2){i=2;k=[...gs[0],...gs[1]]}
 else if(gs[0].length==2){i=1;k=gs[0]}
 else{i=0;k=[gs[0][0]]}
 return{i,cards:k,sum:k.reduce((a,c)=>a+c.v,0),name:H[i][0],mult:H[i][1],money:H[i][2]}}

function calc(ai,hand,ti,tj){
 const a=P[ai],at=a.team[a.sel],tg=P[ti].team[tj];
 let e=eff(at.t,tg.t);if(has(a,'Ojo de tipo')&&e<1)e=1;
 let d=hand.sum*hand.mult*e*at.up*(1-tg.red);
 if(has(a,'Afilado')&&AFILADO.includes(hand.i))d*=1.2;
 return{d:Math.round(d),e}}

function hit(ti,tj,d){
 const o=P[ti],t=o.team[tj];t.hp-=d;
 if(t.hp<=0){if(has(o,'Segunda oportunidad')&&o.second){o.second=false;t.hp=1}else t.hp=0}
 const el=document.querySelector(`.pk[data-p="${ti}"][data-i="${tj}"]`);
 if(el){const s=document.createElement('div');s.className='pop';s.textContent='-'+d;el.appendChild(s);setTimeout(()=>s.remove(),1000)}}

function attack(ai,hand,ti,tj){
 const a=P[ai],at=a.team[a.sel],{d,e}=calc(ai,hand,ti,tj);
 hit(ti,tj,d);
 if(at.vamp)at.hp=Math.min(at.max,at.hp+d*.1);
 if(has(a,'Tormenta'))alive(P[ti]).filter(j=>j!==tj).forEach(j=>hit(ti,j,Math.round(d/2)));
 a.money+=hand.money+(has(a,'Monedero')?1:0);
 if(!alive(P[ti]).length)P[ti].out=true;
 const ef=e>1?' · ¡Muy eficaz!':e<1?' · Poco eficaz':'';
 return`${a.n}: ${at.n} usa ${hand.name} sobre ${P[ti].team[tj].n} (-${d})${ef}`}

/* ---------- render ---------- */
const pk=(pi,i)=>{const x=P[pi].team[i];return`<div class="pk ${x.hp<=0?'dead':''} ${x.upg?'upg':''} ${pi==0&&P[0].sel==i?'sel':''}" data-p="${pi}" data-i="${i}" style="--c:${TC[x.t]}"><b>${x.n[0]}</b><span>${x.n}</span><small>${Math.ceil(x.hp)}</small><i><u style="width:${100*x.hp/x.max}%"></u></i></div>`};
function render(){
 for(let p=1;p<4;p++){const r=P[p];$('#rv'+p).className='rv'+(G.cur==p?' act':'')+(r.out?' out':'');
  $('#rv'+p).innerHTML=`<h3>${r.n}<em>$${r.money}</em></h3><div class="team">${r.team.map((_,i)=>pk(p,i)).join('')}</div>`}
 $('#miEquipo').innerHTML=P[0].team.map((_,i)=>pk(0,i)).join('');
 $('#miJk').innerHTML=P[0].jk.map(j=>`<s>${j[0]}</s>`).join('')||'<small style="color:var(--mut)">Sin comodines</small>';
 $('#ronda').textContent='Ronda '+G.round;
 $('#turno').textContent=G.cur==0?'Tu turno':'Turno de '+P[G.cur].n;
 $('#dinero').textContent='$'+P[0].money;$('#deckN').textContent=G.deck.length;
 const mine=G.cur==0&&!G.busy&&!P[0].out;
 $('#bJugar').disabled=!mine||!G.sel.size;$('#bAuto').disabled=!mine;$('#bDesc').disabled=!mine||!G.sel.size||G.disc<1;
 $('#bDesc').textContent=`Descartar (${G.disc})`}
function renderHand(){
 $('#hand').innerHTML=G.hand.map((c,i)=>`<button class="cd ${c.s%2?'r':''} ${G.sel.has(i)?'on':''}" data-c="${i}" style="--i:${i};--rot:${(i-3)*4}deg"><b>${RK[c.v]||c.v}</b><span>${SU[c.s]}</span></button>`).join('')}
function preview(){
 const ev=evaluate([...G.sel].map(i=>G.hand[i]));
 if(!ev){$('#mano').textContent='Elige tus cartas';$('#info').textContent='Selecciona hasta 5 cartas para formar tu mano.';return}
 $('#mano').textContent=ev.name;
 $('#info').textContent=`Suma ${ev.sum} × mult. ${ev.mult} = ${Math.round(ev.sum*ev.mult)} de daño base · +${ev.money}$`}

/* ---------- mi turno ---------- */
function startMine(){
 G.busy=false;G.sel.clear();G.phase='idle';document.body.classList.remove('tgt');
 G.disc=2+(has(P[0],'Descarte extra')?1:0);
 G.hand=draw(7+(has(P[0],'Mano grande')?1:0));
 if(!P[0].team[P[0].sel]||P[0].team[P[0].sel].hp<=0)P[0].sel=alive(P[0])[0];
 renderHand();render();preview();
 $('#info').textContent='Selecciona hasta 5 cartas para formar tu mano.'}

$('#hand').addEventListener('click',e=>{
 const b=e.target.closest('.cd');if(!b||G.cur!=0||G.busy)return;
 const i=+b.dataset.c;
 if(G.sel.has(i))G.sel.delete(i);else if(G.sel.size<5)G.sel.add(i);else return toast('Máximo 5 cartas');
 b.classList.toggle('on');G.phase='idle';document.body.classList.remove('tgt');preview();render()});

$('#bAuto').onclick=()=>{const ev=evaluate(G.hand);if(!ev)return;G.sel=new Set(ev.cards.map(c=>G.hand.indexOf(c)));renderHand();G.hand.forEach(()=>{});document.querySelectorAll('.cd').forEach(c=>c.style.animation='none');preview();render()};

$('#bDesc').onclick=()=>{
 if(G.disc<1||!G.sel.size)return;
 const idx=[...G.sel];G.disc--;
 document.querySelectorAll('.cd.on').forEach(c=>c.classList.add('fly'));
 setTimeout(()=>{idx.forEach(i=>G.hand[i]=draw(1)[0]);G.sel.clear();renderHand();render();preview()},450)};

$('#bJugar').onclick=()=>{
 if(G.phase=='target'){G.phase='idle';document.body.classList.remove('tgt');return toast('Ataque cancelado')}
 if(!G.sel.size)return;G.phase='target';document.body.classList.add('tgt');toast('Elige un Pokémon rival como objetivo')};

document.addEventListener('click',e=>{
 const p=e.target.closest('.pk');if(!p)return;
 const pi=+p.dataset.p,i=+p.dataset.i,x=P[pi].team[i];
 if(G.pending&&pi==0&&!x.upg&&x.hp>0){applyUpg(x);return}
 if(pi==0&&x.hp>0&&!G.pending){P[0].sel=i;render();return}
 if(G.phase=='target'&&pi!=0&&x.hp>0&&!G.busy)playHand(pi,i)});

function playHand(ti,tj){
 const hand=evaluate([...G.sel].map(i=>G.hand[i]));
 G.busy=true;G.phase='idle';document.body.classList.remove('tgt');
 document.querySelectorAll('.cd.on').forEach(c=>c.classList.add('fly'));
 setTimeout(()=>{
  const msg=attack(0,hand,ti,tj);
  $('#mano').textContent=hand.name;$('#info').textContent=msg;
  G.hand=[];renderHand();render();setTimeout(endTurn,1100)},500)}

/* ---------- turnos ---------- */
function endTurn(){
 if(P[0].out)return fin(false);
 if(P.slice(1).every(p=>p.out))return fin(true);
 let n=G.cur;
 do{n=(n+1)%4;if(n==0)G.round++}while(P[n].out);
 G.cur=n;
 if(n==0&&G.round%5==0&&G.round!==G.shopRound){newOffers();toast('¡La tienda ha cambiado de stock!')}
 render();
 if(n==0)startMine();else{G.busy=true;setTimeout(bot,1300)}}

function bot(){
 const b=P[G.cur],h=evaluate(draw(7)),a=alive(b);b.sel=a[Math.random()*a.length|0];
 const foes=P.filter(p=>p.i!==b.i&&!p.out),f=Math.random()<.4&&!P[0].out?P[0]:foes[Math.random()*foes.length|0],ta=alive(f);
 // el bot ataca al Pokémon con más daño esperado
 const tj=ta.sort((x,y)=>calc(b.i,h,f.i,y).d-calc(b.i,h,f.i,x).d)[0];
 const msg=attack(b.i,h,f.i,tj);
 $('#mano').textContent=h.name;$('#info').textContent=msg;render();
 setTimeout(endTurn,1300)}

function fin(win){$('#endT').textContent=win?'¡Victoria!':'Derrota';$('#end').classList.add('on')}

/* ---------- tienda ---------- */
function newOffers(){
 const sh=a=>[...a].sort(()=>Math.random()-.5);
 G.offers=[...sh(JOK).slice(0,3).map(j=>({k:'j',d:j})),...sh(UPG).slice(0,2).map(u=>({k:'u',d:u}))];
 G.shopRound=G.round;drawShop()}
function drawShop(){
 $('#shTit').textContent='Tienda · Ronda '+G.round;$('#shMoney').textContent='$'+P[0].money;
 $('#offers').innerHTML=G.offers.map((o,i)=>o.k=='j'
  ?`<div class="of" style="--k:${o.d[4]}"><em>${o.d[1].toUpperCase()}</em><h4>${o.d[0]}</h4><p>${o.d[3]}</p><button class="btn" data-b="${i}">Comprar · $${o.d[2]}</button></div>`
  :`<div class="of m" style="--k:var(--red)"><em>MEJORA</em><h4>${o.d[0]}</h4><p>${o.d[2]}</p><button class="btn" data-b="${i}">Comprar · $${o.d[1]}</button></div>`).join('')||'<p style="color:var(--mut)">Todo vendido. Vuelve en la próxima ronda de tienda.</p>';
 $('#sell').innerHTML='Vender comodín (50%): '+(P[0].jk.map((j,i)=>`<button class="btn" data-s="${i}">${j[0]} · $${j[2]/2}</button>`).join('')||'ninguno')+` <span style="margin-left:auto">Mejoras usadas: ${G.upgN}/2</span>`;
 render()}
const shop=on=>document.body.classList.toggle('shopOn',on);
$('#bShop').onclick=()=>{drawShop();shop(true)};$('#bCerrar').onclick=()=>shop(false);$('#veil').onclick=()=>shop(false);
document.addEventListener('keydown',e=>{if(e.key=='Escape')shop(false)});
$('#offers').addEventListener('click',e=>{
 const b=e.target.closest('[data-b]');if(!b)return;
 const o=G.offers[+b.dataset.b],me=P[0];
 if(o.k=='j'){
  if(me.jk.length>=5)return toast('Máximo 5 comodines');
  if(me.money<o.d[2])return toast('No tienes suficiente dinero');
  me.money-=o.d[2];me.jk.push(o.d);G.offers.splice(+b.dataset.b,1);drawShop()}
 else{
  if(G.upgN>=2)return toast('Solo 2 mejoras por partida');
  if(me.money<o.d[1])return toast('No tienes suficiente dinero');
  G.pending=o;shop(false);document.body.classList.add('upg');toast('Elige el Pokémon que recibirá la mejora')}});
$('#sell').addEventListener('click',e=>{
 const b=e.target.closest('[data-s]');if(!b)return;
 const j=P[0].jk.splice(+b.dataset.s,1)[0];P[0].money+=j[2]/2;drawShop()});
function applyUpg(x){
 const o=G.pending,n=o.d[0];P[0].money-=o.d[1];G.upgN++;x.upg=true;
 if(n=='Coraza'){x.max*=1.25;x.hp*=1.25}
 if(n=='Afinidad')x.up=1.25;if(n=='Vampirismo')x.vamp=1;if(n=='Reflejos')x.red=.15;
 G.offers.splice(G.offers.indexOf(o),1);G.pending=null;document.body.classList.remove('upg');
 toast(n+' aplicada a '+x.n);render()}

/* ---------- arranque con pantalla de carga ---------- */
const pasos=['Barajando el mazo…','Cargando Pokémon…','Montando la mesa…','Buscando rivales…','¡Listo!'];
let pr=0;
const iv=setInterval(()=>{
 pr=Math.min(100,pr+4+Math.random()*9);
 $('#cargaBar').style.width=pr+'%';$('#cargaTxt').textContent=pasos[Math.min(4,pr/20|0)];
 if(pr>=100){clearInterval(iv);setTimeout(()=>{$('#carga').classList.add('off');init()},400)}},160);
function init(){
 G.deck=newDeck();newOffers();
 G.cur=Math.random()*4|0; // el randomizador decide quién abre
 render();renderHand();
 setTimeout(()=>{drawShop();shop(true)},500); // la tienda se levanta al empezar
 if(G.cur==0)startMine();else{G.busy=true;setTimeout(bot,1500)}}

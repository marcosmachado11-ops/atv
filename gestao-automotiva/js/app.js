const KEY="ga_demo_v1",SK="ga_sess_v1",SERV=["Troca de óleo","Revisão preventiva","Troca de pastilhas","Diagnóstico mecânico","Alinhamento","Lavagem simples","Lavagem completa","Higienização interna","Polimento","Enceramento"],ST=["aberto","em_andamento","concluido","cancelado"];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dAgo=n=>new Date(Date.now()-n*864e5).toISOString();
const seed=()=>({
u:[{email:"admin@email.com",senha:"123456",nome:"Administrador",perfil:"admin"},{email:"atendente@email.com",senha:"123456",nome:"Ana Atendente",perfil:"atendente"},{email:"tecnico@email.com",senha:"123456",nome:"Tiago Técnico",perfil:"tecnico"}],
p:[{id:1,nome:"Carlos Silva",email:"carlos@email.com",telefone:"48999990000",cpf:"11122233344"},{id:2,nome:"Mariana Souza",email:"mariana@email.com",telefone:"48988881111",cpf:"22233344455"},{id:3,nome:"João Pereira",email:"joao@email.com",telefone:"48977772222",cpf:"33344455566"}],
v:[{id:1,marca:"Volkswagen",modelo:"Gol",placa:"ABC1D23",ano:2020,cor:"Branco",proprietarioId:1},{id:2,marca:"Fiat",modelo:"Argo",placa:"BRA2E19",ano:2022,cor:"Preto",proprietarioId:2},{id:3,marca:"Honda",modelo:"Civic",placa:"QWE4R56",ano:2019,cor:"Prata",proprietarioId:3}],
o:[{id:1,dataEntrada:dAgo(2),descricao:"Manutenção preventiva",tipoServico:"Troca de óleo",valor:180,status:"aberto",veiculoId:1},{id:2,dataEntrada:dAgo(1),descricao:"Lavagem e aspiração",tipoServico:"Lavagem completa",valor:80,status:"em_andamento",veiculoId:2},{id:3,dataEntrada:dAgo(5),descricao:"Remoção de riscos leves",tipoServico:"Polimento",valor:350,status:"concluido",veiculoId:3}]});
let db=(()=>{try{const r=localStorage.getItem(KEY);if(r)return JSON.parse(r)}catch(e){}return seed()})();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}};
let sess=null;try{sess=JSON.parse(sessionStorage.getItem(SK))}catch(e){}
let view="painel",flash=null,q="";
const nid=a=>a.reduce((m,x)=>Math.max(m,x.id),0)+1;
const money=n=>"R$ "+Number(n).toFixed(2).replace(".",",");
const fdate=i=>new Date(i).toLocaleDateString("pt-BR");
const msg=()=>{const m=flash;flash=null;return m?`<div class="msg ${m[0]}">${esc(m[1])}</div>`:""};
const setSess=s=>{sess=s;try{s?sessionStorage.setItem(SK,JSON.stringify(s)):sessionStorage.removeItem(SK)}catch(e){}};
const own=id=>db.p.find(p=>p.id===id);
const vei=id=>db.v.find(v=>v.id===id);

function login(){
  $app(`<form class="card login" onsubmit="return doLogin(event)"><h1>Gestão Automotiva</h1><p class="mut">Oficina mecânica e lava-car</p>${msg()}
  <label>E-mail<input id="em" type="email" required value="admin@email.com"></label>
  <label>Senha<input id="se" type="password" required value="123456"></label>
  <button type="submit">Entrar</button>
  <p class="mut">Demonstração: admin@email.com / 123456. Os dados ficam salvos só neste navegador.</p></form>`);
}
function doLogin(e){
  e.preventDefault();
  const u=db.u.find(x=>x.email===$("#em").value.trim()&&x.senha===$("#se").value);
  if(!u){flash=["e","Credenciais inválidas."];return login(),false}
  setSess({nome:u.nome,perfil:u.perfil,exp:Date.now()+30*60000});view="painel";render();return false;
}
function sair(){setSess(null);render()}
function $(s){return document.querySelector(s)}
function $app(h){document.getElementById("app").innerHTML=h}

function ownersTable(){
  const t=q.toLowerCase();
  const l=db.p.filter(p=>!t||[p.nome,p.email,p.telefone].some(x=>x.toLowerCase().includes(t))).sort((a,b)=>a.nome.localeCompare(b.nome));
  return `<table><tr><th>Nome</th><th>E-mail</th><th>Telefone</th></tr>${l.map(p=>`<tr><td>${esc(p.nome)}</td><td>${esc(p.email)}</td><td>${esc(p.telefone)}</td></tr>`).join("")||'<tr><td colspan="3">Nenhum proprietário encontrado.</td></tr>'}</table>`;
}
function ordersTable(list,edit){
  const l=[...list].sort((a,b)=>b.dataEntrada.localeCompare(a.dataEntrada));
  return `<table><tr><th>Data</th><th>Serviço</th><th>Descrição</th><th>Veículo</th><th>Proprietário</th><th>Valor</th><th>Status</th></tr>${l.map(o=>{const v=vei(o.veiculoId)||{},p=own(v.proprietarioId)||{};
  return `<tr><td>${fdate(o.dataEntrada)}</td><td>${esc(o.tipoServico)}</td><td>${esc(o.descricao)}</td><td>${esc(v.modelo)} (${esc(v.placa)})</td><td>${esc(p.nome)}</td><td>${money(o.valor)}</td><td>${edit?`<select onchange="setStatus(${o.id},this.value)">${ST.map(s=>`<option ${s===o.status?"selected":""}>${s}</option>`).join("")}</select>`:`<span class="tag ${o.status}">${o.status}</span>`}</td></tr>`}).join("")||'<tr><td colspan="7">Nenhuma ordem cadastrada.</td></tr>'}</table>`;
}
const views={
painel(){
  const ab=db.o.filter(o=>o.status==="aberto"||o.status==="em_andamento").length,fat=db.o.filter(o=>o.status==="concluido").reduce((s,o)=>s+Number(o.valor),0);
  return `<div class="grid" style="margin-bottom:16px">${[["Proprietários",db.p.length],["Veículos",db.v.length],["Serviços em aberto",ab],["Faturamento concluído",money(fat)]].map(k=>`<div class="card kpi" style="margin:0"><span class="mut">${k[0]}</span><b>${k[1]}</b></div>`).join("")}</div>
  <div class="card"><h2>Últimas ordens de serviço</h2><div class="scroll">${ordersTable(db.o.slice(-5),false)}</div></div>`;
},
proprietarios(){
  return `${msg()}<div class="card"><h2>Novo proprietário</h2><form class="f" onsubmit="return addP(event)">
  <label>Nome<input name="nome" required></label><label>E-mail<input name="email" type="email" required></label>
  <label>Telefone<input name="telefone" required></label><label>CPF<input name="cpf" required inputmode="numeric"></label><button>Cadastrar</button></form>
  <p class="mut">O CPF é guardado, mas não aparece nas listagens.</p></div>
  <div class="card"><h2>Proprietários</h2><label>Pesquisar<input id="q" value="${esc(q)}" oninput="q=this.value;$('#tp').innerHTML=ownersTable()" placeholder="Nome, e-mail ou telefone"></label><div class="scroll" id="tp" style="margin-top:10px">${ownersTable()}</div></div>`;
},
veiculos(){
  const l=[...db.v].sort((a,b)=>a.modelo.localeCompare(b.modelo));
  return `${msg()}<div class="card"><h2>Novo veículo</h2><form class="f" onsubmit="return addV(event)">
  <label>Proprietário<select name="proprietarioId" required><option value="">Selecione</option>${db.p.map(p=>`<option value="${p.id}">${esc(p.nome)}</option>`).join("")}</select></label>
  <label>Marca<input name="marca" required></label><label>Modelo<input name="modelo" required></label><label>Placa<input name="placa" required maxlength="8"></label>
  <label>Ano<input name="ano" type="number" min="1950" max="2100"></label><label>Cor<input name="cor"></label><button>Cadastrar</button></form></div>
  <div class="card"><h2>Veículos</h2><div class="scroll"><table><tr><th>Veículo</th><th>Placa</th><th>Ano</th><th>Cor</th><th>Proprietário</th></tr>${l.map(v=>`<tr><td>${esc(v.marca)} ${esc(v.modelo)}</td><td>${esc(v.placa)}</td><td>${esc(v.ano||"-")}</td><td>${esc(v.cor||"-")}</td><td>${esc((own(v.proprietarioId)||{}).nome)}</td></tr>`).join("")}</table></div></div>`;
},
ordens(){
  return `${msg()}<div class="card"><h2>Nova ordem de serviço</h2><form class="f" onsubmit="return addO(event)">
  <label>Veículo<select name="veiculoId" required><option value="">Selecione</option>${db.v.map(v=>`<option value="${v.id}">${esc(v.modelo)} - ${esc(v.placa)}</option>`).join("")}</select></label>
  <label>Tipo de serviço<input name="tipoServico" list="serv" required></label><datalist id="serv">${SERV.map(s=>`<option value="${s}">`).join("")}</datalist>
  <label>Descrição<input name="descricao" required maxlength="255"></label><label>Valor (R$)<input name="valor" type="number" step="0.01" min="0" required></label><button>Criar</button></form></div>
  <div class="card"><h2>Ordens de serviço</h2><div class="scroll">${ordersTable(db.o,true)}</div></div>`;
}};
const fd=e=>{e.preventDefault();return Object.fromEntries(new FormData(e.target).entries())};
function addP(e){const d=fd(e);
  if(db.p.some(p=>p.email.toLowerCase()===d.email.toLowerCase()))flash=["e","Já existe um proprietário com esse e-mail."];
  else{db.p.push({id:nid(db.p),nome:d.nome.trim(),email:d.email.trim(),telefone:d.telefone.trim(),cpf:d.cpf.trim()});save();flash=["s","Proprietário cadastrado."]}
  render();return false}
function addV(e){const d=fd(e),placa=d.placa.toUpperCase().replace(/[^A-Z0-9]/g,"");
  if(!own(Number(d.proprietarioId)))flash=["e","Proprietário não encontrado."];
  else if(placa.length<7)flash=["e","Placa inválida."];
  else if(db.v.some(v=>v.placa===placa))flash=["e","Essa placa já está cadastrada."];
  else{db.v.push({id:nid(db.v),marca:d.marca.trim(),modelo:d.modelo.trim(),placa,ano:d.ano?Number(d.ano):null,cor:d.cor.trim(),proprietarioId:Number(d.proprietarioId)});save();flash=["s","Veículo cadastrado."]}
  render();return false}
function addO(e){const d=fd(e);
  if(!vei(Number(d.veiculoId)))flash=["e","Veículo não encontrado."];
  else{db.o.push({id:nid(db.o),dataEntrada:new Date().toISOString(),descricao:d.descricao.trim(),tipoServico:d.tipoServico.trim(),valor:Number(d.valor),status:"aberto",veiculoId:Number(d.veiculoId)});save();flash=["s","Ordem criada com status aberto."]}
  render();return false}
function setStatus(id,s){const o=db.o.find(x=>x.id===id);if(o&&ST.includes(s)){o.status=s;save();flash=["s","Status atualizado."];render()}}
function reset(){if(confirm("Restaurar os dados de demonstração?")){db=seed();save();flash=["s","Dados restaurados."];render()}}
function go(v){view=v;q="";render()}
function render(){
  if(!sess||sess.exp<Date.now()){if(sess)flash=["e","Sessão expirada. Entre novamente."];setSess(null);return login()}
  const tabs=[["painel","Painel"],["proprietarios","Proprietários"],["veiculos","Veículos"],["ordens","Ordens de serviço"]];
  $app(`<div class="top"><div><h1>Gestão Automotiva</h1><p class="mut">Bem-vindo(a), ${esc(sess.nome)} (${esc(sess.perfil)})</p></div><div><button class="sec" onclick="reset()">Restaurar demo</button> <button onclick="sair()">Sair</button></div></div>
  <nav>${tabs.map(t=>`<button class="${view===t[0]?"on":""}" onclick="go('${t[0]}')">${t[1]}</button>`).join("")}</nav>${views[view]()}`);
}
setInterval(()=>{if(sess&&sess.exp<Date.now())render()},20000);
render();

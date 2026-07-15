
const KEY="pcos_all_in_one_v1";
const money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number(n)||0);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const defaults=()=>({
 currentId:null,
 settings:{purchaseLtv:85,rehabFundingPct:100,interestPct:11,pointsPct:2,lenderFees:1500,monthlyHolding:1550,buyClosingPct:1.5,sellingPct:6.5,wholesaleFee:0,contingencyPct:10,minProfit:75000},
 vendors:[{name:"Home Depot",url:"https://www.homedepot.com/s/"},{name:"Amazon",url:"https://www.amazon.com/s?k="},{name:"Lowe's",url:"https://www.lowes.com/search?searchTerm="},{name:"Floor & Decor",url:"https://www.flooranddecor.com/search?q="},{name:"Best Buy",url:"https://www.bestbuy.com/site/searchpage.jsp?st="},{name:"Local Supplier",url:""}],
 projects:[]
});
let state=load();
function load(){try{return {...defaults(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return defaults()}}
function persist(){localStorage.setItem(KEY,JSON.stringify(state))}
function templateCategories(){
 return [
  {name:"Kitchen",items:[
   {name:"Base cabinets",type:"Material",qty:18,unit:"lf",price:145,vendor:"Local Supplier",sku:""},
   {name:"Wall cabinets",type:"Material",qty:15,unit:"lf",price:120,vendor:"Local Supplier",sku:""},
   {name:"Quartz countertop",type:"Material",qty:50,unit:"sqft",price:39,vendor:"Local Supplier",sku:""},
   {name:"Sink",type:"Material",qty:1,unit:"each",price:165,vendor:"Home Depot",sku:""},
   {name:"Faucet",type:"Material",qty:1,unit:"each",price:78,vendor:"Amazon",sku:""},
   {name:"Appliance package",type:"Material",qty:1,unit:"package",price:3200,vendor:"Best Buy",sku:""},
   {name:"Kitchen labor",type:"Labor",qty:1,unit:"job",price:6500,vendor:"Kitchen Crew",sku:""}]},
  {name:"Bathrooms",multiplier:"baths",items:[
   {name:"Vanity",type:"Material",qty:1,unit:"each",price:310,vendor:"Home Depot",sku:""},
   {name:"Toilet",type:"Material",qty:1,unit:"each",price:129,vendor:"Home Depot",sku:""},
   {name:"Tile & waterproofing",type:"Material",qty:1,unit:"bath",price:1600,vendor:"Floor & Decor",sku:""},
   {name:"Bathroom labor",type:"Labor",qty:1,unit:"bath",price:7000,vendor:"Bathroom Crew",sku:""}]},
  {name:"Flooring",items:[
   {name:"LVP material",type:"Material",formula:"sqft*1.1",qty:0,unit:"sqft",price:2.19,vendor:"Floor & Decor",sku:""},
   {name:"Flooring labor",type:"Labor",formula:"sqft*1.1",qty:0,unit:"sqft",price:2.25,vendor:"Flooring Crew",sku:""},
   {name:"Baseboard material",type:"Material",formula:"sqft*.35",qty:0,unit:"lf",price:1.55,vendor:"Local Supplier",sku:""},
   {name:"Baseboard labor",type:"Labor",formula:"sqft*.35",qty:0,unit:"lf",price:1.75,vendor:"Finish Carpenter",sku:""}]},
  {name:"Paint",items:[
   {name:"Interior paint labor/material",type:"Labor",formula:"sqft",qty:0,unit:"sqft",price:2.75,vendor:"Painter",sku:""},
   {name:"Exterior paint allowance",type:"Labor",formula:"sqft",qty:0,unit:"sqft",price:1.75,vendor:"Painter",sku:""}]},
  {name:"Electrical",items:[
   {name:"Electrical allowance",type:"Labor",formula:"sqft",qty:0,unit:"sqft",price:3,vendor:"Electrician",sku:""}]},
  {name:"Plumbing",items:[
   {name:"Plumbing allowance",type:"Labor",formula:"sqft",qty:0,unit:"sqft",price:3.25,vendor:"Plumber",sku:""}]},
  {name:"Doors & Windows",items:[
   {name:"Interior doors",type:"Material",formula:"beds+baths+4",qty:0,unit:"each",price:185,vendor:"Home Depot",sku:""},
   {name:"Door installation",type:"Labor",formula:"beds+baths+4",qty:0,unit:"each",price:275,vendor:"Finish Carpenter",sku:""}]},
  {name:"Exterior & Soft Costs",items:[
   {name:"Landscaping",type:"Labor",qty:1,unit:"job",price:7500,vendor:"Landscape Crew",sku:""},
   {name:"Dumpster",type:"Other",qty:2,unit:"haul",price:700,vendor:"Local Supplier",sku:""},
   {name:"Permits / Plans / Engineering",type:"Other",qty:1,unit:"job",price:7000,vendor:"City / Consultants",sku:""},
   {name:"Cleaning / Staging",type:"Other",qty:1,unit:"job",price:2500,vendor:"Local Supplier",sku:""}]}
 ];
}
function newProject(){
 const id="PC-"+String(Date.now()).slice(-6);
 const p={id,name:"New Project",status:"Analyzing",address:"",city:"",state:"CA",zip:"",beds:3,baths:2,sqft:2000,lotSize:0,yearBuilt:0,propertyType:"Single Family",apn:"",purchase:0,arv:0,months:6,categories:templateCategories(),invoices:[],changes:[],logs:[],tasks:[],punch:[],contractors:[],permits:[],crm:[]};
 state.projects.unshift(p);state.currentId=id;persist();renderAll();show("setup");
}
function current(){return state.projects.find(p=>p.id===state.currentId)||null}
function calcQty(item,p){if(!item.formula)return +item.qty||0;try{return Math.ceil(Function("sqft","beds","baths","return "+item.formula)(+p.sqft||0,+p.beds||0,+p.baths||0))}catch{return +item.qty||0}}
function rehabBase(p){return p.categories.reduce((s,c)=>s+c.items.reduce((a,i)=>a+calcQty(i,p)*(+i.price||0)*(c.multiplier==="baths"?(+p.baths||0):1),0),0)}
function results(purchaseOverride){
 const p=current(); if(!p)return {};
 const s=state.settings,purchase=purchaseOverride??(+p.purchase||0),base=rehabBase(p),cont=base*(+s.contingencyPct||0)/100,rehab=base+cont;
 const buyClosing=purchase*(+s.buyClosingPct||0)/100,acquisition=purchase+buyClosing+(+s.wholesaleFee||0);
 const purchaseLoan=purchase*(+s.purchaseLtv||0)/100,rehabLoan=rehab*(+s.rehabFundingPct||0)/100,loan=purchaseLoan+rehabLoan;
 const points=loan*(+s.pointsPct||0)/100,interest=loan*(+s.interestPct||0)/100*((+p.months||0)/12),finance=points+interest+(+s.lenderFees||0);
 const holding=(+s.monthlyHolding||0)*(+p.months||0),selling=(+p.arv||0)*(+s.sellingPct||0)/100;
 const total=acquisition+rehab+finance+holding+selling,profit=(+p.arv||0)-total,cash=Math.max(purchase-purchaseLoan,0)+Math.max(rehab-rehabLoan,0)+buyClosing+(+s.wholesaleFee||0)+points+(+s.lenderFees||0)+holding;
 return {base,cont,rehab,buyClosing,acquisition,purchaseLoan,rehabLoan,loan,points,interest,finance,holding,selling,total,profit,cash,roi:cash?profit/cash*100:0}
}
function maxOffer(){const p=current();if(!p)return 0;let lo=0,hi=Math.max(+p.arv||0,1);for(let i=0;i<60;i++){const m=(lo+hi)/2;results(m).profit>=state.settings.minProfit?lo=m:hi=m}return lo}
function saveInputs(){
 const p=current();if(!p)return;
 document.querySelectorAll("[data-field]").forEach(el=>{p[el.dataset.field]=el.type==="number"?+el.value:el.value});
 document.querySelectorAll("[data-setting]").forEach(el=>{state.settings[el.dataset.setting]=+el.value});
 persist();renderAll();
}
function bindInputs(){
 const p=current();
 document.querySelectorAll("[data-field]").forEach(el=>{el.value=p?.[el.dataset.field]??"";el.onchange=saveInputs});
 document.querySelectorAll("[data-setting]").forEach(el=>{el.value=state.settings[el.dataset.setting]??"";el.onchange=saveInputs});
}
function show(id){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.view===id));document.getElementById("pageTitle").textContent=document.querySelector(`[data-view="${id}"]`)?.textContent||id}
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>show(b.dataset.view));
document.getElementById("newProjectBtn").onclick=newProject;document.getElementById("saveBtn").onclick=saveInputs;

function renderProjects(){
 const q=(document.getElementById("projectSearch")?.value||"").toLowerCase(),f=document.getElementById("projectStatusFilter")?.value||"";
 const list=state.projects.filter(p=>(!q||`${p.name} ${p.address} ${p.city}`.toLowerCase().includes(q))&&(!f||p.status===f));
 document.getElementById("projectCards").innerHTML=list.length?list.map(p=>{state.currentId=p.id;const r=results(),m=maxOffer();return `<div class="card project-card"><h3>${esc(p.name)}</h3><p>${esc(p.address||"No address")}</p><div class="project-stats"><b>Status:</b> ${esc(p.status)}<br><b>Purchase:</b> ${money(p.purchase)}<br><b>ARV:</b> ${money(p.arv)}<br><b>Rehab:</b> ${money(r.rehab)}<br><b>Profit:</b> ${money(r.profit)}<br><b>Max Offer:</b> ${money(m)}</div><div class="toolbar"><button class="btn primary small" onclick="openProject('${p.id}')">Open</button><button class="btn danger small" onclick="deleteProject('${p.id}')">Delete</button></div></div>`}).join(""):'<div class="card">No projects yet. Click New Project.</div>';
 if(!state.currentId&&state.projects[0])state.currentId=state.projects[0].id;
}
window.openProject=id=>{state.currentId=id;persist();renderAll();show("setup")};window.deleteProject=id=>{if(confirm("Delete this project?")){state.projects=state.projects.filter(p=>p.id!==id);if(state.currentId===id)state.currentId=state.projects[0]?.id||null;persist();renderAll()}};

async function lookup(){
 const p=current();if(!p||!p.address.trim())return alert("Enter full address first.");
 const msg=document.getElementById("lookupMessage");msg.innerHTML='<div class="card">Looking up property...</div>';
 try{
  const res=await fetch("/api/property-lookup?address="+encodeURIComponent(p.address),{headers:{"Accept":"application/json"}});
  const contentType=res.headers.get("content-type")||"";
  const raw=await res.text();
  let body=null;
  if(contentType.includes("application/json")){
    try{body=raw?JSON.parse(raw):{}}catch{body={error:"The server returned invalid JSON."}}
  }else{
    const preview=raw.replace(/\s+/g," ").slice(0,120);
    throw new Error(res.status===404
      ? "Property lookup function is not deployed. Confirm netlify/functions/property-lookup.js exists in GitHub, then redeploy."
      : `Property service returned HTML instead of JSON (${res.status}). ${preview}`);
  }
  if(!res.ok)throw new Error(body.error||`Lookup failed (${res.status})`);
  const x=body.property||body;
  Object.assign(p,{address:x.formattedAddress||p.address,city:x.city||p.city,state:x.state||p.state,zip:x.zipCode||p.zip,beds:x.bedrooms??p.beds,baths:x.bathrooms??p.baths,sqft:x.squareFootage??p.sqft,lotSize:x.lotSize??p.lotSize,yearBuilt:x.yearBuilt??p.yearBuilt,propertyType:x.propertyType||p.propertyType,apn:x.apn||p.apn});
  persist();renderAll();msg.innerHTML='<div class="card"><span class="badge good">Property loaded</span></div>';
 }catch(e){msg.innerHTML=`<div class="card"><span class="badge bad">${esc(e.message)}</span></div>`}
}
document.getElementById("lookupBtn").onclick=lookup;

function renderDeal(){
 const p=current();if(!p)return;
 const r=results(),max=maxOffer(),open=Math.max(0,max*.92),target=(open+max)/2,decision=r.profit>=state.settings.minProfit?"BUY":p.purchase>max?"NEGOTIATE":"REVIEW";
 document.getElementById("dealKpis").innerHTML=[["Purchase",p.purchase],["ARV",p.arv],["Rehab",r.rehab],["Net Profit",r.profit],["ROI",r.roi+"%"],["Cash Needed",r.cash],["Maximum Offer",max],["Decision",decision]].map(([a,b])=>`<div class="kpi"><span>${a}</span><b>${typeof b==="number"?money(b):b}</b></div>`).join("");
 document.getElementById("offerRange").innerHTML=`<table><tr><th>Opening</th><th>Target</th><th>Maximum</th></tr><tr><td>${money(open)}</td><td>${money(target)}</td><td>${money(max)}</td></tr></table>`;
 document.getElementById("dealBreakdown").innerHTML=`<table><tr><th>Cost</th><th>Amount</th></tr>${[["Acquisition",r.acquisition],["Rehab before contingency",r.base],["Contingency",r.cont],["Financing",r.finance],["Holding",r.holding],["Selling",r.selling],["Total Project Cost",r.total],["Net Profit",r.profit]].map(x=>`<tr><td>${x[0]}</td><td class="money">${money(x[1])}</td></tr>`).join("")}</table>`;
}
function renderRehab(){
 const p=current();if(!p){document.getElementById("rehabCategories").innerHTML='<div class="card">Create a project first.</div>';return}
 document.getElementById("rehabCategories").innerHTML=p.categories.map((c,ci)=>`<div class="card"><div class="category-head"><b>${esc(c.name)}</b><span>${money(c.items.reduce((s,i)=>s+calcQty(i,p)*(+i.price||0)*(c.multiplier==="baths"?p.baths:1),0))}</span></div><div class="category-body"><table><tr><th>Item</th><th>Type</th><th>Qty</th><th>Unit</th><th>Unit Price</th><th>Vendor</th><th>SKU</th><th>Total</th><th></th></tr>${c.items.map((i,ii)=>`<tr><td><input value="${esc(i.name)}" onchange="editItem(${ci},${ii},'name',this.value)"></td><td><select onchange="editItem(${ci},${ii},'type',this.value)">${["Material","Labor","Other"].map(v=>`<option ${i.type===v?"selected":""}>${v}</option>`).join("")}</select></td><td><input type="number" value="${calcQty(i,p)}" onchange="editItem(${ci},${ii},'qty',+this.value);delete current().categories[${ci}].items[${ii}].formula"></td><td><input value="${esc(i.unit)}" onchange="editItem(${ci},${ii},'unit',this.value)"></td><td><input type="number" step=".01" value="${i.price}" onchange="editItem(${ci},${ii},'price',+this.value)"></td><td><input value="${esc(i.vendor)}" onchange="editItem(${ci},${ii},'vendor',this.value)"></td><td><input value="${esc(i.sku)}" onchange="editItem(${ci},${ii},'sku',this.value)"></td><td class="money">${money(calcQty(i,p)*i.price*(c.multiplier==="baths"?p.baths:1))}</td><td><button class="btn danger small" onclick="deleteItem(${ci},${ii})">×</button></td></tr>`).join("")}</table><button class="btn light small" onclick="addItem(${ci})">+ Add Item</button></div></div>`).join("");
}
window.editItem=(ci,ii,k,v)=>{current().categories[ci].items[ii][k]=v;persist();renderAll()};window.deleteItem=(ci,ii)=>{current().categories[ci].items.splice(ii,1);persist();renderAll()};window.addItem=ci=>{current().categories[ci].items.push({name:"New Item",type:"Material",qty:1,unit:"each",price:0,vendor:"",sku:""});persist();renderAll()};
document.getElementById("addCategoryBtn").onclick=()=>{current().categories.push({name:"New Category",items:[]});persist();renderAll()};document.getElementById("resetRehabBtn").onclick=()=>{if(confirm("Reset template?")){current().categories=templateCategories();persist();renderAll()}};

function renderMaterials(){
 const p=current();if(!p)return;
 const q=(document.getElementById("materialSearch")?.value||"").toLowerCase();let rows=[];
 p.categories.forEach((c,ci)=>c.items.forEach((i,ii)=>{if(i.type!=="Material")return;if(q&&!`${i.name} ${i.vendor} ${i.sku}`.toLowerCase().includes(q))return;rows.push(`<tr><td>${esc(c.name)}</td><td>${esc(i.name)}</td><td><input type="number" value="${calcQty(i,p)}" onchange="editItem(${ci},${ii},'qty',+this.value);delete current().categories[${ci}].items[${ii}].formula"></td><td>${esc(i.unit)}</td><td><input type="number" step=".01" value="${i.price}" onchange="editItem(${ci},${ii},'price',+this.value)"></td><td><input value="${esc(i.vendor)}" onchange="editItem(${ci},${ii},'vendor',this.value)"></td><td><input value="${esc(i.sku)}" onchange="editItem(${ci},${ii},'sku',this.value)"></td><td>${money(calcQty(i,p)*i.price)}</td></tr>`)}));
 document.getElementById("materialsTable").innerHTML=`<table><tr><th>Category</th><th>Material</th><th>Qty</th><th>Unit</th><th>Price</th><th>Vendor</th><th>SKU</th><th>Total</th></tr>${rows.join("")}</table>`;
 document.getElementById("vendorsTable").innerHTML=`<table><tr><th>Company</th><th>Search URL</th><th></th></tr>${state.vendors.map((v,i)=>`<tr><td><input value="${esc(v.name)}" onchange="state.vendors[${i}].name=this.value;persist();renderAll()"></td><td><input value="${esc(v.url)}" onchange="state.vendors[${i}].url=this.value;persist();renderAll()"></td><td><button class="btn danger small" onclick="state.vendors.splice(${i},1);persist();renderAll()">×</button></td></tr>`).join("")}</table>`;
}
document.getElementById("materialSearch").oninput=renderMaterials;document.getElementById("addMaterialBtn").onclick=()=>{current().categories[0].items.push({name:"New Material",type:"Material",qty:1,unit:"each",price:0,vendor:"",sku:""});persist();renderAll()};document.getElementById("addVendorBtn").onclick=()=>{state.vendors.push({name:"New Vendor",url:""});persist();renderAll()};

function renderFinance(){const r=results();document.getElementById("financeTable").innerHTML=`<table><tr><th>Item</th><th>Amount</th></tr>${[["Purchase Loan",r.purchaseLoan],["Rehab Loan",r.rehabLoan],["Total Loan",r.loan],["Points",r.points],["Interest",r.interest],["Total Financing Cost",r.finance],["Owner Cash Needed",r.cash]].map(x=>`<tr><td>${x[0]}</td><td class="money">${money(x[1])}</td></tr>`).join("")}</table>`}

let op="invoices";document.querySelectorAll(".sub").forEach(b=>b.onclick=()=>{op=b.dataset.op;document.querySelectorAll(".sub").forEach(x=>x.classList.toggle("active",x===b));renderOperations()});
function renderOperations(){const p=current();if(!p)return;const map={
 invoices:{label:"Invoice",rows:p.invoices,cols:["vendor","description","amount","paid","status"]},
 changes:{label:"Change Order",rows:p.changes,cols:["category","description","amount","status"]},
 logs:{label:"Daily Log",rows:p.logs,cols:["date","trade","crew","hours","completed"]},
 tasks:{label:"Task",rows:p.tasks,cols:["name","start","finish","status","owner"]},
 punch:{label:"Punch Item",rows:p.punch,cols:["area","item","priority","owner","status"]}
 };const cfg=map[op];document.getElementById("operationsContent").innerHTML=`<div class="toolbar"><button class="btn light" onclick="addOp()">+ Add ${cfg.label}</button></div><div class="card"><table><tr>${cfg.cols.map(c=>`<th>${c}</th>`).join("")}<th></th></tr>${cfg.rows.map((r,i)=>`<tr>${cfg.cols.map(c=>`<td><input value="${esc(r[c]??"")}" onchange="current()['${op}'][${i}]['${c}']=this.value;persist();renderAll()"></td>`).join("")}<td><button class="btn danger small" onclick="current()['${op}'].splice(${i},1);persist();renderAll()">×</button></td></tr>`).join("")}</table></div>`}
window.addOp=()=>{const samples={invoices:{vendor:"",description:"",amount:0,paid:0,status:"Open"},changes:{category:"",description:"",amount:0,status:"Pending"},logs:{date:"",trade:"",crew:0,hours:0,completed:""},tasks:{name:"",start:"",finish:"",status:"Not Started",owner:""},punch:{area:"",item:"",priority:"Medium",owner:"",status:"Open"}};current()[op].push(samples[op]);persist();renderAll()};

function genericTable(key,cols){const p=current();return `<table><tr>${cols.map(c=>`<th>${c}</th>`).join("")}<th></th></tr>${p[key].map((r,i)=>`<tr>${cols.map(c=>`<td><input value="${esc(r[c]??"")}" onchange="current()['${key}'][${i}]['${c}']=this.value;persist();renderAll()"></td>`).join("")}<td><button class="btn danger small" onclick="current()['${key}'].splice(${i},1);persist();renderAll()">×</button></td></tr>`).join("")}</table>`}
document.getElementById("addContractorBtn").onclick=()=>{current().contractors.push({name:"",trade:"",phone:"",rate:"",rating:"",notes:""});persist();renderAll()};document.getElementById("addPermitBtn").onclick=()=>{current().permits.push({name:"",city:"",date:"",status:"Not Requested",notes:""});persist();renderAll()};document.getElementById("addContactBtn").onclick=()=>{current().crm.push({name:"",type:"Broker",phone:"",email:"",followup:"",notes:""});persist();renderAll()};

document.getElementById("printBtn").onclick=()=>window.print();document.getElementById("exportBtn").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:"application/json"}));a.download="Premier_Concepts_OS_Backup.json";a.click()};document.getElementById("importFile").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{state=JSON.parse(r.result);persist();renderAll()};r.readAsText(f)};
document.getElementById("projectSearch").oninput=renderProjects;document.getElementById("projectStatusFilter").onchange=renderProjects;

function renderAll(){renderProjects();bindInputs();const p=current();document.getElementById("projectLabel").textContent=p?`${p.name} — ${p.address||"No address"}`:"No project selected";renderDeal();renderRehab();renderMaterials();renderFinance();renderOperations();if(p){document.getElementById("contractorsTable").innerHTML=genericTable("contractors",["name","trade","phone","rate","rating","notes"]);document.getElementById("permitsTable").innerHTML=genericTable("permits",["name","city","date","status","notes"]);document.getElementById("crmTable").innerHTML=genericTable("crm",["name","type","phone","email","followup","notes"])}}
renderAll();

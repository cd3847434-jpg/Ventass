const KEY_PRODUCTS="talita_products_v1", KEY_SALES="talita_sales_v1", KEY_PHOTO="talita_photo_v1";
const defaultProducts=[
 {id:1,name:"Coca-Cola 600ml",price:25,stock:25,cat:"Bebidas",icon:"🥤"},
 {id:2,name:"Pan Bimbo",price:18,stock:15,cat:"Snacks",icon:"🍞"},
 {id:3,name:"Galletas Oreo",price:28,stock:20,cat:"Snacks",icon:"🍪"},
 {id:4,name:"Agua 1L",price:15,stock:30,cat:"Bebidas",icon:"💧"},
 {id:5,name:"Sabritas",price:20,stock:18,cat:"Snacks",icon:"🥔"},
 {id:6,name:"Jabón",price:32,stock:12,cat:"Aseo",icon:"🧼"}
];
let products=JSON.parse(localStorage.getItem(KEY_PRODUCTS)||"null")||defaultProducts;
let sales=JSON.parse(localStorage.getItem(KEY_SALES)||"[]");
let activeCat="Todos";

const money=n=>"L. "+Number(n).toFixed(2);
const save=()=>{localStorage.setItem(KEY_PRODUCTS,JSON.stringify(products));localStorage.setItem(KEY_SALES,JSON.stringify(sales));};
const todayKey=()=>new Date().toISOString().slice(0,10);
const todaySales=()=>sales.filter(s=>s.date===todayKey());

function showView(name){
 document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
 document.getElementById("view-"+name).classList.add("active");
 document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.view===name));
 if(name==="home") renderHome();
 if(name==="sales") renderSales();
 if(name==="products") renderProducts();
 if(name==="summary") renderSummary();
 if(name==="sale") populateSaleProducts();
 window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll(".nav").forEach(n=>n.onclick=()=>showView(n.dataset.view));

function renderHome(){
 const ss=todaySales(), total=ss.reduce((a,s)=>a+s.total,0), items=ss.reduce((a,s)=>a+s.qty,0);
 document.getElementById("homeTotal").textContent=money(total);
 document.getElementById("homeItems").textContent=items;
 document.getElementById("today").textContent=new Date().toLocaleDateString("es-HN",{day:"2-digit",month:"short",year:"numeric"});
}
function populateSaleProducts(){
 const sel=document.getElementById("saleProduct"), old=sel.value;
 sel.innerHTML=products.map(p=>`<option value="${p.id}">${p.name} — ${money(p.price)}</option>`).join("");
 if(old) sel.value=old;
 updateUnitPrice();
}
function updateUnitPrice(){
 const p=products.find(x=>x.id==document.getElementById("saleProduct").value);
 if(p) document.getElementById("unitPrice").value=p.price;
 calcTotal();
}
document.getElementById("saleProduct").onchange=updateUnitPrice;
document.getElementById("saleProductSearch").oninput=function(){
 const q=this.value.toLowerCase();
 const opts=products.filter(p=>p.name.toLowerCase().includes(q));
 document.getElementById("saleProduct").innerHTML=opts.map(p=>`<option value="${p.id}">${p.name} — ${money(p.price)}</option>`).join("");
 updateUnitPrice();
};
document.getElementById("quantity").oninput=calcTotal;
document.getElementById("unitPrice").oninput=calcTotal;
document.getElementById("minus").onclick=()=>{let x=+quantity.value;x=Math.max(1,x-1);quantity.value=x;calcTotal()};
document.getElementById("plus").onclick=()=>{quantity.value=+quantity.value+1;calcTotal()};
function calcTotal(){document.getElementById("saleTotal").textContent=money((+quantity.value||0)*(+unitPrice.value||0));}

document.getElementById("saleForm").onsubmit=e=>{
 e.preventDefault();
 const p=products.find(x=>x.id==saleProduct.value), qty=+quantity.value, price=+unitPrice.value;
 if(!p||qty<1||price<0)return;
 sales.unshift({id:Date.now(),date:todayKey(),time:new Date().toLocaleTimeString("es-HN",{hour:"2-digit",minute:"2-digit"}),product:p.name,productId:p.id,qty,price,total:qty*price,payment:document.querySelector('input[name="payment"]:checked').value});
 p.stock=Math.max(0,p.stock-qty); save(); renderHome(); alert("Venta registrada correctamente."); showView("sales");
};

function renderSales(){
 const ss=todaySales(), total=ss.reduce((a,s)=>a+s.total,0);
 document.getElementById("salesDate").textContent=new Date().toLocaleDateString("es-HN",{day:"2-digit",month:"short",year:"numeric"});
 document.getElementById("salesTotal").textContent=money(total);
 const box=document.getElementById("salesList");
 box.innerHTML=ss.length?ss.map(s=>`<div class="sale-item"><time>${s.time}</time><div><b>${s.product}</b><small>${s.qty} × ${money(s.price)} · ${s.payment}</small></div><strong>${money(s.total)}</strong><button class="delete-sale" onclick="deleteSale(${s.id})">🗑</button></div>`).join(""):"<p style='text-align:center;color:#71839b;padding:25px'>No hay ventas registradas hoy.</p>";
}
function deleteSale(id){
 const s=sales.find(x=>x.id===id); if(!s)return;
 const p=products.find(x=>x.id===s.productId); if(p)p.stock+=s.qty;
 sales=sales.filter(x=>x.id!==id); save(); renderSales(); renderHome(); renderProducts();
}

function renderProducts(){
 const q=(document.getElementById("productSearch").value||"").toLowerCase();
 const list=products.filter(p=>(activeCat==="Todos"||p.cat===activeCat)&&p.name.toLowerCase().includes(q));
 document.getElementById("productList").innerHTML=list.map(p=>`<div class="product-item"><div class="product-icon">${p.icon}</div><div style="flex:1"><b>${p.name}</b><small>Stock: ${p.stock}</small><strong>${money(p.price)}</strong></div><span>›</span></div>`).join("")||"<p>No se encontraron productos.</p>";
}
document.getElementById("productSearch").oninput=renderProducts;
document.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));c.classList.add("active");activeCat=c.dataset.cat;renderProducts()});

function renderSummary(){
 const ss=todaySales(), total=ss.reduce((a,s)=>a+s.total,0), items=ss.reduce((a,s)=>a+s.qty,0);
 document.getElementById("sumTotal").textContent=money(total); document.getElementById("sumItems").textContent=items;
 document.getElementById("sumSales").textContent=ss.length; document.getElementById("sumAvg").textContent=money(ss.length?total/ss.length:0);
 const counts={};ss.forEach(s=>counts[s.product]=(counts[s.product]||0)+s.qty);
 const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5), max=top[0]?.[1]||1;
 document.getElementById("topProducts").innerHTML=top.length?top.map(([name,n])=>`<div class="bar"><div class="bar-head"><span>${name}</span><b>${n}</b></div><div class="bar-track"><div class="bar-fill" style="width:${n/max*100}%"></div></div></div>`).join(""):"<p style='color:#71839b'>Registra ventas para ver estadísticas.</p>";
}

function openProductModal(){document.getElementById("productModal").classList.remove("hidden")}
function closeProductModal(){document.getElementById("productModal").classList.add("hidden")}
function addProduct(){
 const name=document.getElementById("newName").value.trim(),price=+document.getElementById("newPrice").value,stock=+document.getElementById("newStock").value,cat=document.getElementById("newCategory").value;
 if(!name||price<0)return alert("Completa el nombre y precio.");
 products.push({id:Date.now(),name,price,stock,cat,icon:cat==="Bebidas"?"🥤":cat==="Snacks"?"🍪":cat==="Aseo"?"🧼":"📦"});
 save();closeProductModal();document.getElementById("newName").value="";document.getElementById("newPrice").value="";document.getElementById("newStock").value="";renderProducts();populateSaleProducts();
}

function setPhoto(file){
 if(!file)return;
 const reader=new FileReader();reader.onload=()=>{localStorage.setItem(KEY_PHOTO,reader.result);applyPhoto(reader.result)};reader.readAsDataURL(file);
}
function applyPhoto(src){
 ["homeAvatar","profileAvatar"].forEach(id=>{const img=document.getElementById(id);img.src=src;img.style.display="block"});
 document.querySelector(".avatar-fallback").style.display="none";
 document.getElementById("profileFallback").style.display="none";
}
document.getElementById("photoInput").onchange=e=>setPhoto(e.target.files[0]);
document.getElementById("photoInput2").onchange=e=>setPhoto(e.target.files[0]);

function logout(){alert("La sesión de Kevin se cerraría aquí. Para una versión con usuarios reales necesitamos un servidor.");}
document.getElementById("menuBtn").onclick=()=>showView("profile");

const savedPhoto=localStorage.getItem(KEY_PHOTO);if(savedPhoto)applyPhoto(savedPhoto);
renderHome();renderProducts();populateSaleProducts();renderSummary();

if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));}

// ===== ROCYINTER - ROCY_DEVISE.JS - V7 SANS FON / GOUN - FICHIER CHEF =====
// Langues : fr, en, es, pt, de, ar, yo - 7 langues
// Traduction auto partout, sans dictionnaire. On n'ecrit que le francais dans les pages.
(function(){
  if(window.__ROCY_UNIFIE_CHARGE) return;
  window.__ROCY_UNIFIE_CHARGE = true;

  // ========== 1. CSS COMMUN ==========
  var css = `
  header{position:sticky;top:0;z-index:100;background:#111;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:10px 12px;width:100%}
  header a{color:#fff;text-decoration:none;font-weight:800;font-size:17px}header a .inter{color:#FFC107}
  .hr{display:flex;gap:6px;align-items:center}
  .langBtn,.menuBtn,.notifBtn{background:#fff;color:#000;border:none;height:32px;padding:0 10px;border-radius:8px;font-weight:600;font-size:11px;cursor:pointer;display:flex;align-items:center;gap:6px}
  .menuBtn{width:32px;padding:0;justify-content:center;font-size:17px;font-weight:900}
  .popMenu{display:none;position:fixed;top:56px;right:10px;background:#fff;color:#111;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.25);width:240px;z-index:1000;padding:8px}
  .popMenu button{display:block;width:100%;text-align:left;padding:11px 10px;border:none;background:none;cursor:pointer;font-size:15px;color:#111;border-radius:8px}
  #menuOverlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000}
  #menuBox{display:none;position:fixed;top:0;right:0;height:100%;width:85%;max-width:360px;background:#fff;color:#111;z-index:1001;flex-direction:column;padding:18px 16px 14px;overflow:auto}
  #menuBox.open{display:flex}
  .menuHead b{font-size:22px;font-weight:900}#menuBox .inter{color:#FFC107}.menuBonjour{color:#666;font-size:14px;margin:6px 0 14px}
  #menuBox a,#menuBox .menuLink{display:block;padding:13px 4px;border-bottom:1px solid #eee;font-size:17px;color:#111;text-decoration:none;background:none;border:none;width:100%;text-align:left;cursor:pointer}#menuBox .rouge{color:#E40000;font-weight:700}
  #menuBox a.grise,#menuBox .menuLink.grise{color:#aaa;cursor:not-allowed;background:#f9f9f9}
  #menuBox a.grise::after{content:" 🔒";font-size:12px}
  #menuFermer{margin-top:auto;background:#000;color:#fff;border:none;padding:13px;border-radius:10px;font-weight:800;font-size:16px;cursor:pointer;width:100%}
  footer{background:#111;color:#fff;text-align:center;padding:10px 12px;font-size:9px;line-height:1.4;margin-top:8px;font-weight:500}footer a{color:#FFC107;text-decoration:none;font-weight:700;font-size:9px}footer p{margin:1px 0}
  @media(min-width:768px){header a{font-size:19px}}
  `;
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ========== 2. ENTETE + MENU + CONVERTISSEUR + PIED DE PAGE ==========
  window.RocyInjecterEntetePied = function(){
    if(!document.querySelector('header')){
      var h = document.createElement('header');
      h.innerHTML = '<a href="index.html">ROCY<span class="inter">INTER</span></a><div class="hr"><button class="notifBtn" onclick="location.href=\'messages.html\'">🔔</button><button class="langBtn" onclick="toggleLang(event)"><span id="langLabel">Français</span> ⌄</button><button class="menuBtn" onclick="toggleMenu(event)">☰</button></div>';
      document.body.insertBefore(h, document.body.firstChild);
    }
    if(!document.getElementById('langBox')){
      var langBox = document.createElement('div');
      langBox.id = 'langBox'; langBox.className = 'popMenu';
      langBox.innerHTML = '<button onclick="changerLangue(\'fr\')">Français</button><button onclick="changerLangue(\'en\')">English</button><button onclick="changerLangue(\'es\')">Español</button><button onclick="changerLangue(\'pt\')">Português</button><button onclick="changerLangue(\'de\')">Deutsch</button><button onclick="changerLangue(\'ar\')">العربية</button><button onclick="changerLangue(\'yo\')">Yoruba</button>';
      document.body.appendChild(langBox);
    }
    if(!document.getElementById('menuBox')){
      var overlay = document.createElement('div');
      overlay.id = 'menuOverlay'; overlay.onclick = function(){ window.fermerMenu(); };
      document.body.appendChild(overlay);
      var menu = document.createElement('div');
      menu.id = 'menuBox';
      menu.innerHTML = '<div class="menuHead"><b>ROCY <span class="inter">INTER</span></b></div><div class="menuBonjour" id="menuBonjour">Bonjour</div><a href="index.html" data-original="Accueil">Accueil</a><a href="messages.html" data-original="💬 Messages">💬 Messages</a><a href="publier.html" data-acces="vendeur" data-original="Publier un produit">Publier un produit</a><a href="vendeur.html" data-acces="vendeur" data-original="Tableau Vendeur">Tableau Vendeur</a><a href="acheteur.html" data-acces="acheteur" data-original="Tableau Acheteur">Tableau Acheteur</a><a href="admin.html" data-acces="admin" data-original="Tableau Admin">Tableau Admin</a><a href="profil.html" data-auth="1" data-original="Profil">Profil</a><a href="conditions.html" data-original="Conditions">Conditions</a><a href="contact.html" data-original="Contact">Contact</a><a href="apropos.html" data-original="À Propos">À Propos</a><button class="menuLink rouge" id="btnAuth" onclick="gererAuth()" data-original="Déconnecter">Déconnecter</button><button id="menuFermer" onclick="fermerMenu()" data-original="Fermer ✕">Fermer ✕</button>';
      document.body.appendChild(menu);
    }
    if(!document.getElementById('devise')){
      var conv = document.createElement('div');
      conv.style.cssText = "max-width:520px;margin:10px auto;padding:0 12px;display:flex;gap:8px;align-items:center;justify-content:space-between";
      conv.innerHTML = '<a href="index.html" style="color:#666;text-decoration:none;font-size:13px" data-original="← Retour">← Retour</a><div style="font-size:13px">💰 <select id="devise" onchange="convertirPrix()"><option value="XOF">FCFA</option><option value="EUR">Euro €</option><option value="USD">Dollar $</option><option value="NGN">Naira ₦</option><option value="GHS">Cedi GH₵</option><option value="GBP">Livre £</option></select><div id="tauxInfo" style="font-size:11px;color:#666;margin-top:4px">Taux en cours...</div></div>';
      var headerEl = document.querySelector('header');
      if(headerEl && headerEl.nextSibling) headerEl.parentNode.insertBefore(conv, headerEl.nextSibling);
      else document.body.appendChild(conv);
    }
    if(!document.querySelector('footer')){
      var f = document.createElement('footer');
      f.innerHTML = '<p>Email : <a href="mailto:rocyinter@gmail.com">rocyinter@gmail.com</a> &nbsp;|&nbsp; Tél : <a href="tel:+2290148270448">+229 01 48 27 04 48</a> / <a href="tel:+2290191478460">01 91 47 84 60</a> &nbsp;|&nbsp; Rocyinter@2026</p>';
      document.body.appendChild(f);
    }
  };

  // ========== 3. CONVERTISSEUR V4 - NE PAS MODIFIER ==========
  window.RocyTaux = { XOF:1, EUR:0.0015, USD:0.0017, NGN:2.55, GHS:0.021, GBP:0.0013 };
  window.RocySymboles = { XOF:" F CFA", EUR:" €", USD:" $", NGN:" ₦", GHS:" GH₵", GBP:" £" };
  window.RocyTauxDateTxt = "";
  try{ var s = JSON.parse(localStorage.getItem("rocy_taux")||"null"); if(s && s.rates){ window.RocyTaux = s.rates; window.RocyTauxDateTxt = s.dateTxt||""; } }catch(e){}
  window.rocy_taux = window.RocyTaux; window.taux = window.RocyTaux; window.symboles = window.RocySymboles; window.RocySymbolesAlias = window.RocySymboles;
  window.RocyDevise = function(){ var ds = localStorage.getItem("rocy_devise"); if(ds) return ds; var el = document.getElementById("devise"); if(el && el.value) return el.value; return "XOF"; };
  window.getDevise = window.RocyDevise;
  window.fmtMontant = function(fcfa){ var dev = window.RocyDevise(); var t = window.RocyTaux[dev] || 1; var v = Number(fcfa||0) * t; var sym = window.RocySymboles[dev] || ""; if(dev === "XOF"){ return Math.round(v).toLocaleString('fr-FR') + sym; } else { return v.toLocaleString('fr-FR', {minimumFractionDigits:2, maximumFractionDigits:2}) + sym; } };
  window.RocyTauxCommission = function(totalFCFA){ var total = Number(totalFCFA||0); if(total <= 500000) return 0.085; if(total <= 2000000) return 0.075; return 0.065; };
  window.RocyCalculCommande = function(totalFCFA){ var total = Number(totalFCFA||0); var tauxComm = window.RocyTauxCommission(total); var commission = total * tauxComm; var vendeurTouche = total - commission; return { total: total, tauxCommission: tauxComm, commission: commission, vendeurTouche: vendeurTouche }; };
  window.RocyRestaurerDevise = function(){ var ds = localStorage.getItem("rocy_devise"); var el = document.getElementById("devise"); if(el && ds) el.value = ds; var sel2 = document.getElementById("selectDevise"); if(sel2 && ds) sel2.value = ds; var lbl = document.getElementById("deviseLabel"); if(lbl) lbl.textContent = (window.RocySymboles[ds||"XOF"]||"F CFA").trim(); };
  window.RocyAfficherTaux = function(){ var info = document.getElementById("tauxInfo"); if(info){ var dev = window.RocyDevise(); if(dev === "XOF") info.textContent = "Taux du " + (window.RocyTauxDateTxt || "jour") + " • Base FCFA"; else info.textContent = "Taux live du " + (window.RocyTauxDateTxt || "jour") + " • 1 FCFA = " + window.RocyTaux[dev] + " " + dev; } var info2 = document.getElementById("tauxInfoProfil"); if(info2){ var dev2 = window.RocyDevise(); if(dev2 === "XOF") info2.textContent = "Devise : FCFA - pas de conversion"; else info2.textContent = "Taux live : 1 FCFA = " + window.RocyTaux[dev2] + " " + dev2 + " - Affichage en " + dev2; } };
  window.RocyConvertirPrixPage = function(){ document.querySelectorAll(".prix, [data-prix]").forEach(function(el){ var fcfa = parseFloat(el.getAttribute("data-prix")); if(!isNaN(fcfa)) el.innerText = window.fmtMontant(fcfa); }); if(typeof soldeFCFAActuel !== "undefined" && document.getElementById("soldeProfil")){ if(typeof afficherSolde === "function") afficherSolde(soldeFCFAActuel); } window.RocyAfficherTaux(); if(typeof window.afficherTotaux === "function") { try{ window.afficherTotaux(); }catch(e){} } if(typeof window.afficherBilan === "function" && typeof window.periodeBilan !== "undefined") { try{ window.afficherBilan(window.periodeBilan); }catch(e){} } };
  window.convertirPrix = function(){ var el = document.getElementById("devise"); if(el) localStorage.setItem("rocy_devise", el.value); window.RocyConvertirPrixPage(); };
  window.RocyChargerTauxLive = async function(){ try{ var res = await fetch("https://open.er-api.com/v6/latest/XOF"); var data = await res.json(); if(data && data.rates){ window.RocyTaux = { XOF:1, EUR:data.rates.EUR, USD:data.rates.USD, NGN:data.rates.NGN, GHS:data.rates.GHS, GBP:data.rates.GBP }; window.rocy_taux = window.RocyTaux; window.taux = window.RocyTaux; var d = new Date(); window.RocyTauxDateTxt = d.toLocaleDateString("fr-FR") + " à " + d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}); localStorage.setItem("rocy_taux", JSON.stringify({ rates: window.RocyTaux, dateTxt: window.RocyTauxDateTxt, ts: Date.now() })); } }catch(e){} window.RocyConvertirPrixPage(); };
  window.chargerTauxLive = window.RocyChargerTauxLive; window.chargerTaux = window.RocyChargerTauxLive; window.chargerTauxInstantT = window.RocyChargerTauxLive;
  window.majTexteCommission = window.majTexteCommission || function(){};

  // ========== 4. TRADUCTION AUTO PARTOUT - SANS DICTIONNAIRE - SANS FON / GOUN ==========
  window.LANGUE_ACTUELLE = localStorage.getItem("rocy_lang") || "fr";
  window.LANGUE = window.LANGUE_ACTUELLE;
  window.NOMS_LANG = {fr:"Français",en:"English",es:"Español",pt:"Português",de:"Deutsch",ar:"العربية",yo:"Yoruba"};
  window.cacheTraduction = {};
  try{ window.cacheTraduction = JSON.parse(localStorage.getItem("rocy_trad_cache")||"{}"); }catch(e){ window.cacheTraduction={}; }
  window.sauverCacheTrad = function(){ try{ localStorage.setItem("rocy_trad_cache", JSON.stringify(window.cacheTraduction)); }catch(e){} };
  window.traduireAuto = async function(texte, langueCible){
    if(!texte || !texte.trim()) return texte;
    if(langueCible==='fr') return texte;
    var cle = langueCible+'||'+texte;
    if(window.cacheTraduction[cle]) return window.cacheTraduction[cle];
    try{
      var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl="+langueCible+"&dt=t&q="+encodeURIComponent(texte);
      var r = await fetch(url);
      var j = await r.json();
      var trad = "";
      if(j && j[0]){ for(var i=0;i<j[0].length;i++){ trad += j[0][i][0]; } }
      if(!trad) trad = texte;
      trad = trad.replace(/Rocy Inter/gi,"ROCY INTER").replace(/Rocyinter/gi,"ROCY INTER");
      window.cacheTraduction[cle]=trad; window.sauverCacheTrad();
      return trad;
    }catch(e){ return texte; }
  };
  window.traduireTouteLaPage = function(){
    if(window.LANGUE_ACTUELLE==='fr'){
      document.querySelectorAll('[data-original]').forEach(function(el){ el.textContent = el.getAttribute('data-original'); });
      document.querySelectorAll('[data-ph-original]').forEach(function(el){ el.placeholder = el.getAttribute('data-ph-original'); });
      return;
    }
    var els = document.querySelectorAll('[data-original]');
    els.forEach(function(el, idx){
      setTimeout(function(){
        window.traduireAuto(el.getAttribute('data-original'), window.LANGUE_ACTUELLE).then(function(t){ if(el.isConnected) el.textContent = t; });
      }, 100 + idx*100);
    });
    document.querySelectorAll('[data-ph-original]').forEach(function(el, idx){
      setTimeout(function(){
        window.traduireAuto(el.getAttribute('data-ph-original'), window.LANGUE_ACTUELLE).then(function(t){ if(el.isConnected) el.placeholder = t; });
      }, 100 + idx*100);
    });
  };
  window.traduireProduitsAffiches = window.traduireTouteLaPage;
  window.changerLangue = function(v){
    window.LANGUE_ACTUELLE = v; window.LANGUE = v;
    localStorage.setItem("rocy_lang", v);
    var box = document.getElementById("langBox"); if(box) box.style.display="none";
    var ll = document.getElementById("langLabel"); if(ll) ll.innerText = window.NOMS_LANG[v]||"Français";
    window.fermerMenu();
    window.traduireTouteLaPage();
    if(typeof window.RocyChargerTauxLive === "function") window.RocyChargerTauxLive();
  };

  // ========== 5. MENU / LANGUE / AUTH ==========
  window.toggleLang = function(e){ if(e) e.stopPropagation(); var b=document.getElementById("langBox"); window.fermerMenu(); b.style.display=(b.style.display==="block")?"none":"block"; };
  window.toggleMenu = function(e){ if(e) e.stopPropagation(); var m=document.getElementById("menuBox"); var o=document.getElementById("menuOverlay"); var l=document.getElementById("langBox"); if(l) l.style.display="none"; if(m.classList.contains("open")){ window.fermerMenu(); }else{ m.classList.add("open"); o.style.display="block"; window.majMenu(); } };
  window.fermerMenu = function(){ var m=document.getElementById("menuBox"); var o=document.getElementById("menuOverlay"); if(m) m.classList.remove("open"); if(o) o.style.display="none"; };
  window.getRole = function(){ return localStorage.getItem("rocy_role")||localStorage.getItem("role_user")||"visiteur"; };
  window.majMenu = function(){ var role=localStorage.getItem("role_user")||localStorage.getItem("rocy_role")||""; var email=localStorage.getItem("email_user")||""; var nom=localStorage.getItem("nom_user")||"Visiteur"; var connecte=!!email; var bj=document.getElementById("menuBonjour"); if(bj) bj.innerText="Bonjour, "+nom+" ("+(connecte?(role||"visiteur"):"visiteur")+")"; document.querySelectorAll("#menuBox [data-auth]").forEach(function(a){ if(!connecte){ a.classList.add("grise"); a.onclick=function(ev){ ev.preventDefault(); location.href="connexion.html"; return false; }; }else{ a.classList.remove("grise"); a.onclick=null; } }); document.querySelectorAll("#menuBox [data-acces]").forEach(function(a){ var besoin=a.getAttribute("data-acces"); var ok=false; if(role==="admin") ok=true; else if(connecte&&role===besoin) ok=true; if(ok){ a.classList.remove("grise"); a.onclick=null; }else{ a.classList.add("grise"); a.onclick=function(ev){ ev.preventDefault(); if(!connecte) location.href="connexion.html"; else alert("Accès réservé"); return false; }; } }); var b=document.getElementById("btnAuth"); if(b) b.innerText=connecte?"Déconnecter":"Connecter"; };
  window.gererAuth = function(){ var email=localStorage.getItem("email_user"); if(email){ localStorage.removeItem("email_user"); localStorage.removeItem("user_id"); localStorage.removeItem("role_user"); localStorage.removeItem("rocy_role"); location.href="index.html"; }else location.href="connexion.html"; };

  document.addEventListener("click", function(e){ if(!e.target.closest("#langBox")&&!e.target.closest(".langBtn")){ var l=document.getElementById("langBox"); if(l) l.style.display="none"; } });
  document.addEventListener("DOMContentLoaded", function(){
    window.RocyInjecterEntetePied();
    window.RocyRestaurerDevise();
    window.RocyAfficherTaux();
    window.RocyChargerTauxLive();
    window.majMenu();
    var saved=localStorage.getItem("rocy_lang"); if(saved){ window.LANGUE_ACTUELLE=saved; window.LANGUE=saved; var ll=document.getElementById("langLabel"); if(ll) ll.innerText=window.NOMS_LANG[saved]||"Français"; window.traduireTouteLaPage(); }
  });
  setTimeout(function(){ window.RocyInjecterEntetePied(); window.RocyRestaurerDevise(); window.RocyAfficherTaux(); }, 500);
  document.addEventListener("rocy_devise_change", function(){ window.RocyConvertirPrixPage(); });
})();

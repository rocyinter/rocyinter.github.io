// ===== AUTO-CHARGEMENT ROCY DEVISE - CAS B §19 - NE TOUCHE À RIEN D'AUTRE =====
(function(){
  if(window.__ROCY_DEVISE_CHARGE) return;
  window.__ROCY_DEVISE_CHARGE = true;
  var s = document.createElement("script");
  s.src = "rocy_devise.js";
  s.defer = true;
  document.head.appendChild(s);
})();
// ===== ROCYINTER - COMMUN.JS - V4 CAHIER FINAL =====
// Ne casse JAMAIS les autres pages. Ne touche pas à window.supabase (lib).

if(typeof window.rocyClient === "undefined"){
  window.ROCY_SUPABASE_URL = 'https://ahoxxzmdjxqvvpphxeow.supabase.co';
  window.ROCY_SUPABASE_KEY = 'sb_publishable_Q2oaPQMj4H_cTlZCKKh6Jg_FVIa7VE3';
  try{
    if(window.supabase && window.supabase.createClient){
      window.rocyClient = window.supabase.createClient(window.ROCY_SUPABASE_URL, window.ROCY_SUPABASE_KEY);
      if(!window.supabaseClient) window.supabaseClient = window.rocyClient;
      if(!window.sb) window.sb = window.rocyClient;
    }
  }catch(e){ console.log("supabase commun non cree", e); }
}

// --- LOGS LEGAUX Benin / APDP ---
async function enregistrerLog(action, email){
  try{
    var client = window.rocyClient || window.supabaseClient;
    if(!client) return;
    await client.from('logs').insert([{
      action: action,
      email: email || localStorage.getItem("email_user") || localStorage.getItem("rocy_user") || "visiteur",
      page: window.location.pathname + window.location.search,
      created_at: new Date().toISOString()
    }]);
  }catch(e){ console.log("log non enregistre", e); }
}
window.enregistrerLog = enregistrerLog;
document.addEventListener("DOMContentLoaded", function(){ setTimeout(function(){ enregistrerLog('visite_page'); }, 1000); });

// --- ROLES ---
if(typeof window.getRole === "undefined"){
  window.getRole = function(){ return localStorage.getItem("rocy_role") || localStorage.getItem("role_user") || "visiteur"; };
}
// §3 DÉCONNEXION 1 CLIC DANS ☰ - CORRIGÉ : on enlève TOUT
window.deconnexionCommun = function(){
  enregistrerLog('deconnexion');
  ["rocy_role","role_user","rocy_user","email_user","nom_user","user_id","retour_apres_connexion","retour_apres_profil"].forEach(function(k){ localStorage.removeItem(k); });
  window.location.href = "index.html";
};
window.deconnexion = window.deconnexionCommun;

// ===== RÉPARATION /ar, /en... =====
(function(){
  try{
    var path = window.location.pathname.replace(/^\/+|\/+$/g, "");
    var languesUrl = ["fr","en","yo","fon","goun","es","pt","de","ar"];
    if(languesUrl.indexOf(path) !== -1){ localStorage.setItem("rocy_lang", path); window.location.replace("index.html"); }
    if(window.location.pathname.indexOf("article.html") !== -1){
      var params = new URLSearchParams(window.location.search);
      if(!params.get("id")){
        var dernier = localStorage.getItem("rocy_dernier_produit_id");
        if(dernier) window.location.replace("article.html?id=" + dernier);
      } else { try{ localStorage.setItem("rocy_dernier_produit_id", params.get("id")); }catch(e){} }
    }
    document.addEventListener("click", function(e){
      var a = e.target.closest ? e.target.closest('a[href*="article.html?id="]') : null;
      if(a){ try{ var u = new URL(a.getAttribute("href"), window.location.href); var id = u.searchParams.get("id"); if(id) localStorage.setItem("rocy_dernier_produit_id", id); }catch(err){} }
    }, true);
  }catch(e){ console.log("fix url", e); }
})();

// ===== RÉPARATION ARTICLE.HTML - SANS ANCIEN TAUX, SANS ÉCRASER ROCY_DEVISE =====
document.addEventListener("DOMContentLoaded", function(){
  setTimeout(async function(){
    try{
      if(window.location.pathname.indexOf("article.html") === -1) return;
      var nomEl = document.getElementById("nomProduit");
      if(!nomEl) return;
      var txt = (nomEl.textContent || "").trim();
      if(txt !== "Chargement..." && txt !== "") return;
      var params = new URLSearchParams(window.location.search);
      var produitId = params.get("id") || localStorage.getItem("rocy_dernier_produit_id");
      if(!produitId){
        var err = document.getElementById("msgErreur");
        if(nomEl) nomEl.textContent = "Aucun produit selectionne";
        if(err){ err.style.display = "block"; err.innerHTML = "Aucun produit selectionne. Va sur <b>Accueil</b> et clique sur un produit.<br><br><button onclick=\"window.location.href='index.html'\" style=\"background:#111;color:#fff;border:0;padding:8px 12px;border-radius:8px;font-weight:700\">Retour a l'accueil</button>"; }
        return;
      }
      var client = window.rocyClient || window.supabaseClient;
      if(!client) return;
      var res = await client.from("produits").select("*").eq("id", produitId).single();
      if(res.error || !res.data){ if(nomEl) nomEl.textContent = "Produit introuvable"; return; }
      var p = res.data;
      if(nomEl){ nomEl.textContent = p.nom || ""; nomEl.setAttribute("data-original", p.nom || ""); }
      var img = document.getElementById("photoProduit");
      if(img && (p.photo || p.image)){ img.src = p.photo || p.image; img.style.display = "block"; }
      var prixEl = document.getElementById("prixProduit");
      // ✅ ON NE CALCULE PLUS LE PRIX ICI - c'est rocy_devise.js qui fait fmtMontant()
      if(prixEl){ prixEl.setAttribute("data-prix", p.prix); if(window.fmtMontant) prixEl.textContent = window.fmtMontant(Number(p.prix)); else prixEl.textContent = Number(p.prix).toLocaleString('fr-FR') + " F CFA"; }
      var villeEl = document.getElementById("villeProduit");
      if(villeEl){ villeEl.textContent = p.ville || ""; villeEl.setAttribute("data-original", p.ville || ""); }
      var descEl = document.getElementById("descProduit");
      if(descEl){ descEl.textContent = p.description || ""; descEl.setAttribute("data-original", p.description || ""); }
      var descPop = document.getElementById("descPopup");
      if(descPop) descPop.textContent = p.description || "";
      var nomV = p.nom_vendeur || p.vendeur_nom || "";
      var villeV = p.ville || "";
      var photoV = p.photo_vendeur || p.avatar_vendeur || p.photo_profil_vendeur || "";
      var vendeurId = p.vendeur_id || "";
      var nomEstFaux = !nomV || nomV.toLowerCase() === "vendeur" || nomV.toLowerCase() === "seller";
      if(nomEstFaux && vendeurId){
        try{
          var r2 = await client.from("profils").select("nom, nom_complet, nom_entreprise, ville, photo, photo_profil, avatar").eq("id", vendeurId).single();
          if(r2 && r2.data){ var pr = r2.data; var vrai = pr.nom_entreprise || pr.nom_complet || pr.nom || ""; if(vrai) nomV = vrai; if(pr.ville) villeV = pr.ville; if(pr.photo_profil || pr.photo || pr.avatar) photoV = pr.photo_profil || pr.photo || pr.avatar; }
        }catch(e){}
      }
      if(!nomV) nomV = "Vendeur";
      var nomVEl = document.getElementById("nomVendeur");
      if(nomVEl){ nomVEl.textContent = nomV; nomVEl.setAttribute("data-original", nomV); nomVEl.setAttribute("data-ne-pas-traduire", "1"); }
      var infoEl = document.getElementById("infoVendeur");
      if(infoEl){ infoEl.textContent = villeV; infoEl.setAttribute("data-original", villeV); }
      var av = document.getElementById("avatarVendeur");
      if(av){ if(photoV) av.innerHTML = '<img src="' + photoV + '" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.textContent=\'' + nomV.charAt(0) + '\'">'; else av.textContent = nomV.charAt(0); }
      // ✅ COMMISSION : on laisse rocy_devise.js calculer avec RocyCalculCommande()
      if(typeof window.mettreAJourPrix === "function"){ try{ window.mettreAJourPrix(); }catch(e){} }
      if(typeof window.appliquerTraductionProduits === "function"){ try{ window.appliquerTraductionProduits(); }catch(e){} }
    }catch(e){ console.log("reparation article", e); }
  }, 2500);
});

// ===== §4-§6-§12 ENTETE : BOUTON DEVISE + MENU + LANGUE - CRÉÉS PAR COMMUN.JS =====
var DEVISES_ROCY = [
  {code:'XOF', label:'FCFA - Franc CFA', symbole:'F CFA'},
  {code:'EUR', label:'Euro €', symbole:'€'},
  {code:'USD', label:'Dollar $', symbole:'$'},
  {code:'NGN', label:'Naira ₦', symbole:'₦'},
  {code:'GHS', label:'Cedi GH₵', symbole:'GH₵'},
  {code:'GBP', label:'Livre £', symbole:'£'}
];
function getDeviseActuelle(){ return localStorage.getItem('rocy_devise') || 'XOF'; }
function getLabelDevise(code){ var d = DEVISES_ROCY.find(function(x){ return x.code===code; }); return d ? d.symbole : code; }
function togglePopupDevise(){
  var pl = document.getElementById('popupLangue'); if(pl) pl.style.display='none';
  var p = document.getElementById('popupDevise'); if(!p) return;
  p.style.display = (p.style.display==='block' ? 'none' : 'block');
}
function togglePopupLangue(){
  var pd = document.getElementById('popupDevise'); if(pd) pd.style.display='none';
  var p = document.getElementById('popupLangue'); if(!p) return;
  p.style.display = (p.style.display==='block' ? 'none' : 'block');
}
function changerDeviseGlobal(devise){
  localStorage.setItem('rocy_devise', devise);
  var lbl = document.getElementById('deviseLabel'); if(lbl) lbl.textContent = getLabelDevise(devise);
  var p = document.getElementById('popupDevise'); if(p) p.style.display='none';
  var sel = document.getElementById('selectDevise'); if(sel) sel.value = devise;
  if(window.chargerTauxLive) window.chargerTauxLive();
  document.dispatchEvent(new CustomEvent('rocy_devise_change', {detail:{devise:devise}}));
  if(typeof afficherSolde !== 'undefined' && typeof soldeFCFAActuel !== 'undefined') afficherSolde(soldeFCFAActuel);
  if(typeof afficherProduits === 'function') afficherProduits();
  if(typeof afficherCommandes === 'function') afficherCommandes();
  if(typeof afficherTotaux === 'function') afficherTotaux();
  if(typeof afficherBilan === 'function') afficherBilan();
  if(typeof chargerRetraits === 'function' && typeof monProfil !== 'undefined' && monProfil) chargerRetraits(monProfil.id);
}
function creerBoutonDeviseHeader(){
  // Ne pas créer sur connexion / inscription - §9 entête spéciale
  if(window.location.pathname.includes('connexion') || window.location.pathname.includes('inscription')) return;
  var headerRight = document.querySelector('.header-right') || document.querySelector('header div:last-child');
  if(!headerRight) return;
  if(document.getElementById('btnDevise')) return;
  var btn = document.createElement('button');
  btn.id = 'btnDevise'; btn.type = 'button';
  btn.innerHTML = '💱 <span id="deviseLabel">' + getLabelDevise(getDeviseActuelle()) + '</span> ⌄';
  btn.style.cssText = 'height:32px;max-width:110px;background:#FFC107;color:#000;border:none;border-radius:8px;font-size:11px;font-weight:700;padding:0 8px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
  btn.onclick = togglePopupDevise;
  var btnLangue = document.getElementById('btnLangue');
  if(btnLangue && btnLangue.parentNode === headerRight) headerRight.insertBefore(btn, btnLangue);
  else headerRight.appendChild(btn);
  if(!document.getElementById('popupDevise')){
    var popup = document.createElement('div');
    popup.id = 'popupDevise';
    popup.style.cssText = 'display:none;position:fixed;top:52px;right:110px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.2);z-index:200;padding:8px;min-width:180px';
    popup.innerHTML = DEVISES_ROCY.map(function(d){ return '<button type="button" onclick="changerDeviseGlobal(\''+d.code+'\')" style="display:block;width:100%;text-align:left;background:none;border:none;padding:10px;border-radius:8px;font-size:14px;cursor:pointer;color:#111">'+d.label+'</button>'; }).join('');
    document.body.appendChild(popup);
  }
  document.addEventListener('click', function(e){
    var pp = document.getElementById('popupDevise');
    if(!pp || pp.style.display!=='block') return;
    if(e.target.closest('#btnDevise') || e.target.closest('#popupDevise')) return;
    pp.style.display='none';
  });
}
document.addEventListener('DOMContentLoaded', creerBoutonDeviseHeader);
setTimeout(creerBoutonDeviseHeader, 500);
setTimeout(creerBoutonDeviseHeader, 1500);
window.changerDeviseGlobal = changerDeviseGlobal;
window.togglePopupDevise = togglePopupDevise;
window.togglePopupLangue = togglePopupLangue;
// NE PAS DEFINIR changerLangue ICI - c'est chaque page qui gère son DICT, commun ne fait que le popup
// NE PAS DEFINIR googleTranslateElementInit ICI

// ===== BLOCAGE RETRAIT SANS VRAI EMAIL - DANS COMMUN.JS, UNE SEULE FOIS =====
function aVraiEmailRetrait(){
  var e = localStorage.getItem('email_user') || '';
  if(!e) return false;
  if(e.endsWith('@rocyinter.bj')) return false;
  if(!e.includes('@')) return false;
  return true;
}
function allerProfilRetrait(){
  var page = window.location.pathname.split('/').pop() || 'vendeur.html';
  localStorage.setItem('retour_apres_profil', page);
  window.location.href = 'profil.html';
}
function trouverBoutonsRetrait(){
  var tous = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
  var trouves = [];
  tous.forEach(function(b){
    var txt = (b.textContent || b.value || '').toLowerCase();
    var onclick = (b.getAttribute('onclick') || '').toLowerCase();
    var cls = (b.className || '').toString().toLowerCase();
    if(cls.indexOf('btn-retrait') !== -1 || txt.indexOf('retir') !== -1 || onclick.indexOf('retir') !== -1){
      if(b.id !== 'btnAllerProfilRetrait') trouves.push(b);
    }
  });
  return trouves;
}
function verifierEmailAuRetrait(){
  var btns = trouverBoutonsRetrait();
  if(btns.length === 0) return true;
  var bloc = document.getElementById('blocEmailRetrait');
  if(!bloc){
    bloc = document.createElement('div');
    bloc.id = 'blocEmailRetrait';
    bloc.style.cssText = 'display:none;background:#FFF3E8;border:1px solid #FFC107;padding:12px;border-radius:10px;margin-bottom:12px';
    bloc.innerHTML = '<b style="font-size:14px">⚠️ Tu ne peux pas retirer sans vrai email</b><br><small style="font-size:12px;color:#666">Va compléter ton vrai email dans <b>Profil</b>, puis reviens ici pour retirer ton argent.</small><br><button id="btnAllerProfilRetrait" onclick="allerProfilRetrait()" style="width:100%;background:#111;color:#fff;border:none;padding:12px;border-radius:10px;font-weight:bold;margin-top:10px;cursor:pointer">ALLER COMPLÉTER MON EMAIL DANS PROFIL →</button>';
    if(btns[0].parentNode) btns[0].parentNode.insertBefore(bloc, btns[0]);
  }
  if(!aVraiEmailRetrait()){
    bloc.style.display = 'block';
    btns.forEach(function(b){
      if(!b.dataset.texteOrigine) b.dataset.texteOrigine = b.textContent || b.value;
      b.disabled = true; b.style.opacity = '0.5';
      if(b.tagName === 'INPUT') b.value = 'COMPLÈTE TON EMAIL DANS PROFIL D’ABORD';
      else b.textContent = 'COMPLÈTE TON EMAIL DANS PROFIL D’ABORD';
    });
    return false;
  } else {
    bloc.style.display = 'none';
    btns.forEach(function(b){
      b.disabled = false; b.style.opacity = '1';
      if(b.dataset.texteOrigine){ if(b.tagName === 'INPUT') b.value = b.dataset.texteOrigine; else b.textContent = b.dataset.texteOrigine; }
    });
    return true;
  }
}
document.addEventListener('click', function(e){
  var btn = e.target.closest ? e.target.closest('button, a, input') : null;
  if(!btn) return;
  var txt = (btn.textContent || btn.value || '').toLowerCase();
  var onclick = (btn.getAttribute('onclick') || '').toLowerCase();
  var cls = (btn.className || '').toString().toLowerCase();
  var estRetrait = cls.indexOf('btn-retrait') !== -1 || txt.indexOf('retir') !== -1 || onclick.indexOf('retir') !== -1;
  if(estRetrait && btn.id !== 'btnAllerProfilRetrait' && !aVraiEmailRetrait()){
    e.preventDefault(); e.stopPropagation();
    alert('Va compléter ton vrai email dans Profil pour retirer ton argent.');
    allerProfilRetrait();
  }
}, true);
document.addEventListener('DOMContentLoaded', verifierEmailAuRetrait);
setTimeout(verifierEmailAuRetrait, 1000);
setTimeout(verifierEmailAuRetrait, 3000);

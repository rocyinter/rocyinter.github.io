// ===== COMMUN.JS - NETTOYÉ V7 - CAHIER V7 §12 =====
// RÈGLE : commun.js ne doit PLUS contenir header, footer, traduction, convertisseur en double.
// Le chef unique c'est rocy_devise.js V7.
// commun.js garde seulement : Supabase, logs APDP, rôles, déconnexion, blocage retrait sans email, petite réparation article.
// Il appelle chargerTauxLive() qui est l'alias de RocyChargerTauxLive() dans rocy_devise.js.

// ===== SUPABASE CLIENT UNIQUE =====
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

// ===== TAUX LIVE - ALIAS VERS LE CHEF rocy_devise.js V7 =====
// Ne pas recalculer les taux ici. Le chef c'est RocyChargerTauxLive() dans rocy_devise.js.
function chargerTauxLive(){
  if(typeof window.RocyChargerTauxLive === "function"){ return window.RocyChargerTauxLive(); }
  if(typeof window.chargerTauxLiveChef === "function"){ return window.chargerTauxLiveChef(); }
  return Promise.resolve(null);
}
window.chargerTauxLive = chargerTauxLive;

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
// Déconnexion 1 clic dans ☰
window.deconnexionCommun = function(){
  enregistrerLog('deconnexion');
  ["rocy_role","role_user","rocy_user","email_user","nom_user","user_id","retour_apres_connexion","retour_apres_profil","statut_user","type_compte"].forEach(function(k){ localStorage.removeItem(k); });
  window.location.href = "index.html";
};
window.deconnexion = window.deconnexionCommun;

// ===== RÉPARATION /ar, /en... - 7 LANGUES SEULEMENT, SANS FON / GOUN =====
(function(){
  try{
    var path = window.location.pathname.replace(/^\/+|\/+$/g, "");
    var languesUrl = ["fr","en","es","pt","de","ar","yo"];
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
      if(prixEl){ prixEl.setAttribute("data-prix", p.prix); if(window.fmtMontant) prixEl.textContent = window.fmtMontant(Number(p.prix)); else prixEl.textContent = Number(p.prix).toLocaleString('fr-FR') + " F"; }
      var villeEl = document.getElementById("villeProduit");
      if(villeEl){ villeEl.textContent = p.ville || ""; villeEl.setAttribute("data-original", p.ville || ""); }
      var descEl = document.getElementById("descProduit");
      if(descEl){ descEl.textContent = p.description || ""; descEl.setAttribute("data-original", p.description || ""); }
      var nomV = p.nom_vendeur || p.vendeur_nom || "";
      var vendeurId = p.vendeur_id || "";
      var nomEstFaux = !nomV || nomV.toLowerCase() === "vendeur" || nomV.toLowerCase() === "seller";
      if(nomEstFaux && vendeurId){
        try{
          var r2 = await client.from("profils").select("nom, nom_complet, nom_entreprise, ville, photo, photo_profil, avatar").eq("id", vendeurId).single();
          if(r2 && r2.data){ var pr = r2.data; var vrai = pr.nom_entreprise || pr.nom_complet || pr.nom || ""; if(vrai) nomV = vrai; }
        }catch(e){}
      }
      if(!nomV) nomV = "Vendeur";
      var nomVEl = document.getElementById("nomVendeur");
      if(nomVEl){ nomVEl.textContent = nomV; nomVEl.setAttribute("data-original", nomV); nomVEl.setAttribute("data-ne-pas-traduire", "1"); }
      if(typeof window.mettreAJourPrix === "function"){ try{ window.mettreAJourPrix(); }catch(e){} }
    }catch(e){ console.log("reparation article", e); }
  }, 2500);
});

// ===== BLOCAGE RETRAIT SANS VRAI EMAIL - UNE SEULE FOIS =====
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
window.aVraiEmailRetrait = aVraiEmailRetrait;
window.allerProfilRetrait = allerProfilRetrait;
window.verifierEmailAuRetrait = verifierEmailAuRetrait;

// ===== ROCYINTER - COMMUN.JS - V3 SECURISE =====
// Compatible avec RLS Supabase Etapes 1-9
// Regle : commun.js ne casse JAMAIS les autres pages.
// Il ne touche pas a window.supabase (la bibliotheque), il ne redirige jamais vers /ar, /en...
// Il ne modifie JAMAIS le prix, ne supprime JAMAIS un produit.

// 1. SUPABASE : on ne remplace JAMAIS window.supabase
// On utilise un autre nom : window.rocyClient
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
// NE JAMAIS FAIRE : window.supabase = window.supabaseClient;
// NE JAMAIS METTRE la cle service_role ici

// --- LOGS LEGAUX Benin / APDP - Ne bloque JAMAIS le site ---
async function enregistrerLog(action, email){
  try{
    if(!window.rocyClient && !window.supabaseClient) return;
    var client = window.rocyClient || window.supabaseClient;
    await client.from('logs').insert([{
      action: action,
      email: email || localStorage.getItem("rocy_user") || "visiteur",
      page: window.location.pathname + window.location.search,
      created_at: new Date().toISOString()
    }]);
  }catch(e){ console.log("log non enregistre", e); }
}
window.enregistrerLog = enregistrerLog;

document.addEventListener("DOMContentLoaded", function(){
  setTimeout(function(){ enregistrerLog('visite_page'); }, 1000);
});

// --- ROLES ---
if(typeof window.getRole === "undefined"){
  window.getRole = function(){
    return localStorage.getItem("rocy_role") || localStorage.getItem("role_user") || "visiteur";
  };
}
if(typeof window.deconnexionCommun === "undefined"){
  window.deconnexionCommun = function(){
    enregistrerLog('deconnexion');
    localStorage.removeItem("rocy_role");
    localStorage.removeItem("rocy_user");
    window.location.href = "index.html";
  };
}

// ===== 2. REPARATION /ar, /en, /fr... =====
(function(){
  try{
    var path = window.location.pathname.replace(/^\/+|\/+$/g, "");
    var languesUrl = ["fr","en","yo","fon","goun","es","pt","de","ar"];
    if(languesUrl.indexOf(path) !== -1){
      localStorage.setItem("rocy_lang", path);
      window.location.replace("index.html");
    }
    if(window.location.pathname.indexOf("article.html") !== -1){
      var params = new URLSearchParams(window.location.search);
      if(!params.get("id")){
        var dernier = localStorage.getItem("rocy_dernier_produit_id");
        if(dernier){
          window.location.replace("article.html?id=" + dernier);
        }
      } else {
        try{ localStorage.setItem("rocy_dernier_produit_id", params.get("id")); }catch(e){}
      }
    }
    document.addEventListener("click", function(e){
      var a = e.target.closest ? e.target.closest('a[href*="article.html?id="]') : null;
      if(a){
        try{
          var u = new URL(a.getAttribute("href"), window.location.href);
          var id = u.searchParams.get("id");
          if(id) localStorage.setItem("rocy_dernier_produit_id", id);
        }catch(err){}
      }
    }, true);
  }catch(e){ console.log("fix url", e); }
})();

// ===== 3. REPARATION ARTICLE.HTML SI IL RESTE SUR "Chargement..." =====
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
      if(!client && window.supabase && window.supabase.createClient){
        try{ client = window.supabase.createClient(window.ROCY_SUPABASE_URL, window.ROCY_SUPABASE_KEY); }catch(e){}
      }
      if(!client) return;

      // LECTURE SEULE - securise par RLS : tout le monde peut voir les produits
      var res = await client.from("produits").select("*").eq("id", produitId).single();
      if(res.error || !res.data){
        if(nomEl) nomEl.textContent = "Produit introuvable";
        return;
      }
      var p = res.data;

      if(nomEl){ nomEl.textContent = p.nom || ""; nomEl.setAttribute("data-original", p.nom || ""); }
      var img = document.getElementById("photoProduit");
      if(img && (p.photo || p.image)){ img.src = p.photo || p.image; img.style.display = "block"; }
      var prixEl = document.getElementById("prixProduit");
      if(prixEl){ prixEl.setAttribute("data-prix", p.prix); prixEl.textContent = Number(p.prix).toLocaleString() + " F"; }
      var villeEl = document.getElementById("villeProduit");
      if(villeEl){ villeEl.textContent = p.ville || ""; villeEl.setAttribute("data-original", p.ville || ""); }
      var descEl = document.getElementById("descProduit");
      if(descEl){ descEl.textContent = p.description || ""; descEl.setAttribute("data-original", p.description || ""); }
      var descPop = document.getElementById("descPopup");
      if(descPop) descPop.textContent = p.description || "";

      // --- VRAI NOM VENDEUR, pas "Vendeur" - CORRIGE V3 : vendeur_id seulement ---
      var nomV = p.nom_vendeur || p.vendeur_nom || "";
      var villeV = p.ville || "";
      var photoV = p.photo_vendeur || p.avatar_vendeur || p.photo_profil_vendeur || "";
      var vendeurId = p.vendeur_id || ""; // PLUS DE p.user_id ICI
      var nomEstFaux = !nomV || nomV.toLowerCase() === "vendeur" || nomV.toLowerCase() === "seller";
      if(nomEstFaux && vendeurId){
        try{
          var r2 = await client.from("profils").select("nom, nom_complet, nom_entreprise, ville, photo, photo_profil, avatar").eq("id", vendeurId).single();
          if(r2 && r2.data){
            var pr = r2.data;
            var vrai = pr.nom_entreprise || pr.nom_complet || pr.nom || "";
            if(vrai) nomV = vrai;
            if(pr.ville) villeV = pr.ville;
            if(pr.photo_profil || pr.photo || pr.avatar) photoV = pr.photo_profil || pr.photo || pr.avatar;
          }
        }catch(e){}
      }
      if(!nomV) nomV = "Vendeur";
      var nomVEl = document.getElementById("nomVendeur");
      if(nomVEl){ nomVEl.textContent = nomV; nomVEl.setAttribute("data-original", nomV); nomVEl.setAttribute("data-ne-pas-traduire", "1"); }
      var infoEl = document.getElementById("infoVendeur");
      if(infoEl){ infoEl.textContent = villeV; infoEl.setAttribute("data-original", villeV); }
      var av = document.getElementById("avatarVendeur");
      if(av){
        if(photoV) av.innerHTML = '<img src="' + photoV + '" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.textContent=\'' + nomV.charAt(0) + '\'">';
        else av.textContent = nomV.charAt(0);
      }

      // --- AFFICHAGE PRIX SEULEMENT, on ne modifie jamais le prix en base ---
      try{
        var taux = { XOF:1, EUR:0.0015, USD:0.0017, NGN:2.55, GHS:0.021, GBP:0.0013 };
        var symboles = { XOF:" F", EUR:" €", USD:" $", NGN:" ₦", GHS:" GH₵", GBP:" £" };
        var deviseEl = document.getElementById("devise");
        var devise = deviseEl ? deviseEl.value : (localStorage.getItem("rocy_devise") || "XOF");
        try{
          var rr = await fetch("https://open.er-api.com/v6/latest/XOF");
          var jj = await rr.json();
          if(jj && jj.rates){ taux.EUR = jj.rates.EUR; taux.USD = jj.rates.USD; taux.NGN = jj.rates.NGN; taux.GHS = jj.rates.GHS; taux.GBP = jj.rates.GBP; }
        }catch(e){}
        function fmt(v){ return Math.round(v * taux[devise]).toLocaleString() + symboles[devise]; }
        if(prixEl) prixEl.textContent = fmt(Number(p.prix));
        var prix = Number(p.prix) || 0;
        var comm = prix <= 500000 ? prix * 0.085 : (prix <= 2000000 ? prix * 0.075 : prix * 0.065);
        var total = prix;
        var vendeurRecoit = prix - comm;
        var d = document.getElementById("detailPrix");
        var lang = localStorage.getItem("rocy_lang") || "fr";
        var lib = {
          fr: ["Prix produit","Livraison","Non incluse - A discuter avec le vendeur dans le Chat","Total a payer","sans livraison","Le vendeur recevra","apres ton clic COLIS RECU."],
          en: ["Product price","Delivery","Not included - To discuss with the seller in the Chat","Total to pay","without delivery","The seller will receive","after you click PACKAGE RECEIVED."]
        }[lang] || ["Prix produit","Livraison","Non incluse - A discuter avec le vendeur dans le Chat","Total a payer","sans livraison","Le vendeur recevra","apres ton clic COLIS RECU."];
        if(d) d.innerHTML = lib[0] + " : <b>" + fmt(prix) + "</b><br>" + lib[1] + " : <b>" + lib[2] + "</b><br><b>" + lib[3] + " : " + fmt(total) + "</b> <small>(" + lib[4] + ")</small><br><small>" + lib[5] + " " + fmt(vendeurRecoit) + " " + lib[6] + "</small>";
        var commEl = document.getElementById("txtCommission");
        if(commEl){
          commEl.textContent = "Commission RocyInter : 8,5% jusqu'a " + fmt(500000) + " - 7,5% jusqu'a " + fmt(2000000) + " - 6,5% au-dela - Deduite au vendeur, pas a toi.";
          if(typeof window.majTexteCommission === "function"){ try{ window.majTexteCommission(); }catch(e){} }
        }
        if(typeof window.mettreAJourPrix === "function"){ try{ window.mettreAJourPrix(); }catch(e){} }
        if(typeof window.convertirPrix === "function"){ try{ window.convertirPrix(); }catch(e){} }
      }catch(e){ console.log("fix prix", e); }

      if(typeof window.appliquerTraductionProduits === "function"){ try{ window.appliquerTraductionProduits(); }catch(e){} }

    }catch(e){ console.log("reparation article", e); }
  }, 2500);
});

// NE PAS DEFINIR changerLangue ICI - c'est article.html / index.html qui gere la langue
// NE PAS DEFINIR googleTranslateElementInit ICI

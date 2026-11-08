// ===== ROCYINTER - ROCY_DEVISE.JS - V4 CAHIER FINAL - CAS B §19 =====
// Base = FCFA. Tout calculé en FCFA, puis converti pour l'affichage.
// CE FICHIER ÉCRASE les anciens taux dans les pages. Ne pas mettre de convertisseur ailleurs.
(function(){
  if(window.__ROCY_DEVISE_CHARGE_2) return;
  window.__ROCY_DEVISE_CHARGE_2 = true;

  window.RocyTaux = { XOF:1, EUR:0.0015, USD:0.0017, NGN:2.55, GHS:0.021, GBP:0.0013 };
  window.RocySymboles = { XOF:" F CFA", EUR:" €", USD:" $", NGN:" ₦", GHS:" GH₵", GBP:" £" };
  window.RocyTauxDateTxt = "";

  try{
    var s = JSON.parse(localStorage.getItem("rocy_taux")||"null");
    if(s && s.rates){ window.RocyTaux = s.rates; window.RocyTauxDateTxt = s.dateTxt||""; }
  }catch(e){}

  // ===== ALIAS §19 - pour que commun.js + anciennes pages parlent au même fichier =====
  // commun.js appelle chargerTauxLive() et lit rocy_taux, on les crée ici
  window.rocy_taux = window.RocyTaux;
  window.taux = window.RocyTaux;
  window.symboles = window.RocySymboles;
  window.RocySymbolesAlias = window.RocySymboles;

  // Devise = localStorage d'abord (bouton 💱 dans l'entête), sinon #devise, sinon XOF
  window.RocyDevise = function(){
    var ds = localStorage.getItem("rocy_devise");
    if(ds) return ds;
    var el = document.getElementById("devise");
    if(el && el.value) return el.value;
    return "XOF";
  };
  window.getDevise = window.RocyDevise;

  // Convertir FCFA -> devise. FCFA = sans décimale, Euro/Dollar = 2 décimales
  window.fmtMontant = function(fcfa){
    var dev = window.RocyDevise();
    var t = window.RocyTaux[dev] || 1;
    var v = Number(fcfa||0) * t;
    var sym = window.RocySymboles[dev] || "";
    if(dev === "XOF"){
      return Math.round(v).toLocaleString('fr-FR') + sym;
    } else {
      return v.toLocaleString('fr-FR', {minimumFractionDigits:2, maximumFractionDigits:2}) + sym;
    }
  };

  // ===== COMMISSION DÉGRESSIVE OFFICIELLE - NE PAS MODIFIER =====
  window.RocyTauxCommission = function(totalFCFA){
    var total = Number(totalFCFA||0);
    if(total <= 500000) return 0.085;
    if(total <= 2000000) return 0.075;
    return 0.065;
  };
  window.RocyCalculCommande = function(totalFCFA){
    var total = Number(totalFCFA||0);
    var tauxComm = window.RocyTauxCommission(total);
    var commission = total * tauxComm;
    var vendeurTouche = total - commission;
    return { total: total, tauxCommission: tauxComm, commission: commission, vendeurTouche: vendeurTouche };
  };

  window.RocyRestaurerDevise = function(){
    var ds = localStorage.getItem("rocy_devise");
    var el = document.getElementById("devise");
    if(el && ds) el.value = ds;
    var sel2 = document.getElementById("selectDevise");
    if(sel2 && ds) sel2.value = ds;
    var lbl = document.getElementById("deviseLabel");
    if(lbl) lbl.textContent = (window.RocySymboles[ds||"XOF"]||"F CFA").trim();
  };

  window.RocyAfficherTaux = function(){
    var info = document.getElementById("tauxInfo");
    if(info){
      var dev = window.RocyDevise();
      if(dev === "XOF") info.textContent = "Taux du " + (window.RocyTauxDateTxt || "jour") + " • Base FCFA";
      else info.textContent = "Taux live du " + (window.RocyTauxDateTxt || "jour") + " • 1 FCFA = " + window.RocyTaux[dev] + " " + dev;
    }
    var info2 = document.getElementById("tauxInfoProfil");
    if(info2){
      var dev2 = window.RocyDevise();
      if(dev2 === "XOF") info2.textContent = "Devise : FCFA - pas de conversion";
      else info2.textContent = "Taux live : 1 FCFA = " + window.RocyTaux[dev2] + " " + dev2 + " - Affichage en " + dev2;
    }
  };

  window.RocyConvertirPrixPage = function(){
    // .prix + [data-prix] + #prixProduit + #soldeProfil
    document.querySelectorAll(".prix, [data-prix]").forEach(function(el){
      var fcfa = parseFloat(el.getAttribute("data-prix"));
      if(!isNaN(fcfa)) el.innerText = window.fmtMontant(fcfa);
    });
    // Solde Profil - il garde son vrai montant FCFA dans soldeFCFAActuel
    if(typeof soldeFCFAActuel !== "undefined" && document.getElementById("soldeProfil")){
      if(typeof afficherSolde === "function") afficherSolde(soldeFCFAActuel);
    }
    window.RocyAfficherTaux();
    if(typeof window.afficherTotaux === "function") { try{ window.afficherTotaux(); }catch(e){} }
    if(typeof window.afficherBilan === "function" && typeof window.periodeBilan !== "undefined") { try{ window.afficherBilan(window.periodeBilan); }catch(e){} }
  };

  window.convertirPrix = function(){
    var el = document.getElementById("devise");
    if(el) localStorage.setItem("rocy_devise", el.value);
    window.RocyConvertirPrixPage();
  };

  window.RocyChargerTauxLive = async function(){
    try{
      var res = await fetch("https://open.er-api.com/v6/latest/XOF");
      var data = await res.json();
      if(data && data.rates){
        window.RocyTaux = { XOF:1, EUR:data.rates.EUR, USD:data.rates.USD, NGN:data.rates.NGN, GHS:data.rates.GHS, GBP:data.rates.GBP };
        window.rocy_taux = window.RocyTaux;
        window.taux = window.RocyTaux;
        var d = new Date();
        window.RocyTauxDateTxt = d.toLocaleDateString("fr-FR") + " à " + d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
        localStorage.setItem("rocy_taux", JSON.stringify({ rates: window.RocyTaux, dateTxt: window.RocyTauxDateTxt, ts: Date.now() }));
      }
    }catch(e){}
    window.RocyConvertirPrixPage();
  };

  // ===== ALIAS POUR COMMUN.JS - NE PAS SUPPRIMER =====
  window.chargerTauxLive = window.RocyChargerTauxLive;
  window.chargerTaux = window.RocyChargerTauxLive;
  window.majTexteCommission = window.majTexteCommission || function(){};

  document.addEventListener("DOMContentLoaded", function(){
    window.RocyRestaurerDevise();
    window.RocyAfficherTaux();
    window.RocyChargerTauxLive();
  });
  // Si commun.js est déjà chargé, on lance tout de suite aussi
  setTimeout(function(){ window.RocyRestaurerDevise(); window.RocyAfficherTaux(); }, 500);

  // Quand on change la devise dans l'entête 💱, on reconvertit tout
  document.addEventListener("rocy_devise_change", function(){ window.RocyConvertirPrixPage(); });
})();

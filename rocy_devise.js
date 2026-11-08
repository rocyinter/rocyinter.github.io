// ===== ROCYINTER - CALCUL DEVISE CENTRAL - TAUX LIVE INSTANT T =====
// Base = FCFA. Tout est calculé en FCFA, puis converti pour l'affichage.
// Commission dégressive officielle Rocyinter - NE PAS MODIFIER SANS ACCORD

(function(){
  window.RocyTaux = { XOF:1, EUR:0.0015, USD:0.0017, NGN:2.55, GHS:0.021, GBP:0.0013 };
  window.RocySymboles = { XOF:" FCFA", EUR:" €", USD:" $", NGN:" ₦", GHS:" GH₵", GBP:" £" };
  window.RocyTauxDateTxt = "";

  try{
    var s = JSON.parse(localStorage.getItem("rocy_taux")||"null");
    if(s && s.rates){ window.RocyTaux = s.rates; window.RocyTauxDateTxt = s.dateTxt||""; }
  }catch(e){}

  window.RocyDevise = function(){
    var el = document.getElementById("devise");
    if(el) return el.value;
    return localStorage.getItem("rocy_devise") || "XOF";
  };

  // Convertir un montant FCFA -> devise choisie. NE TOUCHE PAS à la commission.
  window.fmtMontant = function(fcfa){
    var dev = window.RocyDevise();
    var t = window.RocyTaux[dev] || 1;
    var v = Math.round(Number(fcfa||0) * t);
    return v.toLocaleString() + (window.RocySymboles[dev] || "");
  };

  // ===== TAUX DE COMMISSION DÉGRESSIF OFFICIEL ROCYINTER =====
  // Jusqu'à 500 000 F        -> 8,5% commission / 91,5% vendeur
  // 500 001 F à 2 000 000 F  -> 7,5% commission / 92,5% vendeur
  // Plus de 2 000 000 F      -> 6,5% commission / 93,5% vendeur
  window.RocyTauxCommission = function(totalFCFA){
    var total = Number(totalFCFA||0);
    if(total <= 500000) return 0.085;
    if(total <= 2000000) return 0.075;
    return 0.065;
  };

  // Calcul officiel d'une commande - SEUL endroit où on calcule la commission
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
  };

  window.RocyAfficherTaux = function(){
    var info = document.getElementById("tauxInfo");
    if(!info) return;
    var dev = window.RocyDevise();
    if(dev === "XOF") info.textContent = "Taux du " + (window.RocyTauxDateTxt || "jour") + " • Base FCFA";
    else info.textContent = "Taux live du " + (window.RocyTauxDateTxt || "jour") + " • 1 FCFA = " + window.RocyTaux[dev] + " " + dev;
  };

  window.RocyConvertirPrixPage = function(){
    document.querySelectorAll(".prix").forEach(function(el){
      var fcfa = parseFloat(el.getAttribute("data-prix"));
      if(!isNaN(fcfa)) el.innerText = window.fmtMontant(fcfa);
    });
    window.RocyAfficherTaux();
    if(typeof window.afficherTotaux === "function") window.afficherTotaux();
    if(typeof window.afficherBilan === "function" && typeof window.periodeBilan !== "undefined") window.afficherBilan(window.periodeBilan);
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
        var d = new Date();
        window.RocyTauxDateTxt = d.toLocaleDateString("fr-FR") + " à " + d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
        localStorage.setItem("rocy_taux", JSON.stringify({ rates: window.RocyTaux, dateTxt: window.RocyTauxDateTxt, ts: Date.now() }));
      }
    }catch(e){}
    window.RocyConvertirPrixPage();
  };

  document.addEventListener("DOMContentLoaded", function(){
    window.RocyRestaurerDevise();
    window.RocyAfficherTaux();
    window.RocyChargerTauxLive();
  });
})();

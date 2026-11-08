// ===== ROCYINTER - CALCUL DEVISE CENTRAL - TAUX LIVE INSTANT T =====
// Base = FCFA (XOF). Tout est calculé en FCFA, puis converti pour l'affichage.
// Commission = 8.5% calculée en FCFA, puis convertie. Jamais l'inverse.

(function(){
  // Taux de secours si pas d'internet
  window.RocyTaux = { XOF:1, EUR:0.0015, USD:0.0017, NGN:2.55, GHS:0.021, GBP:0.0013 };
  window.RocySymboles = { XOF:" FCFA", EUR:" €", USD:" $", NGN:" ₦", GHS:" GH₵", GBP:" £" };
  window.RocyTauxDateTxt = "";

  // 1. Relire les derniers taux sauvegardés
  try{
    var s = JSON.parse(localStorage.getItem("rocy_taux")||"null");
    if(s && s.rates){ window.RocyTaux = s.rates; window.RocyTauxDateTxt = s.dateTxt||""; }
  }catch(e){}

  // 2. Devise actuelle
  window.RocyDevise = function(){
    var el = document.getElementById("devise");
    if(el) return el.value;
    return localStorage.getItem("rocy_devise") || "XOF";
  };

  // 3. Formater un montant FCFA -> devise choisie
  window.fmtMontant = function(fcfa){
    var dev = window.RocyDevise();
    var t = window.RocyTaux[dev] || 1;
    var v = Math.round(Number(fcfa||0) * t);
    return v.toLocaleString() + (window.RocySymboles[dev] || "");
  };

  // 4. Calculs officiels - toujours en FCFA
  window.RocyCalculCommande = function(totalFCFA){
    var total = Number(totalFCFA||0);
    var commission = total * 0.085; // 8.5%
    var vendeurTouche = total - commission;
    return { total: total, commission: commission, vendeurTouche: vendeurTouche };
  };

  // 5. Restaurer la devise choisie
  window.RocyRestaurerDevise = function(){
    var ds = localStorage.getItem("rocy_devise");
    var el = document.getElementById("devise");
    if(el && ds) el.value = ds;
  };

  // 6. Afficher le texte du taux
  window.RocyAfficherTaux = function(){
    var info = document.getElementById("tauxInfo");
    if(!info) return;
    var dev = window.RocyDevise();
    if(dev === "XOF") info.textContent = "Taux du " + (window.RocyTauxDateTxt || "jour") + " • Base FCFA";
    else info.textContent = "Taux live du " + (window.RocyTauxDateTxt || "jour") + " • 1 FCFA = " + window.RocyTaux[dev] + " " + dev;
  };

  // 7. Convertir tous les prix de la page : <span class="prix" data-prix="10000">
  window.RocyConvertirPrixPage = function(){
    document.querySelectorAll(".prix").forEach(function(el){
      var fcfa = parseFloat(el.getAttribute("data-prix"));
      if(!isNaN(fcfa)) el.innerText = window.fmtMontant(fcfa);
    });
    window.RocyAfficherTaux();
    // Si la page a une fonction pour re-afficher ses totaux, on l'appelle
    if(typeof window.afficherTotaux === "function") window.afficherTotaux();
    if(typeof window.afficherBilan === "function" && typeof window.periodeBilan !== "undefined") window.afficherBilan(window.periodeBilan);
  };

  // 8. Quand on change la devise
  window.convertirPrix = function(){
    var el = document.getElementById("devise");
    if(el) localStorage.setItem("rocy_devise", el.value);
    window.RocyConvertirPrixPage();
  };

  // 9. Aller chercher le taux LIVE à l'instant T
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
    }catch(e){ /* on garde l'ancien taux */ }
    window.RocyConvertirPrixPage();
  };

  // 10. Au chargement de chaque page : restaurer + taux live
  document.addEventListener("DOMContentLoaded", function(){
    window.RocyRestaurerDevise();
    window.RocyAfficherTaux();
    window.RocyChargerTauxLive();
  });
})();

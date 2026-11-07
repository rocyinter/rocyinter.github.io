// ===== ROCYINTER - COMMUN.JS - FICHIER UNIQUE POUR TOUT LE SITE =====
// Logs légaux Bénin / APDP - Ne bloque JAMAIS le site

const SUPABASE_URL = 'https://ahoxxzmdjxqvvpphxeow.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Q2oaPQMj4H_cTlZCKKh6Jg_FVIa7VE3';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const supabase = supabaseClient;
const sb = supabaseClient;

// --- LOGS LEGAUX ---
async function enregistrerLog(action, email=""){
  try{
    await supabaseClient.from('logs').insert([{
      action: action,
      email: email || localStorage.getItem("rocy_user") || "visiteur",
      page: window.location.pathname,
      created_at: new Date().toISOString()
    }]);
  }catch(e){
    console.log("log non enregistré", e);
  }
}

// Log automatique : chaque visite de page
document.addEventListener("DOMContentLoaded", function(){
  enregistrerLog('visite_page');
});

// --- ROLES ---
function getRole(){
  return localStorage.getItem("rocy_role") || localStorage.getItem("role_user") || "visiteur";
}
function deconnexion(){
  enregistrerLog('deconnexion');
  localStorage.removeItem("rocy_role");
  localStorage.removeItem("rocy_user");
  window.location.href = "index.html";
}

// --- LANGUE ---
function googleTranslateElementInit(){
  new google.translate.TranslateElement({pageLanguage:'fr', includedLanguages:'en,fr,yo,es,de,pt,ar,zh-CN', autoDisplay:false}, 'google_translate_element');
}
function changerLangue(lang){
  if(lang === "autre"){
    var gt = document.getElementById("google_translate_element");
    if(gt){ gt.style.display="block"; gt.style.position="static"; gt.style.opacity="1"; }
    alert("Choisis ta langue dans le menu Google");
    return;
  }
  if(lang === "fon" || lang === "goun"){
    alert("Fon / Goun : Version complète bientôt.");
    return;
  }
  if(lang === "fr"){
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    location.reload(); return;
  }
  document.cookie = "googtrans=/fr/"+lang+"; path=/;";
  location.reload();
}
window.changerLangue = changerLangue;
window.enregistrerLog = enregistrerLog;

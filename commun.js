// ===== ROCYINTER - COMMUN.JS - CORRIGE =====
// Logs légaux Bénin / APDP - Ne bloque JAMAIS le site
// NE DEFINIT PLUS changerLangue, NI SUPABASE_URL en const, pour ne pas écraser index.html

// Supabase seulement si index.html ne l'a pas déjà fait, avec un autre nom pour éviter le conflit
if(typeof window.ROCY_SUPABASE_URL === "undefined"){
  window.ROCY_SUPABASE_URL = 'https://ahoxxzmdjxqvvpphxeow.supabase.co';
  window.ROCY_SUPABASE_KEY = 'sb_publishable_Q2oaPQMj4H_cTlZCKKh6Jg_FVIa7VE3';
  try{
    if(window.supabase && !window.supabaseClient){
      window.supabaseClient = window.supabase.createClient(window.ROCY_SUPABASE_URL, window.ROCY_SUPABASE_KEY);
      window.supabase = window.supabaseClient;
      window.sb = window.supabaseClient;
    }
  }catch(e){ console.log("supabase commun non créé", e); }
}

// --- LOGS LEGAUX ---
async function enregistrerLog(action, email=""){
  try{
    if(!window.supabaseClient) return;
    await window.supabaseClient.from('logs').insert([{
      action: action,
      email: email || localStorage.getItem("rocy_user") || "visiteur",
      page: window.location.pathname,
      created_at: new Date().toISOString()
    }]);
  }catch(e){
    console.log("log non enregistré", e);
  }
}
window.enregistrerLog = enregistrerLog;

// Log automatique : chaque visite de page, sans bloquer
document.addEventListener("DOMContentLoaded", function(){
  setTimeout(function(){ enregistrerLog('visite_page'); }, 1000);
});

// --- ROLES : on ne définit que si index.html ne l'a pas déjà fait ---
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

// NE PAS DEFINIR changerLangue ICI - c'est index.html qui gère la langue avec Français, English, Yoruba, Fon, Goun, Español, Português, Deutsch, العربية
// NE PAS DEFINIR googleTranslateElementInit ICI

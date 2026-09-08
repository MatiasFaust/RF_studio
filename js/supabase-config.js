// Configuración de conexión a Supabase para el sistema de disponibilidad de RFM.
//
// Estos dos valores NO son secretos: la "anon key" está diseñada para
// vivir en el navegador (es pública por diseño, como una URL). La
// seguridad real la dan las políticas RLS definidas en supabase/schema.sql
// (solo usuarios logueados pueden crear/editar/borrar reservas; cualquiera
// puede solo leerlas). La contraseña de la empleada nunca está en este
// archivo ni en ningún otro: vive únicamente dentro de Supabase Auth.
//
// Para completar esto:
// 1. Entrá a tu proyecto en https://supabase.com/dashboard
// 2. Project Settings (ícono de engranaje) → API
// 3. Copiá "Project URL" y pegalo abajo en SUPABASE_URL
// 4. Copiá la clave "anon public" y pegala abajo en SUPABASE_ANON_KEY

window.SUPABASE_URL = 'PEGA_ACA_TU_PROJECT_URL';
window.SUPABASE_ANON_KEY = 'PEGA_ACA_TU_ANON_PUBLIC_KEY';

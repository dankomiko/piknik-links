// Updated by scripts/publish-links-site.ps1 after each Android preview build.
// The Supabase anon key is public by design; the page only calls public.get_invite_preview.
//
// Store URLs: set a real App Store / Play Store link when available.
// Leave empty (or null) to show a non-clickable badge with a "Coming soon" note.
window.PIKNIK_LINKS = {
  androidPackage: 'com.creativelunch.piknik',
  appScheme: 'piknik',
  apkUrl: 'https://expo.dev/artifacts/eas/kf6KrE_YR7dQOF6sxsR_f__LUJo_wP4Dq_n1H2JdD0o.apk',
  appStoreUrl: '',
  playStoreUrl: '',
  supportEmail: 'support@pknk.app',
  supabaseUrl: 'https://qlwkgsrqfyjjuyileusg.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsd2tnc3JxZnlqanV5aWxldXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5ODI5MTksImV4cCI6MjA5NDU1ODkxOX0.fRXxyrqEg6TIoj26PNfeqThye2Sabsxb5DiAYRwCihQ',
};

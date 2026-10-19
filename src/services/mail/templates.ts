import "server-only";

// Semua isian dari user wajib di-escape sebelum masuk ke HTML email.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(title: string, body: string) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#1f2937">
    <h2 style="color:#0f766e;margin-top:0">${title}</h2>
    ${body}
    <p style="margin-top:32px;font-size:12px;color:#6b7280">Si Penyu — Sistem Informasi Konservasi Penyu</p>
  </div>`;
}

function button(href: string, label: string, color = "#0f766e") {
  return `<a href="${href}" style="display:inline-block;padding:10px 20px;background:${color};color:#fff;text-decoration:none;border-radius:6px;margin:8px 8px 8px 0">${label}</a>`;
}

export function verifikasiEmailTemplate(nama: string, link: string) {
  return {
    subject: "Verifikasi email akun Si Penyu",
    html: layout(
      "Verifikasi email kamu",
      `<p>Halo ${escapeHtml(nama)},</p>
       <p>Klik tombol di bawah untuk memverifikasi email kamu, lalu kamu bisa masuk ke Si Penyu.</p>
       ${button(link, "Verifikasi Email")}`
    ),
  };
}

export function resetPasswordTemplate(link: string) {
  return {
    subject: "Atur ulang password Si Penyu",
    html: layout(
      "Atur ulang password",
      `<p>Ada permintaan untuk mengatur ulang password akun kamu.</p>
       ${button(link, "Atur Ulang Password")}
       <p style="font-size:13px;color:#6b7280">Kalau kamu tidak merasa meminta ini, abaikan saja email ini.</p>`
    ),
  };
}

function row(label: string, value: string) {
  return `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;vertical-align:top">${label}</td><td>${escapeHtml(value)}</td></tr>`;
}

export function permintaanRegistrasiTemplate(data: {
  tempat: { nama: string; slug: string; alamat: string; kabupaten: string; provinsi: string; kontak: string };
  pengelola: { nama: string; email: string };
  link: string;
}) {
  const { tempat, pengelola } = data;
  return {
    subject: `Pendaftaran tempat baru: ${tempat.nama}`,
    html: layout(
      "Pendaftaran tempat konservasi baru",
      `<table style="border-collapse:collapse;margin-bottom:16px">
         ${row("Tempat", tempat.nama)}
         ${row("Link", `/${tempat.slug}/dashboard`)}
         ${row("Alamat", `${tempat.alamat}, ${tempat.kabupaten}, ${tempat.provinsi}`)}
         ${row("Kontak", tempat.kontak)}
         ${row("Pengelola", `${pengelola.nama} (${pengelola.email})`)}
       </table>
       <p>Buka halaman persetujuan untuk melihat detail dan lokasi, lalu setujui atau tolak.</p>
       ${button(data.link, "Buka Halaman Persetujuan")}
       <p style="font-size:13px;color:#6b7280">Link ini rahasia, sekali pakai, dan berlaku 48 jam. Jangan diteruskan ke orang lain.</p>`
    ),
  };
}

export function registrasiDitolakTemplate(nama: string, tempatNama: string) {
  return {
    subject: "Pendaftaran tempat konservasi di Si Penyu",
    html: layout(
      "Pendaftaran belum disetujui",
      `<p>Halo ${escapeHtml(nama)},</p>
       <p>Maaf, pendaftaran <b>${escapeHtml(tempatNama)}</b> belum dapat disetujui.
       Silakan hubungi pengelola Si Penyu untuk informasi lebih lanjut.</p>`
    ),
  };
}

export function akunAnggotaTemplate(data: { nama: string; username: string; tempatNama: string; link: string }) {
  return {
    subject: `Akun Si Penyu kamu di ${data.tempatNama}`,
    html: layout(
      "Akun kamu sudah dibuat",
      `<p>Halo ${escapeHtml(data.nama)},</p>
       <p>Pengelola <b>${escapeHtml(data.tempatNama)}</b> sudah membuatkan akun Si Penyu untukmu
       dengan username <b>${escapeHtml(data.username)}</b>.</p>
       <p>Klik tombol di bawah untuk membuat password kamu sendiri, lalu masuk dengan email atau username.</p>
       ${button(data.link, "Buat Password")}
       <p style="font-size:13px;color:#6b7280">Kalau link ini kedaluwarsa, gunakan menu "Lupa password" di halaman masuk.</p>`
    ),
  };
}

export function gantiEmailTemplate(nama: string, emailBaru: string, link: string) {
  return {
    subject: "Konfirmasi email baru akun Si Penyu",
    html: layout(
      "Konfirmasi email baru",
      `<p>Halo ${escapeHtml(nama)},</p>
       <p>Ada permintaan untuk mengganti email akun Si Penyu kamu menjadi <b>${escapeHtml(emailBaru)}</b>.
       Klik tombol di bawah untuk mengonfirmasi. Setelah itu, masuk lagi dengan email baru.</p>
       ${button(link, "Konfirmasi Email Baru")}
       <p style="font-size:13px;color:#6b7280">Kalau kamu tidak merasa meminta ini, abaikan email ini — email akun tidak akan berubah.</p>`
    ),
  };
}

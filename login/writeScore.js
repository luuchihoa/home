window.writeScore = async function (userType, value) {
  const data = { user: userType, value: value };
  const API_URL =
    'https://script.google.com/macros/s/AKfycbxi7H5MhkxM478EnIX-shg1NMxg4ljIyCcokmODv55zBnNLyTBtkKTGG-brJcSmf5Q/exec';

  await fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors', // nếu không thể giải quyết CORS
    body: JSON.stringify(data),
  });
};

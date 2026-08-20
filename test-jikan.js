import https from 'https';

const search = 'Goku';
https.get(`https://api.jikan.moe/v4/characters?q=${search}&limit=1`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data);
  });
});

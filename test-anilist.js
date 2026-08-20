import https from 'https';

const query = `
query ($search: String) {
  Character (search: $search) {
    image {
      large
    }
  }
}
`;

const variables = { search: 'Goku' };

const data = JSON.stringify({ query, variables });

const req = https.request({
  hostname: 'graphql.anilist.co',
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let resData = '';
  res.on('data', chunk => resData += chunk);
  res.on('end', () => {
    console.log(resData);
  });
});

req.write(data);
req.end();

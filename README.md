# Voter Turnout Explorer: Snowflake + Netlify

Browser -> /api/turnout (Netlify Function) -> Snowflake view TURNOUT_CLEAN -> Chart.js

## 1. Get the data
Download state-level turnout (VEP) for 1980-2022 from one of:
- U.S. Elections Project / UF Election Lab (Michael McDonald): https://election.lab.ufl.edu/dataset/1980-2022-general-election-turnout-rates-v1-1
- datHere mirror (CSV, ODbL): https://data-dathere.dataops.dathere.com/dataset/us-national-general-election-turnout-rates
- UMD BSOS repository: https://bsos-data.umd.edu/dataset/voter-turnout-dataset

Cite the source on your site.

## 2. Snowflake (about 5 min)
1. Make a key pair locally:
   openssl genrsa 2048 | openssl pkcs8 -topk8 -inform PEM -out rsa_key.p8 -nocrypt
   openssl rsa -in rsa_key.p8 -pubout -out rsa_key.pub
   Paste the body of rsa_key.pub (no BEGIN/END lines) into setup.sql.
2. Run setup.sql in a Snowsight worksheet, loading the CSV in step 3 via the UI.
3. Fix the column names in the TURNOUT_CLEAN view until the sanity query returns one row per year.

## 3. Deploy
1. Push this folder to GitHub.
2. Netlify > Add new site > Import from Git.
3. Site settings > Environment variables: copy everything from .env.example.
   SNOWFLAKE_ACCOUNT is orgname-accountname (Snowsight > account menu > Copy account identifier).
   SNOWFLAKE_PRIVATE_KEY is the contents of rsa_key.p8 with newlines replaced by \n.
4. Deploy. Open /api/turnout to check JSON, then the home page.

## Local test
npm i -g netlify-cli && npm install && cp .env.example .env (fill in) && netlify dev

## Out of Netlify credits? Use Vercel (free Hobby plan)
1. Push to GitHub, then vercel.com > Add New > Project > import the repo (no framework, no build command).
2. Add the same environment variables from .env.example, then Deploy.
3. The site is served from /public and the API from /api/turnout automatically.

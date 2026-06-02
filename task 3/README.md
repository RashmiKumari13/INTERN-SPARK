# Country Explorer

Country Explorer is a small frontend project that uses the Fetch API to load
live country data and display it dynamically on the page.

## API Used

This project uses the public [REST Countries API](https://restcountries.com/).
The app requests:

```text
https://restcountries.com/v3.1/all?fields=name,capital,region,population,flags,currencies,cca3
```

The response includes each country's name, capital, region, population, flag,
and currency details. The JavaScript then sorts the countries, renders cards,
and updates the visible results whenever the user searches or changes the
region filter.

## Features

- Fetch API request to a public REST endpoint
- Loading message and disabled refresh button while data is loading
- Error message if the request fails
- Search by country name, capital, or region
- Region filter generated from the API response
- Responsive card layout with flag images

## Run Locally

Open `index.html` in a browser, or serve this folder locally.

```bash
npm start
```

## Deployment

This is a static site and can be hosted on GitHub Pages, Netlify, or Vercel.
For GitHub Pages, push the project to GitHub and enable Pages from the
repository settings.

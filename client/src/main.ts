import './styles/jass.css';

// * All necessary DOM elements selected
const searchForm: HTMLFormElement = document.getElementById(
  'search-form'
) as HTMLFormElement;
const searchInput: HTMLInputElement = document.getElementById(
  'search-input'
) as HTMLInputElement;
const todayContainer = document.querySelector('#today') as HTMLDivElement;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById(
  'history'
) as HTMLDivElement;
const heading: HTMLHeadingElement = document.getElementById(
  'search-title'
) as HTMLHeadingElement;
const weatherIcon: HTMLImageElement = document.getElementById(
  'weather-img'
) as HTMLImageElement;
const tempEl: HTMLParagraphElement = document.getElementById(
  'temp'
) as HTMLParagraphElement;
const windEl: HTMLParagraphElement = document.getElementById(
  'wind'
) as HTMLParagraphElement;
const humidityEl: HTMLParagraphElement = document.getElementById(
  'humidity'
) as HTMLParagraphElement;

/*

API Calls

*/

const fetchWeather = async (cityName: string, addToHistory = true): Promise<void> => {
  try {
    const response = await fetch('/api/weather/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cityName }),
    });

    const result = await response.json();

    if (result.error) {
      alert(result.error); // Display error message
      return;
    }

    console.log('weatherData: ', result);

    renderCurrentWeather(result[0]);
    renderForecast(result.slice(1));

    if (addToHistory) {
      await getAndRenderHistory();
    }
  } catch (error) {
    alert('An error occurred while fetching weather data. Please try again.');
    console.error('Error in fetchWeather:', error);
  }
};



const fetchSearchHistory = async (): Promise<Response> => {
  const history = await fetch('/api/weather/history', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return history;
};

const deleteCityFromHistory = async (id: string): Promise<void> => {
  await fetch(`/api/weather/history/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/*

Render Functions

*/

const renderCurrentWeather = (currentWeather: any): void => {
  const { city, date, icon, iconDescription, temperature, wind, humidity } =
    currentWeather;

  console.log('Current weather data:', currentWeather);

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute(
    'src',
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${temperature}°F`;
  windEl.textContent = `Wind: ${wind} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  if (todayContainer) {
    todayContainer.innerHTML = '';
    todayContainer.append(heading, tempEl, windEl, humidityEl);
    console.log('todayContainer: ', todayContainer);
  }
};

const renderForecast = (forecast: any[]): void => {
  const headingCol = document.createElement('div');
  const heading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);

  if (forecastContainer) {
    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);
  }

  forecast.forEach(renderForecastCard);
};

const renderForecastCard = (forecast: any): void => {
  const { date, icon, iconDescription, temperature, wind, humidity } = forecast;

  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } =
    createForecastCard();

  cardTitle.textContent = date;
  weatherIcon.setAttribute(
    'src',
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${temperature} °F`;
  windEl.textContent = `Wind: ${wind} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  if (forecastContainer) {
    forecastContainer.append(col);
  }
};

const renderSearchHistory = async (searchHistory: any): Promise<void> => {
  const historyList = await searchHistory.json();

  if (searchHistoryContainer) {
    // Clear the history container to prevent duplicates
    searchHistoryContainer.innerHTML = '';

    if (!historyList.length) {
      searchHistoryContainer.innerHTML =
        '<p class="text-center">No Previous Search History</p>';
      return;
    }

    historyList.reverse().forEach((city: any) => {
      const historyItem = buildHistoryListItem(city);
      searchHistoryContainer.append(historyItem);
    });
  }
};

/*

Helper Functions

*/

const createForecastCard = () => {
  const col = document.createElement('div');
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h5');
  const weatherIcon = document.createElement('img');
  const tempEl = document.createElement('p');
  const windEl = document.createElement('p');
  const humidityEl = document.createElement('p');

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.classList.add('col-auto');
  card.classList.add(
    'forecast-card',
    'card',
    'text-white',
    'bg-primary',
    'h-100'
  );
  cardBody.classList.add('card-body', 'p-2');
  cardTitle.classList.add('card-title');
  tempEl.classList.add('card-text');
  windEl.classList.add('card-text');
  humidityEl.classList.add('card-text');

  return {
    col,
    cardTitle,
    weatherIcon,
    tempEl,
    windEl,
    humidityEl,
  };
};

const createHistoryButton = (city: string): HTMLButtonElement => {
  const btn = document.createElement('button');
  btn.setAttribute('type', 'button');
  btn.setAttribute('aria-controls', 'today forecast');
  btn.classList.add('history-btn', 'btn', 'btn-secondary', 'col-10');
  btn.textContent = city;

  return btn;
};

const createDeleteButton = (): HTMLButtonElement => {
  const delBtnEl = document.createElement('button');
  delBtnEl.setAttribute('type', 'button');
  delBtnEl.classList.add(
    'fas',
    'fa-trash-alt',
    'delete-city',
    'btn',
    'btn-danger',
    'col-2'
  );

  delBtnEl.addEventListener('click', handleDeleteHistoryClick);
  return delBtnEl;
};

const createHistoryDiv = (): HTMLDivElement => {
  const div = document.createElement('div');
  div.classList.add('display-flex', 'gap-2', 'col-12', 'm-1');
  return div;
};

const buildHistoryListItem = (city: any): HTMLDivElement => {
  const newBtn = createHistoryButton(city.name);
  const deleteBtn = createDeleteButton();
  deleteBtn.dataset.city = JSON.stringify(city);
  const historyDiv = createHistoryDiv();
  historyDiv.append(newBtn, deleteBtn);
  return historyDiv;
};

/*

Event Handlers

*/

const handleSearchFormSubmit = async (event: any): Promise<void> => {
  event.preventDefault();

  if (!searchInput.value) {
    throw new Error('City cannot be blank');
  }

  const search: string = searchInput.value.trim();
  await fetchWeather(search);
  searchInput.value = '';
};

const handleSearchHistoryClick = async (event: any): Promise<void> => {
  if (event.target.matches('.history-btn')) {
    const city = event.target.textContent;
    await fetchWeather(city, false); // Disable adding to history
  }
};

const handleDeleteHistoryClick = async (event: any): Promise<void> => {
  event.stopPropagation();
  const cityID = JSON.parse(event.target.getAttribute('data-city')).id;
  await deleteCityFromHistory(cityID);
  await getAndRenderHistory();
};

/*

Initial Render

*/

const getAndRenderHistory = async () => {
  const searchHistory = await fetchSearchHistory();
  await renderSearchHistory(searchHistory);
};

searchForm?.addEventListener('submit', handleSearchFormSubmit);
searchHistoryContainer?.addEventListener('click', handleSearchHistoryClick);

getAndRenderHistory();

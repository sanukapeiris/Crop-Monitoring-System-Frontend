document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu functionality
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !hamburger.contains(e.target) && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // Update current date
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const now = new Date();
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    document.querySelector('.date-info h2').textContent = dayName;
    document.querySelector('.date-info p').textContent = `${day} ${month}, ${year}`;

    // Forecast data
    const forecastData = [
        { day: 'Today', temp: '28°C', icon: 'weather-sunny' },
        { day: 'Mon', temp: '31°C', icon: 'weather-sunny' },
        { day: 'Tue', temp: '24°C', icon: 'weather-rainy' },
        { day: 'Wed', temp: '27°C', icon: 'weather-cloudy' },
        { day: 'Thu', temp: '31°C', icon: 'weather-sunny' }
    ];

    const forecastContainer = document.getElementById('forecast-container');

    forecastData.forEach(data => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <h3>${data.day}</h3>
            <img src="https://api.iconify.design/mdi:${data.icon}.svg" alt="Weather">
            <p>${data.temp}</p>
        `;
        forecastContainer.appendChild(forecastItem);
    });

    // Add interactivity to navigation items
    document.querySelectorAll('.nav-items li').forEach(item => {
        item.addEventListener('click', () => {
            const currentActive = document.querySelector('.nav-items li.active');
            if (currentActive) {
                currentActive.classList.remove('active');
            }

            item.classList.add('active');
            $('#settings_nav').removeClass('active');

            if (window.innerWidth <= 1024) {
                const sidebar = document.querySelector('.sidebar');
                const hamburger = document.querySelector('.hamburger');

                if (sidebar) sidebar.classList.remove('active');
                if (hamburger) hamburger.classList.remove('active');
            }
        });
    });



    $('#settings_nav').on('click', () => {
        document.querySelector('.nav-items li.active').classList.remove('active');

        $('#settings_nav').addClass('active');

        if (window.innerWidth <= 1024) {
            document.querySelector('.sidebar').classList.remove('active');
            document.querySelector('.hamburger').classList.remove('active');
        }
    });


    // Add interactivity to export button
    document.querySelector('.export-btn').addEventListener('click', () => {
        alert('Exporting weather data...');
    });

    // Add search functionality
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            alert(`Searching for: ${searchInput.value}`);
            searchInput.value = '';
        }
    });
});
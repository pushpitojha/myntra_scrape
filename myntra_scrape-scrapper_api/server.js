const axios = require('axios');
const checkUsersPriceAtMyntra= require('./index.js')
// Function to fetch data from the API
const fetchData = async () => {
    try {
        const response = await axios.get('http://localhost:8080/api/get_myntra_details/all');
        const data = response.data;
        console.log('Fetched Data:', data);
        checkUsersPriceAtMyntra(data);
        // You can process the data or store it in a list as needed
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

// Periodically fetch data every 5 minutes (300000 milliseconds)
setInterval(async () => {
    const data = await fetchData();
    // Store the fetched data or process it as needed
}, 300000);

// Initial call to fetch data immediately when the script starts
fetchData();

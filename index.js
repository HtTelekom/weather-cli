#!/usr/bin/env node
import dotenv from 'dotenv';
import axios from 'axios';
import chalk from 'chalk';
import inquirer from 'inquirer';

dotenv.config();


const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/*** Sıcaklığı Kelvin'den Celsius'a çevirme ***/
const kelvinToCelsius = (kelvin) => {
    return Math.round(kelvin - 273.15);
};

/*** Hava durumu ikonları ***/
const getWeatherIcon = (weatherId) => {
    if (weatherId >= 200 && weatherId < 300) return '⚡️';  // Fırtına
    if (weatherId >= 300 && weatherId < 400) return '🌧️';  // Çisenti
    if (weatherId >= 500 && weatherId < 600) return '🌧️';  // Yağmur
    if (weatherId >= 600 && weatherId < 700) return '❄️';  // Kar
    if (weatherId >= 700 && weatherId < 800) return '🌫️';  // Sis
    if (weatherId === 800) return '☀️';  // Açık
    if (weatherId > 800) return '☁️';  // Bulutlu
    return '❓';
};

/*** Hava durumu verisini görselleştirme ***/
const displayWeather = (data) => {
    const temp = kelvinToCelsius(data.main.temp);
    const feelsLike = kelvinToCelsius(data.main.feels_like);
    const description = data.weather[0].description;
    const icon = getWeatherIcon(data.weather[0].id);
    const city = data.name;
    const country = data.sys.country;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;

    console.log(chalk.bold.blue('\n📍 KONUM: ') + chalk.white(`${city}, ${country}`));
    console.log(chalk.bold.yellow(`\n${icon}  HAVA DURUMU: `) + chalk.white(description));
    console.log(chalk.bold.red('\n🌡️  SICAKLIK: ') + chalk.white(`${temp}°C (Hissedilen: ${feelsLike}°C)`));
    console.log(chalk.bold.cyan('\n💧 NEM: ') + chalk.white(`${humidity}%`));
    console.log(chalk.bold.green('\n💨 RÜZGAR: ') + chalk.white(`${windSpeed} m/s`));
    console.log('\n');
};

/*** Hava durumu verisini getirme ***/
const getWeather = async (city) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                q: city,
                appid: API_KEY,
            },
        });

        displayWeather(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log(chalk.red.bold('\n❌ Şehir bulunamadı! Lütfen geçerli bir şehir adı girin.\n'));
        } else {
            console.log(chalk.red.bold('\n❌ Bir hata oluştu: ') + error.message);
        }
    }
};

/*** Ana fonksiyon ***/
const main = async () => {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'city',
            message: 'Hangi şehrin hava durumunu öğrenmek istiyorsunuz?',
            default: 'Istanbul',
        },
    ]);

    await getWeather(answers.city);

    const nextAction = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Ne yapmak istersiniz?',
            choices: ['Başka bir şehir sorgula', 'Çıkış yap'],
        },
    ]);

    if (nextAction.action === 'Başka bir şehir sorgula') {
        main();
    } else {
        console.log(chalk.blue.bold('\nTeşekkürler! Güzel bir gün geçirin! 👋\n'));
    }
};

/*** Uygulamayı başlat ***/
console.log(chalk.yellow.bold('\n===== HAVA DURUMU CLI UYGULAMASI =====\n'));
main();
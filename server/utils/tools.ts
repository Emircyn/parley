import { tool } from 'ai'
import { z } from 'zod'

interface GeocodingResponse {
  results?: { name: string, country?: string, admin1?: string, latitude: number, longitude: number }[]
}

interface ForecastResponse {
  current: {
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    wind_speed_10m: number
    weather_code: number
    is_day: number
  }
  current_units: { temperature_2m: string, wind_speed_10m: string }
  daily: { time: string[], weather_code: number[], temperature_2m_max: number[], temperature_2m_min: number[] }
}

const round = (value: number) => Math.round(value * 10) / 10

async function getWeather(city: string): Promise<WeatherResult | ToolErrorResult> {
  try {
    return await fetchWeather(city)
  } catch (error) {
    console.error('[weather]', error)
    return { error: 'The weather service is not responding right now. Try again in a minute.' }
  }
}

async function fetchWeather(city: string): Promise<WeatherResult | ToolErrorResult> {
  // Open-Meteo: free, no API key.
  const geo = await $fetch<GeocodingResponse>('https://geocoding-api.open-meteo.com/v1/search', {
    query: { name: city, count: 1, language: 'en', format: 'json' },
    timeout: 8000
  })
  const place = geo.results?.[0]
  if (!place) return { error: `I couldn't find a place called "${city}".` }

  const forecast = await $fetch<ForecastResponse>('https://api.open-meteo.com/v1/forecast', {
    query: {
      latitude: place.latitude,
      longitude: place.longitude,
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      timezone: 'auto',
      forecast_days: 4
    },
    timeout: 8000
  })

  return {
    location: place.admin1 && place.admin1 !== place.name ? `${place.name}, ${place.admin1}` : place.name,
    country: place.country,
    current: {
      temperature: round(forecast.current.temperature_2m),
      feelsLike: round(forecast.current.apparent_temperature),
      humidity: forecast.current.relative_humidity_2m,
      windSpeed: round(forecast.current.wind_speed_10m),
      code: forecast.current.weather_code,
      condition: describeWeather(forecast.current.weather_code, forecast.current.is_day === 1).label,
      isDay: forecast.current.is_day === 1
    },
    days: forecast.daily.time.map((date, i) => ({
      date,
      code: forecast.daily.weather_code[i]!,
      condition: describeWeather(forecast.daily.weather_code[i]!).label,
      max: round(forecast.daily.temperature_2m_max[i]!),
      min: round(forecast.daily.temperature_2m_min[i]!)
    })),
    units: { temperature: forecast.current_units.temperature_2m, windSpeed: forecast.current_units.wind_speed_10m }
  }
}

function calculate(expression: string): CalculationResult | ToolErrorResult {
  try {
    const result = evaluateExpression(expression)
    return {
      expression,
      result,
      formatted: new Intl.NumberFormat('en-US', { maximumFractionDigits: 10 }).format(result)
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Invalid expression' }
  }
}

function getTime(timeZone: string, label?: string): TimeResult | ToolErrorResult {
  const now = new Date()
  try {
    const part = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', { timeZone, ...options }).format(now)
    const offset = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
      .formatToParts(now)
      .find(p => p.type === 'timeZoneName')?.value ?? ''

    return {
      timeZone,
      label: label || timeZone.split('/').pop()!.replace(/_/g, ' '),
      iso: now.toISOString(),
      time: part({ hour: '2-digit', minute: '2-digit', hour12: false }),
      date: part({ weekday: 'long', month: 'long', day: 'numeric' }),
      offset
    }
  } catch {
    return { error: `"${timeZone}" is not a valid IANA time zone.` }
  }
}

export const chatTools = {
  getWeather: tool({
    description: 'Get the current weather and a 4-day forecast for a city. Use it whenever the user asks about weather, temperature or whether to bring an umbrella.',
    inputSchema: z.object({
      city: z.string().min(1).max(100).describe('City name, optionally with country, e.g. "Istanbul" or "Paris, France"')
    }),
    execute: ({ city }) => getWeather(city)
  }),
  calculate: tool({
    description: 'Evaluate a math expression exactly. Use it for any arithmetic instead of computing in your head. Supports + - * / % ^, "18% of 2450", thousands separators, words like plus/minus/times, parentheses, pi, e, sqrt, cbrt, abs, round, floor, ceil, sin, cos, tan, asin, acos, atan, ln, log (base 10), exp.',
    inputSchema: z.object({
      expression: z.string().min(1).max(200).describe('The expression, e.g. "(1250 * 0.18) + 42" or "sqrt(2) ^ 10"')
    }),
    execute: ({ expression }) => calculate(expression)
  }),
  getTime: tool({
    description: 'Get the current local time and date in a time zone. Use it when the user asks what time it is somewhere.',
    inputSchema: z.object({
      timeZone: z.string().min(1).max(64).describe('IANA time zone, e.g. "Europe/Istanbul", "America/New_York", "Asia/Tokyo"'),
      label: z.string().max(64).optional().describe('Human friendly place name to show, e.g. "Tokyo"')
    }),
    execute: ({ timeZone, label }) => getTime(timeZone, label)
  })
}

export type ChatTools = typeof chatTools

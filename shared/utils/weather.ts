/** WMO weather interpretation codes (Open-Meteo), shared so the tool output and the card use the same words. */
export function describeWeather(code: number, isDay = true): { label: string, icon: string } {
  if (code === 0) return { label: 'Clear sky', icon: isDay ? 'i-lucide-sun' : 'i-lucide-moon' }
  if (code <= 2) return { label: code === 1 ? 'Mostly clear' : 'Partly cloudy', icon: isDay ? 'i-lucide-cloud-sun' : 'i-lucide-cloud-moon' }
  if (code === 3) return { label: 'Overcast', icon: 'i-lucide-cloud' }
  if (code <= 48) return { label: 'Fog', icon: 'i-lucide-cloud-fog' }
  if (code <= 57) return { label: 'Drizzle', icon: 'i-lucide-cloud-drizzle' }
  if (code <= 67) return { label: 'Rain', icon: 'i-lucide-cloud-rain' }
  if (code <= 77) return { label: 'Snow', icon: 'i-lucide-cloud-snow' }
  if (code <= 82) return { label: 'Rain showers', icon: 'i-lucide-cloud-rain-wind' }
  if (code <= 86) return { label: 'Snow showers', icon: 'i-lucide-cloud-snow' }
  return { label: 'Thunderstorm', icon: 'i-lucide-cloud-lightning' }
}

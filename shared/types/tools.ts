export interface WeatherDay {
  date: string
  code: number
  max: number
  min: number
}

export interface WeatherResult {
  location: string
  country?: string
  current: {
    temperature: number
    feelsLike: number
    humidity: number
    windSpeed: number
    code: number
    isDay: boolean
  }
  days: WeatherDay[]
  units: { temperature: string, windSpeed: string }
}

export interface CalculationResult {
  expression: string
  result: number
  formatted: string
}

export interface TimeResult {
  timeZone: string
  label: string
  iso: string
  time: string
  date: string
  offset: string
}

export type ToolErrorResult = { error: string }

/** Error codes the chat endpoint sends back so the UI can pick friendly copy. */
export type ChatErrorCode = 'quota' | 'rate_limit' | 'bad_request' | 'verification_required' | 'verification_failed' | 'unknown'

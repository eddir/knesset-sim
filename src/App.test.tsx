// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  window.scrollTo = () => {}
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduce'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
    onchange: null,
  })) as unknown as typeof window.matchMedia
})

describe('симулятор', () => {
  it('проходит путь от опроса до Кнессета', async () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Соберите Кнессет своими ответами' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Сразу к вопросам' }))
    for (let step = 0; step < 18; step += 1) {
      const choice = await screen.findByRole('radio', { name: /Середина/ })
      await act(async () => {
        fireEvent.click(choice)
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
    }
    expect(await screen.findByText('Ваш 26-й Кнессет')).toBeTruthy()
    expect(screen.getByText(/Ближе всего к ответам/)).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Кто собирает 61' })).toBeTruthy()
  })
})

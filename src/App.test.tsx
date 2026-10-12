// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { questionText } from './i18n'
import { defaultWeights } from './model'
import { questionsInOrder, themeOrder } from './quiz'

function press(key: string) {
  fireEvent.keyDown(document.body, { key })
}

function answerMiddle() {
  press('3')
  fireEvent.click(screen.getByRole('button', { name: 'Дальше' }))
}

function finishQuiz() {
  for (let guard = 0; guard < 80; guard += 1) {
    if (screen.queryByText('Ваш 26-й Кнессет')) return
    const show = screen.queryByRole('button', { name: 'Показать мой Кнессет' })
    if (show) {
      fireEvent.click(show)
      continue
    }
    const sectionNext = screen.queryByRole('button', { name: /^Дальше:/ })
    if (sectionNext) {
      fireEvent.click(sectionNext)
      continue
    }
    answerMiddle()
  }
  throw new Error('тест не дошёл до отчёта')
}

beforeEach(() => {
  cleanup()
  localStorage.clear()
  document.documentElement.lang = 'ru'
  document.documentElement.dir = 'ltr'
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
    finishQuiz()
    expect(screen.getByText('Ваш 26-й Кнессет')).toBeTruthy()
    expect(screen.getByText(/Ближе всего к ответам/)).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Кто собирает 61' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Итоги выборов' })).toBeTruthy()
    expect(screen.getAllByText('Мест получено').length).toBeGreaterThan(0)
    expect(screen.getByText('Конституционное большинство: 80')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Что этот Кнессет провёл бы' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Где вы по каждому разделу' })).toBeTruthy()
    expect(screen.getByText(/Совпадение \d/)).toBeTruthy()
    expect(screen.queryByText(/% \./)).toBeNull()
  })

  it('после раздела показывает промежуточный зал', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Сразу к вопросам' }))
    expect(screen.getByText('Вопрос 1 из 8')).toBeTruthy()
    expect(screen.getByText('17 мест на кону')).toBeTruthy()
    for (let step = 0; step < 8; step += 1) answerMiddle()
    expect(screen.getByText('Раздел 1 из 7')).toBeTruthy()
    expect(screen.getByRole('heading', { name: /раздаёт 17 мест/ })).toBeTruthy()
    expect(screen.getByText(/Впереди ещё/)).toBeTruthy()
    expect(screen.getByRole('button', { name: /^Дальше:/ })).toBeTruthy()
  })

  it('Назад возвращает к предыдущему вопросу и не срабатывает до ответа', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Сразу к вопросам' }))
    press('3')
    expect(screen.getByText('Вопрос 1 из 8')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Дальше' }))
    expect(screen.getByText('Вопрос 2 из 8')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Назад' }))
    expect(screen.getByText('Вопрос 1 из 8')).toBeTruthy()
  })

  it('Escape в окне метода не пропускает вопрос', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Сразу к вопросам' }))
    fireEvent.click(screen.getByRole('button', { name: 'Как считается' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
      await new Promise((resolve) => setTimeout(resolve, 40))
    })
    expect(screen.getByText('Вопрос 1 из 8')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Ваш 26-й Кнессет' })).toBeNull()
  })

  it('битое сохранение не ломает вопросы', () => {
    localStorage.setItem('knesset-2026-v1', JSON.stringify({
      phase: 'questions',
      index: 99,
      answers: { gaza: 99, hostages: 'нет' },
      weights: { security: 9, land: 0 },
    }))
    render(<App />)
    const weights = defaultWeights()
    weights.land = 0
    const list = questionsInOrder(themeOrder(weights))
    const last = list[list.length - 1]
    const section = list.filter((question) => question.theme === last.theme)
    expect(screen.getByText(`Вопрос ${section.length} из ${section.length}`)).toBeTruthy()
    expect(screen.getByRole('heading', { name: questionText('ru', last.id).title })).toBeTruthy()
    expect(document.body.textContent).not.toContain('NaN')
  })

  it('подпись «Скопировано» гаснет', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Сразу к вопросам' }))
    finishQuiz()
    fireEvent.click(screen.getByRole('button', { name: 'Скопировать расклад' }))
    expect(await screen.findByRole('button', { name: 'Скопировано' })).toBeTruthy()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2400))
    })
    expect(screen.getByRole('button', { name: 'Скопировать расклад' })).toBeTruthy()
  })

  it('переключается на английский и иврит', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByRole('heading', { name: 'Build the Knesset with your answers' })).toBeTruthy()
    expect(document.documentElement.lang).toBe('en')
    expect(document.documentElement.dir).toBe('ltr')
    fireEvent.click(screen.getByRole('button', { name: 'עב' }))
    expect(screen.getByRole('heading', { name: 'בנו את הכנסת מהתשובות שלכם' })).toBeTruthy()
    expect(document.documentElement.lang).toBe('he')
    expect(document.documentElement.dir).toBe('rtl')
    fireEvent.click(screen.getByRole('button', { name: 'RU' }))
    expect(screen.getByRole('heading', { name: 'Соберите Кнессет своими ответами' })).toBeTruthy()
  })
})

import { configureStore } from '@reduxjs/toolkit'
import i18next from "i18next"
import initSubscriber from 'redux-subscriber'
import { optionsReducer, statusReducer, changeLanguage } from '@pacta/components'

export const store = configureStore({
  reducer: {
    options: optionsReducer,
    status: statusReducer
  },
})

export const subscribe = initSubscriber(store)
subscribe('options.language', state => i18next.changeLanguage(state.options.language))
subscribe('options', state => localStorage.options = JSON.stringify(state.options))

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from "./App.jsx"
import reducer from './reducer.js'
import { compose, createStore } from 'redux'
import persistState from 'redux-localstorage'
import { Provider } from 'react-redux'
import { parse } from 'json5'

export function createGUI(snapshot) {
  const parameters = parse(snapshot)
  // get list of unique instrument paths
  const instruments = []
  for (let p of Object.keys(parameters)) {

    p = p.split('/')
    p.pop()
    p = p.join('/')
    if (!instruments.includes(p)) {
      instruments.push(p)
    }
  }

  const state = { parameters, instruments }

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  const enhancer = composeEnhancers(persistState(['plotting']))
  const store = createStore(reducer, state, enhancer)
  const root = createRoot(document.getElementById("root"))
  root.render(<Provider store={store}><App dispatch={store.dispatch}/></Provider>)
}

import React from 'react';
import ReactDOM from 'react-dom';
import App from "./App.jsx"
import reducer from './reducer.js'
import { compose, createStore } from 'redux'
import persistState from 'redux-localstorage'
import { Provider } from 'react-redux'
import {flatten, unflatten} from 'flat';
import {parse} from 'json5';

function prepareValidationState(state, keys) {
  keys.forEach(key => {
    state['ui'][key] = {}
    for (var path in state['parameters']) {
      state['ui'][key][path] = {'display': '', 'buffer': '', 'error': false, 'errorText': ' '}
    }
  })
  return state
}

function semiflatten(obj) {
  // converts an object to a flattened form with a single layer of nesting
  let flattened = flatten(obj, {delimiter: '/', safe: true})
  let semiflattened = {}
  for (var addr in flattened) {
    addr = addr.replace('value/', 'value.')
    let newAddr = addr.replace(/\/([^\/]*)$/,'\.$1')  // replace last occurrence of '/' with '.'
    semiflattened[newAddr] = flattened[addr]
  }
  semiflattened = unflatten(semiflattened, {delimiter: '.'})  // unflatten one level with the new delimiter
  return semiflattened
}

export function createGUI(snapshot) {
  snapshot = parse(snapshot)
  var state = {parameters: semiflatten(snapshot)}

  // get list of unique instrument paths
  let instruments = []
  for (let p of Object.keys(state.parameters)) {

    p = p.split('/')
    p.pop()
    p = p.join('/')
    if (!instruments.includes(p)) {
      instruments.push(p)
    }
  }
  state['instruments'] = instruments

  // const enhancer = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  const enhancer = composeEnhancers(persistState(['plotting']))
  const store = createStore(reducer, state, enhancer)
  ReactDOM.render(<Provider store={store}><App dispatch={store.dispatch} snapshot={snapshot}/></Provider>, document.getElementById("root"))
}

import React from 'react';
import ReactDOM from 'react-dom';
import App from "./App.jsx"
import reducer from './reducer.js'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import {flatten, unflatten} from 'flat';

function prepareValidationState(state, keys) {
  keys.forEach(key => {
    state['ui'][key] = {}
    for (var path in state['parameters']) {
      state['ui'][key][path] = {'display': '', 'buffer': '', 'error': false, 'errorText': ' '}
    }
  })
  return state
}

function prepareUIState(state) {
  state['alert'] = {'open': false, 'severity': 'error', 'text': ''}

  return state
}

function semiflatten(obj) {
  // converts an object to a flattened form with a single layer of nesting
  let flattened = flatten(obj, {delimiter: '/', safe: true})
  let semiflattened = {}
  for (var addr in flattened) {
    let newAddr = addr.replace(/\/([^\/]*)$/,'\.$1')  // replace last occurrence of '/' with '.'
    semiflattened[newAddr] = flattened[addr]
  }
  semiflattened = unflatten(semiflattened, {delimiter: '.'})  // unflatten one level with the new delimiter
  return semiflattened
}

export function createGUI(snapshot) {
  var state = {parameters: semiflatten(snapshot)}

  // get list of unique instrument paths
  console.log(semiflatten(snapshot))
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

  console.log('Preparing UI state')
  state = prepareUIState(state)
  const store = createStore(reducer, state)
  ReactDOM.render(<Provider store={store}><App dispatch={store.dispatch} snapshot={snapshot}/></Provider>, document.getElementById("root"))
}

import { combineReducers } from 'redux'
import produce from 'immer'

function instruments(state={}, action) {
  switch(action.type) {
    default : return state;
    }
}

function parameters(state={}, action) {
  switch(action.type) {
    default : return state;

    case 'parameters/update':
      return produce(state, draft => {
        draft[action.path]['value'] = action.value
      })

    case 'parameters/setUnit':
      return produce(state, draft => {
        draft[action.path]['unit'] = action.value
      })
    }
}


const reducer = combineReducers({ instruments, parameters })

export default reducer

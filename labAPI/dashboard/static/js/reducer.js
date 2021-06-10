import { combineReducers } from 'redux'
import {setIn} from 'immutable'
import produce from 'immer'
import arrayMove from 'array-move';

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

const reducer = combineReducers({instruments, parameters})

export default reducer
